import { NextResponse } from "next/server";
import { requireShopWorker } from "@/lib/auth/requireShopWorker";
import type { ShopOrderStatus } from "@/lib/shop/types";

const WORKER_STATUSES: ShopOrderStatus[] = ["preparing", "ready_pickup", "delivered"];

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireShopWorker();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const body = json as { status?: string; confirmName?: string };
  const status = body.status as ShopOrderStatus | undefined;
  if (!status || !WORKER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut non autorisé" }, { status: 400 });
  }

  if (status === "delivered" && !body.confirmName?.trim()) {
    return NextResponse.json({ error: "Confirmez le nom de la cliente" }, { status: 400 });
  }

  const { data, error } = await auth.supabase.rpc("employee_transition_shop_order", {
    p_order_id: id,
    p_status: status,
    p_confirm_name: body.confirmName?.trim() ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: lines } = await auth.supabase.from("shop_order_lines").select("*").eq("order_id", id);
  const order = Array.isArray(data) ? data[0] : data;

  return NextResponse.json({ order: { ...order, shop_order_lines: lines ?? [] } });
}