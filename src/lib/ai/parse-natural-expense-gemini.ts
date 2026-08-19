import {
  FunctionCallingConfigMode,
  type FunctionDeclaration,
} from "@google/genai";
import { REGISTER_EXPENSE_TOOL_NAME } from "@/lib/ai/openai";
import {
  generateGeminiContent,
} from "@/lib/ai/gemini";
import { todayDateString } from "@/lib/expenses/format";
import { expenseInputSchema } from "@/lib/validation/expense";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import type { ParsedNaturalExpense } from "@/lib/ai/parse-natural-expense";

const registerExpenseDeclaration: FunctionDeclaration = {
  name: REGISTER_EXPENSE_TOOL_NAME,
  description:
    "ユーザーの自然言語入力から支出情報を抽出して登録用データを作成する。",
  parametersJsonSchema: {
    type: "object",
    properties: {
      amount: {
        type: "integer",
        description: "支出金額（円）。整数で指定する。",
      },
      category: {
        type: "string",
        enum: [...EXPENSE_CATEGORIES],
        description: "支出カテゴリ。文脈から最も適切なものを選ぶ。",
      },
      description: {
        type: "string",
        description: "支出の内容・メモ（例: ランチ、電車代、映画）。",
      },
      date: {
        type: "string",
        description: "支出日（YYYY-MM-DD）。省略時は今日の日付。",
      },
    },
    required: ["amount", "category", "description", "date"],
    additionalProperties: false,
  },
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

/** Gemini API で自然言語入力を解析 */
export async function parseNaturalExpenseWithGemini(
  text: string,
): Promise<ParsedNaturalExpense> {
  const today = todayDateString();

  const response = await generateGeminiContent({
    contents: text,
    config: {
      systemInstruction: buildSystemPrompt(today),
      temperature: 0.2,
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: [REGISTER_EXPENSE_TOOL_NAME],
        },
      },
      tools: [{ functionDeclarations: [registerExpenseDeclaration] }],
    },
  });

  const functionCall = response.functionCalls?.[0];
  if (!functionCall?.name || !functionCall.args) {
    throw new Error(
      "支出情報を解析できませんでした。金額を含めて入力してください。",
    );
  }

  if (functionCall.name !== REGISTER_EXPENSE_TOOL_NAME) {
    throw new Error("支出情報の解析結果が不正です。");
  }

  const input = expenseInputSchema.parse(functionCall.args);
  const summary =
    response.text?.trim() ||
    `「${input.description}」を ${input.category} ${input.amount.toLocaleString("ja-JP")}円として解析しました（Gemini）。`;

  return { input, message: summary };
}
