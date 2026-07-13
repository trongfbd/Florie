import { adminApiClient } from "@/lib/admin-api-client";

const DOWNLOAD_TIMEOUT_MS = 120_000;
const RESTORE_TIMEOUT_MS = 120_000;

function extractFilename(contentDisposition: string | undefined, fallback: string): string {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? fallback;
}

export async function downloadBackup(): Promise<void> {
  const response = await adminApiClient.get("/api/v1/backups/download", {
    responseType: "blob",
    timeout: DOWNLOAD_TIMEOUT_MS,
  });

  const filename = extractFilename(response.headers["content-disposition"], "florie-backup.sql");
  const url = URL.createObjectURL(response.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function restoreBackup(file: File, confirmation: string): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("confirmation", confirmation);

  await adminApiClient.post("/api/v1/backups/restore", formData, {
    timeout: RESTORE_TIMEOUT_MS,
  });
}
