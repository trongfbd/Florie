export interface Expense {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  expenseDate: string;
  note: string | null;
  createdBy: { id: string; name: string } | null;
}

export interface ExpenseFormInput {
  category: string;
  description?: string;
  amount: number;
  expenseDate?: string;
  note?: string;
}

export interface PaginatedExpenses {
  data: Expense[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
