import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { Avatar } from "@/components/ui/avatar";
import { listMissions, getCurrentUserPub } from "@/lib/queries";
import { RegistrationButton } from "@/components/interactive/registration-button";

const SAMPLE_NAMES = ["Marie B", "Jean P", "Sophie L", "Paul R"];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const sp = await searchParams;
  const v = sp.view === "mes" ? "mes" : "missions";
  const [missions, me] = await Promise.all([listMissions(), getCurrentUserPub()]);
  const items = v === "missions" ? missions : missions.filter((m) => m.registered);
  const myCount = missions.filter((m) => m.registered).length;
  const isRef = me.role === "referent" || me.role === "agent" || me.role === "maire";

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Pôle 2 — Bénévolat communal"
        title="Donner un coup de main"
        action={
          isRef ? (
            <Link
              href="/moi/nouvelle-mission"
              className="text-[12px] font-semibold text-primary underline"
            >
              + Nouvelle
            </Link>
          ) : null
        }
      />

      <div className="px-[18px] pb-3.5">
        <div
          className="rounded-lg p-4 text-white"
          style={{ background: "linear-gradient(135deg, #1f6e7a, rgba(31,110,122,0.8))" }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-eyebrow opacity-85">
            Mon carnet de bord
          </div>
          <div className="flex gap-[18px] mt-2">
            <div>
              <div className="font-bold text-[28px] leading-none">{myCount * 3} h</div>
              <div className="text-[11.5px] opacity-85 mt-0.5">données estimées</div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="font-bold text-[28px] leading-none">{myCount}</div>
              <div className="text-[11.5px] opacity-85 mt-0.5">missions engagées</div>
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
            { id: "missions", label: "Missions à pourvoir", href: "/moi" },
            { id: "mes", label: "Mes engagements", href: "/moi?view=mes" },
          ] as const
        ).map((tab) => {
          const active = v === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={[
                "px-3.5 py-2 rounded font-semibold text-[13px] min-h-[36px] no-underline flex items-center",
                active ? "bg-ink text-surface border border-ink" : "text-ink border border-line-soft",
              ].join(" ")}
            >
              {tab.label}
              {tab.id === "mes" && myCount > 0 && (
                <span className="ml-1.5 opacity-80">· {myCount}</span>
              )}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="px-[18px] py-12 text-center text-ink-muted text-[13px]">
          {v === "mes"
            ? "Vous n'êtes inscrit·e à aucune mission. Voyez l'onglet « Missions à pourvoir »."
            : "Aucune mission ouverte pour l'instant."}
        </div>
      ) : (
        <Section dense>
          {items.map((m) => {
            const complet = m.inscrits >= m.besoin;
            return (
              <Surface key={m.id}>
                <Link href={`/missions/${m.id}`} className="block">
                  <div className="flex justify-between items-start gap-2.5">
                    <div className="flex-1 min-w-0">
                      <Chip size="sm" color="#e8a838">{m.cat}</Chip>
                      <div className="font-bold text-[15px] text-ink mt-1.5 leading-[1.3] tracking-title">{m.titre}</div>
                      <div className="text-[12px] text-ink-soft mt-1.5 flex flex-wrap gap-2.5">
                        <span className="inline-flex items-center gap-1"><Calendar size={11} strokeWidth={1.6} /> {m.date}</span>
                        <span className="inline-flex items-center gap-1"><Clock size={11} strokeWidth={1.6} /> {m.duree}</span>
                        <span className="inline-flex items-center gap-1"><MapPin size={11} strokeWidth={1.6} /> {m.lieu}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[11px] text-ink-muted">recherchés</div>
                      <div className="font-bold text-[18px] text-ink leading-none">
                        {m.inscrits}<span className="text-ink-muted text-[12px]">/{m.besoin}</span>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-line-soft">
                  <div className="flex items-center">
                    <div className="flex">
                      {Array.from({ length: Math.min(m.inscrits, 4) }).map((_, i) => (
                        <div key={i} className="border-2 border-surface rounded-pill" style={{ marginLeft: i === 0 ? 0 : -8 }}>
                          <Avatar name={SAMPLE_NAMES[i] ?? "X X"} size={24} />
                        </div>
                      ))}
                    </div>
                    <div className="text-[11.5px] text-ink-muted ml-2">réf. {m.ref}</div>
                  </div>
                  <RegistrationButton
                    missionId={m.id}
                    registered={m.registered}
                    complet={complet}
                    titre={m.titre}
                  />
                </div>
              </Surface>
            );
          })}
        </Section>
      )}
    </ScreenShell>
  );
}
