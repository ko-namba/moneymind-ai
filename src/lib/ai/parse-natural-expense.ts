import {
  createOpenAIClient,
  REGISTER_EXPENSE_TOOL_NAME,
  registerExpenseTool,
} from "@/lib/ai/openai";
import { todayDateString } from "@/lib/expenses/format";
import { expenseInputSchema } from "@/lib/validation/expense";
import type { ExpenseInputValidated } from "@/lib/validation/expense";
import { EXPENSE_CATEGORIES } from "@/types/expense";

export type ParsedNaturalExpense = {
  input: ExpenseInputValidated;
  message: string;
};

function buildSystemPrompt(today: string): string {
  return [
    "あなたは日本の家計簿アシスタントです。",
    "ユーザーの自然言語入力から支出情報を読み取り、register_expense 関数を必ず1回呼び出してください。",
    "",
    "ルール:",
    `- 今日の日付: ${today}`,
    "- 金額は「500円」「1,200」などから整数（円）を抽出する",
    `- カテゴリは次のいずれか: ${EXPENSE_CATEGORIES.join(" / ")}`,
    "- ランチ・食事・カフェ → 食費、電車・バス・タクシー → 交通、映画・ゲーム → 娯楽",
    "- 日付が書かれていなければ今日の日付を使う",
    "- description は短く具体的に（例: ランチ、スタバ、映画館）",
    "- 金額が読み取れない場合は推測せず、可能な限り文脈から判断する",
  ].join("\n");
}

export async function parseNaturalExpenseInput(
  text: string,
): Promise<ParsedNaturalExpense> {
  const client = createOpenAIClient();
  const today = todayDateString();

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: buildSystemPrompt(today) },
      { role: "user", content: text },
    ],
    tools: [registerExpenseTool],
    tool_choice: {
      type: "function",
      function: { name: REGISTER_EXPENSE_TOOL_NAME },
    },
  });

  const message = completion.choices[0]?.message;
  const toolCall = message?.tool_calls?.[0];

  if (!toolCall || toolCall.type !== "function") {
    throw new Error(
      "支出情報を解析できませんでした。金額を含めて入力してください。",
    );
  }

  if (toolCall.function.name !== REGISTER_EXPENSE_TOOL_NAME) {
    throw new Error("支出情報の解析結果が不正です。");
  }

  let rawArgs: unknown;
  try {
    rawArgs = JSON.parse(toolCall.function.arguments);
  } catch {
    throw new Error("支出情報の解析結果を読み取れませんでした。");
  }

  const input = expenseInputSchema.parse(rawArgs);
  const summary =
    message.content?.trim() ||
    `「${input.description}」を ${input.category} ${input.amount.toLocaleString("ja-JP")}円として解析しました。`;

  return { input, message: summary };
}
