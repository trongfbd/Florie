import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCombo, deleteCombo, fetchCombo, fetchCombos, updateCombo } from "./api";
import type { ComboFormInput } from "./types";

const KEY = ["admin-combos"];

export function useCombos(query: { page?: number }) {
  return useQuery({ queryKey: [...KEY, query], queryFn: () => fetchCombos(query) });
}

export function useCombo(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchCombo(id), enabled: !!id });
}

export function useCreateCombo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ComboFormInput) => createCombo(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCombo(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ComboFormInput>) => updateCombo(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCombo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCombo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
