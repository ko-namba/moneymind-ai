import { z } from "zod";

export const chatHistoryItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

/** サーバーがプロンプトに使うのは直近6件のみ */
export const CHAT_HISTORY_LIMIT = 6;

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "質問を入力してください。")
    .max(1000, "質問は1000文字以内にしてください。"),
  history: z
    .array(chatHistoryItemSchema)
    .max(CHAT_HISTORY_LIMIT)
    .optional()
    .default([]),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
