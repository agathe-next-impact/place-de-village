import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { db, schema } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { listReservationsForEquipement } from "@/lib/queries";
import { ReserveForm } from "@/components/interactive/reserve-form";

const FRENCH_MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eqRow = await db.select().from(schema.equipements).where(eq(schema.equipements.id, id)).then(r => r[0]);
  if (!eqRow) notFound();
  const reservations = await listReservationsForEquipement(id);

  // Construit la liste des dates indisponibles
  const blocked: string[] = [];
  for (const r of reservations) {
    if (r.statut === "refus" || r.statut === "annule") continue;
    const start = new Date(r.startIso);
    const end = new Date(r.endIso);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      blocked.push(d.toISOString().slice(0, 10));
    }
  }

  // Vue 60 jours à partir d'aujourd'hui
  const today = new Date();
  const days: { iso: string; d: Date; busy: boolean }[] = [];
  for (let i = 0; i < 56; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ iso, d, busy: blocked.includes(iso) });
  }

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Réservation"
        title={eqRow.nom}
        action={<Link href="/reservation" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />

      <div className="px-[18px]">
        <Surface>
          <div className="text-[12px] text-ink-soft">{eqRow.capacite}</div>
          <div className="text-[12px] text-ink-muted mt-0.5">{eqRow.tarif}</div>
          {eqRow.description && (
            <div className="text-[13px] text-ink mt-2 leading-relaxed">{eqRow.description}</div>
          )}
        </Surface>
      </div>

      <Section title="Disponibilité (8 semaines)">
        <Surface>
          <div className="grid grid-cols-7 gap-1">
            {["L", "M", "M", "J", "V", "S", "D"].map((dow, i) => (
              <div key={i} className="text-center text-[10.5px] font-semibold text-ink-muted py-1">{dow}</div>
            ))}
            {Array.from({ length: ((days[0].d.getDay() + 6) % 7) }, () => null).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => (
              <div
                key={day.iso}
                className={[
                  "aspect-square rounded text-[11px] flex flex-col items-center justify-center border",
                  day.busy
                    ? "bg-danger/15 border-danger/30 text-danger"
                    : "bg-success/10 border-success/30 text-success",
                ].join(" ")}
                title={`${day.iso} — ${day.busy ? "indisponible" : "disponible"}`}
              >
                <span className="font-semibold">{day.d.getDate()}</span>
                <span className="text-[8px] uppercase opacity-70">
                  {FRENCH_MONTHS[day.d.getMonth()].replace(".", "")}
                </span>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-ink-muted mt-3 flex gap-3">
            <span className="flex items-center gap-1">
              <span aria-hidden className="w-2 h-2 rounded-pill bg-success" /> disponible
            </span>
            <span className="flex items-center gap-1">
              <span aria-hidden className="w-2 h-2 rounded-pill bg-danger" /> indisponible
            </span>
          </div>
        </Surface>
      </Section>

      <Section title="Demander une réservation">
        <ReserveForm equipementId={eqRow.id} />
        <div className="text-[11.5px] text-ink-muted">
          Validation par le référent municipal sous 5 jours ouvrés. Vous recevrez un email de
          confirmation, un rappel avant la date et une invitation à confirmer la restitution.
        </div>
      </Section>

      {reservations.length > 0 && (
        <Section title="Réservations en cours">
          {reservations.slice(0, 6).map((r) => {
            const c =
              r.statut === "valide"
                ? "#7a8c3a"
                : r.statut === "en-attente"
                  ? "#e8a838"
                  : r.statut === "refus"
                    ? "#a8332b"
                    : "#7a746c";
            return (
              <Surface key={r.id} padded={false} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink">{r.userName}</div>
                    <div className="text-[12px] text-ink-soft">{r.motif}</div>
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
              </Surface>
            );
          })}
        </Section>
      )}
    </ScreenShell>
  );
}
