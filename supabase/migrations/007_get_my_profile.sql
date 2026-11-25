-- Lecture du profil connecté (contourne RLS / grants manquants, sans clé service_role côté Vercel)

grant usage on schema public to authenticated, service_role;

grant select on table public.profiles to service_role;
grant select on all tables in schema public to service_role;

create or replace function public.get_my_profile()
returns table (role public.app_role, worker_id text)
language sql
stable
security definer
set search_path = public
as $$
  select p.role, p.worker_id
  from public.profiles p
  where p.id = auth.uid();
$$;

revoke all on function public.get_my_profile() from public;
grant execute on function public.get_my_profile() to authenticated;