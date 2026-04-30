import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { listSmsQueue } from "@/lib/queries";
import { isRealProviderConfigured, listOutbox } from "@/lib/sms/transport";
import { DispatchPendingButton } from "@/components/interactive/dispatch-pending-sms";

const STATUS_COLOR: Record<string, string> = {
  pending: "#e8a838",
  sent: "#7a8c3a",
  captured: "#1f6e7a",
  failed: "#a8332b",
};

export default async function Page() {
  const queue = await listSmsQueue(80);
  const outbox = listOutbox(50);
  const provider = (process.env.SMS_PROVIDER ?? "outbox").toLowerCase();
  const real = isRealProviderConfigured();

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Vue mairie · SMS sortants"
        title="File d'envoi"
        action={<Link href="/mairie" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />

      <div className="px-[18px] mb-3 flex flex-col gap-2">
        <Surface className={real ? "border-l-[3px] border-success" : "border-l-[3px] border-accent"}>
          <div className="flex items-start gap-2.5">
            <span aria-hidden className="w-2 h-2 mt-1.5 rounded-pill" style={{ backgroundColor: real ? "#7a8c3a" : "#e8a838" }} />
            <div className="flex-1">
              <div className="font-semibold text-[13.5px] text-ink">
                Provider : <code>{provider}</code>
              </div>
              <div className="text-[11.5px] text-ink-muted mt-0.5">
                {real
                  ? "Les SMS sont envoyés au provider configuré."
                  : "Mode démo : les SMS sont écrits dans data/sms-outbox/ au lieu d'être envoyés."}
              </div>
            </div>
          </div>
        </Surface>
        <DispatchPendingButton />
      </div>

      <Section title={`Queue (${queue.length})`} dense>
        {queue.length === 0 ? (
          <div className="text-[13px] text-ink-muted text-center py-4">
            Aucun SMS en queue. Inscrivez-vous à une mission de bénévolat avec
            consentement SMS et téléphone renseignés pour générer un rappel J-1.
          </div>
        ) : (
          queue.map((m) => {
            const c = STATUS_COLOR[m.status] ?? "#6e6862";
            const scheduled =
              m.status === "pending" && m.scheduledAt > new Date()
                ? `programmé ${m.scheduledAt.toLocaleString("fr-FR")}`
                : null;
            return (
              <Surface key={m.id}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10.5px] font-semibold uppercase tracking-eyebrow text-ink-muted">
                      {m.template} · #{m.id}
                    </div>
                    <div className="font-mono text-[11.5px] text-ink mt-0.5">{m.toPhone}</div>
                  </div>
                  <Chip size="sm" color={c} prefixDot>{m.status}</Chip>
                </div>
                <div className="text-[12.5px] text-ink-soft mt-1.5 italic leading-snug">
                  « {m.body} »
                </div>
                {m.lastError && (
                  <div className="text-[11.5px] text-danger mt-1 italic">{m.lastError}</div>
                )}
                <div className="text-[10.5px] text-ink-muted mt-1.5 flex flex-wrap gap-x-3">
                  <span>Créé {m.createdAt.toLocaleString("fr-FR")}</span>
                  {scheduled && <span>· {scheduled}</span>}
                  {m.sentAt && <span>· délivré {m.sentAt.toLocaleString("fr-FR")}</span>}
                  <span>· {m.body.length} car / {m.body.length <= 160 ? 1 : Math.ceil((m.body.length - 7) / 153) + 1} segment(s)</span>
                </div>
              </Surface>
            );
          })
        )}
      </Section>

      {!real && outbox.length > 0 && (
        <Section title={`Outbox local (${outbox.length} fichiers)`} dense>
          <Surface>
            <ul className="text-[12px] text-ink-soft space-y-0.5 font-mono">
              {outbox.slice(0, 30).map((f) => (
                <li key={f.name} className="flex justify-between gap-3">
                  <span className="truncate">{f.name}</span>
                  <span className="text-ink-muted whitespace-nowrap">{f.sizeKb} ko</span>
                </li>
              ))}
            </ul>
          </Surface>
        </Section>
      )}
    </ScreenShell>
  );
}
