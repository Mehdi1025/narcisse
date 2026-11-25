import { createClient } from "@/lib/supabase/server";
import { catalogueProvisoireRows } from "@/lib/boutique/catalogueProvisoire";
import type { ProductRow } from "@/lib/boutique/types";

const PROVISOIRE_IMAGE_BY_SLUG = new Map(
  catalogueProvisoireRows().map((p) => [p.slug, p.image_url] as const),
);

/** Complète l’URL photo depuis le catalogue provisoire si la base n’en a pas. */
function withProvisoireImage(row: ProductRow): ProductRow {
  if (row.image_url) return row;
  const image_url = PROVISOIRE_IMAGE_BY_SLUG.get(row.slug) ?? null;
  return image_url ? { ...row, image_url } : row;
}

function mapRows(rows: ProductRow[]): ProductRow[] {
  return rows.map(withProvisoireImage);
}

function fallbackFeatured(limit: number): ProductRow[] {
  return catalogueProvisoireRows()
    .filter((p) => p.featured)
    .slice(0, limit);
}

function fallbackPublished(): ProductRow[] {
  return catalogueProvisoireRows();
}

export async function getFeaturedProducts(limit = 4): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) return fallbackFeatured(limit);
  return mapRows(data as ProductRow[]);
}

export async function getPublishedProducts(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data?.length) return fallbackPublished();
  return mapRows(data as ProductRow[]);
}