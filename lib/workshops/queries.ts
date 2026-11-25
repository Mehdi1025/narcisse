import { createClient } from "@/lib/supabase/server";
import type { WorkshopRow } from "@/lib/workshops/types";

export async function getPublishedWorkshops(): Promise<WorkshopRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workshops")
    .select("*")
    .eq("status", "published")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (error || !data) return [];
  return data as WorkshopRow[];
}