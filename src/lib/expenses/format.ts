import type { Expense, ExpenseInput } from "@/types/expense";

/** 金額を日本円表記にフォーマット */
export function formatYen(amount: number): string {
  return `${amount.toLocaleString("ja-JP")}円`;
}

/** 今日の日付を YYYY-MM-DD 形式で返す（ローカルタイムゾーン） */
export function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** RAG 検索用のテキスト形式（Phase 4 で embedding 生成に使用） */
export function buildExpenseEmbeddingContent(
  expense: Pick<ExpenseInput, "date" | "category" | "description" | "amount">,
): string {
  const description = expense.description.trim() || "（メモなし）";
  return `${expense.date} | ${expense.category} | ${description} | ${expense.amount}円`;
}

/** Supabase の行を Expense 型に変換 */
export function mapRowToExpense(row: {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}): Expense {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category as Expense["category"],
    description: row.description,
    date: row.date,
    created_at: row.created_at,
  };
}
