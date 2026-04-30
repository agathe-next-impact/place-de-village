"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { propositions, supportedPropositions, toggleSupport } = useStore();
  const { show } = useToast();
  const p = propositions.find((x) => x.id === id);

  if (!p) {
    return (
      <ScreenShell active="agora">
        <PageHeader
          title="Proposition introuvable"
          subtitle="Erreur"
          onBack={() => router.push("/?tab=agora")}
        />
      </ScreenShell>
    );
  }

  const pct = Math.min(100, (p.soutiens / p.seuil) * 100);
  const reached = pct >= 100;
  const supported = supportedPropositions.has(p.id);

  return (
    <ScreenShell active="agora">
      <PageHeader
        subtitle="Proposition citoyenne"
        title={p.titre}
        onBack={() => router.push("/?tab=agora")}
      />

      <div className="px-[18px]">
        <Surface>
          <div className="flex justify-between text-[12px] text-ink-soft mb-1.5">
            <span>
              <strong className="text-ink text-[14px]">{p.soutiens}</strong> soutiens
            </span>
            <span>seuil : {p.seuil}</span>
          </div>
          <div
            className="h-2.5 bg-surface-alt rounded overflow-hidden"
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
          <div className="text-[11px] text-ink-muted mt-2">
            {p.jours > 0 ? `${p.jours} jours restants pour soutenir` : "Période de soutien close."}
          </div>
        </Surface>
      </div>

      {p.statut === "reponse-mairie" ? (
        <Section title="Engagement de la mairie">
          <Surface className="border-l-[3px] border-primary">
            <div className="text-[13.5px] text-ink">
              <strong className="text-primary">Seuil atteint.</strong> La mairie
              s'est engagée à publier sa réponse {p.reponseDate}.
            </div>
            <div className="text-[11.5px] text-ink-muted mt-2">
              Toute proposition ayant atteint son seuil de soutien fait l'objet
              d'une réponse formelle de la commune sous 60 jours (positive,
              négative ou mise à l'étude).
            </div>
          </Surface>
        </Section>
      ) : (
        <Section title="Soutenir cette proposition">
          <Button
            full
            size="lg"
            variant={supported ? "secondary" : "primary"}
            icon={<Check size={18} strokeWidth={2} />}
            aria-pressed={supported}
            onClick={() => {
              const now = toggleSupport(p.id);
              show({
                tone: now ? "success" : "info",
                title: now ? "Soutien enregistré" : "Soutien retiré",
                desc: p.titre,
              });
            }}
          >
            {supported ? "Soutenu ✓" : "Je soutiens"}
          </Button>
          <div className="text-[11.5px] text-ink-muted">
            Votre soutien est public. Vous pouvez le retirer tant que la période
            de soutien n'est pas close.
          </div>
        </Section>
      )}

      <Section title="Détail">
        <Surface>
          <Detail label="Constat">À documenter dans le détail.</Detail>
          <Detail label="Proposition">{p.titre}</Detail>
          <Detail label="Justification">À documenter dans le détail.</Detail>
          <Detail label="Points de vigilance">À documenter dans le détail.</Detail>
        </Surface>
      </Section>
    </ScreenShell>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2 first:pt-0 last:pb-0 border-b border-line-soft last:border-0">
      <div className="text-[10.5px] font-semibold uppercase tracking-eyebrow text-ink-muted">
        {label}
      </div>
      <div className="text-[13.5px] text-ink mt-1">{children}</div>
    </div>
  );
}
