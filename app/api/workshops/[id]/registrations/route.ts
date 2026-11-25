import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { requireEmployee } from "@/lib/auth/requireEmployee";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const admin = await requireAdmin();
  if (!("error" in admin)) {
    const { data, error } = await admin.supabase
      .from("workshop_registrations")
      .select("*")
      .eq("workshop_id", id)
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ registrations: data });
  }

  const emp = await requireEmployee();
  if ("error" in emp) return emp.error;

  const { data: w } = await emp.supabase.from("workshops").select("id").eq("id", id).eq("proposed_by", emp.workerId).maybeSingle();
  if (!w) return NextResponse.json({ error: "Atelier introuvable" }, { status: 404 });

  const { data, error } = await emp.supabase
    .from("workshop_registrations")
    .select("*")
    .eq("workshop_id", id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ registrations: data });
}