import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProduct, deleteProduct, fetchProduct, fetchProducts, updateProduct } from "./api";
import type { ProductFormInput } from "./types";

const KEY = ["admin-products"];

export function useProducts(query: { page?: number; search?: string }) {
  return useQuery({ queryKey: [...KEY, query], queryFn: () => fetchProducts(query) });
}

export function useProduct(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchProduct(id), enabled: !!id });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductFormInput) => createProduct(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ProductFormInput>) => updateProduct(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
