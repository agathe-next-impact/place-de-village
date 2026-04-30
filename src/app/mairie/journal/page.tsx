import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { listAuditLog } from "@/lib/queries";

export default async function Page() {
  const audit = await listAuditLog(200);
  return (
    <ScreenShell>
      <PageHeader
        subtitle="Transparence"
        title="Journal des décisions"
        action={<Link href="/mairie" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />
      <div className="px-[18px]">
        <div className="text-[12.5px] text-ink-soft mb-3">
          Toutes les actions sensibles (validation, modération, promotion, refus, transition
          d'état) sont tracées et consultables. Cf. CdC §2.1 « Transparence et traçabilité ».
        </div>
        <Surface>
          {audit.length === 0 ? (
            <div className="text-[13px] text-ink-muted text-center py-4">
              Aucune action enregistrée pour l'instant.
            </div>
          ) : (
            <ul className="divide-y divide-line-soft">
              {audit.map((a) => (
                <li key={a.id} className="py-2 first:pt-0 last:pb-0">
                  <div className="text-[13px] text-ink">
                    <span className="font-semibold">{a.actorName ?? "Système"}</span>
                    <span className="text-ink-soft"> · {a.action} </span>
                    <span className="text-ink-muted">({a.entityType})</span>
                  </div>
                  {a.details && <div className="text-[12px] text-ink-soft">{a.details}</div>}
                  <div className="text-[11px] text-ink-muted mt-0.5">
                    {a.at.toLocaleString("fr-FR")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>
    </ScreenShell>
  );
}
