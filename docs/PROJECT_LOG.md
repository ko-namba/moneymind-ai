# MoneyMind 開発ログ

最終更新: 2026-06-17  
プロジェクトパス: `C:\Users\k-namba\Desktop\moneymind-ai`

---

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| 名前 | **MoneyMind — AI家計簿アシスタント** |
| 目的 | 転職用ポートフォリオ（2026年5〜8月応募想定） |
| コンセプト | React + TypeScript の家計簿 + AI 機能（自然言語入力 / RAG チャット） |
| 開発者プロフィール | WEBプログラマー / 年収360万 / 貯蓄100万 / 独立意欲5/10 |
| 転職目標 | 年収450万+ / AI組み込みフルスタック / TypeScript + Next.js + AWS |

---

## 進捗サマリー

| Phase | 内容 | 状態 |
|-------|------|------|
| **0** | Next.js 初期化・型定義・Supabase クライアント・レイアウト | ✅ 完了 |
| **1** | Supabase SQL・Zod・支出 CRUD API | ✅ 完了 |
| **2** | React UI（フォーム・一覧・グラフ） | ⏳ 未着手（明日） |
| **3** | 自然言語入力（Function Calling） | ⏳ 未着手 |
| **4** | RAG チャット + 引用元表示 | ⏳ 未着手 |
| **5** | サンプルデータ・UI 仕上げ・README | ⏳ 未着手 |
| **6** | Vercel デプロイ | ⏳ 未着手 |

---

## 技術スタック

```
Frontend : React 19 + TypeScript + Next.js 16 + Tailwind CSS 4
Form     : React Hook Form + Zod（Phase 2〜）
Chart    : Recharts（Phase 2〜）
DB       : Supabase（PostgreSQL + pgvector）
AI       : OpenAI API + LangChain.js（Phase 3〜）
Deploy   : Vercel（予定）
開発ツール: Cursor（AI協働開発）
```

### 主要パッケージ（package.json）

- next 16.2.9 / react 19.2.4
- @supabase/supabase-js
- zod / react-hook-form / @hookform/resolvers
- recharts / openai / langchain / @langchain/openai / @langchain/core

---

## ディレクトリ構成（現時点）

```
moneymind-ai/
├── .env.example              # 環境変数テンプレート
├── .env.local                # ローカル秘密鍵（Git 除外・要作成）
├── docs/
│   ├── PROJECT_LOG.md        # ← このファイル
│   └── supabase/
│       ├── schema.sql        # テーブル作成 SQL
│       └── README.md         # Supabase 手順・API テスト
├── src/
│   ├── app/
│   │   ├── layout.tsx        # 日本語レイアウト + Header
│   │   ├── page.tsx          # ダッシュボード（仮）
│   │   ├── expenses/page.tsx # プレースホルダー（Phase 2）
│   │   ├── chat/page.tsx     # プレースホルダー（Phase 4）
│   │   └── api/
│   │       └── expenses/
│   │           ├── route.ts      # GET / POST
│   │           └── [id]/route.ts # PUT / DELETE
│   ├── components/
│   │   └── Header.tsx
│   ├── lib/
│   │   ├── api/response.ts
│   │   ├── db/supabase.ts
│   │   ├── expenses/
│   │   │   ├── format.ts
│   │   │   └── repository.ts
│   │   └── validation/expense.ts
│   └── types/expense.ts
└── package.json
```

---

## 環境変数（.env.local）

`.env.example` をコピーして `.env.local` を作成済み想定。

```env
OPENAI_API_KEY=sk-...                    # Phase 3 以降で使用
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...         # API Routes で使用（秘密）
```

### 取得場所

Supabase Dashboard → **Project Settings** → **API**

| 変数名 | Supabase の表示名 |
|--------|-------------------|
| NEXT_PUBLIC_SUPABASE_URL | Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | anon public |
| SUPABASE_SERVICE_ROLE_KEY | service_role（Secret） |

⚠️ `service_role` は絶対に Git / 公開しない

---

## Supabase セットアップ（要確認）

Phase 1 コードは完了。**SQL 実行は手動作業。**

1. Supabase Dashboard → **SQL Editor**
2. `docs/supabase/schema.sql` の内容をすべて実行
3. **Table Editor** で `expenses` / `expense_embeddings` を確認

### テーブル

**expenses**
- id (uuid), amount (int), category (text), description (text), date (date), created_at

**expense_embeddings**（RAG 用）
- id, expense_id (FK), content (text), embedding (vector 1536, nullable), created_at

---

## API 仕様（Phase 1 実装済み）

| メソッド | URL | 説明 |
|----------|-----|------|
| GET | `/api/expenses` | 支出一覧（日付降順） |
| GET | `/api/expenses?category=食費` | カテゴリ絞り込み |
| POST | `/api/expenses` | 支出登録 + expense_embeddings 追加 |
| PUT | `/api/expenses/[id]` | 支出更新 + embedding content 更新 |
| DELETE | `/api/expenses/[id]` | 支出削除（CASCADE で embedding も削除） |

