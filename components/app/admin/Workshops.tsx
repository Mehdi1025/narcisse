"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkshopRegistrationRow, WorkshopRow, WorkshopStatus } from "@/lib/workshops/types";
import { useToast } from "@/lib/app/store";
import { Button, Card, Empty, Modal, cx } from "../ui";

const STATUS: Record<WorkshopStatus, string> = {
  draft: "Brouillon",
  pending: "À valider",
  published: "En ligne",
  rejected: "Refusé",
  cancelled: "Annulé",
};

export default function AdminWorkshops() {
  const toast = useToast();
  const [list, setList] = useState<WorkshopRow[]>([]);
  const [filter, setFilter] = useState<"pending" | "published" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<WorkshopRow | null>(null);
  const [regs, setRegs] = useState<WorkshopRegistrationRow[]>([]);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workshops", { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      setList(json.workshops ?? []);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = list.filter((w) => {
    if (filter === "all") return true;
    if (filter === "pending") return w.status === "pending" || w.status === "draft";
    return w.status === filter;
  });

  const review = async (w: WorkshopRow, action: "publish" | "reject") => {
    const res = await fetch(`/api/admin/workshops/${w.id}/review`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: note.trim() || null }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast(json.error ?? "Action impossible");
      return;
    }
    toast(action === "publish" ? "Atelier publié sur le site" : "Proposition refusée");
    setDetail(null);
    setNote("");
    await load();
  };

  const openDetail = async (w: WorkshopRow) => {
    setDetail(w);
    setNote(w.admin_note ?? "");
    if (w.status === "published" || w.status === "pending") {
      const res = await fetch(`/api/workshops/${w.id}/registrations`, { credentials: "same-origin" });
      const json = await res.json();
      setRegs(json.registrations ?? []);
    } else setRegs([]);
  };

  const markPresent = async (id: string) => {
    const res = await fetch(`/api/admin/workshops/registrations/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "attended" }),
    });
    if (!res.ok) {
      toast("Mise à jour impossible");
      return;
    }
    if (detail) openDetail(detail);
  };

  const pending = list.filter((w) => w.status === "pending" || w.status === "draft").length;

  return (
    <div className="space-y-6">
      <Card eyebrow="Santé sociale" title="Événements et ateliers">
        <p className="text-[13.5px] text-encre/65">
          Validez les propositions de l&apos;équipe avant publication sur <a href="/ateliers" className="text-bordeaux underline-offset-2 hover:underline">/ateliers</a>. Gérez les inscriptions et la présence le jour J.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["pending", "published", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cx("h-9 rounded-full px-4 text-[13px]", filter === f ? "bg-encre text-ivoire" : "bg-encre/[0.06] hover:bg-encre/10")}
            >
              {f === "pending" ? `À valider${pending ? ` (${pending})` : ""}` : f === "published" ? "En ligne" : "Tous"}
            </button>
          ))}
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <p className="p-6 text-[13px] text-encre/50">Chargement…</p>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <Empty>Aucun atelier dans cette vue.</Empty>
          </div>
        ) : (
          <ul className="divide-y divide-encre/[0.06]">
            {filtered.map((w) => (
              <li key={w.id}>
                <button type="button" onClick={() => openDetail(w)} className="flex w-full flex-wrap items-start justify-between gap-4 p-5 text-left hover:bg-encre/[0.02]">
                  <div>
                    <p className="font-medium">{w.title}</p>
                    <p className="mt-1 text-[12.5px] text-encre/55">
                      Proposé par {w.proposed_by} · {new Date(w.starts_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} · {w.capacity} places
                    </p>
                  </div>
                  <span className="text-[12px] text-encre/50">{STATUS[w.status]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {detail && (
        <Modal open wide title={detail.title} onClose={() => setDetail(null)}>
          <p className="text-[14px] text-encre/70 whitespace-pre-wrap">{detail.description}</p>
          <p className="mt-2 text-[12.5px] text-encre/50">
            {detail.location} · fin {new Date(detail.ends_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
          </p>

          {(detail.status === "pending" || detail.status === "draft") && (
            <div className="mt-6 space-y-3">
              {detail.status === "draft" && (
                <p className="text-[12.5px] text-bordeaux">Brouillon — Lina ne l&apos;a peut‑être pas encore « envoyé » ; vous pouvez quand même publier.</p>
              )}
              <label className="block text-[12px] app-label">Note pour l&apos;équipe (optionnel)</label>
              <textarea className="app-input min-h-20" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Motif du refus ou consignes…" />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => review(detail, "publish")}>Publier sur le site</Button>
                <Button variant="danger" onClick={() => review(detail, "reject")}>Refuser</Button>
              </div>
            </div>
          )}

          {regs.length > 0 && (
            <div>
              <h3 className="mt-8 font-serif text-[20px]">Inscriptions</h3>
              <ul className="mt-3 max-h-[40vh] divide-y divide-encre/10 overflow-auto text-[13px]">
                {regs.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                    <span>
                      {r.full_name} <span className="text-encre/45">({r.email})</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-encre/50">{r.status === "waitlist" ? `#${r.waitlist_position} attente` : r.status}</span>
                      {r.status === "registered" && (
                        <Button size="sm" variant="soft" onClick={() => markPresent(r.id)}>Présent·e</Button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
