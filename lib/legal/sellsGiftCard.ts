import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

/** Carte cadeau (slug provisoire nar-ed-03) publiée en boutique. */
export async function sellsGiftCardOnline(): Promise<boolean> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("products").select("slug").eq("published", true).eq("slug", "nar-ed-03").maybeSingle();
  return Boolean(data);
}