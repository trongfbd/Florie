import type { Metadata } from "next";
import { ExpenseForm } from "@/features/admin-expenses/components/expense-form";

export const metadata: Metadata = { title: "Ghi nhận chi phí", robots: { index: false } };

export default function NewExpensePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Ghi nhận chi phí</h1>
      <ExpenseForm />
    </div>
  );
}
