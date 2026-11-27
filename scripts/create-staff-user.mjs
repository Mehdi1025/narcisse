/**
 * Crée un compte équipe (admin ou employée) + ligne public.profiles.
 * Usage :
 *   node scripts/create-staff-user.mjs --email user@example.com --username lina --role employee --worker lina --name "Lina"
 *   node scripts/create-staff-user.mjs --email admin@example.com --username admin --role admin --name "Administratrice"
 *
 * Nécessite .env.local : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
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

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      out[key] = val;
    }
  }
  return out;
}

function usage() {
  console.error(`Usage : node scripts/create-staff-user.mjs \\
  --email <email> --username <identifiant> --role admin|employee \\
  [--worker lina|t2] --name "<nom affiché>"`);
  process.exit(1);
}

loadEnv();

const args = parseArgs(process.argv);
const email = typeof args.email === "string" ? args.email.trim().toLowerCase() : "";
const username = typeof args.username === "string" ? args.username.trim().toLowerCase() : "";
const role = typeof args.role === "string" ? args.role.trim().toLowerCase() : "";
const displayName = typeof args.name === "string" ? args.name.trim() : username;
const worker = typeof args.worker === "string" ? args.worker.trim().toLowerCase() : null;

if (!email || !email.includes("@") || !username || !displayName) usage();
if (role !== "admin" && role !== "employee") {
  console.error("--role doit être admin ou employee");
  process.exit(1);
}
if (role === "employee" && worker !== "lina" && worker !== "t2") {
  console.error("Employée : --worker lina ou t2 requis");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis");
  process.exit(1);
}

const password = randomBytes(18).toString("base64url");
const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { username, display_name: displayName },
});
if (error) {
  console.error("Auth:", error.message);
  process.exit(1);
}

const userId = data.user?.id;
if (!userId) {
  console.error("Identifiant utilisateur manquant");
  process.exit(1);
}

const worker_id = role === "admin" ? null : worker;
const { error: profileErr } = await admin.from("profiles").upsert({
  id: userId,
  role,
  worker_id,
  username,
  display_name: displayName,
});

if (profileErr) {
  console.error("Profil:", profileErr.message);
  await admin.auth.admin.deleteUser(userId);
  process.exit(1);
}

console.log("Compte créé.");
console.log("  E-mail       :", email);
console.log("  Identifiant  :", username);
console.log("  Rôle         :", role, worker_id ? `(worker_id=${worker_id})` : "");
console.log("  Mot de passe :", password);
console.log("\nConservez ce mot de passe : il ne sera plus affiché.");