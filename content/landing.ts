// Contenu de la landing page — repris mot pour mot de la direction éditoriale client.
// Ne pas réécrire : toute modification de texte se fait ici, jamais dans les composants.

export const hero = {
  label: "Bien plus qu'un reflet.",
  lines: ["Se retrouver.", "Se révéler.", "Se reconnecter à soi."],
  text: "Narcisse est un lieu imaginé autour d'une conviction : prendre soin de soi ne devrait jamais se limiter à ce que l'on voit dans le miroir.",
  cta: "Découvrir notre univers",
  aside: ["Santé mentale", "Santé physique", "Santé sociale"],
};

export const vision = [
  "Parce que la beauté, la santé physique et la santé mentale sont profondément liées, nous avons imaginé une approche globale du bien-être.",
  "Un lieu pour prendre soin de son corps, apaiser son esprit et cultiver le lien avec les autres.",
];

export const philosophy = {
  label: "Une autre histoire du miroir.",
  title: "Et si le miroir devenait le début d'une rencontre avec soi-même ?",
  body: [
    "Dans la mythologie grecque, Narcisse se perd dans son propre reflet.",
    "Nous avons choisi de réinventer cette histoire.",
    "Chez Narcisse, le miroir ne symbolise plus la vanité ou l'obsession de l'apparence. Il devient un espace de rencontre avec soi-même.",
  ],
  stanza: [
    "Apprendre à se regarder autrement.",
    "Accueillir son image avec douceur.",
    "Prendre conscience de ce qui nous fait du bien.",
  ],
  close: "Nous ne recherchons pas la perfection. Nous croyons en une relation à soi plus douce, plus consciente et plus authentique.",
  quote: "« Le plus beau reflet est celui dans lequel on apprend à se reconnaître. »",
};

export type PoleKey = "mentale" | "physique" | "sociale";

export const dimensions = {
  label: "Prendre soin de soi dans sa globalité.",
  title: ["Trois dimensions.", "Une seule ambition : votre bien-être."],
  intro: "Parce que le bien-être ne se résume pas à une seule dimension, Narcisse réunit trois univers complémentaires.",
  poles: [
    {
      key: "mentale" as PoleKey,
      id: "sante-mentale",
      index: "01",
      name: "La santé mentale",
      title: "Prendre soin de ce qui ne se voit pas.",
      text: [
        "Parce que notre équilibre intérieur mérite autant d'attention que notre apparence.",
        "Narcisse accorde une place essentielle à la santé mentale et à l'épanouissement personnel.",
      ],
      listLabel: "Nos accompagnements",
      list: [
        "Accompagnement émotionnel et psychologique.",
        "Consultations individuelles.",
        "Accompagnement des traumatismes.",
        "Développement personnel.",
      ],
      signature: "Apprendre à se comprendre, à s'écouter et à avancer à son rythme.",
    },
    {
      key: "physique" as PoleKey,
      id: "sante-physique",
      index: "02",
      name: "La santé physique",
      title: "Prendre soin de soi, jusque dans les détails.",
      text: [
        "La beauté peut être un véritable rituel de bien-être.",
        "Nous imaginons les soins comme des moments pour soi, où l'on prend le temps de se reconnecter à son corps et de cultiver le plaisir de prendre soin de son image.",
      ],
      listLabel: "Nos prestations",
      list: [
        "Soins du visage.",
        "Skincare coréenne avancée.",
        "Extensions et rehaussement de cils.",
        "Browlift.",
        "Onglerie.",
      ],
      signature: "Un soin pour le visage, un moment pour soi.",
    },
    {
      key: "sociale" as PoleKey,
      id: "sante-sociale",
      index: "03",
      name: "La santé sociale",
      title: "Parce que le bien-être se partage aussi.",
      text: [
        "Nous croyons que les rencontres, les échanges et le sentiment d'appartenance participent pleinement à notre équilibre.",
        "Narcisse souhaite créer un espace où chacun peut trouver sa place, échanger librement et grandir au contact des autres.",
      ],
      listLabel: "Nos expériences",
      list: [
        "Ateliers collectifs.",
        "Cercles de discussion.",
        "Événements thématiques.",
        "Rencontres et moments de partage.",
      ],
      signature: "Se retrouver soi-même, mais aussi se retrouver ensemble.",
    },
  ],
};

export const experience = {
  label: "Un lieu pensé pour vous.",
  title: "Plus qu'un rendez-vous, un moment pour soi.",
  body: [
    "Nous avons imaginé Narcisse comme un lieu où chaque dimension du bien-être trouve sa place.",
    "Un espace pour ralentir, prendre soin de soi, être accompagné, découvrir et partager.",
    "Que vous veniez pour un soin, un accompagnement ou un moment collectif, chaque expérience est une invitation à vous accorder du temps.",
  ],
  signature: "« Prenez le temps de vous retrouver. »",
};

export type ProductKey = "skincare" | "art-de-vivre" | "developpement" | "editions";

export const boutique = {
  label: "Au-delà du soin.",
  title: "L'art de prendre soin de soi, jusque chez soi.",
  body: [
    "Narcisse imagine également un univers de produits et de rituels qui prolongent l'expérience au quotidien.",
    "Des essentiels pour la beauté, le bien-être et le développement personnel, pensés dans le prolongement de notre philosophie.",
  ],
  listLabel: "Nos futurs univers",
  universes: [
    { key: "skincare" as ProductKey, name: "Beauté et skincare", items: "Sérums, crèmes et coffrets rituels." },
    { key: "art-de-vivre" as ProductKey, name: "Bien-être et art de vivre", items: "Bougies, huiles et brumes." },
    { key: "developpement" as ProductKey, name: "Développement personnel", items: "Carnets, cartes et guides." },
    { key: "editions" as ProductKey, name: "Éditions exclusives", items: "Box, collections et collaborations." },
  ],
  signature: "Aujourd'hui un concept, demain une marque.",
};

export const conversion = {
  label: "Votre histoire avec Narcisse commence ici.",
  title: "Et si vous preniez enfin un moment pour vous ?",
  body: [
    "Un soin, une rencontre, un accompagnement ou simplement l'envie de découvrir un nouvel univers.",
    "Quelle que soit votre manière de prendre soin de vous, Narcisse vous ouvre ses portes.",
  ],
  primary: "Prendre rendez-vous",
  secondary: "Découvrir nos univers",
};

export const footer = {
  tagline: "Santé · Bien-être · Beauté · Communauté",
  quote: "« De l'obsession de son reflet à l'art de prendre soin de soi. »",
  nav: [
    { label: "Notre philosophie", href: "#philosophie" },
    { label: "Santé mentale", href: "#sante-mentale" },
    { label: "Santé physique", href: "#sante-physique" },
    { label: "Santé sociale", href: "#sante-sociale" },
    { label: "Contact", href: "#contact" },
  ],
  contact: ["Adresse : à renseigner.", "E-mail : à renseigner.", "Réseaux sociaux : à renseigner."],
  legal: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
  ],
  note: "Les accompagnements de bien-être ne remplacent pas un suivi médical ou psychologique lorsque celui-ci est nécessaire.",
};

export const nav = [
  { label: "Philosophie", href: "#philosophie" },
  { label: "Les trois pôles", href: "#dimensions" },
  { label: "L'expérience", href: "#experience" },
  { label: "Boutique", href: "#boutique" },
  { label: "Contact", href: "#contact" },
];

export const bookingHref = "/reserver";
