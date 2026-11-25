import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTrackingToken } from "@/lib/shop/trackingToken";
import type { ShopOrderStatus } from "@/lib/shop/types";

export type PublicOrderLine = {
  product_name: string;
  quantity: number;
  line_total_cents: number;
};

export type PublicOrderTracking = {
  order_number: string;
  status: ShopOrderStatus;
  payment_status: string;
  fulfillment: string;
  customer_name: string;
  subtotal_cents: number;
  shipping_cost_cents: number;
  total_cents: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
  lines: PublicOrderLine[];
};

export async function getOrderByTrackingToken(token: string): Promise<PublicOrderTracking | null> {
  if (!isTrackingToken(token)) return null;

  const db = createAdminClient();
  const { data, error } = await db.rpc("get_shop_order_by_tracking_token", { p_token: token.trim() });
  if (error || !data || typeof data !== "object") return null;

  const o = data as Record<string, unknown>;
  const rawLines = o.lines;
  const lines: PublicOrderLine[] = Array.isArray(rawLines)
    ? rawLines
        .map((l) => {
          if (!l || typeof l !== "object") return null;
          const row = l as Record<string, unknown>;
          return {
            product_name: String(row.product_name ?? ""),
            quantity: Number(row.quantity) || 0,
            line_total_cents: Number(row.line_total_cents) || 0,
          };
        })
        .filter((x): x is PublicOrderLine => Boolean(x?.product_name))
    : [];

  return {
    order_number: String(o.order_number ?? ""),
    status: o.status as ShopOrderStatus,
    payment_status: String(o.payment_status ?? ""),
    fulfillment: String(o.fulfillment ?? "pickup"),
    customer_name: String(o.customer_name ?? ""),
    subtotal_cents: Number(o.subtotal_cents) || 0,
    shipping_cost_cents: Number(o.shipping_cost_cents) || 0,
    total_cents: Number(o.total_cents) || 0,
    currency: String(o.currency ?? "eur"),
    paid_at: typeof o.paid_at === "string" ? o.paid_at : null,
    created_at: String(o.created_at ?? ""),
    lines,
  };
}