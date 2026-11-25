// Modèle de données des espaces de gestion (calqué sur le futur schéma de base de données).

export type WorkerId = "lina" | "t2";
export type Pole = "mentale" | "physique" | "sociale";
export type Profile = "admin" | WorkerId;

export type Service = {
  id: string;
  name: string;
  pole: Pole;
  /** Durée en minutes (donnée de démonstration, à valider) */
  duration: number;
};

export type Worker = {
  id: WorkerId;
  name: string;
  initials: string;
  /** Jours travaillés : 1 = lundi … 6 = samedi */
  days: number[];
  /** Horaires types en heures décimales */
  hours: { start: number; end: number };
  /** Habilitations : prestations que la travailleuse peut réaliser */
  services: string[];
  /** Compétences pour les tâches internes */
  skills: string[];
};

export type Client = { id: string; name: string; phone: string };

export type ReservationStatus = "a_affecter" | "confirmee" | "en_cours" | "terminee" | "annulee" | "absence";

export type Reservation = {
  id: string;
  clientId: string;
  serviceId: string;
  start: string; // ISO
  end: string; // ISO
  workerId: WorkerId | null;
  preference: WorkerId | null;
  status: ReservationStatus;
  source: "en_ligne" | "comptoir";
  createdAt: string;
  note?: string;
};

export type TaskStatus = "disponible" | "demandee" | "attribuee" | "en_cours" | "terminee" | "validee";
export type Priority = "basse" | "normale" | "haute";

export type Task = {
  id: string;
  title: string;
  description: string;
  pole: Pole | "transverse";
  skill: string | null;
  priority: Priority;
  due: string; // ISO (date)
  requiresValidation: boolean;
  status: TaskStatus;
  assignee: WorkerId | null;
  createdAt: string;
};

export type UnavailabilityStatus = "en_attente" | "validee" | "refusee";
export type Unavailability = {
  id: string;
  workerId: WorkerId;
  start: string;
  end: string;
  reason: string;
  status: UnavailabilityStatus;
};

export type Notification = { id: string; to: Profile; text: string; at: string; read: boolean };
export type LogEntry = { id: string; at: string; actor: Profile | "systeme"; text: string };

export type AppState = {
  version: number;
  services: Service[];
  workers: Worker[];
  clients: Client[];
  reservations: Reservation[];
  tasks: Task[];
  unavailabilities: Unavailability[];
  notifications: Notification[];
  log: LogEntry[];
};
