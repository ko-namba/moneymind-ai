import { parseNaturalExpenseInput } from "@/lib/ai/parse-natural-expense";
import { toAIUserMessage, toOpenAIUserMessage } from "@/lib/ai/errors";
import { consumeAIRateLimit } from "@/lib/api/rate-limit";
import {
  jsonError,
  jsonOk,
  publicErrorMessage,
  rateLimitedResponse,
} from "@/lib/api/response";
import { naturalInputRequestSchema } from "@/lib/validation/natural-input";
import { ZodError } from "zod";

const AI_UNAVAILABLE_MESSAGE =
  "AI 機能が一時的に利用できません。しばらく待ってから再度お試しください。";

export async function POST(request: Request) {
  if (!consumeAIRateLimit(request, "natural-input")) {
    return rateLimitedResponse();
  }

  try {
    const body: unknown = await request.json();
    const { text } = naturalInputRequestSchema.parse(body);
    const parsed = await parseNaturalExpenseInput(text);

    return jsonOk({
      input: parsed.input,
      message: parsed.message,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "入力内容が不正です。";
      return jsonError(message, 400);
    }

    if (error instanceof Error) {
      const aiMessage = toAIUserMessage(error);
      if (aiMessage) {
        console.error("POST /api/natural-input", error);
        return jsonError(publicErrorMessage(aiMessage, AI_UNAVAILABLE_MESSAGE), 503);
      }

      const openAIMessage = toOpenAIUserMessage(error);
      if (openAIMessage) {
        console.error("POST /api/natural-input", error);
        return jsonError(publicErrorMessage(openAIMessage, AI_UNAVAILABLE_MESSAGE), 429);
      }

      // ルールベース解析の「金額を読み取れませんでした」等、利用者向けの案内文
      console.error("POST /api/natural-input", error);
      return jsonError(error.message, 422);
    }

    console.error("POST /api/natural-input", error);
    return jsonError("自然言語入力の解析に失敗しました。", 500);
  }
}
