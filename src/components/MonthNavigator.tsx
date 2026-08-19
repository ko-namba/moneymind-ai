"use client";

type MonthNavigatorProps = {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
};

function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function isAfterCurrentMonth(year: number, month: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month > currentMonth);
}

/** 年月を前後に切り替えるナビゲーション */
export function MonthNavigator({ year, month, onChange }: MonthNavigatorProps) {
  const next = shiftMonth(year, month, 1);
  const canGoNext = !isAfterCurrentMonth(next.year, next.month);

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        className="mm-btn-outline px-3 py-2"
        onClick={() => {
          const prev = shiftMonth(year, month, -1);
          onChange(prev.year, prev.month);
        }}
        aria-label="前の月へ"
      >
        ←
      </button>
      <p
        className="min-w-[8rem] text-center text-base font-semibold"
        style={{ color: "var(--mf-text-strong)" }}
      >
        {year}年{month}月
      </p>
      <button
        type="button"
        className="mm-btn-outline px-3 py-2"
        onClick={() => onChange(next.year, next.month)}
        disabled={!canGoNext}
        aria-label="次の月へ"
      >
        →
      </button>
    </div>
  );
}
