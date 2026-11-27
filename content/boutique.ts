// Catalogue boutique : textes et repli statique (16 produits provisoires).
export type UniverseKey = "skincare" | "art-de-vivre" | "developpement" | "editions";

export type Product = {
  /** UUID Supabase — absent sur le catalogue statique de démo. */
  id?: string;
  ref: string;
  universe: UniverseKey;
  name: string;
  description: string;
  price: number;
  priceFrom?: boolean;
  image: string;
  /** Disponible à la vente en ligne (on_hand − reserved). */
  stockAvailable?: number;
};

export const universes: { key: UniverseKey; name: string; short: string; line: string; tone: string }[] = [
  { key: "skincare", name: "Beauté et skincare", short: "Skincare", line: "Sérums, crèmes et rituels venus de Corée.", tone: "#D7B1A5" },
  { key: "art-de-vivre", name: "Bien-être et art de vivre", short: "Art de vivre", line: "Bougies, huiles et brumes pour ralentir.", tone: "#98A899" },
  { key: "developpement", name: "Développement personnel", short: "Développement", line: "Carnets, cartes et guides pour se retrouver.", tone: "#7E93B2" },
  { key: "editions", name: "Éditions exclusives", short: "Éditions", line: "Coffrets, box et cartes cadeaux Narcisse.", tone: "#2E3B57" },
];

const photo = (ref: string) => `/boutique/photos/${ref}.jpg`;

export const products: Product[] = [
  { ref: "NAR-SK-01", universe: "skincare", name: "Sérum hydratant à l'acide hyaluronique", description: "Sérum léger qui repulpe et hydrate, pour tous types de peau. Flacon compte-gouttes 30 ml.", price: 29, image: photo("NAR-SK-01") },
  { ref: "NAR-SK-02", universe: "skincare", name: "Crème visage nourrissante", description: "Crème riche au fini velouté pour les peaux sèches et sensibles. Pot 50 ml.", price: 32, image: photo("NAR-SK-02") },
  { ref: "NAR-SK-03", universe: "skincare", name: "Nettoyant doux moussant", description: "Gel nettoyant au pH doux, première étape du rituel skincare coréen. Tube 150 ml.", price: 18, image: photo("NAR-SK-03") },
  { ref: "NAR-SK-04", universe: "skincare", name: "Masques en tissu, lot de 5", description: "Masques hydratants à usage unique pour un soin express à la maison.", price: 15, image: photo("NAR-SK-04") },
  { ref: "NAR-SK-05", universe: "skincare", name: "Gua sha en quartz rose", description: "Pierre de massage du visage pour détendre les traits et favoriser l'éclat.", price: 24, image: photo("NAR-SK-05") },
  { ref: "NAR-BV-01", universe: "art-de-vivre", name: "Bougie parfumée en verre", description: "Cire végétale, notes florales et boisées. Environ 40 h de combustion.", price: 26, image: photo("NAR-BV-01") },
  { ref: "NAR-BV-02", universe: "art-de-vivre", name: "Huile de massage corps", description: "Huile sèche aux extraits végétaux pour un moment de détente. Flacon 100 ml.", price: 22, image: photo("NAR-BV-02") },
  { ref: "NAR-BV-03", universe: "art-de-vivre", name: "Brume d'oreiller apaisante", description: "Brume parfumée à vaporiser sur le linge avant le coucher. 75 ml.", price: 19, image: photo("NAR-BV-03") },
  { ref: "NAR-BV-04", universe: "art-de-vivre", name: "Infusion bien-être", description: "Mélange de plantes à infuser pour une pause douceur. Boîte 80 g.", price: 12, image: photo("NAR-BV-04") },
  { ref: "NAR-DP-01", universe: "developpement", name: "Carnet de gratitude", description: "Carnet ligné à couverture rigide pour noter chaque jour ce qui fait du bien.", price: 16, image: photo("NAR-DP-01") },
  { ref: "NAR-DP-02", universe: "developpement", name: "Cartes d'affirmations", description: "Jeu de 52 cartes positives pour commencer la journée avec intention.", price: 19, image: photo("NAR-DP-02") },
  { ref: "NAR-DP-03", universe: "developpement", name: "Journal guidé 30 jours", description: "Un mois de questions et d'exercices pour mieux se connaître.", price: 24, image: photo("NAR-DP-03") },
  { ref: "NAR-DP-04", universe: "developpement", name: "Kit papeterie", description: "Stylo et trois marque-pages pour accompagner carnets et journaux.", price: 14, image: photo("NAR-DP-04") },
  { ref: "NAR-ED-01", universe: "editions", name: "Coffret rituel visage", description: "Sélection de trois soins en format découverte, présentée en coffret.", price: 69, image: photo("NAR-ED-01") },
  { ref: "NAR-ED-02", universe: "editions", name: "Box découverte du mois", description: "Une sélection de produits bien-être renouvelée chaque mois.", price: 39, image: photo("NAR-ED-02") },
  { ref: "NAR-ED-03", universe: "editions", name: "Carte cadeau Narcisse", description: "À offrir pour un soin, un atelier ou un produit. Montant au choix.", price: 30, priceFrom: true, image: photo("NAR-ED-03") },
];

export const shop = {
  eyebrow: "La boutique · Sélection 01",
  titleA: "L'art de prendre soin de soi,",
  titleB: "jusque chez soi.",
  intro: "Des essentiels pour la beauté, le bien-être et le développement personnel, choisis dans le prolongement de notre philosophie.",
  checkoutNote: "Prix en euros TTC · Paiement sécurisé par carte · Retrait gratuit au salon.",
  imageNote: "Visuel d'illustration — la photo du produit arrive bientôt.",
};

export const euro = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);