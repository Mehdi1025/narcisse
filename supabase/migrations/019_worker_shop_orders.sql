-- Travailleuses avec compétence « Boutique » : préparation et retrait

create or replace function public.has_boutique_skill()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.is_admin(),
    (
      select exists (
        select 1
        from public.profiles p
        join public.workers w on w.id = p.worker_id
        where p.id = auth.uid()
          and p.role = 'employee'
          and 'Boutique' = any (w.skills)
      )
    ),
    false
  );
$$;

create or replace function public.normalize_person_name(t text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(trim(coalesce(t, '')), '\s+', ' ', 'g'));
$$;

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
    and o.status in ('paid', 'preparing', 'ready_pickup')
  order by
    case o.status
      when 'ready_pickup' then 0
      when 'preparing' then 1
      else 2
    end,
    o.created_at asc;
end;
$$;

create or replace function public.employee_transition_shop_order(
  p_order_id uuid,
  p_status public.shop_order_status,
  p_confirm_name text default null
)
returns public.shop_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.shop_orders%rowtype;
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
  elsif p_status = 'ready_pickup' and o.status in ('preparing', 'paid') then
    null;
  elsif p_status = 'delivered' and o.status = 'ready_pickup' and o.fulfillment = 'pickup' then
    if public.normalize_person_name(p_confirm_name) <> public.normalize_person_name(o.customer_name) then
      raise exception 'Le nom ne correspond pas à la commande';
    end if;
  else
    raise exception 'Transition non autorisée';
  end if;

  update public.shop_orders set status = p_status, updated_at = now() where id = p_order_id returning * into o;
  return o;
end;
$$;

create or replace function public.employee_pickup_by_order_number(
  p_order_number text,
  p_confirm_name text
)
returns public.shop_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.shop_orders%rowtype;
begin
  if not public.has_boutique_skill() then
    raise exception 'Accès réservé à l''équipe boutique';
  end if;

  select * into o from public.shop_orders where order_number = trim(p_order_number) for update;
  if not found then
    raise exception 'Numéro de commande introuvable';
  end if;

  return public.employee_transition_shop_order(o.id, 'delivered', p_confirm_name);
end;
$$;

-- Lire les lignes d'une commande (équipe boutique)
drop policy if exists shop_orders_boutique_select on public.shop_orders;
drop policy if exists shop_order_lines_boutique_select on public.shop_order_lines;

create policy shop_orders_boutique_select on public.shop_orders
  for select to authenticated
  using (
    public.has_boutique_skill()
    and payment_status = 'paid'
    and status in ('paid', 'preparing', 'ready_pickup', 'delivered', 'shipped')
  );

create policy shop_order_lines_boutique_select on public.shop_order_lines
  for select to authenticated
  using (
    exists (
      select 1 from public.shop_orders o
      where o.id = order_id and public.has_boutique_skill()
    )
  );

grant execute on function public.has_boutique_skill() to authenticated;
grant execute on function public.employee_list_shop_orders() to authenticated;
grant execute on function public.employee_transition_shop_order(uuid, public.shop_order_status, text) to authenticated;
grant execute on function public.employee_pickup_by_order_number(text, text) to authenticated;

-- Démo : Lina peut aussi gérer la boutique (sinon compétence réservée à Travailleuse 2)
update public.workers
set skills = skills || array['Boutique']::text[]
where id = 'lina' and not ('Boutique' = any (skills));