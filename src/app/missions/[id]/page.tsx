import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { getMission } from "@/lib/queries";
import { RegistrationButton } from "@/components/interactive/registration-button";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await getMission(id);
  if (!m) notFound();
  const complet = m.inscrits >= m.besoin;

  return (
    <ScreenShell>
      <PageHeader
        subtitle={`Mission · ${m.cat}`}
        title={m.titre}
        action={<Link href="/moi" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />

      <div className="px-[18px]">
        <Surface>
          <div className="flex flex-wrap gap-3 text-[13px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><Calendar size={14} strokeWidth={1.6} /> {m.date}</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={14} strokeWidth={1.6} /> {m.duree}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} strokeWidth={1.6} /> {m.lieu}</span>
          </div>
          {m.description && <div className="text-[13px] text-ink mt-3 leading-relaxed">{m.description}</div>}
          <div className="mt-3"><Chip size="sm">Référent · {m.ref}</Chip></div>
        </Surface>
      </div>

      <Section title="Capacité">
        <Surface>
          <div className="flex justify-between text-[12px] text-ink-soft mb-1.5">
            <span><strong className="text-ink">{m.inscrits}</strong> bénévoles inscrit·e·s</span>
            <span>besoin : {m.besoin}</span>
          </div>
          <div className="h-2 bg-surface-alt rounded overflow-hidden" role="progressbar" aria-valuenow={m.inscrits} aria-valuemin={0} aria-valuemax={m.besoin}>
            <div className="h-full bg-primary rounded" style={{ width: `${(m.inscrits / m.besoin) * 100}%` }} />
          </div>
        </Surface>
      </Section>

      <Section title="Engagement">
        <RegistrationButton
          missionId={m.id}
          registered={m.registered}
          complet={complet}
          titre={m.titre}
          full
          size="lg"
        />
        <div className="text-[11.5px] text-ink-muted">
          Confirmation par le référent. Rappel J-1 par email (consentement requis pour le SMS).
        </div>
      </Section>
    </ScreenShell>
  );
}
