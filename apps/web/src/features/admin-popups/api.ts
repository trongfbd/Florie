import { adminApiClient } from "@/lib/admin-api-client";
import type { PaginatedPopups, Popup, PopupFormInput } from "./types";

export async function fetchPopups(): Promise<PaginatedPopups> {
  const { data } = await adminApiClient.get<PaginatedPopups>("/api/v1/popups", { params: { limit: 100 } });
  return data;
}

export async function fetchPopup(id: string): Promise<Popup> {
  const { data } = await adminApiClient.get<Popup>(`/api/v1/popups/${id}`);
  return data;
}

export async function createPopup(input: PopupFormInput): Promise<Popup> {
  const { data } = await adminApiClient.post<Popup>("/api/v1/popups", input);
  return data;
}

export async function updatePopup(id: string, input: Partial<PopupFormInput>): Promise<Popup> {
  const { data } = await adminApiClient.patch<Popup>(`/api/v1/popups/${id}`, input);
  return data;
}

export async function deletePopup(id: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/popups/${id}`);
}
