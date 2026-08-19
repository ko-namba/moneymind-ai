import {
  updateExpense,
  deleteExpense,
} from "@/lib/expenses/repository";
import { jsonError, jsonOk } from "@/lib/api/response";
import { expenseUpdateSchema } from "@/lib/validation/expense";
import { ZodError } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  return uuidRegex.test(id);
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidUuid(id)) {
      return jsonError("支出IDが不正です。", 400);
    }

    const body: unknown = await request.json();
    const input = expenseUpdateSchema.parse(body);

    if (Object.keys(input).length === 0) {
      return jsonError("更新する項目がありません。", 400);
    }

    const expense = await updateExpense(id, input);
    return jsonOk({ expense });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "入力内容が不正です。";
      return jsonError(message, 400);
    }
    console.error("PUT /api/expenses/[id]", error);
    return jsonError(
      error instanceof Error ? error.message : "支出の更新に失敗しました。",
      500,
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidUuid(id)) {
      return jsonError("支出IDが不正です。", 400);
    }

    await deleteExpense(id);
    return jsonOk({ success: true });
  } catch (error) {
    console.error("DELETE /api/expenses/[id]", error);
    return jsonError(
      error instanceof Error ? error.message : "支出の削除に失敗しました。",
      500,
    );
  }
}
