export interface ReportSummary {
  from: string;
  to: string;
  revenue: number;
  completedOrderCount: number;
  orderCount: number;
  cancelledOrderCount: number;
  avgOrderValue: number;
  totalExpenses: number;
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
