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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AddAttendeeDto } from './dto/add-attendee.dto';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { RespondInviteDto } from './dto/respond-invite.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UpsertMeetingNotesDto } from './dto/upsert-meeting-notes.dto';
import { MeetingsService } from './meetings.service';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Body() dto: CreateMeetingDto, @CurrentUser('id') userId: string) {
    return this.meetingsService.create(dto, userId);
  }

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('projectId') projectId?: string,
    @Query('organizerId') organizerId?: string,
    @Query('mine') mine?: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.meetingsService.findAll(pagination, {
      projectId,
      organizerId,
      userId: mine === 'true' ? currentUserId : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMeetingDto) {
    return this.meetingsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meetingsService.remove(id);
  }

  @Post(':id/attendees')
  addAttendee(@Param('id') id: string, @Body() dto: AddAttendeeDto) {
    return this.meetingsService.addAttendee(id, dto);
  }

  @Patch(':id/attendees/respond')
  respondToInvite(
    @Param('id') id: string,
    @Body() dto: RespondInviteDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.meetingsService.respondToInvite(id, userId, dto);
  }

  @Delete(':id/attendees/:userId')
  removeAttendee(@Param('id') id: string, @Param('userId') userId: string) {
    return this.meetingsService.removeAttendee(id, userId);
  }

  @Post(':id/notes')
  upsertNotes(@Param('id') id: string, @Body() dto: UpsertMeetingNotesDto) {
    return this.meetingsService.upsertNotes(id, dto);
  }

  @Get(':id/notes')
  getNotes(@Param('id') id: string) {
    return this.meetingsService.getNotes(id);
  }
}
