import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const action = (json as { action?: string }).action;
  const note = typeof (json as { note?: string }).note === "string" ? (json as { note: string }).note.trim() : null;

  if (action === "publish" || action === "reject") {
    const { data, error } = await auth.supabase.rpc("admin_review_workshop", {
      p_workshop_id: id,
      p_action: action,
      p_note: note,
    });

    if (!error && data) {
      const workshop = Array.isArray(data) ? data[0] : data;
      if (workshop) return NextResponse.json({ workshop });
    }

    const { data: fallback, error: fbError } = await auth.supabase
      .from("workshops")
      .update(
        action === "publish"
          ? { status: "published", published_at: new Date().toISOString(), admin_note: note }
          : { status: "rejected", admin_note: note },
      )
      .eq("id", id)
      .in("status", ["pending", "draft"])
      .select("*")
      .maybeSingle();

    if (fbError || !fallback) {
      const msg = error?.message ?? fbError?.message ?? "Publication impossible — exécutez la migration 012 dans Supabase.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ workshop: fallback });
  }

  return NextResponse.json({ error: "Action inconnue (publish | reject)" }, { status: 400 });
}