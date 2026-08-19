import { todayDateString } from "@/lib/expenses/format";
import { expenseInputSchema } from "@/lib/validation/expense";
import type { ExpenseInputValidated } from "@/lib/validation/expense";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/types/expense";

type ParsedNaturalExpense = {
  input: ExpenseInputValidated;
  message: string;
};

const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  食費: [
    "ランチ",
    "昼食",
    "夕食",
    "朝食",
    "食事",
    "カフェ",
    "スタバ",
    "コーヒー",
    "弁当",
    "外食",
    "居酒屋",
    "寿司",
    "ラーメン",
    "うどん",
    "パン",
    "食費",
    "スーパー",
    "コンビニ",
    "弁当",
  ],
  交通: [
    "電車",
    "バス",
    "タクシー",
    "交通",
    "ガソリン",
    "駐車",
    "高速",
    "suica",
    "pasmo",
    "交通費",
    "乗車",
  ],
  娯楽: [
    "映画",
    "ゲーム",
    "本",
    "書籍",
    "旅行",
    "温泉",
    "娯楽",
    "コンサート",
    "netflix",
    "spotify",
    "遊園地",
  ],
  日用品: [
    "ドラッグストア",
    "日用品",
    "洗剤",
    "シャンプー",
    "トイレット",
    "薬局",
    "雑貨",
    "100均",
    "ダイソー",
  ],
  医療: ["病院", "医療", "薬", "診察", "歯科", "クリニック", "健康"],
  その他: [],
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function extractAmount(text: string): number | null {
  const yenMatch = text.match(/(\d{1,3}(?:,\d{3})+|\d+)\s*円/);
  if (yenMatch) {
    return Number.parseInt(yenMatch[1].replace(/,/g, ""), 10);
  }

  const numberMatch = text.match(/(\d{1,3}(?:,\d{3})+|\d+)/);
  if (numberMatch) {
    return Number.parseInt(numberMatch[1].replace(/,/g, ""), 10);
  }

  return null;
}

function extractDate(text: string, today: string): string {
  if (text.includes("一昨日")) {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    return formatDate(date);
  }

  if (text.includes("昨日")) {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return formatDate(date);
  }

  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) {
    return isoMatch[1];
  }

  const slashMatch = text.match(/(\d{1,2})\/(\d{1,2})/);
  if (slashMatch) {
    const year = new Date().getFullYear();
    const month = slashMatch[1].padStart(2, "0");
    const day = slashMatch[2].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return today;
}

function detectCategory(text: string): ExpenseCategory {
  const normalized = text.toLowerCase();
  let bestCategory: ExpenseCategory = "その他";
  let bestScore = 0;

  for (const category of EXPENSE_CATEGORIES) {
    if (category === "その他") {
      continue;
    }

    let score = 0;
    for (const keyword of CATEGORY_KEYWORDS[category]) {
      if (normalized.includes(keyword.toLowerCase())) {
        score += keyword.length >= 3 ? 2 : 1;
      }
    }

    if (category === "交通" && /電車|バス|タクシー|交通/.test(text)) {
      score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

function buildDescription(
  text: string,
  amount: number,
  category: ExpenseCategory,
): string {
  let description = text
    .replace(new RegExp(`${amount.toLocaleString("ja-JP")}\\s*円?`, "g"), "")
    .replace(new RegExp(`${amount}\\s*円?`, "g"), "")
    .replace(/\d{4}-\d{2}-\d{2}/g, "")
    .replace(/\d{1,2}\/\d{1,2}/g, "")
    .replace(/今日|昨日|一昨日/g, "")
    .replace(/[、。,\s]+$/g, "")
    .replace(/^[、。,\s]+/g, "")
    .trim();

  if (description) {
    return description.slice(0, 200);
  }

  if (category !== "その他") {
    return category;
  }

  return "支出";
}

/** OpenAI なしで動くルールベースの自然言語解析 */
export function parseNaturalExpenseWithRules(
  text: string,
): ParsedNaturalExpense {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("入力内容を入力してください。");
  }

  const today = todayDateString();
  const amount = extractAmount(trimmed);
  if (!amount) {
    throw new Error(
      "金額を読み取れませんでした。「ランチ500円」のように金額を含めて入力してください。",
    );
  }

  const category = detectCategory(trimmed);
  const description = buildDescription(trimmed, amount, category);
  const date = extractDate(trimmed, today);

  const input: ExpenseInputValidated = expenseInputSchema.parse({
    amount,
    category,
    description,
    date,
  });

  return {
    input,
    message: `「${input.description}」を ${input.category} ${input.amount.toLocaleString("ja-JP")}円として読み取りました（無料モード）。`,
  };
}
