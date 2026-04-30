"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/actions/notifications";

const NewMission = z.object({
  titre: z.string().trim().min(5).max(120),
  cat: z.string().min(1),
  description: z.string().trim().max(800).optional(),
  date: z.string().trim().min(1),
  duree: z.string().trim().min(1),
  lieu: z.string().trim().min(1),
  besoin: z.coerce.number().int().min(1).max(99),
  ref: z.string().trim().min(1),
});

export async function createMission(input: z.infer<typeof NewMission>) {
  const data = NewMission.parse(input);
  const u = await getCurrentUser();
  if (u.role !== "referent" && u.role !== "agent" && u.role !== "maire") {
    throw new Error("Réservé aux référents associatifs ou aux agents municipaux.");
  }
  const id = `m-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  db.insert(schema.missions).values({ id, ...data, refUserId: u.id }).run();
  db.insert(schema.auditLog)
    .values({ actorId: u.id, actorName: u.name, action: "create", entityType: "mission", entityId: id, details: data.titre.slice(0, 80) })
    .run();
  revalidatePath("/", "layout");
  return { id };
}

export async function toggleRegistration(missionId: string) {
  const u = await getCurrentUser();
  const existing = db
    .select()
    .from(schema.missionRegistrations)
    .where(
      and(
        eq(schema.missionRegistrations.userId, u.id),
        eq(schema.missionRegistrations.missionId, missionId),
      ),
    )
    .get();
  if (existing) {
    db.delete(schema.missionRegistrations)
      .where(
        and(
          eq(schema.missionRegistrations.userId, u.id),
          eq(schema.missionRegistrations.missionId, missionId),
        ),
      )
      .run();
    revalidatePath("/", "layout");
    return { registered: false };
  }
  // Refus si la mission est complète
  const m = db.select().from(schema.missions).where(eq(schema.missions.id, missionId)).get();
  if (!m) throw new Error("Mission introuvable");
  const inscrits = db
    .select({ c: sql<number>`count(*)` })
    .from(schema.missionRegistrations)
    .where(eq(schema.missionRegistrations.missionId, missionId))
    .get()?.c ?? 0;
  if (inscrits >= m.besoin) throw new Error("Mission complète.");
  db.insert(schema.missionRegistrations).values({ userId: u.id, missionId }).run();
  // Confirmation immédiate
  await notify({
    userId: u.id,
    kind: "mission_inscription",
    titre: "Inscription confirmée",
    body: `${m.titre} — ${m.date} · ${m.lieu}. Rappel J-1 par email.`,
    href: `/missions/${m.id}`,
    emailData: {
      kind: "mission_inscription",
      titre: m.titre,
      date: m.date,
      lieu: m.lieu,
      href: `/missions/${m.id}`,
    },
  });
  // Notifier le référent si renseigné
  if (m.refUserId && m.refUserId !== u.id) {
    await notify({
      userId: m.refUserId,
      kind: "mission_new_registration",
      titre: "Nouvelle inscription bénévole",
      body: `${u.name} sur « ${m.titre} »`,
      href: `/missions/${m.id}`,
    });
  }
  revalidatePath("/", "layout");
  return { registered: true };
}
