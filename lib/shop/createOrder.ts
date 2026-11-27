import "server-only";
import { LEGAL } from "@/content/legal";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ShopOrderTableRow } from "@/lib/supabase/database.types";
import type { CheckoutInput } from "@/lib/shop/types";
import { shippingFlatCents } from "@/lib/shop/config";
import { newTrackingToken } from "@/lib/shop/trackingToken";

type LineRow = {
  product_id: string;
  product_slug: string;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
};

export async function createPendingShopOrder(
  input: CheckoutInput,
): Promise<{ error: string } | { order: ShopOrderTableRow; lines: LineRow[] }> {
  const db = createAdminClient();
  const ids = [...new Set(input.lines.map((l) => l.productId))];

  const { data: products, error: prodErr } = await db
    .from("products")
    .select("id, name, slug, price_cents, published")
    .in("id", ids);

  if (prodErr) return { error: prodErr.message as string };
  if (!products?.length) return { error: "Produits introuvables" };

  const byId = new Map(products.map((p) => [p.id, p]));
  let subtotal_cents = 0;
  const lineRows: {
    product_id: string;
    product_slug: string;
    product_name: string;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
  }[] = [];

  for (const line of input.lines) {
    const p = byId.get(line.productId);
    if (!p || !p.published) return { error: `Produit indisponible` };
    if (p.price_cents == null || p.price_cents <= 0) return { error: `${p.name} : prix non défini` };
    const line_total_cents = p.price_cents * line.quantity;
    subtotal_cents += line_total_cents;
    lineRows.push({
      product_id: p.id,
      product_slug: p.slug,
      product_name: p.name,
      quantity: line.quantity,
      unit_price_cents: p.price_cents,
      line_total_cents,
    });
  }

  const shipping_cost_cents = input.fulfillment === "shipping" ? shippingFlatCents() : 0;
  const total_cents = subtotal_cents + shipping_cost_cents;

  const { data: orderNumberRow, error: numErr } = await db.rpc("generate_shop_order_number");
  if (numErr || !orderNumberRow) {
    return { error: numErr?.message ?? "Numéro de commande impossible" };
  }

  const order_number = String(orderNumberRow);
  const tracking_token = newTrackingToken();
  const shipping = input.shipping;

  const { data: order, error: orderErr } = await db
    .from("shop_orders")
    .insert({
      order_number,
      tracking_token,
      status: "pending_payment",
      payment_status: "pending",
      currency: "eur",
      fulfillment: input.fulfillment,
      customer_email: input.customer.email,
      customer_name: input.customer.name,
      customer_phone: input.customer.phone ?? "",
      shipping_line1: input.fulfillment === "shipping" ? shipping!.line1 : null,
      shipping_line2: input.fulfillment === "shipping" ? shipping!.line2 ?? null : null,
      shipping_postal_code: input.fulfillment === "shipping" ? shipping!.postalCode : null,
      shipping_city: input.fulfillment === "shipping" ? shipping!.city : null,
      shipping_country: input.fulfillment === "shipping" ? shipping!.country ?? "FR" : "FR",
      shipping_cost_cents,
      subtotal_cents,
      total_cents,
      cgv_version: LEGAL.version,
      cgv_accepted_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (orderErr || !order) return { error: orderErr?.message ?? "Commande impossible" };

  const { error: linesErr } = await db.from("shop_order_lines").insert(
    lineRows.map((l) => ({
      order_id: order.id,
      ...l,
    })),
  );
  if (linesErr) {
    await db.from("shop_orders").delete().eq("id", order.id);
    return { error: linesErr.message };
  }

  const { error: reserveErr } = await db.rpc("reserve_stock_for_order", { p_order_id: order.id });
  if (reserveErr) {
    await db.from("shop_orders").delete().eq("id", order.id);
    return { error: reserveErr.message };
  }

  return { order, lines: lineRows };
}