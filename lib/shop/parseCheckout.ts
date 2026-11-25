import { z } from "zod";
import { shippingEnabled } from "@/lib/shop/defaults";
import type { CheckoutInput } from "@/lib/shop/types";

const lineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

const customerSchema = z.object({
  name: z.string().trim().min(2, "Nom invalide"),
  email: z.string().trim().toLowerCase().email("E-mail invalide"),
  phone: z.string().trim().optional(),
});

const shippingSchema = z.object({
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  postalCode: z.string().trim().min(1),
  city: z.string().trim().min(1),
  country: z.string().trim().optional(),
});

const checkoutSchema = z
  .object({
    fulfillment: z.enum(["pickup", "shipping"]),
    customer: customerSchema,
    lines: z.array(lineSchema).min(1, "Panier vide"),
    shipping: shippingSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillment === "shipping") {
      if (!shippingEnabled()) {
        ctx.addIssue({ code: "custom", message: "La livraison n'est pas encore disponible", path: ["fulfillment"] });
        return;
      }
      if (!data.shipping) {
        ctx.addIssue({ code: "custom", message: "Adresse de livraison requise", path: ["shipping"] });
      }
    }
  });

export function parseCheckoutBody(body: unknown): CheckoutInput | { error: string } {
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Données invalides";
    return { error: msg };
  }
  const o = parsed.data;

  return {
    lines: o.lines,
    fulfillment: o.fulfillment,
    customer: { name: o.customer.name, email: o.customer.email, phone: o.customer.phone },
    shipping:
      o.fulfillment === "shipping" && o.shipping
        ? {
            line1: o.shipping.line1,
            line2: o.shipping.line2,
            postalCode: o.shipping.postalCode,
            city: o.shipping.city,
            country: o.shipping.country?.toUpperCase() ?? "FR",
          }
        : undefined,
  };
}