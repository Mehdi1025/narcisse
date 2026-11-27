import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL, legalLinks } from "@/content/legal";
import { missingLegalFields } from "@/lib/legal/status";

export type LegalSectionBlock = {
  id: string;
  title: string;
  content: ReactNode;
};

export function LegalNoticeBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <aside
      className={`rounded-2xl border border-encre/20 bg-ivoire/80 p-5 text-[14px] leading-[1.65] text-encre/85 ${className ?? ""}`}
    >
      {children}
    </aside>
  );
}

export default function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
  backHref = "/",
  backLabel = "Retour à l'accueil",
  footer,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  sections: LegalSectionBlock[];
  backHref?: string;
  backLabel?: string;
  footer?: ReactNode;
}) {
  const missing = process.env.NODE_ENV === "development" ? missingLegalFields() : [];

  return (
    <div className="shop min-h-dvh bg-papier text-encre">
      <header className="border-b border-encre/10 px-6 py-5 md:px-12">
        <Link href={backHref} className="text-[13px] tracking-wide uppercase text-encre/60 hover:text-bordeaux">
          ← {backLabel}
        </Link>
      </header>
      <article className="mx-auto max-w-[820px] px-6 py-12 md:px-12 md:py-16">
        <p className="eyebrow text-bordeaux">{eyebrow}</p>
        <h1 className="display mt-3 text-[clamp(32px,5vw,48px)]">{title}</h1>
        <p className="mt-3 text-[13px] text-encre/55">Version du {LEGAL.version}</p>
        {intro && <div className="mt-6 text-[15px] leading-relaxed text-encre/75">{intro}</div>}

        {missing.length > 0 && (
          <div
            className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-50 px-4 py-4 text-[13px] text-amber-950"
            role="status"
          >
            <p className="font-medium">Champs légaux incomplets (développement uniquement)</p>
            <ul className="mt-2 list-disc pl-5">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        <nav className="mt-10 rounded-2xl border border-encre/10 bg-ivoire/40 p-5" aria-label="Sommaire">
          <p className="app-label mb-3">Sommaire</p>
          <ol className="space-y-1 text-[14px]">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="link-line text-encre/80">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="font-serif text-[26px] text-encre">{s.title}</h2>
              <div className="mt-4 space-y-4 text-[15px] leading-[1.65] text-encre/80">{s.content}</div>
            </section>
          ))}
        </div>

        <p className="mt-14 flex flex-wrap gap-x-4 gap-y-2 border-t border-encre/10 pt-8 text-[14px]">
          <Link href={legalLinks.mentions} className="link-line">
            Mentions légales
          </Link>
          <Link href={legalLinks.privacy} className="link-line">
            Confidentialité
          </Link>
          <Link href={legalLinks.cgv} className="link-line text-bordeaux">
            CGV
          </Link>
        </p>
        {footer && <div className="mt-6 text-[13px] text-encre/55">{footer}</div>}
      </article>
    </div>
  );
}