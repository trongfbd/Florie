"use client";

import { useExpense } from "../hooks";
import { ExpenseForm } from "./expense-form";

export function EditExpenseContent({ id }: { id: string }) {
  const { data: expense, isLoading } = useExpense(id);

  if (isLoading || !expense) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return <ExpenseForm expense={expense} />;
}
