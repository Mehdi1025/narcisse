-- 025 — annulation/remboursement stock, e-mail « commande prête »

alter table public.shop_orders
  add column if not exists pickup_ready_email_sent_at timestamptz;

/** Remet en stock les quantités vendues (commande déjà payée, stock déjà sorti). */
create or replace function public.restore_stock_for_paid_order(p_order_id uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ln record;
begin
  for ln in
    select product_id, sum(quantity)::int as quantity
    from public.shop_order_lines
    where order_id = p_order_id and product_id is not null
    group by product_id
  loop
    update public.products
    set stock_on_hand = stock_on_hand + ln.quantity
    where id = ln.product_id;

    if not found then
      raise exception 'Produit introuvable pour restitution stock';
    end if;

    insert into public.stock_movements (product_id, delta, reason, order_id, note)
    values (
      ln.product_id,
      ln.quantity,
      'retour',
      p_order_id,
      coalesce(nullif(trim(p_note), ''), 'Restitution stock — commande annulée ou remboursée')
    );
  end loop;
end;
$$;

revoke execute on function public.restore_stock_for_paid_order(uuid, text) from public, anon;
grant execute on function public.restore_stock_for_paid_order(uuid, text) to service_role;