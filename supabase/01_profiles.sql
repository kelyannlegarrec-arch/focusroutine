-- FocusRoutine : une fiche "profil" par client, créée automatiquement à l'inscription.
-- Le statut d'abonnement sera rempli par Stripe (étape 4).

create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  subscription_status text not null default 'inactive',
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  primary key (id)
);

-- Droits : le client peut seulement LIRE sa fiche. Seul le serveur (Stripe) peut la modifier.
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

-- Sécurité ligne par ligne : chacun ne voit que sa propre fiche.
alter table public.profiles enable row level security;

create policy "Chaque client lit sa propre fiche"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- Crée la fiche automatiquement à chaque inscription.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
