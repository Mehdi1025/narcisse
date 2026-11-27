-- 021 — Durcissement sécurité (audit NAR-AUD-002 : C1, C2, C4)
-- Idempotente : peut être rejouée sans erreur.
-- (Numérotée 021 car 019–020 = boutique ; contenu audit prévu initialement en 019_security_hardening.)

begin;

-- ═════ C1 — Plus aucun rôle lu depuis les métadonnées d'inscription ═════
-- Les profils sont créés uniquement côté serveur (service_role) par l'administration.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ═════ C2 — Le rôle et worker_id ne sont modifiables que par le service_role ═════
revoke insert, update, delete on table public.profiles from anon, authenticated;
revoke all on table public.profiles from anon;
grant select on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Défense en profondeur : refus de tout changement de rôle hors service_role / SQL Editor
create or replace function public.profiles_protect_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.worker_id is distinct from old.worker_id or new.id is distinct from old.id)
     and coalesce(auth.role(), '') <> 'service_role'
     and current_user not in ('postgres', 'supabase_admin', 'service_role')
  then
    raise exception 'Modification du rôle interdite' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.profiles_protect_role();

-- ═════ C4 — Fonctions de paiement et de stock : service_role uniquement ═════
revoke execute on function
  public.complete_shop_order_payment(uuid, text),
  public.reserve_stock_for_order(uuid, int),
  public.commit_reserved_stock_for_order(uuid),
  public.release_stock_reservation_for_order(uuid, text),
  public.release_expired_stock_reservations(),
  public.generate_shop_order_number(),
  public.get_shop_order_by_tracking_token(text)
from public, anon, authenticated;

grant execute on function
  public.complete_shop_order_payment(uuid, text),
  public.reserve_stock_for_order(uuid, int),
  public.commit_reserved_stock_for_order(uuid),
  public.release_stock_reservation_for_order(uuid, text),
  public.release_expired_stock_reservations(),
  public.generate_shop_order_number(),
  public.get_shop_order_by_tracking_token(text)
to service_role;

-- Fonctions d'administration (contrôle is_admin() interne) : jamais pour anon
revoke execute on function
  public.adjust_product_stock(uuid, int, public.stock_movement_reason, text),
  public.admin_list_workshops(),
  public.admin_review_workshop(uuid, text, text)
from public, anon;
grant execute on function
  public.adjust_product_stock(uuid, int, public.stock_movement_reason, text),
  public.admin_list_workshops(),
  public.admin_review_workshop(uuid, text, text)
to authenticated, service_role;

-- get_my_profile : utilisateurs connectés seulement
revoke execute on function public.get_my_profile() from public, anon;
grant execute on function public.get_my_profile() to authenticated, service_role;

-- register_for_workshop reste volontairement public (inscription aux ateliers sans compte)

-- ═════ Par défaut : aucune nouvelle fonction exécutable sans GRANT explicite ═════
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon, authenticated;

commit;