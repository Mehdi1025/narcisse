"use client";
import { useState } from "react";
import { Symbol } from "@/components/brand/Symbol";
import { useStore, useToast } from "@/lib/app/store";
import { clientOf, fmtDay, fmtTime, sameDay, serviceOf } from "@/lib/app/rules";
import type { Reservation, WorkerId } from "@/lib/app/types";
import type { ViewId } from "../Shell";
import { ResRow, useNow } from "../shared";
import { Button, Card, Empty, Field, Icon, Modal, StatusBadge } from "../ui";

function until(now: Date, iso: string) {
  const m = Math.round((new Date(iso).getTime() - now.getTime()) / 60000);
  if (m <= 0) return "maintenant";
  if (m < 60) return `dans ${m} min`;
  const h = Math.floor(m / 60);
  return `dans ${h} h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;
}

export default function Today({ me, go }: { me: WorkerId; go: (v: ViewId) => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const now = useNow();
  const [incident, setIncident] = useState(false);
  const w = state.workers.find((x) => x.id === me)!;

  const mine = state.reservations
    .filter((r) => r.workerId === me && sameDay(new Date(r.start), now) && r.status !== "annulee")
    .sort((a, b) => a.start.localeCompare(b.start));
  const current = mine.find((r) => r.status === "en_cours");
  const next = mine.find((r) => r.status === "confirmee" && new Date(r.end) > now);
  const focus = current ?? next;
  const done = mine.filter((r) => r.status === "terminee").length;
  const myTasks = state.tasks.filter((t) => t.assignee === me && ["attribuee", "en_cours"].includes(t.status));
  const hour = now.getHours();
  const hello = hour < 18 ? "Bonjour" : "Bonsoir";

  const act = (r: Reservation, status: Reservation["status"], msg: string) => {
    dispatch({ type: "setReservationStatus", id: r.id, status, by: me });
    toast(msg, status === "absence" ? "warn" : "ok");
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="app-rise relative overflow-hidden rounded-[24px] bg-encre p-6 text-ivoire sm:p-8">
          <Symbol className="pointer-events-none absolute -right-8 -top-6 h-[260px] w-auto text-ivoire/[0.05]" />
          <p className="text-[11px] uppercase tracking-[0.2em] text-ivoire/50 first-letter:uppercase">{fmtDay(now)}</p>
          <h2 className="mt-2 font-serif text-[34px] leading-tight text-ivoire sm:text-[42px]">
            {hello}, <span className="italic text-rose">{w.name}</span>
          </h2>
          <p className="mt-1 text-[14px] text-ivoire/65">
            {mine.length ? `${mine.length} rendez-vous aujourd'hui · ${done} terminé${done > 1 ? "s" : ""}` : "Aucun rendez-vous aujourd'hui."}
          </p>

          {focus ? (
            <div className="relative mt-7 rounded-2xl bg-ivoire/[0.07] p-5 ring-1 ring-ivoire/10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-rose">{current ? "En cours" : `Prochain rendez-vous · ${until(now, focus.start)}`}</p>
              <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
                <p className="font-serif text-[52px] leading-none tabular-nums">{fmtTime(focus.start)}</p>
                <div className="pb-1">
                  <p className="text-[17px]">{clientOf(state, focus.clientId)?.name}</p>
                  <p className="text-[13px] text-ivoire/60">{serviceOf(state, focus.serviceId)?.name} · jusqu&apos;à {fmtTime(focus.end)}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {current ? (
                  <button onClick={() => act(current, "terminee", "Rendez-vous terminé")} className="inline-flex h-11 items-center gap-2 rounded-full bg-ivoire px-6 text-[14px] font-medium text-encre transition-colors hover:bg-rose">
                    <Icon name="check" size={16} /> Terminer le soin
                  </button>
                ) : (
                  <>
                    <button onClick={() => act(focus, "en_cours", "Soin démarré")} className="inline-flex h-11 items-center gap-2 rounded-full bg-ivoire px-6 text-[14px] font-medium text-encre transition-colors hover:bg-rose">
                      <Icon name="play" size={15} /> Démarrer
                    </button>
                    <button onClick={() => act(focus, "absence", "Absence signalée à l'administratrice")} className="inline-flex h-11 items-center rounded-full border border-ivoire/25 px-5 text-[13.5px] text-ivoire/85 hover:border-ivoire/60">
                      Cliente absente
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            mine.length > 0 && <p className="relative mt-6 rounded-2xl bg-ivoire/[0.07] p-5 text-[14px] text-ivoire/75">Tous les rendez-vous du jour sont passés. Belle fin de journée.</p>
          )}
        </section>

        <Card eyebrow="Planning" title="Ma journée">
          {mine.length === 0 ? (
            <Empty>Pas de rendez-vous aujourd&apos;hui.</Empty>
          ) : (
            <ul className="divide-y divide-encre/[0.07]">
              {mine.map((r) => (
                <li key={r.id}>
                  <ResRow
                    r={r}
                    right={
                      r.status === "confirmee" && r.id !== focus?.id && !current ? (
                        <Button size="sm" variant="soft" onClick={() => act(r, "en_cours", "Soin démarré")}>Démarrer</Button>
                      ) : (
                        <StatusBadge kind="res" status={r.status} />
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card
          eyebrow="En cours"
          title="Mes tâches"
          action={<Button size="sm" variant="ghost" onClick={() => go("tasks")}>Voir <Icon name="arrow" size={14} /></Button>}
        >
          {myTasks.length === 0 ? (
            <Empty>Aucune tâche en cours. Consultez les tâches disponibles.</Empty>
          ) : (
            <ul className="space-y-2">
              {myTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-voile/70 p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium">{t.title}</p>
                    <StatusBadge kind="task" status={t.status} />
                  </div>
                  {t.status === "attribuee" ? (
                    <Button size="sm" variant="soft" onClick={() => { dispatch({ type: "setTaskStatus", id: t.id, status: "en_cours", by: me }); toast("Tâche démarrée"); }}>Démarrer</Button>
                  ) : (
                    <Button size="sm" onClick={() => { dispatch({ type: "setTaskStatus", id: t.id, status: "terminee", by: me }); toast("Envoyée pour validation"); }}>Terminer</Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card eyebrow="Raccourcis" title="Besoin de quelque chose ?">
          <div className="grid gap-2">
            <button onClick={() => go("off")} className="flex items-center gap-3 rounded-2xl bg-voile/70 p-4 text-left text-[13.5px] hover:bg-voile">
              <Icon name="off" /> Déclarer une indisponibilité
            </button>
            <button onClick={() => setIncident(true)} className="flex items-center gap-3 rounded-2xl bg-voile/70 p-4 text-left text-[13.5px] hover:bg-voile">
              <Icon name="alert" /> Signaler un incident
            </button>
          </div>
        </Card>
      </div>

      <IncidentModal open={incident} onClose={() => setIncident(false)} me={me} />
    </div>
  );
}

function IncidentModal({ open, onClose, me }: { open: boolean; onClose: () => void; me: WorkerId }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [kind, setKind] = useState("Matériel");
  const [text, setText] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Signaler un incident">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          dispatch({ type: "incident", by: me, text: `[${kind}] ${text.trim()}` });
          toast("Incident transmis à l'administratrice");
          setText("");
          onClose();
        }}
      >
        <Field label="Type">
          <select className="app-input" value={kind} onChange={(e) => setKind(e.target.value)}>
            {["Matériel", "Stock", "Locaux", "Cliente", "Autre"].map((k) => <option key={k}>{k}</option>)}
          </select>
        </Field>
        <Field label="Description" hint="Ne pas saisir d'information de santé sur une cliente.">
          <textarea className="app-input min-h-28" value={text} onChange={(e) => setText(e.target.value)} placeholder="Que s'est-il passé ?" required />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit">Envoyer</Button>
        </div>
      </form>
    </Modal>
  );
}
