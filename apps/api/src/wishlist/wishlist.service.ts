import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const WISHLIST_ITEM_INCLUDE = {
  product: {
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { displayOrder: 'asc' as const }, take: 1 },
    },
  },
};

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  list(customerId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { customerId },
      include: WISHLIST_ITEM_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(customerId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return this.prisma.wishlistItem.upsert({
      where: { customerId_productId: { customerId, productId } },
      create: { customerId, productId },
      update: {},
      include: WISHLIST_ITEM_INCLUDE,
    });
  }

  async remove(customerId: string, productId: string): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({ where: { customerId, productId } });
  }
}
