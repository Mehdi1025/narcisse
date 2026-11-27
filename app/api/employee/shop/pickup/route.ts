import { NextResponse } from "next/server";
import { requireShopWorker } from "@/lib/auth/requireShopWorker";

export async function POST(request: Request) {
  const auth = await requireShopWorker();
  if ("error" in auth) return auth.error;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const body = json as { orderNumber?: string; confirmName?: string };
  const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
  const confirmName = typeof body.confirmName === "string" ? body.confirmName.trim() : "";
  if (!orderNumber || !confirmName) {
    return NextResponse.json({ error: "Numéro de commande et nom requis" }, { status: 400 });
  }

  const { data, error } = await auth.supabase.rpc("employee_pickup_by_order_number", {
    p_order_number: orderNumber,
    p_confirm_name: confirmName,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const order = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ order });
}