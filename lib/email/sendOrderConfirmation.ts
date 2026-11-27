import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/send";
import { buildOrderConfirmationEmail } from "@/lib/email/templates/orderConfirmation";

/** Envoie l'e-mail de confirmation si pas déjà envoyé (sauf force). */
export async function sendOrderConfirmationEmail(
  orderId: string,
  opts?: { force?: boolean },
): Promise<{ sent: boolean; reason?: string }> {
  const db = createAdminClient();
  const { data: order, error } = await db.from("shop_orders").select("*").eq("id", orderId).maybeSingle();
  if (error || !order) {
    console.error("[email] commande introuvable", orderId);
    return { sent: false, reason: "Commande introuvable" };
  }
  if (order.confirmation_email_sent_at && !opts?.force) {
    return { sent: false, reason: "E-mail déjà envoyé (utilisez renvoyer)" };
  }
  if (order.payment_status !== "paid") {
    return { sent: false, reason: `Paiement : ${order.payment_status ?? "inconnu"} (attendu paid)` };
  }

  const { data: lines } = await db.from("shop_order_lines").select("*").eq("order_id", orderId);
  const { subject, html, text } = buildOrderConfirmationEmail(order, lines ?? []);
  const result = await sendTransactionalEmail({ to: order.customer_email, subject, html, text });

  if (!result.sent) return { sent: false, reason: result.reason };

  await db
    .from("shop_orders")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", orderId);

  return { sent: true };
}