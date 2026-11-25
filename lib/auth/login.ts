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

export type SessionRole = "admin" | "lina" | "t2";

export function dashboardForRole(role: SessionRole): "/dashboard_admin" | "/dashboard_employe" {
  return role === "admin" ? "/dashboard_admin" : "/dashboard_employe";
}