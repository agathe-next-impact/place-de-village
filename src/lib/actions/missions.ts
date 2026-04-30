"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/actions/notifications";
import { notifySms, smsTemplates } from "@/lib/sms";

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
  await db.insert(schema.missions).values({ id, ...data, refUserId: u.id });
  await db.insert(schema.auditLog)
    .values({ actorId: u.id, actorName: u.name, action: "create", entityType: "mission", entityId: id, details: data.titre.slice(0, 80) })
    ;
  revalidatePath("/", "layout");
  return { id };
}

export async function toggleRegistration(missionId: string) {
  const u = await getCurrentUser();
  const existing = await db
    .select()
    .from(schema.missionRegistrations)
    .where(
      and(
        eq(schema.missionRegistrations.userId, u.id),
        eq(schema.missionRegistrations.missionId, missionId),
      ),
    )
    .then(r => r[0]);
  if (existing) {
    await db.delete(schema.missionRegistrations)
      .where(
        and(
          eq(schema.missionRegistrations.userId, u.id),
          eq(schema.missionRegistrations.missionId, missionId),
        ),
      )
      ;
    revalidatePath("/", "layout");
    return { registered: false };
  }
  // Refus si la mission est complète
  const m = await db.select().from(schema.missions).where(eq(schema.missions.id, missionId)).then(r => r[0]);
  if (!m) throw new Error("Mission introuvable");
  const inscrits = Number(
    (
      await db
        .select({ c: sql<number>`count(*)::int` })
        .from(schema.missionRegistrations)
        .where(eq(schema.missionRegistrations.missionId, missionId))
    )[0]?.c ?? 0,
  );
  if (inscrits >= m.besoin) throw new Error("Mission complète.");
  await db.insert(schema.missionRegistrations).values({ userId: u.id, missionId });
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
  // Programmer le rappel SMS J-1 si l'utilisateur a consenti
  // et fourni un numéro de téléphone. Date parsée depuis la chaîne
  // FR (ex: "sam. 6 déc.") via un parseur best-effort. À défaut,
  // on schedule "maintenant + 1 j" pour la démo.
  const reminderDate = parseFrDate(m.date) ?? new Date(Date.now() + 24 * 3600 * 1000);
  reminderDate.setUTCHours(9, 0, 0, 0);
  reminderDate.setUTCDate(reminderDate.getUTCDate() - 1);
  await notifySms({
    userId: u.id,
    template: "mission-reminder",
    rendered: smsTemplates.missionReminder({
      titre: m.titre.slice(0, 60),
      lieu: m.lieu.slice(0, 30),
    }),
    relatedEntity: m.id,
    scheduledAt: reminderDate,
  });
  revalidatePath("/", "layout");
  return { registered: true };
}

const FR_MONTHS: Record<string, number> = {
  janv: 0, févr: 1, mars: 2, avr: 3, mai: 4, juin: 5,
  juil: 6, août: 7, sept: 8, oct: 9, nov: 10, déc: 11,
};

function parseFrDate(input: string): Date | null {
  // Très permissif : "sam. 6 déc.", "mer. 5 nov.", "23 nov.", etc.
  const cleaned = input.toLowerCase().replace(/\./g, " ").trim();
  const match = cleaned.match(/(\d{1,2})\s+([a-zéèêà]+)/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = FR_MONTHS[match[2].slice(0, 4)];
  if (month == null) return null;
  const year = new Date().getUTCFullYear();
  return new Date(Date.UTC(year, month, day));
}
