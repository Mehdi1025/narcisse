# Boutique — stock & commandes en ligne

## Migrations Supabase (dans l’ordre)

1. `014_shop_orders.sql`
2. `015_products_stock.sql` (stock, réservations, mouvements — après les commandes)
3. `016_seed_test_products.sql` (optionnel — catalogue test)
4. `017_boutique_grants_service_role.sql` (obligatoire si « permission denied » au paiement)
5. `018_shop_order_tracking_token.sql` (lien de suivi invité)

## Variables d’environnement (Vercel + local)

| Variable | Usage |
|----------|--------|
| `STRIPE_SECRET_KEY` | Création Checkout Session |
| `STRIPE_WEBHOOK_SECRET` | Webhook `checkout.session.completed` → `/api/webhooks/stripe` |
| `SUPABASE_SERVICE_ROLE_KEY` | Création commande côté serveur |
| `NEXT_PUBLIC_SITE_URL` | URLs de retour Stripe (ex. `https://narcisse-hazel.vercel.app`) |
| `NEXT_PUBLIC_SHOP_SHIPPING_ENABLED` | Mettre `1` pour afficher la livraison au checkout |
| `NEXT_PUBLIC_SHOP_SHIPPING_FLAT_CENTS` | Forfait livraison (défaut `590` = 5,90 €) |
| `RESEND_API_KEY` / `EMAIL_FROM` | E-mails confirmation, prête au retrait, expédition |

## Parcours client

1. `/boutique` — panier (produits **Supabase** avec `id` + stock > 0)
2. `/boutique/commande` — retrait ou livraison + adresse
3. Paiement Stripe
4. `/boutique/merci?commande=NAR-…`

## Admin

`/admin` → **Boutique** → onglets **Catalogue** | **Commandes**

Renseigner **stock en ligne** sur chaque produit publié (import provisoire puis mise à jour des stocks).

### Retrait

Employée : préparer → **prête au retrait** → comptoir. E-mail automatique à « prête ».

### Livraison

1. Activer `NEXT_PUBLIC_SHOP_SHIPPING_ENABLED=1` (Vercel + redeploy).
2. Client choisit livraison + adresse au checkout.
3. Admin commandes : **Préparer** → **Marquer expédiée** (e-mail « expédiée ») → **Marquer livrée**.

Migration : `028_shipping_email_tracking.sql` (`shipped_email_sent_at`, adresse sur page suivi).

## Stripe (test)

Webhook : `https://<domaine>/api/webhooks/stripe` — événement `checkout.session.completed`.