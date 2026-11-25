/**
 * Crée les 3 comptes de démo dans Supabase Auth (à lancer après les migrations SQL).
 * Usage : npm run seed:users
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

const USERS = [
  { email: "admin@narcisse.local", password: "password", username: "admin", role: "admin", worker_id: null, display_name: "Administratrice" },
  { email: "lina@narcisse.local", password: "password", username: "lina", role: "employee", worker_id: "lina", display_name: "Lina" },
  { email: "t2@narcisse.local", password: "password", username: "travailleuse2", role: "employee", worker_id: "t2", display_name: "Travailleuse 2" },
];

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local");
  process.exit(1);
}

const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

for (const u of USERS) {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((x) => x.email === u.email);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password: u.password,
      user_metadata: { username: u.username, role: u.role, display_name: u.display_name, worker_id: u.worker_id },
    });
    await admin.from("profiles").upsert({
      id: existing.id,
      role: u.role,
      worker_id: u.worker_id,
      username: u.username,
      display_name: u.display_name,
    });
    console.log(`Mis à jour : ${u.username} (${u.email})`);
    continue;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: {
      username: u.username,
      role: u.role,
      display_name: u.display_name,
      worker_id: u.worker_id,
    },
  });
  if (error) {
    console.error(u.email, error.message);
    process.exit(1);
  }
  console.log(`Créé : ${u.username} (${data.user?.id})`);
}

console.log("\nComptes prêts. Mot de passe : password");