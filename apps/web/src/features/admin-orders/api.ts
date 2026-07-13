import { adminApiClient } from "@/lib/admin-api-client";
import type { OrderDetail, OrderStatus, PaginatedOrders, QueryOrdersInput } from "./types";

export async function fetchOrders(query: QueryOrdersInput): Promise<PaginatedOrders> {
  const { data } = await adminApiClient.get<PaginatedOrders>("/api/v1/orders", { params: query });
  return data;
}

export async function fetchOrder(id: string): Promise<OrderDetail> {
  const { data } = await adminApiClient.get<OrderDetail>(`/api/v1/orders/${id}`);
  return data;
}

export async function changeOrderStatus(
  id: string,
  toStatus: OrderStatus,
  note?: string,
): Promise<OrderDetail> {
  const { data } = await adminApiClient.patch<OrderDetail>(`/api/v1/orders/${id}/status`, {
    toStatus,
    note,
  });
  return data;
}
