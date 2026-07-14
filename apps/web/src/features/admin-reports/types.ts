export interface ReportSummary {
  from: string;
  to: string;
  revenue: number;
  completedOrderCount: number;
  orderCount: number;
  cancelledOrderCount: number;
  avgOrderValue: number;
  totalExpenses: number;
  /** Cost of goods sold — only sums order items that had a costPrice snapshot. */
  cogs: number;
  grossProfit: number;
  /** Fraction (0-1) of the period's order items that had a costPrice set; null if no items. */
  costPriceCoverage: number | null;
  netProfit: number;
  newCustomerCount: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface ExpensesByCategoryResult {
  byCategory: { category: string; total: number }[];
  total: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export type OrderStatusBreakdown = Record<
  "NEW" | "CONFIRMED" | "ARRANGING" | "SHIPPING" | "COMPLETED" | "CANCELLED",
  number
>;
