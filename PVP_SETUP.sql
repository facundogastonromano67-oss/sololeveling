-- Vida RPG V7 · esquema opcional para un futuro PvP online autenticado.
-- Para producción se recomienda resolver preguntas/daño en una Edge Function o servidor, no confiar en el cliente.
create table if not exists public.vida_rpg_battle_rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_id uuid not null references auth.users(id) on delete cascade,
  guest_id uuid references auth.users(id) on delete set null,
  status text not null default 'waiting',
  seed integer not null default 1,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.vida_rpg_battle_answers (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.vida_rpg_battle_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  round integer not null,
  answer_index integer not null,
  response_ms integer not null,
  created_at timestamptz not null default now(),
  unique(room_id,user_id,round)
);
alter table public.vida_rpg_battle_rooms enable row level security;
alter table public.vida_rpg_battle_answers enable row level security;
create policy "battle participants read rooms" on public.vida_rpg_battle_rooms for select using (auth.uid()=host_id or auth.uid()=guest_id);
create policy "host creates room" on public.vida_rpg_battle_rooms for insert with check (auth.uid()=host_id);
create policy "participants update room prototype" on public.vida_rpg_battle_rooms for update using (auth.uid()=host_id or auth.uid()=guest_id);
create policy "participants read answers" on public.vida_rpg_battle_answers for select using (exists(select 1 from public.vida_rpg_battle_rooms r where r.id=room_id and (r.host_id=auth.uid() or r.guest_id=auth.uid())));
create policy "player inserts own answer" on public.vida_rpg_battle_answers for insert with check (auth.uid()=user_id);
