import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { buildPrivacySections } from "@/components/legal/sections/PrivacySections";
import { LEGAL } from "@/content/legal";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Politique de confidentialité — Narcisse",
  description: "Traitement des données personnelles — Narcisse.",
  alternates: { canonical: "/confidentialite" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <LegalPage
      eyebrow="Données personnelles"
      title="Politique de confidentialité"
      intro={`Cette politique décrit comment ${LEGAL.nomCommercial} traite les données collectées via le site.`}
      sections={buildPrivacySections()}
    />
  );
}