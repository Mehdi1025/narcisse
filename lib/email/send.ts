import "server-only";
import { Resend } from "resend";

export type SendResult = { sent: true; id: string } | { sent: false; reason: string };

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
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