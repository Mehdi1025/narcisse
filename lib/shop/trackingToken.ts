import { randomBytes } from "node:crypto";

/** Jeton URL-safe ~43 caractères (32 octets). */
export function newTrackingToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isTrackingToken(value: string): boolean {
  const t = value.trim();
  return t.length >= 22 && t.length <= 64 && /^[A-Za-z0-9_-]+$/.test(t);
}