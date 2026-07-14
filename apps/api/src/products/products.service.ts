import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
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

type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_DETAIL_INCLUDE;
}>;
type ProductListItem = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_LIST_INCLUDE;
}>;

// costPrice is internal-only (used for margin reporting) — every public/storefront
// query below must omit it, same reasoning as omitting Customer.passwordHash.
const PUBLIC_OMIT = { costPrice: true } satisfies Prisma.ProductOmit;

const NEW_PRODUCT_WINDOW_DAYS = 14;
const BEST_SELLER_COUNT = 3;

export interface PublicProductBadges {
  avgRating: number;
  reviewCount: number;
  isNew: boolean;
  isBestSeller: boolean;
}

type PublicProductDetail = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_DETAIL_INCLUDE;
  omit: typeof PUBLIC_OMIT;
}> &
  PublicProductBadges;
type PublicProductListItem = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_LIST_INCLUDE;
  omit: typeof PUBLIC_OMIT;
}> &
  PublicProductBadges;

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
      : await generateUniqueSlug(dto.name, (candidate) =>
          this.slugExists(candidate),
        );

    const { tagIds, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        slug,
        ...(tagIds &&
          tagIds.length > 0 && {
            tags: { create: tagIds.map((tagId) => ({ tagId })) },
          }),
      },
      include: PRODUCT_DETAIL_INCLUDE,
    });
  }

  async findAll(
    query: QueryProductDto,
  ): Promise<PaginatedResult<ProductListItem>> {
    const where: Prisma.ProductWhereInput = {
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' },
      }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.status && { status: query.status }),
      ...(query.color && {
        color: { equals: query.color, mode: 'insensitive' },
      }),
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
  async findPublicList(
    query: QueryPublicProductDto,
  ): Promise<PaginatedResult<PublicProductListItem>> {
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
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' },
      }),
      ...(categoryId && { categoryId }),
      ...(query.color && {
        color: { equals: query.color, mode: 'insensitive' },
      }),
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
        omit: PUBLIC_OMIT,
        orderBy,
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.product.count({ where }),
    ]);

    const withBadges = await this.attachPublicBadges(data);
    return buildPaginatedResult(withBadges, total, query.page, query.limit);
  }

  async findPublicBySlug(slug: string): Promise<PublicProductDetail> {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'ACTIVE' },
      include: PRODUCT_DETAIL_INCLUDE,
      omit: PUBLIC_OMIT,
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    // Best-effort view counter — never blocks the response on failure.
    this.prisma.product
      .update({
        where: { id: product.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => undefined);

    const [withBadges] = await this.attachPublicBadges([product]);
    return withBadges;
  }

  /**
   * Adds avgRating/reviewCount (from approved reviews) and isNew/isBestSeller
   * flags to a batch of public product results — one groupBy query each,
   * not N+1 per product.
   */
  private async attachPublicBadges<T extends { id: string; createdAt: Date }>(
    products: T[],
  ): Promise<(T & PublicProductBadges)[]> {
    if (products.length === 0) return [];

    const productIds = products.map((p) => p.id);
    const [reviewAggregates, bestSellerIds] = await Promise.all([
      this.prisma.productReview.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds }, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      this.getBestSellerProductIds(),
    ]);

    const reviewByProductId = new Map(
      reviewAggregates.map((r) => [
        r.productId,
        { avg: r._avg.rating ?? 0, count: r._count.rating },
      ]),
    );
    const newSince = new Date(
      Date.now() - NEW_PRODUCT_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );

    return products.map((product) => ({
      ...product,
      avgRating: reviewByProductId.get(product.id)?.avg ?? 0,
      reviewCount: reviewByProductId.get(product.id)?.count ?? 0,
      isNew: product.createdAt >= newSince,
      isBestSeller: bestSellerIds.has(product.id),
    }));
  }

  /** Top N products by total quantity sold across completed orders (all-time). */
  private async getBestSellerProductIds(): Promise<Set<string>> {
    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: { productId: { not: null }, order: { status: 'COMPLETED' } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: BEST_SELLER_COUNT,
    });
    return new Set(
      grouped.map((g) => g.productId).filter((id): id is string => id !== null),
    );
  }

  async findRelatedProducts(
    slug: string,
    limit = 4,
  ): Promise<PublicProductListItem[]> {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'ACTIVE' },
      select: { id: true, categoryId: true },
    });

    if (!product) {
      return [];
    }

    const related = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        status: 'ACTIVE',
        id: { not: product.id },
      },
      include: PRODUCT_LIST_INCLUDE,
      omit: PUBLIC_OMIT,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return this.attachPublicBadges(related);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDetail> {
    const existing = await this.findOne(id);

    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId);
    }
    this.assertValidPricing(
      dto.basePrice ?? existing.basePrice,
      dto.salePrice ?? existing.salePrice ?? undefined,
    );

    const slug = dto.slug
      ? await this.assertSlugAvailable(dto.slug, id)
      : undefined;
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

    const orderItemCount = await this.prisma.orderItem.count({
      where: { productId: id },
    });
    if (orderItemCount > 0) {
      throw new ConflictException(
        'Sản phẩm đã có trong đơn hàng — hãy chuyển trạng thái sang ARCHIVED thay vì xoá.',
      );
    }

    const images = await this.prisma.productImage.findMany({
      where: { productId: id },
    });
    await this.prisma.product.delete({ where: { id } });
    await Promise.all(
      images
        .filter((image) => image.storageKey)
        .map((image) =>
          this.storageService
            .delete(image.storageKey as string)
            .catch(() => undefined),
        ),
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

    const currentCount = await this.prisma.productImage.count({
      where: { productId },
    });

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
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== productId) {
      throw new NotFoundException('Không tìm thấy ảnh sản phẩm');
    }

    await this.prisma.productImage.delete({ where: { id: imageId } });

    if (image.storageKey) {
      await this.storageService.delete(image.storageKey).catch(() => undefined);
    }
  }

  async setMaterials(
    productId: string,
    dto: SetProductMaterialsDto,
  ): Promise<ProductDetail> {
    await this.findOne(productId);

    const materialIds = dto.materials.map((item) => item.materialId);
    const foundMaterials = await this.prisma.material.findMany({
      where: { id: { in: materialIds } },
      select: { id: true },
    });
    const missing = materialIds.filter(
      (id) => !foundMaterials.some((m) => m.id === id),
    );
    if (missing.length > 0) {
      throw new NotFoundException(
        `Không tìm thấy vật tư: ${missing.join(', ')}`,
      );
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
    const existing = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    return !!existing && existing.id !== excludeId;
  }

  private async assertSlugAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<string> {
    const normalized = slug.trim().toLowerCase();
    if (await this.slugExists(normalized, excludeId)) {
      throw new ConflictException(`Slug "${normalized}" đã được sử dụng`);
    }
    return normalized;
  }
}
