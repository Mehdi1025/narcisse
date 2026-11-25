"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkerId } from "@/lib/app/types";
import type { WorkshopRegistrationRow, WorkshopRow, WorkshopStatus } from "@/lib/workshops/types";
import { useToast } from "@/lib/app/store";
import { Button, Card, Empty, Field, Modal, cx } from "../ui";

const STATUS: Record<WorkshopStatus, string> = {
  draft: "Brouillon",
  pending: "En attente admin",
  published: "Publié",
  rejected: "À revoir",
  cancelled: "Annulé",
};

type Form = { title: string; description: string; starts_at: string; ends_at: string; capacity: string; location: string };

const emptyForm = (): Form => ({
  title: "",
  description: "",
  starts_at: "",
  ends_at: "",
  capacity: "12",
  location: "Narcisse",
});

export default function Workshops({ me }: { me: WorkerId }) {
  const toast = useToast();
  const [list, setList] = useState<WorkshopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<WorkshopRow | null>(null);
  const [regsFor, setRegsFor] = useState<WorkshopRow | null>(null);
  const [form, setForm] = useState<Form>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [regs, setRegs] = useState<WorkshopRegistrationRow[] | null>(null);

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

  const openCreate = () => {
    setForm(emptyForm());
    setCreating(true);
    setEditing(null);
    setRegsFor(null);
    setRegs(null);
  };

  const openEdit = (w: WorkshopRow) => {
    setRegs(null);
    setRegsFor(null);
    setForm({
      title: w.title,
      description: w.description,
      starts_at: w.starts_at.slice(0, 16),
      ends_at: w.ends_at.slice(0, 16),
      capacity: String(w.capacity),
      location: w.location,
    });
    setEditing(w);
    setCreating(false);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast("Titre requis");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        capacity: Number(form.capacity),
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
      };
      const isEdit = Boolean(editing);
      const res = await fetch(isEdit ? `/api/workshops/${editing!.id}` : "/api/workshops", {
        method: isEdit ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Enregistrement impossible");
      toast(isEdit ? "Atelier mis à jour" : "Brouillon créé");
      setCreating(false);
      setEditing(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const submit = async (w: WorkshopRow) => {
    const res = await fetch(`/api/workshops/${w.id}/submit`, { method: "POST", credentials: "same-origin" });
    const json = await res.json();
    if (!res.ok) {
      toast(json.error ?? "Envoi impossible");
      return;
    }
    toast("Envoyé à l'administration pour validation");
    await load();
  };

  const loadRegs = async (w: WorkshopRow) => {
    const res = await fetch(`/api/workshops/${w.id}/registrations`, { credentials: "same-origin" });
    const json = await res.json();
    if (!res.ok) {
      toast(json.error ?? "Liste impossible");
      return;
    }
    setRegs(json.registrations ?? []);
    setRegsFor(w);
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <Card eyebrow="Santé sociale" title={`Proposer un atelier — ${me === "lina" ? "Lina" : "Travailleuse 2"}`}>
        <p className="text-[13.5px] text-encre/65">
          Créez un atelier (places, date, lieu). Une fois envoyé, l&apos;administratrice valide sa publication sur le site. Les inscriptions et la liste d&apos;attente s&apos;ouvrent ensuite au public.
        </p>
        <Button className="mt-4" onClick={openCreate}>
          Nouvel atelier
        </Button>
      </Card>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <p className="p-6 text-[13px] text-encre/50">Chargement…</p>
        ) : list.length === 0 ? (
          <div className="p-6">
            <Empty>Aucun atelier pour le moment.</Empty>
          </div>
        ) : (
          <ul className="divide-y divide-encre/[0.06]">
            {list.map((w) => (
              <li key={w.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="font-medium">{w.title}</p>
                  <p className="mt-1 text-[12.5px] text-encre/55">
                    {new Date(w.starts_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} · {w.capacity} places · {w.location}
                  </p>
                  <p className="mt-2 text-[12px]">
                    <span className={cx("rounded-full px-2 py-0.5", w.status === "published" ? "bg-sauge/20 text-sauge-fonce" : w.status === "pending" ? "bg-rose/30 text-encre" : "bg-encre/5 text-encre/60")}>
                      {STATUS[w.status]}
                    </span>
                    {w.admin_note && w.status === "rejected" && <span className="ml-2 text-encre/55">{w.admin_note}</span>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["draft", "rejected"].includes(w.status) && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(w)}>Modifier</Button>
                      <Button size="sm" onClick={() => submit(w)}>Envoyer à l&apos;admin</Button>
                    </>
                  )}
                  {w.status === "published" && (
                    <Button size="sm" variant="soft" onClick={() => loadRegs(w)}>Inscriptions</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {(creating || editing) && (
        <Modal open title={creating ? "Nouvel atelier" : "Modifier l'atelier"} onClose={() => !saving && (setCreating(false), setEditing(null))}>
          <div className="grid gap-4">
            <Field label="Titre"><input className="app-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
            <Field label="Description"><textarea className="app-input min-h-24" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Début"><input type="datetime-local" className="app-input" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} /></Field>
              <Field label="Fin"><input type="datetime-local" className="app-input" value={form.ends_at} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre de places"><input type="number" min={1} className="app-input" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} /></Field>
              <Field label="Lieu"><input className="app-input" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setCreating(false); setEditing(null); }} disabled={saving}>Annuler</Button>
              <Button onClick={save} disabled={saving}>{saving ? "…" : "Enregistrer"}</Button>
            </div>
          </div>
        </Modal>
      )}

      {regsFor && regs && (
        <Modal open wide title={`Inscriptions — ${regsFor.title}`} onClose={() => { setRegs(null); setRegsFor(null); }}>
          <RegList rows={regs} capacity={regsFor.capacity} />
        </Modal>
      )}
    </div>
  );
}

function RegList({ rows, capacity }: { rows: WorkshopRegistrationRow[]; capacity: number }) {
  const confirmed = rows.filter((r) => r.status === "registered" || r.status === "attended").length;
  const wait = rows.filter((r) => r.status === "waitlist");
  return (
    <div className="space-y-4 text-[13px]">
      <p className="text-encre/60">{confirmed}/{capacity} places confirmées · {wait.length} en attente</p>
      <ul className="max-h-[50vh] divide-y divide-encre/10 overflow-auto">
        {rows.map((r) => (
          <li key={r.id} className="flex justify-between gap-3 py-2">
            <span>
              <strong>{r.full_name}</strong>
              <span className="block text-encre/50">{r.email}</span>
            </span>
            <span className="text-encre/55">
              {r.status === "waitlist" ? `Liste d'attente #${r.waitlist_position}` : r.status === "attended" ? "Présent·e" : r.status === "registered" ? "Inscrit·e" : r.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
