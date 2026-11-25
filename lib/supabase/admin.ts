import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/env";

/** Client administrateur (contourne RLS) — actions serveur seulement. */
export function createAdminClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}