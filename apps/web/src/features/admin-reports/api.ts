import { adminApiClient } from "@/lib/admin-api-client";
import type {
  ExpensesByCategoryResult,
  OrderStatusBreakdown,
  ReportSummary,
  RevenuePoint,
  TopProduct,
} from "./types";

export async function fetchSummary(): Promise<ReportSummary> {
  const { data } = await adminApiClient.get<ReportSummary>("/api/v1/reports/summary");
  return data;
}

export async function fetchRevenueSeries(): Promise<RevenuePoint[]> {
  const { data } = await adminApiClient.get<RevenuePoint[]>("/api/v1/reports/revenue-series", {
    params: { groupBy: "day" },
  });
  return data;
}

export async function fetchExpensesByCategory(): Promise<ExpensesByCategoryResult> {
  const { data } = await adminApiClient.get<ExpensesByCategoryResult>(
    "/api/v1/reports/expenses-by-category",
  );
  return data;
}

export async function fetchTopProducts(): Promise<TopProduct[]> {
  const { data } = await adminApiClient.get<TopProduct[]>("/api/v1/reports/top-products", {
    params: { limit: 5 },
  });
  return data;
}

export async function fetchOrderStatusBreakdown(): Promise<OrderStatusBreakdown> {
  const { data } = await adminApiClient.get<OrderStatusBreakdown>(
    "/api/v1/reports/order-status-breakdown",
  );
  return data;
}
