import { adminApiClient } from "@/lib/admin-api-client";
import type { SiteSettings, SiteSettingsFormInput } from "./types";

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data } = await adminApiClient.get<SiteSettings>("/api/v1/site-settings");
  return data;
}

export async function updateSiteSettings(input: SiteSettingsFormInput): Promise<SiteSettings> {
  const { data } = await adminApiClient.patch<SiteSettings>("/api/v1/site-settings", input);
  return data;
}
