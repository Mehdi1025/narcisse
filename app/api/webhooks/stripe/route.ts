import { NextResponse } from "next/server";
import { revalidateShop } from "@/lib/cache/revalidatePublic";
import { sendOrderConfirmationEmail } from "@/lib/email/sendOrderConfirmation";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

async function releasePendingOrder(orderId: string, note: string) {
  const db = createAdminClient();
  await db.rpc("release_stock_reservation_for_order", { p_order_id: orderId, p_note: note });
  await db
    .from("shop_orders")
    .update({ status: "cancelled", payment_status: "failed" })
    .eq("id", orderId)
    .eq("payment_status", "pending");
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Signature invalide";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) await releasePendingOrder(orderId, "Session Stripe expirée");
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) await releasePendingOrder(orderId, "Paiement Stripe échoué ou abandonné");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (!orderId) return NextResponse.json({ received: true });

    const full = await stripe.checkout.sessions.retrieve(session.id);
    if (full.payment_status !== "paid") {
      return NextResponse.json({ received: true, skipped: "payment_not_paid" });
    }

    const db = createAdminClient();
    const { data: order } = await db.from("shop_orders").select("total_cents, payment_status").eq("id", orderId).single();
    if (!order) {
      return NextResponse.json({ error: "Commande inconnue" }, { status: 400 });
    }
    if (full.amount_total != null && order.total_cents !== full.amount_total) {
      console.error("stripe_amount_mismatch", orderId, order.total_cents, full.amount_total);
      return NextResponse.json({ error: "Montant incohérent" }, { status: 400 });
    }

    const { error } = await db.rpc("complete_shop_order_payment", {
      p_order_id: orderId,
      p_stripe_session_id: full.id,
    });
    if (error) {
      console.error("complete_shop_order_payment", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    revalidateShop();
    try {
      await sendOrderConfirmationEmail(orderId);
    } catch (e) {
      console.error("order_confirmation_email", e instanceof Error ? e.message : e);
    }
  }

  return NextResponse.json({ received: true });
}