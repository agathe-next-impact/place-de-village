"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth";

const NewFlag = z.object({
  entityType: z.enum(["suggestion", "contribution", "entraide", "message", "petite_annonce"]),
  entityId: z.string(),
  reason: z.string().trim().min(5).max(400),
});

export async function flagContent(input: z.infer<typeof NewFlag>) {
  const data = NewFlag.parse(input);
  const u = await getCurrentUser();
  await db.insert(schema.moderationFlags)
    .values({
      entityType: data.entityType,
      entityId: data.entityId,
      reporterId: u.id,
      reason: data.reason,
    })
    ;
  await db.insert(schema.auditLog)
    .values({
      actorId: u.id,
      actorName: u.name,
      action: "flag",
      entityType: data.entityType,
      entityId: data.entityId,
      details: data.reason.slice(0, 80),
    })
    ;
  revalidatePath("/mairie", "layout");
}

export async function resolveFlag(flagId: number, status: "traite" | "ignore") {
  const u = await getCurrentUser();
  if (u.role !== "referent" && u.role !== "maire") {
    throw new Error("Réservé au référent municipal.");
  }
  await db.update(schema.moderationFlags)
    .set({ status, resolvedById: u.id, resolvedAt: new Date() })
    .where(eq(schema.moderationFlags.id, flagId))
    ;
  await db.insert(schema.auditLog)
    .values({
      actorId: u.id,
      actorName: u.name,
      action: `flag_${status}`,
      entityType: "moderation_flag",
      entityId: String(flagId),
    })
    ;
  revalidatePath("/mairie", "layout");
}
