# Migrations Supabase — Narcisse

## Ordre d’exécution (SQL Editor)

1. `migrations/001_schema_roles.sql` — tables, RLS, trigger profils  
2. `migrations/002_reference_data.sql` — workers + prestations  
3. En local : `npm run seed:users` — comptes de démo (voir ci-dessous)

## Comptes de démo (mot de passe partout : `password`)

| Identifiant à l’écran | E-mail technique (Supabase) | Rôle | Espace |
|----------------------|----------------------------|------|--------|
| `admin` | admin@narcisse.local | admin | `/admin` |
| `lina` | lina@narcisse.local | lina | `/dashboard` |
| `travailleuse2` ou `t2` ou `travailleuse deux` | t2@narcisse.local | t2 | `/dashboard` |

**Un seul `/dashboard`** : Lina et Travailleuse 2 partagent l’URL ; le contenu dépend du compte connecté.

## Auth Supabase

Dans **Authentication → Providers**, active **Email**. Désactive la confirmation e-mail en dev si tu veux (Authentication → Providers → Email → « Confirm email » off).

## Variables Vercel

Comme `.env.copy` (URL + clés publishable / secret).