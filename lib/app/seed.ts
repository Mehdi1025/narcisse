// Données de démonstration, générées autour de la date du jour.
// Prestations reprises de la direction éditoriale ; durées, horaires, habilitations et clientes = exemples à remplacer.
import type { AppState, Reservation, Service, Task, Worker } from "./types";

export const STATE_VERSION = 4;

export const SERVICES: Service[] = [
  { id: "consultation", name: "Consultation individuelle", pole: "mentale", duration: 60 },
  { id: "accompagnement", name: "Accompagnement émotionnel", pole: "mentale", duration: 60 },
  { id: "dev-perso", name: "Développement personnel", pole: "mentale", duration: 60 },
  { id: "visage", name: "Soin du visage", pole: "physique", duration: 60 },
  { id: "skincare", name: "Skincare coréenne avancée", pole: "physique", duration: 75 },
  { id: "extensions", name: "Extensions de cils", pole: "physique", duration: 120 },
  { id: "rehaussement", name: "Rehaussement de cils", pole: "physique", duration: 60 },
  { id: "browlift", name: "Browlift", pole: "physique", duration: 45 },
  { id: "onglerie", name: "Onglerie", pole: "physique", duration: 60 },
];

export const SKILLS = ["Accueil", "Boutique", "Hygiène et matériel", "Communication", "Événements", "Administratif"];

const WORKERS: Worker[] = [
  { id: "lina", name: "Lina", initials: "L", days: [1, 2, 3, 4, 5, 6], hours: { start: 9, end: 18 }, services: ["visage", "skincare", "extensions", "rehaussement", "browlift"], skills: ["Accueil", "Communication", "Événements"] },
  { id: "t2", name: "Travailleuse 2", initials: "T2", days: [1, 2, 3, 4, 5, 6], hours: { start: 10, end: 19 }, services: ["onglerie", "browlift", "rehaussement", "visage"], skills: ["Accueil", "Boutique", "Hygiène et matériel"] },
];

const CLIENTS = [
  ["c1", "Camille D."], ["c2", "Inès B."], ["c3", "Sarah M."], ["c4", "Nadia K."], ["c5", "Léa R."], ["c6", "Yasmine T."],
  ["c7", "Chloé V."], ["c8", "Amel H."], ["c9", "Julie P."], ["c10", "Maya S."], ["c11", "Hana L."], ["c12", "Emma G."],
].map(([id, name], i) => ({ id, name, phone: `06 00 00 0${String(i).padStart(2, "0")}` }));

let n = 0;
const id = (p: string) => `${p}-${++n}`;

/** Prochain jour travaillé (lundi–samedi) à partir d'aujourd'hui + offset. */
function workday(offset: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  let added = 0;
  while (added < offset || d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++;
  }
  return d;
}
const at = (day: Date, h: number, m = 0) => {
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
};

