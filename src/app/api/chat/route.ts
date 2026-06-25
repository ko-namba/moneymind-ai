import { toOpenAIUserMessage } from "@/lib/ai/errors";
import { jsonError, jsonOk } from "@/lib/api/response";
import { answerExpenseQuestion } from "@/lib/rag/chat";
import { chatRequestSchema } from "@/lib/validation/chat";
import { ZodError } from "zod";

export async function POST(request: Request) {
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

    const openAIMessage = toOpenAIUserMessage(error);
    if (openAIMessage) {
      console.error("POST /api/chat", error);
      return jsonError(openAIMessage, 429);
    }

    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        return jsonError(error.message, 503);
      }

      console.error("POST /api/chat", error);
      return jsonError(error.message, 422);
    }

    console.error("POST /api/chat", error);
    return jsonError("チャットの処理に失敗しました。", 500);
  }
}
