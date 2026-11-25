"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { footer } from "@/content/landing";
import { Symbol, Logotype } from "@/components/brand/Symbol";

/** Pied de page : méandre qui se dessine, colonnes, puis logotype géant qui émerge. */
export default function Footer({ base = "" }: { base?: string }) {
  const link = (h: string) => (h.startsWith("#") ? `${base}${h}` : h);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(q("[data-meander]"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 45%", scrub: 0.8 } });
        gsap.from(q("[data-col]"), { autoAlpha: 0, y: 24, duration: 1.2, stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
        gsap.from(q("[data-giant]"), { yPercent: 100, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: q("[data-giant-wrap]")[0], start: "top 95%", once: true } });
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} id="contact" className="bg-encre text-ivoire">
      <svg data-meander className="block h-[22px] w-full text-ivoire/35" aria-hidden="true">
        <defs>
          <pattern id="meander" width="44" height="22" patternUnits="userSpaceOnUse">
            <path d="M0 19H40V3H8V15H32V9H16" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </pattern>
        </defs>
        <rect width="100%" height="22" fill="url(#meander)" />
      </svg>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-[5vw] pb-14 pt-[clamp(64px,8vw,110px)] md:grid-cols-12 md:gap-x-8">
        <div data-col className="md:col-span-5">
          <Symbol className="h-24 w-auto text-ivoire" />
          <p className="eyebrow mt-7 text-rose">{footer.tagline}</p>
          <p className="serif-italic mt-5 max-w-[15em] text-[28px] leading-[1.25]">{footer.quote}</p>
        </div>
        <nav data-col aria-label="Plan du site" className="md:col-span-3 md:col-start-7">
          <p className="eyebrow text-rose">Navigation</p>
          <ul className="mt-5 space-y-2.5 text-[15.5px]">
            {footer.nav.map((n) => (
              <li key={n.href}>
                <a href={link(n.href)} className="link-line text-ivoire/85 hover:text-ivoire">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div data-col className="md:col-span-3">
          <p className="eyebrow text-rose">Coordonnées</p>
          <ul className="mt-5 space-y-2.5 text-[15.5px] text-ivoire/85">
            {footer.contact.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-x-10 gap-y-3 border-t border-ivoire/12 px-[5vw] py-7 text-[13.5px] text-ivoire/55">
        <span>
          {footer.legal.map((l, i) => (
            <span key={l.href}>
              {i > 0 && " · "}
              <a href={l.href} className="link-line">
                {l.label}
              </a>
            </span>
          ))}
        </span>
        <span className="max-w-[44em]">{footer.note}</span>
      </div>

      <div data-giant-wrap className="overflow-hidden px-[3vw] pb-[2vw] pt-4">
        <div data-giant>
          <Logotype className="block h-auto w-full text-ivoire/90" title="Narcisse" />
        </div>
      </div>
    </footer>
  );
}
