import { NextResponse } from "next/server";
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

  const { data: row, error: profileError } = await supabase
    .from("profiles")
    .select("role, worker_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "profil_lecture", detail: profileError.message }, { status: 500 });
  }

  const profile = profileFromRow(row);
  if (!profile) {
    return NextResponse.json({ error: "profil_manquant", raw: row }, { status: 403 });
  }

  return NextResponse.json({ profile, role: row?.role, worker_id: row?.worker_id });
}