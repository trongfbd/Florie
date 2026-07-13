import type { Metadata } from "next";
import { EditExpenseContent } from "@/features/admin-expenses/components/edit-expense-content";

export const metadata: Metadata = { title: "Sửa chi phí", robots: { index: false } };

interface EditExpensePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sửa chi phí</h1>
      <EditExpenseContent id={id} />
    </div>
  );
}
