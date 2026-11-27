import { completer, legalSiteUrl } from "@/lib/legal/completer";
import { legalOperator, shopLegalFacts } from "@/content/legal";

/** Remplace les jetons {{…}} dans les textes légaux. */
export function interpolateLegalTemplate(text: string): string {
  const o = legalOperator;
  const u = shopLegalFacts;
  const map: Record<string, string> = {
    brandName: o.brandName,
    siteUrl: legalSiteUrl(),
    legalName: completer(o.legalName),
    legalForm: completer(o.legalForm),
    shareCapital: completer(o.shareCapital),
    siret: completer(o.siret),
    rcs: completer(o.rcs),
    vatNumber: completer(o.vatNumber),
    registeredAddress: completer(o.registeredAddress),
    directorName: completer(o.directorName),
    contactEmail: completer(o.contactEmail),
    contactPhone: completer(o.contactPhone),
    mediatorName: completer(o.mediatorName),
    mediatorUrl: completer(o.mediatorUrl),
    dpoEmail: completer(o.dpoEmail),
    hostingName: completer(o.hostingName),
    hostingAddress: completer(o.hostingAddress),
    hostingContact: completer(o.hostingContact),
    productNature: u.productNature.toLowerCase(),
    universes: u.universes.join(", "),
    pickupRetentionDays: String(u.pickupRetentionDays),
    withdrawalDays: String(u.withdrawalDays),
  };

  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => map[key] ?? `{{${key}}}`);
}