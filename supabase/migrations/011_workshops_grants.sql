-- Corrige « permission denied for table workshops » (GRANT manquants après 010)

grant select, insert, update, delete on table public.workshops to authenticated;
grant select, insert, update, delete on table public.workshop_registrations to authenticated;

-- Lecture publique des ateliers publiés (déjà couverte par RLS)
grant select on table public.workshops to anon;