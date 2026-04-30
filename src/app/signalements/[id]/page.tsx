import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbulb, MapPin, Trash2, TreeDeciduous } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { getCurrentUserPub, getSignalement } from "@/lib/queries";
import { SignalementStateUpdate } from "@/components/interactive/signalement-state-update";

const ETAT_LABEL = {
  signale: "Signalé",
  "pris-en-compte": "Pris en compte",
  "en-cours": "En cours",
  resolu: "Résolu",
} as const;

const ETAT_COLOR = {
  signale: "#7a746c",
  "pris-en-compte": "#1f6e7a",
  "en-cours": "#e8a838",
  resolu: "#7a8c3a",
} as const;

const ICON_BY_NAME = { MapPin, Lightbulb, TreeDeciduous, Trash2 } as const;

const ETAT_ORDER = ["signale", "pris-en-compte", "en-cours", "resolu"] as const;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [s, me] = await Promise.all([getSignalement(id), getCurrentUserPub()]);
  if (!s) notFound();

  const Icon = ICON_BY_NAME[s.icon as keyof typeof ICON_BY_NAME] ?? MapPin;
  const c = ETAT_COLOR[s.etat as keyof typeof ETAT_COLOR];
  const currentIdx = ETAT_ORDER.indexOf(s.etat as (typeof ETAT_ORDER)[number]);

  const lastUpdate = s.history[s.history.length - 1];
  const isAgent = me.role === "agent" || me.role === "referent" || me.role === "maire";

  return (
    <ScreenShell>
      <PageHeader
        subtitle={s.type}
        title={s.titre}
        action={
          <Link
            href="/signalements"
            className="text-[12px] text-primary font-semibold underline"
          >
            Retour
          </Link>
        }
      />
      <div className="px-[18px]">
        <Surface>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c}22`, color: c }}>
              <Icon size={22} strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <div className="text-[12px] text-ink-muted">{s.loc}</div>
              <div className="text-[12px] text-ink-soft mt-0.5">
                Signalé par {s.auteur} · {s.createdAt.toLocaleDateString("fr-FR")}
              </div>
              {s.description && <div className="text-[13px] text-ink mt-2">{s.description}</div>}
              <div className="mt-2">
                <Chip size="sm" color={c} prefixDot>
                  {ETAT_LABEL[s.etat as keyof typeof ETAT_LABEL]}
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
              const histEntry = s.history.find((h) => h.etat === etat);
              return (
                <li key={etat} className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-3.5 h-3.5 rounded-pill border-2" style={{ backgroundColor: reached ? ETAT_COLOR[etat] : "transparent", borderColor: reached ? ETAT_COLOR[etat] : "#d2ccc1" }} />
                    {i < ETAT_ORDER.length - 1 && (
                      <div className="absolute left-1/2 top-3.5 -translate-x-1/2 w-px h-6" style={{ backgroundColor: i < currentIdx ? ETAT_COLOR[etat] : "#d2ccc1" }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`text-[13px] ${cur ? "font-bold text-ink" : reached ? "text-ink" : "text-ink-muted"}`}>
                      {ETAT_LABEL[etat]}
                    </div>
                    {histEntry && (
                      <div className="text-[11px] text-ink-muted">
                        {histEntry.at.toLocaleDateString("fr-FR")}
                        {histEntry.comment && <span> · {histEntry.comment}</span>}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Surface>
        <div className="text-[11.5px] text-ink-muted">Vous serez notifié·e à chaque changement d'état.</div>
        {lastUpdate?.comment && (
          <div className="text-[11.5px] text-ink-soft italic">Dernier commentaire agent : « {lastUpdate.comment} »</div>
        )}
      </Section>

      {isAgent && (
        <Section title="Action agent municipal">
          <Surface>
            <SignalementStateUpdate
              signalementId={s.id}
              current={s.etat as "signale" | "pris-en-compte" | "en-cours" | "resolu"}
            />
          </Surface>
          <div className="text-[11.5px] text-ink-muted">
            Visible aux profils <strong>agent</strong>, <strong>référent</strong> et{" "}
            <strong>maire</strong> uniquement. L'action est tracée dans le journal des décisions.
          </div>
        </Section>
      )}
    </ScreenShell>
  );
}
