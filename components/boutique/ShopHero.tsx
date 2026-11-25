"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { shop, universes } from "@/content/boutique";
import { useShopCatalog } from "./shopCatalog";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import Magnetic from "@/components/ui/Magnetic";

const HERO_REFS = ["NAR-SK-01", "NAR-BV-01", "NAR-DP-01", "NAR-ED-03"];

export default function ShopHero() {
  const root = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();
  const catalog = useShopCatalog();
  const featured = HERO_REFS.map((r) => catalog.find((p) => p.ref === r)).filter(Boolean) as typeof catalog;

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const slides = q("[data-slide]");
      const labels = q("[data-slide-label]");
      gsap.set(slides.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(labels.slice(1), { yPercent: 110 });

      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const split = SplitText.create(q("[data-title]"), { type: "lines", mask: "lines", linesClass: "split-line" });
        const tl = gsap.timeline({ delay: 0.25, defaults: { ease: "expo.out" } });
        tl.from(split.lines, { yPercent: 115, duration: 1.5, stagger: 0.1 })
          .fromTo(q("[data-arch-line]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" }, 0)
          .fromTo(q("[data-window]"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut" }, 0.2)
          .from(q("[data-window] img"), { scale: 1.35, duration: 2.4 }, 0.2)
          .from(q("[data-fade]"), { autoAlpha: 0, y: 24, duration: 1.2, stagger: 0.08 }, 0.7);

        const loop = gsap.timeline({ repeat: -1, delay: 2.6 });
        slides.forEach((_, i) => {
          const next = (i + 1) % slides.length;
          loop
            .set(slides[next], { zIndex: 2 }, "+=2.4")
            .set(slides[i], { zIndex: 1 })
            .fromTo(slides[next], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", immediateRender: false })
            .fromTo(slides[next].querySelector("img"), { scale: 1.25 }, { scale: 1, duration: 2.2, ease: "expo.out", immediateRender: false }, "<")
            .to(labels[i], { yPercent: -110, duration: 0.9, ease: "expo.inOut" }, "<")
            .fromTo(labels[next], { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.inOut", immediateRender: false }, "<0.1")
            .set(slides[i], { clipPath: "inset(100% 0% 0% 0%)", zIndex: 0 });
        });

        gsap.to(q("[data-arch]"), { yPercent: 14, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
        gsap.to(q("[data-copy]"), { yPercent: -18, autoAlpha: 0.2, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });

        const track = q("[data-marquee]")[0] as HTMLElement;
        const loopX = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
        const st = gsap.timeline({
          scrollTrigger: {
            start: 0,
            end: "max",
            onUpdate: (s) =>
              gsap.to(loopX, {
                timeScale: 1 + Math.min(6, Math.abs(s.getVelocity()) / 300),
                duration: 0.3,
                overwrite: true,
                onComplete: () => {
                  gsap.to(loopX, { timeScale: 1, duration: 1.2 });
                },
              }),
          },
        });
        return () => {
          split.revert();
          st.kill();
        };
      });
    },
    { scope: root, dependencies: [featured.length] },
  );

  const names = universes.map((u) => u.name);
  return (
    <section ref={root} id="top" className="relative overflow-hidden bg-encre pt-28 text-ivoire md:pt-32">
      <div className="mx-auto grid max-w-[1440px] items-end gap-12 px-6 pb-16 md:grid-cols-[1.15fr_0.85fr] md:px-12 md:pb-24">
        <div data-copy className="relative z-10">
          <p data-fade className="eyebrow text-rose">{shop.eyebrow}</p>
          <h1 data-title className="display mt-7 text-[clamp(52px,8.2vw,132px)] text-ivoire">
            {shop.titleA} <span className="serif-italic text-rose">{shop.titleB}</span>
          </h1>
          <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,26em)_auto] md:items-end">
            <p data-fade className="text-[17px] leading-relaxed text-ivoire/70">{shop.intro}</p>
            <div data-fade className="flex items-center gap-6">
              <Magnetic>
                <button type="button" className="btn btn-fill" data-cursor="Voir" onClick={() => scrollTo("#selection")}>
                  <span className="btn-label">Découvrir la sélection</span>
                </button>
              </Magnetic>
            </div>
          </div>
          <dl data-fade className="mt-14 flex gap-12 border-t border-ivoire/15 pt-6">
            <div>
              <dt className="eyebrow text-ivoire/45">Objets</dt>
              <dd className="display mt-2 text-[44px]">{catalog.length}</dd>
            </div>
            <div>
              <dt className="eyebrow text-ivoire/45">Univers</dt>
              <dd className="display mt-2 text-[44px]">{universes.length}</dd>
            </div>
          </dl>
        </div>

        <div data-arch className="relative mx-auto w-full max-w-[440px]">
          <svg viewBox="0 0 440 600" className="pointer-events-none absolute -inset-4 z-10 h-[calc(100%+32px)] w-[calc(100%+32px)] overflow-visible" aria-hidden>
            <path data-arch-line pathLength={1} strokeDasharray="1" d="M8 596 V220 A212 212 0 0 1 432 220 V596" fill="none" stroke="#D9B8AE" strokeOpacity=".55" strokeWidth="1.2" />
          </svg>
          <div data-window className="relative aspect-[4/5.4] overflow-hidden rounded-t-full bg-encre-2">
            {featured.map((p, i) => (
              <figure key={p.ref} data-slide className="absolute inset-0 m-0" style={{ zIndex: i === 0 ? 2 : 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="h-full w-full object-cover" />
              </figure>
            ))}
          </div>
          <div className="mt-5 flex items-baseline justify-between gap-4">
            <span className="eyebrow text-ivoire/45">Univers</span>
            <span className="relative block h-[30px] flex-1 overflow-hidden text-right">
              {featured.map((p) => (
                <span key={p.ref} data-slide-label className="serif-italic absolute inset-x-0 top-0 text-[22px] text-ivoire">
                  {universes.find((u) => u.key === p.universe)?.name}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-ivoire/10 py-6" aria-hidden>
        <div data-marquee className="marquee">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {[...names, ...names].map((n, i) => (
                <span key={`${k}-${i}`} className="flex items-center whitespace-nowrap px-8 font-serif text-[clamp(30px,4vw,56px)] italic text-ivoire/85">
                  {n}
                  <svg viewBox="0 0 20 26" className="ml-16 h-6 w-auto text-rose/70"><path d="M2 26V10a8 8 0 0 1 16 0v16" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}