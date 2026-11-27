import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/send";
import { buildOrderReadyPickupEmail } from "@/lib/email/templates/orderReadyPickup";

export async function sendOrderReadyPickupEmail(orderId: string, opts?: { force?: boolean }): Promise<{ sent: boolean }> {
  const db = createAdminClient();
  const { data: order, error } = await db.from("shop_orders").select("*").eq("id", orderId).maybeSingle();
  if (error || !order) return { sent: false };
  if (order.fulfillment !== "pickup") return { sent: false };
  if (order.status !== "ready_pickup") return { sent: false };
  if (order.pickup_ready_email_sent_at && !opts?.force) return { sent: false };

  const { subject, html, text } = buildOrderReadyPickupEmail(order);
  const result = await sendTransactionalEmail({ to: order.customer_email, subject, html, text });
  if (!result.sent) return { sent: false };

  await db.from("shop_orders").update({ pickup_ready_email_sent_at: new Date().toISOString() }).eq("id", orderId);
  return { sent: true };
}

export async function maybeSendReadyPickupOnTransition(
  orderId: string,
  previousStatus: string | undefined,
  newStatus: string,
): Promise<void> {
  if (newStatus !== "ready_pickup" || previousStatus === "ready_pickup") return;
  try {
    await sendOrderReadyPickupEmail(orderId);
  } catch (e) {
    console.error("pickup_ready_email", e instanceof Error ? e.message : e);
  }
}