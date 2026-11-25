-- Commandes boutique : livraison ou retrait, lignes, paiement

create type public.fulfillment_type as enum ('pickup', 'shipping');

create type public.shop_order_status as enum (
  'pending_payment',
  'paid',
  'preparing',
  'ready_pickup',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create type public.shop_payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create sequence if not exists public.shop_order_number_seq start 1;

create table public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status public.shop_order_status not null default 'pending_payment',
  payment_status public.shop_payment_status not null default 'pending',
  fulfillment public.fulfillment_type not null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null default '',
  shipping_line1 text,
  shipping_line2 text,
  shipping_postal_code text,
  shipping_city text,
  shipping_country text not null default 'FR',
  shipping_cost_cents int not null default 0 check (shipping_cost_cents >= 0),
  subtotal_cents int not null check (subtotal_cents >= 0),
  total_cents int not null check (total_cents >= 0),
  currency text not null default 'eur',
  stripe_checkout_session_id text,
  paid_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shop_order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_slug text not null,
  product_name text not null,
  quantity int not null check (quantity > 0 and quantity <= 99),
  unit_price_cents int not null check (unit_price_cents >= 0),
  line_total_cents int not null check (line_total_cents >= 0)
);

create index shop_orders_status_idx on public.shop_orders (status, created_at desc);
create index shop_orders_email_idx on public.shop_orders (customer_email);
create index shop_order_lines_order_idx on public.shop_order_lines (order_id);

create or replace function public.shop_orders_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger shop_orders_updated_at
  before update on public.shop_orders
  for each row
  execute function public.shop_orders_set_updated_at();

create or replace function public.generate_shop_order_number()
returns text
language plpgsql
as $$
declare
  y text := to_char(now(), 'YYYY');
  n bigint := nextval('public.shop_order_number_seq');
begin
  return 'NAR-' || y || '-' || lpad(n::text, 5, '0');
end;
$$;

-- Paiement confirmé (idempotent) — déstockage via migration 013 (commit_reserved_stock)
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

  update public.shop_orders
  set
    status = case
      when fulfillment = 'pickup' then 'preparing'::public.shop_order_status
      else 'preparing'::public.shop_order_status
    end,
    payment_status = 'paid',
    stripe_checkout_session_id = coalesce(p_stripe_session_id, stripe_checkout_session_id),
    paid_at = coalesce(paid_at, now())
  where id = p_order_id
  returning * into o;

  return o;
end;
$$;

alter table public.shop_orders enable row level security;
alter table public.shop_order_lines enable row level security;

create policy shop_orders_admin_all on public.shop_orders
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy shop_order_lines_admin_all on public.shop_order_lines
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.shop_orders to authenticated;
grant select, insert, update, delete on public.shop_order_lines to authenticated;
grant usage, select on sequence public.shop_order_number_seq to authenticated;
grant execute on function public.complete_shop_order_payment(uuid, text) to authenticated;
grant execute on function public.generate_shop_order_number() to authenticated;