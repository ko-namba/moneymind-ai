export const EXPENSE_CATEGORIES = [
  "食費",
  "交通",
  "娯楽",
  "日用品",
  "医療",
  "その他",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type Expense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  created_at: string;
};

export type ExpenseInput = {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
};

export type ExpenseUpdate = Partial<ExpenseInput>;

export type ExpenseEmbedding = {
  id: string;
  expense_id: string;
  content: string;
  embedding: number[] | null;
  created_at: string;
};
