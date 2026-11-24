"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Curseur éditorial : point en mode « difference », qui grossit sur les liens
 * et affiche un libellé sur les éléments portant data-cursor="Libellé".
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      el.classList.add("is-on");
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      const link = t.closest("a, button");
      el.classList.toggle("is-label", !!labelled);
      el.classList.toggle("is-link", !labelled && !!link);
      if (label.current) label.current.textContent = labelled?.dataset.cursor ?? "";
    };
    const leave = () => el.classList.remove("is-on");
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
