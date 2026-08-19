import OpenAI from "openai";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { EXPENSE_CATEGORIES } from "@/types/expense";

export const REGISTER_EXPENSE_TOOL_NAME = "register_expense";

export const registerExpenseTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: REGISTER_EXPENSE_TOOL_NAME,
    description:
      "ユーザーの自然言語入力から支出情報を抽出して登録用データを作成する。",
    parameters: {
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
  },
};

export function createOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY が設定されていません。.env.local に OpenAI の API キー（sk- で始まる）を設定してください。",
    );
  }

  if (apiKey.startsWith("sb_") || apiKey.startsWith("eyJ")) {
    throw new Error(
      "OPENAI_API_KEY に Supabase のキーが設定されています。OpenAI の API キー（sk- で始まる）を設定してください。",
    );
  }

  if (!apiKey.startsWith("sk-")) {
    throw new Error(
      "OPENAI_API_KEY の形式が不正です。https://platform.openai.com/api-keys で発行したキーを設定してください。",
    );
  }

  return new OpenAI({ apiKey });
}
