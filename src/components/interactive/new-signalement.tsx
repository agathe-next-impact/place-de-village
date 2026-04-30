"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brush,
  Camera,
  Lightbulb,
  MapPin,
  Send,
  Tag,
  TreeDeciduous,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { createSignalement } from "@/lib/actions/signal";

const CATEGORIES = [
  { id: "voirie", label: "Voirie", iconKey: "MapPin", Icon: MapPin },
  { id: "ecl", label: "Éclairage", iconKey: "Lightbulb", Icon: Lightbulb },
  { id: "verts", label: "Espaces verts", iconKey: "TreeDeciduous", Icon: TreeDeciduous },
  { id: "prop", label: "Propreté", iconKey: "Trash2", Icon: Brush },
  { id: "degr", label: "Dégradation", iconKey: "MapPin", Icon: Wrench },
  { id: "autre", label: "Autre", iconKey: "MapPin", Icon: Tag },
];

export function NewSignalementForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [cat, setCat] = useState<string | null>(null);
  const [desc, setDesc] = useState(
    "Un nid-de-poule s'est creusé devant le n°12, dangereux pour les vélos.",
  );
  const [pending, start] = useTransition();
  const { show } = useToast();

  const submit = () => {
    if (!cat) return;
    const c = CATEGORIES.find((x) => x.id === cat)!;
    start(async () => {
      try {
        const r = await createSignalement({
          titre: desc.split(".")[0].slice(0, 80) || `Signalement ${c.label}`,
          type: c.label,
          loc: "Rue du Lavoir",
          icon: c.iconKey,
          description: desc,
        });
        if (r.duplicates.length > 0) {
          show({
            tone: "info",
            title: "Possible doublon détecté",
            desc: `${r.duplicates.length} signalement${r.duplicates.length > 1 ? "s" : ""} similaire${r.duplicates.length > 1 ? "s" : ""} en cours dans cette zone.`,
          });
        } else {
          show({
            tone: "success",
            title: "Signalement envoyé",
            desc: "Vous serez notifié·e à chaque changement d'état.",
          });
        }
        router.push("/signalements");
      } catch (err) {
        show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
      }
    });
  };

  return (
    <div>
      <PageHeader
        subtitle={`Étape ${step} / 2`}
        title={step === 1 ? "Que se passe-t-il ?" : "Une photo aide la mairie"}
        onBack={() => (step === 1 ? router.push("/signalements") : setStep(1))}
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
                    <c.Icon size={20} strokeWidth={1.6} className={active ? "text-primary" : "text-ink-soft"} />
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
                <div className="text-[13px] font-semibold text-ink">Position GPS détectée</div>
                <div className="text-[11.5px] text-ink-muted">Rue du Lavoir, Trizac · ±8 m</div>
              </div>
              <button type="button" className="text-[12px] text-primary font-semibold">
                Modifier
              </button>
            </Surface>
          </div>
          <div className="p-[18px]">
            <Button
              full
              size="lg"
              onClick={() =>
                cat ? setStep(2) : show({ tone: "info", title: "Choisissez une catégorie." })
              }
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
            <Button full size="lg" disabled={pending} icon={<Send size={18} strokeWidth={2} />} onClick={submit}>
              Envoyer
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
