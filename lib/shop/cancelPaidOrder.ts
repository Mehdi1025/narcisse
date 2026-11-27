import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateShop } from "@/lib/cache/revalidatePublic";
import { getStripe } from "@/lib/stripe/server";
import type { ShopOrderTableRow } from "@/lib/supabase/database.types";

export type CancelMode = "cancelled" | "refunded";

export async function processOrderCancellation(
  orderId: string,
  mode: CancelMode,
  note?: string,
): Promise<{ error?: string; order?: ShopOrderTableRow }> {
  const db = createAdminClient();
  const { data: order, error: loadErr } = await db.from("shop_orders").select("*").eq("id", orderId).single();
  if (loadErr || !order) return { error: loadErr?.message ?? "Commande introuvable" };

  if (order.status === "cancelled" || order.status === "refunded") {
    return { order };
  }

  const adminNote = note?.trim() || order.admin_note;

  if (order.payment_status === "pending") {
    await db.rpc("release_stock_reservation_for_order", {
      p_order_id: orderId,
      p_note: "Annulation avant paiement",
    });
    const { data: updated, error } = await db
      .from("shop_orders")
      .update({
        status: "cancelled",
        payment_status: "failed",
        admin_note: adminNote,
      })
      .eq("id", orderId)
      .select("*")
      .single();
    if (error) return { error: error.message };
    revalidateShop();
    return { order: updated ?? undefined };
  }

  if (order.payment_status === "paid") {
    const stripe = getStripe();
    if (stripe && order.stripe_checkout_session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);
        const pi = session.payment_intent;
        const paymentIntentId = typeof pi === "string" ? pi : pi?.id;
        if (paymentIntentId) {
          await stripe.refunds.create({ payment_intent: paymentIntentId });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Remboursement Stripe impossible";
        return { error: msg };
      }
    }

    const { error: stockErr } = await db.rpc("restore_stock_for_paid_order", {
      p_order_id: orderId,
      p_note: mode === "refunded" ? "Remboursement" : "Annulation commande payée",
    });
    if (stockErr) return { error: stockErr.message };

    const { data: updated, error } = await db
      .from("shop_orders")
      .update({
        status: mode,
        payment_status: "refunded",
        admin_note: adminNote,
      })
      .eq("id", orderId)
      .select("*")
      .single();
    if (error) return { error: error.message };
    revalidateShop();
    return { order: updated ?? undefined };
  }

  const { data: updated, error } = await db
    .from("shop_orders")
    .update({ status: mode, admin_note: adminNote })
    .eq("id", orderId)
    .select("*")
    .single();
  if (error) return { error: error.message };
  revalidateShop();
  return { order: updated ?? undefined };
}