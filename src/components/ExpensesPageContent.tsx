"use client";

import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { NaturalInput } from "@/components/NaturalInput";
import { useExpenses } from "@/hooks/useExpenses";

export function ExpensesPageContent() {
  const { expenses, loading, error, addExpense, removeExpense, editExpense } =
    useExpenses();

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
        <ExpenseList
          expenses={expenses}
          loading={loading}
          onDelete={removeExpense}
          onEdit={editExpense}
        />
      </section>
    </div>
  );
}
