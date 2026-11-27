"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { euro, shop } from "@/content/boutique";
import { legalLinks, legalOperator, shopLegalFacts } from "@/content/legal";
import { completer } from "@/lib/legal/completer";
import { PICKUP_LOCATION, shippingEnabled, shippingFlatCents } from "@/lib/shop/config";
import { useCart } from "./cart";

const shippingEuro = shippingFlatCents() / 100;

export default function CheckoutForm({ cancelled }: { cancelled?: boolean }) {
  const { lines, total, canCheckout } = useCart();
  const shippingOn = shippingEnabled();
  const [fulfillment, setFulfillment] = useState<"pickup" | "shipping">("pickup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptLegal, setAcceptLegal] = useState(false);

  const grandTotal = useMemo(() => total + (fulfillment === "shipping" ? shippingEuro : 0), [total, fulfillment]);

  if (!lines.length) {
    return (
      <section className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-serif text-4xl text-encre">Panier vide</h1>
        <Link href="/boutique" className="link-line mt-6 inline-block text-[14px]">
          Retour à la boutique
        </Link>
      </section>
    );
  }

  const pay = async () => {
    if (!canCheckout) {
      setError("Le catalogue en ligne n’est pas encore synchronisé. Réessayez plus tard ou contactez le salon.");
      return;
    }
    if (!acceptLegal) {
      setError("Veuillez accepter les CGV et la politique de confidentialité.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillment,
          customer: { name, email, phone },
          shipping:
            fulfillment === "shipping"
              ? { line1, line2, postalCode, city, country: "FR" }
              : undefined,
          lines: lines.map((l) => ({ productId: l.product.id, quantity: l.qty })),
          acceptLegal: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Paiement impossible");
      if (json.checkoutUrl) window.location.href = json.checkoutUrl as string;
      else throw new Error("URL de paiement manquante");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  };

  return (
    <div className="shop min-h-dvh bg-papier text-encre">
      <header className="border-b border-encre/10 px-6 py-5 md:px-12">
        <Link href="/boutique" className="text-[13px] tracking-wide uppercase text-encre/60 hover:text-bordeaux">
          ← Boutique
        </Link>
      </header>
      <div className="mx-auto grid max-w-[1100px] gap-12 px-6 py-12 md:grid-cols-[1fr_380px] md:px-12">
        <div>
          <p className="eyebrow text-bordeaux">Commande</p>
          <h1 className="display mt-3 text-[clamp(36px,5vw,52px)]">Retrait &amp; coordonnées</h1>
          {cancelled && (
            <p className="mt-4 rounded-xl border border-bordeaux/30 bg-bordeaux/5 px-4 py-3 text-[14px] text-bordeaux">
              Paiement annulé — vous pouvez réessayer.
            </p>
          )}
          <fieldset className="mt-10 space-y-3">
            <legend className="app-label mb-2">Mode de réception</legend>
            <label className="flex cursor-pointer gap-3 rounded-2xl border border-encre/15 p-4 has-[:checked]:border-encre">
              <input type="radio" name="fulfillment" checked={fulfillment === "pickup"} onChange={() => setFulfillment("pickup")} />
              <span>
                <strong className="block text-[15px]">Retrait au salon</strong>
                <span className="text-[13px] text-encre/55">
                  {PICKUP_LOCATION.line1} — {shopLegalFacts.pickupFee.toLowerCase()}, e-mail quand c&apos;est prêt (conservation{" "}
                  {shopLegalFacts.pickupRetentionDays} jours)
                </span>
              </span>
            </label>
            {shippingOn && (
              <label className="flex cursor-pointer gap-3 rounded-2xl border border-encre/15 p-4 has-[:checked]:border-encre">
                <input type="radio" name="fulfillment" checked={fulfillment === "shipping"} onChange={() => setFulfillment("shipping")} />
                <span>
                  <strong className="block text-[15px]">Livraison en France</strong>
                  <span className="text-[13px] text-encre/55">Forfait {euro(shippingEuro)}</span>
                </span>
              </label>
            )}
          </fieldset>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Field label="Nom complet" value={name} onChange={setName} className="sm:col-span-2" required />
            <Field label="E-mail" type="email" value={email} onChange={setEmail} required />
            <Field label="Téléphone" type="tel" value={phone} onChange={setPhone} />
          </div>
          {fulfillment === "shipping" && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Field label="Adresse" value={line1} onChange={setLine1} className="sm:col-span-2" required />
              <Field label="Complément" value={line2} onChange={setLine2} className="sm:col-span-2" />
              <Field label="Code postal" value={postalCode} onChange={setPostalCode} required />
              <Field label="Ville" value={city} onChange={setCity} required />
            </div>
          )}
        </div>
        <aside className="h-fit rounded-[24px] border border-encre/10 bg-ivoire/50 p-6">
          <h2 className="font-serif text-2xl">Récapitulatif</h2>
          <ul className="mt-4 divide-y divide-encre/10 text-[14px]">
            {lines.map((l) => (
              <li key={l.ref} className="flex justify-between gap-3 py-3">
                <span className="min-w-0">
                  {l.product.name} × {l.qty}
                </span>
                <span className="shrink-0 tabular-nums">{euro(l.qty * l.product.price)}</span>
              </li>
            ))}
          </ul>
          {fulfillment === "shipping" && (
            <p className="mt-2 flex justify-between text-[14px] text-encre/70">
              <span>Livraison</span>
              <span>{euro(shippingEuro)}</span>
            </p>
          )}
          <p className="mt-4 flex justify-between border-t border-encre/10 pt-4 font-serif text-2xl">
            <span>Total TTC</span>
            <span>{euro(grandTotal)}</span>
          </p>
          <p className="mt-1 text-[12px] text-encre/50">Montants en euros, toutes taxes comprises.</p>
          {!canCheckout && (
            <p className="mt-4 text-[13px] text-bordeaux">Importez le catalogue dans Supabase et renseignez les stocks pour commander en ligne.</p>
          )}
          <label className="mt-6 flex cursor-pointer gap-3 text-left text-[13px] leading-snug text-encre/75">
            <input
              type="checkbox"
              className="mt-1 shrink-0"
              checked={acceptLegal}
              onChange={(e) => setAcceptLegal(e.target.checked)}
            />
            <span>
              J&apos;ai lu et j&apos;accepte les{" "}
              <Link href={legalLinks.cgv} className="link-line text-bordeaux" target="_blank" rel="noopener noreferrer">
                conditions générales de vente
              </Link>{" "}
              et la{" "}
              <Link href={legalLinks.privacy} className="link-line text-bordeaux" target="_blank" rel="noopener noreferrer">
                politique de confidentialité
              </Link>
              . Commande sans création de compte.
            </span>
          </label>
          <p className="mt-3 text-[12px] text-encre/50">
            Droit de rétractation de {shopLegalFacts.withdrawalDays} jours (sauf exceptions légales, notamment produits d&apos;hygiène
            descellés). Contact : {completer(legalOperator.contactEmail)}.
          </p>
          {error && <p className="mt-4 text-[13px] text-bordeaux">{error}</p>}
          <button
            type="button"
            disabled={loading || !name.trim() || !email.trim() || !canCheckout || !acceptLegal}
            onClick={pay}
            className="btn btn-fill mt-6 w-full disabled:opacity-50"
          >
            <span className="btn-label">{loading ? "Redirection…" : "Payer en ligne"}</span>
          </button>
          <p className="mt-4 text-center text-[12px] text-encre/50">{shop.checkoutNote}</p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={className}>
      <span className="app-label mb-1 block">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-encre/15 bg-papier px-4 py-3 text-[15px]"
      />
    </label>
  );
}