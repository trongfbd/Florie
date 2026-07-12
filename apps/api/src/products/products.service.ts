import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { generateUniqueSlug } from '../common/utils/unique-slug.util';
import { STORAGE_SERVICE } from '../storage/storage.service.interface';
import type { StorageService } from '../storage/storage.service.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { SetProductMaterialsDto } from './dto/set-product-materials.dto';
import { QueryPublicProductDto } from './dto/query-public-product.dto';

const PRODUCT_DETAIL_INCLUDE = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { displayOrder: 'asc' } },
  tags: { include: { tag: true } },
  materials: { include: { material: true } },
} satisfies Prisma.ProductInclude;

const PRODUCT_LIST_INCLUDE = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { displayOrder: 'asc' }, take: 1 },
  tags: { include: { tag: true } },
} satisfies Prisma.ProductInclude;

type ProductDetail = Prisma.ProductGetPayload<{ include: typeof PRODUCT_DETAIL_INCLUDE }>;
type ProductListItem = Prisma.ProductGetPayload<{ include: typeof PRODUCT_LIST_INCLUDE }>;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDetail> {
    await this.assertCategoryExists(dto.categoryId);
    this.assertValidPricing(dto.basePrice, dto.salePrice);

    const slug = dto.slug
      ? await this.assertSlugAvailable(dto.slug)
      : await generateUniqueSlug(dto.name, (candidate) => this.slugExists(candidate));

    const { tagIds, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        slug,
        ...(tagIds && tagIds.length > 0 && { tags: { create: tagIds.map((tagId) => ({ tagId })) } }),
      },
      include: PRODUCT_DETAIL_INCLUDE,
    });
  }

  async findAll(query: QueryProductDto): Promise<PaginatedResult<ProductListItem>> {
    const where: Prisma.ProductWhereInput = {
      ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.status && { status: query.status }),
      ...(query.color && { color: { equals: query.color, mode: 'insensitive' } }),
      ...(query.tagId && { tags: { some: { tagId: query.tagId } } }),
      // Filtered on basePrice; salePrice-aware "effective price" filtering is
      // deferred to the storefront sprint where it's actually load-bearing.
      ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
        basePrice: {
          ...(query.minPrice !== undefined && { gte: query.minPrice }),
          ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_LIST_INCLUDE,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<ProductDetail> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return product;
  }

  /** Public storefront listing: always ACTIVE-only, never overridable via query params. */
  async findPublicList(query: QueryPublicProductDto): Promise<PaginatedResult<ProductListItem>> {
    let categoryId: string | undefined;
    if (query.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: query.categorySlug },
        select: { id: true },
      });
      if (!category) {
        return buildPaginatedResult([], 0, query.page, query.limit);
      }
      categoryId = category.id;
    }

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
      ...(categoryId && { categoryId }),
      ...(query.color && { color: { equals: query.color, mode: 'insensitive' } }),
      ...(query.tagId && { tags: { some: { tagId: query.tagId } } }),
      ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
        basePrice: {
          ...(query.minPrice !== undefined && { gte: query.minPrice }),
          ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
        },
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === 'priceAsc'
        ? { basePrice: 'asc' }
        : query.sort === 'priceDesc'
          ? { basePrice: 'desc' }
          : query.sort === 'name'
            ? { name: 'asc' }
            : { createdAt: 'desc' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_LIST_INCLUDE,
        orderBy,
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findPublicBySlug(slug: string): Promise<ProductDetail> {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'ACTIVE' },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    // Best-effort view counter — never blocks the response on failure.
    this.prisma.product
      .update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => undefined);

    return product;
  }

  async findRelatedProducts(slug: string, limit = 4): Promise<ProductListItem[]> {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'ACTIVE' },
      select: { id: true, categoryId: true },
    });

    if (!product) {
      return [];
    }

    return this.prisma.product.findMany({
      where: { categoryId: product.categoryId, status: 'ACTIVE', id: { not: product.id } },
      include: PRODUCT_LIST_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDetail> {
    const existing = await this.findOne(id);

    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId);
    }
    this.assertValidPricing(dto.basePrice ?? existing.basePrice, dto.salePrice ?? existing.salePrice ?? undefined);

    const slug = dto.slug ? await this.assertSlugAvailable(dto.slug, id) : undefined;
    const { tagIds, ...productData } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(slug && { slug }),
        ...(tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: PRODUCT_DETAIL_INCLUDE,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const orderItemCount = await this.prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      throw new ConflictException(
        'Sản phẩm đã có trong đơn hàng — hãy chuyển trạng thái sang ARCHIVED thay vì xoá.',
      );
    }

    const images = await this.prisma.productImage.findMany({ where: { productId: id } });
    await this.prisma.product.delete({ where: { id } });
    await Promise.all(
      images
        .filter((image) => image.storageKey)
        .map((image) => this.storageService.delete(image.storageKey as string).catch(() => undefined)),
    );
  }

  async addImage(
    productId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
    altText?: string,
  ) {
    await this.findOne(productId);

    const uploaded = await this.storageService.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder: 'products',
    });

    const currentCount = await this.prisma.productImage.count({ where: { productId } });

    return this.prisma.productImage.create({
      data: {
        productId,
        url: uploaded.url,
        storageKey: uploaded.key,
        altText,
        displayOrder: currentCount,
      },
    });
  }

  async removeImage(productId: string, imageId: string): Promise<void> {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });

    if (!image || image.productId !== productId) {
      throw new NotFoundException('Không tìm thấy ảnh sản phẩm');
    }

    await this.prisma.productImage.delete({ where: { id: imageId } });

    if (image.storageKey) {
      await this.storageService.delete(image.storageKey).catch(() => undefined);
    }
  }

  async setMaterials(productId: string, dto: SetProductMaterialsDto): Promise<ProductDetail> {
    await this.findOne(productId);

    const materialIds = dto.materials.map((item) => item.materialId);
    const foundMaterials = await this.prisma.material.findMany({
      where: { id: { in: materialIds } },
      select: { id: true },
    });
    const missing = materialIds.filter((id) => !foundMaterials.some((m) => m.id === id));
    if (missing.length > 0) {
      throw new NotFoundException(`Không tìm thấy vật tư: ${missing.join(', ')}`);
    }

    await this.prisma.$transaction([
      this.prisma.productMaterial.deleteMany({ where: { productId } }),
      this.prisma.productMaterial.createMany({
        data: dto.materials.map((item) => ({
          productId,
          materialId: item.materialId,
          quantity: item.quantity,
        })),
      }),
    ]);

    return this.findOne(productId);
  }

  private assertValidPricing(basePrice: number, salePrice?: number): void {
    if (salePrice !== undefined && salePrice >= basePrice) {
      throw new BadRequestException('Giá khuyến mãi phải nhỏ hơn giá gốc');
    }
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const exists = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }
  }

  private async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await this.prisma.product.findUnique({ where: { slug }, select: { id: true } });
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
