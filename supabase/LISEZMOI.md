# Migrations Supabase — Narcisse

## Ordre d’exécution (SQL Editor)

1. `migrations/001_schema_roles.sql` — tables, RLS, trigger profils  
2. `migrations/002_reference_data.sql` — workers + prestations  
3. En local : `npm run seed:users` — comptes de démo (voir ci-dessous)

## Comptes de démo (mot de passe partout : `password`)

| Identifiant à l’écran | E-mail technique (Supabase) | Rôle | Espace |
|----------------------|----------------------------|------|--------|
| Identifiant | E-mail | **Rôle (base)** | **Travailleuse** (`worker_id`) | URL |
|-------------|--------|-----------------|--------------------------------|-----|
| `admin` | admin@narcisse.local | `admin` | — | `/admin` |
| `lina` | lina@narcisse.local | `employee` | `lina` | `/dashboard` |
| `travailleuse2` | t2@narcisse.local | `employee` | `t2` | `/dashboard` |

**Rôles applicatifs** : seulement **`admin`** et **`employee`**. Lina vs Travailleuse 2 = colonne **`worker_id`**, pas le rôle.

Après `001` + `002`, exécute **`003_roles_admin_employee.sql`** puis `npm run seed:users` (ou le SQL profils).

## Auth Supabase

Dans **Authentication → Providers**, active **Email**. Désactive la confirmation e-mail en dev si tu veux (Authentication → Providers → Email → « Confirm email » off).

## Variables Vercel

Comme `.env.copy` (URL + clés publishable / secret).