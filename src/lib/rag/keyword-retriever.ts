import { buildExpenseEmbeddingContent } from "@/lib/expenses/format";
import { listExpenses } from "@/lib/expenses/repository";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import type { ChatSource } from "@/types/chat";

function tokenize(query: string): string[] {
  const tokens = query
    .toLowerCase()
    .split(/[\s、。,.!?！？]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  for (const category of EXPENSE_CATEGORIES) {
    if (query.includes(category)) {
      tokens.push(category);
    }
  }

  return [...new Set(tokens)];
}

function scoreExpense(
  query: string,
  tokens: string[],
  haystack: string,
  category: string,
): number {
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += 1;
    }
  }

  for (const item of EXPENSE_CATEGORIES) {
    if (query.includes(item) && category === item) {
      score += 3;
    }
  }

  if (/(大きい|多い|高い|トップ|上位)/.test(query)) {
    score += 0;
  }

  return score;
}

/** embedding なしで動くキーワードベースの支出検索 */
export async function retrieveRelevantExpensesByKeyword(
  query: string,
  limit = 5,
): Promise<ChatSource[]> {
  const expenses = await listExpenses();
  const tokens = tokenize(query);

  const ranked = expenses
    .map((expense) => {
      const content = buildExpenseEmbeddingContent(expense);
      const haystack =
        `${content} ${expense.category} ${expense.description}`.toLowerCase();
      const score = scoreExpense(query, tokens, haystack, expense.category);

      return { expense, content, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.expense.amount - a.expense.amount;
    });

  const topMatches = ranked.slice(0, limit);

  if (topMatches.length === 0 && /(大きい|多い|高い|トップ|最近)/.test(query)) {
    return expenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit)
      .map((expense) => ({
        id: `keyword-${expense.id}`,
        expenseId: expense.id,
        content: buildExpenseEmbeddingContent(expense),
        similarity: 0.5,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: expense.date,
      }));
  }

  return topMatches.map((item) => ({
    id: `keyword-${item.expense.id}`,
    expenseId: item.expense.id,
    content: item.content,
    similarity: Math.min(item.score / Math.max(tokens.length, 1), 1),
    amount: item.expense.amount,
    category: item.expense.category,
    description: item.expense.description,
    date: item.expense.date,
  }));
}
