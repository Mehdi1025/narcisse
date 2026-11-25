export type FulfillmentType = "pickup" | "shipping";

export type ShopOrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "ready_pickup"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type ShopPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type ShopOrderRow = {
  id: string;
  order_number: string;
  status: ShopOrderStatus;
  payment_status: ShopPaymentStatus;
  fulfillment: FulfillmentType;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_postal_code: string | null;
  shipping_city: string | null;
  shipping_country: string;
  shipping_cost_cents: number;
  subtotal_cents: number;
  total_cents: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  paid_at: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ShopOrderLineRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_slug: string;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
};

export type CheckoutLineInput = { productId: string; quantity: number };

export type CheckoutInput = {
  lines: CheckoutLineInput[];
  fulfillment: FulfillmentType;
  customer: { name: string; email: string; phone?: string };
  shipping?: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country?: string;
  };
};