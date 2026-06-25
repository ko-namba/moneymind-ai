"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { expenseInputSchema } from "@/lib/validation/expense";
import type { Expense, ExpenseInput } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/types/expense";

type ExpenseFormInput = z.input<typeof expenseInputSchema>;
type ExpenseFormOutput = z.output<typeof expenseInputSchema>;

type ExpenseEditFormProps = {
  expense: Expense;
  onSubmit: (input: ExpenseInput) => Promise<void>;
  onCancel: () => void;
};

export function ExpenseEditForm({
  expense,
  onSubmit,
  onCancel,
}: ExpenseEditFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormOutput>({
    resolver: zodResolver(expenseInputSchema),
    defaultValues: {
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
    },
  });

  const handleFormSubmit = async (values: ExpenseFormOutput) => {
    setSubmitError(null);

    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "更新に失敗しました。",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="w-full space-y-4 mm-soft-surface p-4"
    >
      <p className="text-sm font-semibold" style={{ color: "var(--mf-text-strong)" }}>
        支出を編集
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`amount-${expense.id}`} className="mm-label">
            金額（円）
          </label>
          <input
            id={`amount-${expense.id}`}
            type="number"
            min={1}
            className="mm-input"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor={`date-${expense.id}`} className="mm-label">
            日付
          </label>
          <input
            id={`date-${expense.id}`}
            type="date"
            className="mm-input"
            {...register("date")}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor={`category-${expense.id}`} className="mm-label">
            カテゴリ
          </label>
          <select
            id={`category-${expense.id}`}
            className="mm-input"
            {...register("category")}
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`description-${expense.id}`} className="mm-label">
            メモ
          </label>
          <input
            id={`description-${expense.id}`}
            type="text"
            className="mm-input"
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {submitError && <p className="mm-alert-error">{submitError}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isSubmitting} className="mm-btn">
          {isSubmitting ? "保存中..." : "保存する"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="mm-btn-outline"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
