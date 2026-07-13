import type { Metadata } from "next";
import { SiteSettingsForm } from "@/features/admin-site-settings/components/site-settings-form";

export const metadata: Metadata = { title: "Cài đặt Pixel", robots: { index: false } };

export default function AdminSiteSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-heading">Cài đặt Pixel & Analytics</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Các mã này sẽ được nhúng vào mọi trang trên website để theo dõi lượt truy cập và quảng cáo.
        </p>
      </div>
      <SiteSettingsForm />
    </div>
  );
}
