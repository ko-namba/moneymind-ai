import { createSupabaseAdmin } from "@/lib/db/supabase";
import { embedText, embedTexts } from "@/lib/rag/embeddings";

type EmbeddingRow = {
  id: string;
  content: string;
};

export async function syncExpenseEmbedding(
  expenseId: string,
  content: string,
): Promise<void> {
  try {
    const embedding = await embedText(content);
    const supabase = createSupabaseAdmin();

    const { error } = await supabase
      .from("expense_embeddings")
      .update({ content, embedding })
      .eq("expense_id", expenseId);

    if (error) {
      console.error("syncExpenseEmbedding failed:", expenseId, error.message);
    }
  } catch (error) {
    console.error("syncExpenseEmbedding failed:", expenseId, error);
  }
}

export async function ensureExpenseEmbeddings(): Promise<number> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("expense_embeddings")
    .select("id, content")
    .is("embedding", null);

  if (error) {
    throw new Error(`embedding の取得に失敗しました: ${error.message}`);
  }

  const rows = (data ?? []) as EmbeddingRow[];
  if (rows.length === 0) {
    return 0;
  }

  const vectors = await embedTexts(rows.map((row) => row.content));

  await Promise.all(
    rows.map(async (row, index) => {
      const { error: updateError } = await supabase
        .from("expense_embeddings")
        .update({ embedding: vectors[index] })
        .eq("id", row.id);

      if (updateError) {
        throw new Error(
          `embedding の更新に失敗しました: ${updateError.message}`,
        );
      }
    }),
  );

  return rows.length;
}
