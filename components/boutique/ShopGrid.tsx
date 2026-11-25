"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { Flip } from "gsap/Flip";
import { gsap, ScrollTrigger, useGSAP, MQ, revealLines } from "@/lib/gsap";
import { euro, universes, type Product, type UniverseKey } from "@/content/boutique";
import { useShopCatalog } from "./shopCatalog";
import { useCart } from "./cart";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);

type Filter = "tout" | UniverseKey;

export default function ShopGrid({ filter, setFilter, open }: { filter: Filter; setFilter: (f: Filter) => void; open: (p: Product) => void }) {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const products = useShopCatalog();
  const { add } = useCart();
  const visible = products.filter((p) => filter === "tout" || p.universe === filter);
  const active = universes.find((u) => u.key === filter);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        revealLines(q("[data-head]")[0]);
        gsap.set(q("[data-reveal]"), { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(q("[data-reveal] img"), { scale: 1.3 });
        gsap.set(q("[data-meta]"), { autoAlpha: 0, y: 18 });
        ScrollTrigger.batch(q("[data-card]"), {
          start: "top 88%",
          once: true,
          onEnter: (els) => {
            const tl = gsap.timeline();
            els.forEach((el, i) => {
              tl.to(el.querySelector("[data-reveal]"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" }, i * 0.09)
                .to(el.querySelector("[data-reveal] img"), { scale: 1, duration: 2, ease: "expo.out" }, i * 0.09 + 0.25)
                .to(el.querySelector("[data-meta]"), { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out" }, i * 0.09 + 0.55);
            });
          },
        });
      });
    },
    { scope: root, dependencies: [products.length] },
  );

  useLayoutEffect(() => {
    const b = bar.current;
    const ind = indicator.current;
    const cur = b?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!b || !ind || !cur) return;
    gsap.to(ind, { x: cur.offsetLeft, width: cur.offsetWidth, duration: ind.dataset.ready ? 0.7 : 0, ease: "expo.out" });
    ind.dataset.ready = "1";
  }, [filter]);

  useLayoutEffect(() => {
    const st = flipState.current;
    if (!st) return;
    flipState.current = null;
    Flip.from(st, {
      duration: 1.1,
      ease: "expo.inOut",
      absolute: true,
      stagger: 0.02,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.9, delay: 0.25, ease: "expo.out" }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.9, duration: 0.5, ease: "power2.in" }),
      onComplete: () => ScrollTrigger.refresh(),
    });
    const line = root.current?.querySelector("[data-universe-line]");
    if (line) gsap.fromTo(line, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out" });
  }, [filter]);

  const choose = (f: Filter) => {
    if (f === filter) return;
    const q = gsap.utils.selector(root);
    gsap.set(q("[data-reveal]"), { clipPath: "inset(0% 0% 0% 0%)" });
    gsap.set(q("[data-reveal] img"), { scale: 1 });
    gsap.set(q("[data-meta]"), { autoAlpha: 1, y: 0 });
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) flipState.current = Flip.getState(q("[data-card]"));
    setFilter(f);
  };

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "tout", label: "Tout", count: products.length },
    ...universes.map((u) => ({ key: u.key as Filter, label: u.short, count: products.filter((p) => p.universe === u.key).length })),
  ];

  return (
    <section ref={root} id="selection" className="relative bg-papier pb-32 pt-24 md:pt-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <header className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow text-bordeaux">La sélection</p>
            <h2 data-head className="display mt-5 text-[clamp(44px,6.4vw,104px)] text-encre">
              Des objets choisis, <span className="serif-italic">comme des rituels.</span>
            </h2>
          </div>
          <p data-universe-line className="max-w-[22em] text-[16px] text-gris/80 md:text-right">
            {active ? active.line : "Essentiels pensés dans le prolongement de nos soins."}
          </p>
        </header>
      </div>

      <div className="sticky top-4 z-30 mt-14 flex justify-center px-4">
        <div ref={bar} role="group" aria-label="Filtrer par univers" className="relative flex max-w-full gap-1 overflow-x-auto rounded-full border border-encre/10 bg-papier/80 p-1.5 shadow-[0_12px_40px_rgb(17_26_43/0.12)] backdrop-blur-md [scrollbar-width:none]">
          <span ref={indicator} className="absolute left-0 top-1.5 bottom-1.5 rounded-full bg-encre" aria-hidden />
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => choose(f.key)}
              className={`relative z-10 flex h-11 shrink-0 items-center gap-1.5 rounded-full px-5 text-[13px] tracking-[0.06em] transition-colors duration-500 ${filter === f.key ? "text-ivoire" : "text-encre/70 hover:text-encre"}`}
            >
              {f.label}
              <sup className="text-[10px] opacity-60">{f.count}</sup>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-[1440px] px-6 md:px-12">
        <ul className="grid grid-cols-2 gap-x-5 gap-y-14 md:gap-x-8 lg:grid-cols-4 lg:gap-y-20">
          {products.map((p) => {
            const vi = visible.indexOf(p);
            const shown = vi !== -1;
            return (
              <li key={p.ref} data-card className={`group relative ${shown ? "" : "hidden"} ${vi % 2 === 1 ? "mt-14 lg:mt-24" : ""}`}>
                <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-ivoire">
                  <button type="button" onClick={() => open(p)} data-cursor="Voir" className="absolute inset-0 block" aria-label={`Voir ${p.name}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07]" />
                  </button>
                  <span className="pointer-events-none absolute inset-3 rounded-t-full border border-white/0 transition-[border-color,inset] duration-700 group-hover:inset-4 group-hover:border-white/60" aria-hidden />
                  <button
                    type="button"
                    onClick={() => add(p.ref)}
                    className="absolute bottom-4 right-4 grid h-12 w-12 translate-y-3 place-items-center rounded-full bg-papier text-encre opacity-0 shadow-lg transition-all duration-500 hover:bg-bordeaux hover:text-papier focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100"
                    aria-label={`Ajouter ${p.name} au panier`}
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4"><path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                  </button>
                </div>
                <div data-meta className="mt-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow !text-[10.5px] text-gris/55">{universes.find((u) => u.key === p.universe)?.short}</p>
                    <h3 className="mt-2 font-serif text-[clamp(20px,1.8vw,26px)] leading-[1.1] text-encre">
                      <button type="button" onClick={() => open(p)} className="text-left hover:text-bordeaux">
                        {p.name}
                      </button>
                    </h3>
                  </div>
                  <p className="shrink-0 pt-6 font-serif text-[20px] text-encre">
                    {p.priceFrom && <span className="mr-1 text-[13px] text-gris/60">dès</span>}
                    {euro(p.price)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}