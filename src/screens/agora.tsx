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
import Link from "next/link";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

type AgoraTab = "idees" | "discus" | "propo";

const CATEGORIES = [
  "Cadre de vie",
  "Mobilité",
  "Jeunesse",
  "Aînés",
  "Environnement",
  "Vie locale",
];

export function AgoraScreen() {
  const [view, setView] = useState<AgoraTab>("idees");
  const [openNew, setOpenNew] = useState(false);
  const { suggestions, discussions, propositions } = {
    ...useStore(),
    discussions: useStore().propositions, // unused — placeholder
  };
  // suggestions/discussions/propositions arrive via useStore selon ton choix.
  const store = useStore();

  return (
    <div>
      <PageHeader subtitle="Pôle 1 — Triptyque délibératif" title="Agora citoyenne" />

      <div className="px-[18px] pb-3.5">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {(
            [
              { id: "idees", label: "Idées", count: store.suggestions.length },
              {
                id: "discus",
                label: "Discussions",
                count: 2, // côté store on garde les discussions statiques
              },
              { id: "propo", label: "Propositions", count: store.propositions.length },
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
          onClick={() => setOpenNew(true)}
          className="bg-primary text-white px-[18px] py-3 rounded-pill font-semibold text-[14px] flex items-center gap-2 shadow-fab-lg min-h-[44px]"
        >
          <Plus size={16} strokeWidth={2} />
          Nouvelle idée
        </button>
      </div>

      <NewIdeaModal open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  );
}

function IdeasList() {
  const { suggestions, emittedSignals, emitSignal } = useStore();
  const { show } = useToast();
  if (suggestions.length === 0) {
    return (
      <div className="px-[18px] py-12 text-center text-ink-muted text-[13px]">
        Aucune idée pour le moment. Le bouton « + » permet d'en proposer une.
      </div>
    );
  }
  return (
    <Section dense>
      {suggestions.map((s) => {
        const emitted = emittedSignals[s.id] ?? new Set();
        return (
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
                    <Chip size="sm" color="#e8a838">
                      {s.cat}
                    </Chip>
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
              {(
                [
                  { key: "vis", lab: "Je vis ça" },
                  { key: "important", lab: "Important" },
                  { key: "contribuer", lab: "Je contribue" },
                ] as const
              ).map((sig) => {
                const active = emitted.has(sig.key);
                return (
                  <button
                    type="button"
                    key={sig.key}
                    onClick={() => {
                      const added = emitSignal(s.id, sig.key);
                      show({
                        tone: added ? "success" : "info",
                        title: added
                          ? "Signal enregistré"
                          : "Signal retiré",
                        desc: sig.lab,
                      });
                    }}
                    aria-pressed={active}
                    className={[
                      "rounded p-1.5 flex flex-col items-center gap-0.5 min-h-[44px] border transition-colors",
                      active
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface-alt border-line-soft text-ink-soft active:bg-line-soft",
                    ].join(" ")}
                  >
                    <div className="text-[11px] font-medium">{sig.lab}</div>
                    <div
                      className={[
                        "text-[13px] font-bold tabular-nums",
                        active ? "text-primary" : "text-ink",
                      ].join(" ")}
                    >
                      {s.signaux[sig.key]}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-ink-muted mt-2 flex items-center gap-1">
              <MessageSquare size={11} strokeWidth={1.6} /> {s.contributions}{" "}
              contributions liées
            </div>
          </Surface>
        );
      })}
    </Section>
  );
}

function DiscussionsList() {
  // Discussions restent en lecture pour l'instant (cf. CDC §2.1 — workflow
  // d'animation hors scope MVP minimal). On lie chaque carte à sa page détail.
  const D = useStaticDiscussions();
  return (
    <Section dense>
      {D.map((d) => {
        const segs = [
          { val: d.accord, color: "#7a8c3a", label: "accords" },
          { val: d.nuance, color: "#1f6e7a", label: "nuances" },
          { val: d.objection, color: "#a8332b", label: "objections" },
          { val: d.question, color: "#e8a838", label: "questions" },
        ];
        return (
          <Link key={d.id} href={`/discussions/${d.id}`} className="contents">
            <Surface as="button" className="w-full">
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
                    style={{ flex: s.val, backgroundColor: s.color }}
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
              {d.derniereSynth && (
                <div className="mt-3 px-2.5 py-2 bg-surface-alt rounded text-[12px] text-ink-soft flex items-center gap-1.5">
                  <FileText size={12} strokeWidth={1.6} /> Synthèse du{" "}
                  {d.derniereSynth}
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
  );
}

function PropositionsList() {
  const { propositions, supportedPropositions, toggleSupport } = useStore();
  const { show } = useToast();
  return (
    <Section dense>
      {propositions.map((p) => {
        const pct = Math.min(100, (p.soutiens / p.seuil) * 100);
        const reached = pct >= 100;
        const supported = supportedPropositions.has(p.id);
        return (
          <Surface key={p.id}>
            <Link href={`/propositions/${p.id}`} className="block">
              <div className="font-bold text-[16px] text-ink leading-[1.3] tracking-title">
                {p.titre}
              </div>
            </Link>
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
                  variant={supported ? "secondary" : "primary"}
                  icon={<Check size={16} strokeWidth={2} />}
                  onClick={() => {
                    const now = toggleSupport(p.id);
                    show({
                      tone: now ? "success" : "info",
                      title: now
                        ? "Soutien enregistré"
                        : "Soutien retiré",
                      desc: p.titre,
                    });
                  }}
                  aria-pressed={supported}
                >
                  {supported ? "Soutenu ✓" : "Soutenir"}
                </Button>
                <Link href={`/propositions/${p.id}`}>
                  <Button
                    variant="ghost"
                    icon={<Eye size={16} strokeWidth={1.6} />}
                  >
                    Voir
                  </Button>
                </Link>
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

function NewIdeaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addSuggestion } = useStore();
  const { show } = useToast();
  const [titre, setTitre] = useState("");
  const [cat, setCat] = useState(CATEGORIES[0]);
  const valid = titre.trim().length >= 10;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    addSuggestion({ titre: titre.trim(), cat });
    show({
      tone: "success",
      title: "Idée publiée",
      desc: "Les habitants peuvent désormais émettre des signaux qualifiés.",
    });
    setTitre("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Proposer une idée"
      description="Décrivez en une phrase ce que vous aimeriez voir évoluer dans la commune. 30 secondes suffisent."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button
            full
            type="submit"
            form="new-idea-form"
            disabled={!valid}
            className={!valid ? "opacity-60 cursor-not-allowed" : ""}
          >
            Publier
          </Button>
        </>
      }
    >
      <form id="new-idea-form" onSubmit={submit}>
        <label htmlFor="idee-titre" className="text-[12px] font-semibold text-ink-soft block mb-1.5">
          Votre idée
        </label>
        <textarea
          id="idee-titre"
          rows={3}
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Ex. Créer un verger partagé près de l'école"
          required
          minLength={10}
          className="w-full p-3 bg-surface border border-line-soft rounded text-[14px] text-ink resize-none outline-none focus:border-primary"
        />
        <div className="text-[11px] text-ink-muted mt-1">
          {titre.length} / 280 caractères{" "}
          {!valid && titre.length > 0 && (
            <span className="text-danger">— minimum 10 caractères</span>
          )}
        </div>

        <label htmlFor="idee-cat" className="text-[12px] font-semibold text-ink-soft block mb-1.5 mt-3">
          Thématique
        </label>
        <select
          id="idee-cat"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-[14px] text-ink outline-none focus:border-primary"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="text-[11.5px] text-ink-muted mt-3 leading-relaxed">
          En publiant, vous acceptez la modération a posteriori par le référent
          municipal et la{" "}
          <Link href="/confidentialite" className="text-primary underline">
            politique de confidentialité
          </Link>
          .
        </div>
      </form>
    </Modal>
  );
}

// Discussions statiques exposées pour la page liste et la page détail.
export function useStaticDiscussions() {
  return [
    {
      id: "d1",
      titre: "Aménagement de la place Saint-Pierre",
      anim: "Mireille T. + 1",
      contribs: 23,
      accord: 12,
      nuance: 6,
      objection: 3,
      question: 2,
      derniereSynth: "15 avril",
      mature: true,
    },
    {
      id: "d2",
      titre: "Quel avenir pour l'ancien presbytère ?",
      anim: "Mairie",
      contribs: 9,
      accord: 4,
      nuance: 3,
      objection: 1,
      question: 1,
      derniereSynth: null as string | null,
    },
  ];
}
