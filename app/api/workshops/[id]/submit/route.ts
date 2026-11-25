import { NextResponse } from "next/server";
import { requireEmployee } from "@/lib/auth/requireEmployee";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const emp = await requireEmployee();
  if ("error" in emp) return emp.error;

  const { id } = await ctx.params;
  const { data, error } = await emp.supabase
    .from("workshops")
    .update({ status: "pending", admin_note: null })
    .eq("id", id)
    .eq("proposed_by", emp.workerId)
    .in("status", ["draft", "rejected"])
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Envoi impossible — vérifiez le brouillon." }, { status: 400 });
  }
  return NextResponse.json({ workshop: data });
}