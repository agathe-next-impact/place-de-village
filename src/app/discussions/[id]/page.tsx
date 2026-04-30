import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Sparkles, TriangleAlert } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Avatar } from "@/components/ui/avatar";
import { getCurrentUserPub, getDiscussion } from "@/lib/queries";
import { PromoteButton } from "@/components/interactive/promote-button";
import { ContributeForm } from "@/components/interactive/contribute-form";
import { SynthesisForm } from "@/components/interactive/synthesis-form";
import { FlagButton } from "@/components/interactive/flag-button";

const TYPE_COLOR: Record<string, string> = {
  accord: "#7a8c3a",
  nuance: "#1f6e7a",
  objection: "#a8332b",
  question: "#e8a838",
  factuel: "#7a746c",
};

const TYPE_LABEL: Record<string, string> = {
  accord: "Accord",
  nuance: "Nuance",
  objection: "Objection",
  question: "Question",
  factuel: "Apport factuel",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [d, me] = await Promise.all([getDiscussion(id), getCurrentUserPub()]);
  if (!d) notFound();
  const canSynthesize = me.role !== "habitant";

  const segs = [
    { val: d.accord, color: "#7a8c3a", label: "accords" },
    { val: d.nuance, color: "#1f6e7a", label: "nuances" },
    { val: d.objection, color: "#a8332b", label: "objections" },
    { val: d.question, color: "#e8a838", label: "questions" },
    { val: d.factuel, color: "#7a746c", label: "apports factuels" },
  ];

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Discussion"
        title={d.titre}
        action={<Link href="/agora?view=discus" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />

      <div className="px-[18px]">
        <Surface>
          <div className="text-[12px] text-ink-muted">
            Animé par {d.anim} · {d.contribs} contributions
          </div>
          <div className="flex h-2 rounded overflow-hidden mt-3 gap-px" aria-hidden>
            {segs.map((s) => (
              <div key={s.label} style={{ flex: s.val, backgroundColor: s.color }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-[12px] text-ink-soft">
            {segs.map((s) => (
              <span key={s.label}>
                <span className="font-bold" style={{ color: s.color }}>{s.val}</span> {s.label}
              </span>
            ))}
          </div>
          {d.derniereSynth && (
            <div className="mt-3 px-2.5 py-2 bg-surface-alt rounded text-[12px] text-ink-soft flex items-center gap-1.5">
              <FileText size={12} strokeWidth={1.6} /> Synthèse du {d.derniereSynth}
            </div>
          )}
        </Surface>
      </div>

      <Section title={`Synthèses (${d.synthesises.length})`}>
        {d.synthesises.length === 0 ? (
          <div className="text-[12.5px] text-ink-muted text-center py-2">
            Aucune synthèse publiée pour l'instant.
          </div>
        ) : (
          d.synthesises.slice(0, 3).map((s) => (
            <Surface key={s.id} className="border-l-[3px] border-primary">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText size={12} strokeWidth={1.6} className="text-primary" />
                <span className="text-[10.5px] font-semibold uppercase tracking-eyebrow text-primary">
                  Synthèse · {s.authorName}
                </span>
                <span className="text-[11px] text-ink-muted ml-auto">
                  {s.publishedAt.toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="text-[13px] text-ink leading-[1.5] whitespace-pre-line">{s.texte}</div>
            </Surface>
          ))
        )}
        {canSynthesize && (
          <div className="mt-2">
            <SynthesisForm discussionId={d.id} />
          </div>
        )}
      </Section>

      <Section title="Apporter une contribution">
        <Surface>
          <ContributeForm discussionId={d.id} />
        </Surface>
      </Section>

      <Section title={`Contributions (${d.list.length})`}>
        {d.list.slice(0, 8).map((c) => (
          <Surface key={c.id}>
            <div className="flex items-start gap-2.5">
              <Avatar name={c.auteur} size={28} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span
                    className="text-[10.5px] font-semibold uppercase tracking-eyebrow px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${TYPE_COLOR[c.type]}22`, color: TYPE_COLOR[c.type] }}
                  >
                    ● {TYPE_LABEL[c.type]}
                  </span>
                  <span className="text-[11.5px] text-ink-muted">
                    {c.auteur} · {c.at.toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="text-[13px] text-ink leading-[1.5]">{c.texte}</div>
                <div className="mt-1.5">
                  <FlagButton entityType="contribution" entityId={String(c.id)} />
                </div>
              </div>
            </div>
          </Surface>
        ))}
        {d.list.length === 0 && (
          <div className="text-[13px] text-ink-muted text-center py-4">
            Aucune contribution pour l'instant. Soyez la·le premier·ère.
          </div>
        )}
      </Section>

      {d.mature ? (
        <Section title="Maturité">
          <div className="bg-success/10 border border-success/30 rounded-lg p-3.5 flex items-start gap-2.5">
            <Sparkles size={18} strokeWidth={1.8} className="text-success flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-[13.5px] text-ink">Maturation suffisante atteinte</div>
              <div className="text-[12px] text-ink-soft mt-1">
                La discussion peut être promue en proposition. La promotion exige un format imposé
                (constat / proposition / justification / vigilance) et passera par la validation
                d'un référent municipal.
              </div>
              <div className="mt-2.5">
                <PromoteButton discussionId={d.id} discussionTitre={d.titre} />
              </div>
            </div>
          </div>
        </Section>
      ) : (
        <Section title="Maturité">
          <div className="bg-surface-alt rounded-lg p-3.5 flex items-start gap-2.5 text-[12.5px] text-ink-soft">
            <TriangleAlert size={16} strokeWidth={1.8} className="text-ink-muted flex-shrink-0 mt-0.5" />
            La discussion n'a pas encore atteint le seuil de maturité (objections traitées, synthèse
            récente, volume de contributions ≥ 15).
          </div>
        </Section>
      )}
    </ScreenShell>
  );
}
