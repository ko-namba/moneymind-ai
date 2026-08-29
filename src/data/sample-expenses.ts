import type { ExpenseInput } from "@/types/expense";

/** デモ・ポートフォリオ用サンプル支出（40件） */
export const SAMPLE_EXPENSES: ExpenseInput[] = [
  // 2026年6月（10件）
  { date: "2026-06-02", category: "食費", description: "スーパー買い出し", amount: 3400 },
  { date: "2026-06-05", category: "交通", description: "電車代", amount: 580 },
  { date: "2026-06-08", category: "食費", description: "ランチ", amount: 880 },
  { date: "2026-06-12", category: "娯楽", description: "映画館", amount: 2200 },
  { date: "2026-06-15", category: "日用品", description: "ドラッグストア", amount: 1680 },
  { date: "2026-06-18", category: "食費", description: "外食ディナー", amount: 4800 },
  { date: "2026-06-20", category: "交通", description: "タクシー", amount: 1900 },
  { date: "2026-06-22", category: "医療", description: "市販薬", amount: 980 },
  { date: "2026-06-25", category: "食費", description: "カフェ", amount: 650 },
  { date: "2026-06-28", category: "その他", description: "書籍", amount: 1980 },

  // 2026年7月（15件）— 前月比較用
  { date: "2026-07-01", category: "食費", description: "ランチ", amount: 920 },
  { date: "2026-07-03", category: "交通", description: "定期券更新", amount: 12500 },
  { date: "2026-07-05", category: "日用品", description: "洗剤・ティッシュ", amount: 1350 },
  { date: "2026-07-07", category: "食費", description: "スーパー", amount: 3100 },
  { date: "2026-07-09", category: "娯楽", description: "配信サービス", amount: 1490 },
  { date: "2026-07-11", category: "食費", description: "弁当", amount: 680 },
  { date: "2026-07-13", category: "交通", description: "電車代", amount: 580 },
  { date: "2026-07-15", category: "食費", description: "カフェ", amount: 580 },
  { date: "2026-07-17", category: "医療", description: "診察料", amount: 2500 },
  { date: "2026-07-19", category: "食費", description: "外食ランチ", amount: 1400 },
  { date: "2026-07-21", category: "日用品", description: "消耗品", amount: 920 },
  { date: "2026-07-23", category: "娯楽", description: "ゲームソフト", amount: 4980 },
  { date: "2026-07-25", category: "食費", description: "夕食食材", amount: 2400 },
  { date: "2026-07-27", category: "交通", description: "高速バス", amount: 3500 },
  { date: "2026-07-30", category: "その他", description: "雑費", amount: 700 },

  // 2026年8月（15件）— 今月表示・RAGデモ用（食費やや多め）
  { date: "2026-08-01", category: "食費", description: "ランチ", amount: 950 },
  { date: "2026-08-03", category: "食費", description: "スタバ", amount: 720 },
  { date: "2026-08-05", category: "交通", description: "電車代", amount: 580 },
  { date: "2026-08-07", category: "食費", description: "スーパー", amount: 4200 },
  { date: "2026-08-09", category: "娯楽", description: "コンサートチケット", amount: 8500 },
  { date: "2026-08-11", category: "食費", description: "焼肉ディナー", amount: 6800 },
  { date: "2026-08-13", category: "日用品", description: "ドラッグストア", amount: 2100 },
  { date: "2026-08-15", category: "食費", description: "デリバリー", amount: 2400 },
  { date: "2026-08-17", category: "交通", description: "タクシー", amount: 2100 },
  { date: "2026-08-19", category: "食費", description: "ランチ", amount: 880 },
  { date: "2026-08-21", category: "医療", description: "薬局", amount: 1320 },
  { date: "2026-08-23", category: "食費", description: "カフェ", amount: 680 },
  { date: "2026-08-25", category: "娯楽", description: "映画館", amount: 2400 },
  { date: "2026-08-27", category: "食費", description: "外食ディナー", amount: 5200 },
  { date: "2026-08-28", category: "その他", description: "サブスク", amount: 980 },
];

export const SAMPLE_EXPENSE_COUNT = SAMPLE_EXPENSES.length;
