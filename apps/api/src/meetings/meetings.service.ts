import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult } from '../common/utils/pagination.util';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AddAttendeeDto } from './dto/add-attendee.dto';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { RespondInviteDto } from './dto/respond-invite.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UpsertMeetingNotesDto } from './dto/upsert-meeting-notes.dto';

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
} satisfies Prisma.UserSelect;

const MEETING_INCLUDE = {
  organizer: { select: USER_SELECT },
  project: { select: { id: true, name: true } },
  attendees: { include: { user: { select: USER_SELECT } } },
  notes: true,
} satisfies Prisma.MeetingInclude;

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateMeetingDto, organizerId: string) {
    const meeting = await this.prisma.meeting.create({
      data: {
        title: dto.title,
        description: dto.description,
        organizerId,
        projectId: dto.projectId,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        location: dto.location,
        meetingLink: dto.meetingLink,
        attendees: dto.attendeeIds
          ? { create: dto.attendeeIds.map((userId) => ({ userId })) }
          : undefined,
      },
      include: MEETING_INCLUDE,
    });

    for (const attendee of meeting.attendees) {
      await this.notifications.create({
        userId: attendee.userId,
        title: 'New meeting invite',
        message: `You've been invited to "${meeting.title}"`,
        link: `/meetings/${meeting.id}`,
      });
    }

    return meeting;
  }

  async findAll(
    pagination: PaginationDto,
    filter: { projectId?: string; organizerId?: string; userId?: string },
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.MeetingWhereInput = {
      ...(filter.projectId ? { projectId: filter.projectId } : {}),
      ...(filter.organizerId ? { organizerId: filter.organizerId } : {}),
      ...(filter.userId
        ? { OR: [{ organizerId: filter.userId }, { attendees: { some: { userId: filter.userId } } }] }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.meeting.findMany({
        where,
        include: MEETING_INCLUDE,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.meeting.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async findOne(id: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: { id },
      include: MEETING_INCLUDE,
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return meeting;
  }

  async update(id: string, dto: UpdateMeetingDto) {
    await this.ensureExists(id);

    return this.prisma.meeting.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        location: dto.location,
        meetingLink: dto.meetingLink,
        status: dto.status,
      },
      include: MEETING_INCLUDE,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.ensureExists(id);
    await this.prisma.meeting.delete({ where: { id } });

    return { message: 'Meeting deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Attendees
  // ---------------------------------------------------------------------

  async addAttendee(meetingId: string, dto: AddAttendeeDto) {
    await this.ensureExists(meetingId);

    const attendee = await this.prisma.meetingAttendee.upsert({
      where: { meetingId_userId: { meetingId, userId: dto.userId } },
      create: { meetingId, userId: dto.userId },
      update: {},
      include: { user: { select: USER_SELECT } },
    });

    await this.notifications.create({
      userId: dto.userId,
      title: 'New meeting invite',
      message: "You've been added to a meeting",
      link: `/meetings/${meetingId}`,
    });

    return attendee;
  }

  async respondToInvite(meetingId: string, userId: string, dto: RespondInviteDto) {
    const attendee = await this.prisma.meetingAttendee.findUnique({
      where: { meetingId_userId: { meetingId, userId } },
    });

    if (!attendee) {
      throw new NotFoundException('You are not invited to this meeting');
    }

    return this.prisma.meetingAttendee.update({
      where: { meetingId_userId: { meetingId, userId } },
      data: { response: dto.response },
    });
  }

  async removeAttendee(meetingId: string, userId: string): Promise<{ message: string }> {
    await this.ensureExists(meetingId);

    await this.prisma.meetingAttendee.delete({
      where: { meetingId_userId: { meetingId, userId } },
    });

    return { message: 'Attendee removed successfully' };
  }

  // ---------------------------------------------------------------------
  // Notes
  // ---------------------------------------------------------------------

  async upsertNotes(meetingId: string, dto: UpsertMeetingNotesDto) {
    await this.ensureExists(meetingId);

    return this.prisma.meetingNotes.upsert({
      where: { meetingId },
      create: {
        meetingId,
        content: dto.content,
        actionItems: dto.actionItems as Prisma.InputJsonValue,
      },
      update: { content: dto.content, actionItems: dto.actionItems as Prisma.InputJsonValue },
    });
  }

  async getNotes(meetingId: string) {
    const notes = await this.prisma.meetingNotes.findUnique({ where: { meetingId } });

    if (!notes) {
      throw new NotFoundException('No notes recorded for this meeting yet');
    }

    return notes;
  }

  private async ensureExists(id: string): Promise<void> {
    const meeting = await this.prisma.meeting.findFirst({ where: { id } });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
  }
}
