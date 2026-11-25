"use client";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Count, type CountFormat } from "./admin/glass/charts";
import type { Pole, ReservationStatus, TaskStatus, WorkerId } from "@/lib/app/types";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** Couleur d'identification de chaque travailleuse (choix d'interface, ajustable). */
export const WORKER_TONE: Record<WorkerId, { bg: string; soft: string; text: string; ring: string; hex: string }> = {
  lina: { bg: "bg-bordeaux", soft: "bg-bordeaux/10", text: "text-bordeaux", ring: "ring-bordeaux/30", hex: "#96433A" },
  t2: { bg: "bg-egeen", soft: "bg-egeen/10", text: "text-egeen", ring: "ring-egeen/30", hex: "#4F6788" },
};

export const POLE: Record<Pole | "transverse", { label: string; dot: string }> = {
  mentale: { label: "Santé mentale", dot: "bg-egeen" },
  physique: { label: "Santé physique", dot: "bg-rose" },
  sociale: { label: "Santé sociale", dot: "bg-sauge" },
  transverse: { label: "Transverse", dot: "bg-gris/50" },
};

export function Avatar({ id, label, size = 32 }: { id: WorkerId | "admin"; label: string; size?: number }) {
  const tone = id === "admin" ? "bg-rose text-encre" : `${WORKER_TONE[id].bg} text-papier`;
  return (
    <span className={cx("inline-grid shrink-0 place-items-center rounded-full font-medium", tone)} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden>
      {label}
    </span>
  );
}

