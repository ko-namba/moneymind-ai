import { listExpenses, createExpense } from "@/lib/expenses/repository";
import { jsonError, jsonOk } from "@/lib/api/response";
import {
  expenseCategorySchema,
  expenseInputSchema,
} from "@/lib/validation/expense";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category") ?? undefined;

    const category = categoryParam
      ? expenseCategorySchema.parse(categoryParam)
      : undefined;

    const expenses = await listExpenses(category);
    return jsonOk({ expenses });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("カテゴリが不正です。", 400);
    }
    console.error("GET /api/expenses", error);
    return jsonError(
      error instanceof Error ? error.message : "支出一覧の取得に失敗しました。",
      500,
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = expenseInputSchema.parse(body);
    const expense = await createExpense(input);
    return jsonOk({ expense }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "入力内容が不正です。";
      return NextResponse.json(
        {
          error: message,
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }
    console.error("POST /api/expenses", error);
    return jsonError(
      error instanceof Error ? error.message : "支出の登録に失敗しました。",
      500,
    );
  }
}
