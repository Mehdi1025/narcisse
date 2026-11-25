import type { ShopOrderStatus } from "@/lib/shop/types";

export const ORDER_STATUS_LABEL: Record<ShopOrderStatus, string> = {
  pending_payment: "En attente de paiement",
  paid: "Payée",
  preparing: "En préparation",
  ready_pickup: "Prête au retrait",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

export const ORDER_STATUS_HINT: Partial<Record<ShopOrderStatus, string>> = {
  pending_payment: "Finalisez le paiement pour confirmer la commande.",
  paid: "Paiement reçu — nous préparons votre commande.",
  preparing: "Votre sélection est en cours de préparation au salon.",
  ready_pickup: "Vous pouvez retirer votre commande au salon — pensez à indiquer votre numéro de commande.",
  shipped: "Votre colis a été expédié.",
  delivered: "Commande livrée.",
  cancelled: "Cette commande a été annulée.",
  refunded: "Cette commande a été remboursée.",
};