export function createSeed(): AppState {
  n = 0;
  const today = workday(0);
  const svc = (sid: string) => SERVICES.find((s) => s.id === sid)!;
  const res = (clientId: string, sid: string, day: Date, h: number, m: number, workerId: Reservation["workerId"], extra: Partial<Reservation> = {}): Reservation => {
    const start = at(day, h, m);
    const end = new Date(start.getTime() + svc(sid).duration * 60000);
    return {
      id: id("r"),
      clientId,
      serviceId: sid,
      start: start.toISOString(),
      end: end.toISOString(),
      workerId,
      preference: workerId,
      status: workerId ? "confirmee" : "a_affecter",
      source: "en_ligne",
      createdAt: new Date(Date.now() - 3600_000 * (n + 2)).toISOString(),
      ...extra,
    };
  };

  const d1 = workday(1);
  const d2 = workday(2);
  const d3 = workday(3);
  const reservations: Reservation[] = [
    // Aujourd'hui
    res("c1", "visage", today, 9, 30, "lina"),
    res("c2", "extensions", today, 11, 0, "lina"),
    res("c3", "rehaussement", today, 14, 30, "lina"),
    res("c4", "browlift", today, 16, 0, "lina"),
    res("c5", "onglerie", today, 10, 30, "t2"),
    res("c6", "onglerie", today, 13, 0, "t2"),
    res("c7", "visage", today, 15, 0, "t2", { preference: null, source: "comptoir" }),
    // Jours suivants
    res("c8", "skincare", d1, 10, 0, "lina"),
    res("c9", "browlift", d1, 14, 0, "lina"),
    res("c10", "onglerie", d1, 11, 0, "t2"),
    res("c11", "rehaussement", d1, 16, 30, "t2"),
    res("c12", "extensions", d2, 9, 30, "lina"),
    res("c1", "onglerie", d2, 15, 0, "t2"),
    res("c3", "visage", d3, 10, 30, "lina"),
    // Réservations sans préférence → file d'affectation de l'administratrice
    res("c9", "rehaussement", d1, 17, 0, null),
    res("c4", "skincare", d2, 14, 0, null),
    res("c6", "browlift", today, 17, 0, null),
    res("c10", "consultation", d2, 14, 0, null),
  ];

  const due = (k: number) => workday(k).toISOString();
  const task = (t: Omit<Task, "id" | "createdAt">): Task => ({ ...t, id: id("t"), createdAt: new Date().toISOString() });
  const tasks: Task[] = [
    task({ title: "Réassort de la vitrine skincare", description: "Mettre en avant les nouveaux coffrets rituels et vérifier les étiquettes prix.", pole: "physique", skill: "Boutique", priority: "normale", due: due(2), requiresValidation: false, status: "disponible", assignee: null }),
    task({ title: "Préparer l'atelier « Cercle de discussion »", description: "Salle, chaises en cercle, tisanes, feuille d'émargement.", pole: "sociale", skill: "Événements", priority: "haute", due: due(3), requiresValidation: true, status: "disponible", assignee: null }),
    task({ title: "Stérilisation et inventaire du matériel cils", description: "Contrôle des pinces, colles (dates), stock de franges.", pole: "physique", skill: "Hygiène et matériel", priority: "haute", due: due(1), requiresValidation: false, status: "disponible", assignee: null }),
    task({ title: "Publication Instagram de la semaine", description: "Trois visuels du lieu, texte validé par l'administratrice.", pole: "transverse", skill: "Communication", priority: "normale", due: due(2), requiresValidation: true, status: "demandee", assignee: "lina" }),
    task({ title: "Rappeler les clientes absentes", description: "Proposer un nouveau créneau aux deux absences de la semaine.", pole: "transverse", skill: "Accueil", priority: "normale", due: due(1), requiresValidation: false, status: "en_cours", assignee: "t2" }),
    task({ title: "Mise à jour du classeur des fiches clientes", description: "Archiver les fiches papier déjà saisies.", pole: "transverse", skill: "Administratif", priority: "basse", due: due(5), requiresValidation: false, status: "disponible", assignee: null }),
    task({ title: "Nettoyage approfondi de la cabine 1", description: "Désinfection, linge, réassort des consommables.", pole: "physique", skill: "Hygiène et matériel", priority: "normale", due: due(0), requiresValidation: false, status: "terminee", assignee: "t2" }),
  ];

  const offStart = at(d3, 14, 0);
  return {
    version: STATE_VERSION,
    services: SERVICES,
    workers: WORKERS,
    clients: CLIENTS,
    reservations,
    tasks,
    unavailabilities: [
      { id: id("u"), workerId: "t2", start: offStart.toISOString(), end: at(d3, 19, 0).toISOString(), reason: "Rendez-vous personnel", status: "en_attente" },
    ],
    notifications: [
      { id: id("n"), to: "admin", text: "4 réservations sans préférence attendent une affectation.", at: new Date().toISOString(), read: false },
      { id: id("n"), to: "admin", text: "Lina demande la tâche « Publication Instagram de la semaine ».", at: new Date().toISOString(), read: false },
      { id: id("n"), to: "admin", text: "Travailleuse 2 a déclaré une indisponibilité.", at: new Date().toISOString(), read: false },
      { id: id("n"), to: "lina", text: "Nouvelle réservation : Camille D., soin du visage à 9h30.", at: new Date().toISOString(), read: false },
      { id: id("n"), to: "t2", text: "Tâche « Nettoyage approfondi de la cabine 1 » en attente de validation.", at: new Date().toISOString(), read: true },
    ],
    log: [{ id: id("l"), at: new Date().toISOString(), actor: "systeme", text: "Données de démonstration chargées." }],
  };
}
