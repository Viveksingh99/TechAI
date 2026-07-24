import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import {
  buildSearchFilter,
  createPaginatedResult,
} from '../common/utils/pagination.util';
import { slugify } from '../common/utils/slugify.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { UpsertSeoDto } from './dto/upsert-seo.dto';

const BLOG_POST_INCLUDE = {
  author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
  category: true,
  tags: true,
  seo: true,
} satisfies Prisma.BlogPostInclude;

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Blog posts
  // ---------------------------------------------------------------------

  async createPost(dto: CreateBlogPostDto, authorId?: string) {
    const slug = await this.generateUniqueSlug(dto.slug ?? dto.title);

    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        authorId,
        categoryId: dto.categoryId,
        isFeatured: dto.isFeatured,
        status: dto.status,
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : undefined,
        tags: dto.tagIds ? { connect: dto.tagIds.map((id) => ({ id })) } : undefined,
      },
      include: BLOG_POST_INCLUDE,
    });
  }

  async findAllPosts(
    pagination: PaginationDto,
    filter: { status?: ContentStatus; categoryId?: string },
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.BlogPostWhereInput = {
      deletedAt: null,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
      ...buildSearchFilter(pagination.search, ['title', 'excerpt']),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        where,
        include: BLOG_POST_INCLUDE,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async findPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, deletedAt: null },
      include: BLOG_POST_INCLUDE,
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    await this.prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  async findPost(id: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { id, deletedAt: null },
      include: BLOG_POST_INCLUDE,
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  async updatePost(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.ensurePostExists(id);

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug ? slugify(dto.slug) : undefined,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        categoryId: dto.categoryId,
        isFeatured: dto.isFeatured,
        status: dto.status,
        publishedAt:
          dto.status === 'PUBLISHED' && existing.status !== 'PUBLISHED' ? new Date() : undefined,
        tags: dto.tagIds ? { set: dto.tagIds.map((tagId) => ({ id: tagId })) } : undefined,
      },
      include: BLOG_POST_INCLUDE,
    });
  }

  async removePost(id: string): Promise<{ message: string }> {
    await this.ensurePostExists(id);
    await this.prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date() } });

    return { message: 'Blog post deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------

  async createCategory(dto: CreateCategoryDto) {
    const slug = await this.generateUniqueCategorySlug(dto.slug ?? dto.name);

    return this.prisma.category.create({ data: { ...dto, slug } });
  }

  listCategories() {
    return this.prisma.category.findMany({
      include: { _count: { select: { blogPosts: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.ensureExists(this.prisma.category, id, 'Category');

    return this.prisma.category.update({
      where: { id },
      data: { ...dto, slug: dto.slug ? slugify(dto.slug) : undefined },
    });
  }

  async removeCategory(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.category, id, 'Category');
    await this.prisma.category.delete({ where: { id } });

    return { message: 'Category deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Tags
  // ---------------------------------------------------------------------

  async createTag(dto: CreateTagDto) {
    const slug = slugify(dto.slug ?? dto.name);

    return this.prisma.tag.create({ data: { ...dto, slug } });
  }

  listTags() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  async removeTag(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.tag, id, 'Tag');
    await this.prisma.tag.delete({ where: { id } });

    return { message: 'Tag deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Media
  // ---------------------------------------------------------------------

  createMedia(dto: CreateMediaDto, uploadedById?: string) {
    return this.prisma.media.create({ data: { ...dto, uploadedById } });
  }

  async listMedia(pagination: PaginationDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.MediaWhereInput = {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async removeMedia(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.media, id, 'Media item');
    await this.prisma.media.delete({ where: { id } });

    return { message: 'Media deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Pages
  // ---------------------------------------------------------------------

  async createPage(dto: CreatePageDto) {
    const slug = await this.generateUniquePageSlug(dto.slug ?? dto.title);

    return this.prisma.page.create({ data: { ...dto, slug } });
  }

  listPages() {
    return this.prisma.page.findMany({ where: { deletedAt: null }, orderBy: { title: 'asc' } });
  }

  async findPageBySlug(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { slug, deletedAt: null },
      include: { seo: true },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async updatePage(id: string, dto: UpdatePageDto) {
    await this.ensureExists(this.prisma.page, id, 'Page');

    return this.prisma.page.update({
      where: { id },
      data: { ...dto, slug: dto.slug ? slugify(dto.slug) : undefined },
    });
  }

  async removePage(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.page, id, 'Page');
    await this.prisma.page.update({ where: { id }, data: { deletedAt: new Date() } });

    return { message: 'Page deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // SEO settings
  // ---------------------------------------------------------------------

  upsertSeoForBlogPost(blogPostId: string, dto: UpsertSeoDto) {
    return this.prisma.seoSettings.upsert({
      where: { blogPostId },
      create: { blogPostId, ...dto },
      update: dto,
    });
  }

  upsertSeoForPage(pageId: string, dto: UpsertSeoDto) {
    return this.prisma.seoSettings.upsert({
      where: { pageId },
      create: { pageId, ...dto },
      update: dto,
    });
  }

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  private async ensurePostExists(id: string) {
    const post = await this.prisma.blogPost.findFirst({ where: { id, deletedAt: null } });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  private async ensureExists(
    delegate: { findUnique: (args: { where: { id: string } }) => Promise<unknown> },
    id: string,
    label: string,
  ): Promise<void> {
    const record = await delegate.findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException(`${label} not found`);
    }
  }

  private async generateUniqueSlug(source: string): Promise<string> {
    const base = slugify(source);
    const existing = await this.prisma.blogPost.findUnique({ where: { slug: base } });

    return existing ? slugify(source, true) : base;
  }

  private async generateUniqueCategorySlug(source: string): Promise<string> {
    const base = slugify(source);
    const existing = await this.prisma.category.findUnique({ where: { slug: base } });

    return existing ? slugify(source, true) : base;
  }

  private async generateUniquePageSlug(source: string): Promise<string> {
    const base = slugify(source);
    const existing = await this.prisma.page.findUnique({ where: { slug: base } });

    return existing ? slugify(source, true) : base;
  }
}
