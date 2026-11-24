"use client";
// Point d'entrée unique de GSAP : plugins enregistrés une seule fois.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1.2 });
}

/** Courbes premium utilisées partout. */
export const EASE = { expo: "expo.out", power: "power3.out", inOut: "power2.inOut" } as const;

/** Conditions gsap.matchMedia partagées (animations désactivées si mouvement réduit). */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  desktop: "(prefers-reduced-motion: no-preference) and (min-width: 900px)",
  mobile: "(prefers-reduced-motion: no-preference) and (max-width: 899px)",
} as const;

/** Découpe un élément en lignes masquées et le révèle au défilement. */
export function revealLines(el: Element, opts: { delay?: number; start?: string; stagger?: number } = {}) {
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 110,
        duration: 1.3,
        ease: EASE.expo,
        stagger: opts.stagger ?? 0.09,
        delay: opts.delay ?? 0,
        scrollTrigger: { trigger: el, start: opts.start ?? "top 88%", once: true },
      });
    },
  });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
