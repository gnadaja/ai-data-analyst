create extension if not exists "pgcrypto";

create table if not exists public.ai_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  file_path text not null unique,
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  mime_type text not null,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'ready', 'failed')),
  error_message text,
  row_count bigint,
  column_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_dataset_columns (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.ai_datasets(id) on delete cascade,
  name text not null,
  data_type text not null,
  position integer not null check (position >= 0),
  missing_count bigint not null default 0,
  unique (dataset_id, name)
);

create table if not exists public.ai_usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  ai_messages integer not null default 0 check (ai_messages >= 0),
  primary key (user_id, period_start)
);

alter table public.ai_profiles enable row level security;
alter table public.ai_datasets enable row level security;
alter table public.ai_dataset_columns enable row level security;
alter table public.ai_usage_counters enable row level security;

drop policy if exists "Users can view own profile" on public.ai_profiles;
create policy "Users can view own profile" on public.ai_profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "Users can update own profile" on public.ai_profiles;
create policy "Users can update own profile" on public.ai_profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Users can view own datasets" on public.ai_datasets;
create policy "Users can view own datasets" on public.ai_datasets
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "Users can create own datasets" on public.ai_datasets;
create policy "Users can create own datasets" on public.ai_datasets
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users can update own datasets" on public.ai_datasets;
create policy "Users can update own datasets" on public.ai_datasets
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users can delete own datasets" on public.ai_datasets;
create policy "Users can delete own datasets" on public.ai_datasets
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "Users can view own dataset columns" on public.ai_dataset_columns;
create policy "Users can view own dataset columns" on public.ai_dataset_columns
  for select to authenticated using (
    exists (select 1 from public.ai_datasets d where d.id = dataset_id and d.user_id = auth.uid())
  );

drop policy if exists "Users can manage own dataset columns" on public.ai_dataset_columns;
create policy "Users can manage own dataset columns" on public.ai_dataset_columns
  for all to authenticated using (
    exists (select 1 from public.ai_datasets d where d.id = dataset_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.ai_datasets d where d.id = dataset_id and d.user_id = auth.uid())
  );

drop policy if exists "Users can view own usage" on public.ai_usage_counters;
create policy "Users can view own usage" on public.ai_usage_counters
  for select to authenticated using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('ai-datasets', 'ai-datasets', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can upload own datasets" on storage.objects;
create policy "Users can upload own datasets" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'ai-datasets' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can read own datasets" on storage.objects;
create policy "Users can read own datasets" on storage.objects
  for select to authenticated using (
    bucket_id = 'ai-datasets' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own datasets" on storage.objects;
create policy "Users can delete own datasets" on storage.objects
  for delete to authenticated using (
    bucket_id = 'ai-datasets' and (storage.foldername(name))[1] = auth.uid()::text
  );

create or replace function public.handle_new_ai_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.ai_profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_ai_profile on auth.users;
create trigger on_auth_user_created_ai_profile
after insert on auth.users
for each row execute function public.handle_new_ai_profile();
