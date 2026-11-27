import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/send";
import { buildOrderShippedEmail } from "@/lib/email/templates/orderShipped";

export async function sendOrderShippedEmail(orderId: string, opts?: { force?: boolean }): Promise<{ sent: boolean }> {
  const db = createAdminClient();
  const { data: order, error } = await db.from("shop_orders").select("*").eq("id", orderId).maybeSingle();
  if (error || !order) return { sent: false };
  if (order.fulfillment !== "shipping") return { sent: false };
  if (order.status !== "shipped") return { sent: false };
  if (order.shipped_email_sent_at && !opts?.force) return { sent: false };

  const { subject, html, text } = buildOrderShippedEmail(order);
  const result = await sendTransactionalEmail({ to: order.customer_email, subject, html, text });
  if (!result.sent) return { sent: false };

  await db.from("shop_orders").update({ shipped_email_sent_at: new Date().toISOString() }).eq("id", orderId);
  return { sent: true };
}

export async function maybeSendShippedOnTransition(
  orderId: string,
  previousStatus: string | undefined,
  newStatus: string,
): Promise<void> {
  if (newStatus !== "shipped" || previousStatus === "shipped") return;
  try {
    await sendOrderShippedEmail(orderId);
  } catch (e) {
    console.error("shipped_email", e instanceof Error ? e.message : e);
  }
}