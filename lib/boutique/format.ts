export function formatPrice(priceCents: number | null): string | null {
  if (priceCents == null) return null;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(priceCents / 100);
}

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}