import { z } from "zod";
import { EXPENSE_CATEGORIES } from "@/types/expense";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const expenseInputSchema = z.object({
  amount: z.coerce
    .number({ message: "金額は数値で入力してください。" })
    .int("金額は整数で入力してください。")
    .positive("金額は1円以上で入力してください。")
    .max(10_000_000, "金額は1,000万円以下で入力してください。"),
  category: z.enum(EXPENSE_CATEGORIES, {
    message: "カテゴリが不正です。",
  }),
  description: z
    .string()
    .max(200, "メモは200文字以内で入力してください。")
    .default(""),
  date: z
    .string()
    .regex(dateRegex, "日付は YYYY-MM-DD 形式で入力してください。"),
});

export const expenseUpdateSchema = expenseInputSchema.partial();

export const expenseCategorySchema = z.enum(EXPENSE_CATEGORIES, {
  message: "カテゴリが不正です。",
});

export type ExpenseInputValidated = z.infer<typeof expenseInputSchema>;
