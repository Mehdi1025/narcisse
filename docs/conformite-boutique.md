# Conformité boutique (NAR-AUD-002 §4)

## En place dans le code

- Source unique : `content/legal.ts` (`LEGAL`) + textes officiels `content/legalOfficial.ts`
- Pages statiques : `/cgv`, `/mentions-legales`, `/confidentialite` (sommaire, version, « en cours de mise à jour »)
- Checkout : informations précontractuelles, case CGV, `acceptCgv` côté API, enregistrement `cgv_version` / `cgv_accepted_at`
- Garde-fou mode live : si `STRIPE_SECRET_KEY` commence par `sk_live_` et `isLegalComplete()` est faux → API 503 et message sur la page commande
- E-mail confirmation (Resend) après webhook Stripe, idempotent via `confirmation_email_sent_at`
- Admin : bandeau champs manquants, fiche commande CGV + renvoi e-mail
- Ateliers : mention données + pas d’info de santé

Migration Supabase : `023_legal_consent.sql`.

## Champs à compléter (`LEGAL`)

Voir `missingLegalFields()` dans `lib/legal/status.ts` :

- `exploitant.*` : raison sociale, forme, siège, SIREN, e-mail, téléphone, directeur de publication, régime TVA (+ capital, RCS, TVA intracom si applicable)
- `lieu.*` : adresse et horaires de retrait, délai de préparation
- `mediateur.*` : nom, adresse, site
- `prestataires.supabaseRegion` : région dans le dashboard Supabase
- `realisation` : conception du site (si différente de l’exploitant)

Hébergeur Vercel : adresse fournie à **vérifier** sur vercel.com avant publication.

## Scripts tiers (pages publiques, nov. 2026)

| Page | Chargement externe |
|------|---------------------|
| `/`, `/boutique`, `/ateliers` | Aucun script analytics / pixel / Google Fonts / Stripe.js |
| Paiement | Redirection vers **Stripe Checkout** (domaine Stripe) |
| Polices | Auto-hébergées (`app/fonts/`) |

Cookies : session Supabase équipe uniquement ; `localStorage` panier ; pas de bandeau cookies tant qu’aucun traceur n’est ajouté.

## À faire hors code (Adam)

1. Compléter `content/legal.ts` avec les informations réelles de l’exploitant.
2. Adhérer à un médiateur de la consommation et renseigner `LEGAL.mediateur`.
3. Vérifier un domaine d’envoi Resend et définir `EMAIL_FROM`.
4. Activer les reçus Stripe (Dashboard → Customer emails → Successful payments).
5. Faire relire CGV, mentions et confidentialité par un professionnel du droit avant `sk_live_`.
6. Exécuter `023_legal_consent.sql` sur Supabase.

**Note** : textes provisoires — validation juridique requise avant production.