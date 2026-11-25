-- Lien de suivi invité (token opaque, une commande par token)

create extension if not exists pgcrypto;

alter table public.shop_orders
  add column if not exists tracking_token text;

update public.shop_orders
set tracking_token = replace(replace(rtrim(encode(gen_random_bytes(32), 'base64'), '='), '+', '-'), '/', '_')
where tracking_token is null;

alter table public.shop_orders
  alter column tracking_token set not null;

create unique index if not exists shop_orders_tracking_token_uidx on public.shop_orders (tracking_token);

create or replace function public.get_shop_order_by_tracking_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  o public.shop_orders%rowtype;
  lines jsonb;
begin
  if p_token is null or length(trim(p_token)) < 16 then
    return null;
  end if;

  select * into o from public.shop_orders where tracking_token = trim(p_token);
  if not found then
    return null;
  end if;

  select coalesce(jsonb_agg(to_jsonb(l) order by l.product_name), '[]'::jsonb)
  into lines
  from public.shop_order_lines l
  where l.order_id = o.id;

  return jsonb_build_object(
    'order_number', o.order_number,
    'status', o.status,
    'payment_status', o.payment_status,
    'fulfillment', o.fulfillment,
    'customer_name', o.customer_name,
    'subtotal_cents', o.subtotal_cents,
    'shipping_cost_cents', o.shipping_cost_cents,
    'total_cents', o.total_cents,
    'currency', o.currency,
    'paid_at', o.paid_at,
    'created_at', o.created_at,
    'lines', lines
  );
end;
$$;

grant execute on function public.get_shop_order_by_tracking_token(text) to anon, authenticated, service_role;