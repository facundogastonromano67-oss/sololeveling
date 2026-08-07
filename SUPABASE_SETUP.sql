-- Vida RPG V6 · Supabase setup opcional
-- Ejecutar una sola vez en SQL Editor.
create table if not exists public.vida_rpg_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.vida_rpg_profiles enable row level security;
create policy "read own vida rpg profile" on public.vida_rpg_profiles
  for select using (auth.uid() = user_id);
create policy "insert own vida rpg profile" on public.vida_rpg_profiles
  for insert with check (auth.uid() = user_id);
create policy "update own vida rpg profile" on public.vida_rpg_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
