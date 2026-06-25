import { buildExpenseEmbeddingContent, mapRowToExpense } from "@/lib/expenses/format";
import { formatSupabaseConnectionError } from "@/lib/db/connection-error";
import { createSupabaseAdmin } from "@/lib/db/supabase";
import { syncExpenseEmbedding } from "@/lib/rag/sync-embedding";
import type { Expense, ExpenseInput } from "@/types/expense";
import type { ExpenseInputValidated } from "@/lib/validation/expense";

type ExpenseRow = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
};

export async function listExpenses(category?: string): Promise<Expense[]> {
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      formatSupabaseConnectionError("支出一覧の取得に失敗しました。", error),
    );
  }

  return (data as ExpenseRow[]).map(mapRowToExpense);
}

export async function createExpense(input: ExpenseInputValidated): Promise<Expense> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      amount: input.amount,
      category: input.category,
      description: input.description,
      date: input.date,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`支出の登録に失敗しました: ${error?.message ?? "不明"}`);
  }

  const expense = mapRowToExpense(data as ExpenseRow);
  const content = buildExpenseEmbeddingContent(expense);

  const { error: embeddingError } = await supabase.from("expense_embeddings").insert({
    expense_id: expense.id,
    content,
    embedding: null,
  });

  if (embeddingError) {
    await supabase.from("expenses").delete().eq("id", expense.id);
    throw new Error(
      `支出メタデータの登録に失敗しました: ${embeddingError.message}`,
    );
  }

  await syncExpenseEmbedding(expense.id, content);

  return expense;
}

export async function updateExpense(
  id: string,
  input: Partial<ExpenseInput>,
): Promise<Expense> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("expenses")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`支出の更新に失敗しました: ${error?.message ?? "不明"}`);
  }

  const expense = mapRowToExpense(data as ExpenseRow);
  const content = buildExpenseEmbeddingContent(expense);

  const { error: embeddingError } = await supabase
    .from("expense_embeddings")
    .update({ content, embedding: null })
    .eq("expense_id", id);

  if (embeddingError) {
    throw new Error(
      `支出メタデータの更新に失敗しました: ${embeddingError.message}`,
    );
  }

  await syncExpenseEmbedding(id, content);

  return expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) {
    throw new Error(`支出の削除に失敗しました: ${error.message}`);
  }
}
