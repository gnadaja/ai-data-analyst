alter table public.ai_datasets
  add column if not exists analysis_summary jsonb not null default '{}'::jsonb;
