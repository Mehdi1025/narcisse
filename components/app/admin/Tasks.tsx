"use client";
import { useState } from "react";
import { useStore, useToast } from "@/lib/app/store";
import { fmtShort, workerName } from "@/lib/app/rules";
import { SKILLS } from "@/lib/app/seed";
import type { Priority, Task, TaskStatus } from "@/lib/app/types";
import { Avatar, Button, Chip, Empty, Field, Icon, Modal, POLE, PoleDot, cx } from "../ui";

const COLUMNS: { id: string; label: string; statuses: TaskStatus[]; hint: string }[] = [
  { id: "dispo", label: "Disponibles", statuses: ["disponible"], hint: "Publiées, à prendre par l'équipe" },
  { id: "dem", label: "Demandées", statuses: ["demandee"], hint: "À accepter ou refuser" },
  { id: "cours", label: "En cours", statuses: ["attribuee", "en_cours"], hint: "Une seule personne par tâche" },
  { id: "valid", label: "À valider", statuses: ["terminee"], hint: "Terminées par l'équipe" },
];

export const PRIORITY: Record<Priority, { label: string; cls: string }> = {
  basse: { label: "Basse", cls: "text-encre/45" },
  normale: { label: "Normale", cls: "text-encre/65" },
  haute: { label: "Haute", cls: "text-bordeaux" },
};

