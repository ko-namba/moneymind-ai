import { z } from "zod";

export const naturalInputRequestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "入力内容を入力してください。")
    .max(500, "入力は500文字以内にしてください。"),
});

export type NaturalInputRequest = z.infer<typeof naturalInputRequestSchema>;
