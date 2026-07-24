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
import { ContentStatus, RoleName } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { UpsertSeoDto } from './dto/upsert-seo.dto';

const CMS_ROLES = [RoleName.SUPER_ADMIN, RoleName.ADMIN];

@Controller('cms')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // --- Blog posts (public read, admin write) --------------------------------

  @Post('blog-posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  createPost(
    @Body() dto: CreateBlogPostDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.blogService.createPost(dto, userId);
  }

  @Get('blog-posts')
  findAllPosts(
    @Query() pagination: PaginationDto,
    @Query('status') status?: ContentStatus,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.blogService.findAllPosts(pagination, { status, categoryId });
  }

  @Get('blog-posts/slug/:slug')
  findPostBySlug(@Param('slug') slug: string) {
    return this.blogService.findPostBySlug(slug);
  }

  @Get('blog-posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  findPost(@Param('id') id: string) {
    return this.blogService.findPost(id);
  }

  @Patch('blog-posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  updatePost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.updatePost(id, dto);
  }

  @Delete('blog-posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  removePost(@Param('id') id: string) {
    return this.blogService.removePost(id);
  }

  @Post('blog-posts/:id/seo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  upsertPostSeo(@Param('id') id: string, @Body() dto: UpsertSeoDto) {
    return this.blogService.upsertSeoForBlogPost(id, dto);
  }

  // --- Categories ------------------------------------------------------------

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.blogService.createCategory(dto);
  }

  @Get('categories')
  listCategories() {
    return this.blogService.listCategories();
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.blogService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  removeCategory(@Param('id') id: string) {
    return this.blogService.removeCategory(id);
  }

  // --- Tags --------------------------------------------------------------------

  @Post('tags')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  createTag(@Body() dto: CreateTagDto) {
    return this.blogService.createTag(dto);
  }

  @Get('tags')
  listTags() {
    return this.blogService.listTags();
  }

  @Delete('tags/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  removeTag(@Param('id') id: string) {
    return this.blogService.removeTag(id);
  }

  // --- Media -------------------------------------------------------------------

  @Post('media')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  createMedia(@Body() dto: CreateMediaDto, @CurrentUser('id') userId: string) {
    return this.blogService.createMedia(dto, userId);
  }

  @Get('media')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  listMedia(@Query() pagination: PaginationDto) {
    return this.blogService.listMedia(pagination);
  }

  @Delete('media/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  removeMedia(@Param('id') id: string) {
    return this.blogService.removeMedia(id);
  }

  // --- Pages -------------------------------------------------------------------

  @Post('pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  createPage(@Body() dto: CreatePageDto) {
    return this.blogService.createPage(dto);
  }

  @Get('pages')
  listPages() {
    return this.blogService.listPages();
  }

  @Get('pages/slug/:slug')
  findPageBySlug(@Param('slug') slug: string) {
    return this.blogService.findPageBySlug(slug);
  }

  @Patch('pages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  updatePage(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.blogService.updatePage(id, dto);
  }

  @Delete('pages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  removePage(@Param('id') id: string) {
    return this.blogService.removePage(id);
  }

  @Post('pages/:id/seo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  upsertPageSeo(@Param('id') id: string, @Body() dto: UpsertSeoDto) {
    return this.blogService.upsertSeoForPage(id, dto);
  }
}
