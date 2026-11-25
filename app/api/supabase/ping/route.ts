import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Vérifie que les variables Supabase sont lues et que l’API répond (sans exposer de clé). */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
    return NextResponse.json({ ok: true, connected: true, session: data.session ? "active" : "none" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}