"use client";
import { useState } from "react";
import { useStore, useToast } from "@/lib/app/store";
import { canTake, fmtShort } from "@/lib/app/rules";
import type { Task, WorkerId } from "@/lib/app/types";
import { PRIORITY } from "../admin/Tasks";
import { Button, Chip, Empty, POLE, PoleDot, StatusBadge, cx } from "../ui";

export default function WorkerTasks({ me }: { me: WorkerId }) {
  const { state } = useStore();
  const [tab, setTab] = useState<"dispo" | "miennes">("dispo");
  const w = state.workers.find((x) => x.id === me)!;
  const open = state.tasks.filter((t) => t.status === "disponible");
  const forMe = open.filter((t) => canTake(w, t).ok);
  const locked = open.length - forMe.length;
  const mine = state.tasks.filter((t) => t.assignee === me).sort((a, b) => order(a) - order(b));

  return (
    <div className="max-w-3xl space-y-5">
      <div className="inline-flex rounded-full bg-encre/[0.06] p-1">
        {([["dispo", `Disponibles (${forMe.length})`], ["miennes", `Mes tâches (${mine.filter((t) => t.status !== "validee").length})`]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cx("h-9 rounded-full px-5 text-[13px] transition-colors", tab === id ? "bg-encre text-ivoire" : "text-encre/65")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "dispo" && (
        <div className="space-y-3">
          {forMe.length === 0 ? <Empty>Aucune tâche disponible pour vos compétences.</Empty> : forMe.map((t) => <WTask key={t.id} t={t} me={me} />)}
          {locked > 0 && <p className="px-1 text-[12px] text-encre/45">{locked} autre{locked > 1 ? "s" : ""} tâche{locked > 1 ? "s" : ""} réservée{locked > 1 ? "s" : ""} à d&apos;autres compétences.</p>}
        </div>
      )}
      {tab === "miennes" && <div className="space-y-3">{mine.length === 0 ? <Empty>Vous n&apos;avez pas encore de tâche.</Empty> : mine.map((t) => <WTask key={t.id} t={t} me={me} />)}</div>}
    </div>
  );
}

const order = (t: Task) => ["en_cours", "attribuee", "demandee", "terminee", "validee"].indexOf(t.status);

function WTask({ t, me }: { t: Task; me: WorkerId }) {
  const { dispatch } = useStore();
  const toast = useToast();
  return (
    <article className="app-card app-rise flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-encre/55">
          <PoleDot pole={t.pole} /> {POLE[t.pole].label}
          <span className={cx("font-medium", PRIORITY[t.priority].cls)}>· Priorité {PRIORITY[t.priority].label.toLowerCase()}</span>
        </div>
        <h3 className="font-sans! text-[15px] font-medium tracking-normal">{t.title}</h3>
        <p className="mt-0.5 text-[13px] text-encre/60">{t.description}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {t.assignee && <StatusBadge kind="task" status={t.status} />}
          <Chip className="first-letter:uppercase">Échéance {fmtShort(t.due)}</Chip>
          {t.skill && <Chip>{t.skill}</Chip>}
          {t.requiresValidation && t.status === "disponible" && <Chip className="bg-rose/30 text-bordeaux">Sur validation</Chip>}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {t.status === "disponible" && (
          <Button onClick={() => { dispatch({ type: "takeTask", id: t.id, workerId: me }); toast(t.requiresValidation ? "Demande envoyée à l'administratrice" : "Tâche prise"); }}>
            {t.requiresValidation ? "Demander" : "Prendre"}
          </Button>
        )}
        {t.status === "attribuee" && <Button variant="soft" onClick={() => { dispatch({ type: "setTaskStatus", id: t.id, status: "en_cours", by: me }); toast("Tâche démarrée"); }}>Démarrer</Button>}
        {t.status === "en_cours" && <Button onClick={() => { dispatch({ type: "setTaskStatus", id: t.id, status: "terminee", by: me }); toast("Envoyée pour validation"); }}>Terminer</Button>}
        {t.status === "demandee" && <span className="text-[12.5px] text-encre/50">En attente de réponse</span>}
        {t.status === "terminee" && <span className="text-[12.5px] text-encre/50">En attente de validation</span>}
      </div>
    </article>
  );
}
