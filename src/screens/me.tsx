"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { TRIZAC_DATA } from "@/lib/data";

const SAMPLE_NAMES = ["Marie B", "Jean P", "Sophie L", "Paul R"];

export function MeScreen() {
  const [view, setView] = useState<"missions" | "mes">("missions");
  const D = TRIZAC_DATA;
  const items = view === "missions" ? D.missions : D.missions.slice(0, 2);

  return (
    <div>
      <PageHeader subtitle="Pôle 2 — Bénévolat communal" title="Donner un coup de main" />

      {/* Carnet de bord — visible par soi seul. Aucun classement public. */}
      <div className="px-[18px] pb-3.5">
        <div
          className="rounded-lg p-4 text-white"
          style={{
            background: "linear-gradient(135deg, #1f6e7a, rgba(31,110,122,0.8))",
          }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-eyebrow opacity-85">
            Mon carnet de bord
          </div>
          <div className="flex gap-[18px] mt-2">
            <div>
              <div className="font-bold text-[28px] leading-none">
                {D.user.heuresBenevolat} h
              </div>
              <div className="text-[11.5px] opacity-85 mt-0.5">données cette année</div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="font-bold text-[28px] leading-none">
                {D.user.missionsTerminees}
              </div>
              <div className="text-[11.5px] opacity-85 mt-0.5">missions terminées</div>
            </div>
          </div>
          <div className="text-[11px] opacity-75 mt-2.5 italic">
            Visible par vous seul·e — pas de classement public.
          </div>
        </div>
      </div>

      <div className="px-[18px] pb-2 flex gap-1.5">
        {(
          [
            { id: "missions", label: "Missions à pourvoir" },
            { id: "mes", label: "Mes engagements" },
          ] as const
        ).map((tab) => {
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              aria-pressed={active}
              className={[
                "px-3.5 py-2 rounded font-semibold text-[13px] min-h-[36px]",
                active
                  ? "bg-ink text-surface border border-ink"
                  : "bg-transparent text-ink border border-line-soft",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <Section dense>
        {items.map((m) => (
          <Surface key={m.id}>
            <div className="flex justify-between items-start gap-2.5">
              <div className="flex-1 min-w-0">
                <Chip size="sm" color="#e8a838">{m.cat}</Chip>
                <div className="font-bold text-[15px] text-ink mt-1.5 leading-[1.3] tracking-title">
                  {m.titre}
                </div>
                <div className="text-[12px] text-ink-soft mt-1.5 flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={11} strokeWidth={1.6} /> {m.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} strokeWidth={1.6} /> {m.duree}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} strokeWidth={1.6} /> {m.lieu}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[11px] text-ink-muted">recherchés</div>
                <div className="font-bold text-[18px] text-ink leading-none">
                  {m.inscrits}
                  <span className="text-ink-muted text-[12px]">/{m.besoin}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-line-soft">
              <div className="flex items-center">
                <div className="flex">
                  {Array.from({ length: Math.min(m.inscrits, 4) }).map((_, i) => (
                    <div
                      key={i}
                      className="border-2 border-surface rounded-pill"
                      style={{ marginLeft: i === 0 ? 0 : -8 }}
                    >
                      <Avatar name={SAMPLE_NAMES[i] ?? "X X"} size={24} />
                    </div>
                  ))}
                </div>
                <div className="text-[11.5px] text-ink-muted ml-2">
                  réf. {m.ref}
                </div>
              </div>
              <Button
                size="sm"
                variant={m.inscrits >= m.besoin ? "ghost" : "primary"}
              >
                {m.inscrits >= m.besoin ? "Complet" : "Je m'inscris"}
              </Button>
            </div>
          </Surface>
        ))}
      </Section>
    </div>
  );
}
