import { LEGAL, legalLinks } from "@/content/legal";
import { siteOrigin } from "@/lib/shop/config";
import type { ShopOrderTableRow } from "@/lib/supabase/database.types";

function formatShippingAddress(order: ShopOrderTableRow): string {
  const parts = [
    order.shipping_line1,
    order.shipping_line2,
    [order.shipping_postal_code, order.shipping_city].filter(Boolean).join(" "),
    order.shipping_country && order.shipping_country !== "FR" ? order.shipping_country : null,
  ].filter(Boolean);
  return parts.join(", ");
}

export function buildOrderShippedEmail(order: ShopOrderTableRow): { subject: string; html: string; text: string } {
  const origin = siteOrigin().replace(/\/$/, "");
  const trackingUrl = `${origin}/boutique/suivi/${encodeURIComponent(order.tracking_token)}`;
  const addr = formatShippingAddress(order);
  const note = order.admin_note?.trim();
  const trackingNote = note ? `<p style="margin:12px 0 0;font-size:14px;"><strong>Information expédition :</strong> ${note}</p>` : "";

  const html = `<!DOCTYPE html><html lang="fr"><body style="margin:0;background:#f7f4ef;font-family:Arial,sans-serif;color:#2e3b57;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:24px auto;background:#fff;border:1px solid #e8e4df;border-radius:16px;">
<tr><td style="padding:28px 24px;">
<p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#9e3a4a;">${LEGAL.nomCommercial}</p>
<h1 style="margin:16px 0;font-family:Georgia,serif;font-size:24px;">Votre commande est en route</h1>
<p style="font-size:14px;line-height:1.55;">Commande <strong>${order.order_number}</strong> — nous l'avons confiée au transporteur.</p>
<p style="font-size:14px;line-height:1.55;"><strong>Adresse de livraison :</strong><br/>${addr}</p>
${trackingNote}
<p style="margin:20px 0 0;"><a href="${trackingUrl}" style="display:inline-block;padding:12px 20px;background:#2e3b57;color:#f7f4ef;text-decoration:none;border-radius:999px;font-size:13px;">Suivre ma commande</a></p>
<p style="margin:16px 0 0;font-size:12px;color:#5a6270;"><a href="${origin}${legalLinks.cgv}">CGV</a></p>
</td></tr></table></body></html>`;

  const text = `${LEGAL.nomCommercial} — Commande expédiée

Commande ${order.order_number}

Adresse : ${addr}
${note ? `\n${note}\n` : ""}
Suivi : ${trackingUrl}`;

  return { subject: `Commande expédiée — ${order.order_number}`, html, text };
}