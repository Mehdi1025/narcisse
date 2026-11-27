-- 028 — e-mail expédition, adresse livraison sur suivi invité

alter table public.shop_orders
  add column if not exists shipped_email_sent_at timestamptz;

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
    'shipping_line1', o.shipping_line1,
    'shipping_line2', o.shipping_line2,
    'shipping_postal_code', o.shipping_postal_code,
    'shipping_city', o.shipping_city,
    'shipping_country', o.shipping_country,
    'lines', lines
  );
end;
$$;