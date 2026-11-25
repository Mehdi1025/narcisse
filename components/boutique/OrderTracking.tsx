import Link from "next/link";
import { formatPrice } from "@/lib/boutique/format";
import { PICKUP_LOCATION } from "@/lib/shop/config";
import { ORDER_STATUS_HINT, ORDER_STATUS_LABEL } from "@/lib/shop/orderLabels";
import type { PublicOrderTracking } from "@/lib/shop/getOrderByTrackingToken";

export default function OrderTracking({ order }: { order: PublicOrderTracking }) {
  const statusLabel = ORDER_STATUS_LABEL[order.status] ?? order.status;
  const hint = ORDER_STATUS_HINT[order.status];

  return (
    <div className="shop min-h-dvh bg-papier text-encre">
      <header className="border-b border-encre/10 px-6 py-5 md:px-12">
        <Link href="/boutique" className="text-[13px] tracking-wide uppercase text-encre/60 hover:text-bordeaux">
          ← Boutique
        </Link>
      </header>
      <div className="mx-auto max-w-lg px-6 py-12 md:px-12">
        <p className="eyebrow text-bordeaux">Suivi de commande</p>
        <h1 className="display mt-3 text-[clamp(32px,5vw,48px)]">{order.order_number}</h1>
        <p className="mt-2 text-[15px] text-encre/65">
          Bonjour <strong>{order.customer_name}</strong>
        </p>

        <div className="mt-8 rounded-[24px] border border-encre/10 bg-ivoire/40 p-6">
          <p className="app-label">Statut</p>
          <p className="mt-2 font-serif text-3xl">{statusLabel}</p>
          {hint && <p className="mt-3 text-[14px] leading-relaxed text-encre/65">{hint}</p>}
          {order.status === "ready_pickup" && (
            <p className="mt-4 text-[13px] text-encre/55">
              {PICKUP_LOCATION.name} — {PICKUP_LOCATION.line1}
              <br />
              {PICKUP_LOCATION.postalCode} {PICKUP_LOCATION.city}
            </p>
          )}
        </div>

        <ul className="mt-8 divide-y divide-encre/10 text-[14px]">
          {order.lines.map((l) => (
            <li key={`${l.product_name}-${l.quantity}`} className="flex justify-between gap-4 py-3">
              <span>
                {l.product_name} × {l.quantity}
              </span>
              <span className="tabular-nums text-encre/70">{formatPrice(l.line_total_cents)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-encre/10 pt-4 font-serif text-2xl">
          <span>Total</span>
          <span>{formatPrice(order.total_cents)}</span>
        </p>

        <p className="mt-8 text-[12px] text-encre/45">
          Conservez cette page pour suivre votre commande. Un e-mail de confirmation vous sera envoyé prochainement.
        </p>
      </div>
    </div>
  );
}