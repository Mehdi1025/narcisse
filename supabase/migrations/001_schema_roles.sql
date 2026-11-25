-- Narcisse — schéma + rôles + RLS
-- Exécuter dans Supabase → SQL Editor (dans l’ordre des fichiers numérotés)

-- ─── Extensions ───
create extension if not exists "pgcrypto";

-- ─── Enums (alignés sur lib/app/types.ts) ───
create type public.app_role as enum ('admin', 'lina', 't2');
create type public.pole as enum ('mentale', 'physique', 'sociale', 'transverse');
create type public.reservation_status as enum (
  'a_affecter', 'confirmee', 'en_cours', 'terminee', 'annulee', 'absence'
);
create type public.reservation_source as enum ('en_ligne', 'comptoir');
create type public.task_status as enum (
  'disponible', 'demandee', 'attribuee', 'en_cours', 'terminee', 'validee'
);
create type public.task_priority as enum ('basse', 'normale', 'haute');
create type public.unavailability_status as enum ('en_attente', 'validee', 'refusee');

-- ─── Référentiels ───
create table public.workers (
  id text primary key check (id in ('lina', 't2')),
  name text not null,
  initials text not null,
  work_days smallint[] not null default '{}',
  hours_start numeric(4, 2) not null,
  hours_end numeric(4, 2) not null,
  service_ids text[] not null default '{}',
  skills text[] not null default '{}'
);

-- ─── Profils (liés à auth.users) ───
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  worker_id text references public.workers (id) on delete set null,
  username text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint profiles_worker_check check (
    (role = 'admin' and worker_id is null)
    or (role in ('lina', 't2') and worker_id = role::text)
  )
);

create index profiles_role_idx on public.profiles (role);

create table public.services (
  id text primary key,
  name text not null,
  pole public.pole not null,
  duration_minutes int not null check (duration_minutes > 0)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null default '—',
  created_at timestamptz not null default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  service_id text not null references public.services (id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  worker_id text references public.workers (id) on delete set null,
  preference text references public.workers (id) on delete set null,
  status public.reservation_status not null default 'a_affecter',
  source public.reservation_source not null default 'comptoir',
  note text,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  pole public.pole not null,
  skill text,
  priority public.task_priority not null default 'normale',
  due_at timestamptz not null,
  requires_validation boolean not null default false,
  status public.task_status not null default 'disponible',
  assignee text references public.workers (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.unavailabilities (
  id uuid primary key default gen_random_uuid(),
  worker_id text not null references public.workers (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text not null default '',
  status public.unavailability_status not null default 'en_attente',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient public.app_role not null,
  body text not null,
  at timestamptz not null default now(),
  read boolean not null default false
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  actor text not null,
  body text not null
);

-- ─── Helpers RLS ───
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_worker_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select worker_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ─── Trigger : profil à l’inscription (metadata role / username) ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.app_role;
  w text;
  uname text;
  dname text;
begin
  uname := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));
  dname := coalesce(new.raw_user_meta_data ->> 'display_name', uname);
  r := coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'lina');
  w := case when r = 'admin' then null else r::text end;

  insert into public.profiles (id, role, worker_id, username, display_name)
  values (new.id, r, w, uname, dname)
  on conflict (id) do update set
    role = excluded.role,
    worker_id = excluded.worker_id,
    username = excluded.username,
    display_name = excluded.display_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── RLS ───
alter table public.profiles enable row level security;
alter table public.workers enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.reservations enable row level security;
alter table public.tasks enable row level security;
alter table public.unavailabilities enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;

-- Profils : soi-même ; admin lit tout
create policy profiles_select_self on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Admin : accès complet sur les tables métier
create policy admin_all_workers on public.workers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all_services on public.services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all_clients on public.clients for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all_reservations on public.reservations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all_tasks on public.tasks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all_unavail on public.unavailabilities for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all_notifications on public.notifications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all_log on public.activity_log for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Travailleuses : lecture référentiels
create policy worker_read_workers on public.workers for select to authenticated
  using (public.current_app_role() in ('lina', 't2'));
create policy worker_read_services on public.services for select to authenticated
  using (public.current_app_role() in ('lina', 't2'));

-- Réservations : les siennes (+ créer / mettre à jour limité plus tard)
create policy worker_reservations on public.reservations for select to authenticated
  using (
    public.current_worker_id() is not null
    and worker_id = public.current_worker_id()
  );
create policy worker_tasks_select on public.tasks for select to authenticated
  using (
    public.current_worker_id() is not null
    and (assignee = public.current_worker_id() or status = 'disponible')
  );
create policy worker_unavail on public.unavailabilities for all to authenticated
  using (worker_id = public.current_worker_id())
  with check (worker_id = public.current_worker_id());

create policy worker_notifications on public.notifications for select to authenticated
  using (recipient = public.current_app_role());
create policy worker_notifications_update on public.notifications for update to authenticated
  using (recipient = public.current_app_role())
  with check (recipient = public.current_app_role());