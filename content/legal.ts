/**
 * Données légales boutique — champs exploitant volontairement vides tant qu'ils ne sont pas fournis.
 * Textes provisoires (à valider par un professionnel du droit).
 */

export type LegalOperator = {
  brandName: string;
  legalName: string | null;
  legalForm: string | null;
  shareCapital: string | null;
  siret: string | null;
  rcs: string | null;
  vatNumber: string | null;
  registeredAddress: string | null;
  directorName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  mediatorName: string | null;
  mediatorUrl: string | null;
  dpoEmail: string | null;
  hostingName: string | null;
  hostingAddress: string | null;
  hostingContact: string | null;
};

export const legalOperator: LegalOperator = {
  brandName: "Narcisse",
  legalName: null,
  legalForm: null,
  shareCapital: null,
  siret: null,
  rcs: null,
  vatNumber: null,
  registeredAddress: null,
  directorName: null,
  contactEmail: null,
  contactPhone: null,
  mediatorName: null,
  mediatorUrl: null,
  dpoEmail: null,
  hostingName: null,
  hostingAddress: null,
  hostingContact: null,
};

/** Faits commerciaux connus (audit) — ne pas inventer au-delà. */
export const shopLegalFacts = {
  pitch:
    "Espace de bien-être féminin articulé autour de la santé mentale, la santé physique et la santé sociale, avec une boutique en ligne et des ateliers.",
  universes: [
    "Beauté et skincare",
    "Bien-être et art de vivre",
    "Développement personnel",
    "Expériences et éditions exclusives",
  ],
  productNature: "Produits physiques uniquement",
  pricesAreTaxInclusive: true,
  currency: "EUR",
  pickupOnlyAtLaunch: true,
  pickupFee: "Gratuit",
  pickupReadyEmail: true,
  pickupRetentionDays: 14,
  guestCheckout: true,
  paymentSummary: "Paiement sécurisé par carte bancaire (prestataire Stripe)",
  withdrawalDays: 14,
};

export type LegalSection = { id: string; title: string; body: string[] };

export const cgvSections: LegalSection[] = [
  {
    id: "objet",
    title: "1. Objet et champ d'application",
    body: [
      "Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits proposés sur la boutique en ligne {{brandName}}, accessible via le site {{siteUrl}}.",
      "Elles s'appliquent à toute commande passée par une cliente consommatrice, sans création de compte, sous réserve des dispositions légales impératives.",
    ],
  },
  {
    id: "vendeur",
    title: "2. Vendeur",
    body: [
      "La boutique est exploitée au nom de : {{legalName}}, {{legalForm}}, au capital de {{shareCapital}}, immatriculée au RCS sous le numéro {{rcs}}, SIRET {{siret}}, numéro de TVA intracommunautaire : {{vatNumber}}.",
      "Siège / point de retrait : {{registeredAddress}}. Directrice de la publication : {{directorName}}. Contact : {{contactEmail}} — {{contactPhone}}.",
    ],
  },
  {
    id: "produits",
    title: "3. Produits et informations",
    body: [
      "{{brandName}} propose des {{productNature}}, répartis dans les univers : {{universes}}.",
      "Les photographies et visuels sont présentés à titre illustratif ; les caractéristiques essentielles figurent sur la fiche produit.",
      "Les références en rupture ou non publiées ne sont pas commandables en ligne.",
    ],
  },
  {
    id: "prix",
    title: "4. Prix",
    body: [
      "Les prix sont indiqués en euros, toutes taxes comprises (TTC), hors participation éventuelle à des frais de réception lorsque la livraison sera proposée.",
      "Au lancement, seul le retrait sur place est disponible ; aucun frais de retrait n'est facturé.",
      "{{brandName}} se réserve le droit de modifier ses prix ; le prix applicable est celui affiché au moment de la validation du paiement.",
    ],
  },
  {
    id: "commande",
    title: "5. Commande et paiement",
    body: [
      "La cliente sélectionne ses produits, valide le panier puis renseigne ses coordonnées (nom, e-mail, téléphone facultatif). Aucun compte client n'est requis.",
      "Le paiement est effectué en ligne par carte bancaire via le prestataire Stripe. La commande n'est confirmée qu'après acceptation du paiement.",
      "Une confirmation est adressée par e-mail avec le numéro de commande et un lien de suivi.",
    ],
  },
  {
    id: "retrait",
    title: "6. Retrait sur place",
    body: [
      "Les commandes sont à retirer au salon {{brandName}}, à l'adresse : {{registeredAddress}}.",
      "Vous recevrez un e-mail lorsque la commande est prête au retrait.",
      "La commande est conservée {{pickupRetentionDays}} jours à compter de cette notification, sauf accord contraire ou disposition légale. Passé ce délai, {{brandName}} pourra annuler la commande et procéder au remboursement conformément à la réglementation.",
    ],
  },
  {
    id: "livraison",
    title: "7. Livraison",
    body: [
      "La livraison à domicile n'est pas proposée au lancement du site. Les présentes CGV seront mises à jour le cas échéant.",
    ],
  },
  {
    id: "retractation",
    title: "8. Droit de rétractation",
    body: [
      "Conformément aux articles L.221-18 et suivants du Code de la consommation, vous disposez d'un délai de {{withdrawalDays}} jours à compter de la réception des produits pour exercer votre droit de rétractation, sans avoir à justifier de motifs.",
      "Pour l'exercer, adressez une déclaration dénuée d'ambiguïté à {{contactEmail}} (ou par courrier à {{registeredAddress}}).",
      "Les produits doivent être retournés dans leur état d'origine, complets et non utilisés. Les frais de retour restent à la charge de la cliente, sauf disposition légale contraire.",
      "Exceptions : le droit de rétractation ne s'applique pas notamment aux produits descellés après livraison lorsque leur scellé a été rompu (produits d'hygiène ou de cosmétique concernés, conformément à l'article L.221-28 du Code de la consommation).",
    ],
  },
  {
    id: "garanties",
    title: "9. Garanties légales",
    body: [
      "Les produits bénéficient de la garantie légale de conformité (articles L.217-4 et suivants) et de la garantie contre les vices cachés (articles 1641 et suivants du Code civil).",
      "En cas de défaut, contactez {{contactEmail}} en précisant le numéro de commande.",
    ],
  },
  {
    id: "donnees",
    title: "10. Données personnelles",
    body: [
      "Les données collectées pour la commande (identité, coordonnées, détail de commande) sont traitées pour l'exécution du contrat et la relation client.",
      "Le paiement est opéré par Stripe ; nous ne conservons pas les données de carte bancaire.",
      "Pour vos droits (accès, rectification, effacement, etc.), consultez la Politique de confidentialité sur {{siteUrl}}/confidentialite ou écrivez à {{contactEmail}}.",
    ],
  },
  {
    id: "mediation",
    title: "11. Médiation",
    body: [
      "En cas de litige non résolu, vous pouvez recourir gratuitement à un médiateur de la consommation : {{mediatorName}} — {{mediatorUrl}}.",
    ],
  },
  {
    id: "droit",
    title: "12. Droit applicable",
    body: [
      "Les présentes CGV sont soumises au droit français. Les tribunaux français sont compétents, sous réserve des règles d'ordre public applicables au consommateur.",
    ],
  },
];

