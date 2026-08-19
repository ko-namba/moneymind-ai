-- MoneyMind Phase 1: Supabase テーブル定義
-- 実行場所: Supabase Dashboard → SQL Editor → New query → Run

-- pgvector 拡張（RAG 用。Phase 4 で embedding を使う）
create extension if not exists vector;

-- 支出テーブル
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  amount integer not null check (amount > 0 and amount <= 10000000),
  category text not null check (
    category in ('食費', '交通', '娯楽', '日用品', '医療', 'その他')
  ),
  description text not null default '',
  date date not null,
  created_at timestamptz not null default now()
);

-- RAG 用ベクトルテーブル
create table if not exists public.expense_embeddings (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index if not exists expenses_date_idx on public.expenses (date desc);
create index if not exists expense_embeddings_expense_id_idx
  on public.expense_embeddings (expense_id);

-- Phase 4 でデータ投入後にベクトル検索用インデックスを追加:
-- create index expense_embeddings_embedding_idx
--   on public.expense_embeddings using hnsw (embedding vector_cosine_ops);

-- RLS（API は service_role 使用のためバイパスされる）
alter table public.expenses enable row level security;
alter table public.expense_embeddings enable row level security;
