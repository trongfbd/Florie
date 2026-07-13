import { adminApiClient } from "@/lib/admin-api-client";
import type { Expense, ExpenseFormInput, PaginatedExpenses } from "./types";

export async function fetchExpenses(query: { page?: number }): Promise<PaginatedExpenses> {
  const { data } = await adminApiClient.get<PaginatedExpenses>("/api/v1/expenses", { params: query });
  return data;
}

export async function fetchExpense(id: string): Promise<Expense> {
  const { data } = await adminApiClient.get<Expense>(`/api/v1/expenses/${id}`);
  return data;
}

export async function createExpense(input: ExpenseFormInput): Promise<Expense> {
  const { data } = await adminApiClient.post<Expense>("/api/v1/expenses", input);
  return data;
}

export async function updateExpense(id: string, input: Partial<ExpenseFormInput>): Promise<Expense> {
  const { data } = await adminApiClient.patch<Expense>(`/api/v1/expenses/${id}`, input);
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/expenses/${id}`);
}
