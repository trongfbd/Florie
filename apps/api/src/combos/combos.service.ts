import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { QueryComboDto } from './dto/query-combo.dto';

const COMBO_DETAIL_INCLUDE = {
  items: {
    include: {
      product: {
        select: { id: true, name: true, slug: true, images: { orderBy: { displayOrder: 'asc' }, take: 1 } },
      },
    },
  },
} satisfies Prisma.ComboInclude;

type ComboDetail = Prisma.ComboGetPayload<{ include: typeof COMBO_DETAIL_INCLUDE }>;

@Injectable()
export class CombosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateComboDto): Promise<ComboDetail> {
    await this.assertProductsExist(dto.items.map((item) => item.productId));

    const slug = dto.slug
      ? await this.assertSlugAvailable(dto.slug)
      : await generateUniqueSlug(dto.name, (candidate) => this.slugExists(candidate));

    const { items, ...rest } = dto;
    return this.prisma.combo.create({
      data: {
        ...rest,
        slug,
        items: { create: items.map((item) => ({ productId: item.productId, quantity: item.quantity })) },
      },
      include: COMBO_DETAIL_INCLUDE,
    });
  }

  async findAll(query: QueryComboDto): Promise<PaginatedResult<ComboDetail>> {
    const where: Prisma.ComboWhereInput = {
      ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.combo.findMany({
        where,
        include: COMBO_DETAIL_INCLUDE,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.combo.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<ComboDetail> {
    const combo = await this.prisma.combo.findUnique({ where: { id }, include: COMBO_DETAIL_INCLUDE });
    if (!combo) {
      throw new NotFoundException('Không tìm thấy combo');
    }
    return combo;
  }

  /** Public storefront: only ever active combos. */
  findPublicList(): Promise<ComboDetail[]> {
    return this.prisma.combo.findMany({
      where: { isActive: true },
      include: COMBO_DETAIL_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublicBySlug(slug: string): Promise<ComboDetail> {
    const combo = await this.prisma.combo.findFirst({
      where: { slug, isActive: true },
      include: COMBO_DETAIL_INCLUDE,
    });
    if (!combo) {
      throw new NotFoundException('Không tìm thấy combo');
    }
    return combo;
  }

  async update(id: string, dto: UpdateComboDto): Promise<ComboDetail> {
    await this.findOne(id);

    if (dto.items) {
      await this.assertProductsExist(dto.items.map((item) => item.productId));
    }

    const slug = dto.slug ? await this.assertSlugAvailable(dto.slug, id) : undefined;
    const { items, ...rest } = dto;

    await this.prisma.$transaction([
      this.prisma.combo.update({
        where: { id },
        data: { ...rest, ...(slug && { slug }) },
      }),
      ...(items
        ? [
            this.prisma.comboItem.deleteMany({ where: { comboId: id } }),
            this.prisma.comboItem.createMany({
              data: items.map((item) => ({ comboId: id, productId: item.productId, quantity: item.quantity })),
            }),
          ]
        : []),
    ]);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const usedInOrders = await this.prisma.orderItem.count({ where: { comboId: id } });
    if (usedInOrders > 0) {
      throw new ConflictException(
        'Combo đã có trong đơn hàng, không thể xoá — hãy tắt trạng thái hoạt động thay vì xoá.',
      );
    }

    await this.prisma.combo.delete({ where: { id } });
  }

  private async assertProductsExist(productIds: string[]): Promise<void> {
    const found = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const missing = productIds.filter((id) => !found.some((p) => p.id === id));
    if (missing.length > 0) {
      throw new NotFoundException(`Không tìm thấy sản phẩm: ${missing.join(', ')}`);
    }
  }

  private async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await this.prisma.combo.findUnique({ where: { slug }, select: { id: true } });
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
