import { NextResponse } from "next/server";
import { loadProfileFromSession } from "@/lib/auth/loadProfile";
import { createClient } from "@/lib/supabase/server";

export async function requireEmployee() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };

  const row = await loadProfileFromSession(supabase);
  if (!row || row.role !== "employee" || !row.worker_id) {
    return { error: NextResponse.json({ error: "Réservé aux travailleuses" }, { status: 403 }) };
  }

  return { supabase, user, workerId: row.worker_id };
}