import { SAMPLE_EXPENSES } from "@/data/sample-expenses";
import { formatSupabaseConnectionError } from "@/lib/db/connection-error";
import { createSupabaseAdmin } from "@/lib/db/supabase";
import { buildExpenseEmbeddingContent, mapRowToExpense } from "@/lib/expenses/format";
import { ensureExpenseEmbeddings } from "@/lib/rag/sync-embedding";

type SeedResult = {
  inserted: number;
  embeddingsSynced: number;
  message: string;
};

export async function seedSampleExpenses(options?: {
  force?: boolean;
  withEmbeddings?: boolean;
}): Promise<SeedResult> {
  const supabase = createSupabaseAdmin();

  const { count, error: countError } = await supabase
    .from("expenses")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(
      formatSupabaseConnectionError("支出件数の確認に失敗しました。", countError),
    );
  }

  if ((count ?? 0) > 0 && !options?.force) {
    return {
      inserted: 0,
      embeddingsSynced: 0,
      message: `既に ${count} 件の支出があります。上書きする場合は force: true を指定してください。`,
    };
  }

  if (options?.force && (count ?? 0) > 0) {
    const { error: deleteError } = await supabase
      .from("expenses")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      throw new Error(`既存データの削除に失敗しました: ${deleteError.message}`);
    }
  }

  const { data: insertedExpenses, error: insertError } = await supabase
    .from("expenses")
    .insert(SAMPLE_EXPENSES)
    .select("*");

  if (insertError || !insertedExpenses) {
    throw new Error(
      `サンプルデータの投入に失敗しました: ${insertError?.message ?? "不明"}`,
    );
  }

  const embeddingRows = insertedExpenses.map((row) => {
    const expense = mapRowToExpense({
      id: row.id as string,
      amount: row.amount as number,
      category: row.category as string,
      description: row.description as string,
      date: row.date as string,
      created_at: row.created_at as string,
    });

    return {
      expense_id: expense.id,
      content: buildExpenseEmbeddingContent(expense),
      embedding: null,
    };
  });

  const { error: embeddingError } = await supabase
    .from("expense_embeddings")
    .insert(embeddingRows);

  if (embeddingError) {
    throw new Error(
      `メタデータの投入に失敗しました: ${embeddingError.message}`,
    );
  }

  let embeddingsSynced = 0;
  if (options?.withEmbeddings) {
    embeddingsSynced = await ensureExpenseEmbeddings();
  }

  return {
    inserted: insertedExpenses.length,
    embeddingsSynced,
    message: `${insertedExpenses.length} 件のサンプル支出を投入しました。`,
  };
}
