/** Affiche la valeur ou « à compléter » pour les champs légaux non renseignés. */
export function completer(value: string | null | undefined, fallback = "à compléter"): string {
  if (value == null || value.trim() === "") return fallback;
  return value.trim();
}

export function legalSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "à compléter";
}