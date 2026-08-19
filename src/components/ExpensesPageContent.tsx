"use client";

import { useMemo, useState } from "react";
import { CategoryBreakdownModal } from "@/components/CategoryBreakdownModal";
import { CategoryBreakdownPicker } from "@/components/CategoryBreakdownPicker";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { MonthNavigator } from "@/components/MonthNavigator";
import { NaturalInput } from "@/components/NaturalInput";
import { useExpenses } from "@/hooks/useExpenses";
import { filterExpensesByMonth } from "@/lib/expenses/summary";
import type { Expense, ExpenseCategory } from "@/types/expense";

export function ExpensesPageContent() {
  const { expenses, loading, error, addExpense, removeExpense, editExpense } =
    useExpenses();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);

  const monthExpenses = useMemo(
    () => filterExpensesByMonth(expenses, year, month),
    [expenses, year, month],
  );

  const expensesByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, Expense[]>();
    for (const expense of monthExpenses) {
      const list = map.get(expense.category);
      if (list) {
        list.push(expense);
      } else {
        map.set(expense.category, [expense]);
      }
    }
    return map;
  }, [monthExpenses]);

  const selectedItems = selectedCategory
    ? (expensesByCategory.get(selectedCategory) ?? [])
    : [];
  const selectedTotal = selectedItems.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const handleMonthChange = (nextYear: number, nextMonth: number) => {
    setYear(nextYear);
    setMonth(nextMonth);
    setSelectedCategory(null);
  };

  return (
    <div className="mm-page">
      {error && <p className="mm-alert-error">{error}</p>}

      <section className="mm-page-section">
        <NaturalInput onSubmit={addExpense} />
      </section>

      <section className="mm-page-section">
        <ExpenseForm onSubmit={addExpense} />
      </section>

      <section className="mm-page-section">
        <MonthNavigator year={year} month={month} onChange={handleMonthChange} />
      </section>

      {!loading && monthExpenses.length > 0 && (
        <section className="mm-page-section">
          <CategoryBreakdownPicker
            expenses={monthExpenses}
            onSelectCategory={setSelectedCategory}
          />
        </section>
      )}

      <section className="mm-page-section">
        <ExpenseList
          expenses={monthExpenses}
          loading={loading}
          title={`${year}年${month}月の支出一覧`}
          emptyMessage={`${year}年${month}月の支出はありません。`}
          onDelete={removeExpense}
          onEdit={editExpense}
          onCategorySelect={setSelectedCategory}
        />
      </section>

      {selectedCategory && (
        <CategoryBreakdownModal
          category={selectedCategory}
          items={selectedItems}
          total={selectedTotal}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
