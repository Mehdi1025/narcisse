"use client";

import { useMemo, useState } from "react";
import { boutique, type ProductKey } from "@/content/landing";
import ProductCardArch from "@/components/boutique/ProductCardArch";
import type { ProductRow } from "@/lib/boutique/types";

type Filter = "tous" | ProductKey;

export default function CollectionView({ products }: { products: ProductRow[] }) {
  const [filter, setFilter] = useState<Filter>("tous");

  const list = useMemo(
    () => (filter === "tous" ? products : products.filter((p) => p.universe === filter)),
    [products, filter],
  );

  const filters: { id: Filter; label: string }[] = [
    { id: "tous", label: "Toute la collection" },
    ...boutique.universes.map((u) => ({ id: u.key as Filter, label: u.name })),
  ];

  return (
  <>
    <header className="mx-auto max-w-[1440px] px-[5vw] pt-[clamp(120px,14vw,180px)] pb-[clamp(40px,5vw,64px)] text-ivoire">
      <p className="eyebrow text-rose">
        <span className="text-ivoire/45">N°05 — </span>
        {boutique.label}
      </p>
      <h1 className="display mt-6 max-w-[14ch] text-[clamp(42px,5.4vw,84px)]">Toute la collection</h1>
      <p className="mt-6 max-w-[36em] text-[16.5px] text-ivoire/75">
        {boutique.body[0]} {boutique.body[1]}
      </p>
      <div className="mt-10 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={
              filter === f.id
                ? "rounded-full border border-ivoire/30 bg-ivoire px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-encre"
                : "rounded-full border border-ivoire/15 px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-ivoire/65 transition-colors hover:border-ivoire/35 hover:text-ivoire"
            }
          >
            {f.label}
          </button>
        ))}
      </div>
    </header>

    <ProductGrid products={list} filter={filter} />

    <p className="mx-auto max-w-[1440px] px-[5vw] py-[clamp(80px,10vw,140px)] text-center font-serif text-[clamp(22px,3vw,36px)] italic text-ivoire/55">
      {boutique.signature}
    </p>
  </>
  );
}

function ProductGrid({ products, filter }: { products: ProductRow[]; filter: Filter }) {
  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-[1440px] px-[5vw] pb-24">
        <div className="rounded-3xl border border-dashed border-ivoire/20 px-8 py-20 text-center">
          <p className="font-serif text-[26px] text-ivoire/90">La collection se prépare.</p>
          <p className="mt-3 text-[15px] text-ivoire/55">
            {filter === "tous"
              ? "De nouveaux essentiels seront bientôt disponibles ici."
              : "Aucun produit dans cet univers pour le moment."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1440px] px-[5vw] pb-[clamp(64px,8vw,120px)]">
      <div className="grid gap-[clamp(20px,2.2vw,36px)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} id={p.slug} className="scroll-mt-28">
            <ProductCardArch product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}