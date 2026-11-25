"use client";
import { useState, type ReactNode } from "react";
import { Logotype, Symbol } from "@/components/brand/Symbol";
import { useStore, useToast } from "@/lib/app/store";
import { fmtDay } from "@/lib/app/rules";
import type { Profile } from "@/lib/app/types";
import LogoutButton from "./LogoutButton";
import { Avatar, Icon, cx } from "./ui";

export type ViewId =
  | "overview" | "agenda" | "reservations" | "tasks" | "team" | "boutique" | "events" | "finances" | "settings"
  | "today" | "week" | "off" | "notifications";

type NavItem = { id: ViewId; label: string; icon: string; soon?: boolean; mobile?: boolean };

export const NAV: Record<"admin" | "worker", NavItem[]> = {
  admin: [
    { id: "overview", label: "Vue d'ensemble", icon: "home", mobile: true },
    { id: "agenda", label: "Agenda", icon: "calendar", mobile: true },
    { id: "reservations", label: "Réservations", icon: "list", mobile: true },
    { id: "tasks", label: "Tâches", icon: "tasks", mobile: true },
    { id: "team", label: "Équipe", icon: "team", mobile: true },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "boutique", label: "Boutique", icon: "bag" },
    { id: "events", label: "Événements", icon: "spark" },
    { id: "finances", label: "Finances", icon: "euro", soon: true },
    { id: "settings", label: "Paramètres", icon: "gear", soon: true },
  ],
  worker: [
    { id: "today", label: "Aujourd'hui", icon: "home", mobile: true },
    { id: "week", label: "Ma semaine", icon: "calendar", mobile: true },
    { id: "tasks", label: "Tâches", icon: "tasks", mobile: true },
    { id: "off", label: "Indisponibilités", icon: "off", mobile: true },
    { id: "events", label: "Ateliers", icon: "spark", mobile: true },
    { id: "notifications", label: "Notifications", icon: "bell", mobile: true },
  ],
};

const PROFILE_LABEL: Record<Profile, { name: string; role: string; initials: string }> = {
  admin: { name: "Administratrice", role: "Pilotage du lieu", initials: "A" },
  lina: { name: "Lina", role: "Travailleuse", initials: "L" },
  t2: { name: "Travailleuse 2", role: "Travailleuse", initials: "T2" },
};

