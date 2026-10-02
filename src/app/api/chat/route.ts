import { toAIUserMessage, toOpenAIUserMessage, isRecoverableAIError } from "@/lib/ai/errors";
import { consumeAIRateLimit } from "@/lib/api/rate-limit";
import {
  jsonError,
  jsonOk,
  publicErrorMessage,
  rateLimitedResponse,
} from "@/lib/api/response";
import { answerExpenseQuestion } from "@/lib/rag/chat";
import { chatRequestSchema } from "@/lib/validation/chat";
import { ZodError } from "zod";

const AI_UNAVAILABLE_MESSAGE =
  "AI 機能が一時的に利用できません。しばらく待ってから再度お試しください。";

export async function POST(request: Request) {
  if (!consumeAIRateLimit(request, "chat")) {
    return rateLimitedResponse();
  }

  try {
    const body: unknown = await request.json();
    const { message, history } = chatRequestSchema.parse(body);
    const result = await answerExpenseQuestion(message, history);

    return jsonOk(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "入力内容が不正です。";
      return jsonError(message, 400);
    }

    const aiMessage = toAIUserMessage(error);
    if (aiMessage) {
      console.error("POST /api/chat", error);
      return jsonError(publicErrorMessage(aiMessage, AI_UNAVAILABLE_MESSAGE), 503);
    }

    const openAIMessage = toOpenAIUserMessage(error);
    if (openAIMessage && !isRecoverableAIError(error)) {
      console.error("POST /api/chat", error);
      return jsonError(publicErrorMessage(openAIMessage, AI_UNAVAILABLE_MESSAGE), 429);
    }

    if (error instanceof Error) {
      console.error("POST /api/chat", error);
      return jsonError(publicErrorMessage(error, "チャットの処理に失敗しました。"), 422);
    }

    console.error("POST /api/chat", error);
    return jsonError("チャットの処理に失敗しました。", 500);
  }
}
