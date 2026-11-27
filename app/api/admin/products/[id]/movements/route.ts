import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { stockMovementLabel } from "@/lib/shop/stockLabels";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  const { data: rows, error } = await auth.supabase
    .from("stock_movements")
    .select("id, delta, reason, order_id, note, created_by, created_at")
    .eq("product_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = [...new Set((rows ?? []).map((r) => r.created_by).filter(Boolean))] as string[];
  const names = new Map<string, string>();
  if (userIds.length) {
    const { data: profiles } = await auth.supabase.from("profiles").select("id, display_name").in("id", userIds);
    for (const p of profiles ?? []) names.set(p.id, p.display_name);
  }

  const orderIds = [...new Set((rows ?? []).map((r) => r.order_id).filter(Boolean))] as string[];
  const orderNumbers = new Map<string, string>();
  if (orderIds.length) {
    const { data: orders } = await auth.supabase.from("shop_orders").select("id, order_number").in("id", orderIds);
    for (const o of orders ?? []) orderNumbers.set(o.id, o.order_number);
  }

  const movements = (rows ?? []).map((r) => ({
    id: r.id,
    delta: r.delta,
    reason: r.reason,
    reason_label: stockMovementLabel(r.reason),
    order_id: r.order_id,
    order_number: r.order_id ? orderNumbers.get(r.order_id) ?? null : null,
    note: r.note,
    created_at: r.created_at,
    author: r.created_by ? names.get(r.created_by) ?? null : null,
  }));

  return NextResponse.json({ movements });
}