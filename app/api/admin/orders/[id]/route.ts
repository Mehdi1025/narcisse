import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { maybeSendReadyPickupOnTransition } from "@/lib/email/sendOrderReadyPickup";
import { processOrderCancellation } from "@/lib/shop/cancelPaidOrder";
import type { ShopOrderStatus } from "@/lib/shop/types";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const note = typeof body.admin_note === "string" ? body.admin_note.trim() || null : undefined;

  if (typeof body.status === "string") {
    if (!ALLOWED.includes(body.status as ShopOrderStatus)) {
      return NextResponse.json({ error: "Statut non autorisé" }, { status: 400 });
    }
    const db = createAdminClient();
    const { data: before } = await db.from("shop_orders").select("status").eq("id", id).single();
    const prev = before?.status;

    if (body.status === "cancelled" || body.status === "refunded") {
      const result = await processOrderCancellation(id, body.status, note ?? undefined);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
      const { data: lines } = await auth.supabase.from("shop_order_lines").select("*").eq("order_id", id);
      return NextResponse.json({ order: { ...result.order, shop_order_lines: lines ?? [] } });
    }

    const patch: { status?: ShopOrderStatus; admin_note?: string | null } = { status: body.status as ShopOrderStatus };
    if (note !== undefined) patch.admin_note = note;

    const { data, error } = await auth.supabase
      .from("shop_orders")
      .update(patch)
      .eq("id", id)
      .select("*, shop_order_lines(*)")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (body.status === "ready_pickup") {
      await maybeSendReadyPickupOnTransition(id, prev, body.status);
    }
    return NextResponse.json({ order: data });
  }

  if (note !== undefined) {
    const { data, error } = await auth.supabase
      .from("shop_orders")
      .update({ admin_note: note })
      .eq("id", id)
      .select("*, shop_order_lines(*)")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ order: data });
  }

  return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
}