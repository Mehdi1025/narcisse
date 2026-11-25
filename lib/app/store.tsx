"use client";
// Store de démonstration : état local + persistance navigateur + synchro entre onglets.
// À remplacer par l'API (Server Actions / base de données) au Lot 4 — les actions gardent les mêmes noms.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { canAssign, canTake, clientOf, impactedBy, serviceOf, workerName, addMin, fmtShort, fmtTime } from "./rules";
import { createSeed, STATE_VERSION } from "./seed";
import type { AppState, Priority, Profile, Reservation, Task, WorkerId } from "./types";

const KEY = "narcisse-demo-state";
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const now = () => new Date().toISOString();

export type Action =
  | { type: "assign"; id: string; workerId: WorkerId; by: Profile }
  | { type: "cancelReservation"; id: string; by: Profile }
  | { type: "createReservation"; clientName: string; serviceId: string; start: string; preference: WorkerId | null }
  | { type: "setReservationStatus"; id: string; status: Reservation["status"]; by: Profile }
  | { type: "publishTask"; task: { title: string; description: string; pole: Task["pole"]; skill: string | null; priority: Priority; due: string; requiresValidation: boolean } }
  | { type: "takeTask"; id: string; workerId: WorkerId }
  | { type: "decideTask"; id: string; approve: boolean }
  | { type: "assignTask"; id: string; workerId: WorkerId }
  | { type: "setTaskStatus"; id: string; status: Task["status"]; by: Profile }
  | { type: "requestOff"; workerId: WorkerId; start: string; end: string; reason: string }
  | { type: "decideOff"; id: string; approve: boolean }
  | { type: "toggleService"; workerId: WorkerId; serviceId: string }
  | { type: "toggleSkill"; workerId: WorkerId; skill: string }
  | { type: "incident"; by: WorkerId; text: string }
  | { type: "readAll"; to: Profile }
  | { type: "replace"; state: AppState }
  | { type: "reset" };

