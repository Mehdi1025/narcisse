"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ, revealLines } from "@/lib/gsap";
import { boutique } from "@/content/landing";
import ProductArt from "@/components/illustrations/ProductArt";
import styles from "./Boutique.module.css";

/**
 * Boutique (futurs univers) : cartes en arche révélées par masque,
 * micro-interactions au survol, puis bandeau défilant réactif à la vitesse de défilement.
 */
export default function Boutique() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        q("[data-lines]").forEach((el) => revealLines(el));
        gsap.from(q("[data-label]"), { autoAlpha: 0, y: 14, duration: 1, scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });

        const grid = q("[data-grid]")[0];
        const tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: "top 80%", once: true } });
        tl.fromTo(q("[data-card-media]"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", stagger: 0.12 })
          .from(q("[data-card-img]"), { scale: 1.3, duration: 2, ease: "expo.out", stagger: 0.12 }, 0)
          .from(q("[data-card-meta]"), { autoAlpha: 0, y: 20, duration: 1.1, stagger: 0.12 }, 0.5);

        // Bandeau : défilement continu, accéléré et incliné selon la vitesse de défilement
        const track = q("[data-marquee]")[0];
        const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
        const skew = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
        ScrollTrigger.create({
          trigger: track,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = self.getVelocity();
            loop.timeScale(1 + Math.min(4, Math.abs(v) / 400));
            skew(gsap.utils.clamp(-8, 8, v / -250));
            gsap.to(loop, { timeScale: 1, duration: 1.2, overwrite: true, delay: 0.1 });
          },
        });
      });
    },
    { scope: root },
  );

  const phrase = boutique.signature;

  return (
    <section ref={root} id="boutique" aria-labelledby="boutique-title" className="overflow-hidden bg-encre pt-[clamp(100px,13vw,200px)] text-ivoire">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-y-10 px-[5vw] md:grid-cols-12 md:gap-x-8">
        <p data-label className="eyebrow text-rose md:col-span-3">
          <span className="text-ivoire/45">N°05 — </span>
          {boutique.label}
        </p>
        <h2 id="boutique-title" data-lines className="display text-[clamp(42px,5.4vw,92px)] md:col-span-9">
          {boutique.title}
        </h2>
        <div className="space-y-4 text-[16.5px] text-ivoire/75 md:col-span-5 md:col-start-4">
          {boutique.body.map((p) => (
            <p key={p} data-lines>
              {p}
            </p>
          ))}
        </div>
      </div>

      <h3 className="sr-only">{boutique.listLabel}</h3>
      <div data-grid className={`${styles.grid} mx-auto mt-[clamp(56px,7vw,100px)] max-w-[1440px] px-[5vw]`}>
        {boutique.universes.map((u, i) => (
          <article key={u.key} data-card data-cursor="Bientôt" className={`group ${styles.card}`} tabIndex={0} aria-label={`${u.name} — ${u.items} Bientôt disponible.`}>
            <div data-card-media className="arch relative aspect-[3/4]">
              <div data-card-img className={styles.img}>
                <ProductArt kind={u.key} />
              </div>
              <svg className={styles.ring} viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
                <path pathLength={1} d="M14 400V150A136 136 0 0 1 286 150V400" />
              </svg>
              <span className={`eyebrow ${styles.tag}`}>Bientôt</span>
            </div>
            <div data-card-meta className="mt-6">
              <div className="flex items-baseline justify-between gap-4 border-b border-ivoire/15 pb-4">
                <h4 className="display text-[clamp(26px,2vw,32px)] leading-[1.05]">{u.name}</h4>
                <span className="eyebrow text-ivoire/40">05.{i + 1}</span>
              </div>
              <p className="mt-3 text-[15px] text-ivoire/65">{u.items}</p>
              <span aria-hidden="true" className={styles.bar} />
            </div>
          </article>
        ))}
      </div>

      {/* Signature en bandeau défilant */}
      <div className="mt-[clamp(90px,10vw,150px)] border-y border-ivoire/10 py-[clamp(22px,3vw,40px)]" aria-label={phrase}>
        <div data-marquee className="marquee" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="serif-italic flex items-center whitespace-nowrap pr-[0.6em] text-[clamp(56px,8vw,140px)] leading-none">
              <span className={i % 2 ? styles.outlineText : "text-rose"}>{phrase}</span>
              <svg viewBox="0 0 24 24" className="mx-[0.4em] h-[0.32em] w-[0.32em] text-rose" aria-hidden="true">
                <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="currentColor" />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
