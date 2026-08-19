"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { todayDateString } from "@/lib/expenses/format";
import { expenseInputSchema } from "@/lib/validation/expense";
import type { ExpenseInput } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/types/expense";

type ExpenseFormInput = z.input<typeof expenseInputSchema>;
type ExpenseFormOutput = z.output<typeof expenseInputSchema>;

type ExpenseFormProps = {
  onSubmit: (input: ExpenseInput) => Promise<void>;
};

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormOutput>({
    resolver: zodResolver(expenseInputSchema),
    defaultValues: {
      amount: undefined,
      category: "食費",
      description: "",
      date: todayDateString(),
    },
  });

  const handleFormSubmit = async (values: ExpenseFormOutput) => {
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await onSubmit(values);
      reset({
        amount: undefined,
        category: values.category,
        description: "",
        date: todayDateString(),
      });
      setSuccessMessage("支出を登録しました。");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "登録に失敗しました。",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="mm-section">
      <h2 className="mm-section-title">支出を登録</h2>

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        <div>
          <label htmlFor="amount" className="mm-label">
            金額（円）
          </label>
          <input
            id="amount"
            type="number"
            min={1}
            placeholder="850"
            className="mm-input"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="mm-label">
            日付
          </label>
          <input id="date" type="date" className="mm-input" {...register("date")} />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="mm-label">
            カテゴリ
          </label>
          <select id="category" className="mm-input" {...register("category")}>
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
          <label htmlFor="description" className="mm-label">
            メモ
          </label>
          <input
            id="description"
            type="text"
            placeholder="ランチ、電車代など"
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
      {successMessage && <p className="mm-alert-success">{successMessage}</p>}

      <button type="submit" disabled={isSubmitting} className="mm-btn">
        {isSubmitting ? "登録中..." : "登録する"}
      </button>
    </form>
  );
}
