import type { Metadata } from "next";
import { SalesAssistantContent } from "@/features/admin-ai/components/sales-assistant-content";

export const metadata: Metadata = { title: "Trợ lý bán hàng", robots: { index: false } };

export default function SalesAssistantPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Trợ lý bán hàng (AI)</h1>
      <SalesAssistantContent />
    </div>
  );
}
