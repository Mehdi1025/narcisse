import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Merci — Boutique Narcisse",
  robots: { index: false },
};

export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ commande?: string }>;
}) {
  const sp = await searchParams;
  const num = sp.commande?.trim();
  return (
    <div className="shop flex min-h-dvh flex-col items-center justify-center bg-papier px-6 text-center text-encre">
      <p className="eyebrow text-bordeaux">Merci</p>
      <h1 className="display mt-4 max-w-md text-[clamp(40px,6vw,56px)]">Votre commande est confirmée</h1>
      {num && <p className="mt-4 text-[15px] text-encre/65">Référence : <strong>{num}</strong></p>}
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-encre/60">
        Un e-mail de confirmation vous sera envoyé. Nous préparons votre colis ou vous préviendrons dès que votre commande est prête au retrait.
      </p>
      <Link href="/boutique" className="btn btn-fill mt-10">
        <span className="btn-label">Retour à la boutique</span>
      </Link>
    </div>
  );
}