### POST ボディ例

```json
{
  "amount": 850,
  "category": "食費",
  "description": "ランチ",
  "date": "2026-06-17"
}
```

### カテゴリ（6種）

`食費` / `交通` / `娯楽` / `日用品` / `医療` / `その他`

### embedding content 形式

```
2026-06-17 | 食費 | ランチ | 850円
```

---

## ローカル開発コマンド

```powershell
cd C:\Users\k-namba\Desktop\moneymind-ai

# 社内ネットワークで npm エラーが出る場合
$env:NODE_OPTIONS="--use-system-ca"

npm run dev      # http://localhost:3000
npm run build    # ビルド確認
npm run lint     # ESLint
```

### API テスト（PowerShell）

```powershell
# 登録
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/expenses" `
  -ContentType "application/json" `
  -Body '{"amount":850,"category":"食費","description":"ランチ","date":"2026-06-17"}'

# 一覧
Invoke-RestMethod -Uri "http://localhost:3000/api/expenses"
```

---

## AI 機能ロードマップ（Must）

| # | 機能 | Phase | 技術 |
|---|------|-------|------|
| 1 | 支出 CRUD + グラフ | 2 | React Hook Form, Recharts |
| 2 | 自然言語入力「ランチ500円」 | 3 | OpenAI Function Calling |
| 3 | RAG チャット「今月なぜ食費増？」 | 4 | LangChain.js + pgvector |
| 4 | 引用元表示 | 4 | SourceCitation コンポーネント |

⚠️ **普通の家計簿（CRUD のみ）では転職差別化にならない。AI 機能 3 つは Must。**

---

## 転職・キャリア文脈（チャット記録）

### 鑑定・戦略メモ

- 動物占い: 用心深い猿（46番）
- MBTI: INTJ-A
- 2026年5〜8月が転職最良期
- 推奨: 組織で450万+へ転職 → 2027副業 → 2029独立判断
- 技術: TypeScript フルスタック + AI 組み込み（RAG）

### 職務経歴書キーワード

```
TypeScript / React / Next.js / OpenAI API / RAG / Supabase / Cursor
希望年収: 450万以上（下限420万）
```

### Zenn 記事タイトル案

- `React + TypeScript で AI 家計簿を作った — Function Calling と RAG の実装`

---

## 明日やること（Phase 2）

### 再開手順

1. Cursor で `C:\Users\k-namba\Desktop\moneymind-ai` を開く
2. Supabase SQL 未実行なら `docs/supabase/schema.sql` を実行
3. API テストで POST / GET が動くか確認
4. チャットで **「Phase 2 をお願い」** と送る

### Phase 2 で作るもの

| コンポーネント | 内容 |
|----------------|------|
| `ExpenseForm.tsx` | React Hook Form + Zod、POST /api/expenses |
| `ExpenseList.tsx` | 一覧表示 + 削除 |
| `CategoryChart.tsx` | Recharts 円グラフ or 棒グラフ |
| `MonthlySummary.tsx` | 今月合計・前月比 |
| `src/app/page.tsx` | ダッシュボード本実装 |
| `src/app/expenses/page.tsx` | 支出一覧ページ本実装 |

### Phase 2 完了条件

- [ ] 画面から支出を登録できる
- [ ] 一覧・削除ができる
- [ ] カテゴリ別グラフが表示される
- [ ] ダッシュボードに今月サマリーが出る

---

## 残り Phase 一覧（参考）

| Phase | 時期目安 | 内容 |
|-------|----------|------|
| 3 | 3月後半 | `/api/natural-input` + NaturalInput.tsx |
| 4 | 3月末〜4月 | `/api/chat` + RAG + ChatWindow.tsx |
| 5 | 4月 | サンプルデータ40件 + README + Zenn 記事 |
| 6 | 4月末 | Vercel デプロイ |

**5月1日: 転職応募開始（目標）**

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| npm SSL エラー | `$env:NODE_OPTIONS="--use-system-ca"` |
| Supabase 環境変数エラー | `.env.local` 確認 → サーバー再起動 |
| `relation "expenses" does not exist` | schema.sql 未実行 |
| LangChain 依存エラー | `npm install --legacy-peer-deps` |

---

## チャット再開用プロンプト

明日 Cursor で再開するとき、以下を貼るとスムーズです。

```
MoneyMind（AI家計簿）の開発を続けます。
プロジェクト: C:\Users\k-namba\Desktop\moneymind-ai
docs/PROJECT_LOG.md を読んで現状を把握し、Phase 2 を実装してください。
```

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-06-17 | Phase 0 完了（Next.js 初期化・型・レイアウト） |
| 2026-06-17 | Phase 1 完了（Supabase SQL・CRUD API） |
| 2026-06-17 | プロジェクトを Desktop に移動 |
| 2026-06-17 | 本ログ作成 |
