"use client";

import { useState } from "react";
import {
  ArrowRight,
  Brush,
  Camera,
  CircleAlert,
  Lightbulb,
  Menu,
  MapPin,
  Plus,
  Send,
  Tag,
  Trash2,
  TreeDeciduous,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
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

type Sub = "list" | "map" | "new";

export function SignalScreen() {
  const [sub, setSub] = useState<Sub>("list");

  if (sub === "new") return <SignalNewScreen onClose={() => setSub("list")} />;
  return <SignalListOrMap sub={sub} setSub={setSub} />;
}

function SignalListOrMap({
  sub,
  setSub,
}: {
  sub: Exclude<Sub, "new">;
  setSub: (s: Sub) => void;
}) {
  const isMap = sub === "map";
  const { signalements } = useStore();
  return (
    <div>
      <PageHeader
        subtitle="Pôle 3"
        title="Signalements"
        action={
          <button
            type="button"
            onClick={() => setSub("new")}
            aria-label="Nouveau signalement"
            className="w-10 h-10 rounded-pill bg-primary text-white flex items-center justify-center shadow-fab"
          >
            <Plus size={20} strokeWidth={2} />
          </button>
        }
      />
      <div className="px-[18px] pb-3">
        <div className="flex bg-surface-alt p-[3px] rounded gap-0.5">
          {(
            [
              { id: "list", label: "Liste", Icon: Menu },
              { id: "map", label: "Carte", Icon: MapPin },
            ] as const
          ).map((o) => {
            const active = sub === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setSub(o.id)}
                aria-pressed={active}
                className={[
                  "flex-1 px-2.5 py-2 rounded font-semibold text-[13px]",
                  "flex items-center justify-center gap-1.5",
                  active
                    ? "bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "bg-transparent text-ink-muted",
                ].join(" ")}
              >
                <o.Icon size={14} strokeWidth={1.6} />
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {isMap ? (
        <SignalMap />
      ) : signalements.length === 0 ? (
        <EmptyState />
      ) : (
        <Section dense>
          {signalements.map((s) => {
            const c = ETAT_COLOR[s.etat];
            const Icon = ICON_BY_NAME[s.icon] ?? MapPin;
            return (
              <Link key={s.id} href={`/signalements/${s.id}`} className="contents">
                <Surface as="button" className="w-full">
                  <div className="flex gap-3">
                    <div
                      className="w-11 h-11 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${c}22`, color: c }}
                    >
                      <Icon size={20} strokeWidth={1.6} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px] text-ink mb-1">
                        {s.titre}
                      </div>
                      <div className="text-[11.5px] text-ink-muted">
                        {s.loc} · {s.auteur} · {s.date}
                      </div>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        <Chip size="sm" color={c} prefixDot>
                          {ETAT_LABEL[s.etat]}
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
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-[18px] py-12 text-center">
      <div className="w-12 h-12 rounded-pill bg-surface-alt flex items-center justify-center mx-auto mb-3 text-ink-muted">
        <CircleAlert size={20} strokeWidth={1.6} />
      </div>
      <div className="font-semibold text-[14px] text-ink">
        Aucun signalement pour le moment.
      </div>
      <div className="text-[12.5px] text-ink-muted mt-1">
        Le bouton « + » en haut permet d'en créer un.
      </div>
    </div>
  );
}

function SignalMap() {
  const { signalements } = useStore();
  const items = signalements.slice(0, 6).map((s, i) => {
    const positions = [
      { x: 165, y: 200 },
      { x: 220, y: 80 },
      { x: 120, y: 280 },
      { x: 80, y: 340 },
      { x: 260, y: 200 },
      { x: 100, y: 100 },
    ];
    const Icon = ICON_BY_NAME[s.icon] ?? MapPin;
    return { ...positions[i], etat: s.etat, Icon };
  });
  return (
    <div className="px-[18px]">
      <div
        role="img"
        aria-label="Carte des signalements (placeholder à remplacer par MapLibre + tuiles IGN)"
        className="relative h-[380px] rounded-lg overflow-hidden border border-line-soft"
        style={{ background: "#e6dec8" }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 340 380"
          className="absolute inset-0"
          aria-hidden
        >
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
          const c = ETAT_COLOR[m.etat];
          return (
            <div
              key={i}
              className="absolute flex items-center justify-center rounded-[50%_50%_50%_0] border-2 border-white shadow-[0_2px_5px_rgba(0,0,0,0.25)]"
              style={{
                left: m.x,
                top: m.y,
                width: 32,
                height: 32,
                background: c,
                color: "#fff",
                transform: "translate(-50%, -100%) rotate(-45deg)",
              }}
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
              <span
                aria-hidden
                className="w-2 h-2 rounded-pill"
                style={{ backgroundColor: x.c }}
              />
              {x.l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { id: "voirie", label: "Voirie", iconKey: "MapPin", Icon: MapPin },
  { id: "ecl", label: "Éclairage", iconKey: "Lightbulb", Icon: Lightbulb },
  { id: "verts", label: "Espaces verts", iconKey: "TreeDeciduous", Icon: TreeDeciduous },
  { id: "prop", label: "Propreté", iconKey: "Trash2", Icon: Brush },
  { id: "degr", label: "Dégradation", iconKey: "MapPin", Icon: Wrench },
  { id: "autre", label: "Autre", iconKey: "MapPin", Icon: Tag },
];

function SignalNewScreen({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [cat, setCat] = useState<string | null>(null);
  const [desc, setDesc] = useState(
    "Un nid-de-poule s'est creusé devant le n°12, dangereux pour les vélos.",
  );
  const { addSignalement } = useStore();
  const { show } = useToast();

  const submit = () => {
    if (!cat) return;
    const c = CATEGORIES.find((x) => x.id === cat)!;
    addSignalement({
      titre: desc.split(".")[0].slice(0, 80) || `Signalement ${c.label}`,
      type: c.label,
      loc: "Rue du Lavoir",
      icon: c.iconKey,
    });
    show({
      tone: "success",
      title: "Signalement envoyé",
      desc: "Vous serez notifié·e à chaque changement d'état.",
    });
    onClose();
  };

  return (
    <div>
      <PageHeader
        subtitle={`Étape ${step} / 2`}
        title={step === 1 ? "Que se passe-t-il ?" : "Une photo aide la mairie"}
        onBack={() => (step === 1 ? onClose() : setStep(1))}
      />
      {step === 1 ? (
        <>
          <div className="px-[18px] pb-3.5">
            <div className="text-[13px] text-ink-soft mb-3">
              Choisissez la catégorie qui correspond le mieux.
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => {
                const active = cat === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCat(c.id)}
                    aria-pressed={active}
                    className={[
                      "rounded-lg p-3.5 flex items-center gap-2.5 text-left min-h-[44px] border-[1.5px]",
                      active
                        ? "bg-primary/10 border-primary"
                        : "bg-surface border-line-soft",
                    ].join(" ")}
                  >
                    <c.Icon
                      size={20}
                      strokeWidth={1.6}
                      className={active ? "text-primary" : "text-ink-soft"}
                    />
                    <span className="font-semibold text-[14px] text-ink">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-[18px] py-2">
            <div className="text-[12px] font-semibold text-ink-soft mb-1.5">Lieu</div>
            <Surface className="flex items-center gap-2.5">
              <MapPin size={18} strokeWidth={1.6} className="text-primary" />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-ink">
                  Position GPS détectée
                </div>
                <div className="text-[11.5px] text-ink-muted">
                  Rue du Lavoir, Trizac · ±8 m
                </div>
              </div>
              <button
                type="button"
                className="text-[12px] text-primary font-semibold"
              >
                Modifier
              </button>
            </Surface>
          </div>
          <div className="p-[18px]">
            <Button
              full
              size="lg"
              onClick={() => (cat ? setStep(2) : show({ tone: "info", title: "Choisissez une catégorie." }))}
              icon={<ArrowRight size={18} strokeWidth={2} />}
            >
              Continuer
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="px-[18px]">
            <div className="h-[180px] rounded-lg border-[1.5px] border-dashed border-line bg-gradient-to-br from-surface-alt to-line-soft flex flex-col items-center justify-center gap-2 text-ink-muted text-[13px]">
              <Camera size={28} strokeWidth={1.6} />
              <div>Prendre ou ajouter une photo</div>
              <div className="text-[11px]">(optionnel mais recommandé)</div>
            </div>
            <div className="mt-4">
              <label className="text-[12px] font-semibold text-ink-soft mb-1.5 block">
                Description courte
              </label>
              <textarea
                className="w-full min-h-[80px] p-3 bg-surface border border-line-soft rounded text-[14px] text-ink resize-none outline-none focus:border-primary"
                placeholder="En une phrase, qu'avez-vous constaté ?"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>
          <div className="p-[18px] flex gap-2.5">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Retour
            </Button>
            <Button
              full
              size="lg"
              icon={<Send size={18} strokeWidth={2} />}
              onClick={submit}
            >
              Envoyer
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
