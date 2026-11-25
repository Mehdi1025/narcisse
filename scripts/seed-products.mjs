/**
 * Importe les 16 produits provisoires (content/catalogue_boutique_provisoire.json).
 * Usage : npm run seed:products  (après migration 008_products.sql)
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    console.error("Fichier .env.local introuvable");
    process.exit(1);
  }
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const UNIVERSE_MAP = {
  "Beauté et skincare": "skincare",
  "Bien-être et art de vivre": "art-de-vivre",
  "Développement personnel": "developpement",
  "Éditions exclusives": "editions",
};

const VITRINE_REFS = new Set(["NAR-SK-01", "NAR-BV-01", "NAR-DP-01", "NAR-ED-01"]);

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local");
  process.exit(1);
}

const catalogue = JSON.parse(readFileSync(resolve(process.cwd(), "content/catalogue_boutique_provisoire.json"), "utf8"));

const rows = catalogue.map((item, index) => {
  const file = item.photo.replace(/^photos\//, "");
  return {
    name: item.nom,
    slug: item.ref.toLowerCase(),
    tagline: `Réf. ${item.ref} — sélection provisoire`,
    description: item.description,
    universe: UNIVERSE_MAP[item.univers],
    price_cents: Math.round(item.prix * 100),
    image_url: `/boutique/photos/${file}`,
    featured: VITRINE_REFS.has(item.ref),
    published: true,
    sort_order: index,
  };
});

const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

const { data, error } = await admin.from("products").upsert(rows, { onConflict: "slug" }).select("slug");
if (error) {
  console.error("Erreur Supabase:", error.message);
  process.exit(1);
}
console.log(`OK — ${data?.length ?? rows.length} produit(s) en boutique (provisoire).`);