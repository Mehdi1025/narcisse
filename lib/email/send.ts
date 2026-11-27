import "server-only";
import { Resend } from "resend";

export type SendResult = { sent: true; id: string } | { sent: false; reason: string };

/** Retire des guillemets entourants souvent collés par erreur dans Vercel. */
function normalizeFrom(raw: string): string {
  const t = raw.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromRaw = process.env.EMAIL_FROM?.trim();
  const from = fromRaw ? normalizeFrom(fromRaw) : undefined;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY absent — envoi ignoré");
    return { sent: false, reason: "RESEND_API_KEY manquant" };
  }
  if (!from) {
    console.warn("[email] EMAIL_FROM absent — envoi ignoré");
    return { sent: false, reason: "EMAIL_FROM manquant" };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    console.error("[email]", error.message);
    return { sent: false, reason: error.message };
  }
  return { sent: true, id: data?.id ?? "unknown" };
}