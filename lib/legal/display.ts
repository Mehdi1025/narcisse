import { LEGAL } from "@/content/legal";

export function legalField(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") return "en cours de mise à jour";
  return String(value).trim();
}

export function legalSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "en cours de mise à jour";
}

/** Ligne d'identité vendeur pour affichage CGV / e-mails. */
export function vendeurAttentionLine(): string {
  const e = LEGAL.exploitant;
  const nom = legalField(e.raisonSociale !== null ? e.raisonSociale : LEGAL.nomCommercial);
  const addr = legalField(e.siege ?? LEGAL.lieu.adresseRetrait);
  const mail = legalField(e.email);
  return `${nom}, ${addr}, ${mail}`;
}

export function tvaPriceMention(): string {
  if (LEGAL.exploitant.regimeTva === "franchise_293B") {
    return "TVA non applicable, article 293 B du CGI.";
  }
  if (LEGAL.exploitant.regimeTva === "assujetti") {
    return "Prix en euros, toutes taxes comprises.";
  }
  return "Prix en euros ; régime de TVA en cours de mise à jour.";
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}