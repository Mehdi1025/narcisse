/**
 * Crée ou met à jour les comptes de démo (après migrations SQL).
 * Usage : DEMO_PASSWORD=… npm run seed:users
 * Local uniquement, ou ALLOW_DEMO_SEED=1 sur une base non locale.
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
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const USERS = [
  { email: "admin@narcisse.local", username: "admin", role: "admin", worker_id: null, display_name: "Administratrice" },
  { email: "lina@narcisse.local", username: "lina", role: "employee", worker_id: "lina", display_name: "Lina" },
  { email: "t2@narcisse.local", username: "travailleuse2", role: "employee", worker_id: "t2", display_name: "Travailleuse 2" },
];

loadEnv();

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const isLocal = siteUrl.includes("localhost");
const allowRemote = process.env.ALLOW_DEMO_SEED === "1";
if (!isLocal && !allowRemote) {
  console.error(
    "Refus : NEXT_PUBLIC_SITE_URL ne contient pas « localhost ».\n" +
      "Pour une base distante de démo uniquement, définissez ALLOW_DEMO_SEED=1 en connaissance du risque.",
  );
  process.exit(1);
}

const password = process.env.DEMO_PASSWORD?.trim();
if (!password || password.length < 12) {
  console.error("DEMO_PASSWORD requis dans .env.local (12 caractères minimum).");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local");
  process.exit(1);
}

const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

async function upsertProfile(userId, u) {
  const { error } = await admin.from("profiles").upsert({
    id: userId,
    role: u.role,
    worker_id: u.worker_id,
    username: u.username,
    display_name: u.display_name,
  });
  if (error) {
    console.error(`Profil ${u.username} :`, error.message);
    process.exit(1);
  }
}

for (const u of USERS) {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((x) => x.email === u.email);
  if (existing) {
    const { error: authErr } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: { username: u.username, display_name: u.display_name },
    });
    if (authErr) {
      console.error(u.email, authErr.message);
      process.exit(1);
    }
    await upsertProfile(existing.id, u);
    console.log(`Mis à jour : ${u.username} (${u.email})`);
    continue;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password,
    email_confirm: true,
    user_metadata: { username: u.username, display_name: u.display_name },
  });
  if (error) {
    console.error(u.email, error.message);
    process.exit(1);
  }
  const userId = data.user?.id;
  if (!userId) {
    console.error(u.email, "identifiant utilisateur manquant");
    process.exit(1);
  }
  await upsertProfile(userId, u);
  console.log(`Créé : ${u.username} (${userId})`);
}

console.log("\nComptes de démo prêts (mot de passe : variable DEMO_PASSWORD, non affichée).");