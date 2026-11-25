import type { Metadata } from "next";
import BoutiquePage from "@/components/boutique/BoutiquePage";
import { getShopProducts } from "@/lib/boutique/getShopProducts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "La boutique — Narcisse",
  description:
    "Beauté et skincare, bien-être, développement personnel et éditions exclusives : l'art de prendre soin de soi, jusque chez soi.",
  alternates: { canonical: "/boutique" },
};

export default async function Page() {
  await getShopProducts();
  return <BoutiquePage />;
}