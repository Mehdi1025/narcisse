import type { Metadata } from "next";
import BoutiquePage from "@/components/boutique/BoutiquePage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "La boutique — Narcisse",
  description:
    "Beauté et skincare, bien-être, développement personnel et éditions exclusives : l'art de prendre soin de soi, jusque chez soi.",
  alternates: { canonical: "/boutique" },
};

export default function Page() {
  return <BoutiquePage />;
}