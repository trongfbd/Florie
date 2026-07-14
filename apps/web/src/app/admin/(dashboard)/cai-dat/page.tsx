import type { Metadata } from "next";
import { SiteSettingsForm } from "@/features/admin-site-settings/components/site-settings-form";
import { InvoiceSettingsForm } from "@/features/admin-invoice-settings/components/invoice-settings-form";

export const metadata: Metadata = { title: "Cài đặt", robots: { index: false } };

export default function AdminSiteSettingsPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-heading">Cài đặt Pixel & Analytics</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Các mã này sẽ được nhúng vào mọi trang trên website để theo dõi lượt truy cập và quảng cáo.
          </p>
        </div>
        <SiteSettingsForm />
      </div>

      <div className="space-y-6 border-t border-secondary pt-10">
        <div>
          <h2 className="font-display text-3xl font-bold text-heading">Hóa đơn & Thuế</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Dùng để in hóa đơn cho đơn hàng và chuẩn bị sẵn cho hóa đơn điện tử sau này.
          </p>
        </div>
        <InvoiceSettingsForm />
      </div>
    </div>
  );
}
