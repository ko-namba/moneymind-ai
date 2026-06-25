import { createSupabaseAdmin } from "@/lib/db/supabase";
import { listExpenses } from "@/lib/expenses/repository";
import {
  calcMonthlyComparison,
  calcTotal,
  filterExpensesByMonth,
} from "@/lib/expenses/summary";
import { embedText } from "@/lib/rag/embeddings";
import { ensureExpenseEmbeddings } from "@/lib/rag/sync-embedding";
import type { ChatSource } from "@/types/chat";

type MatchRow = {
  id: string;
  expense_id: string;
  content: string;
  similarity: number;
};

type ExpenseJoinRow = {
  amount: number;
  category: string;
  description: string;
  date: string;
};

export async function retrieveRelevantExpenses(
  query: string,
  limit = 5,
): Promise<ChatSource[]> {
  await ensureExpenseEmbeddings();

  const queryEmbedding = await embedText(query);
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase.rpc("match_expense_embeddings", {
    query_embedding: queryEmbedding,
    match_count: limit,
    match_threshold: 0.25,
  });

  if (error) {
    if (error.message.includes("match_expense_embeddings")) {
      throw new Error(
        "ベクトル検索関数が未設定です。Supabase SQL Editor で docs/supabase/rag-functions.sql を実行してください。",
      );
    }
    throw new Error(`ベクトル検索に失敗しました: ${error.message}`);
  }

  const matches = (data ?? []) as MatchRow[];
  if (matches.length === 0) {
    return [];
  }

  const expenseIds = matches.map((row) => row.expense_id);
  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select("id, amount, category, description, date")
    .in("id", expenseIds);

  if (expenseError) {
    throw new Error(`支出データの取得に失敗しました: ${expenseError.message}`);
  }

  const expenseMap = new Map(
    (expenses ?? []).map((row) => [row.id as string, row as ExpenseJoinRow & { id: string }]),
  );

  return matches
    .map((match) => {
      const expense = expenseMap.get(match.expense_id);
      if (!expense) {
        return null;
      }

      return {
        id: match.id,
        expenseId: match.expense_id,
        content: match.content,
        similarity: match.similarity,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: expense.date,
      };
    })
    .filter((source): source is ChatSource => source !== null);
}

export async function buildSummaryContext(): Promise<string> {
  const expenses = await listExpenses();
  const comparison = calcMonthlyComparison(expenses);
  const currentMonthExpenses = filterExpensesByMonth(
    expenses,
    comparison.year,
    comparison.month,
  );

  const categoryTotals = new Map<string, number>();
  for (const expense of currentMonthExpenses) {
    categoryTotals.set(
      expense.category,
      (categoryTotals.get(expense.category) ?? 0) + expense.amount,
    );
  }

  const categoryLines = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => `- ${category}: ${total.toLocaleString("ja-JP")}円`)
    .join("\n");

  return [
    `## 今月（${comparison.year}年${comparison.month}月）のサマリー`,
    `- 合計支出: ${comparison.currentTotal.toLocaleString("ja-JP")}円`,
    `- 前月合計: ${comparison.previousTotal.toLocaleString("ja-JP")}円`,
    `- 前月比: ${comparison.difference >= 0 ? "+" : ""}${comparison.difference.toLocaleString("ja-JP")}円`,
    `- 今月の件数: ${currentMonthExpenses.length}件`,
    categoryLines ? `### カテゴリ別\n${categoryLines}` : "",
    `- 全期間の登録件数: ${expenses.length}件（全期間合計 ${calcTotal(expenses).toLocaleString("ja-JP")}円）`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildRetrievedContext(sources: ChatSource[]): string {
  if (sources.length === 0) {
    return "（関連する支出データは見つかりませんでした）";
  }

  return sources
    .map(
      (source, index) =>
        `[引用${index + 1}] ${source.content}（類似度: ${(source.similarity * 100).toFixed(1)}%）`,
    )
    .join("\n");
}
