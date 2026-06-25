import type { Expense, ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/types/expense";

export type CategoryTotal = {
  category: ExpenseCategory;
  amount: number;
};

export type MonthlyComparison = {
  year: number;
  month: number;
  currentTotal: number;
  previousTotal: number;
  difference: number;
  changePercent: number | null;
};

function parseYearMonth(date: string): { year: number; month: number } {
  const [year, month] = date.split("-").map(Number);
  return { year, month };
}

export function isInMonth(
  expense: Expense,
  year: number,
  month: number,
): boolean {
  const parsed = parseYearMonth(expense.date);
  return parsed.year === year && parsed.month === month;
}

export function calcTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function filterExpensesByMonth(
  expenses: Expense[],
  year: number,
  month: number,
): Expense[] {
  return expenses.filter((expense) => isInMonth(expense, year, month));
}

export type CategoryMonthlyComparison = {
  category: ExpenseCategory;
  currentAmount: number;
  previousAmount: number;
  difference: number;
  changePercent: number | null;
};

function buildCategoryAmountMap(
  expenses: Expense[],
): Map<ExpenseCategory, number> {
  const totals = new Map<ExpenseCategory, number>();

  for (const category of EXPENSE_CATEGORIES) {
    totals.set(category, 0);
  }

  for (const expense of expenses) {
    totals.set(
      expense.category,
      (totals.get(expense.category) ?? 0) + expense.amount,
    );
  }

  return totals;
}

export function calcCategoryTotals(expenses: Expense[]): CategoryTotal[] {
  const totals = buildCategoryAmountMap(expenses);

  return EXPENSE_CATEGORIES.map((category) => ({
    category,
    amount: totals.get(category) ?? 0,
  })).filter((item) => item.amount > 0);
}

export function calcCategoryMonthlyComparisons(
  expenses: Expense[],
  referenceDate = new Date(),
): CategoryMonthlyComparison[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + 1;

  const previousDate = new Date(year, referenceDate.getMonth() - 1, 1);
  const previousYear = previousDate.getFullYear();
  const previousMonth = previousDate.getMonth() + 1;

  const currentMap = buildCategoryAmountMap(
    filterExpensesByMonth(expenses, year, month),
  );
  const previousMap = buildCategoryAmountMap(
    filterExpensesByMonth(expenses, previousYear, previousMonth),
  );

  return EXPENSE_CATEGORIES.map((category) => {
    const currentAmount = currentMap.get(category) ?? 0;
    const previousAmount = previousMap.get(category) ?? 0;
    const difference = currentAmount - previousAmount;
    const changePercent =
      previousAmount > 0
        ? Math.round((difference / previousAmount) * 1000) / 10
        : null;

    return {
      category,
      currentAmount,
      previousAmount,
      difference,
      changePercent,
    };
  });
}

export function calcMonthlyComparison(
  expenses: Expense[],
  referenceDate = new Date(),
): MonthlyComparison {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + 1;

  const previousDate = new Date(year, referenceDate.getMonth() - 1, 1);
  const previousYear = previousDate.getFullYear();
  const previousMonth = previousDate.getMonth() + 1;

  const currentExpenses = filterExpensesByMonth(expenses, year, month);
  const previousExpenses = filterExpensesByMonth(
    expenses,
    previousYear,
    previousMonth,
  );

  const currentTotal = calcTotal(currentExpenses);
  const previousTotal = calcTotal(previousExpenses);
  const difference = currentTotal - previousTotal;

  const changePercent =
    previousTotal > 0
      ? Math.round((difference / previousTotal) * 1000) / 10
      : null;

  return {
    year,
    month,
    currentTotal,
    previousTotal,
    difference,
    changePercent,
  };
}
