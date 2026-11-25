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

  if (action === "publish") {
    const { data, error } = await auth.supabase
      .from("workshops")
      .update({ status: "published", published_at: new Date().toISOString(), admin_note: note })
      .eq("id", id)
      .eq("status", "pending")
      .select("*")
      .single();
    if (error || !data) return NextResponse.json({ error: "Publication impossible" }, { status: 400 });
    return NextResponse.json({ workshop: data });
  }

  if (action === "reject") {
    const { data, error } = await auth.supabase
      .from("workshops")
      .update({ status: "rejected", admin_note: note })
      .eq("id", id)
      .eq("status", "pending")
      .select("*")
      .single();
    if (error || !data) return NextResponse.json({ error: "Refus impossible" }, { status: 400 });
    return NextResponse.json({ workshop: data });
  }

  return NextResponse.json({ error: "Action inconnue (publish | reject)" }, { status: 400 });
}