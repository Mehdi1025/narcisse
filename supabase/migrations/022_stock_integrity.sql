-- 022 — Intégrité du stock (audit NAR-AUD-002 : B1, B1 bis, B3, B4)
-- Prérequis : 021_security_hardening appliquée.

begin;

insert into public.shop_settings (key, value) values ('reservation_minutes', '35'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

alter table public.shop_orders add column if not exists stock_issue boolean not null default false;
create index if not exists shop_orders_stock_issue_idx on public.shop_orders (stock_issue) where stock_issue;

create or replace function public.reserve_stock_for_order(p_order_id uuid, p_minutes int default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  mins int := greatest(31, coalesce(
    p_minutes,
    (select (value #>> '{}')::int from public.shop_settings where key = 'reservation_minutes'),
    35));
  exp timestamptz := now() + make_interval(mins => mins);
  ln record;
  avail int;
begin
  perform public.release_expired_stock_reservations();

  if exists (select 1 from public.stock_reservations where order_id = p_order_id) then
    raise exception 'Réservation déjà existante pour cette commande';
  end if;

  for ln in
    select product_id, sum(quantity)::int as quantity
    from public.shop_order_lines
    where order_id = p_order_id and product_id is not null
    group by product_id
    order by product_id
  loop
    select stock_on_hand - stock_reserved into avail
    from public.products where id = ln.product_id for update;
    if not found then raise exception 'Produit supprimé'; end if;
    if avail < ln.quantity then raise exception 'Stock insuffisant pour finaliser la commande'; end if;

    update public.products set stock_reserved = stock_reserved + ln.quantity where id = ln.product_id;

    insert into public.stock_reservations (order_id, product_id, quantity, expires_at)
    values (p_order_id, ln.product_id, ln.quantity, exp);

    insert into public.stock_movements (product_id, delta, reason, order_id, note)
    values (ln.product_id, 0, 'reservation', p_order_id, 'Réservation paiement : ' || ln.quantity);
  end loop;
end;
$$;

create or replace function public.commit_reserved_stock_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ln record;
  res int;
  onhand int;
  reserved int;
  issues text[] := '{}';
begin
  for ln in
    select l.product_id, sum(l.quantity)::int as quantity, min(l.product_name) as name
    from public.shop_order_lines l
    where l.order_id = p_order_id and l.product_id is not null
    group by l.product_id
    order by l.product_id
  loop
    select stock_on_hand, stock_reserved into onhand, reserved
    from public.products where id = ln.product_id for update;

    if not found then
      issues := issues || (ln.name || ' (produit supprimé)');
      continue;
    end if;

    select quantity into res from public.stock_reservations
    where order_id = p_order_id and product_id = ln.product_id;

    if found and onhand >= ln.quantity then
      update public.products
      set stock_on_hand = stock_on_hand - ln.quantity,
          stock_reserved = greatest(0, stock_reserved - res)
      where id = ln.product_id;
      insert into public.stock_movements (product_id, delta, reason, order_id)
      values (ln.product_id, -ln.quantity, 'vente_en_ligne', p_order_id);

    elsif not found and onhand - reserved >= ln.quantity then
      update public.products set stock_on_hand = stock_on_hand - ln.quantity where id = ln.product_id;
      insert into public.stock_movements (product_id, delta, reason, order_id, note)
      values (ln.product_id, -ln.quantity, 'vente_en_ligne', p_order_id, 'Sans réservation (paiement après expiration)');

    else
      issues := issues || (ln.name || ' ×' || ln.quantity);
      if found then
        update public.products set stock_reserved = greatest(0, stock_reserved - res) where id = ln.product_id;
      end if;
    end if;
  end loop;

  delete from public.stock_reservations where order_id = p_order_id;

  if array_length(issues, 1) > 0 then
    update public.shop_orders
    set stock_issue = true,
        admin_note = concat_ws(E'\n', admin_note, 'Stock à vérifier : ' || array_to_string(issues, ', '))
    where id = p_order_id;
  end if;
end;
$$;

create or replace function public.release_stock_reservation_for_order(p_order_id uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare r record;
begin
  for r in select * from public.stock_reservations where order_id = p_order_id order by product_id
  loop
    update public.products set stock_reserved = greatest(0, stock_reserved - r.quantity) where id = r.product_id;
    insert into public.stock_movements (product_id, delta, reason, order_id, note)
    values (r.product_id, 0, 'liberation', p_order_id, coalesce(p_note, 'Réservation libérée'));
  end loop;
  delete from public.stock_reservations where order_id = p_order_id;
end;
$$;

create or replace function public.set_product_stock(p_product_id uuid, p_target int, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare onhand int; reserved int; d int;
begin
  if not public.is_admin() then raise exception 'Accès réservé à l''administration'; end if;
  if p_target is null or p_target < 0 then raise exception 'Quantité invalide'; end if;

  select stock_on_hand, stock_reserved into onhand, reserved
  from public.products where id = p_product_id for update;
  if not found then raise exception 'Produit introuvable'; end if;
  if p_target < reserved then
    raise exception 'Le stock ne peut pas être inférieur au stock réservé (%)', reserved;
  end if;

  d := p_target - onhand;
  if d = 0 then return; end if;

  update public.products set stock_on_hand = p_target where id = p_product_id;
  insert into public.stock_movements (product_id, delta, reason, note, created_by)
  values (p_product_id, d, 'inventaire', coalesce(nullif(trim(p_note), ''), 'Inventaire'), auth.uid());
end;
$$;

revoke execute on function public.set_product_stock(uuid, int, text) from public, anon;
grant execute on function public.set_product_stock(uuid, int, text) to authenticated, service_role;

create or replace function public.products_protect_stock()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;
  if tg_op = 'INSERT' and (new.stock_on_hand <> 0 or new.stock_reserved <> 0) then
    raise exception 'Le stock initial se saisit par un ajustement (adjust_product_stock)' using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' and (new.stock_on_hand is distinct from old.stock_on_hand
                           or new.stock_reserved is distinct from old.stock_reserved) then
    raise exception 'Le stock se modifie uniquement par un ajustement tracé' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists products_protect_stock on public.products;
create trigger products_protect_stock
  before insert or update on public.products
  for each row execute function public.products_protect_stock();

do $$
declare p record; real_reserved int;
begin
  for p in select id, stock_reserved from public.products order by id for update loop
    select coalesce(sum(quantity), 0)::int into real_reserved
    from public.stock_reservations where product_id = p.id;
    if real_reserved <> p.stock_reserved then
      insert into public.stock_movements (product_id, delta, reason, note)
      values (p.id, 0, 'inventaire', 'Correction du stock réservé : ' || p.stock_reserved || ' → ' || real_reserved);
      update public.products set stock_reserved = real_reserved where id = p.id;
    end if;
  end loop;
end $$;

do $idx$
begin
  if exists (
    select 1 from public.shop_order_lines where product_id is not null
    group by order_id, product_id having count(*) > 1
  ) then
    raise notice 'Doublons existants dans shop_order_lines : index unique non créé';
  else
    create unique index if not exists shop_order_lines_order_product_uidx
      on public.shop_order_lines (order_id, product_id) where product_id is not null;
  end if;
end $idx$;

commit;