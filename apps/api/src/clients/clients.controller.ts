import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ClientsService } from './clients.service';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.CLIENT)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('dashboard')
  dashboard(@CurrentUser('id') clientId: string) {
    return this.clientsService.dashboard(clientId);
  }
}
