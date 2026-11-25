"use client";
import { useState } from "react";
import { useStore, useToast } from "@/lib/app/store";
import { clientOf, fmtShort, fmtTime, impactedBy, occupancy, sameDay, serviceOf, startOfDay, workerName } from "@/lib/app/rules";
import { Count, Ring, StackChart } from "./glass/charts";
import type { Reservation } from "@/lib/app/types";
import type { ViewId } from "../Shell";
import { AssignButtons, AssignReasons, DayLanes, ReservationDrawer, ResRow, useNow } from "../shared";
import { Avatar, Button, Card, Empty, Icon, Meter, POLE, Stat, WORKER_TONE } from "../ui";

const POLE_HEX = { physique: "#D9B8AE", mentale: "#4F6788", sociale: "#7E8F80" } as const;

export default function Overview({ go }: { go: (v: ViewId) => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const now = useNow();
  const [sel, setSel] = useState<Reservation | null>(null);
  const today = startOfDay(now);

  const todays = state.reservations.filter((r) => sameDay(new Date(r.start), now) && !["annulee", "a_affecter"].includes(r.status));
  const queue = state.reservations.filter((r) => r.status === "a_affecter").sort((a, b) => a.start.localeCompare(b.start));
  const toValidate = state.tasks.filter((t) => t.status === "demandee" || t.status === "terminee");
  const offs = state.unavailabilities.filter((u) => u.status === "en_attente");
  const weekOcc = state.workers.map((w) => ({ w, v: occupancy(state, w.id, today, 7) }));
  const avg = weekOcc.reduce((a, x) => a + x.v, 0) / Math.max(1, weekOcc.length);
  const done = todays.filter((r) => r.status === "terminee").length;
  const inProgress = todays.filter((r) => r.status === "en_cours").length;
  const queueToday = queue.filter((r) => sameDay(new Date(r.start), now)).length;
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const week = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const horizon = today.getTime() + 7 * 86400000;
  const upcoming = state.reservations.filter((r) => r.status !== "annulee" && new Date(r.start).getTime() >= today.getTime() && new Date(r.start).getTime() < horizon);
  const poleParts = (["physique", "mentale", "sociale"] as const).map((pole) => ({
    label: POLE[pole].label,
    color: POLE_HEX[pole],
    value: upcoming.filter((r) => serviceOf(state, r.serviceId)?.pole === pole).length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Journée */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-[22px]">Aujourd&apos;hui</h2>
            <span className="nx-raised rounded-md px-2 py-1 text-[11px]">Rendez-vous</span>
          </div>
          <p className="mt-3 font-serif text-[clamp(56px,6vw,84px)] font-medium leading-[0.9] tracking-[-0.03em]"><Count value={todays.length} /></p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-encre/60">
            <span className="rounded-md bg-sauge/20 px-1.5 py-0.5 font-medium text-sauge-fonce">{done} terminé{done > 1 ? "s" : ""}</span>
            {inProgress > 0 && <span className="rounded-md bg-egeen/15 px-1.5 py-0.5 font-medium text-egeen">{inProgress} en cours</span>}
            <span>{queueToday ? `${queueToday} à affecter aujourd'hui` : "planning du jour complet"}</span>
          </p>
          <div className="my-4 grid grid-cols-2 gap-2">
            <Button onClick={() => go("agenda")}>Ouvrir l&apos;agenda <Icon name="arrow" size={14} /></Button>
            <Button variant="ghost" onClick={() => go("reservations")} className="nx-raised">Réservations</Button>
          </div>
          <div className="nx-inner mt-auto flex rounded-xl py-2">
            {state.workers.map((w) => (
              <div key={w.id} className="min-w-0 flex-1 border-r border-[var(--nx-line)] px-3">
                <span className="block truncate text-[10.5px] text-encre/55">{w.name}</span>
                <strong className="mt-0.5 block text-[14px] font-medium">{todays.filter((r) => r.workerId === w.id).length} rdv</strong>
              </div>
            ))}
            <div className="min-w-0 flex-1 px-3">
              <span className="block text-[10.5px] text-encre/55">À affecter</span>
              <strong className="mt-0.5 block text-[14px] font-medium text-bordeaux">{queue.length}</strong>
            </div>
          </div>
        </Card>

        {/* Indicateurs */}
        <div className="nx-inner grid grid-cols-2 gap-2 rounded-[22px] p-2">
          <Stat className="!rounded-2xl !p-4 nx-tinted" label="Occupation 7 j" value={Math.round(avg * 100)} format="percent" hint="Moyenne de l'équipe" />
          <Stat className="!rounded-2xl !p-4" label="À affecter" value={queue.length} tone={queue.length ? "text-bordeaux" : undefined} hint="Sans préférence" />
          <Stat className="!rounded-2xl !p-4" label="Tâches à traiter" value={toValidate.length} hint="Demandes et validations" />
          <Stat className="!rounded-2xl !p-4" label="Indisponibilités" value={offs.length} hint="En attente de décision" />
          <div className="col-span-2 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => go("boutique")}
              className="flex items-center justify-between rounded-2xl border border-encre/10 bg-ivoire/40 px-4 py-3 text-left transition-colors hover:border-rose/40 hover:bg-ivoire/70"
            >
              <span>
                <span className="app-label block">Boutique e-commerce</span>
                <span className="mt-1 block font-serif text-[18px]">Gérer le catalogue</span>
                <span className="mt-0.5 block text-[12px] text-encre/55">Produits, vitrine et collection en ligne</span>
              </span>
              <Icon name="arrow" size={16} />
            </button>
            <button
              type="button"
              onClick={() => go("events")}
              className="flex items-center justify-between rounded-2xl border border-encre/10 bg-ivoire/40 px-4 py-3 text-left transition-colors hover:border-sauge/50 hover:bg-ivoire/70"
            >
              <span>
                <span className="app-label block">Événements</span>
                <span className="mt-1 block font-serif text-[18px]">Valider les ateliers</span>
                <span className="mt-0.5 block text-[12px] text-encre/55">Propositions de l&apos;équipe et inscriptions</span>
              </span>
              <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>

        {/* Semaine */}
        <Card className="lg:col-span-2 2xl:col-span-1">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h2 className="font-serif text-[22px] leading-tight">Rendez-vous de la semaine</h2>
              <p className="text-[12px] text-encre/55">Par jour et par travailleuse</p>
            </div>
          </div>
          <StackChart
            title="Rendez-vous par jour et par travailleuse"
            series={state.workers.map((w) => ({ label: w.name, color: WORKER_TONE[w.id].hex }))}
            items={week.map((d) => ({
              label: d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
              parts: state.workers.map((w) => state.reservations.filter((r) => r.workerId === w.id && !["annulee", "a_affecter"].includes(r.status) && sameDay(new Date(r.start), d)).length),
            }))}
            height={150}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card
          eyebrow="File d'attente"
          title="Réservations à affecter"
          action={
            <Button size="sm" variant="ghost" onClick={() => go("reservations")}>
              Tout voir <Icon name="arrow" size={14} />
            </Button>
          }
        >
          {queue.length === 0 ? (
            <Empty>Aucune réservation en attente. Les réservations « sans préférence » arrivent ici.</Empty>
          ) : (
            <ul className="divide-y divide-encre/[0.07]">
              {queue.map((r) => (
                <li key={r.id} className="py-1">
                  <ResRow r={r} onClick={() => setSel(r)} right={<span className="text-[12px] text-encre/50">{fmtShort(r.start)}</span>} />
                  <div className="pb-3 pl-[68px]">
                    {r.note && <p className="mb-2 text-[12px] text-bordeaux">{r.note}</p>}
                    <AssignButtons r={r} />
                    <AssignReasons r={r} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card eyebrow="7 prochains jours" title="Répartition par pôle">
            <Ring center={poleParts.reduce((a, p) => a + p.value, 0)} caption="rendez-vous" parts={poleParts} />
          </Card>
          <Card eyebrow="Équipe" title="Aujourd'hui">
            <ul className="space-y-4">
              {state.workers.map((w) => {
                const mine = todays.filter((r) => r.workerId === w.id).sort((a, b) => a.start.localeCompare(b.start));
                const next = mine.find((r) => new Date(r.end) > now && r.status !== "terminee" && r.status !== "absence");
                const current = mine.find((r) => r.status === "en_cours");
                const occ = weekOcc.find((x) => x.w.id === w.id)!.v;
                return (
                  <li key={w.id} className="rounded-2xl bg-voile/70 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar id={w.id} label={w.initials} size={38} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{w.name}</p>
                        <p className="truncate text-[12.5px] text-encre/55">
                          {current
                            ? `En soin avec ${clientOf(state, current.clientId)?.name}`
                            : next
                              ? `Prochaine : ${clientOf(state, next.clientId)?.name} à ${fmtTime(next.start)}`
                              : mine.length
                                ? "Journée terminée"
                                : "Aucun rendez-vous"}
                        </p>
                      </div>
                      <p className="font-serif text-[28px] leading-none">{mine.length}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Meter value={occ} color={WORKER_TONE[w.id].bg} />
                      <span className="w-20 shrink-0 text-right text-[11.5px] text-encre/50">{Math.round(occ * 100)} % / 7 j</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          {(offs.length > 0 || toValidate.length > 0) && (
            <Card eyebrow="Décisions" title="En attente de vous">
              <ul className="space-y-3">
                {offs.map((u) => {
                  const imp = impactedBy(state, u.workerId, u.start, u.end).length;
                  return (
                    <li key={u.id} className="rounded-2xl border border-bordeaux/20 bg-bordeaux/[0.04] p-4">
                      <p className="text-[13.5px]">
                        <strong className="font-medium">{workerName(state, u.workerId)}</strong> indisponible le {fmtShort(u.start)}, {fmtTime(u.start)}–{fmtTime(u.end)}
                      </p>
                      <p className="mt-1 text-[12px] text-encre/55">
                        {u.reason} · {imp ? `${imp} rendez-vous à réaffecter si validée` : "aucun rendez-vous impacté"}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={() => { dispatch({ type: "decideOff", id: u.id, approve: true }); toast("Indisponibilité validée"); }}>Valider</Button>
                        <Button size="sm" variant="ghost" onClick={() => { dispatch({ type: "decideOff", id: u.id, approve: false }); toast("Indisponibilité refusée", "warn"); }}>Refuser</Button>
                      </div>
                    </li>
                  );
                })}
                {toValidate.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-voile/70 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{t.title}</p>
                      <p className="text-[12px] text-encre/55">
                        {t.status === "demandee" ? `Demandée par ${workerName(state, t.assignee)}` : `Terminée par ${workerName(state, t.assignee)} — à valider`}
                      </p>
                    </div>
                    {t.status === "demandee" ? (
                      <div className="flex gap-1.5">
                        <Button size="sm" onClick={() => { dispatch({ type: "decideTask", id: t.id, approve: true }); toast("Demande acceptée"); }}>Accepter</Button>
                        <Button size="sm" variant="ghost" onClick={() => { dispatch({ type: "decideTask", id: t.id, approve: false }); toast("Demande refusée", "warn"); }}>Refuser</Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => { dispatch({ type: "setTaskStatus", id: t.id, status: "validee", by: "admin" }); toast("Tâche validée"); }}>Valider</Button>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <Card
        eyebrow="Planning"
        title="Journée en cours"
        action={
          <Button size="sm" variant="ghost" onClick={() => go("agenda")}>
            Agenda complet <Icon name="arrow" size={14} />
          </Button>
        }
      >
        <DayLanes
          date={now}
          onSelect={setSel}
          hourPx={48}
          lanes={[...state.workers.map((w) => ({ key: w.id, label: w.name, workerId: w.id })), { key: "q", label: "À affecter", workerId: null }]}
        />
      </Card>

      <Card eyebrow="Traçabilité" title="Journal d'activité">
        <ul className="divide-y divide-encre/[0.06]">
          {state.log.slice(0, 8).map((l) => (
            <li key={l.id} className="flex gap-4 py-2.5 text-[13px]">
              <span className="w-12 shrink-0 tabular-nums text-encre/45">{fmtTime(l.at)}</span>
              <span className="text-encre/80">{l.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      <ReservationDrawer r={sel} onClose={() => setSel(null)} />
    </div>
  );
}

