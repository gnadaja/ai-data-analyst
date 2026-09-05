alter table public.ai_datasets
  add column if not exists duplicate_rows bigint not null default 0;
