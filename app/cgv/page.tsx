import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { buildCgvSections } from "@/components/legal/sections/CgvSections";
import { LEGAL } from "@/content/legal";
import { sellsGiftCardOnline } from "@/lib/legal/sellsGiftCard";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Conditions générales de vente — Narcisse",
  description: "CGV de la boutique en ligne Narcisse.",
  alternates: { canonical: "/cgv" },
  robots: { index: true, follow: true },
};

export default async function CgvPage() {
  const giftCard = await sellsGiftCardOnline();
  return (
    <LegalPage
      eyebrow="Boutique"
      title="Conditions générales de vente"
      intro={`${LEGAL.nomCommercial} — vente en ligne de produits physiques, retrait sur place.`}
      sections={buildCgvSections(giftCard)}
      backHref="/boutique"
      backLabel="Boutique"
    />
  );
}