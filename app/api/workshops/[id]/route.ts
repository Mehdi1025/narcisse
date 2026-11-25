import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { requireEmployee } from "@/lib/auth/requireEmployee";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }
  const body = json as Record<string, unknown>;
  const patch: {
    title?: string;
    description?: string;
    starts_at?: string;
    ends_at?: string;
    capacity?: number;
    location?: string;
    status?: string;
  } = {};

  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
  if (typeof body.description === "string") patch.description = body.description.trim();
  if (typeof body.starts_at === "string") patch.starts_at = body.starts_at;
  if (typeof body.ends_at === "string") patch.ends_at = body.ends_at;
  if (body.capacity != null) {
    const n = Number(body.capacity);
    if (Number.isFinite(n) && n >= 1 && n <= 200) patch.capacity = Math.round(n);
  }
  if (typeof body.location === "string") patch.location = body.location.trim();

  const admin = await requireAdmin();
  if (!("error" in admin)) {
    if (body.status === "cancelled") patch.status = "cancelled";
    const { data, error } = await admin.supabase.from("workshops").update(patch).eq("id", id).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ workshop: data });
  }

  const emp = await requireEmployee();
  if ("error" in emp) return emp.error;

  const { data, error } = await emp.supabase
    .from("workshops")
    .update(patch)
    .eq("id", id)
    .eq("proposed_by", emp.workerId)
    .in("status", ["draft", "pending", "rejected"])
    .select("*")
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Modification impossible" }, { status: 400 });
  return NextResponse.json({ workshop: data });
}