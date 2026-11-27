import { legalOperator } from "@/content/legal";
import { completer } from "@/lib/legal/completer";
import { shippingEnabled } from "@/lib/shop/defaults";

/** Adresse de retrait affichée au checkout (alignée sur les données légales). */
export const PICKUP_LOCATION = {
  name: legalOperator.brandName,
  line1: completer(legalOperator.registeredAddress),
  line2: "Retrait sur place après e-mail « commande prête »",
  city: "",
  postalCode: "",
};

export { shippingEnabled };

export function shippingFlatCents(): number {
  const raw =
    process.env.NEXT_PUBLIC_SHOP_SHIPPING_FLAT_CENTS ?? process.env.SHOP_SHIPPING_FLAT_CENTS ?? "590";
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 590;
}

export function siteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}