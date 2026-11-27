import type { Metadata } from "next";
import { legalOperator, mentionsSections } from "@/content/legal";
import { LegalDocument } from "@/components/legal/LegalDocument";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Mentions légales — Narcisse",
  description: "Mentions légales du site Narcisse.",
  alternates: { canonical: "/mentions-legales" },
};

export default function Page() {
  return (
    <LegalDocument
      eyebrow="Informations"
      title="Mentions légales"
      intro={`Site de ${legalOperator.brandName}.`}
      sections={mentionsSections}
    />
  );
}