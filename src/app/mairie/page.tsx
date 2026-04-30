import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import {
  countOpenErrors,
  listAuditLog,
  listMairieAlerts,
  listMissions,
  listOpenModerationFlags,
  pulse,
} from "@/lib/queries";

const BENEVOLAT_AGGREGE = [
  { cat: "Événements", h: 24, max: 40 },
  { cat: "Aînés", h: 18, max: 40 },
  { cat: "Espaces verts", h: 32, max: 40 },
  { cat: "Périscolaire", h: 12, max: 40 },
];

export default async function Page() {
  const [p, alerts, missions, audit, modFlags, openErrors] = await Promise.all([
    pulse(),
    listMairieAlerts(),
    listMissions(),
    listAuditLog(20),
    listOpenModerationFlags(),
    countOpenErrors(7),
  ]);

  const benevHours = missions
    .filter((m) => m.cat)
    .reduce<Record<string, number>>((acc, m) => {
      acc[m.cat] = (acc[m.cat] ?? 0) + m.inscrits * 3;
      return acc;
    }, {});

  return (
    <ScreenShell>
      <div className="bg-ink text-surface px-[18px] py-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] opacity-60">
          Vue mairie · Référent
        </div>
        <div className="font-bold text-[24px] mt-1 tracking-title">Pulsation de Trizac</div>
      </div>

      <div className="p-[18px]">
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: p.habitantsActifs, lab: "habitants actifs / mois" },
            { val: p.contribsSem, lab: "contributions / sem." },
            { val: p.ouverts, lab: "signalements ouverts" },
            { val: p.reservPending, lab: "réservations à valider" },
          ].map((m, i) => (
            <Surface key={i} padded={false} className="p-3">
              <div className="font-bold text-[24px] text-ink leading-none tabular-nums">{m.val}</div>
              <div className="text-[11px] text-ink-muted mt-1.5">{m.lab}</div>
            </Surface>
          ))}
        </div>
      </div>

      <Section
        title="À traiter"
        action={
          <div className="flex flex-wrap gap-2.5 text-[12px] justify-end">
            <Link href="/mairie/reservations" className="no-underline text-primary font-semibold">
              Réservations →
            </Link>
            <Link href="/mairie/moderation" className="no-underline text-primary font-semibold">
              Modération
              {modFlags.length > 0 && (
                <span className="ml-1 px-1.5 py-px rounded-pill bg-danger text-white text-[10px] font-bold">
                  {modFlags.length}
                </span>
              )}
            </Link>
            <Link href="/mairie/emails" className="no-underline text-primary font-semibold">
              Emails →
            </Link>
            <Link href="/mairie/sms" className="no-underline text-primary font-semibold">
              SMS →
            </Link>
            <Link href="/mairie/errors" className="no-underline text-primary font-semibold">
              Erreurs
              {openErrors > 0 && (
                <span className="ml-1 px-1.5 py-px rounded-pill bg-danger text-white text-[10px] font-bold">
                  {openErrors}
                </span>
              )}
            </Link>
            <Link href="/mairie/analytics" className="no-underline text-primary font-semibold">
              Analytics →
            </Link>
          </div>
        }
      >
        {alerts.length === 0 ? (
          <div className="text-[13px] text-ink-muted text-center py-2">
            Aucune alerte. Tout est à jour.
          </div>
        ) : (
          alerts.map((a) => {
            const c = a.priorite === "haute" ? "#a8332b" : "#e8a838";
            return (
              <Link key={a.id} href={a.href} className="contents">
                <Surface as="button" className="w-full">
                  <div className="flex items-start gap-2.5">
                    <span aria-hidden className="w-1.5 h-1.5 rounded-pill mt-1.5 flex-shrink-0" style={{ backgroundColor: c }} />
                    <span className="sr-only">Priorité {a.priorite}.</span>
                    <div className="flex-1">
                      <div className="font-semibold text-[13.5px] text-ink">{a.titre}</div>
                      <div className="text-[11.5px] text-ink-muted mt-0.5">{a.age}</div>
                    </div>
                    <ArrowRight size={14} strokeWidth={1.6} className="text-ink-muted" />
                  </div>
                </Surface>
              </Link>
            );
          })
        )}
      </Section>

      <Section title="Bénévolat — vue agrégée">
        <Surface>
          <div className="text-[12px] text-ink-soft mb-2.5">
            Sur 30 jours · pas de classement individuel
          </div>
          {BENEVOLAT_AGGREGE.map((x) => {
            const real = benevHours[x.cat] ?? x.h;
            return (
              <div key={x.cat} className="mb-2 last:mb-0">
                <div className="flex justify-between text-[12px] text-ink-soft mb-1">
                  <span>{x.cat}</span>
                  <span className="font-semibold text-ink">{real} h</span>
                </div>
                <div
                  className="h-1.5 bg-surface-alt rounded overflow-hidden"
                  role="progressbar"
                  aria-valuenow={real}
                  aria-valuemin={0}
                  aria-valuemax={x.max}
                  aria-label={`${x.cat} : ${real} heures sur ${x.max}`}
                >
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, (real / x.max) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </Surface>
      </Section>

      <Section
        title="Journal des décisions"
        action={<Link href="/mairie/journal" className="no-underline">Tout voir →</Link>}
      >
        <Surface>
          <ul className="space-y-2 text-[12.5px]">
            {audit.slice(0, 8).map((a) => (
              <li key={a.id} className="flex gap-2.5 items-start">
                <span aria-hidden className="w-1 h-1 mt-2 rounded-pill bg-ink-muted" />
                <div>
                  <span className="font-semibold text-ink">{a.actorName ?? "Système"}</span>
                  <span className="text-ink-soft"> · {a.action} </span>
                  <span className="text-ink-muted">({a.entityType})</span>
                  {a.details && <span className="text-ink-muted"> — {a.details}</span>}
                  <div className="text-[11px] text-ink-muted">
                    {a.at.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Surface>
      </Section>
    </ScreenShell>
  );
}
