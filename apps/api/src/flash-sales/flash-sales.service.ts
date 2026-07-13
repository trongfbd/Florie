import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { QueryFlashSaleDto } from './dto/query-flash-sale.dto';

const FLASH_SALE_DETAIL_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          images: { orderBy: { displayOrder: 'asc' }, take: 1 },
        },
      },
    },
  },
} satisfies Prisma.FlashSaleInclude;

type FlashSaleDetail = Prisma.FlashSaleGetPayload<{ include: typeof FLASH_SALE_DETAIL_INCLUDE }>;

@Injectable()
export class FlashSalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFlashSaleDto): Promise<FlashSaleDetail> {
    this.assertDateRange(dto.startAt, dto.endAt);
    await this.assertProductsExist(dto.items.map((item) => item.productId));

    const { items, ...rest } = dto;
    return this.prisma.flashSale.create({
      data: {
        ...rest,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            salePrice: item.salePrice,
            quantityLimit: item.quantityLimit,
          })),
        },
      },
      include: FLASH_SALE_DETAIL_INCLUDE,
    });
  }

  async findAll(query: QueryFlashSaleDto): Promise<PaginatedResult<FlashSaleDetail>> {
    const where: Prisma.FlashSaleWhereInput = {
      ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.flashSale.findMany({
        where,
        include: FLASH_SALE_DETAIL_INCLUDE,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.flashSale.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<FlashSaleDetail> {
    const flashSale = await this.prisma.flashSale.findUnique({
      where: { id },
      include: FLASH_SALE_DETAIL_INCLUDE,
    });
    if (!flashSale) {
      throw new NotFoundException('Không tìm thấy flash sale');
    }
    return flashSale;
  }

  /** Public storefront: the currently-running flash sale, if any (soonest-ending wins if overlapping). */
  async findActive(): Promise<FlashSaleDetail | null> {
    const now = new Date();
    return this.prisma.flashSale.findFirst({
      where: { isActive: true, startAt: { lte: now }, endAt: { gte: now } },
      include: FLASH_SALE_DETAIL_INCLUDE,
      orderBy: { endAt: 'asc' },
    });
  }

  async update(id: string, dto: UpdateFlashSaleDto): Promise<FlashSaleDetail> {
    const current = await this.findOne(id);

    const startAt = dto.startAt ?? current.startAt.toISOString();
    const endAt = dto.endAt ?? current.endAt.toISOString();
    this.assertDateRange(startAt, endAt);

    if (dto.items) {
      await this.assertProductsExist(dto.items.map((item) => item.productId));
    }

    const { items, ...rest } = dto;

    await this.prisma.$transaction([
      this.prisma.flashSale.update({
        where: { id },
        data: {
          ...rest,
          ...(dto.startAt && { startAt: new Date(dto.startAt) }),
          ...(dto.endAt && { endAt: new Date(dto.endAt) }),
        },
      }),
      ...(items
        ? [
            this.prisma.flashSaleItem.deleteMany({ where: { flashSaleId: id } }),
            this.prisma.flashSaleItem.createMany({
              data: items.map((item) => ({
                flashSaleId: id,
                productId: item.productId,
                salePrice: item.salePrice,
                quantityLimit: item.quantityLimit,
              })),
            }),
          ]
        : []),
    ]);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.flashSale.delete({ where: { id } });
  }

  private assertDateRange(startAt: string, endAt: string): void {
    if (new Date(startAt) >= new Date(endAt)) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }
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
}
