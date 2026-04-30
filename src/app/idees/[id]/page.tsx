"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Sparkles } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Chip } from "@/components/ui/chip";
import { Section } from "@/components/ui/section";
import { Avatar } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { suggestions, emittedSignals, emitSignal } = useStore();
  const { show } = useToast();
  const s = suggestions.find((x) => x.id === id);

  if (!s) {
    return (
      <ScreenShell active="agora">
        <PageHeader
          title="Idée introuvable"
          subtitle="Erreur"
          onBack={() => router.push("/?tab=agora")}
        />
      </ScreenShell>
    );
  }

  const emitted = emittedSignals[s.id] ?? new Set();

  return (
    <ScreenShell active="agora">
      <PageHeader
        subtitle="Suggestion citoyenne"
        title={s.titre}
        onBack={() => router.push("/?tab=agora")}
      />
      <div className="px-[18px]">
        <Surface>
          <div className="flex items-start gap-2.5">
            <Avatar name={s.auteur} size={32} />
            <div className="flex-1">
              <div className="text-[12px] text-ink-muted">
                Proposée par {s.auteur} · il y a {s.age}
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
        </Surface>
      </div>

      <Section title="Émettre un signal qualifié">
        <div className="grid grid-cols-3 gap-2">
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
                key={sig.key}
                type="button"
                onClick={() => {
                  const added = emitSignal(s.id, sig.key);
                  show({
                    tone: added ? "success" : "info",
                    title: added ? "Signal enregistré" : "Signal retiré",
                    desc: sig.lab,
                  });
                }}
                aria-pressed={active}
                className={[
                  "rounded-lg p-3 flex flex-col items-center gap-1 min-h-[72px] border transition-colors",
                  active
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-surface border-line-soft text-ink-soft",
                ].join(" ")}
              >
                <div className="text-[12px] font-medium">{sig.lab}</div>
                <div
                  className={[
                    "text-[18px] font-bold tabular-nums",
                    active ? "text-primary" : "text-ink",
                  ].join(" ")}
                >
                  {s.signaux[sig.key]}
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-[11.5px] text-ink-muted">
          Pas de like, pas de classement. Les signaux sont qualifiés pour aider
          la délibération à mûrir.
        </div>
      </Section>

      <Section title="Discussion">
        <Surface>
          <div className="text-[13px] text-ink-soft flex items-center gap-2">
            <MessageSquare size={14} strokeWidth={1.6} className="text-primary" />
            {s.contributions} contribution{s.contributions > 1 ? "s" : ""} liée{s.contributions > 1 ? "s" : ""}
            {" — "}
            <span className="text-primary font-semibold">
              voir / participer →
            </span>
          </div>
        </Surface>
      </Section>
    </ScreenShell>
  );
}
