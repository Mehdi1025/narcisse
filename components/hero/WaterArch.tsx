"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { WaterApi } from "./water";
import styles from "./Hero.module.css";

export type WaterArchHandle = { setProgress: (p: number) => void };

/**
 * Fenêtre d'eau de l'arche. Le moteur WebGL est chargé à la demande ;
 * sans WebGL ou en mouvement réduit, un reflet statique (CSS) reste affiché.
 */
const WaterArch = forwardRef<WaterArchHandle, { className?: string }>(function WaterArch({ className = "" }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<WaterApi | null>(null);

  useImperativeHandle(ref, () => ({ setProgress: (p) => api.current?.setProgress(p) }), []);

  useEffect(() => {
    const el = canvas.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    let last = 0;
    const move = (e: PointerEvent) => {
      const t = performance.now();
      if (t - last < 50) return;
      last = t;
      api.current?.dropAt(e.clientX, e.clientY, e.pointerType === "touch" ? 0.7 : 0.4);
    };
    const down = (e: PointerEvent) => api.current?.dropAt(e.clientX, e.clientY, 1.4);
    import("./water").then(({ createWater }) => {
      if (!alive) return;
      api.current = createWater(el);
      if (api.current) {
        el.dataset.ready = "true";
        el.addEventListener("pointermove", move, { passive: true });
        el.addEventListener("pointerdown", down);
      }
    });
    return () => {
      alive = false;
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", down);
      api.current?.destroy();
      api.current = null;
    };
  }, []);

  return (
    <div data-window className={`arch ${className}`} data-cursor="Effleurez">
      <div data-water className={styles.water}>
        <div className={styles.fallback} aria-hidden="true">
          <span />
        </div>
        <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
      </div>
    </div>
  );
});

export default WaterArch;
