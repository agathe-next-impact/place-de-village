import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { localStats } from "@/lib/queries";

export default async function Page() {
  const stats = await localStats(30);
  const plausibleHost = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const plausibleUrl =
    plausibleHost && plausibleDomain
      ? `${plausibleHost.replace(/\/$/, "")}/${plausibleDomain}`
      : null;

  // Tri par fréquence décroissante
  const sorted = [...stats.rows].sort((a, b) => b.c - a.c);

  return (
    <ScreenShell>
      <PageHeader
        subtitle={`Sur ${stats.days} jours`}
        title="Analytics"
        action={<Link href="/mairie" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />

      <div className="px-[18px] mb-3">
        <Surface
          className={
            plausibleUrl ? "border-l-[3px] border-success" : "border-l-[3px] border-accent"
          }
        >
          <div className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="w-2 h-2 mt-1.5 rounded-pill"
              style={{ backgroundColor: plausibleUrl ? "#7a8c3a" : "#e8a838" }}
            />
            <div className="flex-1">
              <div className="font-semibold text-[13.5px] text-ink">
                {plausibleUrl ? "Plausible auto-hébergé configuré" : "Plausible non configuré"}
              </div>
              <div className="text-[11.5px] text-ink-muted mt-0.5">
                {plausibleUrl
                  ? "Trafic, sessions et events détaillés sont mesurés sans cookie ni profilage par votre instance auto-hébergée."
                  : "Configurez NEXT_PUBLIC_PLAUSIBLE_HOST + DOMAIN pour activer la mesure d'audience conforme RGPD (sans cookie)."}
              </div>
              {plausibleUrl && (
                <a
                  href={plausibleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[12px] text-primary font-semibold underline"
                >
                  Ouvrir le tableau de bord Plausible
                  <ExternalLink size={12} strokeWidth={1.6} />
                </a>
              )}
            </div>
          </div>
        </Surface>
      </div>

      <Section title="Pulsation locale (30 j)">
        <Surface padded={false} className="flex">
          <div className="flex-1 text-center p-4 border-r border-line-soft">
            <div className="text-[26px] font-bold text-ink leading-none">{stats.total}</div>
            <div className="text-[11px] text-ink-muted mt-1">actions citoyennes</div>
          </div>
          <div className="flex-1 text-center p-4">
            <div className="text-[26px] font-bold text-ink leading-none">{stats.distinctUsers}</div>
            <div className="text-[11px] text-ink-muted mt-1">utilisateur·rice·s actif·ve·s</div>
          </div>
        </Surface>
        <div className="text-[11px] text-ink-muted">
          Mesuré localement depuis le journal des décisions, indépendamment
          de Plausible. Aucune donnée personnelle.
        </div>
      </Section>

      <Section title={`Détail par type d'action (${sorted.length})`}>
        {sorted.length === 0 ? (
          <div className="text-[13px] text-ink-muted text-center py-2">
            Aucune action enregistrée sur la période.
          </div>
        ) : (
          <Surface>
            <ul className="divide-y divide-line-soft">
              {sorted.map((r, i) => {
                const pct = stats.total ? Math.round((r.c / stats.total) * 100) : 0;
                return (
                  <li key={i} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-[13px] text-ink">
                        <span className="font-semibold">{r.action}</span>
                        <span className="text-ink-muted ml-2">{r.entityType}</span>
                      </div>
                      <Chip size="sm">
                        {r.c} · {pct}%
                      </Chip>
                    </div>
                    <div className="h-1.5 bg-surface-alt rounded overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Surface>
        )}
      </Section>
    </ScreenShell>
  );
}
