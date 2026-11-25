-- Checkout serveur (clé service_role) : GRANT manquants sur products / commandes.
-- Symptôme : « permission denied for table products » au clic Payer.

grant select, insert, update, delete on public.products to service_role;

grant select, insert, update, delete on public.shop_orders to service_role;
grant select, insert, update, delete on public.shop_order_lines to service_role;
grant usage, select on sequence public.shop_order_number_seq to service_role;

grant select, insert, update, delete on public.stock_reservations to service_role;
grant select, insert on public.stock_movements to service_role;

grant execute on function public.generate_shop_order_number() to service_role;
grant execute on function public.reserve_stock_for_order(uuid, int) to service_role;
grant execute on function public.commit_reserved_stock_for_order(uuid) to service_role;
grant execute on function public.complete_shop_order_payment(uuid, text) to service_role;
grant execute on function public.release_stock_reservation_for_order(uuid, text) to service_role;
grant execute on function public.release_expired_stock_reservations() to service_role;