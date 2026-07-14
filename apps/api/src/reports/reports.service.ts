import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReportDateRangeDto } from './dto/report-date-range.dto';
import { RevenueSeriesQueryDto } from './dto/revenue-series-query.dto';
import { TopProductsQueryDto } from './dto/top-products-query.dto';
import { bucketKey } from './utils/date-bucket.util';

const DEFAULT_RANGE_DAYS = 30;

interface ResolvedRange {
  from: Date;
  to: Date;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(query: ReportDateRangeDto) {
    const { from, to } = this.resolveRange(query);

    const [completedOrders, orderItems, allOrdersCount, cancelledCount, expenseTotal, newCustomerCount] =
      await Promise.all([
        this.prisma.order.findMany({
          where: { status: OrderStatus.COMPLETED, createdAt: { gte: from, lte: to } },
          select: { total: true },
        }),
        this.prisma.orderItem.findMany({
          where: { order: { status: OrderStatus.COMPLETED, createdAt: { gte: from, lte: to } } },
          select: { quantity: true, costPrice: true },
        }),
        this.prisma.order.count({ where: { createdAt: { gte: from, lte: to } } }),
        this.prisma.order.count({
          where: { status: OrderStatus.CANCELLED, createdAt: { gte: from, lte: to } },
        }),
        this.prisma.expense.aggregate({
          where: { expenseDate: { gte: from, lte: to } },
          _sum: { amount: true },
        }),
        this.prisma.customer.count({ where: { createdAt: { gte: from, lte: to } } }),
      ]);

    const revenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalExpenses = expenseTotal._sum.amount ?? 0;

    // costPrice is only a snapshot from orders placed after the field was
    // introduced — cogs and grossProfit only reflect the items that actually
    // have one. costPriceCoverage tells the admin how much of the period's
    // items that covers, so a partial figure isn't mistaken for a complete one.
    const itemsWithCost = orderItems.filter((item) => item.costPrice != null);
    const cogs = itemsWithCost.reduce((sum, item) => sum + item.costPrice! * item.quantity, 0);
    const grossProfit = revenue - cogs;
    const costPriceCoverage = orderItems.length > 0 ? itemsWithCost.length / orderItems.length : null;

    return {
      from,
      to,
      revenue,
      completedOrderCount: completedOrders.length,
      orderCount: allOrdersCount,
      cancelledOrderCount: cancelledCount,
      avgOrderValue: completedOrders.length > 0 ? Math.round(revenue / completedOrders.length) : 0,
      totalExpenses,
      cogs,
      grossProfit,
      costPriceCoverage,
      netProfit: grossProfit - totalExpenses,
      newCustomerCount,
    };
  }

  async getRevenueSeries(query: RevenueSeriesQueryDto) {
    const { from, to } = this.resolveRange(query);

    const orders = await this.prisma.order.findMany({
      where: { status: OrderStatus.COMPLETED, createdAt: { gte: from, lte: to } },
      select: { createdAt: true, total: true },
    });

    const buckets = new Map<string, { revenue: number; orderCount: number }>();
    for (const order of orders) {
      const key = bucketKey(order.createdAt, query.groupBy);
      const current = buckets.get(key) ?? { revenue: 0, orderCount: 0 };
      current.revenue += order.total;
      current.orderCount += 1;
      buckets.set(key, current);
    }

    return Array.from(buckets.entries())
      .map(([date, value]) => ({ date, ...value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getExpensesByCategory(query: ReportDateRangeDto) {
    const { from, to } = this.resolveRange(query);

    const grouped = await this.prisma.expense.groupBy({
      by: ['category'],
      where: { expenseDate: { gte: from, lte: to } },
      _sum: { amount: true },
    });

    const byCategory = grouped
      .map((row) => ({ category: row.category, total: row._sum.amount ?? 0 }))
      .sort((a, b) => b.total - a.total);

    return { byCategory, total: byCategory.reduce((sum, row) => sum + row.total, 0) };
  }

  async getTopProducts(query: TopProductsQueryDto) {
    const { from, to } = this.resolveRange(query);

    const items = await this.prisma.orderItem.findMany({
      where: {
        productId: { not: null },
        order: { status: OrderStatus.COMPLETED, createdAt: { gte: from, lte: to } },
      },
      select: { productId: true, itemName: true, quantity: true, subtotal: true },
    });

    const byProduct = new Map<string, { productId: string; name: string; quantitySold: number; revenue: number }>();
    for (const item of items) {
      const productId = item.productId as string;
      const current = byProduct.get(productId) ?? {
        productId,
        name: item.itemName,
        quantitySold: 0,
        revenue: 0,
      };
      current.quantitySold += item.quantity;
      current.revenue += item.subtotal;
      byProduct.set(productId, current);
    }

    return Array.from(byProduct.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, query.limit);
  }

  async getOrderStatusBreakdown(query: ReportDateRangeDto) {
    const { from, to } = this.resolveRange(query);

    const grouped = await this.prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
    });

    const breakdown = Object.fromEntries(Object.values(OrderStatus).map((status) => [status, 0])) as Record<
      OrderStatus,
      number
    >;
    for (const row of grouped) {
      breakdown[row.status] = row._count._all;
    }

    return breakdown;
  }

  private resolveRange(query: ReportDateRangeDto): ResolvedRange {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000);

    return { from, to };
  }
}
