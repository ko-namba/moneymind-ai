# MoneyMind — AI家計簿アシスタント

転職用ポートフォリオとして開発した、**AI 機能付き家計簿 Web アプリ**です。  
支出の CRUD に加え、**自然言語入力（Function Calling）** と **RAG チャット（引用元表示付き）** を実装しています。

## デモで試せること

| 機能 | 説明 | 画面 |
|------|------|------|
| 支出管理 | 登録・一覧・削除・カテゴリ別グラフ | `/` `/expenses` |
| 自然言語入力 | 「ランチ500円」→ AI が自動仕訳 | `/` |
| RAG チャット | 「今月なぜ食費が増えた？」→ 根拠付き回答 | `/chat` |
| 引用元表示 | どの支出データに基づくか明示 | `/chat` |

## 技術スタック

```
Frontend : React 19 / TypeScript / Next.js 16 / Tailwind CSS 4
Form     : React Hook Form + Zod
Chart    : Recharts
DB       : Supabase（PostgreSQL + pgvector）
AI       : OpenAI API / LangChain.js
         : Function Calling（自然言語入力）
         : RAG + Embeddings（チャット）
```

## セットアップ

### 1. 依存関係のインストール

```powershell
cd moneymind-ai
npm install
```

社内ネットワークで SSL エラーが出る場合:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
```

### 2. 環境変数

`.env.example` を `.env.local` にコピーし、値を設定します。

```env
OPENAI_API_KEY=sk-...                          # OpenAI（sk- で始まる）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...               # 秘密（Git に含めない）
```

| 変数 | 取得場所 |
|------|----------|
| `OPENAI_API_KEY` | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| Supabase 各キー | Supabase Dashboard → Project Settings → API |

> ⚠️ `OPENAI_API_KEY` に Supabase のキー（`sb_...` や `eyJ...`）を入れないでください。

### 3. Supabase SQL の実行

SQL Editor で **順番に** 実行します。

1. `docs/supabase/schema.sql` — テーブル作成
2. `docs/supabase/rag-functions.sql` — RAG ベクトル検索関数

### 4. 開発サーバー起動

```powershell
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。

### 5. サンプルデータ投入（任意）

ダッシュボードの **「サンプル 40 件を投入」** ボタン（開発環境のみ）か、API から投入できます。

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/seed" `
  -ContentType "application/json" -Body "{}"
```

4〜6月分の支出 40 件が入り、グラフ・RAG チャットのデモに使えます。

## 主な API

| メソッド | URL | 説明 |
|----------|-----|------|
| GET | `/api/expenses` | 支出一覧 |
| POST | `/api/expenses` | 支出登録 |
| DELETE | `/api/expenses/[id]` | 支出削除 |
| POST | `/api/natural-input` | 自然言語 → 支出データ解析 |
| POST | `/api/chat` | RAG チャット |
| POST | `/api/seed` | サンプルデータ投入（開発のみ） |

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   ├── chat/               # RAG チャット画面
│   └── expenses/           # 支出一覧画面
├── components/             # UI コンポーネント
├── data/                   # サンプルデータ定義
├── hooks/                  # カスタムフック
├── lib/
│   ├── ai/                 # OpenAI（Function Calling）
│   ├── rag/                # LangChain + pgvector
│   ├── expenses/           # 支出 CRUD
│   └── seed/               # サンプルデータ投入
└── types/
```

## 開発コマンド

```powershell
npm run dev      # 開発サーバー
npm run build    # 本番ビルド
npm run lint     # ESLint
```

## AI 機能の概要

### 自然言語入力（Phase 3）

OpenAI Function Calling で `register_expense` ツールを呼び出し、金額・カテゴリ・日付を抽出します。

```
「ランチ500円」→ { amount: 500, category: "食費", description: "ランチ", date: "2026-06-17" }
```

### RAG チャット（Phase 4）

1. 質問を embedding 化
2. pgvector で類似する支出を検索
3. 月次サマリー + 引用データを LangChain に渡して回答生成
4. `SourceCitation` コンポーネントで引用元を表示

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| npm SSL エラー | `$env:NODE_OPTIONS="--use-system-ca"` |
| `401 Incorrect API key` | `.env.local` の `OPENAI_API_KEY` が `sk-` で始まるか確認 |
| `429 quota exceeded` | [OpenAI Billing](https://platform.openai.com/settings/organization/billing) でクレジット追加 |
| `relation "expenses" does not exist` | `schema.sql` を実行 |
| ベクトル検索エラー | `rag-functions.sql` を実行 |

## 関連ドキュメント

- [開発ログ](docs/PROJECT_LOG.md)
- [Supabase セットアップ](docs/supabase/README.md)
- [Zenn 記事ドラフト](docs/zenn-article.md)

## ライセンス

Private（ポートフォリオ用途）
