"use client";

import { useEffect, useState } from "react";
import type { ProductRow } from "@/lib/boutique/types";
import { STOCK_ADJUST_MOTIFS, stockMovementLabel } from "@/lib/shop/stockLabels";
import { useToast } from "@/lib/app/store";
import { Button, Drawer, Field, Modal, cx } from "../ui";

type Tab = "ajout" | "retrait" | "inventaire";

const MOTIF_LABEL: Record<string, string> = {
  reception_fournisseur: "Réception fournisseur",
  retour: "Retour",
  casse: "Casse / perte",
  vente_comptoir: "Vente au comptoir",
  inventaire: "Inventaire",
};

export function ProductStockAdjust({
  product,
  open,
  onClose,
  onUpdated,
}: {
  product: ProductRow;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("ajout");
  const [quantite, setQuantite] = useState("1");
  const [cible, setCible] = useState(String(product.stock_on_hand ?? 0));
  const [motif, setMotif] = useState<string>(STOCK_ADJUST_MOTIFS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const onHand = product.stock_on_hand ?? 0;
  const reserved = product.stock_reserved ?? 0;
  const available = Math.max(0, onHand - reserved);

  const preview =
    tab === "inventaire"
      ? Math.max(0, Math.round(Number(cible) || 0))
      : tab === "ajout"
        ? available + Math.max(0, Math.round(Number(quantite) || 0))
        : Math.max(0, available - Math.max(0, Math.round(Number(quantite) || 0)));

  const submit = async () => {
    setBusy(true);
    try {
      let body: Record<string, unknown>;
      if (tab === "inventaire") {
        if (!note.trim()) {
          toast("Indiquez une note pour l'inventaire");
          return;
        }
        body = { mode: "inventaire", cible: Math.round(Number(cible) || 0), note: note.trim() };
      } else {
        body = {
          mode: tab,
          quantite: Math.round(Number(quantite) || 0),
          motif,
          note: note.trim() || undefined,
        };
        if ((body.quantite as number) <= 0) {
          toast("Quantité invalide");
          return;
        }
        if (motif === "casse" && !note.trim()) {
          toast("Note requise pour casse / perte");
          return;
        }
      }
      const res = await fetch(`/api/admin/products/${product.id}/stock`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Échec");
      toast("Stock mis à jour");
      onUpdated();
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open title={`Stock — ${product.name}`} onClose={onClose} wide>
      <p className="mb-4 text-[13px] text-encre/60">
        Physique {onHand} · Réservé {reserved} · <strong>Disponible {available}</strong>
      </p>
      <div className="mb-4 inline-flex rounded-full bg-encre/[0.06] p-1">
        {(["ajout", "retrait", "inventaire"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cx("h-9 rounded-full px-4 text-[13px] capitalize", tab === t ? "bg-encre text-ivoire" : "text-encre/65")}
          >
            {t === "ajout" ? "Ajouter" : t === "retrait" ? "Retirer" : "Inventaire"}
          </button>
        ))}
      </div>
      {tab !== "inventaire" && (
        <>
          <Field label="Quantité">
            <input className="app-input" type="number" min={1} value={quantite} onChange={(e) => setQuantite(e.target.value)} />
          </Field>
          <Field label="Motif">
            <select className="app-input" value={motif} onChange={(e) => setMotif(e.target.value)}>
              {STOCK_ADJUST_MOTIFS.map((m) => (
                <option key={m} value={m}>
                  {MOTIF_LABEL[m] ?? stockMovementLabel(m)}
                </option>
              ))}
            </select>
          </Field>
        </>
      )}
      {tab === "inventaire" && (
        <Field label="Stock physique cible">
          <input className="app-input" type="number" min={0} value={cible} onChange={(e) => setCible(e.target.value)} />
        </Field>
      )}
      <Field label="Note" hint={tab === "inventaire" || motif === "casse" ? "Obligatoire" : "Optionnel"}>
        <input className="app-input" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <p className="text-[13px] text-encre/55">Disponible après : {preview}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={submit} disabled={busy}>
          {busy ? "…" : "Valider"}
        </Button>
      </div>
    </Modal>
  );
}

export function ProductStockHistory({
  productId,
  open,
  onClose,
}: {
  productId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<
    { id: string; delta: number; reason_label: string; order_number: string | null; note: string | null; author: string | null; created_at: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/admin/products/${productId}/movements`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((j) => setRows(j.movements ?? []))
      .finally(() => setLoading(false));
  }, [open, productId]);

  return (
    <Drawer open={open} onClose={onClose} title="Historique stock">
      {loading ? (
        <p className="text-[13px] text-encre/50">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="text-[13px] text-encre/50">Aucun mouvement.</p>
      ) : (
        <ul className="divide-y divide-encre/10 text-[13px]">
          {rows.map((m) => (
            <li key={m.id} className="py-3">
              <p className="font-medium">
                {m.delta === 0 ? "—" : m.delta > 0 ? `+${m.delta}` : m.delta} · {m.reason_label}
              </p>
              <p className="mt-0.5 text-encre/55">
                {new Date(m.created_at).toLocaleString("fr-FR")}
                {m.order_number ? ` · ${m.order_number}` : ""}
                {m.author ? ` · ${m.author}` : ""}
              </p>
              {m.note && <p className="mt-1 text-encre/50">{m.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}