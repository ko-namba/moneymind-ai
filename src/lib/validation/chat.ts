import { z } from "zod";

export const chatHistoryItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "質問を入力してください。")
    .max(1000, "質問は1000文字以内にしてください。"),
  history: z.array(chatHistoryItemSchema).max(20).optional().default([]),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
