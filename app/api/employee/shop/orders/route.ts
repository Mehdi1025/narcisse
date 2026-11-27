import { NextResponse } from "next/server";
import { requireShopWorker } from "@/lib/auth/requireShopWorker";

export async function GET() {
  const auth = await requireShopWorker();
  if ("error" in auth) return auth.error;

  const { data: orders, error } = await auth.supabase.rpc("employee_list_shop_orders");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!orders?.length) return NextResponse.json({ orders: [] });

  const ids = orders.map((o: { id: string }) => o.id);
  const { data: lines, error: lineErr } = await auth.supabase
    .from("shop_order_lines")
    .select("*")
    .in("order_id", ids);
  if (lineErr) return NextResponse.json({ error: lineErr.message }, { status: 500 });

  const byOrder = new Map<string, unknown[]>();
  for (const line of lines ?? []) {
    const list = byOrder.get(line.order_id) ?? [];
    list.push(line);
    byOrder.set(line.order_id, list);
  }

  const enriched = orders.map((o: { id: string }) => ({
    ...o,
    shop_order_lines: byOrder.get(o.id) ?? [],
  }));

  return NextResponse.json({ orders: enriched });
}