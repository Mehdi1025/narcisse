import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { buildMentionsSections } from "@/components/legal/sections/MentionsSections";
import { LEGAL } from "@/content/legal";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Mentions légales — Narcisse",
  description: "Mentions légales du site Narcisse.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <LegalPage
      eyebrow="Informations"
      title="Mentions légales"
      intro={`Site ${LEGAL.nomCommercial}.`}
      sections={buildMentionsSections()}
    />
  );
}