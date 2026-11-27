import Link from "next/link";
import type { ReactNode } from "react";
import type { LegalSection } from "@/content/legal";
import { interpolateLegalTemplate } from "@/lib/legal/interpolate";

export function LegalDocument({
  eyebrow,
  title,
  intro,
  sections,
  backHref = "/",
  backLabel = "Retour à l'accueil",
  footerNote,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  sections: LegalSection[];
  backHref?: string;
  backLabel?: string;
  footerNote?: ReactNode;
}) {
  return (
    <div className="shop min-h-dvh bg-papier text-encre">
      <header className="border-b border-encre/10 px-6 py-5 md:px-12">
        <Link href={backHref} className="text-[13px] tracking-wide uppercase text-encre/60 hover:text-bordeaux">
          ← {backLabel}
        </Link>
      </header>
      <article className="mx-auto max-w-[760px] px-6 py-12 md:px-12 md:py-16">
        <p className="eyebrow text-bordeaux">{eyebrow}</p>
        <h1 className="display mt-3 text-[clamp(32px,5vw,48px)]">{title}</h1>
        {intro && <p className="mt-6 text-[15px] leading-relaxed text-encre/75">{intro}</p>}
        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="font-serif text-[26px] text-encre">{s.title}</h2>
              <div className="mt-4 space-y-3 text-[15px] leading-[1.65] text-encre/80">
                {s.body.map((p, i) => (
                  <p key={i}>{interpolateLegalTemplate(p)}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        {footerNote && (
          <p className="mt-14 border-t border-encre/10 pt-8 text-[13px] leading-relaxed text-encre/55">{footerNote}</p>
        )}
      </article>
    </div>
  );
}