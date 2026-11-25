# Module Boutique — référence

Spécification complète : voir `PROMPT_CURSOR_BOUTIQUE.md` (v0.2 Supabase).

## Décisions projet (validées)

- Supabase (migrations SQL), pas Drizzle
- Auth équipe : Supabase Auth + RLS
- Stock unifié : `stock_on_hand` + `stock_reserved` + journal `stock_movements`
- RPC atomiques : réservation, paiement, ajustements
- Retrait seul au lancement (livraison masquée, colonnes conservées)
- Stripe `23.2.0`, Zod `4.6.7`
- Photos / PDF : Supabase Storage (à brancher)

## Migrations Supabase

| Fichier | Contenu |
|---------|---------|
| `014_shop_orders.sql` | Commandes, lignes, numérotation, paiement |
| `015_products_stock.sql` | Stock, réservations, mouvements, `shop_settings` |

Ordre d'exécution : **014 puis 015**.

## Variables d'environnement

Voir `.env.example` (Supabase, Stripe).