import { NextResponse } from "next/server";
import { revalidateWorkshops } from "@/lib/cache/revalidatePublic";
import { createClient } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const o = json as Record<string, unknown>;
  const full_name = typeof o.full_name === "string" ? o.full_name.trim() : "";
  const email = typeof o.email === "string" ? o.email.trim() : "";
  const phone = typeof o.phone === "string" ? o.phone.trim() : "";

  if (!full_name || !email) {
    return NextResponse.json({ error: "Nom et e-mail requis" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("register_for_workshop", {
    p_workshop_id: id,
    p_full_name: full_name,
    p_email: email,
    p_phone: phone || null,
  });

  if (error) {
    const msg = error.message.includes("déjà inscrite") ? error.message : "Inscription impossible pour cet atelier.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  revalidateWorkshops();
  return NextResponse.json({ result: data });
}