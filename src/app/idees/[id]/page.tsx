import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare, Sparkles } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Chip } from "@/components/ui/chip";
import { Section } from "@/components/ui/section";
import { Avatar } from "@/components/ui/avatar";
import { getSuggestion } from "@/lib/queries";
import { SignalButton } from "@/components/interactive/signal-button";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSuggestion(id);
  if (!s) notFound();

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Suggestion citoyenne"
        title={s.titre}
        action={<Link href="/agora" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
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
                <Chip size="sm" color="#e8a838">{s.cat}</Chip>
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
          {(["vis", "important", "contribuer"] as const).map((k) => (
            <SignalButton
              key={k}
              suggestionId={s.id}
              type={k}
              count={s.signaux[k]}
              active={s.myEmissions.includes(k)}
              className="rounded-lg p-3 min-h-[72px]"
            />
          ))}
        </div>
        <div className="text-[11.5px] text-ink-muted">
          Pas de like, pas de classement. Les signaux sont qualifiés pour aider la délibération à mûrir.
        </div>
      </Section>

      <Section title="Discussion">
        <Surface>
          <div className="text-[13px] text-ink-soft flex items-center gap-2">
            <MessageSquare size={14} strokeWidth={1.6} className="text-primary" />
            {s.contributions} contribution{s.contributions > 1 ? "s" : ""} liée{s.contributions > 1 ? "s" : ""}
          </div>
        </Surface>
      </Section>
    </ScreenShell>
  );
}
