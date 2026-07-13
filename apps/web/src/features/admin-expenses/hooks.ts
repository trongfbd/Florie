import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExpense, deleteExpense, fetchExpense, fetchExpenses, updateExpense } from "./api";
import type { ExpenseFormInput } from "./types";

const KEY = ["admin-expenses"];

export function useExpenses(query: { page?: number }) {
  return useQuery({ queryKey: [...KEY, query], queryFn: () => fetchExpenses(query) });
}

export function useExpense(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchExpense(id), enabled: !!id });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExpenseFormInput) => createExpense(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateExpense(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ExpenseFormInput>) => updateExpense(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
