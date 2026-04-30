"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/actions/notifications";

const NewReservation = z.object({
  equipementId: z.string(),
  startIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  motif: z.string().trim().min(5).max(200),
});

function overlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart <= bEnd && bStart <= aEnd;
}

export async function createReservation(input: z.infer<typeof NewReservation>) {
  const data = NewReservation.parse(input);
  if (data.startIso > data.endIso) throw new Error("Plage de dates invalide.");
  const u = await getCurrentUser();

  // Vérification anti-conflit avec une réservation validée de la même période
  const existing = db
    .select()
    .from(schema.reservations)
    .where(
      and(
        eq(schema.reservations.equipementId, data.equipementId),
        ne(schema.reservations.statut, "refus"),
        ne(schema.reservations.statut, "annule"),
      ),
    )
    .all();
  const conflict = existing.find((r) => overlap(r.startIso, r.endIso, data.startIso, data.endIso));
  if (conflict) {
    throw new Error(
      `Indisponible sur cette plage : ${conflict.startIso} → ${conflict.endIso}.`,
    );
  }

  const id = `r-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  db.insert(schema.reservations)
    .values({
      id,
      equipementId: data.equipementId,
      userId: u.id,
      userName: u.name,
      startIso: data.startIso,
      endIso: data.endIso,
      motif: data.motif,
      statut: "en-attente",
    })
    .run();
  db.insert(schema.auditLog)
    .values({
      actorId: u.id,
      actorName: u.name,
      action: "create",
      entityType: "reservation",
      entityId: id,
      details: `${data.equipementId} · ${data.startIso}→${data.endIso}`,
    })
    .run();
  revalidatePath("/", "layout");
  return { id };
}

export async function updateReservationStatus(
  reservationId: string,
  next: "valide" | "refus" | "annule",
  refusMotif?: string,
) {
  const u = await getCurrentUser();
  if (next !== "annule" && u.role !== "referent" && u.role !== "agent" && u.role !== "maire") {
    throw new Error("Validation réservée au référent municipal.");
  }
  const r = db.select().from(schema.reservations).where(eq(schema.reservations.id, reservationId)).get();
  if (!r) throw new Error("Réservation introuvable.");
  db.update(schema.reservations)
    .set({ statut: next, refusMotif: refusMotif ?? null })
    .where(eq(schema.reservations.id, reservationId))
    .run();
  db.insert(schema.auditLog)
    .values({
      actorId: u.id,
      actorName: u.name,
      action: `reservation_${next}`,
      entityType: "reservation",
      entityId: reservationId,
      details: refusMotif ?? null,
    })
    .run();
  if (next !== "annule") {
    const equipement =
      db.select().from(schema.equipements).where(eq(schema.equipements.id, r.equipementId)).get()?.nom ??
      "équipement";
    await notify({
      userId: r.userId,
      kind: `reservation_${next}`,
      titre: next === "valide" ? "Réservation validée" : "Demande de réservation refusée",
      body: refusMotif ?? r.motif,
      href: "/reservation",
      emailData:
        next === "valide"
          ? { kind: "reservation_valide", equipement, href: "/reservation" }
          : { kind: "reservation_refus", equipement, motif: refusMotif ?? null, href: "/reservation" },
    });
  }
  revalidatePath("/", "layout");
}
