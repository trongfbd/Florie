export interface SiteSettings {
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
}

export interface SiteSettingsFormInput {
  facebookPixelId?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
}
