import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

const CATEGORY_LIST_INCLUDE = {
  parent: { select: { id: true, name: true } },
  _count: { select: { children: true, products: true } },
} satisfies Prisma.CategoryInclude;

type CategoryWithMeta = Prisma.CategoryGetPayload<{ include: typeof CATEGORY_LIST_INCLUDE }>;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto): Promise<CategoryWithMeta> {
    if (dto.parentId) {
      await this.assertCategoryExists(dto.parentId);
    }

    const slug = dto.slug
      ? await this.assertSlugAvailable(dto.slug)
      : await generateUniqueSlug(dto.name, (candidate) => this.slugExists(candidate));

    return this.prisma.category.create({
      data: { ...dto, slug },
      include: CATEGORY_LIST_INCLUDE,
    });
  }

  async findAll(query: QueryCategoryDto): Promise<PaginatedResult<CategoryWithMeta>> {
    const where: Prisma.CategoryWhereInput = {
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' },
      }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.parentId !== undefined && { parentId: query.parentId }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        include: CATEGORY_LIST_INCLUDE,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.category.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<CategoryWithMeta> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: CATEGORY_LIST_INCLUDE,
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryWithMeta> {
    await this.findOne(id);

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new ConflictException('Danh mục không thể là danh mục cha của chính nó');
      }
      await this.assertCategoryExists(dto.parentId);
    }

    const slug = dto.slug ? await this.assertSlugAvailable(dto.slug, id) : undefined;

    return this.prisma.category.update({
      where: { id },
      data: { ...dto, ...(slug && { slug }) },
      include: CATEGORY_LIST_INCLUDE,
    });
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    if (category._count.products > 0 || category._count.children > 0) {
      throw new ConflictException(
        'Không thể xoá danh mục còn sản phẩm hoặc danh mục con — hãy chuyển chúng sang danh mục khác trước.',
      );
    }

    await this.prisma.category.delete({ where: { id } });
  }

  private async assertCategoryExists(id: string): Promise<void> {
    const exists = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('Không tìm thấy danh mục cha');
    }
  }

  private async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await this.prisma.category.findUnique({ where: { slug }, select: { id: true } });
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
