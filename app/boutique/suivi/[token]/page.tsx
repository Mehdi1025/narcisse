import type { Metadata } from "next";
import Link from "next/link";
import OrderTracking from "@/components/boutique/OrderTracking";
import { getOrderByTrackingToken } from "@/lib/shop/getOrderByTrackingToken";

export const metadata: Metadata = {
  title: "Suivi de commande — Boutique Narcisse",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ token: string }> };

export default async function SuiviCommandePage({ params }: Props) {
  const { token } = await params;
  const order = await getOrderByTrackingToken(token);
  if (!order) {
    return (
      <div className="shop flex min-h-dvh flex-col items-center justify-center bg-papier px-6 text-center text-encre">
        <h1 className="font-serif text-3xl">Lien introuvable</h1>
        <p className="mt-4 max-w-md text-[15px] text-encre/60">
          Ce lien de suivi n&apos;est pas valide ou a expiré. Utilisez le lien reçu après votre paiement ou contactez le salon.
        </p>
        <Link href="/boutique" className="link-line mt-8 text-[14px]">
          Retour à la boutique
        </Link>
      </div>
    );
  }
  return <OrderTracking order={order} />;
}