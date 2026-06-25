# Supabase セットアップ

## 1. SQL を実行する（順番に）

1. [Supabase Dashboard](https://supabase.com/dashboard) を開く
2. 対象プロジェクトを選択
3. 左メニュー **SQL Editor** → **New query**
4. 以下を **この順番で** 実行する

| 順番 | ファイル | 内容 |
|------|----------|------|
| 1 | `docs/supabase/schema.sql` | テーブル作成（expenses / expense_embeddings） |
| 2 | `docs/supabase/rag-functions.sql` | RAG ベクトル検索関数（Phase 4） |

## 2. テーブル確認

**Table Editor** で次の2つが表示されます。

- `expenses`
- `expense_embeddings`

## 3. サンプルデータ（Phase 5）

開発サーバー起動後、ダッシュボードの **「サンプル 40 件を投入」** を使うか:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/seed" `
  -ContentType "application/json" -Body "{}"
```

> `/api/seed` は開発環境（`npm run dev`）のみ利用できます。

## 4. API 動作確認

```powershell
npm run dev
```

### 支出を登録（POST）— PowerShell

```powershell
$body = @{
  amount      = 850
  category    = "食費"
  description = "ランチ"
  date        = "2026-06-17"
} | ConvertTo-Json -Compress

$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)

Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3000/api/expenses" `
  -ContentType "application/json; charset=utf-8" `
  -Body $bytes
```

### 一覧取得（GET）

```powershell
curl http://localhost:3000/api/expenses
```

### RAG チャット（POST）

```powershell
$body = '{"message":"今月の食費はいくら？"}'
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/chat" `
  -ContentType "application/json; charset=utf-8" `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```
