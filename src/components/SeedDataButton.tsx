"use client";

import { useState } from "react";
import { SAMPLE_EXPENSE_COUNT } from "@/data/sample-expenses";

type SeedDataButtonProps = {
  expenseCount: number;
  onSeeded: () => Promise<void>;
};

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
  return "サンプルデータの投入に失敗しました。";
}

export function SeedDataButton({ expenseCount, onSeeded }: SeedDataButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seed = async (force: boolean) => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force, withEmbeddings: false }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data: { message: string } = await response.json();
      setMessage(data.message);
      await onSeeded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "投入に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-sm" style={{ color: "var(--mf-text)" }}>
      <p>
        {expenseCount === 0
          ? `開発用: テストデータ ${SAMPLE_EXPENSE_COUNT} 件を投入できます。`
          : `開発用: 現在 ${expenseCount} 件登録済み（再投入で上書き）。`}
      </p>

      <div className="mt-2 flex flex-wrap gap-3">
        {expenseCount === 0 ? (
          <button
            type="button"
            onClick={() => void seed(false)}
            disabled={loading}
            className="mm-btn-outline"
          >
            {loading ? "投入中..." : `${SAMPLE_EXPENSE_COUNT} 件を投入`}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "既存の支出データをすべて削除して、サンプルデータで置き換えますか？",
                )
              ) {
                void seed(true);
              }
            }}
            disabled={loading}
            className="mm-btn-outline"
          >
            {loading ? "投入中..." : "サンプルで置き換え"}
          </button>
        )}
      </div>

      {message && <p className="mt-2" style={{ color: "var(--mf-text)" }}>{message}</p>}
      {error && <p className="mt-2 mm-alert-error">{error}</p>}
    </div>
  );
}
