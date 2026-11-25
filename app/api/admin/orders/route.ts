import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let q = auth.supabase
    .from("shop_orders")
    .select("*, shop_order_lines(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) q = q.eq("status", status as import("@/lib/supabase/database.types").ShopOrderStatus);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}