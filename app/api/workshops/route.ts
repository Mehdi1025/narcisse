import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { requireEmployee } from "@/lib/auth/requireEmployee";
import type { WorkshopInput } from "@/lib/workshops/types";

function parseInput(body: unknown): WorkshopInput | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  if (!title) return null;
  const starts_at = typeof o.starts_at === "string" ? o.starts_at : "";
  const ends_at = typeof o.ends_at === "string" ? o.ends_at : "";
  if (!starts_at || !ends_at || new Date(ends_at) <= new Date(starts_at)) return null;
  const capacity = typeof o.capacity === "number" ? o.capacity : Number(o.capacity);
  if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) return null;
  return {
    title,
    description: typeof o.description === "string" ? o.description.trim() : "",
    starts_at,
    ends_at,
    capacity: Math.round(capacity),
    location: typeof o.location === "string" && o.location.trim() ? o.location.trim() : "Narcisse",
  };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!("error" in admin)) {
    const { data, error } = await admin.supabase.from("workshops").select("*").order("starts_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ workshops: data });
  }

  const emp = await requireEmployee();
  if ("error" in emp) return emp.error;

  const { data, error } = await emp.supabase
    .from("workshops")
    .select("*")
    .eq("proposed_by", emp.workerId)
    .order("starts_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ workshops: data });
}

export async function POST(request: Request) {
  const emp = await requireEmployee();
  if ("error" in emp) return emp.error;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const input = parseInput(json);
  if (!input) return NextResponse.json({ error: "Données atelier invalides" }, { status: 400 });

  const { data, error } = await emp.supabase
    .from("workshops")
    .insert({
      title: input.title,
      description: input.description ?? "",
      starts_at: input.starts_at,
      ends_at: input.ends_at,
      capacity: input.capacity,
      location: input.location ?? "Narcisse",
      proposed_by: emp.workerId,
      status: "draft",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ workshop: data }, { status: 201 });
}