"use client";

import { useState } from "react";
import { ExpenseEditForm } from "@/components/ExpenseEditForm";
import { formatYen } from "@/lib/expenses/format";
import type { Expense, ExpenseInput } from "@/types/expense";

type ExpenseListProps = {
  expenses: Expense[];
  loading?: boolean;
  emptyMessage?: string;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, input: ExpenseInput) => Promise<void>;
  showTitle?: boolean;
};

export function ExpenseList({
  expenses,
  loading = false,
  emptyMessage = "支出がまだありません。",
  onDelete,
  onEdit,
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
      {showTitle && <h2 className="mm-section-title">支出一覧</h2>}

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
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-4 text-left"
                    onClick={() => setEditingId(expense.id)}
                    disabled={deletingId === expense.id}
                    aria-label={`${expense.category} ${formatYen(expense.amount)} を編集`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="mm-badge">{expense.category}</span>
                        <span
                          className="text-sm"
                          style={{ color: "var(--mf-text)" }}
                        >
                          {expense.date}
                        </span>
                      </div>
                      <p
                        className="mt-0.5 truncate text-sm"
                        style={{ color: "var(--mf-text-strong)" }}
                      >
                        {expense.description || "（メモなし）"}
                      </p>
                    </div>

                    <span
                      className="shrink-0 whitespace-nowrap font-semibold"
                      style={{ color: "var(--mf-text-strong)" }}
                    >
                      {formatYen(expense.amount)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                    className="mm-btn-ghost shrink-0"
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
