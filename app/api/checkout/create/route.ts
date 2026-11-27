import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { checkoutBlockedForLive } from "@/lib/legal/stripeMode";
import { siteOrigin } from "@/lib/shop/config";
import { createPendingShopOrder } from "@/lib/shop/createOrder";
import { getReservationMinutes } from "@/lib/shop/getReservationMinutes";
import { parseCheckoutBody } from "@/lib/shop/parseCheckout";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function abortCheckout(orderId: string, note: string) {
  const db = createAdminClient();
  await db.rpc("release_stock_reservation_for_order", { p_order_id: orderId, p_note: note });
  await db
    .from("shop_orders")
    .update({ status: "cancelled", payment_status: "failed" })
    .eq("id", orderId);
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const parsed = parseCheckoutBody(json);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  if (checkoutBlockedForLive()) {
    return NextResponse.json({ error: "Les commandes en ligne ouvrent très prochainement." }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Paiement en ligne non configuré (STRIPE_SECRET_KEY manquant sur le serveur)." },
      { status: 503 },
    );
  }

  const created = await createPendingShopOrder(parsed);
  if ("error" in created) return NextResponse.json({ error: created.error }, { status: 400 });

  const { order, lines } = created;
  const origin = siteOrigin().replace(/\/$/, "");
  const reservationMinutes = await getReservationMinutes();
  const sessionTtlSec = Math.max(30, reservationMinutes - 4) * 60;

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map((l) => ({
    quantity: l.quantity,
    price_data: {
      currency: "eur",
      unit_amount: l.unit_price_cents,
      product_data: { name: l.product_name },
    },
  }));

  if (order.shipping_cost_cents > 0) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: order.shipping_cost_cents,
        product_data: { name: "Livraison" },
      },
    });
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.customer.email,
      line_items,
      expires_at: Math.floor(Date.now() / 1000) + sessionTtlSec,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        tracking_token: order.tracking_token,
      },
      success_url: `${origin}/boutique/merci?commande=${encodeURIComponent(order.order_number)}&suivi=${encodeURIComponent(order.tracking_token)}`,
      cancel_url: `${origin}/boutique/commande?annule=1`,
    });
  } catch {
    await abortCheckout(order.id, "Échec création session Stripe");
    return NextResponse.json({ error: "Paiement momentanément indisponible, réessayez." }, { status: 502 });
  }

  if (!session.url) {
    await abortCheckout(order.id, "Session Stripe sans URL");
    return NextResponse.json({ error: "Paiement momentanément indisponible, réessayez." }, { status: 502 });
  }

  const db = createAdminClient();
  await db.from("shop_orders").update({ stripe_checkout_session_id: session.id }).eq("id", order.id);

  return NextResponse.json({ checkoutUrl: session.url, orderNumber: order.order_number });
}