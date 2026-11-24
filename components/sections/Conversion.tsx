"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ, revealLines } from "@/lib/gsap";
import { conversion, bookingHref } from "@/content/landing";
import Magnetic from "@/components/ui/Magnetic";

/** Conversion : une grande arche se trace au défilement autour de l'invitation. */
export default function Conversion() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        q("[data-lines]").forEach((el) => revealLines(el));
        gsap.fromTo(
          q("[data-arch-line]"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top 85%", end: "center 55%", scrub: 0.8 } },
        );
        gsap.from(q("[data-fade]"), { autoAlpha: 0, y: 20, duration: 1.2, stagger: 0.1, scrollTrigger: { trigger: q("[data-actions]")[0], start: "top 92%", once: true } });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="rendez-vous" aria-labelledby="conversion-title" className="bg-papier px-[5vw] py-[clamp(90px,12vw,180px)] text-encre">
      <div className="relative mx-auto max-w-[980px] px-[clamp(20px,6vw,96px)] pb-[clamp(40px,5vw,70px)] pt-[clamp(110px,13vw,190px)] text-center">
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          <path data-arch-line pathLength={1} d="M1 1000V420A499 420 0 0 1 999 420V1000" fill="none" stroke="rgba(17,26,43,.28)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="1" />
        </svg>
        <p data-fade className="eyebrow text-bordeaux">{conversion.label}</p>
        <h2 id="conversion-title" data-lines className="display mx-auto mt-8 max-w-[12em] text-[clamp(42px,6vw,100px)]">
          {conversion.title}
        </h2>
        <div className="mx-auto mt-9 max-w-[34em] space-y-3 text-[16.5px] text-gris">
          {conversion.body.map((p) => (
            <p key={p} data-lines>
              {p}
            </p>
          ))}
        </div>
        <div data-actions className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <span data-fade>
            <Magnetic>
              <a href={bookingHref} className="btn btn-fill">
                <span className="btn-label">{conversion.primary}</span>
              </a>
            </Magnetic>
          </span>
          <span data-fade>
            <Magnetic>
              <a href="#dimensions" className="btn btn-line on-light text-encre">
                <span className="btn-label">{conversion.secondary}</span>
              </a>
            </Magnetic>
          </span>
        </div>
      </div>
    </section>
  );
}
