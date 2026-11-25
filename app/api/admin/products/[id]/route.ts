import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { slugify } from "@/lib/boutique/format";
import type { ProductInput, ProductUniverse } from "@/lib/boutique/types";

const UNIVERSES: ProductUniverse[] = ["skincare", "art-de-vivre", "developpement", "editions"];

function parsePatch(body: unknown): Partial<ProductInput> | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const patch: Partial<ProductInput> = {};

  if (typeof o.name === "string") {
    const name = o.name.trim();
    if (!name) return null;
    patch.name = name;
  }
  if (typeof o.slug === "string" && o.slug.trim()) patch.slug = slugify(o.slug.trim());
  if (typeof o.tagline === "string") patch.tagline = o.tagline.trim() || null;
  if (typeof o.description === "string") patch.description = o.description.trim();
  if (typeof o.universe === "string") {
    if (!UNIVERSES.includes(o.universe as ProductUniverse)) return null;
    patch.universe = o.universe as ProductUniverse;
  }
  if ("price_cents" in o) {
    const priceRaw = o.price_cents;
    if (priceRaw === null || priceRaw === "") patch.price_cents = null;
    else {
      const n = typeof priceRaw === "number" ? priceRaw : Number(priceRaw);
      if (!Number.isFinite(n) || n < 0) return null;
      patch.price_cents = Math.round(n);
    }
  }
  if (typeof o.image_url === "string") patch.image_url = o.image_url.trim() || null;
  if ("featured" in o) patch.featured = Boolean(o.featured);
  if ("published" in o) patch.published = Boolean(o.published);
  if ("sort_order" in o) {
    const n = typeof o.sort_order === "number" ? o.sort_order : Number(o.sort_order);
    if (!Number.isFinite(n)) return null;
    patch.sort_order = n;
  }

  return patch;
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const patch = parsePatch(json);
  if (!patch || Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Aucune modification valide" }, { status: 400 });
  }

  const { data, error } = await auth.supabase.from("products").update(patch).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  const { error } = await auth.supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}