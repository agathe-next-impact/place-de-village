"use client";

import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { TRIZAC_DATA, type AgendaItem } from "@/lib/data";

const TYPE_COLOR: Record<AgendaItem["type"], string> = {
  officiel: "#1f6e7a",
  asso: "#e8a838",
  benevolat: "#1f6e7a",
};

const TYPE_LABEL: Record<AgendaItem["type"], string> = {
  officiel: "Conseil / Mairie",
  asso: "Association",
  benevolat: "Bénévolat",
};

const ASSOCIATIONS = [
  { n: "Comité des fêtes", m: "24 membres" },
  { n: "Sou des écoles", m: "18 membres" },
  { n: "Amis du Patrimoine", m: "32 membres" },
  { n: "Foot Trizac", m: "47 licenciés" },
];

export function AgendaScreen() {
  return (
    <div>
      <PageHeader subtitle="Pôle 5 — Vie locale" title="Agenda communal" />

      <div className="px-[18px] pb-3.5 flex gap-1.5 flex-wrap">
        {["Tout", "Mairie", "Asso", "Bénévolat"].map((f, i) => (
          <Chip
            key={f}
            background={i === 0 ? "#1c1a17" : "#e9e4dc"}
            color={i === 0 ? "#ffffff" : "#4d4843"}
          >
            {f}
          </Chip>
        ))}
      </div>

      <div className="px-[18px] pb-2">
        <div className="font-bold text-[14px] text-ink-muted uppercase tracking-[0.1em]">
          Novembre 2026
        </div>
      </div>

      <Section dense>
        {TRIZAC_DATA.agenda.slice(0, 4).map((e) => {
          const c = TYPE_COLOR[e.type];
          return (
            <div key={e.id} className="flex gap-3 px-[18px] py-1.5">
              <div className="w-14 flex-shrink-0 text-center">
                <div className="bg-surface-alt rounded py-2 border border-line-soft">
                  <div className="text-[10px] font-bold text-ink-muted uppercase">
                    {e.jour}
                  </div>
                  <div className="font-bold text-[22px] text-ink leading-none">
                    {e.date.split(" ")[0]}
                  </div>
                  <div className="text-[9px] text-ink-muted mt-0.5">
                    {e.date.split(" ")[1]}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <Surface
                  padded={false}
                  className="p-3 border-l-[3px]"
                  style={{ borderLeftColor: c }}
                >
                  <div className="font-semibold text-[14px] text-ink">{e.titre}</div>
                  <div className="text-[12px] text-ink-soft mt-1">
                    {e.heure} · {e.lieu}
                  </div>
                  <div className="mt-2">
                    <Chip size="sm" color={c}>
                      {TYPE_LABEL[e.type]}
                    </Chip>
                  </div>
                </Surface>
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Associations actives">
        <div className="grid grid-cols-2 gap-2">
          {ASSOCIATIONS.map((a) => (
            <Surface key={a.n} padded={false} className="p-3">
              <div className="font-semibold text-[13px] text-ink">{a.n}</div>
              <div className="text-[11px] text-ink-muted mt-0.5">{a.m}</div>
            </Surface>
          ))}
        </div>
      </Section>
    </div>
  );
}
