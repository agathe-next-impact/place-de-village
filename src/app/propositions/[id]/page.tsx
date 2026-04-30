import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { getProposition } from "@/lib/queries";
import { SupportButton } from "@/components/interactive/support-button";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProposition(id);
  if (!p) notFound();

  const pct = Math.min(100, (p.soutiens / p.seuil) * 100);
  const reached = pct >= 100;

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Proposition citoyenne"
        title={p.titre}
        action={<Link href="/agora?view=propo" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />
      <div className="px-[18px]">
        <Surface>
          <div className="flex justify-between text-[12px] text-ink-soft mb-1.5">
            <span><strong className="text-ink text-[14px]">{p.soutiens}</strong> soutiens</span>
            <span>seuil : {p.seuil}</span>
          </div>
          <div
            className="h-2.5 bg-surface-alt rounded overflow-hidden"
            role="progressbar"
            aria-valuenow={p.soutiens}
            aria-valuemin={0}
            aria-valuemax={p.seuil}
            aria-label={`${p.soutiens} soutiens sur ${p.seuil}`}
          >
            <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: reached ? "#7a8c3a" : "#1f6e7a" }} />
          </div>
          <div className="text-[11px] text-ink-muted mt-2">
            {p.joursRestants > 0 ? `${p.joursRestants} jours restants pour soutenir` : "Période de soutien close."}
          </div>
        </Surface>
      </div>

      {p.statut === "instruction" ? (
        <Section title="Statut">
          <Surface>
            <div className="text-[13px] text-ink-soft">
              Cette proposition est <strong className="text-ink">en instruction</strong> par le
              référent municipal. Elle ne peut pas encore être soutenue publiquement.
            </div>
          </Surface>
        </Section>
      ) : p.statut === "reponse-mairie" ? (
        <Section title="Engagement de la mairie">
          <Surface className="border-l-[3px] border-primary">
            <div className="text-[13.5px] text-ink">
              <strong className="text-primary">Seuil atteint.</strong> La mairie s'est engagée à publier sa réponse {p.reponseDate}.
            </div>
            <div className="text-[11.5px] text-ink-muted mt-2">
              Toute proposition ayant atteint son seuil de soutien fait l'objet d'une réponse formelle
              de la commune sous 60 jours (positive, négative ou mise à l'étude).
            </div>
          </Surface>
        </Section>
      ) : (
        <Section title="Soutenir cette proposition">
          <SupportButton propositionId={p.id} supported={p.supported} titre={p.titre} full size="lg" />
          <div className="text-[11.5px] text-ink-muted">
            Votre soutien est public. Vous pouvez le retirer tant que la période de soutien n'est pas close.
          </div>
        </Section>
      )}

      <Section title="Détail">
        <Surface>
          <Detail label="Constat">{p.constat ?? "—"}</Detail>
          <Detail label="Proposition">{p.proposition ?? p.titre}</Detail>
          <Detail label="Justification">{p.justification ?? "—"}</Detail>
          <Detail label="Points de vigilance">{p.vigilance ?? "—"}</Detail>
        </Surface>
      </Section>
    </ScreenShell>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2 first:pt-0 last:pb-0 border-b border-line-soft last:border-0">
      <div className="text-[10.5px] font-semibold uppercase tracking-eyebrow text-ink-muted">{label}</div>
      <div className="text-[13.5px] text-ink mt-1 whitespace-pre-line">{children}</div>
    </div>
  );
}
