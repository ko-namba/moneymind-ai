"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CATEGORY_COLORS } from "@/lib/expenses/chart-colors";
import { formatYen } from "@/lib/expenses/format";
import type { Expense, ExpenseCategory } from "@/types/expense";

type CategoryBreakdownModalProps = {
  category: ExpenseCategory;
  items: Expense[];
  total: number;
  onClose: () => void;
};

/** カテゴリクリック時に開く、内訳（個々の支出明細）モーダル */
export function CategoryBreakdownModal({
  category,
  items,
  total,
  onClose,
}: CategoryBreakdownModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const color = CATEGORY_COLORS[category];
  const sortedItems = [...items].sort((a, b) => b.amount - a.amount);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(21, 32, 43, 0.45)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`${category} の内訳`}
      onClick={onClose}
    >
      <div
        className="mm-panel max-h-[80vh] w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex items-center justify-between gap-4 px-5 py-4"
          style={{ borderBottom: "1px solid var(--mf-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            <div>
              <p
                className="text-base font-semibold"
                style={{ color: "var(--mf-text-strong)" }}
              >
                {category}
              </p>
              <p className="text-xs" style={{ color: "var(--mf-text)" }}>
                合計 {formatYen(total)}・{items.length}件
              </p>
            </div>
          </div>
          <button
            type="button"
            className="mm-btn-ghost shrink-0"
            onClick={onClose}
            aria-label="閉じる"
          >
            閉じる
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-2">
          {sortedItems.length === 0 ? (
            <p className="py-8 text-sm" style={{ color: "var(--mf-text)" }}>
              このカテゴリの明細がありません。
            </p>
          ) : (
            <ul className="divide-y mm-divider">
              {sortedItems.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: "var(--mf-text-strong)" }}
                    >
                      {expense.description || "（メモなし）"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--mf-text)" }}>
                      {expense.date}
                    </p>
                  </div>
                  <span
                    className="shrink-0 whitespace-nowrap text-sm font-semibold"
                    style={{ color: "var(--mf-text-strong)" }}
                  >
                    {formatYen(expense.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
