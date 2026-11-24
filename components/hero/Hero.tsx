"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { hero } from "@/content/landing";
import Magnetic from "@/components/ui/Magnetic";
import WaterArch, { type WaterArchHandle } from "./WaterArch";
import styles from "./Hero.module.css";

/**
 * Hero « L'Arche-miroir » : une arche sculpturale ouverte sur une eau vivante,
 * traversée par un titre éditorial en trois lignes. Entrée chorégraphiée (≈ 2,4 s),
 * puis parallaxe au défilement : les lignes s'écartent comme des portes.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const water = useRef<WaterArchHandle>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const lines = q<HTMLElement>("[data-line]");
        const splits = lines.map((l) => SplitText.create(l, { type: "words", mask: "words" }));
        gsap.set(q("[data-title]"), { autoAlpha: 1 });

        const tl = gsap.timeline({ delay: 0.15, defaults: { ease: "expo.out" } });
        tl.fromTo(q("[data-outline]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut" }, 0)
          .fromTo(q("[data-plinth]"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.inOut", stagger: 0.1 }, 0.5)
          .fromTo(q("[data-window]"), { clipPath: "inset(101% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.9, ease: "expo.inOut" }, 0.25)
          .fromTo(q("[data-water]"), { scale: 1.4 }, { scale: 1, duration: 2.6 }, 0.25);
        splits.forEach((s, i) => tl.from(s.words, { yPercent: 115, duration: 1.5, stagger: 0.07 }, 0.95 + i * 0.12));
        tl.fromTo(q("[data-hero-fade]"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.07 }, 1.45);

        // Défilement : les lignes s'écartent, l'arche s'avance, la caméra plonge
        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 };
        gsap.to(q("[data-arch]"), { yPercent: -8, scale: 1.08, ease: "none", scrollTrigger: st });
        gsap.to(q("[data-line='0']"), { xPercent: -14, ease: "none", scrollTrigger: st });
        gsap.to(q("[data-line='1']"), { xPercent: 14, ease: "none", scrollTrigger: st });
        gsap.to(q("[data-line='2']"), { xPercent: -6, ease: "none", scrollTrigger: st });
        gsap.to(q("[data-hero-out]"), { opacity: 0, y: -40, ease: "none", scrollTrigger: { ...st, end: "45% top" } });
        ScrollTrigger.create({ ...st, onUpdate: (self) => water.current?.setProgress(self.progress) });

        return () => splits.forEach((s) => s.revert());
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className={`${styles.hero} hero-intro`} aria-labelledby="hero-title">
      {/* Arche sculpturale : contour tracé, fenêtre d'eau, socle à deux marches */}
      <div data-arch className={styles.arch}>
        <svg className={styles.outline} viewBox="0 0 640 1000" preserveAspectRatio="none" aria-hidden="true">
          <path data-outline pathLength={1} d="M2 1000V320A318 318 0 0 1 638 320V1000" />
        </svg>
        <WaterArch ref={water} className={styles.window} />
        <span data-plinth className={styles.plinth1} aria-hidden="true" />
        <span data-plinth className={styles.plinth2} aria-hidden="true" />
      </div>

      <div data-hero-out className={styles.labelWrap}>
      <p data-hero-fade className={`eyebrow ${styles.label}`}>
        <span className="text-rose">N°01</span>
        <span aria-hidden="true" className={styles.dash} />
        {hero.label}
      </p>
      </div>

      <h1 id="hero-title" data-title className={`display ${styles.title}`}>
        {hero.lines.map((l, i) => (
          <span key={l} data-line={String(i)} className={styles[`line${i}` as "line0"]}>
            {l}
          </span>
        ))}
      </h1>

      <ul data-hero-fade data-hero-out-list className={`eyebrow ${styles.aside}`} aria-label="Les trois pôles">
        {hero.aside.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>

      <div data-hero-out className={styles.bottom}>
        <p data-hero-fade className={styles.text}>
          {hero.text}
        </p>
        <div data-hero-fade className={styles.cta}>
          <Magnetic>
            <a href="#philosophie" className={styles.ctaLink}>
              <span className={styles.ctaCircle} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M12 4v16M5 13l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
              <span className="eyebrow link-line">{hero.cta}</span>
            </a>
          </Magnetic>
        </div>
      </div>

    </section>
  );
}
