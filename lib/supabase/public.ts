import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Lectures publiques (contenu identique pour toutes les visiteuses) : clé publique, aucun cookie, aucune session.
 * Compatible avec le rendu statique et l'ISR. Jamais pour des données liées à une personne connectée.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}