export default function Shell({ profile, view, go, children }: { profile: Profile; view: ViewId; go: (v: ViewId, p?: Profile) => void; children: ReactNode }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [menu, setMenu] = useState(false);
  const nav = NAV[profile === "admin" ? "admin" : "worker"];
  const unread = state.notifications.filter((n) => n.to === profile && !n.read).length;
  const me = PROFILE_LABEL[profile];
  const current = nav.find((n) => n.id === view);
  const pending = state.reservations.filter((r) => r.status === "a_affecter").length;
  const toValidate = state.tasks.filter((t) => t.status === "demandee" || t.status === "terminee").length;

  const badge = (id: ViewId) => {
    if (profile !== "admin") return id === "notifications" ? unread : 0;
    if (id === "reservations") return pending;
    if (id === "tasks") return toValidate;
    if (id === "notifications") return unread;
    return 0;
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      {/* ── Barre latérale (ordinateur) */}
      <aside className="sticky top-0 hidden h-dvh flex-col bg-encre text-ivoire lg:flex">
        <div className="flex items-center gap-3 px-6 pb-6 pt-7">
          <Symbol className="h-9 w-auto text-ivoire" />
          <div>
            <Logotype className="h-[15px] w-auto text-ivoire" title="Narcisse" />
            <p className="mt-1 text-[10.5px] tracking-[0.2em] text-ivoire/45 uppercase">{profile === "admin" ? "Administration" : "Espace équipe"}</p>
          </div>
        </div>
        <nav className="app-scroll flex-1 overflow-auto px-3" aria-label="Navigation principale">
          {nav.filter((n) => !n.soon).map((n) => (
            <NavButton key={n.id} item={n} active={view === n.id} count={badge(n.id)} onClick={() => go(n.id)} />
          ))}
          {nav.some((n) => n.soon) && (
            <>
              <p className="mt-6 mb-2 px-3 text-[10.5px] tracking-[0.2em] text-ivoire/35 uppercase">Prochains modules</p>
              {nav.filter((n) => n.soon).map((n) => (
                <NavButton key={n.id} item={n} active={view === n.id} onClick={() => go(n.id)} />
              ))}
            </>
          )}
        </nav>
        <div className="border-t border-ivoire/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
            <Avatar id={profile} label={me.initials} size={36} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium">{me.name}</p>
              <p className="text-[12px] text-ivoire/50">{me.role}</p>
            </div>
          </div>
          <LogoutButton variant="dark" className="mt-3" />
        </div>
      </aside>

      {/* ── Contenu */}
      <div className="flex min-h-dvh min-w-0 flex-col">
        <div className="flex items-center justify-center gap-3 bg-rose/50 px-4 py-1.5 text-center text-[11.5px] text-bordeaux">
          <span>Données de démonstration, enregistrées dans ce navigateur uniquement.</span>
          <button
            className="underline underline-offset-2 hover:no-underline"
            onClick={() => {
              dispatch({ type: "reset" });
              toast("Démo réinitialisée");
            }}
          >
            Réinitialiser
          </button>
        </div>

        <header className="sticky top-0 z-40 border-b border-encre/[0.07] bg-papier/85 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-8 lg:py-4">
            <Symbol className="h-7 w-auto text-encre lg:hidden" />
            <div className="min-w-0 flex-1">
              <p className="app-label hidden sm:block">{fmtDay(new Date())}</p>
              <h1 className="truncate font-serif text-[24px] leading-tight sm:text-[30px]">{current?.label}</h1>
            </div>
            <LogoutButton variant="light" className="hidden sm:inline-flex" />
            <button onClick={() => go("notifications")} className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-encre/5" aria-label={`Notifications (${unread} non lues)`}>
              <Icon name="bell" />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-bordeaux px-1 text-[10px] font-medium text-papier">{unread}</span>}
            </button>
            <button onClick={() => setMenu(true)} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-encre/5 lg:hidden" aria-label="Changer de profil">
              <Avatar id={profile} label={me.initials} size={32} />
              <Icon name="swap" size={15} />
            </button>
          </div>
        </header>

        <main id="app-main" className="flex-1 px-4 pb-28 pt-6 sm:px-8 lg:pb-12">
          {children}
        </main>
      </div>

      {/* ── Barre d'onglets (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-encre/10 bg-papier/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden" aria-label="Navigation">
        <ul className="mx-auto flex max-w-xl">
          {nav.filter((n) => n.mobile).map((n) => {
            const c = badge(n.id);
            return (
              <li key={n.id} className="flex-1">
                <button onClick={() => go(n.id)} className={cx("relative flex w-full flex-col items-center gap-1 py-2.5 text-[10.5px]", view === n.id ? "text-encre" : "text-encre/45")}>
                  <Icon name={n.icon} size={20} />
                  <span className="max-w-full truncate px-1">{n.label}</span>
                  {c > 0 && <span className="absolute left-1/2 top-1.5 ml-2 grid h-4 min-w-4 place-items-center rounded-full bg-bordeaux px-1 text-[10px] text-papier">{c}</span>}
                  {view === n.id && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-bordeaux" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {menu && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button className="app-fade absolute inset-0 bg-encre/40" onClick={() => setMenu(false)} aria-label="Fermer" />
          <div className="app-rise absolute inset-x-0 bottom-0 rounded-t-3xl bg-encre p-6 text-ivoire">
            <p className="mb-3 text-[10.5px] tracking-[0.2em] text-ivoire/45 uppercase">Session</p>
            <LogoutButton variant="dark" />
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ item, active, count = 0, onClick }: { item: NavItem; active: boolean; count?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "group relative mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors",
        active ? "bg-ivoire/[0.09] text-ivoire" : "text-ivoire/60 hover:bg-ivoire/[0.05] hover:text-ivoire",
      )}
      aria-current={active ? "page" : undefined}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-rose" />}
      <Icon name={item.icon} size={18} />
      <span className="flex-1">{item.label}</span>
      {item.soon && <span className="rounded-full border border-ivoire/15 px-2 py-0.5 text-[10px] text-ivoire/40">Bientôt</span>}
      {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-bordeaux px-1.5 text-[11px] text-papier">{count}</span>}
    </button>
  );
}

