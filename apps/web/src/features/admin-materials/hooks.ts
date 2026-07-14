import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMaterial,
  deleteMaterial,
  fetchMaterial,
  fetchMaterials,
  importMaterialStock,
  updateMaterial,
} from "./api";
import type { ImportStockInput, MaterialFormInput } from "./types";

const KEY = ["admin-materials"];

export function useMaterials(query: { page?: number; search?: string; lowStock?: boolean }) {
  return useQuery({ queryKey: [...KEY, query], queryFn: () => fetchMaterials(query) });
}

export function useMaterial(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchMaterial(id), enabled: !!id });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MaterialFormInput) => createMaterial(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateMaterial(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MaterialFormInput) => updateMaterial(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMaterial(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useImportMaterialStock(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ImportStockInput) => importMaterialStock(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
