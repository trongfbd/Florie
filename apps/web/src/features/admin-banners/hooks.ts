import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBanner, deleteBanner, fetchBanner, fetchBanners, updateBanner } from "./api";
import type { BannerFormInput } from "./types";

const KEY = ["admin-banners"];

export function useBanners() {
  return useQuery({ queryKey: KEY, queryFn: fetchBanners });
}

export function useBanner(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchBanner(id), enabled: !!id });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BannerFormInput) => createBanner(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateBanner(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<BannerFormInput>) => updateBanner(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
