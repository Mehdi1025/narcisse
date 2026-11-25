"use client";
import { useState } from "react";
import { useStore, useToast } from "@/lib/app/store";
import { clientOf, fmtShort, fmtTime, impactedBy } from "@/lib/app/rules";
import type { WorkerId } from "@/lib/app/types";
import { Button, Card, Empty, Field, cx } from "../ui";

const REASONS = ["Congé", "Formation", "Rendez-vous personnel", "Autre"];

export default function Unavailability({ me }: { me: WorkerId }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const d = new Date();
  d.setDate(d.getDate() + 2);
  const [date, setDate] = useState(d.toISOString().slice(0, 10));
  const [from, setFrom] = useState("14:00");
  const [to, setTo] = useState("18:00");
  const [reason, setReason] = useState(REASONS[0]);

  const start = new Date(`${date}T${from}:00`);
  const end = new Date(`${date}T${to}:00`);
  const valid = !Number.isNaN(start.getTime()) && end > start;
  const impact = valid ? impactedBy(state, me, start.toISOString(), end.toISOString()) : [];
  const mine = state.unavailabilities.filter((u) => u.workerId === me);

  return (
    <div className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
      <Card eyebrow="Nouvelle demande" title="Déclarer une indisponibilité">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            dispatch({ type: "requestOff", workerId: me, start: start.toISOString(), end: end.toISOString(), reason });
            toast("Demande envoyée à l'administratrice");
          }}
        >
          <Field label="Date"><input type="date" className="app-input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="De"><input type="time" step={900} className="app-input" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            <Field label="À"><input type="time" step={900} className="app-input" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          </div>
          <Field label="Motif" hint="Le motif reste général : aucune précision médicale n'est demandée.">
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button type="button" key={r} onClick={() => setReason(r)} className={cx("h-9 rounded-full border px-4 text-[13px]", reason === r ? "border-encre bg-encre text-ivoire" : "border-encre/15 hover:border-encre/40")}>
                  {r}
                </button>
              ))}
            </div>
          </Field>
          {valid && (
            <div className={cx("rounded-2xl p-4 text-[13px]", impact.length ? "bg-bordeaux/[0.06] text-bordeaux" : "bg-sauge/15 text-sauge-fonce")}>
              {impact.length ? (
                <>
                  <p className="font-medium">{impact.length} rendez-vous sur ce créneau</p>
                  <ul className="mt-1 space-y-0.5">
                    {impact.map((r) => <li key={r.id}>{fmtTime(r.start)} · {clientOf(state, r.clientId)?.name}</li>)}
                  </ul>
                  <p className="mt-2 text-encre/60">Si la demande est validée, l&apos;administratrice les réaffectera.</p>
                </>
              ) : (
                "Aucun rendez-vous impacté."
              )}
            </div>
          )}
          {!valid && <p className="text-[12.5px] text-bordeaux">L&apos;heure de fin doit être après l&apos;heure de début.</p>}
          <Button type="submit" disabled={!valid}>Envoyer la demande</Button>
        </form>
      </Card>

      <Card eyebrow="Suivi" title="Mes demandes">
        {mine.length === 0 ? (
          <Empty>Aucune demande.</Empty>
        ) : (
          <ul className="divide-y divide-encre/[0.07]">
            {mine.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-3.5">
                <div className="flex-1">
                  <p className="text-[14px] first-letter:uppercase">{fmtShort(u.start)}, {fmtTime(u.start)}–{fmtTime(u.end)}</p>
                  <p className="text-[12.5px] text-encre/55">{u.reason}</p>
                </div>
                <span className={cx("rounded-full px-3 py-1 text-[12px]", { en_attente: "bg-rose/40 text-bordeaux", validee: "bg-sauge/20 text-sauge-fonce", refusee: "bg-encre/[0.05] text-encre/50" }[u.status])}>
                  {{ en_attente: "En attente", validee: "Validée", refusee: "Refusée" }[u.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
