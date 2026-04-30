import { CircleAlert, Lightbulb, MapPin, Menu, Plus, Trash2, TreeDeciduous } from "lucide-react";
import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { listSignalements } from "@/lib/queries";

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
          <div className="text-[12.5px] text-ink-muted mt-1">Le bouton « + » en haut permet d'en créer un.</div>
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
  const positions = [
    { x: 165, y: 200 },
    { x: 220, y: 80 },
    { x: 120, y: 280 },
    { x: 80, y: 340 },
    { x: 260, y: 200 },
    { x: 100, y: 100 },
  ];
  const items = signalements.slice(0, 6).map((s, i) => ({
    ...positions[i],
    etat: s.etat,
    Icon: ICON_BY_NAME[s.icon as keyof typeof ICON_BY_NAME] ?? MapPin,
  }));
  return (
    <div className="px-[18px]">
      <div
        role="img"
        aria-label="Carte des signalements (placeholder à remplacer par MapLibre + tuiles IGN)"
        className="relative h-[380px] rounded-lg overflow-hidden border border-line-soft"
        style={{ background: "#e6dec8" }}
      >
        <svg width="100%" height="100%" viewBox="0 0 340 380" className="absolute inset-0" aria-hidden>
          <path d="M0 180 Q100 160 180 200 T340 220" stroke="#cdbe9c" strokeWidth="14" fill="none" />
          <path d="M150 0 L160 380" stroke="#cdbe9c" strokeWidth="10" fill="none" />
          <path d="M0 80 Q150 100 340 60" stroke="#cdbe9c" strokeWidth="8" fill="none" />
          <path d="M50 380 L80 240 L120 200" stroke="#cdbe9c" strokeWidth="8" fill="none" />
          <rect x="155" y="190" width="22" height="22" fill="#bda985" rx="2" />
          <rect x="180" y="195" width="14" height="18" fill="#bda985" rx="2" />
          <rect x="120" y="170" width="20" height="16" fill="#bda985" rx="2" />
          <rect x="200" y="60" width="16" height="20" fill="#bda985" rx="2" />
          <circle cx="60" cy="100" r="22" fill="#b8c995" opacity="0.7" />
          <circle cx="280" cy="300" r="30" fill="#b8c995" opacity="0.7" />
          <path d="M0 320 Q100 280 200 320 T340 280" stroke="#9eb6c4" strokeWidth="6" fill="none" />
        </svg>
        {items.map((m, i) => {
          const c = ETAT_COLOR[m.etat as keyof typeof ETAT_COLOR];
          return (
            <div
              key={i}
              className="absolute flex items-center justify-center rounded-[50%_50%_50%_0] border-2 border-white shadow-[0_2px_5px_rgba(0,0,0,0.25)]"
              style={{ left: m.x, top: m.y, width: 32, height: 32, background: c, color: "#fff", transform: "translate(-50%, -100%) rotate(-45deg)" }}
            >
              <div style={{ transform: "rotate(45deg)" }}>
                <m.Icon size={14} strokeWidth={1.6} />
              </div>
            </div>
          );
        })}
        <div className="absolute top-3 left-3 bg-surface px-2.5 py-1 rounded text-[11px] font-semibold text-ink border border-line-soft">
          Bourg de Trizac
        </div>
        <div className="absolute bottom-3 left-3 right-3 bg-surface p-2.5 rounded border border-line-soft flex justify-around text-[10.5px] text-ink-soft">
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
      </div>
    </div>
  );
}
