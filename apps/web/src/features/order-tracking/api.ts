import { customerApiClient } from "@/lib/customer-api-client";
import type { TrackedOrder } from "./types";

export async function trackOrder(orderNumber: string, phone: string): Promise<TrackedOrder> {
  const { data } = await customerApiClient.get<TrackedOrder>("/api/v1/storefront/orders/track", {
    params: { orderNumber, phone },
  });
  return data;
}
