import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { listOpenModerationFlags } from "@/lib/queries";
import { ModerationDecision } from "@/components/interactive/moderation-decision";

export default async function Page() {
  const flags = await listOpenModerationFlags();
  return (
    <ScreenShell>
      <PageHeader
        subtitle="Modération a posteriori"
        title="Signalements de contenu"
        action={<Link href="/mairie" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />
      <Section dense>
        {flags.length === 0 ? (
          <div className="px-[18px] py-12 text-center text-ink-muted text-[13px]">
            Aucun signalement de contenu en attente. ✓
          </div>
        ) : (
          flags.map((f) => (
            <Surface key={f.id}>
              <div className="text-[10.5px] font-semibold uppercase tracking-eyebrow text-ink-muted">
                {f.entityType} · {f.entityId}
              </div>
              <div className="font-semibold text-[13.5px] text-ink mt-1">{f.reason}</div>
              <div className="text-[11px] text-ink-muted mt-1">
                Signalé le {f.at.toLocaleString("fr-FR")}
              </div>
              <div className="mt-2.5">
                <ModerationDecision flagId={f.id} />
              </div>
            </Surface>
          ))
        )}
      </Section>
    </ScreenShell>
  );
}
