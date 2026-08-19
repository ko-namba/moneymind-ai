"use client";

import { useMemo } from "react";
import { CATEGORY_COLORS } from "@/lib/expenses/chart-colors";
import { formatYen } from "@/lib/expenses/format";
import { calcCategoryTotals } from "@/lib/expenses/summary";
import type { Expense, ExpenseCategory } from "@/types/expense";

type CategoryBreakdownPickerProps = {
  expenses: Expense[];
  title?: string;
  onSelectCategory: (category: ExpenseCategory) => void;
};

/** カテゴリ別の合計を表示し、クリックで内訳モーダルを開く */
export function CategoryBreakdownPicker({
  expenses,
  title = "カテゴリ別内訳",
  onSelectCategory,
}: CategoryBreakdownPickerProps) {
  const categoryTotals = useMemo(
    () =>
      [...calcCategoryTotals(expenses)].sort((a, b) => b.amount - a.amount),
    [expenses],
  );

  const expensesByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, Expense[]>();
    for (const expense of expenses) {
      const list = map.get(expense.category);
      if (list) {
        list.push(expense);
      } else {
        map.set(expense.category, [expense]);
      }
    }
    return map;
  }, [expenses]);

  if (categoryTotals.length === 0) {
    return null;
  }

  return (
    <div className="mm-section">
      <h2 className="mm-section-title">{title}</h2>
      <ul className="flex flex-wrap gap-2.5">
        {categoryTotals.map((item) => {
          const color = CATEGORY_COLORS[item.category];
          const count = expensesByCategory.get(item.category)?.length ?? 0;

          return (
            <li key={item.category}>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-left text-sm"
                style={{
                  borderRadius: "var(--mf-radius-md)",
                  backgroundColor: "var(--mf-surface)",
                  border: "1px solid var(--mf-border)",
                  transition:
                    "transform 0.85s var(--mm-ease-smooth), box-shadow 0.85s var(--mm-ease-smooth)",
                }}
                onClick={() => onSelectCategory(item.category)}
                aria-label={`${item.category} の内訳を見る`}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <span>
                  <span
                    className="block font-semibold"
                    style={{ color: "var(--mf-text-strong)" }}
                  >
                    {item.category}
                  </span>
                  <span className="block text-xs" style={{ color: "var(--mf-text)" }}>
                    {formatYen(item.amount)}・{count}件
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
