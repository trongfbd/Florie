import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createVoucher, deleteVoucher, fetchVoucher, fetchVouchers, updateVoucher } from "./api";
import type { VoucherFormInput } from "./types";

const KEY = ["admin-vouchers"];

export function useVouchers(query: { page?: number }) {
  return useQuery({ queryKey: [...KEY, query], queryFn: () => fetchVouchers(query) });
}

export function useVoucher(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchVoucher(id), enabled: !!id });
}

/** For pickers (popup voucher selection) — a flat list, not paginated UI. */
export function useVoucherOptions() {
  return useQuery({ queryKey: [...KEY, "options"], queryFn: () => fetchVouchers({ page: 1, limit: 100 }) });
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VoucherFormInput) => createVoucher(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateVoucher(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<VoucherFormInput>) => updateVoucher(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVoucher(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
