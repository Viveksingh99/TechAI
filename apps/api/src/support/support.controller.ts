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
import { TicketStatus } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { SupportService } from './support.service';

@Controller('support/tickets')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  create(@Body() dto: CreateTicketDto, @CurrentUser('id') userId: string) {
    return this.supportService.createTicket(dto, userId);
  }

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status?: TicketStatus,
    @Query('raisedById') raisedById?: string,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.supportService.findAll(pagination, {
      status,
      raisedById,
      assignedToId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.supportService.update(id, dto);
  }

  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignTicketDto) {
    return this.supportService.assign(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.supportService.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supportService.remove(id);
  }

  @Post(':id/messages')
  addMessage(
    @Param('id') id: string,
    @Body() dto: CreateTicketMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.supportService.addMessage(id, dto, userId);
  }

  @Get(':id/messages')
  listMessages(@Param('id') id: string) {
    return this.supportService.listMessages(id);
  }
}
