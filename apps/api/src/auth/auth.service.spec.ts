import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type MockPrismaService = {
  user: Record<string, jest.Mock>;
  role: Record<string, jest.Mock>;
  refreshToken: Record<string, jest.Mock>;
  auditLog: Record<string, jest.Mock>;
  oAuthAccount: Record<string, jest.Mock>;
  $transaction: jest.Mock;
};

const CLIENT_ROLE = {
  id: 'role-client-id',
  name: RoleName.CLIENT,
  description: null,
};

function buildUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user-1',
    email: 'jane.doe@example.com',
    password: overrides.password ?? null,
    firstName: 'Jane',
    lastName: 'Doe',
    phone: null,
    avatar: null,
    roleId: CLIENT_ROLE.id,
    role: CLIENT_ROLE,
    isActive: true,
    isEmailVerified: false,
    emailVerifiedAt: null,
    lastLoginAt: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: MockPrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
      oAuthAccount: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const configValues: Record<string, unknown> = {
      'jwt.accessSecret': 'test-access-secret',
      'jwt.accessExpiresIn': '15m',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.refreshExpiresIn': '7d',
      bcryptSaltRounds: 4,
      frontendUrl: 'http://localhost:3000',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
            verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => configValues[key]),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto: RegisterDto = {
      email: 'jane.doe@example.com',
      password: 'StrongP@ss1',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    it('creates a new user with the CLIENT role and returns tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.role.findUnique.mockResolvedValue(CLIENT_ROLE);
      prisma.user.create.mockResolvedValue(buildUser({ password: 'hashed' }));
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await authService.register(dto);

      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: RoleName.CLIENT },
      });
      expect(prisma.user.create).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result.user.email).toBe(dto.email);
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.refreshToken).toBe('signed.jwt.token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws a ConflictException when the email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser());

      await expect(authService.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto: LoginDto = {
      email: 'jane.doe@example.com',
      password: 'StrongP@ss1',
    };

    it('logs in successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(dto.password, 4);
      const existingUser = buildUser({ password: hashedPassword });

      prisma.user.findUnique.mockResolvedValue(existingUser);
      prisma.user.update.mockResolvedValue(existingUser);
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await authService.login(dto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: { lastLoginAt: expect.any(Date) },
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.email).toBe(dto.email);
    });

    it('rejects an invalid password with UnauthorizedException', async () => {
      const hashedPassword = await bcrypt.hash('SomeOtherPassword1!', 4);
      const existingUser = buildUser({ password: hashedPassword });

      prisma.user.findUnique.mockResolvedValue(existingUser);

      await expect(authService.login(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('rejects when no account exists for the email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a deactivated account', async () => {
      const hashedPassword = await bcrypt.hash(dto.password, 4);
      const inactiveUser = buildUser({
        password: hashedPassword,
        isActive: false,
      });

      prisma.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(authService.login(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
