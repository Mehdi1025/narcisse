import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { catalogueProvisoireRows } from "@/lib/boutique/catalogueProvisoire";

export async function POST() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const rows = catalogueProvisoireRows().map(({ id: _id, created_at: _c, updated_at: _u, ...row }) => row);

  const { data, error } = await auth.supabase.from("products").upsert(rows, { onConflict: "slug" }).select("slug");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ count: data?.length ?? rows.length });
}