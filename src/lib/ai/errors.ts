import { APIError } from "openai";
import { isGeminiQuotaError } from "@/lib/ai/gemini";

export function isRecoverableAIError(error: unknown): boolean {
  if (isGeminiQuotaError(error)) {
    return true;
  }

  if (toOpenAIUserMessage(error)) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    error.name === "InsufficientQuotaError" ||
    message.includes("quota") ||
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("billing")
  );
}

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
        "GEMINI_API_KEY を設定するか、.env.local の OPENAI_API_KEY を削除して無料モードをご利用ください。",
      ].join("");
    }

    return "OpenAI API のリクエスト制限に達しました。しばらく待ってから再度お試しください。";
  }

  if (error.status === 403) {
    return "OpenAI API へのアクセスが拒否されました。アカウントの権限と課金設定を確認してください。";
  }

  return null;
}

export function toGeminiUserMessage(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const message = error.message.toLowerCase();

  if (
    message.includes("api key") ||
    message.includes("api_key") ||
    message.includes("invalid") ||
    message.includes("unauthenticated") ||
    message.includes("401") ||
    message.includes("403")
  ) {
    return [
      "Gemini API キーが無効です。",
      "https://aistudio.google.com/apikey でキーを発行し、",
      ".env.local の GEMINI_API_KEY に設定してから開発サーバーを再起動してください。",
      "（「AIza」または「AQ.」で始まる形式）",
    ].join("");
  }

  if (message.includes("429") || message.includes("quota")) {
    return "Gemini API の利用制限に達しました。しばらく待ってから再度お試しください。";
  }

  return null;
}

export function toAIUserMessage(error: unknown): string | null {
  return toGeminiUserMessage(error) ?? toOpenAIUserMessage(error);
}
