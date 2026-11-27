import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { sendOrderConfirmationEmail } from "@/lib/email/sendOrderConfirmation";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  const result = await sendOrderConfirmationEmail(id, { force: true });
  if (!result.sent) {
    return NextResponse.json(
      { error: "E-mail non envoyé (vérifier RESEND_API_KEY, EMAIL_FROM, ou statut de paiement)." },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}