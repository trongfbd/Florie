import { useQuery } from "@tanstack/react-query";
import {
  fetchExpensesByCategory,
  fetchOrderStatusBreakdown,
  fetchRevenueSeries,
  fetchSummary,
  fetchTopProducts,
} from "./api";

export function useReportSummary() {
  return useQuery({ queryKey: ["admin-reports", "summary"], queryFn: fetchSummary });
}

export function useRevenueSeries() {
  return useQuery({ queryKey: ["admin-reports", "revenue-series"], queryFn: fetchRevenueSeries });
}

export function useExpensesByCategory() {
  return useQuery({ queryKey: ["admin-reports", "expenses-by-category"], queryFn: fetchExpensesByCategory });
}

export function useTopProducts() {
  return useQuery({ queryKey: ["admin-reports", "top-products"], queryFn: fetchTopProducts });
}

export function useOrderStatusBreakdown() {
  return useQuery({ queryKey: ["admin-reports", "order-status-breakdown"], queryFn: fetchOrderStatusBreakdown });
}
