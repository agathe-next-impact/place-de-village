import { CircleAlert, Lightbulb, MapPin, Menu, Plus, Trash2, TreeDeciduous } from "lucide-react";
import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { listSignalements } from "@/lib/queries";
import { MapView, type MapPoint } from "@/components/interactive/map-view";

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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const sp = await searchParams;
  const view = sp.view === "map" ? "map" : "list";
  const signalements = await listSignalements();

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Pôle 3"
        title="Signalements"
        action={
          <Link
            href="/signaler"
            aria-label="Nouveau signalement"
            className="w-10 h-10 rounded-pill bg-primary text-white flex items-center justify-center shadow-fab no-underline"
          >
            <Plus size={20} strokeWidth={2} />
          </Link>
        }
      />

      <div className="px-[18px] pb-3">
        <div className="flex bg-surface-alt p-[3px] rounded gap-0.5">
          <Link
            href="/signalements"
            aria-current={view === "list" ? "page" : undefined}
            className={[
              "flex-1 px-2.5 py-2 rounded font-semibold text-[13px] no-underline",
              "flex items-center justify-center gap-1.5",
              view === "list" ? "bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "text-ink-muted",
            ].join(" ")}
          >
            <Menu size={14} strokeWidth={1.6} />
            Liste
          </Link>
          <Link
            href="/signalements?view=map"
            aria-current={view === "map" ? "page" : undefined}
            className={[
              "flex-1 px-2.5 py-2 rounded font-semibold text-[13px] no-underline",
              "flex items-center justify-center gap-1.5",
              view === "map" ? "bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "text-ink-muted",
            ].join(" ")}
          >
            <MapPin size={14} strokeWidth={1.6} />
            Carte
          </Link>
        </div>
      </div>

      {view === "map" ? (
        <SignalMap signalements={signalements} />
      ) : signalements.length === 0 ? (
        <div className="px-[18px] py-12 text-center">
          <div className="w-12 h-12 rounded-pill bg-surface-alt flex items-center justify-center mx-auto mb-3 text-ink-muted">
            <CircleAlert size={20} strokeWidth={1.6} />
          </div>
          <div className="font-semibold text-[14px] text-ink">Aucun signalement pour le moment.</div>
          <div className="text-[12.5px] text-ink-muted mt-1 mb-4">Soyez le premier à en faire un.</div>
          <Link
            href="/signaler"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-primary text-white text-[13px] font-semibold no-underline min-h-[36px]"
          >
            <Plus size={14} strokeWidth={2} />
            Nouveau signalement
          </Link>
        </div>
      ) : (
        <Section dense>
          {signalements.map((s) => {
            const c = ETAT_COLOR[s.etat as keyof typeof ETAT_COLOR];
            const Icon = ICON_BY_NAME[s.icon as keyof typeof ICON_BY_NAME] ?? MapPin;
            return (
              <Link key={s.id} href={`/signalements/${s.id}`} className="contents">
                <Surface as="button" className="w-full">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c}22`, color: c }}>
                      <Icon size={20} strokeWidth={1.6} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px] text-ink mb-1">{s.titre}</div>
                      <div className="text-[11.5px] text-ink-muted">
                        {s.loc} · {s.auteur} · {formatRelative(s.createdAt)}
                      </div>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        <Chip size="sm" color={c} prefixDot>
                          {ETAT_LABEL[s.etat as keyof typeof ETAT_LABEL]}
                        </Chip>
                        <Chip size="sm">{s.type}</Chip>
                      </div>
                    </div>
                  </div>
                </Surface>
              </Link>
            );
          })}
        </Section>
      )}
    </ScreenShell>
  );
}

function formatRelative(d: Date) {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 3600) return "à l'instant";
  if (sec < 24 * 3600) return `il y a ${Math.floor(sec / 3600)} h`;
  if (sec < 30 * 24 * 3600) return `il y a ${Math.floor(sec / (24 * 3600))} j`;
  return d.toLocaleDateString("fr-FR");
}

function SignalMap({ signalements }: { signalements: Awaited<ReturnType<typeof listSignalements>> }) {
  const points: MapPoint[] = signalements
    .filter((s): s is typeof s & { lat: number; lng: number } => s.lat != null && s.lng != null)
    .map((s) => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      color: ETAT_COLOR[s.etat as keyof typeof ETAT_COLOR],
      label: s.titre,
      description: `${s.loc} · ${ETAT_LABEL[s.etat as keyof typeof ETAT_LABEL]}`,
      href: `/signalements/${s.id}`,
    }));

  return (
    <div className="px-[18px]">
      <MapView points={points} className="border border-line-soft" />
      <div className="mt-2 bg-surface p-2.5 rounded border border-line-soft flex flex-wrap gap-x-3 gap-y-1 justify-around text-[10.5px] text-ink-soft">
        {(
          [
            { c: "#7a746c", l: "Signalé" },
            { c: "#1f6e7a", l: "Pris en compte" },
            { c: "#e8a838", l: "En cours" },
            { c: "#7a8c3a", l: "Résolu" },
          ] as const
        ).map((x) => (
          <div key={x.l} className="flex items-center gap-1">
            <span aria-hidden className="w-2 h-2 rounded-pill" style={{ backgroundColor: x.c }} />
            {x.l}
          </div>
        ))}
      </div>
      <div className="text-[11px] text-ink-muted mt-2 text-center">
        Fond cartographique <strong>IGN — Géoplateforme</strong> (open data).
      </div>
    </div>
  );
}
