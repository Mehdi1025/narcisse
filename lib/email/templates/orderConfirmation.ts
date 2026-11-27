import { LEGAL, legalLinks } from "@/content/legal";
import { RETRACTATION_FORMULAIRE_MODELE } from "@/content/legalOfficial";
import { legalField, legalSiteUrl, tvaPriceMention, vendeurAttentionLine } from "@/lib/legal/display";
import type { ShopOrderLineTableRow, ShopOrderTableRow } from "@/lib/supabase/database.types";
import { siteOrigin } from "@/lib/shop/config";

function euro(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function buildOrderConfirmationEmail(
  order: ShopOrderTableRow,
  lines: ShopOrderLineTableRow[],
): { subject: string; html: string; text: string } {
  const origin = siteOrigin().replace(/\/$/, "");
  const trackingUrl = `${origin}/boutique/suivi/${encodeURIComponent(order.tracking_token)}`;
  const cgvUrl = `${origin}${legalLinks.cgv}`;
  const retraction = RETRACTATION_FORMULAIRE_MODELE.replace(
    "[le professionnel insère ici son nom, son adresse géographique et son adresse électronique]",
    vendeurAttentionLine(),
  );
  const date = new Date(order.created_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

  const lineRows = lines
    .map(
      (l) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e8e4df;">${l.product_name} × ${l.quantity}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #e8e4df;">${euro(l.line_total_cents)}</td></tr>`,
    )
    .join("");

  const linesText = lines.map((l) => `- ${l.product_name} × ${l.quantity} : ${euro(l.line_total_cents)}`).join("\n");

  const isShipping = order.fulfillment === "shipping";
  const shipAddr = [order.shipping_line1, order.shipping_line2, [order.shipping_postal_code, order.shipping_city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join("<br/>");

  const fulfillmentHtml = isShipping
    ? `<h2 style="margin:24px 0 8px;font-family:Georgia,serif;font-size:18px;">Livraison</h2>
<p style="margin:0;font-size:14px;line-height:1.55;">Forfait livraison : ${euro(order.shipping_cost_cents)}<br/>
Adresse : ${shipAddr}<br/>
Préparation : ${legalField(LEGAL.lieu.delaiPreparation)} — vous recevrez un e-mail lorsque le colis sera expédié.</p>`
    : `<h2 style="margin:24px 0 8px;font-family:Georgia,serif;font-size:18px;">Retrait sur place</h2>
<p style="margin:0;font-size:14px;line-height:1.55;">Adresse : ${legalField(LEGAL.lieu.adresseRetrait)}<br/>
Horaires : ${legalField(LEGAL.lieu.horairesRetrait)}<br/>
Préparation : ${legalField(LEGAL.lieu.delaiPreparation)}<br/>
Conservation : ${LEGAL.conservationRetraitJours} jours après l'e-mail « commande prête ».</p>`;

  const fulfillmentText = isShipping
    ? `Livraison — forfait ${euro(order.shipping_cost_cents)}
Adresse : ${[order.shipping_line1, order.shipping_line2, [order.shipping_postal_code, order.shipping_city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
Préparation : ${legalField(LEGAL.lieu.delaiPreparation)} — e-mail à l'expédition.`
    : `Retrait : ${legalField(LEGAL.lieu.adresseRetrait)}
Horaires : ${legalField(LEGAL.lieu.horairesRetrait)}
Préparation : ${legalField(LEGAL.lieu.delaiPreparation)}
Conservation : ${LEGAL.conservationRetraitJours} jours après e-mail « commande prête ».`;

  const html = `<!DOCTYPE html><html lang="fr"><body style="margin:0;background:#f7f4ef;font-family:Jost,Arial,sans-serif;color:#2e3b57;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:24px auto;background:#fff;border:1px solid #e8e4df;border-radius:16px;">
<tr><td style="padding:28px 24px;">
<p style="margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#9e3a4a;">${LEGAL.nomCommercial}</p>
<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:500;">Merci, votre commande est confirmée</h1>
<p style="margin:0 0 20px;font-size:14px;line-height:1.55;">Commande <strong>${order.order_number}</strong> du ${date}.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">${lineRows}</table>
<p style="margin:16px 0 0;font-size:16px;font-family:Georgia,serif;"><strong>Total TTC : ${euro(order.total_cents)}</strong></p>
<p style="margin:8px 0 0;font-size:12px;color:#5a6270;">${tvaPriceMention()}</p>
${fulfillmentHtml}
<p style="margin:16px 0 0;"><a href="${trackingUrl}" style="display:inline-block;padding:12px 20px;background:#2e3b57;color:#f7f4ef;text-decoration:none;border-radius:999px;font-size:13px;">Suivre ma commande</a></p>
<h2 style="margin:24px 0 8px;font-family:Georgia,serif;font-size:18px;">Vendeur</h2>
<p style="margin:0;font-size:14px;line-height:1.55;">${legalField(LEGAL.exploitant.raisonSociale)} — ${legalField(LEGAL.exploitant.email)} — ${legalField(LEGAL.exploitant.telephone)}</p>
<p style="margin:16px 0 0;font-size:13px;">Vous avez accepté nos CGV (version du ${order.cgv_version ?? LEGAL.version}) : <a href="${cgvUrl}">${cgvUrl}</a></p>
<p style="margin:12px 0 0;font-size:13px;">Droit de rétractation 14 jours, sauf exceptions (produits d'hygiène descellés, etc.).</p>
<h2 style="margin:24px 0 8px;font-family:Georgia,serif;font-size:18px;">Formulaire de rétractation</h2>
<pre style="white-space:pre-wrap;font-size:12px;line-height:1.5;background:#f7f4ef;padding:12px;border-radius:8px;">${retraction}</pre>
</td></tr></table></body></html>`;

  const text = `${LEGAL.nomCommercial} — Merci, votre commande est confirmée

Commande ${order.order_number} — ${date}

${linesText}

Total TTC : ${euro(order.total_cents)}
${tvaPriceMention()}

${fulfillmentText}

Suivi : ${trackingUrl}

Vendeur : ${legalField(LEGAL.exploitant.raisonSociale)} — ${legalField(LEGAL.exploitant.email)}

CGV (version ${order.cgv_version ?? LEGAL.version}) : ${cgvUrl}

${retraction}
`;

  return {
    subject: `Confirmation de commande ${order.order_number} — ${LEGAL.nomCommercial}`,
    html,
    text,
  };
}

export function orderConfirmationFromAddress(): string {
  return legalSiteUrl();
}