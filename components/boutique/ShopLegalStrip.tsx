import Link from "next/link";
import { legalLinks, shopLegalFacts } from "@/content/legal";

/** Bandeau informationnel boutique (prix TTC, CGV accessibles). */
export default function ShopLegalStrip() {
  return (
    <aside
      className="border-t border-encre/10 bg-ivoire/40 px-6 py-8 text-center text-[13px] leading-relaxed text-encre/65 md:px-12"
      aria-label="Informations légales boutique"
    >
      <p>
        Prix affichés en euros, toutes taxes comprises. {shopLegalFacts.productNature}.{" "}
        {shopLegalFacts.pickupOnlyAtLaunch ? "Retrait sur place au lancement — sans frais." : ""}
      </p>
      <p className="mt-2">
        <Link href={legalLinks.cgv} className="link-line text-bordeaux">
          CGV
        </Link>
        {" · "}
        <Link href={legalLinks.mentions} className="link-line">
          Mentions légales
        </Link>
        {" · "}
        <Link href={legalLinks.privacy} className="link-line">
          Confidentialité
        </Link>
      </p>
    </aside>
  );
}