export default function AdminTasks() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="max-w-xl text-[13.5px] text-encre/60">
          Publiez une tâche : seules les travailleuses ayant la compétence requise la voient. Une tâche marquée « validation requise » passe par une demande avant attribution.
        </p>
        <Button className="ml-auto" onClick={() => setOpen(true)}>
          <Icon name="plus" size={16} /> Publier une tâche
        </Button>
      </div>
      <div className="app-scroll -mx-4 grid auto-cols-[minmax(250px,1fr)] grid-flow-col gap-4 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
        {COLUMNS.map((col) => {
          const items = state.tasks.filter((t) => col.statuses.includes(t.status));
          return (
            <section key={col.id} className="min-w-0">
              <header className="mb-3 px-1">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-serif text-[21px]">{col.label}</h2>
                  <span className="text-[12px] text-encre/45">{items.length}</span>
                </div>
                <p className="text-[11.5px] text-encre/45">{col.hint}</p>
              </header>
              <div className="space-y-3">
                {items.length === 0 ? <Empty>Rien ici</Empty> : items.map((t) => <TaskCard key={t.id} t={t} />)}
              </div>
            </section>
          );
        })}
      </div>
      <Validated />
      <PublishTask open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function Validated() {
  const { state } = useStore();
  const done = state.tasks.filter((t) => t.status === "validee");
  if (!done.length) return null;
  return (
    <section>
      <h2 className="mb-3 font-serif text-[21px]">Validées <span className="font-sans text-[12px] text-encre/45">{done.length}</span></h2>
      <ul className="app-card divide-y divide-encre/[0.06] px-5">
        {done.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-3 text-[13px]">
            <Icon name="check" size={16} className="text-sauge" />
            <span className="flex-1">{t.title}</span>
            <span className="text-encre/50">{workerName(state, t.assignee)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TaskCard({ t }: { t: Task }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const eligible = state.workers.filter((w) => !t.skill || w.skills.includes(t.skill));
  return (
    <article className="app-card app-rise p-4">
      <div className="mb-2 flex items-center gap-2 text-[11.5px] text-encre/55">
        <PoleDot pole={t.pole} /> {POLE[t.pole].label}
        <span className={cx("ml-auto font-medium", PRIORITY[t.priority].cls)}>{PRIORITY[t.priority].label}</span>
      </div>
      <h3 className="font-sans! text-[14.5px] font-medium leading-snug tracking-normal">{t.title}</h3>
      <p className="mt-1 text-[12.5px] text-encre/60">{t.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {t.skill && <Chip>{t.skill}</Chip>}
        <Chip className="first-letter:uppercase">Échéance {fmtShort(t.due)}</Chip>
        {t.requiresValidation && <Chip className="bg-rose/30 text-bordeaux">Validation requise</Chip>}
      </div>
      {t.assignee && (
        <div className="mt-3 flex items-center gap-2 text-[12.5px]">
          <Avatar id={t.assignee} label={state.workers.find((w) => w.id === t.assignee)?.initials ?? ""} size={22} />
          {workerName(state, t.assignee)}
          {t.status === "en_cours" && <span className="text-encre/45">· en cours</span>}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {t.status === "disponible" &&
          (eligible.length ? (
            eligible.map((w) => (
              <Button key={w.id} size="sm" variant="ghost" onClick={() => { dispatch({ type: "assignTask", id: t.id, workerId: w.id }); toast(`Attribuée à ${w.name}`); }}>
                Attribuer à {w.name}
              </Button>
            ))
          ) : (
            <p className="text-[12px] text-bordeaux">Aucune travailleuse n&apos;a la compétence « {t.skill} ».</p>
          ))}
        {t.status === "demandee" && (
          <>
            <Button size="sm" onClick={() => { dispatch({ type: "decideTask", id: t.id, approve: true }); toast("Demande acceptée"); }}>Accepter</Button>
            <Button size="sm" variant="ghost" onClick={() => { dispatch({ type: "decideTask", id: t.id, approve: false }); toast("Demande refusée", "warn"); }}>Refuser</Button>
          </>
        )}
        {t.status === "terminee" && (
          <>
            <Button size="sm" onClick={() => { dispatch({ type: "setTaskStatus", id: t.id, status: "validee", by: "admin" }); toast("Tâche validée"); }}>Valider</Button>
            <Button size="sm" variant="ghost" onClick={() => { dispatch({ type: "setTaskStatus", id: t.id, status: "en_cours", by: "admin" }); toast("Renvoyée à reprendre", "warn"); }}>À reprendre</Button>
          </>
        )}
      </div>
    </article>
  );
}

function PublishTask({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const in3 = new Date();
  in3.setDate(in3.getDate() + 3);
  const [f, setF] = useState({ title: "", description: "", pole: "transverse" as Task["pole"], skill: "", priority: "normale" as Priority, due: in3.toISOString().slice(0, 10), requiresValidation: false });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title="Publier une tâche">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (f.title.trim().length < 3) return;
          dispatch({ type: "publishTask", task: { ...f, title: f.title.trim(), skill: f.skill || null, due: new Date(`${f.due}T12:00:00`).toISOString() } });
          toast("Tâche publiée");
          setF((x) => ({ ...x, title: "", description: "" }));
          onClose();
        }}
      >
        <Field label="Intitulé"><input className="app-input" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex. Réassort de la vitrine" required /></Field>
        <Field label="Description"><textarea className="app-input min-h-20" value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pôle">
            <select className="app-input" value={f.pole} onChange={(e) => set("pole", e.target.value as Task["pole"])}>
              {Object.entries(POLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Compétence requise">
            <select className="app-input" value={f.skill} onChange={(e) => set("skill", e.target.value)}>
              <option value="">Aucune</option>
              {SKILLS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Priorité">
            <select className="app-input" value={f.priority} onChange={(e) => set("priority", e.target.value as Priority)}>
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Échéance"><input type="date" className="app-input" value={f.due} onChange={(e) => set("due", e.target.value)} /></Field>
        </div>
        <label className="flex items-center gap-3 rounded-2xl bg-voile/70 p-4 text-[13px]">
          <input type="checkbox" checked={f.requiresValidation} onChange={(e) => set("requiresValidation", e.target.checked)} className="h-4 w-4 accent-[#96433A]" />
          Validation requise avant attribution (la travailleuse fait une demande)
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit">Publier</Button>
        </div>
      </form>
    </Modal>
  );
}
