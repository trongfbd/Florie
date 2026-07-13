import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  fetchCategory,
  updateCategory,
} from "./api";
import type { CategoryFormInput } from "./types";

const KEY = ["admin-categories"];

export function useCategories() {
  return useQuery({ queryKey: KEY, queryFn: fetchCategories });
}

export function useCategory(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchCategory(id), enabled: !!id });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryFormInput) => createCategory(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryFormInput) => updateCategory(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
