# React + TypeScript で AI 家計簿を作った — Function Calling と RAG の実装

> Zenn 公開用ドラフト。スクリーンショット・デモ URL は公開前に追記してください。

## はじめに

転職活動用に、**AI 機能付き家計簿**「MoneyMind」を開発しました。  
普通の CRUD 家計簿では差別化しづらいため、次の 2 つを Must 要件にしました。

1. **自然言語入力** — 「ランチ500円」で自動仕訳（OpenAI Function Calling）
2. **RAG チャット** — 「今月なぜ食費が増えた？」に根拠付きで回答（LangChain + pgvector）

## 技術選定

| 領域 | 選定 | 理由 |
|------|------|------|
| フロント | Next.js 16 + React 19 | App Router / TypeScript の転職需要 |
| DB | Supabase + pgvector | PostgreSQL + ベクトル検索を一体運用 |
| AI | OpenAI API | Function Calling / Embeddings の実績 |
| RAG | LangChain.js | プロンプトチェーンの構成が明確 |

## アーキテクチャ

```
[ブラウザ]
  ├─ 自然言語入力 → POST /api/natural-input → OpenAI Function Calling
  ├─ RAG チャット   → POST /api/chat          → Embedding → pgvector → LangChain
  └─ 支出 CRUD      → /api/expenses           → Supabase

[Supabase]
  ├─ expenses            … 支出マスタ
  └─ expense_embeddings  … RAG 用テキスト + vector(1536)
```

## 1. 自然言語入力（Function Calling）

### ツール定義

`register_expense` 関数を定義し、モデルに必ず呼び出させます。

```typescript
const registerExpenseTool = {
  type: "function",
  function: {
    name: "register_expense",
    parameters: {
      type: "object",
      properties: {
        amount: { type: "integer" },
        category: { type: "string", enum: ["食費", "交通", ...] },
        description: { type: "string" },
        date: { type: "string" },
      },
      required: ["amount", "category", "description", "date"],
    },
  },
};
```

### ポイント

- `tool_choice` で関数呼び出しを強制し、解析結果を Zod で検証
- UI では「解析 → プレビュー → 登録」の 2 ステップにし、誤登録を防止

## 2. RAG チャット

### データ設計

支出登録時に、RAG 用テキストを `expense_embeddings` に保存します。

```
2026-06-17 | 食費 | ランチ | 850円
```

### 検索フロー

1. ユーザーの質問を `text-embedding-3-small` でベクトル化
2. Supabase の `match_expense_embeddings`（pgvector）で類似検索
3. 月次サマリー + 引用データを LangChain プロンプトに注入
4. `gpt-4o-mini` が回答を生成

### 引用元表示

回答だけでなく、参照した支出を `SourceCitation` コンポーネントで表示します。  
「AI が何を根拠に答えたか」を面接・デモで説明しやすくするための Must 機能です。

```tsx
<SourceCitation sources={response.sources} />
```

## 3. ハマりどころ

### API キーの取り違え

`.env.local` の `OPENAI_API_KEY` に Supabase キーを入れると `401` になります。  
`sk-` プレフィックスの検証を入れて早期に気づけるようにしました。

### OpenAI クレジット不足

`429 quota exceeded` は課金設定の問題です。  
開発中は通常フォームで CRUD を先に完成させ、AI はクレジット追加後に検証するのが現実的でした。

### embedding の遅延生成

初期は `embedding: null` で保存し、チャット時に一括補完する方式にしました。  
サンプルデータ 40 件投入時は OpenAI コストを抑えるため、embedding は初回チャット時に生成されます。

## まとめ

- **Function Calling** で入力 UX を改善
- **RAG + 引用元** で「なぜその回答か」を説明可能に
- **TypeScript フルスタック** で API〜UI まで一貫した型安全

リポジトリ: （GitHub URL を追記）  
デモ: （Vercel URL を追記 — Phase 6）

## 参考リンク

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [LangChain.js](https://js.langchain.com/)
- [Supabase pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)
