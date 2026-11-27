import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revalidateShop } from "@/lib/cache/revalidatePublic";
import { catalogueProvisoireRows } from "@/lib/boutique/catalogueProvisoire";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  if (process.env.DEMO_TOOLS !== "1") {
    return NextResponse.json({ error: "Import provisoire désactivé" }, { status: 403 });
  }

  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const db = createAdminClient();
  const { data: existing } = await db.from("products").select("slug");
  const have = new Set((existing ?? []).map((p) => p.slug));

  const rows = catalogueProvisoireRows()
    .map(({ id: _id, created_at: _c, updated_at: _u, stock_on_hand: _soh, stock_reserved: _sr, ...row }) => ({
      ...row,
      stock_on_hand: 0,
      stock_reserved: 0,
      stock_alert_threshold: 3,
    }))
    .filter((r) => !have.has(r.slug));

  if (rows.length === 0) {
    return NextResponse.json({ ajoutes: 0, ignores: have.size });
  }

  const { error } = await db.from("products").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidateShop();
  return NextResponse.json({ ajoutes: rows.length, ignores: have.size });
}