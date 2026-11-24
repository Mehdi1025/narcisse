"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type ScrollApi = { scrollTo: (target: string | number) => void; lenis: Lenis | null };
const ScrollContext = createContext<ScrollApi>({ scrollTo: () => {}, lenis: null });
export const useSmoothScroll = () => useContext(ScrollContext);

/** Lenis synchronisé avec le ticker GSAP (60 i/s, ScrollTrigger mis à jour à chaque défilement). */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [api, setApi] = useState<ScrollApi>({ scrollTo: () => {}, lenis: null });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fallback = (target: string | number) => {
      if (typeof target === "number") window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
      else document.querySelector(target)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    };
    if (reduce) {
      setApi({ scrollTo: fallback, lenis: null });
      return;
    }
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setApi({
      lenis,
      scrollTo: (target) => lenis.scrollTo(target as string, { offset: typeof target === "string" && target !== "#top" ? -72 : 0, duration: 1.6 }),
    });

    // Liens d'ancre internes → défilement amorti
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#" || !document.querySelector(href)) return;
      e.preventDefault();
      lenis.scrollTo(href, { offset: -72, duration: 1.6 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