function notify(s: AppState, to: Profile, text: string): AppState {
  return { ...s, notifications: [{ id: uid("n"), to, text, at: now(), read: false }, ...s.notifications].slice(0, 80) };
}
function log(s: AppState, actor: Profile | "systeme", text: string): AppState {
  return { ...s, log: [{ id: uid("l"), at: now(), actor, text }, ...s.log].slice(0, 120) };
}
const who = (s: AppState, p: Profile) => (p === "admin" ? "L'administratrice" : workerName(s, p));

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case "assign": {
      const r = s.reservations.find((x) => x.id === a.id);
      if (!r || !canAssign(s, a.workerId, r).ok) return s;
      let n: AppState = { ...s, reservations: s.reservations.map((x) => (x.id === a.id ? { ...x, workerId: a.workerId, status: "confirmee" } : x)) };
      const c = clientOf(s, r.clientId)?.name;
      const sv = serviceOf(s, r.serviceId)?.name;
      n = notify(n, a.workerId, `Rendez-vous affecté : ${c}, ${sv?.toLowerCase()} — ${fmtShort(r.start)} à ${fmtTime(r.start)}.`);
      return log(n, a.by, `${sv} de ${c} (${fmtShort(r.start)} ${fmtTime(r.start)}) affecté à ${workerName(s, a.workerId)}.`);
    }
    case "cancelReservation": {
      const r = s.reservations.find((x) => x.id === a.id);
      if (!r) return s;
      let n: AppState = { ...s, reservations: s.reservations.map((x) => (x.id === a.id ? { ...x, status: "annulee" } : x)) };
      if (r.workerId) n = notify(n, r.workerId, `Annulation : ${clientOf(s, r.clientId)?.name}, ${fmtShort(r.start)} à ${fmtTime(r.start)}.`);
      return log(n, a.by, `Réservation de ${clientOf(s, r.clientId)?.name} annulée.`);
    }
    case "createReservation": {
      const sv = serviceOf(s, a.serviceId);
      if (!sv) return s;
      const existing = s.clients.find((c) => c.name.toLowerCase() === a.clientName.trim().toLowerCase());
      const client = existing ?? { id: uid("c"), name: a.clientName.trim(), phone: "—" };
      const r: Reservation = {
        id: uid("r"), clientId: client.id, serviceId: sv.id, start: a.start, end: addMin(a.start, sv.duration),
        workerId: null, preference: a.preference, status: "a_affecter", source: "comptoir", createdAt: now(),
      };
      let n: AppState = { ...s, clients: existing ? s.clients : [...s.clients, client], reservations: [...s.reservations, r] };
      if (a.preference && canAssign(n, a.preference, r).ok) {
        n = { ...n, reservations: n.reservations.map((x) => (x.id === r.id ? { ...x, workerId: a.preference, status: "confirmee" } : x)) };
        n = notify(n, a.preference, `Nouvelle réservation : ${client.name}, ${sv.name.toLowerCase()} — ${fmtShort(r.start)} à ${fmtTime(r.start)}.`);
        return log(n, "admin", `Réservation au comptoir : ${client.name}, ${sv.name} avec ${workerName(s, a.preference)}.`);
      }
      return log(n, "admin", `Réservation au comptoir : ${client.name}, ${sv.name} — en attente d'affectation.`);
    }
    case "setReservationStatus": {
      const r = s.reservations.find((x) => x.id === a.id);
      if (!r) return s;
      const n: AppState = { ...s, reservations: s.reservations.map((x) => (x.id === a.id ? { ...x, status: a.status } : x)) };
      const label = { en_cours: "démarré", terminee: "terminé", absence: "marqué absent", confirmee: "confirmé", annulee: "annulé", a_affecter: "remis en attente" }[a.status];
      const m = log(n, a.by, `${who(s, a.by)} : rendez-vous de ${clientOf(s, r.clientId)?.name} ${label}.`);
      return a.status === "absence" ? notify(m, "admin", `Absence signalée : ${clientOf(s, r.clientId)?.name} (${fmtTime(r.start)}).`) : m;
    }
    case "publishTask": {
      const t: Task = { ...a.task, id: uid("t"), status: "disponible", assignee: null, createdAt: now() };
      let n: AppState = { ...s, tasks: [t, ...s.tasks] };
      for (const w of s.workers) if (!t.skill || w.skills.includes(t.skill)) n = notify(n, w.id, `Nouvelle tâche disponible : « ${t.title} ».`);
      return log(n, "admin", `Tâche publiée : « ${t.title} ».`);
    }
    case "takeTask": {
      const t = s.tasks.find((x) => x.id === a.id);
      const w = s.workers.find((x) => x.id === a.workerId);
      if (!t || !w || !canTake(w, t).ok) return s;
      const status = t.requiresValidation ? "demandee" : "attribuee";
      let n: AppState = { ...s, tasks: s.tasks.map((x) => (x.id === a.id ? { ...x, status, assignee: a.workerId } : x)) };
      n = notify(n, "admin", t.requiresValidation ? `${w.name} demande la tâche « ${t.title} ».` : `${w.name} a pris la tâche « ${t.title} ».`);
      return log(n, a.workerId, `${w.name} ${t.requiresValidation ? "demande" : "prend"} « ${t.title} ».`);
    }
    case "decideTask": {
      const t = s.tasks.find((x) => x.id === a.id);
      if (!t || t.status !== "demandee" || !t.assignee) return s;
      let n: AppState = { ...s, tasks: s.tasks.map((x) => (x.id === a.id ? (a.approve ? { ...x, status: "attribuee" } : { ...x, status: "disponible", assignee: null }) : x)) };
      n = notify(n, t.assignee, a.approve ? `Tâche validée pour vous : « ${t.title} ».` : `Demande refusée : « ${t.title} ».`);
      return log(n, "admin", `Demande de ${workerName(s, t.assignee)} sur « ${t.title} » ${a.approve ? "acceptée" : "refusée"}.`);
    }
    case "assignTask": {
      const t = s.tasks.find((x) => x.id === a.id);
      if (!t) return s;
      let n: AppState = { ...s, tasks: s.tasks.map((x) => (x.id === a.id ? { ...x, status: "attribuee", assignee: a.workerId } : x)) };
      n = notify(n, a.workerId, `Tâche attribuée : « ${t.title} ».`);
      return log(n, "admin", `« ${t.title} » attribuée à ${workerName(s, a.workerId)}.`);
    }
    case "setTaskStatus": {
      const t = s.tasks.find((x) => x.id === a.id);
      if (!t) return s;
      const back = a.status === "en_cours" && t.status === "terminee";
      let n: AppState = { ...s, tasks: s.tasks.map((x) => (x.id === a.id ? { ...x, status: a.status } : x)) };
      if (a.status === "terminee") n = notify(n, "admin", `${workerName(s, t.assignee)} a terminé « ${t.title} » — à valider.`);
      if (a.status === "validee" && t.assignee) n = notify(n, t.assignee, `Tâche validée : « ${t.title} ». Merci !`);
      if (back && t.assignee) n = notify(n, t.assignee, `« ${t.title} » est à reprendre.`);
      const label = { en_cours: back ? "renvoyée à reprendre" : "démarrée", terminee: "terminée", validee: "validée", disponible: "remise en disponible", demandee: "demandée", attribuee: "attribuée" }[a.status];
      return log(n, a.by, `« ${t.title} » ${label}.`);
    }
    case "requestOff": {
      const u = { id: uid("u"), workerId: a.workerId, start: a.start, end: a.end, reason: a.reason, status: "en_attente" as const };
      const imp = impactedBy(s, a.workerId, a.start, a.end).length;
      let n: AppState = { ...s, unavailabilities: [u, ...s.unavailabilities] };
      n = notify(n, "admin", `${workerName(s, a.workerId)} déclare une indisponibilité (${fmtShort(a.start)})${imp ? ` — ${imp} rendez-vous impacté(s)` : ""}.`);
      return log(n, a.workerId, `Indisponibilité déclarée par ${workerName(s, a.workerId)}.`);
    }
    case "decideOff": {
      const u = s.unavailabilities.find((x) => x.id === a.id);
      if (!u) return s;
      let n: AppState = { ...s, unavailabilities: s.unavailabilities.map((x) => (x.id === a.id ? { ...x, status: a.approve ? "validee" : "refusee" } : x)) };
      if (a.approve) {
        // RG-10 : les rendez-vous touchés repartent dans la file d'affectation.
        const ids = impactedBy(s, u.workerId, u.start, u.end).map((r) => r.id);
        n = { ...n, reservations: n.reservations.map((r) => (ids.includes(r.id) ? { ...r, workerId: null, status: "a_affecter", note: `Réaffectation suite à l'indisponibilité de ${workerName(s, u.workerId)}` } : r)) };
      }
      n = notify(n, u.workerId, `Indisponibilité du ${fmtShort(u.start)} ${a.approve ? "validée" : "refusée"}.`);
      return log(n, "admin", `Indisponibilité de ${workerName(s, u.workerId)} ${a.approve ? "validée" : "refusée"}.`);
    }
    case "toggleService":
    case "toggleSkill": {
      const field = a.type === "toggleService" ? "services" : "skills";
      const value = a.type === "toggleService" ? a.serviceId : a.skill;
      const n: AppState = {
        ...s,
        workers: s.workers.map((w) => (w.id === a.workerId ? { ...w, [field]: w[field].includes(value) ? w[field].filter((x) => x !== value) : [...w[field], value] } : w)),
      };
      const label = a.type === "toggleService" ? serviceOf(s, value)?.name : value;
      const w = n.workers.find((x) => x.id === a.workerId)!;
      return log(n, "admin", `${label} ${w[field].includes(value) ? "ajouté(e) à" : "retiré(e) de"} ${w.name}.`);
    }
    case "incident": {
      const n = notify(s, "admin", `Incident signalé par ${workerName(s, a.by)} : ${a.text}`);
      return log(n, a.by, `Incident signalé par ${workerName(s, a.by)} : ${a.text}`);
    }
    case "readAll":
      return { ...s, notifications: s.notifications.map((x) => (x.to === a.to ? { ...x, read: true } : x)) };
    case "replace":
      return a.state;
    case "reset":
      return createSeed();
  }
}

type Ctx = { state: AppState; dispatch: (a: Action) => void };
const StoreCtx = createContext<Ctx | null>(null);

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.version === STATE_VERSION) return parsed;
    }
  } catch {}
  return createSeed();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatchRaw] = useReducer(reducer, undefined, load);
  const skipSave = useRef(false);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        skipSave.current = true;
        dispatchRaw({ type: "replace", state: JSON.parse(e.newValue) });
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const dispatch = useCallback((a: Action) => dispatchRaw(a), []);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore hors StoreProvider");
  return c;
}

/** Toasts éphémères (retour d'action). */
type Toast = { id: string; text: string; tone: "ok" | "warn" };
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = uid("toast");
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`app-toast rounded-full px-5 py-2.5 text-[13px] shadow-lg ${t.tone === "ok" ? "bg-encre text-ivoire" : "bg-bordeaux text-papier"}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
