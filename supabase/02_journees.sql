-- FocusRoutine : une ligne par client et par jour, avec la liste des blocs de la routine.

create table public.journees (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  jour date not null,
  blocs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, jour)
);

grant select, insert, update on public.journees to authenticated;
grant select, insert, update, delete on public.journees to service_role;

alter table public.journees enable row level security;

-- Chaque client ne voit et ne modifie que ses propres journées.
create policy "Chaque client lit ses journées"
  on public.journees for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Chaque client crée ses journées"
  on public.journees for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Chaque client modifie ses journées"
  on public.journees for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
