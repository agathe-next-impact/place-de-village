"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { missions, registeredMissions, toggleRegistration } = useStore();
  const { show } = useToast();
  const m = missions.find((x) => x.id === id);

  if (!m) {
    return (
      <ScreenShell active="me">
        <PageHeader
          title="Mission introuvable"
          subtitle="Erreur"
          onBack={() => router.push("/?tab=me")}
        />
      </ScreenShell>
    );
  }

  const registered = registeredMissions.has(m.id);
  const complet = m.inscrits >= m.besoin;

  return (
    <ScreenShell active="me">
      <PageHeader
        subtitle={`Mission · ${m.cat}`}
        title={m.titre}
        onBack={() => router.push("/?tab=me")}
      />

      <div className="px-[18px]">
        <Surface>
          <div className="flex flex-wrap gap-3 text-[13px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} strokeWidth={1.6} /> {m.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} strokeWidth={1.6} /> {m.duree}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={1.6} /> {m.lieu}
            </span>
          </div>
          <div className="mt-3">
            <Chip size="sm">Référent · {m.ref}</Chip>
          </div>
        </Surface>
      </div>

      <Section title="Capacité">
        <Surface>
          <div className="flex justify-between text-[12px] text-ink-soft mb-1.5">
            <span>
              <strong className="text-ink">{m.inscrits}</strong> bénévoles inscrit·e·s
            </span>
            <span>besoin : {m.besoin}</span>
          </div>
          <div
            className="h-2 bg-surface-alt rounded overflow-hidden"
            role="progressbar"
            aria-valuenow={m.inscrits}
            aria-valuemin={0}
            aria-valuemax={m.besoin}
          >
            <div
              className="h-full bg-primary rounded"
              style={{ width: `${(m.inscrits / m.besoin) * 100}%` }}
            />
          </div>
        </Surface>
      </Section>

      <Section title="Engagement">
        {complet && !registered ? (
          <div className="bg-surface-alt rounded-lg p-3.5 text-[13px] text-ink-soft">
            La mission est complète. Vous pouvez consulter d'autres missions
            dans l'onglet <strong>Moi</strong>.
          </div>
        ) : (
          <Button
            full
            size="lg"
            variant={registered ? "secondary" : "primary"}
            aria-pressed={registered}
            onClick={() => {
              const now = toggleRegistration(m.id);
              show({
                tone: now ? "success" : "info",
                title: now ? "Inscription confirmée" : "Inscription annulée",
                desc: m.titre,
              });
            }}
          >
            {registered ? "Inscrit·e ✓ — annuler" : "Je m'inscris"}
          </Button>
        )}
        <div className="text-[11.5px] text-ink-muted">
          Confirmation par le référent de mission. Rappel J-1 par email
          (consentement requis pour le SMS).
        </div>
      </Section>
    </ScreenShell>
  );
}
