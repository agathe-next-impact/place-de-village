"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, MapPin, Trash2, TreeDeciduous } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Chip } from "@/components/ui/chip";
import { Section } from "@/components/ui/section";
import { useStore } from "@/lib/store";
import type { SignalementEtat } from "@/lib/data";

const ETAT_LABEL: Record<SignalementEtat, string> = {
  signale: "Signalé",
  "pris-en-compte": "Pris en compte",
  "en-cours": "En cours",
  resolu: "Résolu",
};

const ETAT_COLOR: Record<SignalementEtat, string> = {
  signale: "#7a746c",
  "pris-en-compte": "#1f6e7a",
  "en-cours": "#e8a838",
  resolu: "#7a8c3a",
};

const ICON_BY_NAME: Record<string, typeof MapPin> = {
  MapPin,
  Lightbulb,
  TreeDeciduous,
  Trash2,
};

const ETAT_ORDER: SignalementEtat[] = [
  "signale",
  "pris-en-compte",
  "en-cours",
  "resolu",
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { signalements } = useStore();
  const s = signalements.find((x) => x.id === id);

  if (!s) {
    return (
      <ScreenShell active="signal">
        <PageHeader
          title="Signalement introuvable"
          subtitle="Erreur"
          onBack={() => router.push("/?tab=signal")}
        />
        <div className="px-[18px] text-[13px] text-ink-soft">
          Le signalement demandé n'existe pas ou a été supprimé.
        </div>
      </ScreenShell>
    );
  }

  const Icon = ICON_BY_NAME[s.icon] ?? MapPin;
  const c = ETAT_COLOR[s.etat];
  const currentIdx = ETAT_ORDER.indexOf(s.etat);

  return (
    <ScreenShell active="signal">
      <PageHeader
        subtitle={s.type}
        title={s.titre}
        onBack={() => router.push("/?tab=signal")}
      />
      <div className="px-[18px]">
        <Surface>
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${c}22`, color: c }}
            >
              <Icon size={22} strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <div className="text-[12px] text-ink-muted">{s.loc}</div>
              <div className="text-[12px] text-ink-soft mt-0.5">
                Signalé par {s.auteur} · {s.date}
              </div>
              <div className="mt-2">
                <Chip size="sm" color={c} prefixDot>
                  {ETAT_LABEL[s.etat]}
                </Chip>
              </div>
            </div>
          </div>
        </Surface>
      </div>

      <Section title="Suivi du traitement">
        <Surface>
          <ol className="space-y-3" aria-label="Chronologie de traitement">
            {ETAT_ORDER.map((etat, i) => {
              const reached = i <= currentIdx;
              const cur = i === currentIdx;
              return (
                <li key={etat} className="flex items-start gap-3">
                  <div className="relative">
                    <div
                      className="w-3.5 h-3.5 rounded-pill border-2"
                      style={{
                        backgroundColor: reached ? ETAT_COLOR[etat] : "transparent",
                        borderColor: reached ? ETAT_COLOR[etat] : "#d2ccc1",
                      }}
                    />
                    {i < ETAT_ORDER.length - 1 && (
                      <div
                        className="absolute left-1/2 top-3.5 -translate-x-1/2 w-px h-6"
                        style={{
                          backgroundColor: i < currentIdx ? ETAT_COLOR[etat] : "#d2ccc1",
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div
                      className={`text-[13px] ${cur ? "font-bold text-ink" : reached ? "text-ink" : "text-ink-muted"}`}
                    >
                      {ETAT_LABEL[etat]}
                    </div>
                    {cur && (
                      <div className="text-[11px] text-ink-muted">
                        Mis à jour {s.date}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Surface>
        <div className="text-[11.5px] text-ink-muted">
          Vous serez notifié·e à chaque changement d'état.
        </div>
      </Section>
    </ScreenShell>
  );
}
