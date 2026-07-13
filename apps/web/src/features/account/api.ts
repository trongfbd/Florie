import { customerApiClient } from "@/lib/customer-api-client";
import type { PaginatedResult } from "@/features/storefront/types";

export interface MyOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  deliveryDate: string;
  createdAt: string;
}

export async function fetchMyOrders(): Promise<PaginatedResult<MyOrderSummary>> {
  const { data } = await customerApiClient.get<PaginatedResult<MyOrderSummary>>(
    "/api/v1/storefront/orders/mine",
    { params: { limit: 20 } },
  );
  return data;
}
