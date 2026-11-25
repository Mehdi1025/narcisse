"use client";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowUpRight, Bell, CalendarDays, ChevronRight, ClipboardList, Euro, LayoutDashboard, ListChecks, Moon, RotateCcw, Search,
  Settings, ShoppingBag, Sparkles, Sun, UserRound, Users, type LucideIcon,
} from "lucide-react";
import { Logotype, Symbol } from "@/components/brand/Symbol";
import { useStore, useToast } from "@/lib/app/store";
import { clientOf, fmtDay, fmtShort, fmtTime, serviceOf } from "@/lib/app/rules";
import type { Profile } from "@/lib/app/types";
import type { ViewId } from "../../Shell";
import { Modal, cx } from "../../ui";
import LogoutButton from "../../LogoutButton";
import Backdrop from "./Backdrop";
import { formatCount, type CountFormat } from "./charts";

gsap.registerPlugin(useGSAP);

/** Photo du lieu à brancher ici quand elle existe (ex. "/photos/narcisse-salon.jpg"). */
const BACKDROP_IMAGE: string | null = null;
const THEME_KEY = "narcisse-admin-theme";

type Item = { id: ViewId; label: string; short: string; icon: LucideIcon; description: string; hint: string; soon?: boolean };
const VIEWS: Item[] = [
  { id: "overview", label: "Vue d'ensemble", short: "Accueil", icon: LayoutDashboard, description: "Ce qui se passe aujourd'hui et ce qui attend votre décision.", hint: "Chercher une cliente, une vue, une action…" },
  { id: "agenda", label: "Agenda", short: "Agenda", icon: CalendarDays, description: "Le planning de l'équipe, jour par jour.", hint: "Qui est libre demain après-midi ?" },
  { id: "reservations", label: "Réservations", short: "Résa.", icon: ClipboardList, description: "Toutes les réservations, en ligne et au comptoir.", hint: "Retrouver la réservation d'une cliente…" },
  { id: "tasks", label: "Tâches", short: "Tâches", icon: ListChecks, description: "Publier, attribuer et valider les tâches internes.", hint: "Quelles tâches sont à valider ?" },
  { id: "team", label: "Équipe", short: "Équipe", icon: Users, description: "Habilitations, compétences et indisponibilités.", hint: "Qui peut réaliser un browlift ?" },
  { id: "notifications", label: "Notifications", short: "Alertes", icon: Bell, description: "Demandes et alertes venant de l'équipe.", hint: "Quoi de neuf dans l'équipe ?" },
  { id: "boutique", label: "Boutique", short: "Boutique", icon: ShoppingBag, description: "Catalogue e-commerce : produits, vitrine et collection.", hint: "Ajouter ou publier un produit…" },
  { id: "events", label: "Événements", short: "Évén.", icon: Sparkles, description: "Ateliers et inscriptions — module à venir.", hint: "Module à venir", soon: true },
  { id: "finances", label: "Finances", short: "Finances", icon: Euro, description: "Encaissements et exports — module à venir.", hint: "Module à venir", soon: true },
  { id: "settings", label: "Paramètres", short: "Réglages", icon: Settings, description: "Horaires, prestations et comptes — module à venir.", hint: "Module à venir", soon: true },
];
const DOCK = VIEWS.filter((v) => ["overview", "agenda", "reservations", "tasks", "team", "boutique"].includes(v.id));

