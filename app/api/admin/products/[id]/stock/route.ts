import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { STOCK_ADJUST_MOTIFS } from "@/lib/shop/stockLabels";

const adjustSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("ajout"),
    quantite: z.number().int().positive(),
    motif: z.enum(STOCK_ADJUST_MOTIFS),
    note: z.string().optional(),
  }),
  z.object({
    mode: z.literal("retrait"),
    quantite: z.number().int().positive(),
    motif: z.enum(STOCK_ADJUST_MOTIFS),
    note: z.string().optional(),
  }),
  z.object({
    mode: z.literal("inventaire"),
    cible: z.number().int().min(0),
    note: z.string().trim().min(1, "Indiquez une note pour l'inventaire"),
  }),
]);

type Ctx = { params: Promise<{ id: string }> };

function mapSqlError(msg: string): string {
  if (msg.includes("stock réservé")) return "Le stock ne peut pas être inférieur au stock réservé.";
  if (msg.includes("Stock insuffisant")) return "Stock insuffisant pour ce retrait.";
  if (msg.includes("Quantité invalide")) return "Quantité invalide.";
  return msg;
}

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const parsed = adjustSchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
  if (issue?.path.includes("note")) return NextResponse.json({ error: issue.message }, { status: 400 });
    return NextResponse.json({ error: issue?.message ?? "Données invalides" }, { status: 400 });
  }

  const body = parsed.data;
  if ((body.mode === "ajout" || body.mode === "retrait") && body.motif === "casse" && !body.note?.trim()) {
    return NextResponse.json({ error: "Une note est requise pour une casse / perte" }, { status: 400 });
  }

  if (body.mode === "inventaire") {
    const { error } = await auth.supabase.rpc("set_product_stock", {
      p_product_id: id,
      p_target: body.cible,
      p_note: body.note,
    });
    if (error) return NextResponse.json({ error: mapSqlError(error.message) }, { status: 400 });
  } else {
    const delta = body.mode === "ajout" ? body.quantite : -body.quantite;
    const { error } = await auth.supabase.rpc("adjust_product_stock", {
      p_product_id: id,
      p_delta: delta,
      p_reason: body.motif,
      p_note: body.note?.trim() || null,
    });
    if (error) return NextResponse.json({ error: mapSqlError(error.message) }, { status: 400 });
  }

  const { data: product, error: loadErr } = await auth.supabase.from("products").select("*").eq("id", id).single();
  if (loadErr) return NextResponse.json({ ok: true });
  return NextResponse.json({ product });
}