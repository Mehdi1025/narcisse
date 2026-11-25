"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { euro, universes, type Product, type UniverseKey } from "@/content/boutique";
import Magnetic from "@/components/ui/Magnetic";
import { useShopCatalog } from "./shopCatalog";
import { useCart } from "./cart";

const COVER: Record<UniverseKey, string> = { skincare: "NAR-SK-02", "art-de-vivre": "NAR-BV-02", developpement: "NAR-DP-03", editions: "NAR-ED-01" };

export function UniverseIndex({ pick }: { pick: (k: UniverseKey) => void }) {
  const root = useRef<HTMLElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<UniverseKey | null>(null);
  const products = useShopCatalog();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(q("[data-row]"), { yPercent: 60, autoAlpha: 0, duration: 1.4, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
        gsap.from(q("[data-rule]"), { scaleX: 0, transformOrigin: "left", duration: 1.6, ease: "expo.inOut", stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
      });
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const el = float.current!;
        const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" });
        const rTo = gsap.quickTo(el, "rotation", { duration: 0.9, ease: "power3.out" });
        let last = 0;
        const move = (e: PointerEvent) => {
          const r = root.current!.getBoundingClientRect();
          xTo(e.clientX - r.left);
          yTo(e.clientY - r.top);
          rTo(gsap.utils.clamp(-10, 10, (e.clientX - last) * 0.6));
          last = e.clientX;
        };
        root.current!.addEventListener("pointermove", move);
        return () => root.current?.removeEventListener("pointermove", move);
      });
    },
    { scope: root },
  );

  useGSAP(() => {
    gsap.to(float.current, { autoAlpha: hover ? 1 : 0, scale: hover ? 1 : 0.85, duration: 0.6, ease: "expo.out" });
  }, [hover]);

  return (
    <section ref={root} className="relative overflow-hidden bg-ivoire py-28 md:py-36" onPointerLeave={() => setHover(null)}>
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <p className="eyebrow text-bordeaux">Nos univers</p>
        <ul className="mt-10">
          {universes.map((u, i) => (
            <li key={u.key} className="relative">
              <span data-rule className="absolute inset-x-0 top-0 block h-px bg-encre/15" />
              <button
                type="button"
                onClick={() => pick(u.key)}
                onPointerEnter={() => setHover(u.key)}
                onFocus={() => setHover(u.key)}
                onBlur={() => setHover(null)}
                data-cursor="Filtrer"
                className="group flex w-full items-baseline gap-6 overflow-hidden py-7 text-left md:gap-12 md:py-9"
              >
                <span className="eyebrow w-10 shrink-0 text-gris/50">0{i + 1}</span>
                <span data-row className="block flex-1">
                  <span className="display block text-[clamp(36px,6.2vw,104px)] text-encre transition-[color,transform] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-4 group-hover:text-bordeaux">
                    {u.name}
                  </span>
                </span>
                <span className="hidden shrink-0 text-right md:block">
                  <span className="block text-[14px] text-gris/70">{u.line}</span>
                  <span className="eyebrow mt-2 block text-gris/45">{products.filter((p) => p.universe === u.key).length} objets</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div ref={float} className="pointer-events-none absolute left-0 top-0 z-20 hidden w-[240px] -translate-x-1/2 -translate-y-1/2 opacity-0 md:block" aria-hidden>
        <div className="aspect-[4/5] overflow-hidden rounded-t-full shadow-2xl">
          {universes.map((u) => {
            const img = products.find((p) => p.ref === COVER[u.key])?.image;
            if (!img) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={u.key} src={img} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: hover === u.key ? 1 : 0 }} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function GiftSpotlight({ open }: { open: (p: Product) => void }) {
  const root = useRef<HTMLElement>(null);
  const { add } = useCart();
  const products = useShopCatalog();
  const gift = products.find((p) => p.ref === "NAR-ED-03");
  useGSAP(
    () => {
      if (!gift) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(q("[data-gift-img]"), { clipPath: "inset(18% 22% 18% 22% round 999px 999px 0 0)" }, { clipPath: "inset(0% 0% 0% 0% round 999px 999px 0 0)", ease: "none", scrollTrigger: { trigger: root.current, start: "top 85%", end: "center 55%", scrub: 0.8 } });
        gsap.fromTo(q("[data-gift-img] img"), { scale: 1.35 }, { scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 85%", end: "bottom top", scrub: true } });
        gsap.from(q("[data-gift-copy] > *"), { y: 40, autoAlpha: 0, duration: 1.3, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 60%", once: true } });
      });
    },
    { scope: root, dependencies: [Boolean(gift)] },
  );
  if (!gift) return null;
  return (
    <section ref={root} className="bg-bordeaux text-papier">
      <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-6 py-24 md:grid-cols-2 md:px-12 md:py-32">
        <div data-gift-img className="relative mx-auto aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-t-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gift.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div data-gift-copy>
          <p className="eyebrow text-rose">Offrir Narcisse</p>
          <h2 className="display mt-6 text-[clamp(44px,5.6vw,92px)]">
            Un moment pour soi, <span className="serif-italic text-rose">à offrir.</span>
          </h2>
          <p className="mt-8 max-w-[28em] text-[17px] leading-relaxed text-papier/75">{gift.description}</p>
          <p className="mt-6 font-serif text-[28px]">dès {euro(gift.price)}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Magnetic>
              <button type="button" className="btn btn-line on-dark" onClick={() => add(gift.ref)} data-cursor="Ajouter">
                <span className="btn-label">Ajouter au panier</span>
              </button>
            </Magnetic>
            <button type="button" className="link-line self-center text-[14px] text-papier/80" onClick={() => open(gift)}>
              Voir le détail
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}