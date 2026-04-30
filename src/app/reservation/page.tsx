import Link from "next/link";
import { Building2, Calendar, Mic, Wrench } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { listEquipements } from "@/lib/queries";

const ICON_MAP: Record<string, typeof Building2> = {
  eq3: Wrench,
  eq4: Mic,
};

export default async function Page() {
  const items = await listEquipements();

  return (
    <ScreenShell>
      <PageHeader subtitle="Pôle 6" title="Réserver un équipement" />
      <Section dense>
        {items.map((eq) => {
          const Icon = ICON_MAP[eq.id] ?? Building2;
          const next = eq.nextReservation;
          const dispo = next
            ? next.statut === "valide"
              ? `Réservé jusqu'au ${next.endIso}`
              : `Demande en attente : ${next.startIso}`
            : "Disponible";
          const isReserved = next?.statut === "valide";
          return (
            <Surface key={eq.id}>
              <div className="flex justify-between items-start gap-2.5">
                <div className="flex-1">
                  <div className="font-bold text-[16px] text-ink tracking-title">{eq.nom}</div>
                  <div className="text-[12px] text-ink-soft mt-1">{eq.capacite}</div>
                  <div className="text-[12px] text-ink-muted mt-0.5">{eq.tarif}</div>
                  {eq.description && (
                    <div className="text-[12px] text-ink-soft mt-1.5">{eq.description}</div>
                  )}
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
                    isReserved ? "text-danger" : "text-success",
                  ].join(" ")}
                >
                  <span aria-hidden className="w-1.5 h-1.5 rounded-pill" style={{ backgroundColor: isReserved ? "#a8332b" : "#7a8c3a" }} />
                  {dispo}
                </div>
                <Link
                  href={`/reservation/${eq.id}`}
                  className="px-3 py-1.5 rounded bg-primary text-white text-[13px] font-semibold flex items-center gap-1.5 no-underline min-h-[36px]"
                >
                  <Calendar size={14} strokeWidth={1.6} />
                  Réserver
                </Link>
              </div>
            </Surface>
          );
        })}
      </Section>
    </ScreenShell>
  );
}
