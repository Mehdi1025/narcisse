"use client";
import { useStore, useToast } from "@/lib/app/store";
import { fmtH, fmtShort, fmtTime, impactedBy, occupancy, startOfDay } from "@/lib/app/rules";
import { SKILLS } from "@/lib/app/seed";
import { Avatar, Button, Card, Empty, Meter, POLE, PoleDot, WORKER_TONE, cx } from "../ui";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function Team() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const today = startOfDay(new Date());
  const offs = [...state.unavailabilities].sort((a, b) => (a.status === "en_attente" ? -1 : 1) - (b.status === "en_attente" ? -1 : 1) || a.start.localeCompare(b.start));
  const nobody = state.services.filter((s) => !state.workers.some((w) => w.services.includes(s.id)));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        {state.workers.map((w) => {
          const occ = occupancy(state, w.id, today, 7);
          return (
            <Card key={w.id}>
              <div className="flex items-center gap-4">
                <Avatar id={w.id} label={w.initials} size={52} />
                <div className="flex-1">
                  <h2 className="font-serif text-[26px] leading-tight">{w.name}</h2>
                  <p className="text-[12.5px] text-encre/55">
                    {w.days.map((d) => DAYS[d]).join(" · ")} — {fmtH(w.hours.start)} à {fmtH(w.hours.end)}
                  </p>
                </div>
                <div className="w-28 text-right">
                  <p className="font-serif text-[26px] leading-none">{Math.round(occ * 100)} %</p>
                  <p className="mb-1.5 text-[11px] text-encre/45">occupation 7 j</p>
                  <Meter value={occ} color={WORKER_TONE[w.id].bg} />
                </div>
              </div>

              <p className="app-label mb-2 mt-6">Habilitations — prestations réalisables</p>
              <div className="flex flex-wrap gap-2">
                {state.services.map((s) => {
                  const on = w.services.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => { dispatch({ type: "toggleService", workerId: w.id, serviceId: s.id }); toast(`${s.name} ${on ? "retiré" : "ajouté"} pour ${w.name}`); }}
                      className={cx("inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[12.5px] transition-colors", on ? "border-encre bg-encre text-ivoire" : "border-encre/15 text-encre/60 hover:border-encre/40")}
                      aria-pressed={on}
                    >
                      <PoleDot pole={s.pole} />
                      {s.name}
                    </button>
                  );
                })}
              </div>

              <p className="app-label mb-2 mt-5">Compétences — tâches internes</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((k) => {
                  const on = w.skills.includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() => dispatch({ type: "toggleSkill", workerId: w.id, skill: k })}
                      className={cx("h-8 rounded-full border px-3 text-[12.5px] transition-colors", on ? `border-transparent ${WORKER_TONE[w.id].soft} ${WORKER_TONE[w.id].text}` : "border-encre/15 text-encre/55 hover:border-encre/40")}
                      aria-pressed={on}
                    >
                      {k}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {nobody.length > 0 && (
        <div className="rounded-2xl border border-bordeaux/25 bg-bordeaux/[0.04] p-5 text-[13px]">
          <p className="font-medium text-bordeaux">Prestations sans travailleuse habilitée</p>
          <p className="mt-1 text-encre/65">
            {nobody.map((s) => s.name).join(", ")} — ces réservations ne peuvent pas être affectées. Pôle {POLE.mentale.label.toLowerCase()} : intervenant·e à définir (question ouverte QB-01).
          </p>
        </div>
      )}

      <Card eyebrow="Absences" title="Indisponibilités">
        {offs.length === 0 ? (
          <Empty>Aucune indisponibilité déclarée.</Empty>
        ) : (
          <ul className="divide-y divide-encre/[0.07]">
            {offs.map((u) => {
              const imp = impactedBy(state, u.workerId, u.start, u.end);
              const w = state.workers.find((x) => x.id === u.workerId)!;
              return (
                <li key={u.id} className="flex flex-wrap items-center gap-4 py-4">
                  <Avatar id={w.id} label={w.initials} size={34} />
                  <div className="min-w-[200px] flex-1">
                    <p className="text-[14px]">
                      <span className="font-medium">{w.name}</span> — <span className="first-letter:uppercase">{fmtShort(u.start)}</span>, {fmtTime(u.start)}–{fmtTime(u.end)}
                    </p>
                    <p className="text-[12.5px] text-encre/55">
                      {u.reason}
                      {u.status === "en_attente" && ` · ${imp.length ? `${imp.length} rendez-vous repartiront dans la file d'affectation` : "aucun rendez-vous impacté"}`}
                    </p>
                  </div>
                  {u.status === "en_attente" ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { dispatch({ type: "decideOff", id: u.id, approve: true }); toast("Indisponibilité validée"); }}>Valider</Button>
                      <Button size="sm" variant="ghost" onClick={() => { dispatch({ type: "decideOff", id: u.id, approve: false }); toast("Indisponibilité refusée", "warn"); }}>Refuser</Button>
                    </div>
                  ) : (
                    <span className={cx("rounded-full px-3 py-1 text-[12px]", u.status === "validee" ? "bg-sauge/20 text-sauge-fonce" : "bg-encre/[0.05] text-encre/50")}>
                      {u.status === "validee" ? "Validée" : "Refusée"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
