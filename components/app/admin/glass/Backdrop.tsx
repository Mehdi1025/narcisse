import { Symbol } from "@/components/brand/Symbol";

/**
 * Décor de l'espace administratrice : la scène « arche & reflet » de la marque, en aube ou en nuit.
 * Remplaçable par une photo du lieu (prop `image`) dès que le shooting est disponible —
 * aucune image de banque n'est utilisée pour ne pas représenter un lieu qui n'est pas Narcisse.
 */
export default function Backdrop({ theme, image }: { theme: "light" | "dark"; image?: string | null }) {
  const night = theme === "dark";
  return (
    <div className="nx-backdrop" aria-hidden>
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" style={{ filter: night ? "saturate(.7) brightness(.55)" : "saturate(.85) brightness(.92)" }} />
          <div className="absolute inset-0" style={{ background: night ? "linear-gradient(160deg, rgb(17 26 43 / 55%), rgb(17 26 43 / 25%))" : "linear-gradient(160deg, rgb(246 242 234 / 35%), rgb(79 103 136 / 18%))" }} />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 transition-[background] duration-700"
            style={{
              background: night
                ? "linear-gradient(180deg, #0b111c 0%, #111a2b 46%, #1b2a45 64%, #0e1626 100%)"
                : "linear-gradient(180deg, #efe9de 0%, #e6d6cc 44%, #cdd3db 64%, #e9e3d8 100%)",
            }}
          />
          {/* Halos de couleur (le verre les diffuse) */}
          <div className="absolute -right-[8%] -top-[18%] h-[70vh] w-[55vw] rounded-full blur-[90px]" style={{ background: night ? "rgb(150 67 58 / 34%)" : "rgb(217 184 174 / 75%)" }} />
          <div className="absolute -bottom-[22%] -left-[10%] h-[70vh] w-[60vw] rounded-full blur-[100px]" style={{ background: night ? "rgb(79 103 136 / 42%)" : "rgb(79 103 136 / 30%)" }} />
          <div className="absolute left-[38%] top-[30%] h-[34vh] w-[26vw] rounded-full blur-[90px]" style={{ background: night ? "rgb(217 184 174 / 16%)" : "rgb(150 67 58 / 16%)" }} />
          <div className="absolute bottom-[8%] right-[18%] h-[26vh] w-[22vw] rounded-full blur-[80px]" style={{ background: night ? "rgb(126 143 128 / 22%)" : "rgb(126 143 128 / 30%)" }} />

          {/* Arche et ligne d'horizon */}
          <div className="absolute right-[6%] top-[9%] w-[min(34vw,460px)]" style={{ color: night ? "rgb(238 232 220 / 10%)" : "rgb(17 26 43 / 7%)" }}>
            <Symbol className="h-auto w-full" />
          </div>
          <div className="absolute inset-x-0 top-[61%] h-px" style={{ background: night ? "linear-gradient(90deg, transparent, rgb(217 184 174 / 30%), transparent)" : "linear-gradient(90deg, transparent, rgb(255 255 255 / 70%), transparent)" }} />

          {/* Grain discret */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.07] mix-blend-overlay">
            <filter id="nx-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#nx-grain)" />
          </svg>
        </>
      )}
    </div>
  );
}
