import Link from "next/link";
import { FileText, MessageSquare, Sparkles } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { Avatar } from "@/components/ui/avatar";
import { listSuggestions, listDiscussions, listPropositions } from "@/lib/queries";
import { SignalButton } from "@/components/interactive/signal-button";
import { SupportButton } from "@/components/interactive/support-button";
import { NewIdeaButton } from "@/components/interactive/new-idea-button";

type View = "idees" | "discus" | "propo";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const sp = await searchParams;
  const v: View = sp.view === "discus" ? "discus" : sp.view === "propo" ? "propo" : "idees";
  const [suggestions, discussions, propositions] = await Promise.all([
    listSuggestions(),
    listDiscussions(),
    listPropositions(),
  ]);

  return (
    <ScreenShell>
      <PageHeader subtitle="Pôle 1 — Triptyque délibératif" title="Agora citoyenne" />

      <div className="px-[18px] pb-3.5">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {(
            [
              { id: "idees" as const, label: "Idées", count: suggestions.length, href: "/agora" },
              { id: "discus" as const, label: "Discussions", count: discussions.length, href: "/agora?view=discus" },
              { id: "propo" as const, label: "Propositions", count: propositions.length, href: "/agora?view=propo" },
            ]
          ).map((tab) => {
            const active = v === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "px-3.5 py-2 rounded font-semibold text-[13px] whitespace-nowrap min-h-[36px] flex items-center no-underline",
                  active ? "bg-ink text-surface border border-ink" : "bg-transparent text-ink border border-line-soft",
                ].join(" ")}
              >
                {tab.label} <span className="opacity-60 ml-1">· {tab.count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {v === "idees" && (
        <Section dense>
          {suggestions.map((s) => (
            <Surface key={s.id}>
              <Link href={`/idees/${s.id}`} className="block">
                <div className="flex items-start gap-2.5 mb-2">
                  <Avatar name={s.auteur} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11.5px] text-ink-muted">
                      {s.auteur} · il y a {s.age}
                    </div>
                    <div className="font-bold text-[16px] text-ink mt-1 leading-[1.3] tracking-title">
                      {s.titre}
                    </div>
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      <Chip size="sm" color="#e8a838">{s.cat}</Chip>
                      {s.mature && (
                        <Chip size="sm" color="#7a8c3a">
                          <Sparkles size={12} strokeWidth={1.6} /> Mûre
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2.5 border-t border-line-soft">
                {(["vis", "important", "contribuer"] as const).map((k) => (
                  <SignalButton
                    key={k}
                    suggestionId={s.id}
                    type={k}
                    count={s.signaux[k]}
                    active={s.myEmissions.includes(k)}
                  />
                ))}
              </div>
              <div className="text-[11px] text-ink-muted mt-2 flex items-center gap-1">
                <MessageSquare size={11} strokeWidth={1.6} /> {s.contributions} contributions liées
              </div>
            </Surface>
          ))}
          {suggestions.length === 0 && (
            <div className="px-[18px] py-12 text-center text-ink-muted text-[13px]">
              Aucune idée pour le moment. Le bouton « + » permet d'en proposer une.
            </div>
          )}
        </Section>
      )}

      {v === "discus" && (
        <Section dense>
          {discussions.map((d) => {
            const segs = [
              { val: d.accord, color: "#7a8c3a", label: "accords" },
              { val: d.nuance, color: "#1f6e7a", label: "nuances" },
              { val: d.objection, color: "#a8332b", label: "objections" },
              { val: d.question, color: "#e8a838", label: "questions" },
            ];
            return (
              <Link key={d.id} href={`/discussions/${d.id}`} className="contents">
                <Surface as="button" className="w-full">
                  <div className="font-bold text-[16px] text-ink leading-[1.3] tracking-title">{d.titre}</div>
                  <div className="text-[11.5px] text-ink-muted mt-1">
                    Animé par {d.anim} · {d.contribs} contributions
                  </div>
                  <div className="flex h-1.5 rounded overflow-hidden mt-3 gap-px" aria-hidden>
                    {segs.map((s) => (
                      <div key={s.label} style={{ flex: s.val, backgroundColor: s.color }} />
                    ))}
                  </div>
                  <div className="flex gap-3 mt-2 text-[11px] text-ink-soft flex-wrap">
                    {segs.map((s) => (
                      <span key={s.label}>
                        <span className="font-bold" style={{ color: s.color }}>{s.val}</span> {s.label}
                      </span>
                    ))}
                  </div>
                  {d.derniereSynth && (
                    <div className="mt-3 px-2.5 py-2 bg-surface-alt rounded text-[12px] text-ink-soft flex items-center gap-1.5">
                      <FileText size={12} strokeWidth={1.6} /> Synthèse du {d.derniereSynth}
                    </div>
                  )}
                  {d.mature && (
                    <div className="mt-2.5 px-3 py-2.5 rounded bg-success/15 text-success text-[12px] font-semibold flex items-center gap-1.5">
                      <Sparkles size={13} strokeWidth={1.6} />
                      Maturation suffisante — promouvoir en proposition ?
                    </div>
                  )}
                </Surface>
              </Link>
            );
          })}
        </Section>
      )}

      {v === "propo" && (
        <Section dense>
          {propositions.map((p) => {
            const pct = Math.min(100, (p.soutiens / p.seuil) * 100);
            const reached = pct >= 100;
            return (
              <Surface key={p.id}>
                <Link href={`/propositions/${p.id}`} className="block">
                  <div className="font-bold text-[16px] text-ink leading-[1.3] tracking-title">{p.titre}</div>
                </Link>
                <div className="mt-3">
                  <div className="flex justify-between text-[12px] text-ink-soft mb-1.5">
                    <span><strong className="text-ink">{p.soutiens}</strong> soutiens</span>
                    <span>seuil : {p.seuil}</span>
                  </div>
                  <div
                    className="h-2 bg-surface-alt rounded overflow-hidden"
                    role="progressbar"
                    aria-valuenow={p.soutiens}
                    aria-valuemin={0}
                    aria-valuemax={p.seuil}
                    aria-label={`${p.soutiens} soutiens sur ${p.seuil}`}
                  >
                    <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: reached ? "#7a8c3a" : "#1f6e7a" }} />
                  </div>
                </div>
                {p.statut === "reponse-mairie" ? (
                  <div className="mt-3 p-2.5 rounded bg-primary/15 border-l-[3px] border-primary text-[12.5px] text-ink-soft">
                    <strong className="text-primary">Seuil atteint.</strong> La mairie répond {p.reponseDate}.
                  </div>
                ) : p.statut === "instruction" ? (
                  <div className="mt-3 p-2.5 rounded bg-surface-alt text-[12.5px] text-ink-soft">
                    En instruction : validation par le référent municipal en cours.
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3">
                    <SupportButton propositionId={p.id} supported={p.supported} titre={p.titre} full />
                    <Link href={`/propositions/${p.id}`} className="contents">
                      <button type="button" className="px-3 py-2 rounded border border-line-soft text-ink text-[13px] font-semibold min-h-[36px]">
                        Voir
                      </button>
                    </Link>
                  </div>
                )}
                <div className="text-[11px] text-ink-muted mt-2.5">
                  {p.joursRestants > 0 ? `${p.joursRestants} jours restants` : "Soutien clos"}
                </div>
              </Surface>
            );
          })}
        </Section>
      )}

      <div className="absolute bottom-[90px] right-[18px] z-20">
        <NewIdeaButton />
      </div>
    </ScreenShell>
  );
}
