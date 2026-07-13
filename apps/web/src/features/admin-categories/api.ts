import { adminApiClient } from "@/lib/admin-api-client";
import type { Category, CategoryFormInput } from "./types";

export async function fetchCategories(): Promise<{ data: Category[] }> {
  const { data } = await adminApiClient.get<{ data: Category[] }>("/api/v1/categories", {
    params: { limit: 100 },
  });
  return data;
}

export async function fetchCategory(id: string): Promise<Category> {
  const { data } = await adminApiClient.get<Category>(`/api/v1/categories/${id}`);
  return data;
}

export async function createCategory(input: CategoryFormInput): Promise<Category> {
  const { data } = await adminApiClient.post<Category>("/api/v1/categories", input);
  return data;
}

export async function updateCategory(id: string, input: CategoryFormInput): Promise<Category> {
  const { data } = await adminApiClient.patch<Category>(`/api/v1/categories/${id}`, input);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/categories/${id}`);
}
