-- Validation admin des ateliers (contourne les soucis RLS / service role manquant)

create or replace function public.admin_list_workshops()
returns setof public.workshops
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé à l''administration';
  end if;
  return query
    select * from public.workshops
    order by starts_at desc;
end;
$$;

create or replace function public.admin_review_workshop(
  p_workshop_id uuid,
  p_action text,
  p_note text default null
)
returns public.workshops
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.workshops%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Accès réservé à l''administration';
  end if;

  if p_action = 'publish' then
    update public.workshops
    set
      status = 'published',
      published_at = now(),
      admin_note = nullif(trim(p_note), ''),
      updated_at = now()
    where id = p_workshop_id
      and status in ('pending', 'draft')
    returning * into w;
  elsif p_action = 'reject' then
    update public.workshops
    set
      status = 'rejected',
      admin_note = nullif(trim(p_note), ''),
      updated_at = now()
    where id = p_workshop_id
      and status in ('pending', 'draft')
    returning * into w;
  else
    raise exception 'Action inconnue';
  end if;

  if w.id is null then
    raise exception 'Atelier introuvable ou déjà traité';
  end if;

  return w;
end;
$$;

grant execute on function public.admin_list_workshops() to authenticated;
grant execute on function public.admin_review_workshop(uuid, text, text) to authenticated;