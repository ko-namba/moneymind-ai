import { APIError } from "openai";

export function toOpenAIUserMessage(error: unknown): string | null {
  if (!(error instanceof APIError)) {
    return null;
  }

  const message = error.message.toLowerCase();

  if (error.status === 401) {
    return "OpenAI API キーが無効です。.env.local の OPENAI_API_KEY（sk- で始まる）を確認してください。";
  }

  if (error.status === 429) {
    if (message.includes("quota") || message.includes("billing")) {
      return [
        "OpenAI の利用枠（クレジット）が不足しています。",
        "https://platform.openai.com/settings/organization/billing で課金設定・残高を確認し、",
        "クレジットを追加してから再度お試しください。",
        "開発中は下の通常フォームから支出を登録できます。",
      ].join("");
    }

    return "OpenAI API のリクエスト制限に達しました。しばらく待ってから再度お試しください。";
  }

  if (error.status === 403) {
    return "OpenAI API へのアクセスが拒否されました。アカウントの権限と課金設定を確認してください。";
  }

  return null;
}
