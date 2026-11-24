import type { ProductKey } from "@/content/landing";

/**
 * Natures mortes des futurs univers (illustrations, pas des produits réels).
 * Groupes data-lift : soulevés au survol de la carte.
 */
export default function ProductArt({ kind }: { kind: ProductKey }) {
  const bg: Record<ProductKey, [string, string]> = {
    skincare: ["#b86a5c", "#8a3c33"],
    "art-de-vivre": ["#94a596", "#6a7b6d"],
    developpement: ["#6b82a3", "#40557a"],
    editions: ["#e3cbc2", "#c9a79b"],
  };
  const [a, b] = bg[kind];
  const id = `p-${kind}`;
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="38%" r="75%">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </radialGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".05" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".45" />
          <stop offset=".6" stopColor="#fff" stopOpacity=".08" />
          <stop offset="1" stopColor="#000" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill={`url(#${id}-bg)`} />
      {/* socle */}
      <rect x="40" y="300" width="220" height="100" fill="#000" opacity=".12" />
      <rect x="40" y="298" width="220" height="4" fill="#fff" opacity=".25" />
      <ellipse cx="150" cy="302" rx="92" ry="7" fill="#000" opacity=".18" />
      {kind === "skincare" && <Skincare glass={`${id}-glass`} />}
      {kind === "art-de-vivre" && <Candle glass={`${id}-glass`} />}
      {kind === "developpement" && <Books />}
      {kind === "editions" && <Box />}
    </svg>
  );
}

function Skincare({ glass }: { glass: string }) {
  return (
    <>
      <g data-lift>
        {/* flacon compte-gouttes */}
        <rect x="112" y="150" width="44" height="150" rx="6" fill="#EEE8DC" />
        <rect x="112" y="150" width="44" height="150" rx="6" fill={`url(#${glass})`} />
        <rect x="118" y="196" width="32" height="52" fill="#96433A" opacity=".85" />
        <rect x="122" y="208" width="24" height="2" fill="#EEE8DC" opacity=".8" />
        <rect x="122" y="216" width="16" height="2" fill="#EEE8DC" opacity=".6" />
        <rect x="120" y="126" width="28" height="26" rx="3" fill="#111A2B" />
        <path d="M126 126c0-22 16-22 16 0z" fill="#111A2B" />
      </g>
      {/* pot de crème */}
      <rect x="162" y="252" width="70" height="48" rx="8" fill="#F6F2EA" />
      <rect x="162" y="252" width="70" height="48" rx="8" fill={`url(#${glass})`} />
      <rect x="158" y="238" width="78" height="18" rx="5" fill="#111A2B" />
      <rect x="176" y="270" width="42" height="1.5" fill="#96433A" />
    </>
  );
}

function Candle({ glass }: { glass: string }) {
  return (
    <>
      <g data-lift>
        <path d="M150 168c9 12 9 22 0 30-9-8-9-18 0-30z" fill="#F6D9A8" />
        <path d="M150 180c4 6 4 11 0 15-4-4-4-9 0-15z" fill="#fff" opacity=".9" />
        <circle cx="150" cy="185" r="38" fill="#F6D9A8" opacity=".14" />
        <rect x="149" y="196" width="2" height="18" fill="#111A2B" />
      </g>
      <path d="M104 214h92v76a10 10 0 0 1-10 10h-72a10 10 0 0 1-10-10z" fill="#EEE8DC" />
      <path d="M104 214h92v76a10 10 0 0 1-10 10h-72a10 10 0 0 1-10-10z" fill={`url(#${glass})`} />
      <rect x="104" y="214" width="92" height="10" fill="#e2d9c8" />
      <path d="M118 244h64" stroke="#7E8F80" strokeWidth="1.5" />
      {/* flacon d'huile */}
      <rect x="212" y="236" width="30" height="64" rx="12" fill="#5e6e60" />
      <rect x="212" y="236" width="30" height="64" rx="12" fill={`url(#${glass})`} />
      <rect x="220" y="216" width="14" height="22" rx="2" fill="#111A2B" />
    </>
  );
}

function Books() {
  return (
    <>
      <rect x="70" y="270" width="160" height="30" rx="2" fill="#EEE8DC" />
      <rect x="70" y="270" width="8" height="30" fill="#4F6788" opacity=".5" />
      <rect x="80" y="244" width="146" height="26" rx="2" fill="#111A2B" />
      <rect x="196" y="244" width="5" height="26" fill="#D9B8AE" />
      <g data-lift>
        <rect x="96" y="150" width="104" height="94" rx="3" fill="#F6F2EA" transform="rotate(-6 148 197)" />
        <g transform="rotate(-6 148 197)">
          <path d="M126 222v-38a22 22 0 0 1 44 0v38" fill="none" stroke="#111A2B" strokeWidth="1.4" />
          <path d="M118 222h60" stroke="#111A2B" strokeWidth="1.4" />
          <rect x="182" y="150" width="6" height="64" fill="#96433A" />
        </g>
      </g>
    </>
  );
}

function Box() {
  return (
    <>
      <rect x="78" y="226" width="144" height="74" fill="#111A2B" />
      <rect x="78" y="226" width="144" height="74" fill="#fff" opacity=".04" />
      <rect x="144" y="226" width="12" height="74" fill="#96433A" />
      <g data-lift>
        <rect x="72" y="204" width="156" height="26" fill="#1b2638" />
        <rect x="144" y="204" width="12" height="26" fill="#96433A" />
        <path d="M150 204c-18-26-44-14-26 0M150 204c18-26 44-14 26 0" fill="none" stroke="#96433A" strokeWidth="6" strokeLinecap="round" />
      </g>
      <path d="M126 290v-34a24 24 0 0 1 48 0v34" fill="none" stroke="#EEE8DC" strokeOpacity=".7" strokeWidth="1.3" />
    </>
  );
}
