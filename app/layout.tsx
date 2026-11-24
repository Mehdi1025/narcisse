import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import "./globals.css";

// Polices auto-hébergées (licence SIL OFL) : aucun appel externe au chargement.
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
});
const jost = localFont({
  src: [
    { path: "./fonts/jost-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jost-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-jost",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://narcisse.example";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Narcisse — Bien plus qu'un reflet",
  description:
    "Narcisse : un lieu pour prendre soin de son corps, apaiser son esprit et cultiver le lien avec les autres. Santé mentale, santé physique, santé sociale.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Narcisse",
    title: "Narcisse — Bien plus qu'un reflet",
    description: "Se retrouver. Se révéler. Se reconnecter à soi.",
  },
  twitter: { card: "summary_large_image", title: "Narcisse — Bien plus qu'un reflet" },
  icons: { icon: "/brand/narcisse-symbole.svg" },
};

export const viewport: Viewport = { themeColor: "#111A2B", width: "device-width", initialScale: 1 };

// Ajoute « js-motion » avant le premier rendu (états initiaux des animations),
// avec une sécurité : si les scripts ne démarrent pas, le contenu redevient visible.
const motionScript = `(function(){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.classList.add('js-motion');setTimeout(function(){if(!window.__narcisseReady)d.classList.remove('js-motion')},4000)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`} suppressHydrationWarning>
      <head>
        {/* suppressHydrationWarning : certaines extensions (ex. Kaspersky) réécrivent les scripts dans <head> avant l’hydratation React. */}
        <script dangerouslySetInnerHTML={{ __html: motionScript }} suppressHydrationWarning />
      </head>
      <body>
        <a href="#philosophie" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ivoire focus:px-5 focus:py-3 focus:text-encre">
          Aller au contenu
        </a>
        <SmoothScroll>
          {children}
          <Cursor />
        </SmoothScroll>
      </body>
    </html>
  );
}
