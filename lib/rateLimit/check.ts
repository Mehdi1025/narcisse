import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/** Retourne null si OK, sinon message d'erreur (trop de requêtes). */
export async function enforceRateLimit(
  bucket: string,
  maxPerMinute: number,
  request: Request,
): Promise<string | null> {
  const ip = clientIp(request);
  const key = `${bucket}:${ip}`;
  const db = createAdminClient();
  const { data, error } = await db.rpc("check_rate_limit", {
    p_bucket: key,
    p_max_hits: maxPerMinute,
    p_window_seconds: 60,
  });
  if (error) {
    console.error("[rate-limit]", error.message);
    return null;
  }
  if (data === false) return "Trop de tentatives — réessayez dans une minute.";
  return null;
}