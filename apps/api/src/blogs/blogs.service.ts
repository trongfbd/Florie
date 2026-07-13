import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BlogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';

const BLOG_INCLUDE = {
  author: { select: { id: true, name: true } },
} satisfies Prisma.BlogInclude;

type BlogWithAuthor = Prisma.BlogGetPayload<{ include: typeof BLOG_INCLUDE }>;

@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBlogDto, authorId: string): Promise<BlogWithAuthor> {
    const slug = dto.slug
      ? await this.assertSlugAvailable(dto.slug)
      : await generateUniqueSlug(dto.title, (candidate) => this.slugExists(candidate));

    const status = dto.status ?? BlogStatus.DRAFT;
    return this.prisma.blog.create({
      data: {
        ...dto,
        slug,
        status,
        authorId,
        publishedAt: status === BlogStatus.PUBLISHED ? new Date() : null,
      },
      include: BLOG_INCLUDE,
    });
  }

  async findAll(query: QueryBlogDto): Promise<PaginatedResult<BlogWithAuthor>> {
    const where: Prisma.BlogWhereInput = {
      ...(query.search && { title: { contains: query.search, mode: 'insensitive' } }),
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.blog.findMany({
        where,
        include: BLOG_INCLUDE,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.blog.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<BlogWithAuthor> {
    const blog = await this.prisma.blog.findUnique({ where: { id }, include: BLOG_INCLUDE });
    if (!blog) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    return blog;
  }

  /** Public storefront: only ever published posts. */
  async findPublicList(query: QueryBlogDto): Promise<PaginatedResult<BlogWithAuthor>> {
    const where: Prisma.BlogWhereInput = {
      status: BlogStatus.PUBLISHED,
      ...(query.search && { title: { contains: query.search, mode: 'insensitive' } }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.blog.findMany({
        where,
        include: BLOG_INCLUDE,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.blog.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findPublicBySlug(slug: string): Promise<BlogWithAuthor> {
    const blog = await this.prisma.blog.findFirst({
      where: { slug, status: BlogStatus.PUBLISHED },
      include: BLOG_INCLUDE,
    });
    if (!blog) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    return blog;
  }

  async update(id: string, dto: UpdateBlogDto): Promise<BlogWithAuthor> {
    const current = await this.findOne(id);

    const slug = dto.slug ? await this.assertSlugAvailable(dto.slug, id) : undefined;

    const justPublished = dto.status === BlogStatus.PUBLISHED && current.status !== BlogStatus.PUBLISHED;

    return this.prisma.blog.update({
      where: { id },
      data: {
        ...dto,
        ...(slug && { slug }),
        ...(justPublished && { publishedAt: new Date() }),
      },
      include: BLOG_INCLUDE,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.blog.delete({ where: { id } });
  }

  private async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await this.prisma.blog.findUnique({ where: { slug }, select: { id: true } });
    return !!existing && existing.id !== excludeId;
  }

  private async assertSlugAvailable(slug: string, excludeId?: string): Promise<string> {
    const normalized = slug.trim().toLowerCase();
    if (await this.slugExists(normalized, excludeId)) {
      throw new ConflictException(`Slug "${normalized}" đã được sử dụng`);
    }
    return normalized;
  }
}
