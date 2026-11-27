/**
 * Met à jour les mots de passe des 3 comptes *@narcisse.local (sans e-mail).
 * Usage :
 *   set ALLOW_DEMO_SEED=1
 *   set DEMO_PASSWORD=MonMdp-Fort-2026!Aa
 *   npm run passwords:demo
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const EMAILS = ["admin@narcisse.local", "lina@narcisse.local", "t2@narcisse.local"];

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    console.error("Créez .env.local (voir .env.copy) avec URL + SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const password = process.env.DEMO_PASSWORD?.trim();
if (!password || password.length < 12) {
  console.error("Définissez DEMO_PASSWORD (≥ 12 car., maj/min/chiffre/symbole selon Supabase).");
  process.exit(1);
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
if (!siteUrl.includes("localhost") && process.env.ALLOW_DEMO_SEED !== "1") {
  console.error("Base distante : ajoutez ALLOW_DEMO_SEED=1 dans .env.local pour confirmer.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis.");
  process.exit(1);
}

const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
if (listErr) {
  console.error("List users:", listErr.message);
  process.exit(1);
}

for (const email of EMAILS) {
  const user = list.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    console.warn("Absent :", email, "— lancez npm run seed:users avant.");
    continue;
  }
  const { error } = await admin.auth.admin.updateUserById(user.id, { password });
  if (error) {
    console.error(email, error.message);
    if (error.message.toLowerCase().includes("weak")) {
      console.error("  → Mot de passe refusé (longueur, complexité ou fuite HIBP). Essayez un autre.");
    }
    process.exit(1);
  }
  console.log("Mot de passe mis à jour :", email);
}

console.log("\nConnexion au site avec identifiant admin / lina / travailleuse2 et DEMO_PASSWORD.");