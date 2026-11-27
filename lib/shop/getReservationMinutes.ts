import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Minutes de réservation stock (défaut 35, aligné shop_settings). */
export async function getReservationMinutes(): Promise<number> {
  const db = createAdminClient();
  const { data } = await db.from("shop_settings").select("value").eq("key", "reservation_minutes").maybeSingle();
  const raw = data?.value;
  let n = 35;
  if (typeof raw === "number") n = raw;
  else if (typeof raw === "string") n = Number(raw.replace(/"/g, ""));
  else if (raw != null && typeof raw === "object") n = Number(String(raw));
  if (!Number.isFinite(n)) n = 35;
  return Math.max(31, Math.round(n));
}