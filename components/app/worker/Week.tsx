"use client";
import { useState } from "react";
import { useStore } from "@/lib/app/store";
import { clientOf, fmtTime, sameDay, serviceOf, startOfDay } from "@/lib/app/rules";
import type { WorkerId } from "@/lib/app/types";
import { Icon, WORKER_TONE, cx } from "../ui";

export default function Week({ me }: { me: WorkerId }) {
  const { state } = useStore();
  const [offset, setOffset] = useState(0);
  const w = state.workers.find((x) => x.id === me)!;
  const today = startOfDay(new Date());
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset * 7);
  const days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const total = state.reservations.filter((r) => r.workerId === me && r.status !== "annulee" && days.some((d) => sameDay(d, new Date(r.start)))).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => setOffset((o) => o - 1)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-encre/5" aria-label="Semaine précédente"><Icon name="chevronL" /></button>
        <button onClick={() => setOffset((o) => o + 1)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-encre/5" aria-label="Semaine suivante"><Icon name="chevronR" /></button>
        <h2 className="font-serif text-[24px]">
          Semaine du {days[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
        </h2>
        <span className="ml-auto text-[13px] text-encre/55">{total} rendez-vous</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {days.map((d) => {
          const isToday = sameDay(d, today);
          const works = w.days.includes(d.getDay());
          const items = state.reservations.filter((r) => r.workerId === me && r.status !== "annulee" && sameDay(new Date(r.start), d)).sort((a, b) => a.start.localeCompare(b.start));
          const offs = state.unavailabilities.filter((u) => u.workerId === me && u.status !== "refusee" && sameDay(new Date(u.start), d));
          return (
            <section key={d.toISOString()} className={cx("app-card app-rise flex min-h-[180px] flex-col p-4", isToday && "ring-2 ring-encre")}>
              <header className="mb-3 flex items-baseline justify-between">
                <p className="app-label">{d.toLocaleDateString("fr-FR", { weekday: "long" })}</p>
                <p className="font-serif text-[24px] leading-none">{d.getDate()}</p>
              </header>
              {!works && <p className="app-stripes mt-auto rounded-xl p-3 text-center text-[12px] text-encre/50">Repos</p>}
              {offs.map((u) => (
                <p key={u.id} className={cx("app-stripes mb-2 rounded-xl px-3 py-2 text-[12px]", u.status === "validee" ? "text-encre/60" : "text-bordeaux")}>
                  {fmtTime(u.start)}–{fmtTime(u.end)} · {u.status === "validee" ? "Indisponible" : "Demande en attente"}
                </p>
              ))}
              <ul className="space-y-2">
                {items.map((r) => (
                  <li key={r.id} className={cx("rounded-xl border-l-[3px] px-3 py-2", WORKER_TONE[me].soft, r.status === "terminee" && "opacity-55")} style={{ borderLeftColor: WORKER_TONE[me].hex }}>
                    <p className="text-[12px] tabular-nums text-encre/55">{fmtTime(r.start)} – {fmtTime(r.end)}</p>
                    <p className="text-[13px] font-medium leading-snug">{clientOf(state, r.clientId)?.name}</p>
                    <p className="text-[12px] leading-snug text-encre/60">{serviceOf(state, r.serviceId)?.name}</p>
                  </li>
                ))}
              </ul>
              {works && items.length === 0 && offs.length === 0 && <p className="mt-auto text-[12px] text-encre/40">Aucun rendez-vous</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
