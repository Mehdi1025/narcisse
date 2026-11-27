export const STOCK_MOVEMENT_LABEL: Record<string, string> = {
  vente_en_ligne: "Vente en ligne",
  vente_comptoir: "Vente au comptoir",
  reception_fournisseur: "Réception fournisseur",
  retour: "Retour",
  casse: "Casse / perte",
  inventaire: "Inventaire",
  reservation: "Réservation",
  liberation: "Libération",
};

export function stockMovementLabel(reason: string): string {
  return STOCK_MOVEMENT_LABEL[reason] ?? reason;
}

export const STOCK_ADJUST_MOTIFS = [
  "reception_fournisseur",
  "retour",
  "casse",
  "vente_comptoir",
  "inventaire",
] as const;