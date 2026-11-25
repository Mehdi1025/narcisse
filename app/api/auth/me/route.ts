import { NextResponse } from "next/server";
import { loadProfileFromSession } from "@/lib/auth/loadProfile";
import { profileFromRow } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "non_connecte" }, { status: 401 });
  }

  const row = await loadProfileFromSession(supabase);
  if (!row) {
    return NextResponse.json(
      {
        error: "profil_lecture",
        detail:
          "Profil introuvable. Exécutez 005_sync_profiles.sql puis 007_get_my_profile.sql dans Supabase.",
      },
      { status: 500 },
    );
  }

  const profile = profileFromRow(row);
  if (!profile) {
    return NextResponse.json({ error: "profil_manquant", raw: row }, { status: 403 });
  }

  return NextResponse.json({ profile, role: row?.role, worker_id: row?.worker_id });
}