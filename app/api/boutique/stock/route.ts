import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

const MAX_IDS = 50;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("ids")?.trim() ?? "";
  if (!raw) {
    return NextResponse.json({ error: "Paramètre ids requis" }, { status: 400 });
  }

  const ids = [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))];
  if (ids.length === 0 || ids.length > MAX_IDS) {
    return NextResponse.json({ error: `Entre 1 et ${MAX_IDS} identifiants` }, { status: 400 });
  }
  if (ids.some((id) => !UUID_RE.test(id))) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, stock_on_hand, stock_reserved")
    .eq("published", true)
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  const out: Record<string, number> = {};
  for (const row of data ?? []) {
    const onHand = row.stock_on_hand ?? 0;
    const reserved = row.stock_reserved ?? 0;
    out[row.id] = Math.max(0, onHand - reserved);
  }

  return NextResponse.json(out, {
    headers: {
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
    },
  });
}