"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, MQ, revealLines } from "@/lib/gsap";
import { philosophy, vision } from "@/content/landing";
import Rule from "@/components/ui/Rule";

/**
 * Manifeste : le titre s'éclaire mot à mot au défilement, les textes se révèlent
 * ligne par ligne, puis la citation surgit derrière les bandes verticales du reflet.
 */
export default function Philosophy() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const title = q("[data-manifesto]")[0];
        const split = SplitText.create(title, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.12 },
          { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: title, start: "top 78%", end: "bottom 42%", scrub: 0.4 } },
        );
        q("[data-lines]").forEach((el) => revealLines(el));
        gsap.from(q("[data-label]"), { autoAlpha: 0, y: 14, duration: 1, scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
        gsap.from(q("[data-band]"), {
          scaleY: 0,
          transformOrigin: "50% 100%",
          ease: "expo.out",
          duration: 1.6,
          stagger: 0.08,
          scrollTrigger: { trigger: q("[data-quote]")[0], start: "top 80%", once: true },
        });
        gsap.to(q("[data-bands]"), { yPercent: -12, ease: "none", scrollTrigger: { trigger: q("[data-quote]")[0], start: "top bottom", end: "bottom top", scrub: true } });
        return () => split.revert();
      });
    },
    { scope: root },
  );

  const bands = [0.95, 0.55, 0.8, 0.3, 0.65, 0.18, 0.42];

  return (
    <section ref={root} id="philosophie" className="bg-papier px-[5vw] pb-[clamp(90px,12vw,180px)] pt-[clamp(100px,13vw,200px)] text-encre">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-y-14 md:grid-cols-12 md:gap-x-8">
        <div className="md:col-span-3">
          <p data-label className="eyebrow text-bordeaux md:sticky md:top-32">
            <span className="text-encre/50">N°02 — </span>
            {philosophy.label}
          </p>
        </div>
        <h2 data-manifesto className="display text-[clamp(40px,5.6vw,96px)] md:col-span-9">
          {philosophy.title}
        </h2>

        <Rule className="md:col-span-12" />

        <div className="space-y-6 text-[clamp(19px,1.5vw,23px)] leading-[1.55] text-encre md:col-span-5 md:col-start-4">
          {vision.map((p) => (
            <p key={p} data-lines>
              {p}
            </p>
          ))}
        </div>
        <div className="space-y-5 text-[16.5px] text-gris md:col-span-4 md:col-start-9">
          {philosophy.body.map((p) => (
            <p key={p} data-lines>
              {p}
            </p>
          ))}
        </div>

        <div className="md:col-span-9 md:col-start-4">
          <p data-lines className="serif-italic text-[clamp(28px,3.2vw,48px)] leading-[1.25] text-encre">
            {philosophy.stanza.map((s) => (
              <span key={s} className="block">
                {s}
              </span>
            ))}
          </p>
          <p data-lines className="mt-10 max-w-[34em] text-[16.5px] text-gris">
            {philosophy.close}
          </p>
        </div>
      </div>

      {/* Citation : bandes verticales du reflet (brand book) */}
      <figure data-quote className="mx-auto mt-[clamp(90px,11vw,170px)] grid max-w-[1440px] grid-cols-1 items-end gap-10 md:grid-cols-12 md:gap-x-8">
        <div data-bands aria-hidden="true" className="arch-soft flex h-[clamp(200px,26vw,380px)] w-full max-w-[260px] items-end gap-[6%] md:col-span-3">
          {bands.map((o, i) => (
            <span key={i} data-band className="block h-full flex-1 bg-encre" style={{ opacity: o }} />
          ))}
        </div>
        <blockquote data-lines className="serif-italic m-0 text-[clamp(36px,5vw,84px)] leading-[1.06] text-encre md:col-span-9">
          {philosophy.quote}
        </blockquote>
      </figure>
    </section>
  );
}
