import { customerApiClient } from "@/lib/customer-api-client";
import type { CheckoutInput, CheckoutOrderResult } from "./types";

export async function createStorefrontOrder(input: CheckoutInput): Promise<CheckoutOrderResult> {
  const { data } = await customerApiClient.post<CheckoutOrderResult>(
    "/api/v1/storefront/orders",
    input,
  );
  return data;
}
