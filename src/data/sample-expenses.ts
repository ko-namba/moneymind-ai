import type { ExpenseInput } from "@/types/expense";

/** デモ・ポートフォリオ用サンプル支出（40件） */
export const SAMPLE_EXPENSES: ExpenseInput[] = [
  // 2026年4月（10件）
  { date: "2026-04-02", category: "食費", description: "スーパー買い出し", amount: 3200 },
  { date: "2026-04-05", category: "交通", description: "定期券更新", amount: 12500 },
  { date: "2026-04-08", category: "食費", description: "ランチ", amount: 780 },
  { date: "2026-04-12", category: "娯楽", description: "映画館", amount: 2200 },
  { date: "2026-04-15", category: "日用品", description: "ドラッグストア", amount: 1580 },
  { date: "2026-04-18", category: "食費", description: "外食ディナー", amount: 4500 },
  { date: "2026-04-20", category: "交通", description: "タクシー", amount: 1800 },
  { date: "2026-04-22", category: "医療", description: "市販薬", amount: 980 },
  { date: "2026-04-25", category: "食費", description: "カフェ", amount: 650 },
  { date: "2026-04-28", category: "その他", description: "書籍", amount: 1980 },

  // 2026年5月（15件）— 食費は控えめ
  { date: "2026-05-03", category: "食費", description: "ランチ", amount: 850 },
  { date: "2026-05-05", category: "交通", description: "電車代", amount: 580 },
  { date: "2026-05-07", category: "日用品", description: "洗剤・ティッシュ", amount: 1200 },
  { date: "2026-05-10", category: "食費", description: "スーパー", amount: 2800 },
  { date: "2026-05-12", category: "娯楽", description: "ゲームソフト", amount: 5980 },
  { date: "2026-05-14", category: "食費", description: "弁当", amount: 620 },
  { date: "2026-05-16", category: "交通", description: "高速バス", amount: 3500 },
  { date: "2026-05-18", category: "食費", description: "ランチ", amount: 900 },
  { date: "2026-05-20", category: "医療", description: "診察料", amount: 1500 },
  { date: "2026-05-22", category: "食費", description: "カフェ", amount: 550 },
  { date: "2026-05-24", category: "日用品", description: "消耗品", amount: 890 },
  { date: "2026-05-26", category: "娯楽", description: "配信サービス", amount: 1490 },
  { date: "2026-05-28", category: "食費", description: "夕食食材", amount: 2100 },
  { date: "2026-05-30", category: "交通", description: "電車代", amount: 580 },
  { date: "2026-05-31", category: "その他", description: "雑費", amount: 500 },

  // 2026年6月（15件）— 食費多め（RAGデモ用）
  { date: "2026-06-01", category: "食費", description: "ランチ", amount: 950 },
  { date: "2026-06-03", category: "食費", description: "スタバ", amount: 720 },
  { date: "2026-06-05", category: "食費", description: "外食ランチ", amount: 1200 },
  { date: "2026-06-06", category: "交通", description: "電車代", amount: 580 },
  { date: "2026-06-08", category: "食費", description: "スーパー", amount: 4500 },
  { date: "2026-06-10", category: "食費", description: "焼肉ディナー", amount: 6800 },
  { date: "2026-06-11", category: "娯楽", description: "コンサートチケット", amount: 8500 },
  { date: "2026-06-12", category: "食費", description: "ランチ", amount: 880 },
  { date: "2026-06-13", category: "日用品", description: "ドラッグストア", amount: 2100 },
  { date: "2026-06-14", category: "食費", description: "デリバリー", amount: 2400 },
  { date: "2026-06-15", category: "食費", description: "カフェ", amount: 680 },
  { date: "2026-06-16", category: "交通", description: "タクシー", amount: 2200 },
  { date: "2026-06-17", category: "食費", description: "ランチ", amount: 850 },
  { date: "2026-06-17", category: "医療", description: "薬局", amount: 1320 },
  { date: "2026-06-17", category: "その他", description: "サブスク", amount: 980 },
];

export const SAMPLE_EXPENSE_COUNT = SAMPLE_EXPENSES.length;
