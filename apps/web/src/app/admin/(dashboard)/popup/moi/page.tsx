import type { Metadata } from "next";
import { PopupForm } from "@/features/admin-popups/components/popup-form";

export const metadata: Metadata = { title: "Thêm popup", robots: { index: false } };

export default function NewPopupPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Thêm popup</h1>
      <PopupForm />
    </div>
  );
}
