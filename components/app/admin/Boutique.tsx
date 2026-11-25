"use client";

import { useCallback, useEffect, useState } from "react";
import { boutique, type ProductKey } from "@/content/landing";
import { slugify, formatPrice } from "@/lib/boutique/format";
import { UNIVERSE_LABEL } from "@/lib/boutique/labels";
import type { ProductRow } from "@/lib/boutique/types";
import { useToast } from "@/lib/app/store";
import { Button, Card, Empty, Field, Modal, cx } from "../ui";

const UNIVERSES = boutique.universes.map((u) => u.key);

type FormState = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  universe: ProductKey;
  priceEuro: string;
  image_url: string;
  featured: boolean;
  published: boolean;
  sort_order: string;
};

const emptyForm = (): FormState => ({
  name: "",
  slug: "",
  tagline: "",
  description: "",
  universe: "skincare",
  priceEuro: "",
  image_url: "",
  featured: false,
  published: false,
  sort_order: "0",
});

function euroToCents(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function rowToForm(p: ProductRow): FormState {
  return {
    name: p.name,
    slug: p.slug,
    tagline: p.tagline ?? "",
    description: p.description,
    universe: p.universe,
    priceEuro: p.price_cents != null ? String(p.price_cents / 100) : "",
    image_url: p.image_url ?? "",
    featured: p.featured,
    published: p.published,
    sort_order: String(p.sort_order),
  };
}

export default function AdminBoutique() {
  const toast = useToast();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | ProductRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Chargement impossible");
      setProducts(json.products ?? []);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(emptyForm());
    setModal("create");
  };

  const openEdit = (p: ProductRow) => {
    setForm(rowToForm(p));
    setModal(p);
  };

  const patchField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && (modal === "create" || !f.slug)) next.slug = slugify(String(value));
      return next;
    });
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast("Indiquez un nom de produit.");
      return;
    }
    const price_cents = euroToCents(form.priceEuro);
    if (form.priceEuro.trim() && price_cents === null) {
      toast("Prix invalide.");
      return;
    }
    const body = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      tagline: form.tagline.trim() || null,
      description: form.description.trim(),
      universe: form.universe,
      price_cents,
      image_url: form.image_url.trim() || null,
      featured: form.featured,
      published: form.published,
      sort_order: Number(form.sort_order) || 0,
    };

    setSaving(true);
    try {
      const isEdit = modal && modal !== "create";
      const res = await fetch(isEdit ? `/api/admin/products/${modal.id}` : "/api/admin/products", {
        method: isEdit ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Enregistrement impossible");
      toast(isEdit ? "Produit mis à jour." : "Produit créé.");
      setModal(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p: ProductRow, field: "published" | "featured") => {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !p[field] }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast(json.error ?? "Modification impossible");
      return;
    }
    setProducts((list) => list.map((x) => (x.id === p.id ? (json.product as ProductRow) : x)));
  };

  const remove = async (p: ProductRow) => {
    if (!window.confirm(`Supprimer « ${p.name} » ?`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE", credentials: "same-origin" });
    const json = await res.json();
    if (!res.ok) {
      toast(json.error ?? "Suppression impossible");
      return;
    }
    toast("Produit supprimé.");
    await load();
  };

  const publishedCount = products.filter((p) => p.published).length;
  const featuredCount = products.filter((p) => p.featured && p.published).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-encre/55">
            {publishedCount} publié{publishedCount > 1 ? "s" : ""} · {featuredCount} en vitrine (page d&apos;accueil, max conseillé : 4)
          </p>
        </div>
        <Button onClick={openCreate}>Ajouter un produit</Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <p className="p-6 text-[13px] text-encre/50">Chargement du catalogue…</p>
        ) : products.length === 0 ? (
          <div className="p-6">
            <Empty>Aucun produit. Créez le premier essentiel de la collection.</Empty>
          </div>
        ) : (
          <div className="app-scroll overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-encre/[0.08] text-encre/50">
                  {["Produit", "Univers", "Prix", "Ordre", "Vitrine", "Publié", ""].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium app-label">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-encre/[0.05] last:border-0">
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => openEdit(p)} className="text-left hover:text-bordeaux">
                        <span className="font-medium">{p.name}</span>
                        {p.tagline && <span className="mt-0.5 block text-encre/50">{p.tagline}</span>}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-encre/65">{UNIVERSE_LABEL[p.universe]}</td>
                    <td className="px-5 py-3 tabular-nums">{formatPrice(p.price_cents) ?? "—"}</td>
                    <td className="px-5 py-3 tabular-nums text-encre/55">{p.sort_order}</td>
                    <td className="px-5 py-3">
                      <Toggle on={p.featured} onClick={() => toggle(p, "featured")} label={p.featured ? "Oui" : "Non"} />
                    </td>
                    <td className="px-5 py-3">
                      <Toggle on={p.published} onClick={() => toggle(p, "published")} label={p.published ? "En ligne" : "Brouillon"} />
                    </td>
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => remove(p)} className="text-encre/40 hover:text-bordeaux">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal !== null && (
        <Modal
          open
          title={modal === "create" ? "Nouveau produit" : "Modifier le produit"}
          onClose={() => !saving && setModal(null)}
        >
          <div className="grid gap-4">
            <Field label="Nom">
              <input className="app-input" value={form.name} onChange={(e) => patchField("name", e.target.value)} required />
            </Field>
            <Field label="Slug (URL)" hint="Généré depuis le nom si vide.">
              <input className="app-input font-mono text-[12px]" value={form.slug} onChange={(e) => patchField("slug", e.target.value)} />
            </Field>
            <Field label="Accroche courte">
              <input className="app-input" value={form.tagline} onChange={(e) => patchField("tagline", e.target.value)} placeholder="Ex. Coffret rituel du soir" />
            </Field>
            <Field label="Description">
              <textarea className="app-input min-h-24" value={form.description} onChange={(e) => patchField("description", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Univers">
                <select className="app-input" value={form.universe} onChange={(e) => patchField("universe", e.target.value as ProductKey)}>
                  {UNIVERSES.map((k) => (
                    <option key={k} value={k}>
                      {UNIVERSE_LABEL[k]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Prix (€)" hint="Laisser vide si non affiché.">
                <input className="app-input" inputMode="decimal" value={form.priceEuro} onChange={(e) => patchField("priceEuro", e.target.value)} placeholder="39,90" />
              </Field>
            </div>
            <Field label="Image (URL)" hint="Optionnel — sinon illustration de l'univers.">
              <input className="app-input" value={form.image_url} onChange={(e) => patchField("image_url", e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Ordre d'affichage">
              <input className="app-input w-28" type="number" value={form.sort_order} onChange={(e) => patchField("sort_order", e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-4 text-[13px]">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => patchField("featured", e.target.checked)} />
                Mettre en vitrine (page d&apos;accueil)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.published} onChange={(e) => patchField("published", e.target.checked)} />
                Publier sur le site
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setModal(null)} disabled={saving}>
                Annuler
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "h-8 rounded-full px-3 text-[12px] transition-colors",
        on ? "bg-encre text-ivoire" : "bg-encre/[0.06] text-encre/60 hover:bg-encre/10",
      )}
    >
      {label}
    </button>
  );
}