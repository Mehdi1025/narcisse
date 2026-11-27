import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { requireEmployee } from "@/lib/auth/requireEmployee";

/** Admin ou employée avec compétence « Boutique ». */
export async function requireShopWorker() {
  const admin = await requireAdmin();
  if (!("error" in admin)) {
    return { supabase: admin.supabase, role: "admin" as const };
  }

  const emp = await requireEmployee();
  if ("error" in emp) return emp;

  const { data: allowed, error } = await emp.supabase.rpc("has_boutique_skill");
  if (error || !allowed) {
    return { error: NextResponse.json({ error: "Compétence Boutique requise" }, { status: 403 }) };
  }

  return { supabase: emp.supabase, role: "employee" as const, workerId: emp.workerId };
}