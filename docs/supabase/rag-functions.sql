-- MoneyMind Phase 4: RAG ベクトル検索用関数
-- 実行場所: Supabase Dashboard → SQL Editor（schema.sql 実行後）

create or replace function public.match_expense_embeddings(
  query_embedding vector(1536),
  match_count int default 5,
  match_threshold float default 0.3
)
returns table (
  id uuid,
  expense_id uuid,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    ee.id,
    ee.expense_id,
    ee.content,
    1 - (ee.embedding <=> query_embedding) as similarity
  from public.expense_embeddings ee
  where ee.embedding is not null
    and 1 - (ee.embedding <=> query_embedding) >= match_threshold
  order by ee.embedding <=> query_embedding
  limit match_count;
$$;

-- データ投入後にベクトル検索用インデックス（任意・件数が増えたら実行）
-- create index if not exists expense_embeddings_embedding_idx
--   on public.expense_embeddings using hnsw (embedding vector_cosine_ops);
