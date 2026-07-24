import {
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
import { AdminService } from './admin.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

const ADMIN_ROLES = [RoleName.SUPER_ADMIN, RoleName.ADMIN];

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMIN_ROLES)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  dashboardStats() {
    return this.adminService.dashboardStats();
  }

  @Get('users-overview')
  usersOverview() {
    return this.adminService.usersOverview();
  }

  @Get('audit-logs')
  listAuditLogs(
    @Query() pagination: PaginationDto,
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
  ) {
    return this.adminService.listAuditLogs(pagination, { userId, entity });
  }

  @Get('settings')
  listSystemSettings() {
    return this.adminService.listSystemSettings();
  }

  @Get('settings/:key')
  getSystemSetting(@Param('key') key: string) {
    return this.adminService.getSystemSetting(key);
  }

  @Patch('settings/:key')
  @Roles(RoleName.SUPER_ADMIN)
  upsertSystemSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSystemSettingDto,
  ) {
    return this.adminService.upsertSystemSetting(key, dto);
  }

  @Post('api-keys')
  @Roles(RoleName.SUPER_ADMIN)
  createApiKey(
    @Body() dto: CreateApiKeyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.adminService.createApiKey(dto, userId);
  }

  @Get('api-keys')
  listApiKeys() {
    return this.adminService.listApiKeys();
  }

  @Patch('api-keys/:id/revoke')
  @Roles(RoleName.SUPER_ADMIN)
  revokeApiKey(@Param('id') id: string) {
    return this.adminService.revokeApiKey(id);
  }

  @Delete('api-keys/:id')
  @Roles(RoleName.SUPER_ADMIN)
  removeApiKey(@Param('id') id: string) {
    return this.adminService.removeApiKey(id);
  }
}
