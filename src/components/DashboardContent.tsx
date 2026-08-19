"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CategoryChart } from "@/components/CategoryChart";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { MonthNavigator } from "@/components/MonthNavigator";
import { MonthlySummary } from "@/components/MonthlySummary";
import { NaturalInput } from "@/components/NaturalInput";
import { SeedDataButton } from "@/components/SeedDataButton";
import { useExpenses } from "@/hooks/useExpenses";
import {
  calcCategoryMonthlyComparisons,
  calcCategoryTotals,
  calcMonthlyComparison,
  filterExpensesByMonth,
} from "@/lib/expenses/summary";

export function DashboardContent() {
  const { expenses, loading, error, addExpense, removeExpense, editExpense, reload } =
    useExpenses();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const referenceDate = useMemo(
    () => new Date(year, month - 1, 1),
    [year, month],
  );

  const monthlySummary = useMemo(
    () => calcMonthlyComparison(expenses, referenceDate),
    [expenses, referenceDate],
  );

  const monthExpenses = useMemo(
    () => filterExpensesByMonth(expenses, year, month),
    [expenses, year, month],
  );

  const categoryTotals = useMemo(
    () => calcCategoryTotals(monthExpenses),
    [monthExpenses],
  );

  const categoryComparisons = useMemo(
    () => calcCategoryMonthlyComparisons(expenses, referenceDate),
    [expenses, referenceDate],
  );

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="mm-page">
      {process.env.NODE_ENV === "development" && (
        <SeedDataButton expenseCount={expenses.length} onSeeded={reload} />
      )}

      {error && <p className="mm-alert-error">{error}</p>}

      <section className="mm-page-section space-y-4">
        <MonthNavigator
          year={year}
          month={month}
          onChange={(nextYear, nextMonth) => {
            setYear(nextYear);
            setMonth(nextMonth);
          }}
        />
        <CategoryChart
          key={`${year}-${month}`}
          data={categoryTotals}
          comparisons={categoryComparisons}
          expenses={monthExpenses}
          title={`${year}年${month}月の支出`}
          titleClassName="text-2xl sm:text-3xl text-center"
          emptyMessage={`${year}年${month}月の支出データがありません。`}
        />
      </section>

      <section className="mm-page-section">
        <MonthlySummary summary={monthlySummary} />
      </section>

      <section className="mm-page-section">
        <NaturalInput onSubmit={addExpense} />
      </section>

      <section className="mm-page-section">
        <ExpenseForm onSubmit={addExpense} />
      </section>

      <section className="mm-page-section space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="mm-section-title">最近の支出</h2>
          <Link href="/expenses" className="mm-link-accent">
            すべて見る
          </Link>
        </div>
        <ExpenseList
          expenses={recentExpenses}
          loading={loading}
          showTitle={false}
          emptyMessage="まだ支出がありません。上のフォームから登録してみましょう。"
          onDelete={removeExpense}
          onEdit={editExpense}
        />
      </section>
    </div>
  );
}
