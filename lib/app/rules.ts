// Règles métier (fonctions pures, réutilisables côté serveur plus tard).
import type { AppState, Reservation, Service, Task, Worker, WorkerId } from "./types";

/** Temps tampon entre deux rendez-vous (minutes) — hypothèse à valider. */
export const BUFFER_MIN = 10;

export type Check = { ok: true } | { ok: false; reason: string };

const overlaps = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 && b0 < a1;
const ms = (iso: string) => new Date(iso).getTime();

export const workerName = (s: AppState, id: WorkerId | null) => (id ? s.workers.find((w) => w.id === id)?.name ?? "—" : "Sans préférence");
export const serviceOf = (s: AppState, id: string) => s.services.find((x) => x.id === id);
export const clientOf = (s: AppState, id: string) => s.clients.find((x) => x.id === id);

/** RG-04 : une travailleuse ne réalise que les prestations de son profil. */
export function isQualified(worker: Worker, service: Service): Check {
  return worker.services.includes(service.id) ? { ok: true } : { ok: false, reason: `${worker.name} n'est pas habilitée pour « ${service.name} »` };
}

/** Horaires de travail (jours et heures). */
export function isWithinHours(worker: Worker, start: Date, end: Date): Check {
  const day = start.getDay(); // 0 = dimanche
  if (!worker.days.includes(day)) return { ok: false, reason: `${worker.name} ne travaille pas ce jour-là` };
  const h0 = start.getHours() + start.getMinutes() / 60;
  const h1 = end.getHours() + end.getMinutes() / 60 + (end.getDate() !== start.getDate() ? 24 : 0);
  if (h0 < worker.hours.start || h1 > worker.hours.end) return { ok: false, reason: `Hors des horaires de ${worker.name} (${fmtH(worker.hours.start)}–${fmtH(worker.hours.end)})` };
  return { ok: true };
}

/** RG-05 / RG-10 : pas de chevauchement avec un rendez-vous ou une indisponibilité validée. */
export function isFree(s: AppState, workerId: WorkerId, start: Date, end: Date, ignoreId?: string): Check {
  const a0 = start.getTime() - BUFFER_MIN * 60000;
  const a1 = end.getTime() + BUFFER_MIN * 60000;
  const clash = s.reservations.find(
    (r) => r.id !== ignoreId && r.workerId === workerId && ["confirmee", "en_cours"].includes(r.status) && overlaps(a0, a1, ms(r.start), ms(r.end)),
  );
  if (clash) {
    const c = clientOf(s, clash.clientId);
    return { ok: false, reason: `Conflit avec le rendez-vous de ${c?.name ?? "une cliente"} à ${fmtTime(clash.start)}` };
  }
  const off = s.unavailabilities.find((u) => u.workerId === workerId && u.status === "validee" && overlaps(start.getTime(), end.getTime(), ms(u.start), ms(u.end)));
  if (off) return { ok: false, reason: `${workerName(s, workerId)} est indisponible (${off.reason.toLowerCase()})` };
  return { ok: true };
}

/** RG-06 : contrôle complet avant d'affecter un rendez-vous à une travailleuse. */
export function canAssign(s: AppState, workerId: WorkerId, r: Pick<Reservation, "serviceId" | "start" | "end" | "id">): Check {
  const w = s.workers.find((x) => x.id === workerId);
  const sv = serviceOf(s, r.serviceId);
  if (!w || !sv) return { ok: false, reason: "Données introuvables" };
  const start = new Date(r.start);
  const end = new Date(r.end);
  for (const c of [isQualified(w, sv), isWithinHours(w, start, end), isFree(s, workerId, start, end, r.id)]) if (!c.ok) return c;
  return { ok: true };
}

/** Travailleuses éligibles pour un créneau (utilisé pour la suggestion d'affectation). */
export function eligibleWorkers(s: AppState, r: Pick<Reservation, "serviceId" | "start" | "end" | "id">): WorkerId[] {
  return s.workers.filter((w) => canAssign(s, w.id, r).ok).map((w) => w.id);
}

/** Règles des tâches : une tâche individuelle n'est attribuée qu'à une seule travailleuse. */
export function canTake(worker: Worker, task: Task): Check {
  if (task.status !== "disponible") return { ok: false, reason: "Cette tâche n'est plus disponible" };
  if (task.skill && !worker.skills.includes(task.skill)) return { ok: false, reason: `Compétence requise : ${task.skill}` };
  return { ok: true };
}

/** Rendez-vous confirmés touchés par une indisponibilité. */
export function impactedBy(s: AppState, workerId: WorkerId, start: string, end: string) {
  return s.reservations.filter((r) => r.workerId === workerId && ["confirmee", "en_cours"].includes(r.status) && overlaps(ms(start), ms(end), ms(r.start), ms(r.end)));
}

/** Taux d'occupation sur une période (minutes réservées / minutes ouvertes). */
export function occupancy(s: AppState, workerId: WorkerId, from: Date, days: number) {
  const w = s.workers.find((x) => x.id === workerId);
  if (!w) return 0;
  let open = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    if (w.days.includes(d.getDay())) open += (w.hours.end - w.hours.start) * 60;
  }
  const to = new Date(from);
  to.setDate(to.getDate() + days);
  const booked = s.reservations
    .filter((r) => r.workerId === workerId && r.status !== "annulee" && r.status !== "a_affecter" && ms(r.start) >= from.getTime() && ms(r.start) < to.getTime())
    .reduce((a, r) => a + (ms(r.end) - ms(r.start)) / 60000, 0);
  return open ? Math.min(1, booked / open) : 0;
}

// ─── Formats
export const fmtH = (h: number) => `${Math.floor(h)}h${h % 1 ? String(Math.round((h % 1) * 60)).padStart(2, "0") : ""}`;
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
export const fmtDay = (iso: string | Date) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
export const fmtShort = (iso: string | Date) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
export const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
export const addMin = (iso: string | Date, m: number) => new Date(new Date(iso).getTime() + m * 60000).toISOString();