export default function GlassShell({ view, go, children }: { view: ViewId; go: (v: ViewId, p?: Profile) => void; children: ReactNode }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [palette, setPalette] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const leaving = useRef<gsap.core.Tween | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem(THEME_KEY);
      if (t === "dark" || t === "light") setTheme(t);
    } catch {}
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const toggleTheme = () => {
    const t = theme === "light" ? "dark" : "light";
    setTheme(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
  };

  const { contextSafe } = useGSAP({ scope: root });
  /** Navigation avec sortie floutée, puis entrée chorégraphiée. */
  const navigate = contextSafe((next: ViewId, p?: Profile) => {
    if (p || reduced || !content.current || next === view) return go(next, p);
    leaving.current?.kill();
    leaving.current = gsap.to(content.current, { opacity: 0, filter: "blur(8px)", duration: 0.14, ease: "power1.in", onComplete: () => go(next) });
  });

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [view]);

  useGSAP(
    () => {
      const layer = content.current;
      if (!layer) return;
      const counts = layer.querySelectorAll<HTMLElement>("[data-nx-count]");
      gsap.set(layer, { clearProps: "opacity,filter" });
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(layer, { opacity: 0.5, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.34, clearProps: "opacity,filter" }, 0);
      const cards = layer.querySelectorAll(".app-card");
      if (cards.length) tl.from(cards, { y: 18, opacity: 0, stagger: 0.045, duration: 0.5, clearProps: "transform,opacity" }, 0.04);
      const bars = layer.querySelectorAll(".nx-bar");
      if (bars.length) tl.from(bars, { scaleY: 0, stagger: 0.035, duration: 0.5, clearProps: "transform" }, 0.18);
      const grow = layer.querySelectorAll(".nx-grow");
      if (grow.length) tl.from(grow, { scaleX: 0, stagger: 0.04, duration: 0.6, clearProps: "transform" }, 0.2);
      const ring = layer.querySelectorAll(".nx-ring-draw");
      if (ring.length) tl.fromTo(ring, { attr: { "stroke-dasharray": "0 100" } }, { attr: { "stroke-dasharray": "100 0" }, duration: 0.8 }, 0.16);
      counts.forEach((el, i) => {
        const value = Number(el.dataset.nxCount);
        const fmt = formatCount[(el.dataset.format as CountFormat) ?? "number"];
        const c = { v: 0 };
        tl.to(c, { v: value, duration: 0.8, onUpdate: () => (el.textContent = fmt(c.v)), onComplete: () => (el.textContent = fmt(value)) }, 0.1 + i * 0.02);
      });
    },
    { scope: content, dependencies: [view, reduced], revertOnUpdate: true },
  );

  const current = VIEWS.find((v) => v.id === view) ?? VIEWS[0];
  const unread = state.notifications.filter((n) => n.to === "admin" && !n.read).length;
  const badge = (id: ViewId) =>
    id === "reservations" ? state.reservations.filter((r) => r.status === "a_affecter").length : id === "tasks" ? state.tasks.filter((t) => t.status === "demandee" || t.status === "terminee").length : 0;

  return (
    <div ref={root} className="nx-glass" data-theme={theme}>
      <Backdrop theme={theme} image={BACKDROP_IMAGE} />

      <div className="mx-auto w-[min(calc(100%-24px),1400px)] pb-[calc(84px+env(safe-area-inset-bottom))] pt-3 sm:w-[min(calc(100%-100px),1400px)] sm:pt-6 md:pb-4">
        {/* ── Barre supérieure */}
        <header className="nx-rail grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-[22px] px-2.5 py-2 md:grid-cols-[minmax(0,1fr)_minmax(240px,420px)_minmax(0,1fr)] md:rounded-full md:py-1.5 md:pl-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="nx-pick grid h-10 w-10 shrink-0 place-items-center rounded-full">
              <Symbol className="h-6 w-auto" title="Narcisse" />
            </span>
            <div className="min-w-0">
              <Logotype className="h-[13px] w-auto text-encre" title="Narcisse" />
              <p className="mt-1 truncate text-[10.5px] uppercase tracking-[0.2em] text-encre/55">Administration</p>
            </div>
          </div>

          <button onClick={() => setPalette(true)} className="nx-inner col-span-2 flex h-11 min-w-0 items-center gap-2.5 rounded-full pl-2 pr-4 text-left transition-colors hover:bg-[var(--nx-raised)] md:col-span-1" aria-label="Rechercher (Ctrl K)">
            <span className="nx-orb" aria-hidden />
            <span key={view} className="nx-prompt min-w-0 flex-1 text-[13px] text-encre/80">{current.hint}</span>
            <kbd className="hidden rounded-md border border-[var(--nx-line)] px-1.5 text-[10.5px] text-encre/45 lg:inline">Ctrl K</kbd>
            <Search size={15} className="text-encre/55" aria-hidden />
          </button>

          <div className="col-start-2 row-start-1 flex justify-end gap-1.5 md:col-start-3">
            <button onClick={toggleTheme} className="nx-inner grid h-11 w-11 place-items-center rounded-full hover:bg-[var(--nx-raised)]" aria-label={theme === "light" ? "Passer en mode nuit" : "Passer en mode aube"} title={theme === "light" ? "Mode nuit" : "Mode aube"}>
              {theme === "light" ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
            </button>
            <button onClick={() => navigate("notifications")} className="nx-raised relative grid h-11 w-11 place-items-center rounded-full border border-[var(--nx-line)]" aria-label={`Notifications (${unread} non lues)`}>
              <Bell size={17} strokeWidth={1.75} />
              {unread > 0 && <i className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#96433a] ring-2 ring-[var(--nx-surface)]" />}
            </button>
            <LogoutButton variant="glass" />
          </div>
        </header>

        {/* ── Scène */}
        <div className="relative mt-3">
          <Dock side active={view} badge={badge} select={navigate} />
          <main className="nx-stage">
            <div ref={scroller} className="nx-stage-scroll">
              <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="app-label first-letter:uppercase">{fmtDay(new Date())}</p>
                  <h1 className="mt-2 font-serif text-[clamp(34px,4vw,56px)] font-medium leading-[0.98] tracking-[-0.02em]">{current.label}</h1>
                  <p className="mt-2 text-[13.5px] text-encre/65">{current.description}</p>
                </div>
              </header>
              <div ref={content} key={view}>
                {children}
              </div>
            </div>
          </main>
          <Dock active={view} badge={badge} select={navigate} />
        </div>

        {/* ── Pied : mode démo */}
        <footer className="mt-9 flex flex-wrap items-center justify-between gap-2 max-md:mt-4">
          <div className="nx-raised flex items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px]">
            Données de démonstration
            <button
              className="inline-flex items-center gap-1 text-bordeaux underline-offset-2 hover:underline"
              onClick={() => {
                dispatch({ type: "reset" });
                toast("Démo réinitialisée");
              }}
            >
              <RotateCcw size={12} /> Réinitialiser
            </button>
          </div>
          <div className="nx-raised flex items-center gap-1 rounded-full p-1 text-[11.5px]">
            <span className="px-2 text-encre/55">Voir en tant que</span>
            <span className="rounded-full bg-encre px-3 py-1 text-ivoire">Admin</span>
            <button onClick={() => navigate("today", "lina")} className="rounded-full px-3 py-1 hover:bg-encre/[0.06]">Lina</button>
            <button onClick={() => navigate("today", "t2")} className="rounded-full px-3 py-1 hover:bg-encre/[0.06]">Trav. 2</button>
          </div>
        </footer>
      </div>

      <Palette open={palette} close={() => setPalette(false)} go={navigate} />
      <div id="nx-layer" />
    </div>
  );
}

function Dock({ active, side, badge, select }: { active: ViewId; side?: boolean; badge: (id: ViewId) => number; select: (v: ViewId) => void }) {
  const nav = useRef<HTMLElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const box = nav.current;
    const ind = marker.current;
    if (!box || !ind) return;
    const adjust = () => {
      const cur = box.querySelector<HTMLElement>('[aria-current="page"]');
      if (!cur) {
        ind.style.width = "0px";
        return;
      }
      ind.style.width = `${cur.offsetWidth}px`;
      ind.style.height = `${cur.offsetHeight}px`;
      ind.style.transform = `translate(${cur.offsetLeft}px, ${cur.offsetTop}px)`;
      ind.dataset.ready = "true";
    };
    const ro = new ResizeObserver(adjust);
    ro.observe(box);
    box.querySelectorAll("a").forEach((a) => ro.observe(a));
    adjust();
    return () => ro.disconnect();
  }, [active]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>, id: ViewId) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    select(id);
  };

  return (
    <nav ref={nav} className={cx("nx-rail nx-dock", side ? "nx-dock-side" : "nx-dock-bottom")} aria-label={side ? "Raccourcis" : "Navigation de l'espace"}>
      <span ref={marker} className="nx-dock-indicator" aria-hidden />
      {DOCK.map(({ id, label, short, icon: Icon }) => {
        const n = badge(id);
        return (
          <a key={id} className="nx-dock-link" href={`#admin/${id}`} aria-label={label} aria-current={active === id ? "page" : undefined} onClick={(e) => onClick(e, id)}>
            <Icon size={17} strokeWidth={1.8} aria-hidden />
            <span className="nx-dock-text" aria-hidden>{label}</span>
            <span className="nx-dock-short" aria-hidden>{short}</span>
            {side && <span className="nx-dock-tip" aria-hidden>{label}</span>}
            {n > 0 && <span className="nx-dock-badge" aria-hidden>{n}</span>}
          </a>
        );
      })}
    </nav>
  );
}

