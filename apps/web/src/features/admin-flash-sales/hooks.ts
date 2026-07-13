import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFlashSale, deleteFlashSale, fetchFlashSale, fetchFlashSales, updateFlashSale } from "./api";
import type { FlashSaleFormInput } from "./types";

const KEY = ["admin-flash-sales"];

export function useFlashSales(query: { page?: number }) {
  return useQuery({ queryKey: [...KEY, query], queryFn: () => fetchFlashSales(query) });
}

export function useFlashSale(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchFlashSale(id), enabled: !!id });
}

export function useCreateFlashSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FlashSaleFormInput) => createFlashSale(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateFlashSale(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<FlashSaleFormInput>) => updateFlashSale(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteFlashSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFlashSale(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
