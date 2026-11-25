import type { ProfileRow } from "@/lib/supabase/database.types";
import { createAdminClient } from "@/lib/supabase/admin";

/** Profil par ID utilisateur (après `getUser()`). Contourne le RLS pour ce lookup serveur. */
export async function loadProfileByUserId(userId: string): Promise<Pick<ProfileRow, "role" | "worker_id"> | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("profiles").select("role, worker_id").eq("id", userId).maybeSingle();
  if (error) {
    console.error("loadProfileByUserId", error.message);
    return null;
  }
  return data;
}