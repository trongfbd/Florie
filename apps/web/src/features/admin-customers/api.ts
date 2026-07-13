import { adminApiClient } from "@/lib/admin-api-client";
import type { CustomerDetail, PaginatedCustomers } from "./types";

export async function fetchCustomers(query: {
  page?: number;
  search?: string;
  isVip?: boolean;
}): Promise<PaginatedCustomers> {
  const { data } = await adminApiClient.get<PaginatedCustomers>("/api/v1/customers", { params: query });
  return data;
}

export async function fetchCustomer(id: string): Promise<CustomerDetail> {
  const { data } = await adminApiClient.get<CustomerDetail>(`/api/v1/customers/${id}`);
  return data;
}

export async function setCustomerVip(id: string, isVip: boolean): Promise<void> {
  await adminApiClient.patch(`/api/v1/customers/${id}/vip`, { isVip });
}

export async function addCustomerNote(id: string, content: string): Promise<CustomerDetail> {
  const { data } = await adminApiClient.post<CustomerDetail>(`/api/v1/customers/${id}/notes`, { content });
  return data;
}

export async function removeCustomerNote(id: string, noteId: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/customers/${id}/notes/${noteId}`);
}
