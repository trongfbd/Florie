import type { Metadata } from "next";
import { DashboardContent } from "@/features/admin-reports/components/dashboard-content";

export const metadata: Metadata = { title: "Tổng quan", robots: { index: false } };

export default function AdminDashboardPage() {
  return <DashboardContent />;
}
