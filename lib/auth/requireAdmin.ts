import { NextResponse } from "next/server";
import { loadProfileFromSession } from "@/lib/auth/loadProfile";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };

  const row = await loadProfileFromSession(supabase);
  if (!row || row.role !== "admin") {
    return { error: NextResponse.json({ error: "Accès réservé à l'administration" }, { status: 403 }) };
  }

  return { supabase, user, row };
}