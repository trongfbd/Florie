import type { Metadata } from "next";
import { BannerForm } from "@/features/admin-banners/components/banner-form";

export const metadata: Metadata = { title: "Thêm banner", robots: { index: false } };

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Thêm banner</h1>
      <BannerForm />
    </div>
  );
}
