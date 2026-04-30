import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { listEmailQueue } from "@/lib/queries";
import { isSmtpConfigured, listOutbox } from "@/lib/email/transport";

const STATUS_COLOR: Record<string, string> = {
  pending: "#e8a838",
  sent: "#7a8c3a",
  captured: "#1f6e7a",
  failed: "#a8332b",
};

export default async function Page() {
  const queue = await listEmailQueue(80);
  const outbox = listOutbox(80);
  const smtp = isSmtpConfigured();

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Vue mairie · Emails sortants"
        title="File d'envoi"
        action={<Link href="/mairie" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />

      <div className="px-[18px] mb-3">
        <Surface className={smtp ? "border-l-[3px] border-success" : "border-l-[3px] border-accent"}>
          <div className="flex items-start gap-2.5">
            <span aria-hidden className="w-2 h-2 mt-1.5 rounded-pill" style={{ backgroundColor: smtp ? "#7a8c3a" : "#e8a838" }} />
            <div className="flex-1">
              <div className="font-semibold text-[13.5px] text-ink">
                {smtp ? "SMTP configuré" : "SMTP non configuré — mode outbox local"}
              </div>
              <div className="text-[11.5px] text-ink-muted mt-0.5">
                {smtp
                  ? `Host : ${process.env.SMTP_HOST}:${process.env.SMTP_PORT ?? 587}`
                  : "Les emails sont écrits dans data/outbox/ au lieu d'être envoyés."}
              </div>
            </div>
          </div>
        </Surface>
      </div>

      <Section title={`Queue (${queue.length})`} dense>
        {queue.length === 0 ? (
          <div className="text-[13px] text-ink-muted text-center py-4">
            Aucun email en queue.
          </div>
        ) : (
          queue.map((m) => {
            const c = STATUS_COLOR[m.status] ?? "#7a746c";
            return (
              <Surface key={m.id}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10.5px] font-semibold uppercase tracking-eyebrow text-ink-muted">
                      {m.template} · #{m.id}
                    </div>
                    <div className="font-semibold text-[13.5px] text-ink mt-0.5">{m.subject}</div>
                    <div className="text-[11.5px] text-ink-muted mt-0.5">
                      à {m.toName ? `${m.toName} <${m.toAddress}>` : m.toAddress}
                    </div>
                  </div>
                  <Chip size="sm" color={c} prefixDot>{m.status}</Chip>
                </div>
                {m.lastError && (
                  <div className="text-[11.5px] text-danger mt-1 italic">{m.lastError}</div>
                )}
                <div className="text-[10.5px] text-ink-muted mt-1.5">
                  Créé {m.createdAt.toLocaleString("fr-FR")}
                  {m.sentAt && ` · délivré ${m.sentAt.toLocaleString("fr-FR")}`}
                  {m.attempts > 0 && ` · ${m.attempts} tentative${m.attempts > 1 ? "s" : ""}`}
                </div>
              </Surface>
            );
          })
        )}
      </Section>

      {!smtp && outbox.length > 0 && (
        <Section title={`Outbox local (${outbox.length} fichiers .eml)`} dense>
          <Surface>
            <ul className="text-[12px] text-ink-soft space-y-0.5">
              {outbox.slice(0, 30).map((f) => (
                <li key={f.name} className="flex justify-between gap-3 font-mono">
                  <span className="truncate">{f.name}</span>
                  <span className="text-ink-muted whitespace-nowrap">{f.sizeKb} ko</span>
                </li>
              ))}
            </ul>
          </Surface>
          <div className="text-[11px] text-ink-muted">
            Ces fichiers <code>.eml</code> peuvent être ouverts dans n'importe
            quel client mail (Thunderbird, Apple Mail) pour visualiser le rendu.
          </div>
        </Section>
      )}
    </ScreenShell>
  );
}
