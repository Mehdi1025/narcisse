import type { Profile, WorkerId } from "@/lib/app/types";
import type { ProfileRow } from "@/lib/supabase/database.types";

export type DbRole = "admin" | "employee";

/** Rôle en base → profil dashboard (admin / lina / t2). */
export function profileFromRow(row: Pick<ProfileRow, "role" | "worker_id"> | null): Profile | null {
  if (!row) return null;
  const role = String(row.role);
  if (role === "admin") return "admin";
  if (role === "employee" && row.worker_id) return row.worker_id as WorkerId;
  // Ancien schéma (lina / t2 comme rôle)
  if (role === "lina" || role === "t2") return role as WorkerId;
  return null;
}

export function dashboardPathForRow(row: Pick<ProfileRow, "role" | "worker_id"> | null): "/admin" | "/dashboard" | null {
  if (!row) return null;
  return row.role === "admin" ? "/admin" : row.role === "employee" ? "/dashboard" : null;
}