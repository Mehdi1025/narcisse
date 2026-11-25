"use client";
import { useEffect, useState } from "react";
import { useStore, useToast } from "@/lib/app/store";
import { canAssign, clientOf, fmtShort, fmtTime, sameDay, serviceOf, workerName } from "@/lib/app/rules";
import type { Reservation, WorkerId } from "@/lib/app/types";
import { Avatar, Button, Chip, Drawer, Icon, PoleDot, StatusBadge, WORKER_TONE, cx } from "./ui";

export const DAY_START = 9;
export const DAY_END = 19;
const hOf = (iso: string) => {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
};

/** Heure courante, rafraîchie chaque minute. */
export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

type Lane = { key: string; label: string; workerId: WorkerId | null };

/** Planning en colonnes (une par travailleuse, plus la file « À affecter »). */
export function DayLanes({ date, lanes, onSelect, hourPx = 62 }: { date: Date; lanes: Lane[]; onSelect: (r: Reservation) => void; hourPx?: number }) {
  const { state } = useStore();
  const now = useNow();
  const hours = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i);
  const height = (DAY_END - DAY_START) * hourPx;
  const isToday = sameDay(date, now);
  const nowH = now.getHours() + now.getMinutes() / 60;

  return (
    <div className="app-scroll overflow-x-auto">
      <div className="min-w-[560px] pb-3">
        <div className="grid" style={{ gridTemplateColumns: `52px repeat(${lanes.length}, minmax(0,1fr))` }}>
          <div />
          {lanes.map((l) => (
            <div key={l.key} className="flex items-center gap-2 px-2 pb-3">
              {l.workerId ? <Avatar id={l.workerId} label={state.workers.find((w) => w.id === l.workerId)?.initials ?? ""} size={24} /> : <span className="grid h-6 w-6 place-items-center rounded-full border border-dashed border-bordeaux/50 text-bordeaux"><Icon name="alert" size={12} /></span>}
              <span className="text-[13px] font-medium">{l.label}</span>
            </div>
          ))}
        </div>
        <div className="relative grid" style={{ gridTemplateColumns: `52px repeat(${lanes.length}, minmax(0,1fr))`, height }}>
          {/* Graduations */}
          <div className="relative">
            {hours.map((h) => (
              <span key={h} className="absolute right-3 -translate-y-1/2 text-[11px] tabular-nums text-encre/40" style={{ top: (h - DAY_START) * hourPx }}>
                {h}h
              </span>
            ))}
          </div>
          {lanes.map((l) => {
            const w = l.workerId ? state.workers.find((x) => x.id === l.workerId) : null;
            const works = w ? w.days.includes(date.getDay()) : true;
            const items = state.reservations.filter(
              (r) => sameDay(new Date(r.start), date) && r.status !== "annulee" && (l.workerId ? r.workerId === l.workerId : r.status === "a_affecter"),
            );
            const offs = w ? state.unavailabilities.filter((u) => u.workerId === w.id && u.status !== "refusee" && sameDay(new Date(u.start), date)) : [];
            return (
              <div key={l.key} className={cx("relative mx-1 rounded-2xl border border-encre/[0.06]", l.workerId ? "bg-voile/60" : "bg-bordeaux/[0.03]")}>
                {hours.slice(1, -1).map((h) => (
                  <div key={h} className="absolute inset-x-0 border-t border-encre/[0.05]" style={{ top: (h - DAY_START) * hourPx }} />
                ))}
                {/* Hors horaires */}
                {w && works && w.hours.start > DAY_START && <div className="app-stripes absolute inset-x-0 top-0 rounded-t-2xl" style={{ height: (w.hours.start - DAY_START) * hourPx }} />}
                {w && works && w.hours.end < DAY_END && <div className="app-stripes absolute inset-x-0 bottom-0 rounded-b-2xl" style={{ height: (DAY_END - w.hours.end) * hourPx }} />}
                {w && !works && <div className="app-stripes absolute inset-0 grid place-items-center rounded-2xl text-[12px] text-encre/45">Repos</div>}
                {offs.map((u) => (
                  <div
                    key={u.id}
                    className={cx("app-stripes absolute inset-x-1 rounded-xl border px-2 py-1 text-[11px]", u.status === "validee" ? "border-encre/20 text-encre/60" : "border-dashed border-bordeaux/50 text-bordeaux")}
                    style={{ top: (Math.max(DAY_START, hOf(u.start)) - DAY_START) * hourPx, height: (Math.min(DAY_END, hOf(u.end)) - Math.max(DAY_START, hOf(u.start))) * hourPx }}
                  >
                    {u.status === "validee" ? "Indisponible" : "Indispo. en attente"}
                  </div>
                ))}
                {items.map((r) => (
                  <ResBlock key={r.id} r={r} hourPx={hourPx} onClick={() => onSelect(r)} />
                ))}
                {isToday && nowH > DAY_START && nowH < DAY_END && (
                  <div className="pointer-events-none absolute inset-x-0 z-10 h-px bg-bordeaux" style={{ top: (nowH - DAY_START) * hourPx }}>
                    <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-bordeaux" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ResBlock({ r, hourPx, onClick }: { r: Reservation; hourPx: number; onClick: () => void }) {
  const { state } = useStore();
  const sv = serviceOf(state, r.serviceId);
  const c = clientOf(state, r.clientId);
  const top = (hOf(r.start) - DAY_START) * hourPx;
  const h = Math.max(28, (hOf(r.end) - hOf(r.start)) * hourPx - 3);
  const tone = r.workerId ? WORKER_TONE[r.workerId] : null;
  const done = r.status === "terminee" || r.status === "absence";
  return (
    <button
      onClick={onClick}
      className={cx(
        "group absolute inset-x-1 overflow-hidden rounded-xl px-2.5 py-1.5 text-left transition-[transform,box-shadow] duration-200 hover:z-20 hover:-translate-y-px hover:shadow-md",
        tone ? `${tone.soft} border-l-[3px]` : "border border-dashed border-bordeaux/60 bg-papier",
        done && "opacity-55",
        r.status === "en_cours" && "ring-2 ring-sauge",
      )}
      style={{ top, height: h, borderLeftColor: tone?.hex }}
    >
      <p className="truncate text-[12.5px] font-medium leading-tight text-encre">{c?.name}</p>
      {h > 36 && <p className="truncate text-[11.5px] leading-tight text-encre/60">{sv?.name}</p>}
      {h > 54 && <p className="mt-0.5 text-[11px] tabular-nums text-encre/45">{fmtTime(r.start)} – {fmtTime(r.end)}</p>}
    </button>
  );
}

/** Boutons d'affectation avec règle expliquée au survol. */
export function AssignButtons({ r, size = "sm" }: { r: Reservation; size?: "sm" | "md" }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      {state.workers.map((w) => {
        const check = canAssign(state, w.id, r);
        const preferred = r.preference === w.id;
        return (
          <Button
            key={w.id}
            size={size}
            variant={check.ok ? (preferred ? "primary" : "ghost") : "ghost"}
            disabled={!check.ok}
            title={check.ok ? `Affecter à ${w.name}` : check.reason}
            onClick={() => {
              dispatch({ type: "assign", id: r.id, workerId: w.id, by: "admin" });
              toast(`Affecté à ${w.name}`);
            }}
          >
            <span className={cx("h-2 w-2 rounded-full", WORKER_TONE[w.id].bg)} />
            {w.name}
          </Button>
        );
      })}
    </div>
  );
}

/** Raisons de blocage lisibles sous les boutons. */
export function AssignReasons({ r }: { r: Reservation }) {
  const { state } = useStore();
  const blocked = state.workers.map((w) => ({ w, c: canAssign(state, w.id, r) })).filter((x) => !x.c.ok);
  if (!blocked.length) return null;
  return (
    <ul className="mt-2 space-y-0.5">
      {blocked.map(({ w, c }) => (
        <li key={w.id} className="text-[11.5px] text-encre/50">
          {!c.ok && c.reason}
        </li>
      ))}
    </ul>
  );
}

/** Détail d'un rendez-vous (côté administratrice). */
export function ReservationDrawer({ r, onClose }: { r: Reservation | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const live = r ? state.reservations.find((x) => x.id === r.id) ?? r : null;
  if (!live) return null;
  const sv = serviceOf(state, live.serviceId);
  const c = clientOf(state, live.clientId);
  return (
    <Drawer open onClose={onClose} title={c?.name ?? "Rendez-vous"}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge kind="res" status={live.status} />
          {sv && (
            <Chip>
              <PoleDot pole={sv.pole} /> {sv.name}
            </Chip>
          )}
          <Chip>{live.source === "comptoir" ? "Au comptoir" : "En ligne"}</Chip>
        </div>
        <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-voile/70 p-4 text-[13px]">
          <div>
            <dt className="app-label">Date</dt>
            <dd className="mt-1">{fmtShort(live.start)}</dd>
          </div>
          <div>
            <dt className="app-label">Horaire</dt>
            <dd className="mt-1 tabular-nums">{fmtTime(live.start)} – {fmtTime(live.end)}</dd>
          </div>
          <div>
            <dt className="app-label">Préférence</dt>
            <dd className="mt-1">{workerName(state, live.preference)}</dd>
          </div>
          <div>
            <dt className="app-label">Réalisé par</dt>
            <dd className="mt-1">{live.workerId ? workerName(state, live.workerId) : "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="app-label">Téléphone</dt>
            <dd className="mt-1">{c?.phone}</dd>
          </div>
        </dl>
        {live.note && <p className="rounded-xl bg-rose/30 px-4 py-3 text-[13px] text-bordeaux">{live.note}</p>}
        {live.status === "a_affecter" && (
          <div>
            <p className="app-label mb-2">Affecter à</p>
            <AssignButtons r={live} size="md" />
            <AssignReasons r={live} />
          </div>
        )}
        {live.status === "confirmee" && (
          <div>
            <p className="app-label mb-2">Réaffecter</p>
            <AssignButtons r={live} />
            <AssignReasons r={live} />
          </div>
        )}
        {["a_affecter", "confirmee"].includes(live.status) && (
          <Button
            variant="danger"
            onClick={() => {
              dispatch({ type: "cancelReservation", id: live.id, by: "admin" });
              toast("Réservation annulée", "warn");
              onClose();
            }}
          >
            Annuler la réservation
          </Button>
        )}
      </div>
    </Drawer>
  );
}

/** Ligne compacte de rendez-vous. */
export function ResRow({ r, onClick, right }: { r: Reservation; onClick?: () => void; right?: React.ReactNode }) {
  const { state } = useStore();
  const sv = serviceOf(state, r.serviceId);
  const c = clientOf(state, r.clientId);
  return (
    <div className="flex items-center gap-3 py-3">
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <div className="w-14 shrink-0 text-center">
          <p className="font-serif text-[20px] leading-none tabular-nums">{fmtTime(r.start)}</p>
          <p className="mt-1 text-[10.5px] text-encre/45">{sv?.duration} min</p>
        </div>
        <span className="h-9 w-[3px] shrink-0 rounded-full" style={{ background: r.workerId ? WORKER_TONE[r.workerId].hex : "transparent", border: r.workerId ? undefined : "1px dashed #96433A" }} />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium">{c?.name}</p>
          <p className="truncate text-[12.5px] text-encre/55">{sv?.name}</p>
        </div>
      </button>
      {right ?? <StatusBadge kind="res" status={r.status} />}
    </div>
  );
}
