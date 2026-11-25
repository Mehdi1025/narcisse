import type { Product } from "@/content/boutique";
import type { ProductRow } from "@/lib/boutique/types";

/** Slug Supabase (nar-sk-01) → référence vitrine (NAR-SK-01). */
export function slugToRef(slug: string): string {
  return slug.toUpperCase();
}

export function productRowToShop(row: ProductRow): Product {
  const ref = slugToRef(row.slug);
  const onHand = row.stock_on_hand ?? 0;
  const reserved = row.stock_reserved ?? 0;
  const available = Math.max(0, onHand - reserved);
  return {
    id: row.id,
    ref,
    universe: row.universe,
    name: row.name,
    description: row.description || row.tagline || "",
    price: (row.price_cents ?? 0) / 100,
    priceFrom: ref === "NAR-ED-03",
    image: row.image_url ?? `/boutique/photos/${ref}.jpg`,
    stockAvailable: row.stock_on_hand != null ? available : undefined,
  };
}