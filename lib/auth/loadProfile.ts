import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ProfileRow } from "@/lib/supabase/database.types";
import { createAdminClient } from "@/lib/supabase/admin";

type ProfileSlice = Pick<ProfileRow, "role" | "worker_id">;

/** Profil du user de la session courante (préfère RPC sécurisée). */
export async function loadProfileFromSession(
  supabase: SupabaseClient<Database>,
): Promise<ProfileSlice | null> {
  const { data, error } = await supabase.rpc("get_my_profile");
  if (!error && data?.length) return data[0] as ProfileSlice;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return loadProfileByUserId(user.id);
}

/** Secours : clé service_role (seed / admin). */
export async function loadProfileByUserId(userId: string): Promise<ProfileSlice | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("profiles").select("role, worker_id").eq("id", userId).maybeSingle();
    if (error) {
      console.error("loadProfileByUserId", error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error("loadProfileByUserId", e);
    return null;
  }
}