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
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ContentService } from './content.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { UpsertCaseStudyDto } from './dto/upsert-case-study.dto';

const CMS_ROLES = [RoleName.SUPER_ADMIN, RoleName.ADMIN];

@Controller('cms')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // --- FAQs --------------------------------------------------------------------

  @Post('faqs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  createFaq(@Body() dto: CreateFaqDto) {
    return this.contentService.createFaq(dto);
  }

  @Get('faqs')
  listFaqs(@Query('category') category?: string) {
    return this.contentService.listFaqs(category);
  }

  @Patch('faqs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.contentService.updateFaq(id, dto);
  }

  @Delete('faqs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  removeFaq(@Param('id') id: string) {
    return this.contentService.removeFaq(id);
  }

  // --- Testimonials --------------------------------------------------------------

  @Post('testimonials')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  createTestimonial(@Body() dto: CreateTestimonialDto) {
    return this.contentService.createTestimonial(dto);
  }

  @Get('testimonials')
  listTestimonials(@Query('publishedOnly') publishedOnly?: string) {
    return this.contentService.listTestimonials(publishedOnly === 'true');
  }

  @Patch('testimonials/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  updateTestimonial(
    @Param('id') id: string,
    @Body() dto: UpdateTestimonialDto,
  ) {
    return this.contentService.updateTestimonial(id, dto);
  }

  @Delete('testimonials/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  removeTestimonial(@Param('id') id: string) {
    return this.contentService.removeTestimonial(id);
  }

  // --- Portfolio items + case studies ---------------------------------------------

  @Post('portfolio-items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  createPortfolioItem(@Body() dto: CreatePortfolioItemDto) {
    return this.contentService.createPortfolioItem(dto);
  }

  @Get('portfolio-items')
  listPortfolioItems() {
    return this.contentService.listPortfolioItems();
  }

  @Get('portfolio-items/:id')
  findPortfolioItem(@Param('id') id: string) {
    return this.contentService.findPortfolioItem(id);
  }

  @Patch('portfolio-items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  updatePortfolioItem(
    @Param('id') id: string,
    @Body() dto: UpdatePortfolioItemDto,
  ) {
    return this.contentService.updatePortfolioItem(id, dto);
  }

  @Delete('portfolio-items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  removePortfolioItem(@Param('id') id: string) {
    return this.contentService.removePortfolioItem(id);
  }

  @Post('portfolio-items/:id/case-study')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  upsertCaseStudy(@Param('id') id: string, @Body() dto: UpsertCaseStudyDto) {
    return this.contentService.upsertCaseStudy(id, dto);
  }

  // --- Team members ----------------------------------------------------------------

  @Post('team-members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  createTeamMember(@Body() dto: CreateTeamMemberDto) {
    return this.contentService.createTeamMember(dto);
  }

  @Get('team-members')
  listTeamMembers(@Query('publishedOnly') publishedOnly?: string) {
    return this.contentService.listTeamMembers(publishedOnly === 'true');
  }

  @Patch('team-members/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  updateTeamMember(@Param('id') id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.contentService.updateTeamMember(id, dto);
  }

  @Delete('team-members/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  removeTeamMember(@Param('id') id: string) {
    return this.contentService.removeTeamMember(id);
  }

  // --- Services ----------------------------------------------------------------------

  @Post('services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  createService(@Body() dto: CreateServiceDto) {
    return this.contentService.createService(dto);
  }

  @Get('services')
  listServices(@Query('publishedOnly') publishedOnly?: string) {
    return this.contentService.listServices(publishedOnly === 'true');
  }

  @Patch('services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.contentService.updateService(id, dto);
  }

  @Delete('services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  removeService(@Param('id') id: string) {
    return this.contentService.removeService(id);
  }
}
