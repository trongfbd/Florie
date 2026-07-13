import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async listApproved(productSlug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return this.prisma.productReview.findMany({
      where: { productId: product.id, isApproved: true },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(productSlug: string, customerId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const existing = await this.prisma.productReview.findFirst({
      where: { productId: product.id, customerId },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Bạn đã đánh giá sản phẩm này rồi');
    }

    // Link to the customer's most recent completed order containing this
    // product, if any — used to (eventually) badge "verified purchase".
    const purchaseOrderItem = await this.prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: { customerId, status: OrderStatus.COMPLETED },
      },
      orderBy: { order: { createdAt: 'desc' } },
      select: { orderId: true },
    });

    // No moderation queue exists yet (Admin UI is a later sprint), so
    // reviews are auto-approved for now; flipping isApproved to a manual
    // gate later doesn't require touching this creation logic.
    return this.prisma.productReview.create({
      data: {
        productId: product.id,
        customerId,
        orderId: purchaseOrderItem?.orderId,
        rating: dto.rating,
        comment: dto.comment,
        isApproved: true,
      },
    });
  }
}
