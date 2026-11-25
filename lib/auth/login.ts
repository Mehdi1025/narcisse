/** Identifiants affichés à l’écran → e-mails techniques Supabase Auth. */
const EMAIL_BY_USERNAME: Record<string, string> = {
  admin: "admin@narcisse.local",
  lina: "lina@narcisse.local",
  t2: "t2@narcisse.local",
  travailleuse2: "t2@narcisse.local",
  "travailleuse-2": "t2@narcisse.local",
  "travailleuse deux": "t2@narcisse.local",
};

export function resolveLoginEmail(identifier: string): string | null {
  const raw = identifier.trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes("@")) return raw;
  const compact = raw.replace(/\s+/g, " ");
  const key = compact.replace(/\s/g, "");
  return EMAIL_BY_USERNAME[compact] ?? EMAIL_BY_USERNAME[key] ?? null;
}

import type { Profile } from "@/lib/app/types";

export function dashboardForProfile(profile: Profile): "/admin" | "/dashboard" {
  return profile === "admin" ? "/admin" : "/dashboard";
}

/** Anciennes URLs → nouvelles (après login ou redirection). */
export function normalizeAppPath(path: string | null): "/admin" | "/dashboard" | null {
  if (!path) return null;
  if (path.startsWith("/dashboard_admin")) return "/admin";
  if (
    path.startsWith("/dashboard_employe") ||
    path.startsWith("/dashboard_lina") ||
    path.startsWith("/dashboard_travailleuse")
  ) {
    return "/dashboard";
  }
  if (path === "/admin" || path.startsWith("/admin/")) return "/admin";
  if (path === "/dashboard" || path.startsWith("/dashboard/")) return "/dashboard";
  return null;
}