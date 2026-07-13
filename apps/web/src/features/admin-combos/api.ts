import { adminApiClient } from "@/lib/admin-api-client";
import type { Combo, ComboFormInput, PaginatedCombos } from "./types";

export async function fetchCombos(query: { page?: number }): Promise<PaginatedCombos> {
  const { data } = await adminApiClient.get<PaginatedCombos>("/api/v1/combos", { params: query });
  return data;
}

export async function fetchCombo(id: string): Promise<Combo> {
  const { data } = await adminApiClient.get<Combo>(`/api/v1/combos/${id}`);
  return data;
}

export async function createCombo(input: ComboFormInput): Promise<Combo> {
  const { data } = await adminApiClient.post<Combo>("/api/v1/combos", input);
  return data;
}

export async function updateCombo(id: string, input: Partial<ComboFormInput>): Promise<Combo> {
  const { data } = await adminApiClient.patch<Combo>(`/api/v1/combos/${id}`, input);
  return data;
}

export async function deleteCombo(id: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/combos/${id}`);
}
