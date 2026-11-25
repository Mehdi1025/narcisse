"use client";
import { useMemo, useState } from "react";
import { useStore, useToast } from "@/lib/app/store";
import { addMin, canAssign, clientOf, eligibleWorkers, fmtShort, fmtTime, serviceOf, workerName } from "@/lib/app/rules";
import type { Reservation, ReservationStatus, WorkerId } from "@/lib/app/types";
import { AssignButtons, AssignReasons, ReservationDrawer } from "../shared";
import { Button, Card, Chip, Empty, Field, Icon, Modal, PoleDot, StatusBadge, WORKER_TONE, cx } from "../ui";

const FILTERS: { id: "tous" | ReservationStatus; label: string }[] = [
  { id: "tous", label: "Toutes" },
  { id: "a_affecter", label: "À affecter" },
  { id: "confirmee", label: "Confirmées" },
  { id: "terminee", label: "Terminées" },
  { id: "annulee", label: "Annulées" },
];

export default function Reservations() {
  const { state } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("tous");
  const [who, setWho] = useState<"tous" | WorkerId>("tous");
  const [sel, setSel] = useState<Reservation | null>(null);
  const [create, setCreate] = useState(false);

  const list = useMemo(
    () =>
      state.reservations
        .filter((r) => (filter === "tous" ? true : r.status === filter))
        .filter((r) => (who === "tous" ? true : r.workerId === who))
        .sort((a, b) => a.start.localeCompare(b.start)),
    [state.reservations, filter, who],
  );
  const queue = state.reservations.filter((r) => r.status === "a_affecter").sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={cx("h-9 rounded-full px-4 text-[13px] transition-colors", filter === f.id ? "bg-encre text-ivoire" : "bg-encre/[0.05] hover:bg-encre/10")}>
            {f.label}
            {f.id === "a_affecter" && queue.length > 0 && <span className="ml-1.5 text-rose">{queue.length}</span>}
          </button>
        ))}
        <select value={who} onChange={(e) => setWho(e.target.value as typeof who)} className="app-input !h-9 !w-auto !rounded-full !py-0 text-[13px]" aria-label="Filtrer par travailleuse">
          <option value="tous">Toute l&apos;équipe</option>
          {state.workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <Button className="ml-auto" onClick={() => setCreate(true)}>
          <Icon name="plus" size={16} /> Réservation au comptoir
        </Button>
      </div>

      {filter === "tous" && queue.length > 0 && (
        <Card eyebrow="Priorité" title={`${queue.length} réservation${queue.length > 1 ? "s" : ""} à affecter`} className="border-bordeaux/25">
          <div className="grid gap-3 md:grid-cols-2">
            {queue.map((r) => (
              <QueueCard key={r.id} r={r} onOpen={() => setSel(r)} />
            ))}
          </div>
        </Card>
      )}

      <Card className="!p-0 overflow-hidden">
        {list.length === 0 ? (
          <div className="p-6"><Empty>Aucune réservation pour ce filtre.</Empty></div>
        ) : (
          <div className="app-scroll overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-encre/[0.08] text-encre/50">
                  {["Date", "Cliente", "Prestation", "Préférence", "Réalisé par", "Canal", "Statut"].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium app-label">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((r) => {
                  const sv = serviceOf(state, r.serviceId);
                  return (
                    <tr key={r.id} onClick={() => setSel(r)} className="cursor-pointer border-b border-encre/[0.05] transition-colors last:border-0 hover:bg-encre/[0.025]">
                      <td className="px-5 py-3 whitespace-nowrap"><span className="first-letter:uppercase">{fmtShort(r.start)}</span> <span className="tabular-nums text-encre/55">· {fmtTime(r.start)}</span></td>
                      <td className="px-5 py-3 font-medium">{clientOf(state, r.clientId)?.name}</td>
                      <td className="px-5 py-3"><span className="inline-flex items-center gap-2">{sv && <PoleDot pole={sv.pole} />}{sv?.name}</span></td>
                      <td className="px-5 py-3 text-encre/60">{workerName(state, r.preference)}</td>
                      <td className="px-5 py-3">
                        {r.workerId ? <span className="inline-flex items-center gap-2"><span className={cx("h-2 w-2 rounded-full", WORKER_TONE[r.workerId].bg)} />{workerName(state, r.workerId)}</span> : <span className="text-encre/40">—</span>}
                      </td>
                      <td className="px-5 py-3 text-encre/60">{r.source === "comptoir" ? "Comptoir" : "En ligne"}</td>
                      <td className="px-5 py-3"><StatusBadge kind="res" status={r.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ReservationDrawer r={sel} onClose={() => setSel(null)} />
      <CreateReservation open={create} onClose={() => setCreate(false)} />
    </div>
  );
}

function QueueCard({ r, onOpen }: { r: Reservation; onOpen: () => void }) {
  const { state } = useStore();
  const sv = serviceOf(state, r.serviceId);
  const elig = eligibleWorkers(state, r);
  return (
    <div className="rounded-2xl border border-dashed border-bordeaux/35 bg-voile/70 p-4">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium">{clientOf(state, r.clientId)?.name}</p>
            <p className="text-[12.5px] text-encre/60">{sv?.name} · {sv?.duration} min</p>
          </div>
          <Chip className="first-letter:uppercase">{fmtShort(r.start)} · {fmtTime(r.start)}</Chip>
        </div>
      </button>
      {r.note && <p className="mt-2 text-[12px] text-bordeaux">{r.note}</p>}
      <p className="mt-3 text-[12px] text-encre/55">
        {elig.length === 0 ? "Personne n'est éligible sur ce créneau : à reprogrammer ou habilitation à ajouter." : elig.length === 1 ? `Suggestion : ${workerName(state, elig[0])}` : "Les deux travailleuses sont disponibles."}
      </p>
      <div className="mt-3">
        <AssignButtons r={r} />
        <AssignReasons r={r} />
      </div>
    </div>
  );
}

function CreateReservation({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [name, setName] = useState("");
  const [serviceId, setServiceId] = useState(state.services[3]?.id ?? "");
  const [date, setDate] = useState(tomorrow.toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  const [pref, setPref] = useState<"" | WorkerId>("");

  const start = new Date(`${date}T${time}:00`);
  const sv = serviceOf(state, serviceId);
  const draft = { id: "draft", serviceId, start: start.toISOString(), end: addMin(start, sv?.duration ?? 60) };
  const checks = state.workers.map((w) => ({ w, c: canAssign(state, w.id, draft) }));
  const prefCheck = pref ? checks.find((x) => x.w.id === pref)?.c : null;
  const valid = name.trim().length > 1 && !Number.isNaN(start.getTime());

  return (
    <Modal open={open} onClose={onClose} title="Réservation au comptoir">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          dispatch({ type: "createReservation", clientName: name, serviceId, start: start.toISOString(), preference: pref || null });
          toast(pref && prefCheck?.ok ? `Réservation confirmée avec ${workerName(state, pref)}` : "Réservation ajoutée à la file d'affectation");
          setName("");
          onClose();
        }}
      >
        <Field label="Cliente">
          <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom et initiale" list="clients" required />
          <datalist id="clients">{state.clients.map((c) => <option key={c.id} value={c.name} />)}</datalist>
        </Field>
        <Field label="Prestation">
          <select className="app-input" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            {state.services.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.duration} min</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date"><input type="date" className="app-input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Heure"><input type="time" step={900} className="app-input" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
        </div>
        <Field label="Préférence de la cliente">
          <div className="grid grid-cols-3 gap-2">
            {([["", "Sans préférence"], ...state.workers.map((w) => [w.id, w.name])] as [string, string][]).map(([id, label]) => (
              <button type="button" key={id} onClick={() => setPref(id as "" | WorkerId)} className={cx("rounded-xl border px-3 py-2.5 text-[13px] transition-colors", pref === id ? "border-encre bg-encre text-ivoire" : "border-encre/15 hover:border-encre/40")}>
                {label}
              </button>
            ))}
          </div>
        </Field>
        <ul className="space-y-1 rounded-2xl bg-voile/70 p-4 text-[12.5px]">
          {checks.map(({ w, c }) => (
            <li key={w.id} className={c.ok ? "text-sauge-fonce" : "text-encre/55"}>
              {c.ok ? `✓ ${w.name} disponible sur ce créneau` : `✕ ${c.reason}`}
            </li>
          ))}
          {pref && prefCheck && !prefCheck.ok && <li className="pt-1 text-bordeaux">La préférence ne peut pas être respectée : la réservation ira dans la file d&apos;affectation.</li>}
          {!pref && <li className="pt-1 text-encre/55">Sans préférence : l&apos;administratrice affecte ensuite la réservation.</li>}
        </ul>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={!valid}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}
