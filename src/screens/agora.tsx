"use client";

import { useState } from "react";
import {
  Check,
  Eye,
  FileText,
  MessageSquare,
  Plus,
  Sparkles,
} from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { TRIZAC_DATA } from "@/lib/data";

type AgoraTab = "idees" | "discus" | "propo";

export function AgoraScreen() {
  const [view, setView] = useState<AgoraTab>("idees");

  return (
    <div>
      <PageHeader subtitle="Pôle 1 — Triptyque délibératif" title="Agora citoyenne" />

      <div className="px-[18px] pb-3.5">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {(
            [
              { id: "idees", label: "Idées", count: TRIZAC_DATA.suggestions.length },
              { id: "discus", label: "Discussions", count: TRIZAC_DATA.discussions.length },
              { id: "propo", label: "Propositions", count: TRIZAC_DATA.propositions.length },
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
                  "px-3.5 py-2 rounded font-semibold text-[13px] whitespace-nowrap min-h-[36px]",
                  active
                    ? "bg-ink text-surface border border-ink"
                    : "bg-transparent text-ink border border-line-soft",
                ].join(" ")}
              >
                {tab.label} <span className="opacity-60">· {tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {view === "idees" && <IdeasList />}
      {view === "discus" && <DiscussionsList />}
      {view === "propo" && <PropositionsList />}

      <div className="absolute bottom-[90px] right-[18px] z-20">
        <button
          type="button"
          aria-label="Nouvelle idée"
          className="bg-primary text-white px-[18px] py-3 rounded-pill font-semibold text-[14px] flex items-center gap-2 shadow-fab-lg"
        >
          <Plus size={16} strokeWidth={2} />
          Nouvelle idée
        </button>
      </div>
    </div>
  );
}

function IdeasList() {
  return (
    <Section dense>
      {TRIZAC_DATA.suggestions.map((s) => (
        <Surface key={s.id}>
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
          <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2.5 border-t border-line-soft">
            {(
              [
                { lab: "Je vis ça", val: s.signaux.vis },
                { lab: "Important", val: s.signaux.important },
                { lab: "Je contribue", val: s.signaux.contribuer },
              ] as const
            ).map((sig) => (
              <button
                type="button"
                key={sig.lab}
                className="bg-surface-alt border border-line-soft rounded p-1.5 flex flex-col items-center gap-0.5 min-h-[44px] active:bg-line-soft"
              >
                <div className="text-[11px] text-ink-soft font-medium">{sig.lab}</div>
                <div className="text-[13px] font-bold text-ink tabular-nums">
                  {sig.val}
                </div>
              </button>
            ))}
          </div>
          <div className="text-[11px] text-ink-muted mt-2 flex items-center gap-1">
            <MessageSquare size={11} strokeWidth={1.6} /> {s.contributions} contributions liées
          </div>
        </Surface>
      ))}
    </Section>
  );
}

function DiscussionsList() {
  return (
    <Section dense>
      {TRIZAC_DATA.discussions.map((d) => {
        const total = d.accord + d.nuance + d.objection + d.question || 1;
        const segs = [
          { val: d.accord, color: "#7a8c3a", label: "accords" },
          { val: d.nuance, color: "#1f6e7a", label: "nuances" },
          { val: d.objection, color: "#a8332b", label: "objections" },
          { val: d.question, color: "#e8a838", label: "questions" },
        ];
        return (
          <Surface key={d.id}>
            <div className="font-bold text-[16px] text-ink leading-[1.3] tracking-title">
              {d.titre}
            </div>
            <div className="text-[11.5px] text-ink-muted mt-1">
              Animé par {d.anim} · {d.contribs} contributions
            </div>
            <div className="flex h-1.5 rounded overflow-hidden mt-3 gap-px" aria-hidden>
              {segs.map((s) => (
                <div
                  key={s.label}
                  style={{
                    flex: s.val,
                    backgroundColor: s.color,
                    minWidth: s.val ? 0 : 0,
                  }}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-2 text-[11px] text-ink-soft flex-wrap">
              {segs.map((s) => (
                <span key={s.label}>
                  <span className="font-bold" style={{ color: s.color }}>
                    {s.val}
                  </span>{" "}
                  {s.label}
                </span>
              ))}
            </div>
            <span className="sr-only">
              Total {total} contributions
            </span>
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
        );
      })}
    </Section>
  );
}

function PropositionsList() {
  return (
    <Section dense>
      {TRIZAC_DATA.propositions.map((p) => {
        const pct = Math.min(100, (p.soutiens / p.seuil) * 100);
        const reached = pct >= 100;
        return (
          <Surface key={p.id}>
            <div className="font-bold text-[16px] text-ink leading-[1.3] tracking-title">
              {p.titre}
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[12px] text-ink-soft mb-1.5">
                <span>
                  <strong className="text-ink">{p.soutiens}</strong> soutiens
                </span>
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
                <div
                  className="h-full rounded"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: reached ? "#7a8c3a" : "#1f6e7a",
                  }}
                />
              </div>
            </div>
            {p.statut === "reponse-mairie" ? (
              <div className="mt-3 p-2.5 rounded bg-primary/15 border-l-[3px] border-primary text-[12.5px] text-ink-soft">
                <strong className="text-primary">Seuil atteint.</strong> La mairie répond {p.reponseDate}.
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <Button
                  full
                  variant="primary"
                  icon={<Check size={16} strokeWidth={2} />}
                >
                  Soutenir
                </Button>
                <Button variant="ghost" icon={<Eye size={16} strokeWidth={1.6} />}>
                  Voir
                </Button>
              </div>
            )}
            <div className="text-[11px] text-ink-muted mt-2.5">
              {p.jours > 0 ? `${p.jours} jours restants` : "Soutien clos"} · Issue de la discussion d'origine
            </div>
          </Surface>
        );
      })}
    </Section>
  );
}
