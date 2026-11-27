-- 026 — archivage produit (évite DELETE bloqué par stock_movements)

alter table public.products
  add column if not exists archived_at timestamptz;

comment on column public.products.archived_at is 'Produit retiré du catalogue ; ne pas supprimer si historique stock.';