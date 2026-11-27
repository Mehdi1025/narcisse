// Informations légales de Narcisse. Toute valeur null s'affiche « en cours de mise à jour » sur le site
// et apparaît dans missingLegalFields(). Ne jamais remplir avec une valeur supposée.

export const LEGAL = {
  version: "2026-11-27",
  nomCommercial: "Narcisse",
  exploitant: {
    raisonSociale: null as string | null,
    formeJuridique: null as string | null,
    capital: null as string | null,
    siege: null as string | null,
    siren: null as string | null,
    rcs: null as string | null,
    tvaIntracom: null as string | null,
    regimeTva: null as "assujetti" | "franchise_293B" | null,
    telephone: null as string | null,
    email: null as string | null,
    directeurPublication: null as string | null,
  },
  lieu: {
    adresseRetrait: null as string | null,
    horairesRetrait: null as string | null,
    delaiPreparation: null as string | null,
  },
  mediateur: {
    nom: null as string | null,
    adresse: null as string | null,
    site: null as string | null,
  },
  hebergeur: {
    nom: "Vercel Inc.",
    adresse: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    site: "https://vercel.com",
  },
  prestataires: {
    /** Région Supabase : à relever dans le tableau de bord (Project Settings). */
    supabaseRegion: null as string | null,
  },
  realisation: null as string | null,
  conservationRetraitJours: 14,
  cartesCadeauxValiditeMois: 12,
  reservationStockMinutes: 35,
} as const;

export const legalLinks = {
  cgv: "/cgv",
  mentions: "/mentions-legales",
  privacy: "/confidentialite",
} as const;

export const BOUTIQUE_UNIVERS = [
  "Beauté et skincare",
  "Bien-être et art de vivre",
  "Développement personnel",
  "Expériences et éditions exclusives",
] as const;