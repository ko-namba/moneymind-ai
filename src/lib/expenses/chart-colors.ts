import type { ExpenseCategory } from "@/types/expense";

/** グラフ用のカテゴリ色（和紙背景に映える、鮮やかめの配色） */
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  食費: "#e8853a",
  交通: "#2f7fb5",
  娯楽: "#8a5cc0",
  日用品: "#3fa86a",
  医療: "#d8456a",
  その他: "#c79a3e",
};
