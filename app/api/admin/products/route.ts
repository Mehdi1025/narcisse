import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revalidateShop } from "@/lib/cache/revalidatePublic";
import { slugify } from "@/lib/boutique/format";
import type { ProductInput, ProductUniverse } from "@/lib/boutique/types";

const UNIVERSES: ProductUniverse[] = ["skincare", "art-de-vivre", "developpement", "editions"];

function parseBody(body: unknown): ProductInput | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name.trim() : "";
  if (!name) return null;
  const universe = o.universe;
  if (typeof universe !== "string" || !UNIVERSES.includes(universe as ProductUniverse)) return null;

  const priceRaw = o.price_cents;
  let price_cents: number | null = null;
  if (priceRaw !== undefined && priceRaw !== null && priceRaw !== "") {
    const n = typeof priceRaw === "number" ? priceRaw : Number(priceRaw);
    if (!Number.isFinite(n) || n < 0) return null;
    price_cents = Math.round(n);
  }

  return {
    name,
    slug: typeof o.slug === "string" && o.slug.trim() ? slugify(o.slug.trim()) : slugify(name),
    tagline: typeof o.tagline === "string" ? o.tagline.trim() || null : null,
    description: typeof o.description === "string" ? o.description.trim() : "",
    universe: universe as ProductUniverse,
    price_cents,
    image_url: typeof o.image_url === "string" && o.image_url.trim() ? o.image_url.trim() : null,
    featured: Boolean(o.featured),
    published: Boolean(o.published),
    sort_order: typeof o.sort_order === "number" ? o.sort_order : Number(o.sort_order) || 0,
    stock_on_hand:
      o.stock_on_hand !== undefined && o.stock_on_hand !== ""
        ? Math.max(0, Math.round(Number(o.stock_on_hand)))
        : undefined,
    stock_alert_threshold:
      o.stock_alert_threshold !== undefined && o.stock_alert_threshold !== ""
        ? Math.max(0, Math.round(Number(o.stock_alert_threshold)))
        : undefined,
  };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase.from("products").select("*").order("sort_order").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const input = parseBody(json);
  if (!input) return NextResponse.json({ error: "Données produit invalides" }, { status: 400 });

  const initialStock = Math.max(0, input.stock_on_hand ?? 0);

  const { data, error } = await auth.supabase
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug ?? slugify(input.name),
      tagline: input.tagline,
      description: input.description ?? "",
      universe: input.universe,
      price_cents: input.price_cents,
      image_url: input.image_url,
      featured: input.featured,
      published: input.published,
      sort_order: input.sort_order,
      stock_alert_threshold: input.stock_alert_threshold,
    })
    .select("*")
    .single();
  if (error) {
    const msg = error.code === "23505" ? "Ce slug existe déjà — modifiez le nom." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (initialStock > 0) {
    const { error: stockErr } = await auth.supabase.rpc("adjust_product_stock", {
      p_product_id: data.id,
      p_delta: initialStock,
      p_reason: "inventaire",
      p_note: "Stock initial",
    });
    if (stockErr) {
      await auth.supabase.from("products").delete().eq("id", data.id);
      return NextResponse.json({ error: stockErr.message }, { status: 400 });
    }
    const { data: refreshed } = await auth.supabase.from("products").select("*").eq("id", data.id).single();
    revalidateShop();
    return NextResponse.json({ product: refreshed ?? data }, { status: 201 });
  }
  revalidateShop();
  return NextResponse.json({ product: data }, { status: 201 });
}