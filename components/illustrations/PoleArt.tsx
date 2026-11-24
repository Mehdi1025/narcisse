import type { PoleKey } from "@/content/landing";

/** Illustrations des trois pôles (une seule couleur de pôle par visuel). */
export default function PoleArt({ pole }: { pole: PoleKey }) {
  if (pole === "mentale") return <Mental />;
  if (pole === "physique") return <Shell />;
  return <Social />;
}

const frame = (stroke: string) => <path d="M36 400V170A114 114 0 0 1 264 170V400" fill="none" stroke={stroke} strokeOpacity=".3" />;

function Mental() {
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="m-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3e5372" />
          <stop offset="1" stopColor="#5a7194" />
        </linearGradient>
        <linearGradient id="m-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4e6c" />
          <stop offset="1" stopColor="#2b3b55" />
        </linearGradient>
      </defs>
      <rect width="300" height="232" fill="url(#m-sky)" />
      <rect y="230" width="300" height="170" fill="url(#m-sea)" />
      <circle data-par="-12" cx="150" cy="148" r="46" fill="#EEE8DC" />
      <g data-par="8" fill="#EEE8DC">
        {[
          [112, 244, 76, 5, 0.85],
          [104, 258, 92, 4, 0.7],
          [118, 271, 64, 4, 0.55],
          [128, 284, 44, 3, 0.42],
          [136, 296, 28, 3, 0.3],
        ].map(([x, y, w, h, o]) => (
          <rect key={y} x={x} y={y} width={w} height={h} rx={h / 2} opacity={o} />
        ))}
      </g>
      <g fill="none" stroke="#EEE8DC" strokeWidth="1">
        {[40, 78, 118, 160].map((r, i) => (
          <ellipse key={r} cx="150" cy="332" rx={r} ry={r * 0.21} opacity={0.55 - i * 0.12} />
        ))}
      </g>
      <path d="M0 230.5H300" stroke="#EEE8DC" strokeOpacity=".45" />
      {frame("#EEE8DC")}
    </svg>
  );
}

function Shell() {
  const cx = 150;
  const cy = 292;
  const R = 116;
  const n = 13;
  const pt = (a: number, r: number) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.02] as const;
  const ribs = Array.from({ length: n + 1 }, (_, i) => {
    const a = Math.PI + (i / n) * Math.PI;
    const [x, y] = pt(a, R);
    return { x, y, o: 0.45 + 0.55 * Math.sin((i / n) * Math.PI) };
  });
  let edge = "";
  for (let i = 0; i < n; i++) {
    const a1 = Math.PI + (i / n) * Math.PI;
    const a2 = Math.PI + ((i + 1) / n) * Math.PI;
    const [x1, y1] = pt(a1, R);
    const [x2, y2] = pt(a2, R);
    const [xm, ym] = pt((a1 + a2) / 2, R + 12);
    edge += `${i ? "" : `M${x1.toFixed(1)} ${y1.toFixed(1)}`}Q${xm.toFixed(1)} ${ym.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="s-glow" cx="50%" cy="62%" r="60%">
          <stop offset="0" stopColor="#b25a4f" />
          <stop offset="1" stopColor="#7b352e" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill="url(#s-glow)" />
      <rect y="300" width="300" height="100" fill="#6f2f29" opacity=".55" />
      <g data-par="-10" fill="none" stroke="#EEE8DC" strokeWidth="1.3">
        {ribs.map((r, i) => (
          <path key={i} d={`M${cx} ${cy - 6}L${r.x.toFixed(1)} ${r.y.toFixed(1)}`} strokeOpacity={r.o.toFixed(2)} />
        ))}
        <path d={edge} strokeWidth="1.6" />
        <path d="M128 292h44l-8 16h-28z" fill="#EEE8DC" stroke="none" />
      </g>
      <ellipse cx="150" cy="318" rx="96" ry="8" fill="#000" opacity=".18" />
      {frame("#EEE8DC")}
    </svg>
  );
}

function Social() {
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="so-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a9a8c" />
          <stop offset="1" stopColor="#6c7d6f" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#so-bg)" />
      <g data-par="-12" fill="none" stroke="#111A2B" strokeWidth="1.3">
        <circle cx="118" cy="138" r="58" />
        <circle cx="182" cy="138" r="58" />
        <circle cx="150" cy="188" r="58" strokeOpacity=".5" />
      </g>
      <g data-par="6">
        <g fill="#111A2B">
          <circle cx="92" cy="262" r="17" />
          <path d="M56 340a36 36 0 0 1 72 0v60H56z" />
          <circle cx="208" cy="262" r="17" />
          <path d="M172 340a36 36 0 0 1 72 0v60h-72z" />
        </g>
        <g fill="#EEE8DC">
          <circle cx="150" cy="250" r="19" />
          <path d="M110 334a40 40 0 0 1 80 0v66h-80z" />
        </g>
      </g>
      {frame("#111A2B")}
    </svg>
  );
}
