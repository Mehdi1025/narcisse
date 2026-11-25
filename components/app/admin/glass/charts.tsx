"use client";
import { useId, useState } from "react";
import { cx } from "../../ui";

const nf = new Intl.NumberFormat("fr-FR");
export type CountFormat = "number" | "percent";
export const formatCount: Record<CountFormat, (v: number) => string> = {
  number: (v) => nf.format(Math.round(v)),
  percent: (v) => `${Math.round(v)} %`,
};

/** Nombre animé par le shell (GSAP) ; texte final lisible par les lecteurs d'écran. */
export function Count({ value, format = "number" }: { value: number; format?: CountFormat }) {
  const text = formatCount[format](value);
  return (
    <>
      <span key={value} data-nx-count={value} data-format={format} aria-hidden>
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5 text-[11.5px] text-encre/60">
          <i className="h-2 w-2 rounded-full" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

type Stack = { label: string; parts: number[] };

/** Barres empilées (une couleur par travailleuse), survol et clavier. */
export function StackChart({ items, series, title, unit = "rdv", height = 170 }: { items: Stack[]; series: { label: string; color: string }[]; title: string; unit?: string; height?: number }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...items.map((i) => i.parts.reduce((a, b) => a + b, 0))) * 1.12;
  const sel = active === null ? null : items[active];
  return (
    <figure aria-label={title}>
      <div className="flex h-6 items-center justify-between gap-2">
        <Legend items={series} />
        {sel && (
          <span className="text-[11.5px] font-medium whitespace-nowrap">
            {sel.label} · {sel.parts.reduce((a, b) => a + b, 0)} {unit}
          </span>
        )}
      </div>
      <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))`, height }} onMouseLeave={() => setActive(null)}>
        {items.map((it, i) => {
          const total = it.parts.reduce((a, b) => a + b, 0);
          return (
            <button
              key={it.label}
              type="button"
              className={cx("flex min-w-0 flex-col items-center rounded-xl pt-1 transition-colors", active === i && "bg-encre/[0.05]")}
              aria-label={`${it.label} : ${series.map((s, k) => `${it.parts[k]} ${s.label}`).join(", ")}`}
              aria-pressed={active === i}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(i)}
            >
              <span className="flex w-full flex-1 items-end justify-center border-b border-encre/10" aria-hidden>
                <span className="nx-bar flex w-[min(62%,38px)] min-w-[6px] flex-col-reverse overflow-hidden rounded-t-[7px] rounded-b-[3px]" style={{ height: `${(total / max) * 100}%` }}>
                  {it.parts.map((p, k) => (
                    <i
                      key={k}
                      className="block min-h-0"
                      style={{
                        flexGrow: p,
                        background:
                          k === 0
                            ? series[k].color
                            : `repeating-linear-gradient(138deg, ${series[k].color} 0 4px, color-mix(in srgb, ${series[k].color} 72%, white) 4px 6px)`,
                      }}
                    />
                  ))}
                </span>
              </span>
              <span className="mt-2 text-[10.5px] text-encre/55" aria-hidden>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </figure>
  );
}

/** Anneau de répartition (pôles). */
export function Ring({ parts, center, caption }: { parts: { label: string; value: number; color: string }[]; center: number; caption: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [active, setActive] = useState<number | null>(null);
  const total = Math.max(1, parts.reduce((a, p) => a + p.value, 0));
  const pct = parts.map((p) => (p.value / total) * 100);
  return (
    <div className="grid gap-3">
      <div className="relative mx-auto aspect-square w-[min(100%,150px)]">
        <svg viewBox="0 0 124 124" className="block h-full w-full" aria-hidden>
          <defs>
            <mask id={`m${id}`}>
              <circle className="nx-ring-draw" cx="62" cy="62" r="47" fill="none" stroke="white" strokeWidth="15" pathLength={100} strokeDasharray="100 0" transform="rotate(-90 62 62)" />
            </mask>
          </defs>
          <circle cx="62" cy="62" r="47" fill="none" stroke="var(--nx-track)" strokeWidth="14" />
          <g mask={`url(#m${id})`} transform="rotate(-90 62 62)">
            {parts.map((p, i) => (
              <circle
                key={p.label}
                cx="62"
                cy="62"
                r="47"
                fill="none"
                strokeWidth="14"
                pathLength={100}
                stroke={p.color}
                style={{ opacity: active !== null && active !== i ? 0.28 : 1, transition: "opacity .2s" }}
                strokeDasharray={`${Math.max(0, pct[i] - (pct[i] > 0 ? 1.1 : 0))} 100`}
                strokeDashoffset={-pct.slice(0, i).reduce((a, b) => a + b, 0)}
              />
            ))}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <strong className="font-serif text-[30px] leading-none font-medium">{active === null ? <Count value={center} /> : parts[active].value}</strong>
          <span className="mt-1 text-[11px] text-encre/55">{active === null ? caption : parts[active].label}</span>
        </div>
      </div>
      <div className="grid gap-0.5">
        {parts.map((p, i) => (
          <button
            key={p.label}
            type="button"
            aria-pressed={active === i}
            onClick={() => setActive(active === i ? null : i)}
            className={cx("grid grid-cols-[110px_minmax(0,1fr)_38px] items-center gap-2 rounded-lg px-2 py-1.5 text-left", active === i ? "bg-encre/[0.06]" : "hover:bg-encre/[0.04]")}
          >
            <span className="inline-flex items-center gap-1.5 text-[11.5px]">
              <i className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.label}
            </span>
            <span className="block h-1 overflow-hidden rounded-full bg-encre/10" aria-hidden>
              <i className="nx-grow block h-full rounded-full" style={{ width: `${pct[i]}%`, background: p.color }} />
            </span>
            <strong className="text-right text-[12px] font-medium">{Math.round(pct[i])} %</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
