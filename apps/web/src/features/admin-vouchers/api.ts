import { adminApiClient } from "@/lib/admin-api-client";
import type { PaginatedVouchers, Voucher, VoucherFormInput } from "./types";

export async function fetchVouchers(query: { page?: number; limit?: number }): Promise<PaginatedVouchers> {
  const { data } = await adminApiClient.get<PaginatedVouchers>("/api/v1/vouchers", { params: query });
  return data;
}

export async function fetchVoucher(id: string): Promise<Voucher> {
  const { data } = await adminApiClient.get<Voucher>(`/api/v1/vouchers/${id}`);
  return data;
}

export async function createVoucher(input: VoucherFormInput): Promise<Voucher> {
  const { data } = await adminApiClient.post<Voucher>("/api/v1/vouchers", input);
  return data;
}

export async function updateVoucher(id: string, input: Partial<VoucherFormInput>): Promise<Voucher> {
  const { data } = await adminApiClient.patch<Voucher>(`/api/v1/vouchers/${id}`, input);
  return data;
}

export async function deleteVoucher(id: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/vouchers/${id}`);
}
