import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppConfig } from '../config/configuration';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import {
  buildSearchFilter,
  createPaginatedResult,
} from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  role: RoleName;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<PublicUser>> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...buildSearchFilter(pagination.search, [
        'email',
        'firstName',
        'lastName',
      ]),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: { role: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: this.resolveOrderBy(pagination),
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResult(
      users.map((user) => this.toPublicUser(user)),
      total,
      pagination,
    );
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const role = await this.prisma.role.findUnique({
      where: { name: dto.role },
    });

    if (!role) {
      throw new BadRequestException(
        `Role "${dto.role}" has not been seeded yet`,
      );
    }

    const saltRounds = this.config.get('bcryptSaltRounds', { infer: true });
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roleId: role.id,
        isActive: dto.isActive ?? true,
      },
      include: { role: true },
    });

    return this.toPublicUser(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    await this.ensureExists(id);

    let roleId: string | undefined;

    if (dto.role) {
      const role = await this.prisma.role.findUnique({
        where: { name: dto.role },
      });

      if (!role) {
        throw new BadRequestException(
          `Role "${dto.role}" has not been seeded yet`,
        );
      }

      roleId = role.id;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        avatar: dto.avatar,
        isActive: dto.isActive,
        ...(roleId ? { roleId } : {}),
      },
      include: { role: true },
    });

    return this.toPublicUser(user);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.ensureExists(id);

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'User deleted successfully' };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        avatar: dto.avatar,
      },
      include: { role: true },
    });

    return this.toPublicUser(user);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const saltRounds = this.config.get('bcryptSaltRounds', { infer: true });
    const hashedPassword = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password changed successfully. Please log in again.' };
  }

  private async ensureExists(id: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private resolveOrderBy(
    pagination: PaginationDto,
  ): Prisma.UserOrderByWithRelationInput {
    if (pagination.sortBy === 'role') {
      return { role: { name: pagination.sortOrder } };
    }

    return { [pagination.sortBy]: pagination.sortOrder };
  }

  private toPublicUser(user: UserWithRole): PublicUser {
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
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