export const mentionsSections: LegalSection[] = [
  {
    id: "editeur",
    title: "Éditeur du site",
    body: [
      "Site {{siteUrl}} édité par {{legalName}}, {{legalForm}}, capital {{shareCapital}}.",
      "Siège social : {{registeredAddress}}. RCS : {{rcs}}. SIRET : {{siret}}. TVA : {{vatNumber}}.",
      "Directrice de la publication : {{directorName}}. Contact : {{contactEmail}} · {{contactPhone}}.",
    ],
  },
  {
    id: "hebergeur",
    title: "Hébergeur",
    body: [
      "Hébergeur du site : {{hostingName}}, {{hostingAddress}}. Contact : {{hostingContact}}.",
    ],
  },
  {
    id: "propriete",
    title: "Propriété intellectuelle",
    body: [
      "L'ensemble du contenu (textes, visuels, marque {{brandName}}) est protégé. Toute reproduction non autorisée est interdite.",
    ],
  },
];

export const privacySections: LegalSection[] = [
  {
    id: "responsable",
    title: "1. Responsable de traitement",
    body: [
      "{{legalName}} ({{brandName}}), {{registeredAddress}}. Contact : {{contactEmail}}. Déléguée à la protection des données : {{dpoEmail}}.",
    ],
  },
  {
    id: "finalites",
    title: "2. Finalités et bases légales",
    body: [
      "Données de commande boutique : exécution du contrat (nom, e-mail, téléphone, articles, montant).",
      "Inscription aux ateliers : gestion des inscriptions (nom, e-mail, téléphone le cas échéant) sur base contractuelle ou de consentement selon le cas.",
      "Mesure d'audience et cookies : selon bandeau et préférences lorsqu'ils sont déployés.",
    ],
  },
  {
    id: "destinataires",
    title: "3. Destinataires",
    body: [
      "Personnel habilité de {{brandName}}, prestataires techniques (hébergement, base de données, paiement Stripe), dans la limite de leurs missions.",
    ],
  },
  {
    id: "durees",
    title: "4. Durées de conservation",
    body: [
      "Commandes : conservation comptable et légal conforme aux obligations (généralement 10 ans pour les pièces comptables).",
      "Suivi client et litiges : durée nécessaire au traitement puis archivage réglementaire.",
    ],
  },
  {
    id: "droits",
    title: "5. Vos droits",
    body: [
      "Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité lorsque applicable, en contactant {{contactEmail}}.",
      "Réclamation auprès de la CNIL : www.cnil.fr.",
    ],
  },
  {
    id: "securite",
    title: "6. Sécurité",
    body: [
      "Mesures techniques et organisationnelles adaptées (accès restreints, HTTPS, paiement délégué à Stripe).",
    ],
  },
];

export const legalLinks = {
  cgv: "/boutique/cgv",
  mentions: "/mentions-legales",
  privacy: "/confidentialite",
} as const;