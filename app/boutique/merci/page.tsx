import type { Metadata } from "next";
import Link from "next/link";
import { emailConfigured } from "@/lib/legal/display";
import { siteOrigin } from "@/lib/shop/config";
import { isTrackingToken } from "@/lib/shop/trackingToken";

export const metadata: Metadata = {
  title: "Merci — Boutique Narcisse",
  robots: { index: false },
};

export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ commande?: string; suivi?: string }>;
}) {
  const sp = await searchParams;
  const num = sp.commande?.trim();
  const token = sp.suivi?.trim();
  const hasTracking = token && isTrackingToken(token);
  const trackingHref = hasTracking ? `/boutique/suivi/${encodeURIComponent(token)}` : null;
  const trackingAbs = hasTracking ? `${siteOrigin().replace(/\/$/, "")}${trackingHref}` : null;
  const emailOn = emailConfigured();

  return (
    <div className="shop flex min-h-dvh flex-col items-center justify-center bg-papier px-6 text-center text-encre">
      <p className="eyebrow text-bordeaux">Merci</p>
      <h1 className="display mt-4 max-w-md text-[clamp(36px,6vw,52px)]">Merci, votre paiement a bien été reçu</h1>
      {num && (
        <p className="mt-4 text-[15px] text-encre/65">
          Référence : <strong>{num}</strong>
        </p>
      )}
      {emailOn ? (
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-encre/60">
          Vous allez recevoir un e-mail de confirmation à l&apos;adresse indiquée. Nous préparons votre commande et vous préviendrons
          dès qu&apos;elle est prête au retrait.
        </p>
      ) : (
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-encre/60">
          Conservez le lien de suivi ci-dessous : il vous permet de suivre votre commande. Nous vous préviendrons dès qu&apos;elle est prête au
          retrait.
        </p>
      )}
      {trackingHref && (
        <Link href={trackingHref} className="btn btn-fill mt-8">
          <span className="btn-label">Suivre ma commande</span>
        </Link>
      )}
      {trackingAbs && (
        <p className="mt-6 max-w-md break-all text-[12px] text-encre/45">
          Lien personnel de suivi (à conserver) :<br />
          <a href={trackingAbs} className="text-bordeaux underline-offset-2 hover:underline">
            {trackingAbs}
          </a>
        </p>
      )}
      <Link href="/boutique" className="link-line mt-8 text-[14px]">
        Retour à la boutique
      </Link>
    </div>
  );
}