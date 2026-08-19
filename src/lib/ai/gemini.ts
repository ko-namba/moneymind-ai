import { GoogleGenAI, type GenerateContentParameters } from "@google/genai";

/** 利用制限の少ない順に試す Gemini モデル */
export const GEMINI_CHAT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
] as const;

export const GEMINI_CHAT_MODEL = GEMINI_CHAT_MODELS[0];

export function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY が設定されていません。.env.local に Google AI Studio の API キーを設定してください。",
    );
  }

  return new GoogleGenAI({ apiKey });
}

export function isGeminiQuotaError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  const status = (error as { status?: number }).status;

  return (
    status === 429 ||
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource exhausted")
  );
}

type GenerateContentRequest = Omit<GenerateContentParameters, "model"> & {
  model?: string;
};

/** モデルを順に試して Gemini API を呼び出す（無料枠超過時に別モデルへ切り替え） */
export async function generateGeminiContent(request: GenerateContentRequest) {
  const ai = createGeminiClient();
  const models = request.model
    ? [request.model]
    : [...GEMINI_CHAT_MODELS];

  let lastError: unknown;

  for (const model of models) {
    try {
      return await ai.models.generateContent({
        ...request,
        model,
      });
    } catch (error) {
      lastError = error;
      if (isGeminiQuotaError(error)) {
        console.warn(`Gemini モデル ${model} の利用制限。次のモデルを試します。`);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
