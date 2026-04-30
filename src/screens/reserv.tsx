"use client";

import { Building2, Calendar, Mic, Wrench } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { TRIZAC_DATA } from "@/lib/data";
import { useToast } from "@/components/ui/toast";

const ICON_MAP: Record<string, typeof Building2> = {
  eq3: Wrench,
  eq4: Mic,
};

export function ReservScreen() {
  const { show } = useToast();
  return (
    <div>
      <PageHeader subtitle="Pôle 6" title="Réserver un équipement" />
      <Section dense>
        {TRIZAC_DATA.equipements.map((eq) => {
          const Icon = ICON_MAP[eq.id] ?? Building2;
          const reserved = eq.dispo.includes("Réservé");
          return (
            <Surface key={eq.id}>
              <div className="flex justify-between items-start gap-2.5">
                <div className="flex-1">
                  <div className="font-bold text-[16px] text-ink tracking-title">
                    {eq.nom}
                  </div>
                  <div className="text-[12px] text-ink-soft mt-1">{eq.capacite}</div>
                  <div className="text-[12px] text-ink-muted mt-0.5">{eq.tarif}</div>
                </div>
                <div
                  className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(31,110,122,0.08)", color: "#1f6e7a" }}
                >
                  <Icon size={22} strokeWidth={1.6} />
                </div>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-line-soft flex justify-between items-center">
                <div
                  className={[
                    "text-[11.5px] font-semibold flex items-center gap-1",
                    reserved ? "text-danger" : "text-success",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className="w-1.5 h-1.5 rounded-pill"
                    style={{ backgroundColor: reserved ? "#a8332b" : "#7a8c3a" }}
                  />
                  {eq.dispo}
                </div>
                <Button
                  size="sm"
                  variant={reserved ? "ghost" : "primary"}
                  icon={<Calendar size={14} strokeWidth={1.6} />}
                  disabled={reserved}
                  onClick={() =>
                    show({
                      tone: "success",
                      title: "Demande envoyée",
                      desc: `${eq.nom} — en attente de validation par le référent municipal.`,
                    })
                  }
                >
                  {reserved ? "Indisponible" : "Demander"}
                </Button>
              </div>
            </Surface>
          );
        })}
      </Section>
    </div>
  );
}
