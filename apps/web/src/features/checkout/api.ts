import { apiClient } from "@/lib/api-client";
import { customerApiClient } from "@/lib/customer-api-client";
import type { CheckoutInput, CheckoutOrderResult, VoucherPreviewInput, VoucherPreviewResult } from "./types";

export async function createStorefrontOrder(input: CheckoutInput): Promise<CheckoutOrderResult> {
  const { data } = await customerApiClient.post<CheckoutOrderResult>(
    "/api/v1/storefront/orders",
    input,
  );
  return data;
}

export async function validateVoucher(input: VoucherPreviewInput): Promise<VoucherPreviewResult> {
  const { data } = await apiClient.post<VoucherPreviewResult>("/api/v1/vouchers/validate", input);
  return data;
}
