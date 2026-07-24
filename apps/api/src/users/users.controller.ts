import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile/me')
  updateOwnProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('profile/change-password')
  changeOwnPassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.HR)
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.HR)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    if (currentUser.id === id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    return this.usersService.remove(id);
  }
}
