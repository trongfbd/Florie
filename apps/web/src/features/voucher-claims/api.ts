import { apiClient } from "@/lib/api-client";
import { customerApiClient } from "@/lib/customer-api-client";
import type { Popup } from "@/features/marketing/types";
import type { ClaimedVoucher } from "./types";

/**
 * Uses the plain (unauthenticated-by-default) apiClient but still forwards the
 * customer's bearer token when present, so the backend can apply audience
 * targeting (new vs. returning customer) — guests get the public/new-customer view.
 */
export async function fetchActivePopup(accessToken: string | null): Promise<Popup | null> {
  const { data } = await apiClient.get<Popup | null>("/api/v1/storefront/popup", {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  return data;
}

export async function claimVoucher(popupId: string): Promise<ClaimedVoucher> {
  const { data } = await customerApiClient.post<ClaimedVoucher>(`/api/v1/storefront/vouchers/claim/${popupId}`);
  return data;
}

export async function fetchMyVouchers(): Promise<ClaimedVoucher[]> {
  const { data } = await customerApiClient.get<ClaimedVoucher[]>("/api/v1/storefront/vouchers/mine");
  return data;
}
