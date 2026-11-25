# Migrations Supabase — Narcisse

## Ordre d’exécution (SQL Editor)

1. `migrations/001_schema_roles.sql` — tables, RLS, trigger profils  
2. `migrations/002_reference_data.sql` — workers + prestations  
3. En local : `npm run seed:users` — comptes de démo (voir ci-dessous)

## Comptes de démo (mot de passe partout : `password`)

| Identifiant à l’écran | E-mail technique (Supabase) | Rôle | Espace |
|----------------------|----------------------------|------|--------|
| `admin` | admin@narcisse.local | admin | `/dashboard_admin` |
| `lina` | lina@narcisse.local | lina | `/dashboard_employe` |
| `travailleuse2` ou `t2` ou `travailleuse deux` | t2@narcisse.local | t2 | `/dashboard_employe` |

**Un seul dashboard employé** : Lina et Travailleuse 2 voient le même écran ; le contenu dépend du rôle en base.

## Auth Supabase

Dans **Authentication → Providers**, active **Email**. Désactive la confirmation e-mail en dev si tu veux (Authentication → Providers → Email → « Confirm email » off).

## Variables Vercel

Comme `.env.copy` (URL + clés publishable / secret).