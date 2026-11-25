"use client";

import Link from "next/link";
import type { ProductKey } from "@/content/landing";
import ProductArt from "@/components/illustrations/ProductArt";
import { formatPrice } from "@/lib/boutique/format";
import { UNIVERSE_LABEL } from "@/lib/boutique/labels";
import type { ProductRow } from "@/lib/boutique/types";
import styles from "@/components/sections/Boutique.module.css";

type Props = {
  product?: ProductRow;
  /** Carte placeholder univers (landing sans produits publiés). */
  placeholder?: { key: ProductKey; name: string; items: string; index: number };
  href?: string;
  /** Curseur custom sur la landing GSAP */
  dataCursor?: string;
};

export default function ProductCardArch({ product, placeholder, href, dataCursor }: Props) {
  const isPlaceholder = Boolean(placeholder);
  const universe = product?.universe ?? placeholder!.key;
  const title = product?.name ?? placeholder!.name;
  const subtitle = product?.tagline ?? placeholder!.items;
  const price = product ? formatPrice(product.price_cents) : null;
  const tag = price ?? (product ? "Collection" : "Bientôt");
  const linkHref = href ?? (product ? `/boutique#selection` : undefined);
  const indexLabel = placeholder ? `05.${placeholder.index + 1}` : undefined;

  const inner = (
    <>
      <div data-card-media className="arch relative aspect-[3/4]">
        <div data-card-img className={styles.img}>
          {product?.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ProductArt kind={universe} />
          )}
        </div>
        <svg className={styles.ring} viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength={1} d="M14 400V150A136 136 0 0 1 286 150V400" />
        </svg>
        <span className={`eyebrow ${styles.tag}`}>{tag}</span>
      </div>
      <div data-card-meta className="mt-6">
        <div className="flex items-baseline justify-between gap-4 border-b border-ivoire/15 pb-4">
          <h4 className="display text-[clamp(26px,2vw,32px)] leading-[1.05]">{title}</h4>
          {(indexLabel || product) && (
            <span className="eyebrow text-ivoire/40">{indexLabel ?? UNIVERSE_LABEL[universe].split(" ")[0]}</span>
          )}
        </div>
        <p className="mt-3 text-[15px] text-ivoire/65">{subtitle}</p>
        {product && (
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-ivoire/40">{UNIVERSE_LABEL[universe]}</p>
        )}
        <span aria-hidden="true" className={styles.bar} />
      </div>
    </>
  );

  const className = `group ${styles.card}`;

  if (linkHref && !isPlaceholder) {
    return (
      <article data-card className={className} data-cursor={dataCursor}>
        <Link href={linkHref} className="block outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-4 focus-visible:ring-offset-encre" aria-label={`${title} — ${subtitle}`}>
          {inner}
        </Link>
      </article>
    );
  }

  return (
    <article
      data-card
      data-cursor={dataCursor ?? (isPlaceholder ? "Bientôt" : undefined)}
      className={className}
      tabIndex={isPlaceholder ? 0 : undefined}
      aria-label={isPlaceholder ? `${title} — ${subtitle} Bientôt disponible.` : undefined}
    >
      {inner}
    </article>
  );
}