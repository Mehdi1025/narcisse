import type { MetadataRoute } from "next";

export const dynamic = "force-static";
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://narcisse.example";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/boutique", "/boutique/cgv", "/ateliers", "/mentions-legales", "/confidentialite"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p === "/boutique" ? 0.85 : 0.3,
  }));
}
