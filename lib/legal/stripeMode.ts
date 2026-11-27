import "server-only";
import { isLegalComplete } from "@/lib/legal/status";

export function isStripeLiveMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  return key.startsWith("sk_live_");
}

export function checkoutBlockedForLive(): boolean {
  return isStripeLiveMode() && !isLegalComplete();
}