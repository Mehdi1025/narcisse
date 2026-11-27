-- 024 — has_boutique_skill : coalesce(false, …) court-circuitait le test employée (019)

create or replace function public.has_boutique_skill()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.profiles p
    join public.workers w on w.id = p.worker_id
    where p.id = auth.uid()
      and p.role = 'employee'
      and 'Boutique' = any (w.skills)
  );
$$;

grant execute on function public.has_boutique_skill() to authenticated;