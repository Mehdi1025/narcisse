import raw from "@/content/catalogue_boutique_provisoire.json";
import type { ProductUniverse } from "@/lib/boutique/types";
import type { ProductRow } from "@/lib/boutique/types";

type CatalogueItem = {
  ref: string;
  univers: string;
  nom: string;
  description: string;
  prix: number;
  photo: string;
};

const UNIVERSE_MAP: Record<string, ProductUniverse> = {
  "Beauté et skincare": "skincare",
  "Bien-être et art de vivre": "art-de-vivre",
  "Développement personnel": "developpement",
  "Éditions exclusives": "editions",
};

const VITRINE_REFS = new Set(["NAR-SK-01", "NAR-BV-01", "NAR-DP-01", "NAR-ED-01"]);

export function catalogueProvisoireRows(): ProductRow[] {
  const now = new Date(0).toISOString();
  return (raw as CatalogueItem[]).map((item, index) => {
    const file = item.photo.replace(/^photos\//, "");
    return {
      id: `provisoire-${item.ref.toLowerCase()}`,
      name: item.nom,
      slug: item.ref.toLowerCase(),
      tagline: `Réf. ${item.ref} — sélection provisoire`,
      description: item.description,
      universe: UNIVERSE_MAP[item.univers] ?? "skincare",
      price_cents: Math.round(item.prix * 100),
      image_url: `/boutique/photos/${file}`,
      featured: VITRINE_REFS.has(item.ref),
      published: true,
      sort_order: index,
      created_at: now,
      updated_at: now,
    };
  });
}