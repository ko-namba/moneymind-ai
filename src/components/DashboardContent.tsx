"use client";

import Link from "next/link";
import { CategoryChart } from "@/components/CategoryChart";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
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

  const monthlySummary = calcMonthlyComparison(expenses);
  const currentMonthExpenses = filterExpensesByMonth(
    expenses,
    monthlySummary.year,
    monthlySummary.month,
  );
  const categoryTotals = calcCategoryTotals(currentMonthExpenses);
  const categoryComparisons = calcCategoryMonthlyComparisons(expenses);
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="mm-page">
      {process.env.NODE_ENV === "development" && (
        <SeedDataButton expenseCount={expenses.length} onSeeded={reload} />
      )}

      {error && <p className="mm-alert-error">{error}</p>}

      <section className="mm-page-section">
        <CategoryChart
          data={categoryTotals}
          comparisons={categoryComparisons}
          title="今月のカテゴリ別支出"
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
