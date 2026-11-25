"use client";
import { useState } from "react";
import { useStore } from "@/lib/app/store";
import { fmtDay, sameDay, startOfDay } from "@/lib/app/rules";
import type { Reservation } from "@/lib/app/types";
import { DayLanes, ReservationDrawer } from "../shared";
import { Button, Card, Icon, WORKER_TONE, cx } from "../ui";

export default function AdminAgenda() {
  const { state } = useStore();
  const [day, setDay] = useState(() => startOfDay(new Date()));
  const [sel, setSel] = useState<Reservation | null>(null);
  const shift = (n: number) => setDay((d) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  });

  // Bandeau de la semaine (lundi → samedi)
  const monday = new Date(day);
  monday.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  const week = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const count = (d: Date) => state.reservations.filter((r) => sameDay(new Date(r.start), d) && r.status !== "annulee").length;
  const pending = (d: Date) => state.reservations.filter((r) => sameDay(new Date(r.start), d) && r.status === "a_affecter").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => shift(-1)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-encre/5" aria-label="Jour précédent"><Icon name="chevronL" /></button>
          <button onClick={() => shift(1)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-encre/5" aria-label="Jour suivant"><Icon name="chevronR" /></button>
        </div>
        <h2 className="font-serif text-[26px] first-letter:uppercase">{fmtDay(day)}</h2>
        <Button size="sm" variant="ghost" onClick={() => setDay(startOfDay(new Date()))}>Aujourd&apos;hui</Button>
        <div className="ml-auto flex items-center gap-4 text-[12px] text-encre/60">
          {state.workers.map((w) => (
            <span key={w.id} className="flex items-center gap-1.5"><span className={cx("h-2.5 w-2.5 rounded-full", WORKER_TONE[w.id].bg)} />{w.name}</span>
          ))}
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border border-dashed border-bordeaux" />À affecter</span>
        </div>
      </div>

      <div className="app-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {week.map((d) => {
          const active = sameDay(d, day);
          const p = pending(d);
          return (
            <button
              key={d.toISOString()}
              onClick={() => setDay(startOfDay(d))}
              className={cx("min-w-[96px] flex-1 rounded-2xl border px-4 py-3 text-left transition-colors", active ? "border-encre bg-encre text-ivoire" : "border-encre/10 bg-voile/60 hover:border-encre/30")}
            >
              <p className={cx("text-[11px] uppercase tracking-[0.14em]", active ? "text-ivoire/60" : "text-encre/45")}>{d.toLocaleDateString("fr-FR", { weekday: "short" })}</p>
              <p className="font-serif text-[26px] leading-tight">{d.getDate()}</p>
              <p className={cx("text-[11.5px]", active ? "text-ivoire/70" : "text-encre/55")}>
                {count(d)} rdv{p > 0 && <span className={cx("ml-1", active ? "text-rose" : "text-bordeaux")}>· {p} à affecter</span>}
              </p>
            </button>
          );
        })}
      </div>

      <Card>
        <DayLanes
          date={day}
          onSelect={setSel}
          lanes={[...state.workers.map((w) => ({ key: w.id, label: w.name, workerId: w.id })), { key: "q", label: "À affecter", workerId: null }]}
        />
      </Card>
      <ReservationDrawer r={sel} onClose={() => setSel(null)} />
    </div>
  );
}
