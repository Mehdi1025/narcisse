"use client";

import { useCallback, useEffect, useState } from "react";
import type { FulfillmentType, ShopOrderStatus } from "@/lib/shop/types";
import { ORDER_STATUS_LABEL } from "@/lib/shop/orderLabels";
import { siteOrigin } from "@/lib/shop/config";
import { formatPrice } from "@/lib/boutique/format";
import { useToast } from "@/lib/app/store";
import { Button, Card, Empty, Modal, cx } from "../ui";

type OrderLine = {
  id: string;
  product_name: string;
  quantity: number;
  line_total_cents: number;
};

type Order = {
  id: string;
  order_number: string;
  status: ShopOrderStatus;
  payment_status: string;
  fulfillment: FulfillmentType;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_line1: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  total_cents: number;
  created_at: string;
  tracking_token?: string;
  stock_issue?: boolean;
  admin_note?: string | null;
  shop_order_lines: OrderLine[];
};

export default function ShopOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);
  const [stockOnly, setStockOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      setOrders(json.orders ?? []);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (order: Order, status: ShopOrderStatus) => {
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast(json.error ?? "Mise à jour impossible");
      return;
    }
    toast("Commande mise à jour");
    setDetail(json.order as Order);
    await load();
  };

  const actionFor = (o: Order) => {
    if (o.status === "preparing" && o.fulfillment === "shipping") {
      return { status: "shipped" as const, label: "Marquer expédiée" };
    }
    if (o.status === "preparing" && o.fulfillment === "pickup") {
      return { status: "ready_pickup" as const, label: "Prête au retrait" };
    }
    if (o.status === "ready_pickup") return { status: "delivered" as const, label: "Retirée / remise" };
    if (o.status === "shipped") return { status: "delivered" as const, label: "Marquer livrée" };
    if (o.status === "paid") return { status: "preparing" as const, label: "Préparer la commande" };
    return null;
  };

  const shown = stockOnly ? orders.filter((o) => o.stock_issue) : orders;

  return (
  <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStockOnly(false)}
          className={cx("h-9 rounded-full px-4 text-[13px]", !stockOnly ? "bg-encre text-ivoire" : "bg-encre/[0.06]")}
        >
          Toutes
        </button>
        <button
          type="button"
          onClick={() => setStockOnly(true)}
          className={cx("h-9 rounded-full px-4 text-[13px]", stockOnly ? "bg-bordeaux text-papier" : "bg-encre/[0.06]")}
        >
          Stock à vérifier ({orders.filter((o) => o.stock_issue).length})
        </button>
      </div>
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <p className="p-6 text-[13px] text-encre/50">Chargement des commandes…</p>
        ) : shown.length === 0 ? (
          <div className="p-6">
            <Empty>Aucune commande pour le moment.</Empty>
          </div>
        ) : (
          <ul className="divide-y divide-encre/[0.06]">
            {shown.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => setDetail(o)} className="flex w-full flex-wrap items-center justify-between gap-4 p-5 text-left hover:bg-encre/[0.02]">
                  <div>
                    <p className="font-medium">
                      {o.order_number}
                      {o.stock_issue && (
                        <span className="ml-2 rounded-full bg-bordeaux/15 px-2 py-0.5 text-[10px] font-medium text-bordeaux">
                          Stock à vérifier
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-[12.5px] text-encre/55">
                      {o.customer_name} · {o.fulfillment === "shipping" ? "Livraison" : "Retrait"} · {formatPrice(o.total_cents)}
                    </p>
                  </div>
                  <span className="text-[12px] text-encre/50">{ORDER_STATUS_LABEL[o.status] ?? o.status}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {detail && (
        <Modal open wide title={detail.order_number} onClose={() => setDetail(null)}>
          <p className="text-[14px] text-encre/70">
            {detail.customer_name} — <a href={`mailto:${detail.customer_email}`} className="text-bordeaux">{detail.customer_email}</a>
            {detail.customer_phone && ` · ${detail.customer_phone}`}
          </p>
          <p className="mt-2 text-[13px] text-encre/55">
            {detail.fulfillment === "shipping" ? (
              <>
                Livraison : {detail.shipping_line1}, {detail.shipping_postal_code} {detail.shipping_city}
              </>
            ) : (
              <>Retrait sur place</>
            )}
          </p>
          <ul className="mt-6 divide-y divide-encre/10 text-[13px]">
            {detail.shop_order_lines?.map((l) => (
              <li key={l.id} className="flex justify-between py-2">
                <span>
                  {l.product_name} × {l.quantity}
                </span>
                <span>{formatPrice(l.line_total_cents)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-serif text-xl">{formatPrice(detail.total_cents)}</p>
          <p className="mt-2 text-[12px] text-encre/50">{ORDER_STATUS_LABEL[detail.status]}</p>
          {detail.tracking_token && (
            <p className="mt-3 text-[12px] text-encre/55 break-all">
              Suivi cliente :{" "}
              <a
                href={`${siteOrigin().replace(/\/$/, "")}/boutique/suivi/${encodeURIComponent(detail.tracking_token)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bordeaux underline-offset-2 hover:underline"
              >
                ouvrir le lien
              </a>
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {actionFor(detail) && (
              <Button onClick={() => setStatus(detail, actionFor(detail)!.status)}>{actionFor(detail)!.label}</Button>
            )}
            {detail.status !== "cancelled" && detail.payment_status === "paid" && (
              <Button variant="danger" onClick={() => setStatus(detail, "cancelled")}>
                Annuler
              </Button>
            )}
          </div>
        </Modal>
      )}
  </>
  );
}