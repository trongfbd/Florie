import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupplier, deleteSupplier, fetchSupplier, fetchSuppliers, updateSupplier } from "./api";
import type { SupplierFormInput } from "./types";

const KEY = ["admin-suppliers"];

export function useSuppliers(query: { page?: number; search?: string }) {
  return useQuery({ queryKey: [...KEY, query], queryFn: () => fetchSuppliers(query) });
}

export function useSupplier(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchSupplier(id), enabled: !!id });
}

/** For pickers (material supplier selection) — a flat list, not paginated UI. */
export function useSupplierOptions() {
  return useQuery({ queryKey: [...KEY, "options"], queryFn: () => fetchSuppliers({ page: 1, limit: 100 }) });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierFormInput) => createSupplier(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateSupplier(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierFormInput) => updateSupplier(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
