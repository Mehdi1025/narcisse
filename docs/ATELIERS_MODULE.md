# Module Ateliers & événements (santé sociale)

## Parcours

1. **Travailleuse** (`/dashboard` → **Ateliers**) : crée un brouillon (titre, description, dates, places, lieu) → **Envoyer à l'admin**.
2. **Admin** (`/admin` → **Événements**) : filtre **À valider** → **Publier sur le site** ou **Refuser** (note optionnelle).
3. **Public** : `/ateliers` — liste des ateliers publiés → **Réserver une place** (inscription ou liste d'attente si complet).
4. **Jour J** : admin (ou travailleuse sur ses ateliers publiés) → inscriptions → **Présent·e**.

## Base Supabase

Exécuter dans l’ordre : `010_workshops.sql`, `011_workshops_grants.sql`, `012_admin_workshops_rpc.sql` :

- `010` — schéma
- `011` — GRANT (corrige permission denied)
- `012` — RPC validation admin (liste + publier/refuser)

- Tables `workshops`, `workshop_registrations`
- Statuts atelier : `draft` → `pending` → `published` | `rejected` | `cancelled`
- RPC `register_for_workshop` (places + file d'attente)

## API

| Route | Rôle |
|--------|------|
| `GET/POST /api/workshops` | employée (siennes) / admin (toutes) |
| `PATCH /api/workshops/[id]` | employée (brouillon) / admin |
| `POST /api/workshops/[id]/submit` | employée → `pending` |
| `POST /api/admin/workshops/[id]/review` | `publish` \| `reject` |
| `GET /api/workshops/[id]/registrations` | admin / proposante |
| `PATCH /api/admin/workshops/registrations/[id]` | présence |
| `POST /api/public/workshops/[id]/register` | anonyme |

## Évolutions possibles

- E-mails de confirmation
- Promotion automatique depuis la liste d'attente
- Export CSV des présences
- Lien depuis la landing (#sante-sociale)