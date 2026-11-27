# Stock boutique

## Notions

- **Physique** (`stock_on_hand`) : quantités en rayon (site + comptoir).
- **Réservé** (`stock_reserved`) : bloqué pour des paiements en cours.
- **Disponible** = physique − réservé (affiché au client si publié).

## Réservation et Stripe

- Réservation : **35 min** (`shop_settings.reservation_minutes`), cron + expiration libère le stock.
- Session Stripe Checkout : expire **~4 min avant** la réservation (min. 30 min imposées par Stripe), typiquement **31 min**.

## Modifications du stock

Toute variation de `stock_on_hand` / `stock_reserved` passe par des fonctions SQL (`adjust_product_stock`, `set_product_stock`, réservation, paiement). L’admin ne peut plus patcher le stock directement sur la fiche produit.

## Commande « Stock à vérifier »

Si, au paiement, le stock physique ne permet pas de sortir une ligne (réservation expirée, surcommande), la commande est **payée** et `stock_issue = true` avec une note admin. Aucune erreur au webhook Stripe — traitement manuel requis.