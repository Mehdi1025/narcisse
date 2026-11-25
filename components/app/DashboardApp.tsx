"use client";
import { useCallback, useEffect, useState } from "react";
import { StoreProvider, ToastProvider } from "@/lib/app/store";
import type { Profile } from "@/lib/app/types";
import Shell, { NAV, type ViewId } from "./Shell";
import GlassShell from "./admin/glass/GlassShell";
import Overview from "./admin/Overview";
import AdminAgenda from "./admin/Agenda";
import Reservations from "./admin/Reservations";
import AdminTasks from "./admin/Tasks";
import Team from "./admin/Team";
import Soon from "./Soon";
import Today from "./worker/Today";
import Week from "./worker/Week";
import WorkerTasks from "./worker/Tasks";
import Unavailability from "./worker/Unavailability";
import Notifications from "./Notifications";

/** Lit la vue dans l'ancre « #profil/vue » ; le profil reste celui de la page (/dashboard_lina, etc.). */
function readHash(lockedProfile: Profile): { profile: Profile; view: ViewId } {
  const [, v] = window.location.hash.replace(/^#\/?/, "").split("/");
  const views = NAV[lockedProfile === "admin" ? "admin" : "worker"].map((n) => n.id);
  const view = views.includes(v as ViewId) ? (v as ViewId) : views[0];
  return { profile: lockedProfile, view };
}

export default function DashboardApp({ initialProfile }: { initialProfile: Profile }) {
  // Rendu uniquement côté navigateur : les données de démo dépendent de la date du jour et du stockage local.
  const [mounted, setMounted] = useState(false);
  const [route, setRoute] = useState<{ profile: Profile; view: ViewId }>({ profile: initialProfile, view: initialProfile === "admin" ? "overview" : "today" });

  useEffect(() => {
    setRoute(readHash(initialProfile));
    setMounted(true);
    const onHash = () => setRoute(readHash(initialProfile));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [initialProfile]);

  useEffect(() => {
    if (!mounted) return;
    const hash = `#${route.profile}/${route.view}`;
    if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
  }, [mounted, route.profile, route.view]);

  useEffect(() => {
    if (!mounted) return;
    document.getElementById("app-main")?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [mounted, route.profile, route.view]);

  const go = useCallback((view: ViewId, profile?: Profile) => {
    setRoute((r) => ({ profile: profile ?? r.profile, view }));
  }, []);

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center bg-encre text-ivoire/60">
        <p className="app-label !text-ivoire/50">Chargement de l&apos;espace…</p>
      </div>
    );
  }

  const { profile, view } = route;
  const worker = profile === "admin" ? null : profile;

  return (
    <StoreProvider>
      <ToastProvider>
        <Frame profile={profile} view={view} go={go}>
          <div key={`${profile}-${view}`} className="app-fade">
            {profile === "admin" && view === "overview" && <Overview go={go} />}
            {profile === "admin" && view === "agenda" && <AdminAgenda />}
            {profile === "admin" && view === "reservations" && <Reservations />}
            {profile === "admin" && view === "tasks" && <AdminTasks />}
            {profile === "admin" && view === "team" && <Team />}
            {profile === "admin" && ["boutique", "events", "finances", "settings"].includes(view) && <Soon view={view} />}
            {worker && view === "today" && <Today me={worker} go={go} />}
            {worker && view === "week" && <Week me={worker} />}
            {worker && view === "tasks" && <WorkerTasks me={worker} />}
            {worker && view === "off" && <Unavailability me={worker} />}
            {view === "notifications" && <Notifications me={profile} />}
          </div>
        </Frame>
      </ToastProvider>
    </StoreProvider>
  );
}

/** L'administratrice a l'interface « verre égéen » ; les travailleuses gardent l'interface mobile. */
function Frame({ profile, view, go, children }: { profile: Profile; view: ViewId; go: (v: ViewId, p?: Profile) => void; children: React.ReactNode }) {
  return profile === "admin" ? <GlassShell view={view} go={go}>{children}</GlassShell> : <Shell profile={profile} view={view} go={go}>{children}</Shell>;
}
