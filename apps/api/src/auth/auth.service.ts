import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuthProvider, Prisma, RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { AppConfig } from '../config/configuration';
import { parseDurationToMs } from '../common/utils/duration.util';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  AuthResponse,
  AuthTokens,
  SafeUser,
} from './interfaces/auth-response.interface';

type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;

export interface OAuthProfileInput {
  providerAccountId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async register(
    dto: RegisterDto,
    meta: { ip?: string; userAgent?: string } = {},
  ): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const clientRole = await this.prisma.role.findUnique({
      where: { name: RoleName.CLIENT },
    });

    if (!clientRole) {
      throw new BadRequestException(
        'The CLIENT role has not been seeded yet. Please run the database seed script.',
      );
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roleId: clientRole.id,
      },
      include: { role: true },
    });

    await this.writeAuditLog(user.id, 'REGISTER', 'User registered', meta);

    return this.issueAuthResponse(user, meta);
  }

  async validateUser(email: string, password: string): Promise<UserWithRole> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.deletedAt || !user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(
    dto: LoginDto,
    meta: { ip?: string; userAgent?: string } = {},
  ): Promise<AuthResponse> {
    const user = await this.validateUser(dto.email, dto.password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.writeAuditLog(user.id, 'LOGIN', 'User logged in', meta);

    return this.issueAuthResponse(user, meta);
  }

  async refresh(
    refreshToken: string,
    meta: { ip?: string; userAgent?: string } = {},
  ): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get('jwt.refreshSecret', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token is invalid or has expired',
      );
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { role: true } } },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException(
        'Refresh token is invalid or has expired',
      );
    }

    if (storedToken.user.deletedAt || !storedToken.user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokenPair(storedToken.user, meta);
  }

  async logout(
    userId: string,
    refreshToken?: string,
  ): Promise<{ message: string }> {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, token: refreshToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    await this.writeAuditLog(userId, 'LOGOUT', 'User logged out');

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const genericMessage = {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.deletedAt) {
      return genericMessage;
    }

    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(rawToken);
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: hashedToken, passwordResetExpires: expires },
    });

    // In production this would enqueue a transactional email (Resend/Nodemailer).
    // We log the reset link so the flow is fully testable without SMTP credentials.
    const resetUrl = `${this.config.get('frontendUrl', { infer: true })}/reset-password?token=${rawToken}`;
    this.logger.log(`Password reset link for ${user.email}: ${resetUrl}`);

    return genericMessage;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const hashedToken = this.hashToken(dto.token);

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Password reset token is invalid or has expired',
      );
    }

    const hashedPassword = await this.hashPassword(dto.password);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.writeAuditLog(
      user.id,
      'PASSWORD_RESET',
      'Password reset via forgot-password flow',
    );

    return {
      message: 'Password has been reset successfully. Please log in again.',
    };
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toSafeUser(user);
  }

  /**
   * Finds or creates a user from an OAuth profile (Google/GitHub) and links
   * the provider account, then issues our own JWT pair. Intended to be
   * called from provider-specific Passport strategies once wired up.
   */
  async validateOAuthLogin(
    provider: OAuthProvider,
    profile: OAuthProfileInput,
  ): Promise<AuthResponse> {
    const existingOAuthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: { user: { include: { role: true } } },
    });

    if (existingOAuthAccount) {
      await this.prisma.oAuthAccount.update({
        where: { id: existingOAuthAccount.id },
        data: {
          accessToken: profile.accessToken,
          refreshToken: profile.refreshToken,
        },
      });

      return this.issueAuthResponse(existingOAuthAccount.user);
    }

    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
      include: { role: true },
    });

    if (!user) {
      const clientRole = await this.prisma.role.findUnique({
        where: { name: RoleName.CLIENT },
      });

      if (!clientRole) {
        throw new BadRequestException(
          'The CLIENT role has not been seeded yet',
        );
      }

      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatar: profile.avatar,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          roleId: clientRole.id,
        },
        include: { role: true },
      });
    }

    await this.prisma.oAuthAccount.create({
      data: {
        provider,
        providerAccountId: profile.providerAccountId,
        userId: user.id,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
      },
    });

    return this.issueAuthResponse(user);
  }

  // ---------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------

  private async issueAuthResponse(
    user: UserWithRole,
    meta: { ip?: string; userAgent?: string } = {},
  ): Promise<AuthResponse> {
    const tokens = await this.generateTokenPair(user, meta);

    return {
      ...tokens,
      user: this.toSafeUser(user),
    };
  }

  private async generateTokenPair(
    user: UserWithRole,
    meta: { ip?: string; userAgent?: string } = {},
  ): Promise<AuthTokens> {
    const accessSecret = this.config.get('jwt.accessSecret', { infer: true });
    const accessExpiresIn = this.config.get('jwt.accessExpiresIn', {
      infer: true,
    });
    const refreshSecret = this.config.get('jwt.refreshSecret', { infer: true });
    const refreshExpiresIn = this.config.get('jwt.refreshExpiresIn', {
      infer: true,
    });

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role.name },
      { secret: accessSecret, expiresIn: accessExpiresIn as never },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      { secret: refreshSecret, expiresIn: refreshExpiresIn as never },
    );

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + parseDurationToMs(refreshExpiresIn)),
        createdByIp: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    return { accessToken, refreshToken };
  }

  private toSafeUser(user: UserWithRole): SafeUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role.name,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }

  private hashPassword(password: string): Promise<string> {
    const saltRounds = this.config.get('bcryptSaltRounds', { infer: true });
    return bcrypt.hash(password, saltRounds);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async writeAuditLog(
    userId: string,
    action:
      | 'CREATE'
      | 'UPDATE'
      | 'DELETE'
      | 'LOGIN'
      | 'LOGOUT'
      | 'REGISTER'
      | 'PASSWORD_RESET'
      | 'OTHER',
    description: string,
    meta: { ip?: string; userAgent?: string } = {},
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entity: 'User',
          entityId: userId,
          description,
          ipAddress: meta.ip,
          userAgent: meta.userAgent,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to write audit log: ${(error as Error).message}`,
      );
    }
  }
}
