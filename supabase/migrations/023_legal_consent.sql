-- Consentement CGV et suivi e-mail de confirmation (NAR-AUD-002 §4)

alter table public.shop_orders
  add column if not exists cgv_version text,
  add column if not exists cgv_accepted_at timestamptz,
  add column if not exists confirmation_email_sent_at timestamptz;