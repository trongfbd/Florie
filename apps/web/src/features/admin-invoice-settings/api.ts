import { adminApiClient } from "@/lib/admin-api-client";
import type { InvoiceSettings, InvoiceSettingsFormInput } from "./types";

export async function fetchInvoiceSettings(): Promise<InvoiceSettings> {
  const { data } = await adminApiClient.get<InvoiceSettings>("/api/v1/invoice-settings");
  return data;
}

export async function updateInvoiceSettings(input: InvoiceSettingsFormInput): Promise<InvoiceSettings> {
  const { data } = await adminApiClient.patch<InvoiceSettings>("/api/v1/invoice-settings", input);
  return data;
}
