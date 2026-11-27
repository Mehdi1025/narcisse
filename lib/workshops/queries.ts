import { createPublicClient } from "@/lib/supabase/public";
import type { PublishedWorkshop } from "@/lib/workshops/types";

const WORKSHOP_COLUMNS =
  "id, title, description, starts_at, ends_at, capacity, location, status" as const;

export async function getPublishedWorkshops(): Promise<PublishedWorkshop[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("workshops")
    .select(WORKSHOP_COLUMNS)
    .eq("status", "published")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (error) throw new Error("Ateliers indisponibles : " + error.message);
  return (data ?? []) as PublishedWorkshop[];
}