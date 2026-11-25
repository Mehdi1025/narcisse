-- Stock unifié (site + comptoir), réservations paiement, journal des mouvements
-- Numérotée 015 car elle dépend de 014_shop_orders (réservations liées aux commandes).

create table if not exists public.shop_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.shop_settings (key, value) values
  ('reservation_minutes', '30'::jsonb),
  ('pickup_reminder_days', '14'::jsonb),
  ('gift_card_validity_months', '12'::jsonb),
  ('stock_alert_threshold_default', '3'::jsonb),
  ('shipping_enabled', 'false'::jsonb),
  ('vat_rate_default', '0.2'::jsonb)
on conflict (key) do nothing;

alter table public.products
  add column if not exists stock_on_hand int not null default 0,
  add column if not exists stock_reserved int not null default 0,
  add column if not exists stock_alert_threshold int not null default 3;

alter table public.products
  drop constraint if exists products_stock_nonneg;

alter table public.products
  add constraint products_stock_nonneg check (
    stock_on_hand >= 0 and stock_reserved >= 0 and stock_alert_threshold >= 0 and stock_reserved <= stock_on_hand
  );

create type public.stock_movement_reason as enum (
  'vente_en_ligne',
  'vente_comptoir',
  'reception_fournisseur',
  'retour',
  'casse',
  'inventaire',
  'reservation',
  'liberation'
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  delta int not null,
  reason public.stock_movement_reason not null,
  order_id uuid references public.shop_orders (id) on delete set null,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_idx on public.stock_movements (product_id, created_at desc);

create table if not exists public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity int not null check (quantity > 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create index if not exists stock_reservations_expires_idx on public.stock_reservations (expires_at);

-- Ajustement manuel (inventaire, réception…) — append-only via mouvements
create or replace function public.adjust_product_stock(
  p_product_id uuid,
  p_delta int,
  p_reason public.stock_movement_reason,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé à l''administration';
  end if;
  if p_delta = 0 then
    return;
  end if;

  perform 1 from public.products where id = p_product_id for update;
  if not found then
    raise exception 'Produit introuvable';
  end if;

  update public.products
  set stock_on_hand = stock_on_hand + p_delta
  where id = p_product_id
    and stock_on_hand + p_delta >= stock_reserved;

  if not found then
    raise exception 'Stock insuffisant après ajustement';
  end if;

  insert into public.stock_movements (product_id, delta, reason, note, created_by)
  values (p_product_id, p_delta, p_reason, nullif(trim(p_note), ''), auth.uid());
end;
$$;

create or replace function public.reserve_stock_for_order(
  p_order_id uuid,
  p_minutes int default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  mins int := coalesce(
    p_minutes,
    (select (value #>> '{}')::int from public.shop_settings where key = 'reservation_minutes' limit 1),
    30
  );
  ln record;
  avail int;
  exp timestamptz := now() + make_interval(mins => mins);
begin
  perform public.release_expired_stock_reservations();

  for ln in
    select product_id, quantity from public.shop_order_lines where order_id = p_order_id and product_id is not null
  loop
    select (stock_on_hand - stock_reserved) into avail from public.products where id = ln.product_id for update;
    if not found then
      raise exception 'Produit supprimé';
    end if;
    if avail < ln.quantity then
      raise exception 'Stock insuffisant pour finaliser la commande';
    end if;

    update public.products set stock_reserved = stock_reserved + ln.quantity where id = ln.product_id;

    insert into public.stock_reservations (order_id, product_id, quantity, expires_at)
    values (p_order_id, ln.product_id, ln.quantity, exp)
  on conflict (order_id, product_id) do update
    set quantity = excluded.quantity, expires_at = excluded.expires_at;

    insert into public.stock_movements (product_id, delta, reason, order_id, note)
    values (ln.product_id, 0, 'reservation', p_order_id, 'Réservation paiement');
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
  r record;
begin
  for r in select * from public.stock_reservations where order_id = p_order_id
  loop
    update public.products
    set
      stock_on_hand = stock_on_hand - r.quantity,
      stock_reserved = stock_reserved - r.quantity
    where id = r.product_id
      and stock_on_hand >= r.quantity
      and stock_reserved >= r.quantity;

    if not found then
      raise exception 'Stock incohérent pour le produit %', r.product_id;
    end if;

    insert into public.stock_movements (product_id, delta, reason, order_id)
    values (r.product_id, -r.quantity, 'vente_en_ligne', p_order_id);
  end loop;

  delete from public.stock_reservations where order_id = p_order_id;
end;
$$;

create or replace function public.release_stock_reservation_for_order(
  p_order_id uuid,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in select * from public.stock_reservations where order_id = p_order_id
  loop
    update public.products
    set stock_reserved = stock_reserved - r.quantity
    where id = r.product_id and stock_reserved >= r.quantity;

    insert into public.stock_movements (product_id, delta, reason, order_id, note)
    values (r.product_id, 0, 'liberation', p_order_id, coalesce(p_note, 'Réservation libérée'));
  end loop;

  delete from public.stock_reservations where order_id = p_order_id;
end;
$$;

create or replace function public.release_expired_stock_reservations()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  o record;
  n int := 0;
begin
  for o in
    select distinct order_id from public.stock_reservations where expires_at < now()
  loop
    perform public.release_stock_reservation_for_order(o.order_id, 'Expiration réservation (paiement)');
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- Paiement : commit stock puis statut commande (remplace la version 014)
create or replace function public.complete_shop_order_payment(
  p_order_id uuid,
  p_stripe_session_id text default null
)
returns public.shop_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.shop_orders%rowtype;
begin
  select * into o from public.shop_orders where id = p_order_id for update;
  if not found then
    raise exception 'Commande introuvable';
  end if;
  if o.payment_status = 'paid' then
    return o;
  end if;

  perform public.commit_reserved_stock_for_order(p_order_id);

  update public.shop_orders
  set
    status = 'preparing'::public.shop_order_status,
    payment_status = 'paid',
    stripe_checkout_session_id = coalesce(p_stripe_session_id, stripe_checkout_session_id),
    paid_at = coalesce(paid_at, now())
  where id = p_order_id
  returning * into o;

  return o;
end;
$$;

alter table public.shop_settings enable row level security;
alter table public.stock_movements enable row level security;
alter table public.stock_reservations enable row level security;

create policy shop_settings_admin on public.shop_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy stock_movements_admin_read on public.stock_movements
  for select to authenticated
  using (public.is_admin());

create policy stock_reservations_admin_read on public.stock_reservations
  for select to authenticated
  using (public.is_admin());

grant select, insert, update, delete on public.shop_settings to authenticated;
grant select on public.stock_movements to authenticated;
grant select on public.stock_reservations to authenticated;

grant execute on function public.adjust_product_stock(uuid, int, public.stock_movement_reason, text) to authenticated;
grant execute on function public.reserve_stock_for_order(uuid, int) to authenticated;
grant execute on function public.commit_reserved_stock_for_order(uuid) to authenticated;
grant execute on function public.release_stock_reservation_for_order(uuid, text) to authenticated;
grant execute on function public.release_expired_stock_reservations() to authenticated;

-- Service role (checkout / webhooks) : pas de GRANT explicite nécessaire (bypass RLS), mais exécution RPC requise
grant execute on function public.reserve_stock_for_order(uuid, int) to service_role;
grant execute on function public.complete_shop_order_payment(uuid, text) to service_role;
grant execute on function public.release_stock_reservation_for_order(uuid, text) to service_role;
grant execute on function public.release_expired_stock_reservations() to service_role;
grant execute on function public.generate_shop_order_number() to service_role;

-- pg_cron (à activer côté Supabase) : select cron.schedule('release-stock', '*/5 * * * *', $$ select public.release_expired_stock_reservations(); $$);