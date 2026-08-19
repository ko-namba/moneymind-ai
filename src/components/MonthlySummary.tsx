"use client";

import { formatYen } from "@/lib/expenses/format";
import type { MonthlyComparison } from "@/lib/expenses/summary";

type MonthlySummaryProps = {
  summary: MonthlyComparison;
};

export function MonthlySummary({ summary }: MonthlySummaryProps) {
  const { year, month, currentTotal, previousTotal, difference, changePercent } =
    summary;

  const isIncrease = difference > 0;
  const isDecrease = difference < 0;

  return (
    <section className="grid gap-10 text-center sm:grid-flow-col sm:auto-cols-max sm:justify-center sm:gap-25">
      <div>
        <p className="text-sm" style={{ color: "var(--mf-text)" }}>
          {year}年{month}月の支出
        </p>
        <p className="mm-stat-value-featured mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {formatYen(currentTotal)}
        </p>
      </div>

      <div>
        <p className="text-sm" style={{ color: "var(--mf-text)" }}>
          前月の支出
        </p>
        <p
          className="mt-2 text-2xl font-semibold"
          style={{ color: "var(--mf-text-strong)" }}
        >
          {formatYen(previousTotal)}
        </p>
      </div>

      <div>
        <p className="text-sm" style={{ color: "var(--mf-text)" }}>
          前月比
        </p>
        {previousTotal === 0 && currentTotal === 0 ? (
          <p className="mt-2 text-base" style={{ color: "var(--mf-text)" }}>
            比較データなし
          </p>
        ) : previousTotal === 0 ? (
          <p
            className="mt-2 text-base font-medium"
            style={{ color: "var(--mf-text-strong)" }}
          >
            前月は支出なし
          </p>
        ) : (
          <div className="mt-2">
            <p
              className="text-2xl font-semibold"
              style={{
                color: isIncrease
                  ? "#cd4458"
                  : isDecrease
                    ? "#2f7fb5"
                    : "var(--mf-text-strong)",
              }}
            >
              {isIncrease ? "+" : ""}
              {formatYen(difference)}
            </p>
            {changePercent !== null && (
              <p
                className="mt-0.5 text-sm"
                style={{
                  color: isIncrease
                    ? "#cd4458"
                      : isDecrease
                        ? "#2f7fb5"
                        : "var(--mf-text)",
                }}
              >
                {isIncrease ? "+" : ""}
                {changePercent}%（前月比）
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
