/** Hypothèses H-xx modifiables (table shop_settings après migration 013). */

export const SHOP_DEFAULTS = {
  reservationMinutes: 30,
  pickupReminderDays: 14,
  giftCardValidityMonths: 12,
  stockAlertThreshold: 3,
  shippingEnabled: false,
  vatRateDefault: 0.2,
} as const;

export function shippingEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_SHOP_SHIPPING_ENABLED === "1") return true;
  return SHOP_DEFAULTS.shippingEnabled;
}