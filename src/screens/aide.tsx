"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, MessageSquare } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { TRIZAC_DATA } from "@/lib/data";

type Filter = "tout" | "demande" | "offre";

export function AideScreen() {
  const [view, setView] = useState<Filter>("tout");
  const items =
    view === "tout"
      ? TRIZAC_DATA.entraide
      : TRIZAC_DATA.entraide.filter((e) => e.type === view);

  return (
    <div>
      <PageHeader subtitle="Pôle 4" title="Entraide entre voisins" />

      <div className="px-[18px] pb-3.5">
        <div className="flex bg-surface-alt p-[3px] rounded gap-0.5">
          {(
            [
              { id: "tout", label: "Tout" },
              { id: "demande", label: "Demandes" },
              { id: "offre", label: "Offres" },
            ] as const
          ).map((o) => {
            const active = view === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setView(o.id)}
                aria-pressed={active}
                className={[
                  "flex-1 px-2.5 py-2 rounded font-semibold text-[13px]",
                  active
                    ? "bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "bg-transparent text-ink-muted",
                ].join(" ")}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <Section dense>
        {items.map((e) => {
          const isDemande = e.type === "demande";
          const c = isDemande ? "#1f6e7a" : "#7a8c3a";
          const Icon = isDemande ? ArrowDown : ArrowUp;
          return (
            <Surface key={e.id}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className="text-[10px] font-bold uppercase tracking-eyebrow px-2 py-0.5 rounded-pill flex items-center gap-1"
                  style={{ backgroundColor: `${c}22`, color: c }}
                >
                  <Icon size={10} strokeWidth={2} />
                  {isDemande ? "demande" : "offre"}
                </span>
                <span className="text-[11.5px] text-ink-muted">· {e.quartier}</span>
              </div>
              <div className="font-bold text-[15.5px] text-ink leading-[1.3] tracking-title">
                {e.titre}
              </div>
              <div className="text-[13px] text-ink-soft mt-1.5 leading-[1.5]">
                {e.desc}
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-line-soft">
                <div className="flex items-center gap-2">
                  <Avatar name={e.auteur} size={26} />
                  <div>
                    <div className="text-[12px] font-semibold text-ink">
                      {e.auteur}
                      {e.age ? `, ${e.age}` : ""}
                    </div>
                    <div className="text-[11px] text-ink-muted">{e.date}</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<MessageSquare size={14} strokeWidth={1.6} />}
                >
                  {isDemande ? "Aider" : "Contacter"}
                </Button>
              </div>
            </Surface>
          );
        })}
      </Section>
    </div>
  );
}
