import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
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

  const insert = {
    ...input,
    slug: input.slug ?? slugify(input.name),
    description: input.description ?? "",
  };

  const { data, error } = await auth.supabase.from("products").insert(insert).select("*").single();
  if (error) {
    const msg = error.code === "23505" ? "Ce slug existe déjà — modifiez le nom." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ product: data }, { status: 201 });
}