-- Planification pg_cron : libérer les réservations stock expirées (panier abandonné)
-- Prérequis : activer l'extension « pg_cron » dans le Dashboard Supabase
-- (Database → Extensions, ou Integrations → Cron). Ne pas recréer l'extension ici :
-- sur l'hébergement géré, les GRANT sur le schéma cron provoquent « dependent privileges exist ».

-- À l'expiration : libère le stock réservé et annule la commande si le paiement n'est pas passé
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

    update public.shop_orders
    set
      status = 'cancelled'::public.shop_order_status,
      payment_status = 'failed'::public.shop_payment_status,
      updated_at = now()
    where id = o.order_id
      and payment_status = 'pending'::public.shop_payment_status
      and status = 'pending_payment'::public.shop_order_status;

    n := n + 1;
  end loop;
  return n;
end;
$$;

do $do$
begin
  if not exists (select 1 from pg_namespace where nspname = 'cron') then
    raise exception 'Schéma cron absent : activez pg_cron dans le Dashboard puis réexécutez.';
  end if;

  if exists (select 1 from cron.job where jobname = 'release-expired-stock-reservations') then
    perform cron.unschedule('release-expired-stock-reservations');
  end if;

  perform cron.schedule(
    'release-expired-stock-reservations',
    '*/5 * * * *',
    'select public.release_expired_stock_reservations()'
  );
end;
$do$;