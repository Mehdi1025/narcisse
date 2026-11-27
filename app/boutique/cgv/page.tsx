import type { Metadata } from "next";
import { cgvSections, legalOperator, shopLegalFacts } from "@/content/legal";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { legalSiteUrl } from "@/lib/legal/completer";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Conditions générales de vente — Boutique Narcisse",
  description: "CGV de la boutique en ligne Narcisse : commande, retrait sur place, paiement et droits.",
  alternates: { canonical: "/boutique/cgv" },
};

export default function CgvPage() {
  return (
    <LegalDocument
      eyebrow="Boutique"
      title="Conditions générales de vente"
      intro={`${legalOperator.brandName} — ${shopLegalFacts.pitch} Boutique : ${legalSiteUrl()}/boutique.`}
      sections={cgvSections}
      backHref="/boutique"
      backLabel="Boutique"
      footerNote={
        <>
          Dernière mise à jour : version provisoire au lancement. Document contractuel accessible avant toute commande.
        </>
      }
    />
  );
}