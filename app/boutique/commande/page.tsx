import type { Metadata } from "next";
import CheckoutForm from "@/components/boutique/CheckoutForm";
import { checkoutBlockedForLive } from "@/lib/legal/stripeMode";

export const metadata: Metadata = {
  title: "Commander — Boutique Narcisse",
  robots: { index: false },
};

export default async function CommandePage({
  searchParams,
}: {
  searchParams: Promise<{ annule?: string }>;
}) {
  const sp = await searchParams;
  const checkoutBlockedLive = checkoutBlockedForLive();
  return <CheckoutForm cancelled={sp.annule === "1"} checkoutBlockedLive={checkoutBlockedLive} />;
}