import { parseNaturalExpenseInput } from "@/lib/ai/parse-natural-expense";
import { toAIUserMessage, toOpenAIUserMessage } from "@/lib/ai/errors";
import { jsonError, jsonOk } from "@/lib/api/response";
import { naturalInputRequestSchema } from "@/lib/validation/natural-input";
import { ZodError } from "zod";

export async function POST(request: Request) {
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
        return jsonError(aiMessage, 503);
      }

      const openAIMessage = toOpenAIUserMessage(error);
      if (openAIMessage) {
        console.error("POST /api/natural-input", error);
        return jsonError(openAIMessage, 429);
      }

      console.error("POST /api/natural-input", error);
      return jsonError(error.message, 422);
    }

    console.error("POST /api/natural-input", error);
    return jsonError("自然言語入力の解析に失敗しました。", 500);
  }
}
