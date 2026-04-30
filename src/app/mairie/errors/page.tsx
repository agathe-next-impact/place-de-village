import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { listErrors } from "@/lib/queries";

const LEVEL_COLOR: Record<string, string> = {
  error: "#a8332b",
  warn: "#e8a838",
  info: "#1f6e7a",
};

export default async function Page() {
  const items = await listErrors(80);
  const sentryConfigured = !!process.env.SENTRY_DSN;

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Vue mairie · Suivi d'erreurs"
        title="Log d'erreurs"
        action={<Link href="/mairie" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />

      <div className="px-[18px] mb-3">
        <Surface className={sentryConfigured ? "border-l-[3px] border-success" : "border-l-[3px] border-accent"}>
          <div className="flex items-start gap-2.5">
            <span aria-hidden className="w-2 h-2 mt-1.5 rounded-pill" style={{ backgroundColor: sentryConfigured ? "#7a8c3a" : "#e8a838" }} />
            <div className="flex-1">
              <div className="font-semibold text-[13.5px] text-ink">
                {sentryConfigured ? "Sentry configuré" : "Sentry non configuré — log local uniquement"}
              </div>
              <div className="text-[11.5px] text-ink-muted mt-0.5">
                {sentryConfigured
                  ? "Les erreurs sont aussi remontées à l'instance Sentry / GlitchTip."
                  : "Définissez SENTRY_DSN pointant vers votre instance Sentry self-hosted ou GlitchTip pour activer le suivi distribué."}
              </div>
            </div>
          </div>
        </Surface>
      </div>

      <Section title={`Évènements récents (${items.length})`} dense>
        {items.length === 0 ? (
          <div className="text-[13px] text-ink-muted text-center py-4">
            Aucune erreur enregistrée. ✓
          </div>
        ) : (
          items.map((e) => (
            <Surface key={e.id}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] font-semibold uppercase tracking-eyebrow text-ink-muted">
                    #{e.id} · {e.runtime ?? "?"}
                    {e.sentryEventId && <> · Sentry {e.sentryEventId.slice(0, 8)}</>}
                  </div>
                  <div className="font-semibold text-[13.5px] text-ink mt-0.5 break-words">
                    {e.message}
                  </div>
                </div>
                <Chip size="sm" color={LEVEL_COLOR[e.level] ?? "#6e6862"} prefixDot>
                  {e.level}
                </Chip>
              </div>
              {e.context && (
                <div className="text-[11.5px] text-ink-soft font-mono mt-1.5 truncate">
                  {e.context}
                </div>
              )}
              {e.stack && (
                <details className="mt-2 text-[11px] text-ink-muted">
                  <summary className="cursor-pointer font-semibold">Stack</summary>
                  <pre className="mt-1 whitespace-pre-wrap font-mono text-[10.5px] leading-snug">
                    {e.stack}
                  </pre>
                </details>
              )}
              <div className="text-[10.5px] text-ink-muted mt-1.5">
                {e.at.toLocaleString("fr-FR")}
              </div>
            </Surface>
          ))
        )}
      </Section>
    </ScreenShell>
  );
}
