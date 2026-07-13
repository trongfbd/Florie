import { useMutation, useQuery } from "@tanstack/react-query";
import {
  askDashboardQa,
  askSalesAssistant,
  fetchAiStatus,
  fetchInventoryInsights,
  generateContent,
} from "./api";

export function useAiStatus() {
  return useQuery({ queryKey: ["admin-ai", "status"], queryFn: fetchAiStatus, staleTime: 5 * 60_000 });
}

export function useGenerateContent() {
  return useMutation({ mutationFn: generateContent });
}

export function useSalesAssistant() {
  return useMutation({ mutationFn: askSalesAssistant });
}

export function useDashboardQa() {
  return useMutation({ mutationFn: askDashboardQa });
}

export function useInventoryInsights(enabled: boolean) {
  return useQuery({
    queryKey: ["admin-ai", "inventory-insights"],
    queryFn: fetchInventoryInsights,
    enabled,
  });
}
