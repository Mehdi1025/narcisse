"use client";

import { useState } from "react";
import Link from "next/link";
import { legalLinks } from "@/content/legal";
import type { PublishedWorkshop } from "@/lib/workshops/types";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import Ready from "@/components/providers/Ready";

export default function AteliersPublic({ workshops }: { workshops: PublishedWorkshop[] }) {
  const [sel, setSel] = useState<PublishedWorkshop | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const register = async () => {
    if (!sel) return;
    setPending(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/public/workshops/${sel.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Inscription impossible");
      const st = json.result?.status;
      setMsg(st === "waitlist" ? `Inscription en liste d'attente (position ${json.result?.waitlist_position ?? "—"}).` : "Votre place est confirmée. À bientôt chez Narcisse.");
      setForm({ full_name: "", email: "", phone: "" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-papier pt-28 text-encre md:pt-32">
        <AteliersHero />
        <section className="mx-auto max-w-[900px] px-6 pb-24 md:px-12">
          {workshops.length === 0 ? (
            <p className="text-center text-gris/70">Aucun atelier ouvert aux inscriptions pour le moment.</p>
          ) : (
            <ul className="space-y-6">
              {workshops.map((w) => (
                <li key={w.id} className="rounded-3xl border border-encre/10 bg-ivoire/40 p-6 md:p-8">
                  <p className="eyebrow text-bordeaux">Atelier · Santé sociale</p>
                  <h2 className="display mt-3 text-[clamp(28px,4vw,42px)]">{w.title}</h2>
                  <p className="mt-3 text-[15px] text-gris/80 whitespace-pre-wrap">{w.description}</p>
                  <dl className="mt-6 grid gap-2 text-[13px] text-gris/75 sm:grid-cols-2">
                    <div>
                      <dt className="app-label">Date</dt>
                      <dd>{new Date(w.starts_at).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })}</dd>
                    </div>
                    <div>
                      <dt className="app-label">Places</dt>
                      <dd>{w.capacity} participants</dd>
                    </div>
                    <div>
                      <dt className="app-label">Lieu</dt>
                      <dd>{w.location}</dd>
                    </div>
                  </dl>
                  <button type="button" className="btn btn-fill mt-8" onClick={() => { setSel(w); setMsg(null); setErr(null); }}>
                    <span className="btn-label">Réserver une place</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer base="/" />
      <Ready />

      {sel && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-encre/50 p-4 backdrop-blur-sm" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-3xl bg-papier p-8 shadow-xl">
            <h3 className="font-serif text-[26px]">Inscription</h3>
            <p className="mt-2 text-[14px] text-gris/70">{sel.title}</p>
            {msg && <p className="mt-4 text-[13px] text-sauge-fonce">{msg}</p>}
            {err && <p className="mt-4 text-[13px] text-bordeaux">{err}</p>}
            {!msg && (
              <div className="mt-6 grid gap-3">
                <input className="app-input" placeholder="Nom et prénom" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
                <input className="app-input" type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                <input className="app-input" placeholder="Téléphone (optionnel)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                <p className="text-[12px] leading-relaxed text-gris/65">
                  Vos données servent uniquement à gérer votre inscription.{" "}
                  <Link href={legalLinks.privacy} className="link-line text-bordeaux">
                    En savoir plus
                  </Link>
                  . Merci de ne pas indiquer d&apos;information de santé.
                </p>
                <button type="button" className="btn btn-fill w-full" disabled={pending} onClick={register}>
                  <span className="btn-label">{pending ? "Envoi…" : "Confirmer"}</span>
                </button>
              </div>
            )}
            <button type="button" className="link-line mt-6 text-[14px]" onClick={() => setSel(null)}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}

function AteliersHero() {
  return (
    <header className="mx-auto max-w-[900px] px-6 pb-12 pt-8 md:px-12">
      <p className="eyebrow text-bordeaux">Santé sociale</p>
      <h1 className="display mt-4 text-[clamp(40px,6vw,72px)]">Ateliers & événements</h1>
      <p className="mt-6 max-w-[32em] text-[16.5px] text-gris/80">
        Cercles, ateliers et rencontres proposés par l&apos;équipe Narcisse. Inscrivez-vous en ligne ; en cas de complet, vous rejoignez la liste d&apos;attente.
      </p>
      <p className="mt-4">
        <Link href="/" className="link-line text-[14px]">Retour à l&apos;accueil</Link>
      </p>
    </header>
  );
}