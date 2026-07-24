import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleName, TaskStatus } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateBugDto } from './dto/create-bug.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateBugDto } from './dto/update-bug.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { ProjectsService } from './projects.service';

const MANAGE_ROLES = [
  RoleName.SUPER_ADMIN,
  RoleName.ADMIN,
  RoleName.PROJECT_MANAGER,
];

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...MANAGE_ROLES)
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.projectsService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...MANAGE_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...MANAGE_ROLES)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  // --- Members -----------------------------------------------------------

  @Post(':id/members')
  @UseGuards(RolesGuard)
  @Roles(...MANAGE_ROLES)
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.projectsService.addMember(id, dto);
  }

  @Get(':id/members')
  listMembers(@Param('id') id: string) {
    return this.projectsService.listMembers(id);
  }

  @Delete(':id/members/:userId')
  @UseGuards(RolesGuard)
  @Roles(...MANAGE_ROLES)
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.projectsService.removeMember(id, userId);
  }

  // --- Milestones ----------------------------------------------------------

  @Post(':id/milestones')
  @UseGuards(RolesGuard)
  @Roles(...MANAGE_ROLES)
  createMilestone(@Param('id') id: string, @Body() dto: CreateMilestoneDto) {
    return this.projectsService.createMilestone(id, dto);
  }

  @Get(':id/milestones')
  listMilestones(@Param('id') id: string) {
    return this.projectsService.listMilestones(id);
  }

  @Patch(':id/milestones/:milestoneId')
  @UseGuards(RolesGuard)
  @Roles(...MANAGE_ROLES)
  updateMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdateMilestoneDto,
  ) {
    return this.projectsService.updateMilestone(id, milestoneId, dto);
  }

  @Delete(':id/milestones/:milestoneId')
  @UseGuards(RolesGuard)
  @Roles(...MANAGE_ROLES)
  removeMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    return this.projectsService.removeMilestone(id, milestoneId);
  }

  // --- Sprints -------------------------------------------------------------

  @Post(':id/sprints')
  @UseGuards(RolesGuard)
  @Roles(...MANAGE_ROLES)
  createSprint(@Param('id') id: string, @Body() dto: CreateSprintDto) {
    return this.projectsService.createSprint(id, dto);
  }

  @Get(':id/sprints')
  listSprints(@Param('id') id: string) {
    return this.projectsService.listSprints(id);
  }

  @Patch(':id/sprints/:sprintId')
  @UseGuards(RolesGuard)
  @Roles(...MANAGE_ROLES)
  updateSprint(
    @Param('id') id: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintDto,
  ) {
    return this.projectsService.updateSprint(id, sprintId, dto);
  }

  @Delete(':id/sprints/:sprintId')
  @UseGuards(RolesGuard)
  @Roles(...MANAGE_ROLES)
  removeSprint(@Param('id') id: string, @Param('sprintId') sprintId: string) {
    return this.projectsService.removeSprint(id, sprintId);
  }

  // --- Tasks (kanban) -------------------------------------------------------

  @Post(':id/tasks')
  createTask(
    @Param('id') id: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.createTask(id, dto, userId);
  }

  @Get(':id/tasks')
  listTasks(@Param('id') id: string, @Query('status') status?: TaskStatus) {
    return this.projectsService.listTasks(id, status);
  }

  @Get(':id/tasks/:taskId')
  findTask(@Param('id') id: string, @Param('taskId') taskId: string) {
    return this.projectsService.findTask(id, taskId);
  }

  @Patch(':id/tasks/:taskId')
  updateTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.updateTask(id, taskId, dto, userId);
  }

  @Patch(':id/tasks/:taskId/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.updateTaskStatus(id, taskId, dto, userId);
  }

  @Delete(':id/tasks/:taskId')
  removeTask(@Param('id') id: string, @Param('taskId') taskId: string) {
    return this.projectsService.removeTask(id, taskId);
  }

  // --- Task comments ---------------------------------------------------------

  @Post(':id/tasks/:taskId/comments')
  addComment(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.addComment(id, taskId, dto, userId);
  }

  @Get(':id/tasks/:taskId/comments')
  listComments(@Param('id') id: string, @Param('taskId') taskId: string) {
    return this.projectsService.listComments(id, taskId);
  }

  @Delete(':id/tasks/:taskId/comments/:commentId')
  removeComment(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.projectsService.removeComment(id, taskId, commentId);
  }

  // --- Bugs ------------------------------------------------------------------

  @Post(':id/bugs')
  createBug(
    @Param('id') id: string,
    @Body() dto: CreateBugDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.createBug(id, dto, userId);
  }

  @Get(':id/bugs')
  listBugs(@Param('id') id: string) {
    return this.projectsService.listBugs(id);
  }

  @Get(':id/bugs/:bugId')
  findBug(@Param('id') id: string, @Param('bugId') bugId: string) {
    return this.projectsService.findBug(id, bugId);
  }

  @Patch(':id/bugs/:bugId')
  updateBug(
    @Param('id') id: string,
    @Param('bugId') bugId: string,
    @Body() dto: UpdateBugDto,
  ) {
    return this.projectsService.updateBug(id, bugId, dto);
  }

  @Delete(':id/bugs/:bugId')
  removeBug(@Param('id') id: string, @Param('bugId') bugId: string) {
    return this.projectsService.removeBug(id, bugId);
  }

  // --- Time entries ------------------------------------------------------------

  @Post(':id/time-entries')
  createTimeEntry(
    @Param('id') id: string,
    @Body() dto: CreateTimeEntryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.createTimeEntry(id, dto, userId);
  }

  @Get(':id/time-entries')
  listTimeEntries(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.projectsService.listTimeEntries(id, userId);
  }

  @Patch(':id/time-entries/:entryId')
  updateTimeEntry(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    return this.projectsService.updateTimeEntry(id, entryId, dto);
  }

  @Delete(':id/time-entries/:entryId')
  removeTimeEntry(@Param('id') id: string, @Param('entryId') entryId: string) {
    return this.projectsService.removeTimeEntry(id, entryId);
  }

  // --- Activity log --------------------------------------------------------

  @Get(':id/activity')
  listActivity(@Param('id') id: string, @Query() pagination: PaginationDto) {
    return this.projectsService.listActivity(id, pagination);
  }

  // --- Documents -----------------------------------------------------------

  @Post(':id/documents')
  @HttpCode(HttpStatus.CREATED)
  addDocument(
    @Param('id') id: string,
    @Body() dto: CreateDocumentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.addDocument(id, dto, userId);
  }

  @Get(':id/documents')
  listDocuments(@Param('id') id: string) {
    return this.projectsService.listDocuments(id);
  }

  @Delete(':id/documents/:documentId')
  removeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ) {
    return this.projectsService.removeDocument(id, documentId);
  }
}
