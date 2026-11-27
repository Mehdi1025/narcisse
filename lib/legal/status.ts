import { LEGAL } from "@/content/legal";

/** Champs indispensables avant ouverture vente en mode live (Stripe). */
export function missingLegalFields(): string[] {
  const missing: string[] = [];
  const e = LEGAL.exploitant;
  const l = LEGAL.lieu;
  const m = LEGAL.mediateur;

  if (!e.raisonSociale) missing.push("Raison sociale");
  if (!e.formeJuridique) missing.push("Forme juridique");
  if (!e.siege) missing.push("Siège social");
  if (!e.siren) missing.push("SIREN");
  if (!e.email) missing.push("E-mail de contact");
  if (!e.telephone) missing.push("Téléphone");
  if (!e.directeurPublication) missing.push("Directeur de publication");
  if (!l.adresseRetrait) missing.push("Adresse de retrait");
  if (!l.horairesRetrait) missing.push("Horaires de retrait");
  if (!m.nom) missing.push("Médiateur de la consommation");
  if (!e.regimeTva) missing.push("Régime de TVA");

  return missing;
}

export function isLegalComplete(): boolean {
  return missingLegalFields().length === 0;
}