# Checklist production urgente

## Migrations Supabase (ordre)

Exécuter dans le SQL Editor, **dans l’ordre** :

1. `019_worker_shop_orders.sql`
2. `020_pg_cron_release_stock.sql` — puis activer l’extension **pg_cron** (Database → Extensions) si absent
3. `021_security_hardening.sql`
4. `022_stock_integrity.sql`
5. `023_legal_consent.sql`
6. `024_boutique_skill_fix.sql` — **bloquant** accès travailleuses boutique
7. `025_shop_cancel_restore_email.sql`
8. `026_products_archive.sql`
9. `027_rate_limit.sql`
10. `028_shipping_email_tracking.sql`

### Vérifications SQL rapides

```sql
-- Compétence boutique pour une employée connectée (tester après connexion JWT)
select public.has_boutique_skill();

-- pg_cron job réservation expirée
select * from cron.job where jobname like '%stock%' or command like '%release_expired%';

-- Colonnes légales / e-mail
select column_name from information_schema.columns
  where table_name = 'shop_orders' and column_name in (
    'cgv_version', 'pickup_ready_email_sent_at', 'confirmation_email_sent_at'
  );
```

## Auth Supabase (dashboard)

- **Sign up** : désactivé pour le public
- Confirm email : selon politique choisie
- Mots de passe de démo : changés en prod (`npm run passwords:demo` ne doit plus servir en prod)

## Variables d’environnement

- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` + `EMAIL_FROM` (domaine vérifié)
- `NEXT_PUBLIC_SITE_URL`

## À faire côté exploitant (Adam)

1. Remplir `content/legal.ts`
2. Médiateur de la consommation
3. Resend + domaine
4. Prix, photos, stocks réels
5. Relire les textes juridiques avant `sk_live_`

## Stripe

- Webhook : `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`
- Activer les e-mails client « Successful payments » en complément (optionnel)