/** Recherche rapide : vues, clientes, actions. */
function Palette({ open, close, go }: { open: boolean; close: () => void; go: (v: ViewId, p?: Profile) => void }) {
  const { state } = useStore();
  const [q, setQ] = useState("");
  useEffect(() => {
    if (open) setQ("");
  }, [open]);
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const match = (s: string) => terms.every((t) => s.toLowerCase().includes(t));
  const views = VIEWS.filter((v) => match(`${v.label} ${v.description}`));
  const resas = terms.length
    ? state.reservations
        .filter((r) => r.status !== "annulee" && match(`${clientOf(state, r.clientId)?.name} ${serviceOf(state, r.serviceId)?.name}`))
        .sort((a, b) => a.start.localeCompare(b.start))
        .slice(0, 5)
    : [];
  const profiles = [
    { p: "lina" as const, label: "Voir l'espace de Lina" },
    { p: "t2" as const, label: "Voir l'espace de Travailleuse 2" },
  ].filter((x) => match(x.label));
  const pick = (v: ViewId, p?: Profile) => {
    close();
    go(v, p);
  };
  const row = "flex w-full items-center gap-3 rounded-xl border border-[var(--nx-line)] bg-[var(--nx-inner)] px-3 py-2.5 text-left hover:bg-[var(--nx-raised)]";
  return (
    <Modal open={open} onClose={close} title="Rechercher">
      <label className="mb-3 flex items-center gap-2 rounded-xl border border-encre/15 bg-voile px-3 focus-within:ring-2 focus-within:ring-rose/60">
        <Search size={15} className="text-encre/50" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Une vue, une cliente, une prestation…" className="h-11 flex-1 bg-transparent text-[14px]" style={{ outline: "none" }} aria-label="Rechercher" />
      </label>
      <div className="grid max-h-[55vh] gap-1.5 overflow-auto">
        {resas.length > 0 && <p className="app-label mt-1">Réservations</p>}
        {resas.map((r) => (
          <button key={r.id} className={row} onClick={() => pick("reservations")}>
            <UserRound size={16} className="text-encre/55" />
            <span className="flex-1">
              <strong className="block text-[13.5px] font-medium">{clientOf(state, r.clientId)?.name}</strong>
              <small className="text-[12px] text-encre/55">{serviceOf(state, r.serviceId)?.name} · {fmtShort(r.start)} {fmtTime(r.start)}</small>
            </span>
            <ChevronRight size={15} className="text-encre/40" />
          </button>
        ))}
        {views.length > 0 && <p className="app-label mt-1">Vues</p>}
        {views.map(({ id, label, description, icon: Icon, soon }) => (
          <button key={id} className={row} onClick={() => pick(id)}>
            <Icon size={16} className="text-encre/55" />
            <span className="flex-1">
              <strong className="block text-[13.5px] font-medium">{label}{soon && <span className="ml-2 text-[11px] font-normal text-encre/45">Bientôt</span>}</strong>
              <small className="text-[12px] text-encre/55">{description}</small>
            </span>
            <ChevronRight size={15} className="text-encre/40" />
          </button>
        ))}
        {profiles.length > 0 && <p className="app-label mt-1">Démo</p>}
        {profiles.map((x) => (
          <button key={x.p} className={row} onClick={() => pick("today", x.p)}>
            <ArrowUpRight size={16} className="text-encre/55" />
            <span className="flex-1 text-[13.5px]">{x.label}</span>
          </button>
        ))}
        {!views.length && !resas.length && !profiles.length && <p className="py-4 text-center text-[13px] text-encre/50">Aucun résultat.</p>}
      </div>
    </Modal>
  );
}
