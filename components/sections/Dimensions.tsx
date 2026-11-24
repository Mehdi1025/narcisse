"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ, revealLines } from "@/lib/gsap";
import { dimensions } from "@/content/landing";
import PoleArt from "@/components/illustrations/PoleArt";

const tones = {
  mentale: { bg: "bg-egeen", text: "text-ivoire", line: "border-ivoire/25", muted: "text-ivoire/75" },
  physique: { bg: "bg-bordeaux", text: "text-ivoire", line: "border-ivoire/25", muted: "text-ivoire/75" },
  sociale: { bg: "bg-sauge", text: "text-encre", line: "border-encre/25", muted: "text-encre/75" },
} as const;

/**
 * Les trois pôles en panneaux empilés : chaque pôle glisse par-dessus le précédent,
 * qui recule et s'estompe (bureau). Sur mobile : panneaux en flux, mêmes révélations.
 */
export default function Dimensions() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        q("[data-lines]").forEach((el) => revealLines(el));
        gsap.from(q("[data-head-label]"), { autoAlpha: 0, y: 14, duration: 1, scrollTrigger: { trigger: root.current, start: "top 78%", once: true } });

        q<HTMLElement>("[data-panel]").forEach((panel) => {
          const art = panel.querySelector("[data-art]");
          const tl = gsap.timeline({ scrollTrigger: { trigger: panel, start: "top 62%", once: true } });
          tl.fromTo(art, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" })
            .from(panel.querySelector("[data-art] svg"), { scale: 1.3, duration: 2.2, ease: "expo.out" }, 0)
            .from(panel.querySelector("[data-index]"), { yPercent: 40, autoAlpha: 0, duration: 1.4 }, 0.2)
            .from(panel.querySelectorAll("[data-item]"), { autoAlpha: 0, y: 16, duration: 1, stagger: 0.06 }, 0.5);
          // parallaxe interne des couches de l'illustration
          panel.querySelectorAll<SVGGElement>("[data-par]").forEach((g) => {
            gsap.to(g, { y: Number(g.dataset.par) * 2, ease: "none", scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true } });
          });
        });
      });

      // Empilement sticky (bureau uniquement)
      mm.add(MQ.desktop, () => {
        const panels = q<HTMLElement>("[data-panel]");
        panels.forEach((panel, i) => {
          const next = panels[i + 1];
          if (!next) return;
          gsap.to(panel.querySelector("[data-panel-inner]"), {
            scale: 0.9,
            yPercent: -3,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="dimensions" aria-labelledby="dimensions-title" className="bg-papier text-encre">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-y-10 px-[5vw] pb-[clamp(70px,9vw,140px)] pt-[clamp(40px,6vw,90px)] md:grid-cols-12 md:gap-x-8">
        <p data-head-label className="eyebrow text-bordeaux md:col-span-3">
          <span className="text-encre/50">N°03 — </span>
          {dimensions.label}
        </p>
        <h2 id="dimensions-title" data-lines className="display text-[clamp(44px,6vw,104px)] md:col-span-9">
          {dimensions.title[0]}
          <br />
          <span className="serif-italic">{dimensions.title[1]}</span>
        </h2>
        <p data-lines className="max-w-[30em] text-[clamp(17px,1.3vw,20px)] text-gris md:col-span-5 md:col-start-4">
          {dimensions.intro}
        </p>
      </div>

      <div>
        {dimensions.poles.map((p, i) => {
          const t = tones[p.key];
          return (
            <article
              key={p.key}
              id={p.id}
              data-panel
              aria-labelledby={`${p.id}-title`}
              className={`${t.bg} ${t.text} relative min-[900px]:sticky min-[900px]:top-0 min-[900px]:h-[100svh] min-[900px]:min-h-[640px]`}
              style={{ zIndex: i + 1 }}
            >
              <div data-panel-inner className="mx-auto grid h-full max-w-[1440px] origin-top grid-cols-1 items-center gap-10 px-[5vw] py-[clamp(72px,10vw,110px)] min-[900px]:grid-cols-12 min-[900px]:gap-x-8 min-[900px]:py-0">
                <div
                  data-art
                  data-cursor={p.name}
                  className="arch relative mx-auto aspect-[3/4] w-full max-w-[420px] min-[900px]:col-span-5 min-[900px]:h-[min(72svh,620px)] min-[900px]:w-auto min-[900px]:max-w-none"
                >
                  <PoleArt pole={p.key} />
                </div>
                <div className="min-[900px]:col-span-6 min-[900px]:col-start-7">
                  <div className="flex items-baseline gap-5 overflow-hidden">
                    <span data-index aria-hidden="true" className="display text-[clamp(64px,8vw,132px)] leading-none opacity-30">
                      {p.index}
                    </span>
                    <p className="eyebrow">{p.name}</p>
                  </div>
                  <h3 id={`${p.id}-title`} data-lines className="display mt-6 text-[clamp(36px,4.2vw,68px)]">
                    {p.title}
                  </h3>
                  <div className={`mt-7 space-y-4 text-[16.5px] ${t.muted}`}>
                    {p.text.map((x) => (
                      <p key={x} data-lines>
                        {x}
                      </p>
                    ))}
                  </div>
                  <p className="eyebrow mt-9 opacity-70">{p.listLabel}</p>
                  <ul className={`mt-4 grid grid-cols-1 border-t ${t.line} sm:grid-cols-2`}>
                    {p.list.map((li) => (
                      <li key={li} data-item className={`flex items-center gap-3 border-b ${t.line} py-3 text-[15.5px]`}>
                        <span aria-hidden="true" className="inline-block h-[7px] w-[7px] rotate-45 border border-current" />
                        {li}
                      </li>
                    ))}
                  </ul>
                  <p data-lines className="serif-italic mt-8 text-[clamp(24px,2.2vw,32px)] leading-[1.3]">
                    {p.signature}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
