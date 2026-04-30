"use client";

import { ArrowRight } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { TRIZAC_DATA } from "@/lib/data";

const METRICS = [
  { val: "143", lab: "habitants actifs / mois", evo: "+12" },
  { val: "38", lab: "contributions / sem.", evo: "+5" },
  { val: "4", lab: "signalements ouverts", evo: "−2" },
  { val: "12", lab: "h bénévolat / sem.", evo: "+3 h" },
];

const BENEVOLAT_AGGREGE = [
  { cat: "Événements", h: 24, max: 40 },
  { cat: "Aînés", h: 18, max: 40 },
  { cat: "Espaces verts", h: 32, max: 40 },
  { cat: "Périscolaire", h: 12, max: 40 },
];

export function MairieScreen() {
  return (
    <div>
      <div className="bg-ink text-surface px-[18px] py-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] opacity-60">
          Vue mairie · Référent
        </div>
        <div className="font-bold text-[24px] mt-1 tracking-title">
          Pulsation de Trizac
        </div>
      </div>

      <div className="p-[18px]">
        <div className="grid grid-cols-2 gap-2">
          {METRICS.map((m, i) => (
            <Surface key={i} padded={false} className="p-3">
              <div className="font-bold text-[24px] text-ink leading-none">
                {m.val}{" "}
                <span
                  className={[
                    "text-[11px] font-semibold",
                    m.evo.startsWith("+") ? "text-success" : "text-ink-muted",
                  ].join(" ")}
                >
                  {m.evo}
                </span>
              </div>
              <div className="text-[11px] text-ink-muted mt-1.5">{m.lab}</div>
            </Surface>
          ))}
        </div>
      </div>

      <Section title="À traiter">
        {TRIZAC_DATA.mairieAlerts.map((a) => {
          const c = a.priorite === "haute" ? "#a8332b" : "#e8a838";
          return (
            <Surface as="button" key={a.id} className="w-full">
              <div className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="w-1.5 h-1.5 rounded-pill mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: c }}
                />
                <span className="sr-only">
                  Priorité {a.priorite === "haute" ? "haute" : "normale"}.
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-[13.5px] text-ink">
                    {a.titre}
                  </div>
                  <div className="text-[11.5px] text-ink-muted mt-0.5">{a.age}</div>
                </div>
                <ArrowRight size={14} strokeWidth={1.6} className="text-ink-muted" />
              </div>
            </Surface>
          );
        })}
      </Section>

      <Section title="Bénévolat — vue agrégée">
        <Surface>
          <div className="text-[12px] text-ink-soft mb-2.5">
            Sur 30 jours · pas de classement individuel
          </div>
          {BENEVOLAT_AGGREGE.map((x) => (
            <div key={x.cat} className="mb-2 last:mb-0">
              <div className="flex justify-between text-[12px] text-ink-soft mb-1">
                <span>{x.cat}</span>
                <span className="font-semibold text-ink">{x.h} h</span>
              </div>
              <div
                className="h-1.5 bg-surface-alt rounded overflow-hidden"
                role="progressbar"
                aria-valuenow={x.h}
                aria-valuemin={0}
                aria-valuemax={x.max}
                aria-label={`${x.cat} : ${x.h} heures sur ${x.max}`}
              >
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(x.h / x.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </Surface>
      </Section>
    </div>
  );
}
