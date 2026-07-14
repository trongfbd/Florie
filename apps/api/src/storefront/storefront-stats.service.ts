import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Homepage "social proof" numbers — real counts, never fabricated placeholders. */
@Injectable()
export class StorefrontStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalCustomers, totalCompletedOrders, ratingAgg] = await Promise.all(
      [
        this.prisma.customer.count(),
        this.prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
        this.prisma.productReview.aggregate({
          where: { isApproved: true },
          _avg: { rating: true },
          _count: { rating: true },
        }),
      ],
    );

    return {
      totalCustomers,
      totalCompletedOrders,
      avgRating: ratingAgg._avg.rating ?? 0,
      totalReviews: ratingAgg._count.rating,
    };
  }
}
