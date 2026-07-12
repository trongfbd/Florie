import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { HealthResponse } from "./types";

async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>("/api/v1/health");
  return data;
}

export function useHealthQuery() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 15_000,
  });
}
