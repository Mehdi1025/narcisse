"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Cursor from "@/components/ui/Cursor";

/** Espaces de gestion : /dashboard_* (sans Lenis ni curseur éditorial). */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isDashboard = pathname.startsWith("/dashboard_");

  if (isDashboard) return <>{children}</>;

  return (
    <>
      <a
        href="#philosophie"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ivoire focus:px-5 focus:py-3 focus:text-encre"
      >
        Aller au contenu
      </a>
      <SmoothScroll>
        {children}
        <Cursor />
      </SmoothScroll>
    </>
  );
}