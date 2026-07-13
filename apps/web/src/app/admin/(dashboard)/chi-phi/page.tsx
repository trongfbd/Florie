import type { Metadata } from "next";
import Link from "next/link";
import { ExpensesTable } from "@/features/admin-expenses/components/expenses-table";

export const metadata: Metadata = { title: "Chi phí", robots: { index: false } };

export default function AdminExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Chi phí</h1>
        <Link
          href="/admin/chi-phi/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Ghi nhận chi phí
        </Link>
      </div>
      <ExpensesTable />
    </div>
  );
}
