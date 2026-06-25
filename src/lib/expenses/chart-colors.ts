import type { ExpenseCategory } from "@/types/expense";

/** グラフ用のはっきりしたカテゴリ色 */
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  食費: "#de7359",
  交通: "#2b9fd4",
  娯楽: "#7568c9",
  日用品: "#3ba87a",
  医療: "#c9567f",
  その他: "#5f7285",
};
