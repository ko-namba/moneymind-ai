import type { Expense, ExpenseCategory, ExpenseInput, ExpenseUpdate } from "@/types/expense";
import type { ExpenseInputValidated } from "@/lib/validation/expense";

async function parseApiError(response: Response): Promise<string> {
  const data: unknown = await response.json().catch(() => null);
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }
  return "リクエストに失敗しました。";
}

export async function fetchExpenses(
  category?: ExpenseCategory,
): Promise<Expense[]> {
  const url = category
    ? `/api/expenses?category=${encodeURIComponent(category)}`
    : "/api/expenses";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data: { expenses: Expense[] } = await response.json();
  return data.expenses;
}

export async function createExpenseApi(input: ExpenseInput): Promise<Expense> {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data: { expense: Expense } = await response.json();
  return data.expense;
}

export async function updateExpenseApi(
  id: string,
  input: ExpenseUpdate,
): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data: { expense: Expense } = await response.json();
  return data.expense;
}

export async function deleteExpenseApi(id: string): Promise<void> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}

export type NaturalInputResponse = {
  input: ExpenseInputValidated;
  message: string;
};

export async function parseNaturalInputApi(
  text: string,
): Promise<NaturalInputResponse> {
  const response = await fetch("/api/natural-input", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}
