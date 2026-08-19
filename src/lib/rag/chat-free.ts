import { formatYen } from "@/lib/expenses/format";
import { listExpenses } from "@/lib/expenses/repository";
import {
  calcCategoryMonthlyComparisons,
  calcMonthlyComparison,
  filterExpensesByMonth,
} from "@/lib/expenses/summary";
import type { ChatSource } from "@/types/chat";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types/expense";

function detectCategory(question: string): ExpenseCategory | null {
  for (const category of EXPENSE_CATEGORIES) {
    if (question.includes(category)) {
      return category;
    }
  }
  return null;
}

type SourceLine = {
  date: string;
  category: string;
  description: string;
  amount: number;
};

function formatSourceLines(sources: SourceLine[]): string {
  return sources
    .slice(0, 5)
    .map(
      (source, index) =>
        `${index + 1}. ${source.date} ${source.category} ${source.description || "（メモなし）"} ${formatYen(source.amount)}`,
    )
    .join("\n");
}

/** OpenAI なしで動く、登録データに基づく回答生成 */
export async function answerExpenseQuestionFree(
  question: string,
  sources: ChatSource[],
): Promise<string> {
  const expenses = await listExpenses();
  const comparison = calcMonthlyComparison(expenses);
  const categoryComparisons = calcCategoryMonthlyComparisons(expenses);
  const currentMonthExpenses = filterExpensesByMonth(
    expenses,
    comparison.year,
    comparison.month,
  );
  const category = detectCategory(question);
  const categoryComparison = category
    ? categoryComparisons.find((item) => item.category === category)
    : undefined;

  if (/(いくら|合計|金額)/.test(question) && category && categoryComparison) {
    const monthTotal = categoryComparison.currentAmount;
    const diff = categoryComparison.difference;
    const diffText =
      diff === 0
        ? "前月と同じです。"
        : diff > 0
          ? `前月より ${formatYen(diff)} 増えています。`
          : `前月より ${formatYen(Math.abs(diff))} 減っています。`;

    return [
      `${comparison.year}年${comparison.month}月の${category}は ${formatYen(monthTotal)} です。`,
      diffText,
      monthTotal === 0
        ? "今月のこのカテゴリの支出はまだ登録されていません。"
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (/(増え|減|前月比|なぜ)/.test(question) && category && categoryComparison) {
    const { currentAmount, previousAmount, difference } = categoryComparison;

    if (previousAmount === 0 && currentAmount === 0) {
      return `${category}について、今月・前月ともに支出データがありません。`;
    }

    if (previousAmount === 0) {
      return `${comparison.year}年${comparison.month}月の${category}は ${formatYen(currentAmount)} です。前月は支出がなかったため、新たに発生した支出と考えられます。`;
    }

    const relatedSources = sources.filter((source) => source.category === category);
    const examples =
      relatedSources.length > 0
        ? `関連しそうな支出:\n${formatSourceLines(relatedSources)}`
        : "";

    return [
      `${category}は今月 ${formatYen(currentAmount)}、前月 ${formatYen(previousAmount)} で、差額は ${difference >= 0 ? "+" : ""}${formatYen(difference)} です。`,
      difference > 0
        ? "前月より支出が増えている状態です。"
        : difference < 0
          ? "前月より支出が減っている状態です。"
          : "前月と同水準です。",
      examples,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (/(今月|合計|総額|全体)/.test(question) && /(いくら|金額)/.test(question)) {
    return [
      `${comparison.year}年${comparison.month}月の支出合計は ${formatYen(comparison.currentTotal)} です。`,
      `前月は ${formatYen(comparison.previousTotal)} で、差額は ${comparison.difference >= 0 ? "+" : ""}${formatYen(comparison.difference)} です。`,
      `今月の登録件数は ${currentMonthExpenses.length} 件です。`,
    ].join("\n");
  }

  if (/(大きい|多い|高い|トップ|最近)/.test(question)) {
    const topExpenses =
      sources.length > 0
        ? sources
        : [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

    if (topExpenses.length === 0) {
      return "まだ支出が登録されていません。支出を登録してから再度質問してください。";
    }

    return [
      "金額の大きい支出は次のとおりです。",
      formatSourceLines(topExpenses),
    ].join("\n");
  }

  if (/(内訳|詳細|一覧)/.test(question) && category) {
    const categoryExpenses = currentMonthExpenses
      .filter((expense) => expense.category === category)
      .sort((a, b) => b.amount - a.amount);

    if (categoryExpenses.length === 0) {
      return `${comparison.year}年${comparison.month}月の${category}はまだ登録されていません。`;
    }

    const lines = categoryExpenses
      .slice(0, 8)
      .map(
        (expense, index) =>
          `${index + 1}. ${expense.date} ${expense.description || "（メモなし）"} ${formatYen(expense.amount)}`,
      )
      .join("\n");

    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return [
      `${comparison.year}年${comparison.month}月の${category}の内訳です（合計 ${formatYen(total)}）。`,
      lines,
    ].join("\n");
  }

  if (sources.length > 0) {
    return [
      "登録データから関連しそうな支出を見つけました。",
      formatSourceLines(sources),
      "より詳しく知りたい場合は、「今月の食費はいくら？」「交通費の内訳を教えて」のように質問してください。",
    ].join("\n");
  }

  return [
    `${comparison.year}年${comparison.month}月の支出合計は ${formatYen(comparison.currentTotal)} です。`,
    "カテゴリ名を含めて質問すると、より具体的にお答えできます。",
    "例: 「今月の食費はいくら？」「娯楽の内訳を教えて」",
  ].join("\n");
}
