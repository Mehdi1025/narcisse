-- Réparation : admin / employee (exécuter EN UN BLOC dans SQL Editor)
-- Ordre imposé par Postgres : policies → fonction → colonnes → ancien enum → renommer

-- A) Toutes les policies qui bloquent les colonnes ou le type
drop policy if exists worker_notifications on public.notifications;
drop policy if exists worker_notifications_update on public.notifications;
drop policy if exists admin_all_notifications on public.notifications;

drop policy if exists worker_read_workers on public.workers;
drop policy if exists worker_read_services on public.services;
drop policy if exists worker_reservations on public.reservations;
drop policy if exists worker_tasks_select on public.tasks;
drop policy if exists worker_unavail on public.unavailabilities;

-- B) Fonction liée à l'ancien enum (avant changement de colonne)
drop function if exists public.current_app_role();

-- C) Nouveau enum
do $$
begin
  create type public.app_role_v2 as enum ('admin', 'employee');
exception
  when duplicate_object then null;
end $$;

-- D) Colonnes : sortir de l'ancien app_role
alter table public.profiles drop constraint if exists profiles_worker_check;

alter table public.profiles
  alter column role type public.app_role_v2
  using (
    case role::text
      when 'admin' then 'admin'::public.app_role_v2
      else 'employee'::public.app_role_v2
    end
  );

alter table public.notifications
  alter column recipient type text
  using (
    case recipient::text
      when 'admin' then 'admin'
      when 'lina' then 'lina'
      when 't2' then 't2'
      else recipient::text
    end
  );

alter table public.profiles add constraint profiles_worker_check check (
  (role = 'admin' and worker_id is null)
  or (role = 'employee' and worker_id in ('lina', 't2'))
);

-- E) Ancien enum plus utilisé
drop type if exists public.app_role;

do $$
begin
  alter type public.app_role_v2 rename to app_role;
exception
  when undefined_object then null;
  when duplicate_object then
    raise notice 'app_role existe déjà — ignorer le rename';
end $$;

-- F) Corriger worker_id si besoin
update public.profiles
set worker_id = 'lina'
where role = 'employee'::public.app_role and (worker_id is null or worker_id not in ('lina', 't2'))
  and username = 'lina';

update public.profiles
set worker_id = 't2'
where role = 'employee'::public.app_role and username in ('travailleuse2', 't2');

-- G) Fonctions + policies
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_employee()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'employee'
  );
$$;

create policy admin_all_notifications on public.notifications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy worker_read_workers on public.workers for select to authenticated
  using (public.is_employee());

create policy worker_read_services on public.services for select to authenticated
  using (public.is_employee());

create policy worker_notifications on public.notifications for select to authenticated
  using (public.is_employee() and recipient = public.current_worker_id());

create policy worker_notifications_update on public.notifications for update to authenticated
  using (public.is_employee() and recipient = public.current_worker_id())
  with check (public.is_employee() and recipient = public.current_worker_id());