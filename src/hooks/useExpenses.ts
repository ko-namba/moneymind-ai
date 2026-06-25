"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createExpenseApi,
  deleteExpenseApi,
  fetchExpenses,
  updateExpenseApi,
} from "@/lib/expenses/client";
import type { Expense, ExpenseInput } from "@/types/expense";

async function loadExpensesState(
  setExpenses: (expenses: Expense[]) => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
) {
  setLoading(true);
  try {
    const data = await fetchExpenses();
    setExpenses(data);
    setError(null);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "データの取得に失敗しました。",
    );
  } finally {
    setLoading(false);
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchExpenses()
      .then((data) => {
        if (cancelled) return;
        setExpenses(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました。",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback(async () => {
    await loadExpensesState(setExpenses, setError, setLoading);
  }, []);

  const addExpense = useCallback(
    async (input: ExpenseInput) => {
      await createExpenseApi(input);
      await reload();
    },
    [reload],
  );

  const removeExpense = useCallback(
    async (id: string) => {
      await deleteExpenseApi(id);
      await reload();
    },
    [reload],
  );

  const editExpense = useCallback(
    async (id: string, input: ExpenseInput) => {
      await updateExpenseApi(id, input);
      await reload();
    },
    [reload],
  );

  return {
    expenses,
    loading,
    error,
    reload,
    addExpense,
    removeExpense,
    editExpense,
  };
}
