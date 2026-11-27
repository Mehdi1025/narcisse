# Migrations Supabase — Narcisse

## Ordre d’exécution

Exécuter les fichiers `migrations/*.sql` **dans l’ordre numérique** (SQL Editor ou `supabase db push`).

Référence boutique : `docs/BOUTIQUE_COMMANDES.md` (migrations 014–020).

**Durcissement sécurité (audit NAR-AUD-002)** : `021_security_hardening.sql` — à appliquer après les migrations existantes.

## Comptes équipe

Les inscriptions publiques ne créent **plus** de profil automatiquement (trigger `handle_new_user` supprimé).

### Production

```bash
npm run staff:create -- --email vous@domaine.fr --username admin --role admin --name "Administratrice"
```

Le mot de passe fort s’affiche **une seule fois** dans le terminal.

### Développement local

1. Définir dans `.env.local` : `DEMO_PASSWORD` (12 caractères minimum), `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
2. `npm run seed:users` — crée ou met à jour admin, lina, travailleuse2 (+ ligne `public.profiles` via service_role)

Sur une base **non locale**, le seed refuse de s’exécuter sauf si `ALLOW_DEMO_SEED=1` est défini.

| Identifiant | E-mail technique | Rôle | `worker_id` |
|-------------|------------------|------|-------------|
| `admin` | admin@narcisse.local | admin | — |
| `lina` | lina@narcisse.local | employee | `lina` |
| `travailleuse2` | t2@narcisse.local | employee | `t2` |

## Auth Supabase (réglages manuels)

Voir la section **Sécurité** du `README.md` à la racine du projet.

## Variables Vercel

Comme `.env.copy` (URL + clés publishable / secret). Ne jamais committer `.env.local`.