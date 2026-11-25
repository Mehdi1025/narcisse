import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { ShopOrderStatus } from "@/lib/shop/types";

const ALLOWED: ShopOrderStatus[] = [
  "preparing",
  "ready_pickup",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

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

  const body = json as { status?: string; admin_note?: string };
  const patch: Record<string, unknown> = {};

  if (typeof body.status === "string") {
    if (!ALLOWED.includes(body.status as ShopOrderStatus)) {
      return NextResponse.json({ error: "Statut non autorisé" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (typeof body.admin_note === "string") patch.admin_note = body.admin_note.trim() || null;

  if (!Object.keys(patch).length) return NextResponse.json({ error: "Aucune modification" }, { status: 400 });

  const { data, error } = await auth.supabase
    .from("shop_orders")
    .update(patch as { status?: ShopOrderStatus; admin_note?: string | null })
    .eq("id", id)
    .select("*, shop_order_lines(*)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ order: data });
}