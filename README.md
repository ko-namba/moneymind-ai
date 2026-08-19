# MoneyMind — AI家計簿アシスタント

**AI 機能付き家計簿 Web アプリ**です。  
支出の CRUD に加え、**自然言語入力（Function Calling）** と **RAG チャット（引用元表示付き）** を実装しています。  
OpenAI・Gemini・無料モード（ルールベース）に対応しており、**API キーなしでも動作**します。

## デモで試せること

| 機能 | 説明 | 画面 |
|------|------|------|
| 支出管理 | 登録・一覧・削除・編集 | `/` `/expenses` |
| カテゴリ別グラフ | 月ごとに切り替え可能な円グラフ、クリックで内訳表示 | `/` |
| 支出一覧（月別） | 月切り替え・カテゴリ別内訳モーダル・バッジクリックで絞り込み | `/expenses` |
| 自然言語入力 | 「ランチ500円」→ AI が自動仕訳 | `/` |
| RAG チャット | 「今月なぜ食費が増えた？」→ 登録データを根拠に回答 | `/chat` |
| 引用元表示 | どの支出データに基づくか明示 | `/chat` |

## 技術スタック

```
Frontend : React 19 / TypeScript / Next.js 16 / Tailwind CSS 4
Form     : React Hook Form + Zod
Chart    : Recharts
DB       : Supabase（PostgreSQL + pgvector）
AI       : Google Gemini API / OpenAI API / LangChain.js
         : Function Calling（自然言語入力）
         : RAG + Embeddings（チャット）
         : ルールベースフォールバック（API キー不要）
```

## AI プロバイダーについて

3つのモードに対応しています。`.env.local` の設定で切り替えられます。

| モード | 設定 | 特徴 |
|--------|------|------|
| **Gemini**（推奨） | `AI_PROVIDER=gemini` + `GEMINI_API_KEY=...` | 無料枠あり、高品質 |
| **OpenAI** | `AI_PROVIDER=openai` + `OPENAI_API_KEY=...` | embedding によるベクトル検索も利用可 |
| **無料モード** | キー不要 | ルールベース解析・キーワード検索で動作 |

`AI_PROVIDER` を未設定にした場合は、`GEMINI_API_KEY` → `OPENAI_API_KEY` → 無料モードの順で自動選択されます。

## セットアップ

### 1. 依存関係のインストール

```bash
cd moneymind-ai-2
npm install
```

### 2. 環境変数

`.env.example` を `.env.local` にコピーし、値を設定します。

```bash
cp .env.example .env.local
```

```env
# AI プロバイダー（gemini | openai | free）
AI_PROVIDER=gemini

# Google Gemini（https://aistudio.google.com/apikey で発行）
GEMINI_API_KEY=AQ.xxxx  # または AIza... 形式

# OpenAI（任意）
OPENAI_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # 秘密（Git に含めない）
```

| 変数 | 取得場所 |
|------|----------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `OPENAI_API_KEY` | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| Supabase 各キー | Supabase Dashboard → Project Settings → API |

### 3. Supabase SQL の実行

SQL Editor で **順番に** 実行します。

1. `docs/supabase/schema.sql` — テーブル作成
2. `docs/supabase/rag-functions.sql` — RAG ベクトル検索関数（OpenAI 利用時のみ必要）

### 4. 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。  
サーバーを止めるときは **`Ctrl + C`** を押します。

### 5. サンプルデータ投入（任意）

ダッシュボードの **「サンプル 40 件を投入」** ボタン（開発環境のみ）から投入できます。  
4〜6月分の支出 40 件が入り、グラフ・チャットのデモに使えます。

## 主な API

| メソッド | URL | 説明 |
|----------|-----|------|
| GET | `/api/expenses` | 支出一覧 |
| POST | `/api/expenses` | 支出登録 |
| PUT | `/api/expenses/[id]` | 支出更新 |
| DELETE | `/api/expenses/[id]` | 支出削除 |
| POST | `/api/natural-input` | 自然言語 → 支出データ解析 |
| POST | `/api/chat` | RAG チャット |
| GET | `/api/ai-status` | AI プロバイダーの設定確認（デバッグ用） |
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
│   ├── ai/                 # AI プロバイダー（Gemini / OpenAI / ルールベース）
│   ├── rag/                # RAG チャット・検索（LangChain + pgvector / キーワード）
│   ├── expenses/           # 支出 CRUD
│   └── seed/               # サンプルデータ投入
└── types/
```

## 開発コマンド

```bash
npm run dev      # 開発サーバー（Ctrl+C で停止）
npm run build    # 本番ビルド
npm run lint     # ESLint
```

## AI 機能の概要

### 自然言語入力

AI（Gemini / OpenAI）の Function Calling で `register_expense` ツールを呼び出し、金額・カテゴリ・日付を抽出します。  
API キーがない場合はルールベース（正規表現 + キーワードマッチ）で解析します。

```
「ランチ500円」→ { amount: 500, category: "食費", description: "ランチ", date: "2026-08-19" }
```

### RAG チャット

1. 質問をベクトル化（OpenAI embedding）またはキーワード検索（無料・Gemini モード）
2. 関連する支出データを取得
3. 月次サマリー + 引用データを AI に渡して回答生成
4. `SourceCitation` コンポーネントで引用元を表示

### フォールバック

API の利用制限（429）やキーエラー時は、自動的に次の手段へ切り替えます。

```
Gemini 2.5-flash → Gemini 2.0-flash-lite → ... → 無料モード
```

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| SSL エラー | `NODE_OPTIONS="--use-system-ca"` を設定 |
| Gemini が無料モードになる | `Ctrl+C` でサーバーを止めて `npm run dev` で再起動 |
| `401` / キーエラー | `.env.local` を保存 → サーバー再起動 → `/api/ai-status` で確認 |
| `429 quota exceeded` | 別モデルまたは別プロバイダーに切り替え |
| `relation "expenses" does not exist` | `schema.sql` を Supabase で実行 |
| ベクトル検索エラー | `rag-functions.sql` を実行（または Gemini / 無料モードに切り替え） |

## 関連ドキュメント

- [開発ログ](docs/PROJECT_LOG.md)
- [Supabase セットアップ](docs/supabase/README.md)

## ライセンス

Private（ポートフォリオ用途）
