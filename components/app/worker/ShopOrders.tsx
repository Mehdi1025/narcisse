"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FulfillmentType, ShopOrderStatus } from "@/lib/shop/types";
import { ORDER_STATUS_LABEL } from "@/lib/shop/orderLabels";
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
  customer_phone: string;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_postal_code: string | null;
  shipping_city: string | null;
  total_cents: number;
  created_at: string;
  shop_order_lines: OrderLine[];
};

type ViewId = "pickup" | "shipping";
type PickupTabId = "prepare" | "ready";
type ShipTabId = "prepare" | "shipped";

function formatAddr(o: Order): string {
  return [o.shipping_line1, o.shipping_line2, [o.shipping_postal_code, o.shipping_city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

const REFRESH_MS = 20_000;

export default function WorkerShopOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [view, setView] = useState<ViewId>("pickup");
  const [pickupTab, setPickupTab] = useState<PickupTabId>("prepare");
  const [shipTab, setShipTab] = useState<ShipTabId>("prepare");
  const [detail, setDetail] = useState<Order | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [shippingNote, setShippingNote] = useState("");
  const [pickupNumber, setPickupNumber] = useState("");
  const [pickupName, setPickupName] = useState("");
  const [pickupBusy, setPickupBusy] = useState(false);

  const load = useCallback(async () => {
    setForbidden(false);
    try {
      const res = await fetch("/api/employee/shop/orders", { credentials: "same-origin" });
      const json = await res.json();
      if (res.status === 403) {
        setForbidden(true);
        setOrders([]);
        return;
      }
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
    const id = window.setInterval(() => load(), REFRESH_MS);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const pickupOrders = useMemo(() => orders.filter((o) => o.fulfillment === "pickup"), [orders]);
  const shippingOrders = useMemo(() => orders.filter((o) => o.fulfillment === "shipping"), [orders]);

  const pickupFiltered = useMemo(() => {
    if (pickupTab === "ready") return pickupOrders.filter((o) => o.status === "ready_pickup");
    return pickupOrders.filter((o) => o.status === "paid" || o.status === "preparing");
  }, [pickupOrders, pickupTab]);

  const shipFiltered = useMemo(() => {
    if (shipTab === "shipped") return shippingOrders.filter((o) => o.status === "shipped");
    return shippingOrders.filter((o) => o.status === "paid" || o.status === "preparing");
  }, [shippingOrders, shipTab]);

  const patch = async (order: Order, status: ShopOrderStatus, opts?: { name?: string; adminNote?: string }) => {
    const res = await fetch(`/api/employee/shop/orders/${order.id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        confirmName: opts?.name,
        adminNote: opts?.adminNote,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast(json.error ?? "Mise à jour impossible");
      return false;
    }
    toast(
      status === "delivered"
        ? order.fulfillment === "pickup"
          ? "Retrait validé"
          : "Commande marquée livrée"
        : status === "shipped"
          ? "Commande marquée expédiée"
          : "Commande mise à jour",
    );
    if (detail?.id === order.id) setDetail(json.order as Order);
    await load();
    return true;
  };

  const submitPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderNumber = pickupNumber.trim();
    const confirmName = pickupName.trim();
    if (!orderNumber || !confirmName) {
      toast("Indiquez le numéro de commande et le nom de la cliente");
      return;
    }
    setPickupBusy(true);
    try {
      const res = await fetch("/api/employee/shop/pickup", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, confirmName }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Retrait impossible");
        return;
      }
      toast(`Retrait validé — ${json.order?.order_number ?? orderNumber}`);
      setPickupNumber("");
      setPickupName("");
      setDetail(null);
      await load();
    } finally {
      setPickupBusy(false);
    }
  };

  const openDetail = (o: Order) => {
    setDetail(o);
    setConfirmName("");
    setShippingNote("");
  };

  if (forbidden) {
    return (
      <div className="max-w-3xl">
        <Empty>Cette vue est réservée aux travailleuses avec la compétence « Boutique ».</Empty>
      </div>
    );
  }

  const list = view === "pickup" ? pickupFiltered : shipFiltered;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="inline-flex rounded-full bg-encre/[0.06] p-1">
        {(
          [
            ["pickup", `Retrait (${pickupOrders.length})`],
            ["shipping", `Livraison (${shippingOrders.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={cx("h-9 rounded-full px-4 text-[13px] transition-colors sm:px-5", view === id ? "bg-encre text-ivoire" : "text-encre/65")}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "pickup" && (
        <Card title="Valider un retrait" eyebrow="Comptoir">
          <p className="mb-4 text-[13px] text-encre/60">Demandez le numéro de commande et le nom indiqué lors du paiement.</p>
          <form onSubmit={submitPickup} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-[12px] text-encre/55">
              N° commande
              <input
                value={pickupNumber}
                onChange={(e) => setPickupNumber(e.target.value)}
                placeholder="NAR-…"
                className="h-11 rounded-xl border border-encre/10 bg-papier px-3 text-[14px] text-encre"
                autoComplete="off"
              />
            </label>
            <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-[12px] text-encre/55">
              Nom de la cliente
              <input
                value={pickupName}
                onChange={(e) => setPickupName(e.target.value)}
                placeholder="Comme sur la commande"
                className="h-11 rounded-xl border border-encre/10 bg-papier px-3 text-[14px] text-encre"
                autoComplete="name"
              />
            </label>
            <Button type="submit" disabled={pickupBusy} className="w-full sm:w-auto">
              Confirmer le retrait
            </Button>
          </form>
        </Card>
      )}

      {view === "pickup" ? (
        <div className="inline-flex rounded-full bg-encre/[0.06] p-1">
          {(
            [
              ["prepare", `À préparer (${pickupOrders.filter((o) => o.status === "paid" || o.status === "preparing").length})`],
              ["ready", `Prêtes au retrait (${pickupOrders.filter((o) => o.status === "ready_pickup").length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPickupTab(id)}
              className={cx("h-9 rounded-full px-4 text-[13px] transition-colors sm:px-5", pickupTab === id ? "bg-encre text-ivoire" : "text-encre/65")}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <div className="inline-flex rounded-full bg-encre/[0.06] p-1">
          {(
            [
              ["prepare", `À expédier (${shippingOrders.filter((o) => o.status === "paid" || o.status === "preparing").length})`],
              ["shipped", `Expédiées (${shippingOrders.filter((o) => o.status === "shipped").length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setShipTab(id)}
              className={cx("h-9 rounded-full px-4 text-[13px] transition-colors sm:px-5", shipTab === id ? "bg-encre text-ivoire" : "text-encre/65")}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-encre/45">Liste synchronisée toutes les 20 s (même vue pour toute l&apos;équipe boutique).</p>

      <Card className="!p-0 overflow-hidden">
        {loading && orders.length === 0 ? (
          <p className="p-6 text-[13px] text-encre/50">Chargement des commandes…</p>
        ) : list.length === 0 ? (
          <div className="p-6">
            <Empty>
              {view === "pickup"
                ? pickupTab === "ready"
                  ? "Aucune commande en attente de retrait."
                  : "Rien à préparer pour le moment."
                : shipTab === "shipped"
                  ? "Aucune commande en attente de clôture."
                  : "Rien à expédier pour le moment."}
            </Empty>
          </div>
        ) : (
          <ul className="divide-y divide-encre/[0.06]">
            {list.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => openDetail(o)}
                  className="flex w-full flex-wrap items-center justify-between gap-4 p-5 text-left hover:bg-encre/[0.02]"
                >
                  <div>
                    <p className="font-medium">{o.order_number}</p>
                    <p className="mt-1 text-[12.5px] text-encre/55">
                      {o.customer_name} · {formatPrice(o.total_cents)} · {(o.shop_order_lines?.length ?? 0)} article
                      {(o.shop_order_lines?.length ?? 0) > 1 ? "s" : ""}
                      {view === "shipping" && o.shipping_city ? ` · ${o.shipping_city}` : ""}
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
            {detail.customer_name}
            {detail.customer_phone ? ` · ${detail.customer_phone}` : ""}
          </p>
          <p className="mt-2 text-[13px] text-encre/55">
            {detail.fulfillment === "shipping" ? (
              <>
                Livraison — {ORDER_STATUS_LABEL[detail.status]}
                <br />
                <span className="text-encre/70">{formatAddr(detail)}</span>
              </>
            ) : (
              <>Retrait sur place — {ORDER_STATUS_LABEL[detail.status]}</>
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
          <div className="mt-6 flex flex-col gap-3">
            {detail.fulfillment === "pickup" && (detail.status === "paid" || detail.status === "preparing") && (
              <Button onClick={() => patch(detail, "ready_pickup")}>Marquer prête au retrait</Button>
            )}
            {detail.fulfillment === "pickup" && detail.status === "ready_pickup" && (
              <>
                <label className="flex flex-col gap-1 text-[12px] text-encre/55">
                  Confirmer le nom de la cliente
                  <input
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder={detail.customer_name}
                    className="h-11 rounded-xl border border-encre/10 bg-papier px-3 text-[14px] text-encre"
                    autoComplete="name"
                  />
                </label>
                <Button
                  onClick={async () => {
                    const ok = await patch(detail, "delivered", { name: confirmName.trim() });
                    if (ok) setDetail(null);
                  }}
                >
                  Valider le retrait
                </Button>
              </>
            )}
            {detail.fulfillment === "shipping" && (detail.status === "paid" || detail.status === "preparing") && (
              <>
                <label className="flex flex-col gap-1 text-[12px] text-encre/55">
                  Note expédition (optionnel — transporteur, n° de suivi)
                  <input
                    value={shippingNote}
                    onChange={(e) => setShippingNote(e.target.value)}
                    placeholder="Ex. Colissimo — 8X…"
                    className="h-11 rounded-xl border border-encre/10 bg-papier px-3 text-[14px] text-encre"
                  />
                </label>
                <Button
                  onClick={() =>
                    patch(detail, "shipped", { adminNote: shippingNote.trim() || undefined })
                  }
                >
                  Marquer expédiée
                </Button>
              </>
            )}
            {detail.fulfillment === "shipping" && detail.status === "shipped" && (
              <Button
                onClick={async () => {
                  const ok = await patch(detail, "delivered");
                  if (ok) setDetail(null);
                }}
              >
                Marquer livrée
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}