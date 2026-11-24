"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ, revealLines } from "@/lib/gsap";
import { experience } from "@/content/landing";
import { Symbol } from "@/components/brand/Symbol";
import Rule from "@/components/ui/Rule";

/** L'expérience : une arcade de trois arches qui s'ouvrent puis glissent à des vitesses différentes. */
export default function Experience() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        q("[data-lines]").forEach((el) => revealLines(el));
        gsap.from(q("[data-label]"), { autoAlpha: 0, y: 14, duration: 1, scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
        gsap.fromTo(
          q("[data-bay]"),
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.7, ease: "expo.inOut", stagger: 0.12, scrollTrigger: { trigger: q("[data-arcade]")[0], start: "top 75%", once: true } },
        );
        q<HTMLElement>("[data-bay]").forEach((bay) => {
          gsap.to(bay, { yPercent: Number(bay.dataset.speed), ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });
    },
    { scope: root },
  );

  const bays = [
    { h: "h-[78%]", speed: -6 },
    { h: "h-full", speed: -14 },
    { h: "h-[70%]", speed: -3 },
  ];

  return (
    <section ref={root} id="experience" className="bg-ivoire px-[5vw] py-[clamp(100px,13vw,200px)] text-encre">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-16 md:grid-cols-12 md:gap-x-8">
        <div data-arcade aria-hidden="true" className="flex h-[clamp(320px,46vw,640px)] items-end gap-[3%] md:col-span-6">
          {bays.map((b, i) => (
            <div
              key={i}
              data-bay
              data-speed={b.speed}
              className={`arch relative flex-1 ${b.h} bg-gradient-to-b from-papier via-[#ece4d6] to-[#d8ccb8] shadow-[inset_0_0_0_1px_rgba(17,26,43,.18)]`}
            >
              <span className="arch absolute inset-[8%_10%_0] border border-b-0 border-encre/15" />
              <span className="absolute inset-x-[18%] bottom-0 top-[14%] rounded-t-full bg-gradient-to-br from-white/70 to-transparent opacity-60 blur-[2px]" />
              {i === 1 && <Symbol className="absolute bottom-[12%] left-1/2 h-[26%] w-auto -translate-x-1/2 text-encre" />}
            </div>
          ))}
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <p data-label className="eyebrow text-bordeaux">
            <span className="text-encre/50">N°04 — </span>
            {experience.label}
          </p>
          <h2 data-lines className="display mt-7 text-[clamp(40px,4.8vw,80px)]">
            {experience.title}
          </h2>
          <div className="mt-9 space-y-4 text-[16.5px] text-gris">
            {experience.body.map((p) => (
              <p key={p} data-lines>
                {p}
              </p>
            ))}
          </div>
          <Rule className="mt-10" />
          <p data-lines className="serif-italic mt-8 text-[clamp(28px,2.8vw,42px)] leading-[1.2] text-bordeaux [text-wrap:balance]">
            {experience.signature}
          </p>
        </div>
      </div>
    </section>
  );
}
