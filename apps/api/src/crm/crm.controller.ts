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
import { CrmService } from './crm.service';
import { CloseDealDto } from './dto/close-deal.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { CreateEmailHistoryDto } from './dto/create-email-history.dto';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';
import { MoveDealStageDto } from './dto/move-deal-stage.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

const CRM_ROLES = [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES];

@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...CRM_ROLES)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // --- Companies -------------------------------------------------------------

  @Post('companies')
  createCompany(@Body() dto: CreateCompanyDto) {
    return this.crmService.createCompany(dto);
  }

  @Get('companies')
  findAllCompanies(@Query() pagination: PaginationDto) {
    return this.crmService.findAllCompanies(pagination);
  }

  @Get('companies/:id')
  findCompany(@Param('id') id: string) {
    return this.crmService.findCompany(id);
  }

  @Patch('companies/:id')
  updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.crmService.updateCompany(id, dto);
  }

  @Delete('companies/:id')
  removeCompany(@Param('id') id: string) {
    return this.crmService.removeCompany(id);
  }

  // --- Contacts --------------------------------------------------------------

  @Post('contacts')
  createContact(@Body() dto: CreateContactDto) {
    return this.crmService.createContact(dto);
  }

  @Get('contacts')
  findAllContacts(@Query() pagination: PaginationDto) {
    return this.crmService.findAllContacts(pagination);
  }

  @Get('contacts/:id')
  findContact(@Param('id') id: string) {
    return this.crmService.findContact(id);
  }

  @Patch('contacts/:id')
  updateContact(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.crmService.updateContact(id, dto);
  }

  @Delete('contacts/:id')
  removeContact(@Param('id') id: string) {
    return this.crmService.removeContact(id);
  }

  // --- Leads -------------------------------------------------------------------

  @Post('leads')
  createLead(@Body() dto: CreateLeadDto) {
    return this.crmService.createLead(dto);
  }

  @Get('leads')
  findAllLeads(@Query() pagination: PaginationDto) {
    return this.crmService.findAllLeads(pagination);
  }

  @Get('leads/:id')
  findLead(@Param('id') id: string) {
    return this.crmService.findLead(id);
  }

  @Patch('leads/:id')
  updateLead(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.crmService.updateLead(id, dto);
  }

  @Delete('leads/:id')
  removeLead(@Param('id') id: string) {
    return this.crmService.removeLead(id);
  }

  @Post('leads/:id/convert')
  convertLead(@Param('id') id: string, @Body() dto: MoveDealStageDto) {
    return this.crmService.convertLeadToDeal(id, dto.stageId);
  }

  // --- Pipeline stages ---------------------------------------------------------

  @Post('pipeline-stages')
  createPipelineStage(@Body() dto: CreatePipelineStageDto) {
    return this.crmService.createPipelineStage(dto);
  }

  @Get('pipeline-stages')
  listPipelineStages() {
    return this.crmService.listPipelineStages();
  }

  // --- Deals ---------------------------------------------------------------------

  @Post('deals')
  createDeal(@Body() dto: CreateDealDto) {
    return this.crmService.createDeal(dto);
  }

  @Get('deals')
  findAllDeals(
    @Query() pagination: PaginationDto,
    @Query('stageId') stageId?: string,
  ) {
    return this.crmService.findAllDeals(pagination, stageId);
  }

  @Get('deals/board')
  pipelineBoard() {
    return this.crmService.pipelineBoard();
  }

  @Get('deals/:id')
  findDeal(@Param('id') id: string) {
    return this.crmService.findDeal(id);
  }

  @Patch('deals/:id')
  updateDeal(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.crmService.updateDeal(id, dto);
  }

  @Patch('deals/:id/stage')
  moveDealStage(@Param('id') id: string, @Body() dto: MoveDealStageDto) {
    return this.crmService.moveDealStage(id, dto);
  }

  @Patch('deals/:id/close')
  closeDeal(@Param('id') id: string, @Body() dto: CloseDealDto) {
    return this.crmService.closeDeal(id, dto);
  }

  @Delete('deals/:id')
  removeDeal(@Param('id') id: string) {
    return this.crmService.removeDeal(id);
  }

  // --- Follow-ups ------------------------------------------------------------------

  @Post('follow-ups')
  createFollowUp(@Body() dto: CreateFollowUpDto) {
    return this.crmService.createFollowUp(dto);
  }

  @Get('follow-ups')
  findAllFollowUps(@Query() pagination: PaginationDto) {
    return this.crmService.findAllFollowUps(pagination);
  }

  @Patch('follow-ups/:id')
  updateFollowUp(@Param('id') id: string, @Body() dto: UpdateFollowUpDto) {
    return this.crmService.updateFollowUp(id, dto);
  }

  @Patch('follow-ups/:id/complete')
  completeFollowUp(@Param('id') id: string) {
    return this.crmService.completeFollowUp(id);
  }

  @Delete('follow-ups/:id')
  removeFollowUp(@Param('id') id: string) {
    return this.crmService.removeFollowUp(id);
  }

  // --- Notes -----------------------------------------------------------------------

  @Post('notes')
  createNote(@Body() dto: CreateNoteDto, @CurrentUser('id') userId: string) {
    return this.crmService.createNote(dto, userId);
  }

  @Get('notes')
  listNotes(
    @Query('leadId') leadId?: string,
    @Query('dealId') dealId?: string,
    @Query('contactId') contactId?: string,
  ) {
    return this.crmService.listNotes({ leadId, dealId, contactId });
  }

  @Delete('notes/:id')
  removeNote(@Param('id') id: string) {
    return this.crmService.removeNote(id);
  }

  // --- Email history (stub) --------------------------------------------------------

  @Post('emails')
  createEmailHistory(
    @Body() dto: CreateEmailHistoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.crmService.createEmailHistory(dto, userId);
  }

  @Get('emails')
  listEmailHistory(
    @Query('leadId') leadId?: string,
    @Query('contactId') contactId?: string,
  ) {
    return this.crmService.listEmailHistory({ leadId, contactId });
  }

  // --- Analytics -------------------------------------------------------------------

  @Get('analytics/summary')
  salesAnalytics() {
    return this.crmService.salesAnalytics();
  }
}
