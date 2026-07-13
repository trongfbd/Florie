import type { Metadata } from "next";
import { CalendarGrid } from "@/features/admin-delivery-calendar/components/calendar-grid";

export const metadata: Metadata = { title: "Lịch giao hàng", robots: { index: false } };

export default function AdminDeliveryCalendarPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Lịch giao hàng</h1>
      <CalendarGrid />
    </div>
  );
}
