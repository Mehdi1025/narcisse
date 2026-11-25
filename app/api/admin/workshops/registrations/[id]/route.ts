import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type Ctx = { params: Promise<{ id: string }> };

const ALLOWED = new Set(["registered", "waitlist", "cancelled", "attended"]);

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const status = (json as { status?: string }).status;
  if (!status || !ALLOWED.has(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("workshop_registrations")
    .update({ status, waitlist_position: status === "waitlist" ? undefined : null })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ registration: data });
}