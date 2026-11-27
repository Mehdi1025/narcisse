import { LEGAL, legalLinks } from "@/content/legal";
import { legalField } from "@/lib/legal/display";
import { siteOrigin } from "@/lib/shop/config";
import type { ShopOrderTableRow } from "@/lib/supabase/database.types";

export function buildOrderReadyPickupEmail(order: ShopOrderTableRow): { subject: string; html: string; text: string } {
  const origin = siteOrigin().replace(/\/$/, "");
  const trackingUrl = `${origin}/boutique/suivi/${encodeURIComponent(order.tracking_token)}`;

  const html = `<!DOCTYPE html><html lang="fr"><body style="margin:0;background:#f7f4ef;font-family:Arial,sans-serif;color:#2e3b57;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:24px auto;background:#fff;border:1px solid #e8e4df;border-radius:16px;">
<tr><td style="padding:28px 24px;">
<p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#9e3a4a;">${LEGAL.nomCommercial}</p>
<h1 style="margin:16px 0;font-family:Georgia,serif;font-size:24px;">Votre commande est prête au retrait</h1>
<p style="font-size:14px;line-height:1.55;">Commande <strong>${order.order_number}</strong> — vous pouvez venir la récupérer au salon.</p>
<p style="font-size:14px;line-height:1.55;"><strong>Adresse :</strong> ${legalField(LEGAL.lieu.adresseRetrait)}<br/>
<strong>Horaires :</strong> ${legalField(LEGAL.lieu.horairesRetrait)}</p>
<p style="font-size:14px;">Pensez à indiquer votre numéro de commande à l'accueil. Conservation ${LEGAL.conservationRetraitJours} jours après cet e-mail.</p>
<p style="margin:20px 0 0;"><a href="${trackingUrl}" style="display:inline-block;padding:12px 20px;background:#2e3b57;color:#f7f4ef;text-decoration:none;border-radius:999px;font-size:13px;">Voir ma commande</a></p>
<p style="margin:16px 0 0;font-size:12px;color:#5a6270;"><a href="${origin}${legalLinks.cgv}">CGV</a></p>
</td></tr></table></body></html>`;

  const text = `${LEGAL.nomCommercial} — Commande prête au retrait

Commande ${order.order_number}

Adresse : ${legalField(LEGAL.lieu.adresseRetrait)}
Horaires : ${legalField(LEGAL.lieu.horairesRetrait)}

Conservation ${LEGAL.conservationRetraitJours} jours après cet e-mail.
Suivi : ${trackingUrl}`;

  return { subject: `Commande prête au retrait — ${order.order_number}`, html, text };
}