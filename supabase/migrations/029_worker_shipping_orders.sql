-- 029 — employées : gérer les commandes livraison (même file que l'admin, sync Supabase)

drop function if exists public.employee_transition_shop_order(uuid, public.shop_order_status, text);

create or replace function public.employee_list_shop_orders()
returns setof public.shop_orders
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.has_boutique_skill() then
    raise exception 'Accès réservé à l''équipe boutique';
  end if;
  return query
  select *
  from public.shop_orders o
  where o.payment_status = 'paid'
    and (
      (o.fulfillment = 'pickup' and o.status in ('paid', 'preparing', 'ready_pickup'))
      or (o.fulfillment = 'shipping' and o.status in ('paid', 'preparing', 'shipped'))
    )
  order by
    case o.fulfillment
      when 'pickup' then 0
      else 1
    end,
    case o.status
      when 'ready_pickup' then 0
      when 'shipped' then 0
      when 'preparing' then 1
      else 2
    end,
    o.created_at asc;
end;
$$;

create or replace function public.employee_transition_shop_order(
  p_order_id uuid,
  p_status public.shop_order_status,
  p_confirm_name text default null,
  p_admin_note text default null
)
returns public.shop_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.shop_orders%rowtype;
  note text;
begin
  if not public.has_boutique_skill() then
    raise exception 'Accès réservé à l''équipe boutique';
  end if;

  select * into o from public.shop_orders where id = p_order_id for update;
  if not found then
    raise exception 'Commande introuvable';
  end if;

  if o.payment_status <> 'paid' then
    raise exception 'Commande non payée';
  end if;

  if p_status = 'preparing' and o.status in ('paid', 'preparing') then
    null;
  elsif p_status = 'ready_pickup' and o.fulfillment = 'pickup' and o.status in ('preparing', 'paid') then
    null;
  elsif p_status = 'shipped' and o.fulfillment = 'shipping' and o.status in ('preparing', 'paid') then
    null;
  elsif p_status = 'delivered' and o.fulfillment = 'pickup' and o.status = 'ready_pickup' then
    if public.normalize_person_name(p_confirm_name) <> public.normalize_person_name(o.customer_name) then
      raise exception 'Le nom ne correspond pas à la commande';
    end if;
  elsif p_status = 'delivered' and o.fulfillment = 'shipping' and o.status = 'shipped' then
    null;
  else
    raise exception 'Transition non autorisée';
  end if;

  note := nullif(trim(coalesce(p_admin_note, '')), '');

  update public.shop_orders
  set
    status = p_status,
    admin_note = case when note is not null then note else admin_note end,
    updated_at = now()
  where id = p_order_id
  returning * into o;

  return o;
end;
$$;

grant execute on function public.employee_transition_shop_order(uuid, public.shop_order_status, text, text) to authenticated;