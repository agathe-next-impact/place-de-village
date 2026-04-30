import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { db, schema } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { ReservationDecision } from "@/components/interactive/reservation-decision";

export default async function Page() {
  const all = await db
    .select({
      r: schema.reservations,
      eqNom: schema.equipements.nom,
    })
    .from(schema.reservations)
    .leftJoin(schema.equipements, eq(schema.reservations.equipementId, schema.equipements.id))
    .orderBy(desc(schema.reservations.createdAt))
    ;

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Vue mairie"
        title="Réservations à valider"
        action={<Link href="/mairie" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />
      <div className="px-[18px] flex flex-col gap-2.5">
        {all.length === 0 ? (
          <div className="text-[13px] text-ink-muted text-center py-6">
            Aucune réservation pour le moment.
          </div>
        ) : (
          all.map(({ r, eqNom }) => {
            const c =
              r.statut === "valide"
                ? "#7a8c3a"
                : r.statut === "en-attente"
                  ? "#e8a838"
                  : r.statut === "refus"
                    ? "#a8332b"
                    : "#7a746c";
            return (
              <Surface key={r.id}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="font-semibold text-[14px] text-ink">{eqNom ?? r.equipementId}</div>
                    <div className="text-[12px] text-ink-soft">{r.userName} — {r.motif}</div>
                    <div className="text-[11.5px] text-ink-muted mt-0.5">
                      {r.startIso === r.endIso ? r.startIso : `${r.startIso} → ${r.endIso}`}
                    </div>
                  </div>
                  <span
                    className="text-[10.5px] font-semibold uppercase tracking-eyebrow px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${c}22`, color: c }}
                  >
                    ● {r.statut}
                  </span>
                </div>
                {r.statut === "en-attente" && (
                  <ReservationDecision reservationId={r.id} />
                )}
                {r.statut === "refus" && r.refusMotif && (
                  <div className="text-[12px] text-ink-soft italic">Refus : {r.refusMotif}</div>
                )}
              </Surface>
            );
          })
        )}
      </div>
    </ScreenShell>
  );
}
