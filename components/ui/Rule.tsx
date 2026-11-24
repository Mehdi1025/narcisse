"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";

/** Séparateur fin qui se trace de gauche à droite à l'entrée dans l'écran. */
export default function Rule({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(ref.current, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.6,
          ease: "expo.inOut",
          scrollTrigger: { trigger: ref.current, start: "top 92%", once: true },
        });
      });
    },
    { scope: ref },
  );
  return <div ref={ref} aria-hidden="true" className={`h-px w-full ${tone === "dark" ? "bg-encre/20" : "bg-ivoire/20"} ${className}`} />;
}
