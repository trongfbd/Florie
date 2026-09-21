import { adminApiClient } from "@/lib/admin-api-client";
import type {
  CreateOrderInput,
  OrderDetail,
  OrderImageRow,
  OrderStatus,
  PaginatedOrders,
  QueryOrdersInput,
  UpdateOrderInput,
  UpdatePaymentInput,
} from "./types";

export async function fetchOrders(query: QueryOrdersInput): Promise<PaginatedOrders> {
  const { data } = await adminApiClient.get<PaginatedOrders>("/api/v1/orders", { params: query });
  return data;
}

export async function fetchOrder(id: string): Promise<OrderDetail> {
  const { data } = await adminApiClient.get<OrderDetail>(`/api/v1/orders/${id}`);
  return data;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderDetail> {
  const { data } = await adminApiClient.post<OrderDetail>("/api/v1/orders", input);
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

export async function updateOrder(id: string, input: UpdateOrderInput): Promise<OrderDetail> {
  const { data } = await adminApiClient.patch<OrderDetail>(`/api/v1/orders/${id}`, input);
  return data;
}

export async function updateOrderPayment(id: string, input: UpdatePaymentInput): Promise<OrderDetail> {
  const { data } = await adminApiClient.patch<OrderDetail>(`/api/v1/orders/${id}/payment`, input);
  return data;
}

export async function updateItemCostPrice(
  orderId: string,
  itemId: string,
  costPrice: number,
): Promise<OrderDetail> {
  const { data } = await adminApiClient.patch<OrderDetail>(
    `/api/v1/orders/${orderId}/items/${itemId}/cost-price`,
    { costPrice },
  );
  return data;
}

export async function addOrderImage(
  orderId: string,
  file: File,
  altText?: string,
): Promise<OrderImageRow> {
  const formData = new FormData();
  formData.append("file", file);
  if (altText) formData.append("altText", altText);
  const { data } = await adminApiClient.post<OrderImageRow>(`/api/v1/orders/${orderId}/images`, formData, {
    timeout: 60_000,
  });
  return data;
}

export async function deleteOrderImage(orderId: string, imageId: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/orders/${orderId}/images/${imageId}`);
}
