import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

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
    if (orderId) {
      const db = createAdminClient();
      await db.rpc("release_stock_reservation_for_order", {
        p_order_id: orderId,
        p_note: "Session Stripe expirée",
      });
      await db
        .from("shop_orders")
        .update({ status: "cancelled", payment_status: "failed" })
        .eq("id", orderId)
        .eq("payment_status", "pending");
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      const db = createAdminClient();
      const { error } = await db.rpc("complete_shop_order_payment", {
        p_order_id: orderId,
        p_stripe_session_id: session.id,
      });
      if (error) {
        console.error("complete_shop_order_payment", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}