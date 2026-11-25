import { createClient } from "@/lib/supabase/server";
import type { ProductRow } from "@/lib/boutique/types";

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

  if (error || !data) return [];
  return data as ProductRow[];
}

export async function getPublishedProducts(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data as ProductRow[];
}