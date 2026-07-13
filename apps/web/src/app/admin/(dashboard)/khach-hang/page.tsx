import type { Metadata } from "next";
import { CustomersTable } from "@/features/admin-customers/components/customers-table";

export const metadata: Metadata = { title: "Khách hàng", robots: { index: false } };

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Khách hàng</h1>
      <CustomersTable />
    </div>
  );
}
