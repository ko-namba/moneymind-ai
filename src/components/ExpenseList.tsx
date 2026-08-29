"use client";

import { useState } from "react";
import { ExpenseEditForm } from "@/components/ExpenseEditForm";
import { formatYen } from "@/lib/expenses/format";
import type { Expense, ExpenseCategory, ExpenseInput } from "@/types/expense";

type ExpenseListProps = {
  expenses: Expense[];
  loading?: boolean;
  title?: string;
  emptyMessage?: string;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, input: ExpenseInput) => Promise<void>;
  onCategorySelect?: (category: ExpenseCategory) => void;
  showTitle?: boolean;
};

export function ExpenseList({
  expenses,
  loading = false,
  title = "支出一覧",
  emptyMessage = "支出がまだありません。",
  onDelete,
  onEdit,
  onCategorySelect,
  showTitle = true,
}: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("この支出を削除しますか？")) {
      return;
    }

    setDeletingId(id);
    setDeleteError(null);

    try {
      await onDelete(id);
      if (editingId === id) {
        setEditingId(null);
      }
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "削除に失敗しました。",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = async (id: string, input: ExpenseInput) => {
    await onEdit(id, input);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
          style={{
            borderColor: "var(--mf-primary)",
            borderTopColor: "transparent",
          }}
        />
        <p className="text-sm" style={{ color: "var(--mf-text)" }}>
          読み込み中...
        </p>
      </div>
    );
  }

  return (
    <div className="mm-section">
      {showTitle && <h2 className="mm-section-title">{title}</h2>}

      {deleteError && <p className="mm-alert-error">{deleteError}</p>}

      {expenses.length === 0 ? (
        <p className="py-12 text-sm" style={{ color: "var(--mf-text)" }}>
          {emptyMessage}
        </p>
      ) : (
        <ul className="divide-y mm-divider">
          {expenses.map((expense) => (
            <li key={expense.id} className="py-4">
              {editingId === expense.id ? (
                <ExpenseEditForm
                  expense={expense}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(input) => handleEdit(expense.id, input)}
                />
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  className="grid cursor-pointer grid-cols-[4rem_6.75rem_minmax(0,1fr)_auto_auto] items-center gap-x-2 text-left sm:gap-x-3"
                  onClick={() => {
                    if (deletingId !== expense.id) {
                      setEditingId(expense.id);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      deletingId !== expense.id &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      setEditingId(expense.id);
                    }
                  }}
                  aria-label={`${expense.category} ${formatYen(expense.amount)} を編集`}
                >
                  {onCategorySelect ? (
                    <button
                      type="button"
                      className="mm-badge justify-self-start text-left cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        onCategorySelect(expense.category);
                      }}
                      aria-label={`${expense.category} の内訳を見る`}
                    >
                      {expense.category}
                    </button>
                  ) : (
                    <span className="mm-badge justify-self-start">
                      {expense.category}
                    </span>
                  )}

                  <span
                    className="whitespace-nowrap text-sm tabular-nums"
                    style={{ color: "var(--mf-text)" }}
                  >
                    {expense.date}
                  </span>
                  <span
                    className="min-w-0 truncate text-sm"
                    style={{ color: "var(--mf-text-strong)" }}
                  >
                    {expense.description || "（メモなし）"}
                  </span>
                  <span
                    className="whitespace-nowrap text-right font-semibold"
                    style={{ color: "var(--mf-text-strong)" }}
                  >
                    {formatYen(expense.amount)}
                  </span>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDelete(expense.id);
                    }}
                    disabled={deletingId === expense.id}
                    className="mm-btn-danger justify-self-end"
                  >
                    {deletingId === expense.id ? "削除中..." : "削除"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
