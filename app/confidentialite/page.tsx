import type { Metadata } from "next";
import { legalOperator, privacySections } from "@/content/legal";
import { LegalDocument } from "@/components/legal/LegalDocument";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Politique de confidentialité — Narcisse",
  description: "Politique de confidentialité et traitements de données personnelles — Narcisse.",
  alternates: { canonical: "/confidentialite" },
};

export default function Page() {
  return (
    <LegalDocument
      eyebrow="Données personnelles"
      title="Politique de confidentialité"
      intro={`Cette politique décrit comment ${legalOperator.brandName} traite les données collectées via le site.`}
      sections={privacySections}
    />
  );
}