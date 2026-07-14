import { adminApiClient } from "./admin-api-client";

export type UploadFolder = "categories" | "blog" | "banners" | "combos" | "popups";

interface UploadResponse {
  key: string;
  url: string;
}

export async function uploadImage(file: File, folder: UploadFolder): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await adminApiClient.post<UploadResponse>(`/api/v1/uploads?folder=${folder}`, formData, {
    timeout: 60_000,
  });
  return data;
}