export function Card({ children, className, title, action, eyebrow }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode; eyebrow?: string }) {
  return (
    <section className={cx("app-card app-rise p-5", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {eyebrow && <p className="app-label mb-1">{eyebrow}</p>}
            {title && <h2 className="font-serif text-[22px] leading-tight">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

type BtnProps = { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "soft" | "danger"; size?: "sm" | "md"; disabled?: boolean; title?: string; type?: "button" | "submit"; className?: string };
export function Button({ children, onClick, variant = "primary", size = "md", disabled, title, type = "button", className }: BtnProps) {
  const v = {
    primary: "bg-encre text-ivoire hover:bg-bordeaux",
    ghost: "border border-encre/15 text-encre hover:border-encre/40 hover:bg-encre/[0.03]",
    soft: "bg-encre/[0.06] text-encre hover:bg-encre/10",
    danger: "border border-bordeaux/30 text-bordeaux hover:bg-bordeaux hover:text-papier",
  }[variant];
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-35",
        size === "sm" ? "h-8 px-3.5 text-[12.5px]" : "h-10 px-5 text-[13.5px]",
        v,
        className,
      )}
    >
      {children}
    </button>
  );
}

const RES_STATUS: Record<ReservationStatus, { label: string; cls: string }> = {
  a_affecter: { label: "À affecter", cls: "bg-bordeaux/10 text-bordeaux" },
  confirmee: { label: "Confirmé", cls: "bg-egeen/10 text-egeen" },
  en_cours: { label: "En cours", cls: "bg-sauge/20 text-sauge-fonce" },
  terminee: { label: "Terminé", cls: "bg-encre/[0.06] text-encre/60" },
  annulee: { label: "Annulé", cls: "bg-encre/[0.04] text-encre/40 line-through" },
  absence: { label: "Absente", cls: "bg-rose/40 text-bordeaux" },
};
const TASK_STATUS: Record<TaskStatus, { label: string; cls: string }> = {
  disponible: { label: "Disponible", cls: "bg-sauge/20 text-sauge-fonce" },
  demandee: { label: "Demandée", cls: "bg-rose/40 text-bordeaux" },
  attribuee: { label: "Attribuée", cls: "bg-egeen/10 text-egeen" },
  en_cours: { label: "En cours", cls: "bg-egeen/15 text-egeen" },
  terminee: { label: "À valider", cls: "bg-bordeaux/10 text-bordeaux" },
  validee: { label: "Validée", cls: "bg-encre/[0.06] text-encre/60" },
};
export function StatusBadge({ kind, status }: { kind: "res"; status: ReservationStatus } | { kind: "task"; status: TaskStatus }) {
  const s = kind === "res" ? RES_STATUS[status as ReservationStatus] : TASK_STATUS[status as TaskStatus];
  return <span className={cx("inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-medium whitespace-nowrap", s.cls)}>{s.label}</span>;
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex h-6 items-center gap-1.5 rounded-full bg-encre/[0.05] px-2.5 text-[11.5px] text-encre/70 whitespace-nowrap", className)}>{children}</span>;
}

export function PoleDot({ pole }: { pole: Pole | "transverse" }) {
  return <span className={cx("inline-block h-2 w-2 rounded-full", POLE[pole].dot)} title={POLE[pole].label} />;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-encre/15 px-4 py-6 text-center text-[13px] text-encre/50">{children}</p>;
}

export function Stat({ label, value, format, hint, tone, className, icon }: { label: string; value: ReactNode | number; format?: CountFormat; hint?: ReactNode; tone?: string; className?: string; icon?: ReactNode }) {
  return (
    <div className={cx("app-card app-rise p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="app-label">{label}</p>
        {icon && <span className="nx-inner grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border-0">{icon}</span>}
      </div>
      <p className={cx("mt-2 font-serif text-[40px] leading-none", tone)}>{typeof value === "number" ? <Count value={value} format={format} /> : value}</p>
      {hint && <p className="mt-2 text-[12.5px] text-encre/55">{hint}</p>}
    </div>
  );
}

export function Meter({ value, color = "bg-encre" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-encre/[0.07]">
      <div className={cx("nx-grow h-full rounded-full transition-[width] duration-700", color)} style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}

/** Calques (fenêtres) rendus hors des surfaces floutées : un parent avec backdrop-filter piégerait `position: fixed`. */
function Layer({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.getElementById("nx-layer") ?? document.body), []);
  return host ? createPortal(children, host) : null;
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <Layer>
    <div className="fixed inset-0 z-[70] grid place-items-end sm:place-items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="app-fade absolute inset-0 bg-encre/40 backdrop-blur-[2px]" onClick={onClose} aria-label="Fermer" />
      <div className={cx("app-rise app-scroll relative max-h-[92dvh] w-full overflow-auto rounded-t-3xl bg-papier p-6 shadow-2xl sm:rounded-3xl", wide ? "sm:max-w-2xl" : "sm:max-w-lg")}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-[26px]">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-encre/5" aria-label="Fermer">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
    </Layer>
  );
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <Layer>
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
      <button className="app-fade absolute inset-0 bg-encre/30" onClick={onClose} aria-label="Fermer" />
      <aside className="app-drawer app-scroll absolute inset-y-0 right-0 w-full max-w-md overflow-auto bg-papier p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-[26px]">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-encre/5" aria-label="Fermer">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </aside>
    </div>
    </Layer>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label className="block">
      <span className="app-label mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-encre/55">{hint}</span>}
    </label>
  );
}

const PATHS: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v4M16 3v4",
  list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  check: "M4 12.5 9 17.5 20 6.5",
  tasks: "M9 6h12M9 12h12M9 18h12M3 6l1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17",
  team: "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM22 19v-1a4 4 0 0 0-3-3.87M16 3.13a3.5 3.5 0 0 1 0 6.75",
  bag: "M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  euro: "M18 7a7 7 0 1 0 0 10M4 10h10M4 14h10",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  off: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5.6 5.6l12.8 12.8",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevronL: "M15 6l-6 6 6 6",
  chevronR: "M9 6l6 6-6 6",
  play: "M7 5v14l11-7z",
  alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  swap: "M7 7h13l-4-4M17 17H4l4 4",
  journal: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11",
  menu: "M4 7h16M4 12h16M4 17h16",
  undo: "M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-2",
};
export function Icon({ name, size = 18, className }: { name: keyof typeof PATHS | string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}
