"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import { nav, bookingHref } from "@/content/landing";
import { Symbol, Logotype } from "@/components/brand/Symbol";
import Magnetic from "@/components/ui/Magnetic";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

/**
 * En-tête : transparent sur le hero, papier ensuite ; se masque en descendant,
 * réapparaît en remontant. Menu plein écran sur mobile.
 */
export default function Header() {
  const ref = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
  const { lenis } = useSmoothScroll();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(ref.current, { yPercent: -100, autoAlpha: 0, duration: 1.4, delay: 1.5, ease: "expo.out" });
        ScrollTrigger.create({
          start: "top top",
          end: "max",
          onUpdate: (self) => {
            const hide = self.direction === 1 && self.scroll() > window.innerHeight * 0.6;
            gsap.to(ref.current, { yPercent: hide ? -100 : 0, duration: 0.7, ease: "expo.out", overwrite: "auto" });
          },
        });
      });
      const hero = document.getElementById("top");
      if (!hero) return;
      ScrollTrigger.create({
        trigger: hero,
        start: "bottom 72px",
        onEnter: () => setLight(true),
        onLeaveBack: () => setLight(false),
      });
    },
    { scope: ref },
  );

  // Menu mobile : verrouille le défilement et anime les liens
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    if (!open || !panel.current) return;
    const links = panel.current.querySelectorAll("[data-menu-item]");
    const tween = gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.06, ease: "expo.out", delay: 0.15 });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      tween.kill();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  const tone = light && !open ? "text-encre bg-papier/90 backdrop-blur-md border-encre/10" : "text-ivoire bg-transparent border-transparent";

  return (
    <header ref={ref} className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-700 ${tone}`}>
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center gap-6 px-[5vw]">
        <a href="#top" className="mr-auto flex items-center gap-3" aria-label="Narcisse, retour en haut">
          <Symbol className="h-9 w-auto" />
          <Logotype className="h-[15px] w-auto" />
        </a>
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 lg:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="link-line text-[14px] tracking-wide">
              {n.label}
            </a>
          ))}
        </nav>
        <span className="hidden sm:block">
          <Magnetic strength={0.2}>
            <a href={bookingHref} className={`btn btn-line min-h-11 whitespace-nowrap px-5 text-[11px] ${light && !open ? "on-light" : "on-dark"}`}>
              <span className="btn-label">Prendre rendez-vous</span>
            </a>
          </Magnetic>
        </span>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center lg:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path d={open ? "M5 5l14 14M19 5L5 19" : "M3 9h18M3 15h18"} stroke="currentColor" strokeWidth="1.3" fill="none" />
          </svg>
        </button>
      </div>

      {open && (
        <div ref={panel} id="menu-mobile" className="fixed inset-0 top-[72px] z-40 flex h-[calc(100svh-72px)] flex-col justify-between bg-encre px-6 pb-10 pt-8 text-ivoire lg:hidden">
          <nav aria-label="Menu mobile" className="flex flex-col">
            {nav.map((n) => (
              <span key={n.href} className="overflow-hidden border-b border-ivoire/10 py-3">
                <a data-menu-item href={n.href} onClick={() => setOpen(false)} className="display block text-[44px] leading-none no-underline">
                  {n.label}
                </a>
              </span>
            ))}
          </nav>
          <a href={bookingHref} className="btn btn-fill self-start">
            <span className="btn-label">Prendre rendez-vous</span>
          </a>
        </div>
      )}
    </header>
  );
}
