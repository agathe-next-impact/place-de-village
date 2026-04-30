"use server";

import { revalidatePath } from "next/cache";
import { and, eq, like } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/actions/notifications";

const NewSignalement = z.object({
  type: z.string().min(1),
  titre: z.string().trim().min(5).max(120),
  description: z.string().trim().max(500).optional(),
  loc: z.string().trim().min(2),
  icon: z.string().min(1),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

const idAuthor = (n: string) => {
  const parts = n.split(" ");
  return parts[0] + " " + (parts[1]?.[0] ?? "") + ".";
};

/**
 * Crée un signalement et déclenche la détection de doublons : si un
 * signalement non résolu existe avec le même type et un libellé proche
 * (lieu équivalent), on retourne `duplicates` pour que l'UI propose un
 * rattachement (cf. CdC §2.1 Pôle 3).
 */
export async function createSignalement(input: z.infer<typeof NewSignalement>) {
  const data = NewSignalement.parse(input);
  const u = await getCurrentUser();

  // Détection de doublons proches : même type + lieu commun
  const candidates = db
    .select()
    .from(schema.signalements)
    .where(
      and(
        eq(schema.signalements.type, data.type),
        like(schema.signalements.loc, `%${data.loc.split(",")[0].trim().slice(0, 12)}%`),
      ),
    )
    .all()
    .filter((s) => s.etat !== "resolu");

  const id = `s-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  db.insert(schema.signalements)
    .values({
      id,
      type: data.type,
      titre: data.titre,
      description: data.description,
      auteurId: u.id,
      auteur: idAuthor(u.name),
      etat: "signale",
      loc: data.loc,
      lat: data.lat,
      lng: data.lng,
      icon: data.icon,
    })
    .run();
  db.insert(schema.signalementHistory)
    .values({ signalementId: id, etat: "signale" })
    .run();
  db.insert(schema.auditLog)
    .values({
      actorId: u.id,
      actorName: u.name,
      action: "create",
      entityType: "signalement",
      entityId: id,
      details: `${data.type} · ${data.loc}`,
    })
    .run();

  revalidatePath("/", "layout");
  return { id, duplicates: candidates };
}

const StateUpdate = z.object({
  signalementId: z.string(),
  etat: z.enum(["pris-en-compte", "en-cours", "resolu"]),
  comment: z.string().trim().max(300).optional(),
});

export async function updateSignalementState(input: z.infer<typeof StateUpdate>) {
  const data = StateUpdate.parse(input);
  const u = await getCurrentUser();
  if (u.role !== "agent" && u.role !== "referent" && u.role !== "maire") {
    throw new Error("Action réservée aux agents municipaux.");
  }
  const sig = db
    .select()
    .from(schema.signalements)
    .where(eq(schema.signalements.id, data.signalementId))
    .get();
  if (!sig) throw new Error("Signalement introuvable.");
  db.update(schema.signalements)
    .set({ etat: data.etat })
    .where(eq(schema.signalements.id, data.signalementId))
    .run();
  db.insert(schema.signalementHistory)
    .values({ signalementId: data.signalementId, etat: data.etat, agentId: u.id, comment: data.comment })
    .run();
  db.insert(schema.auditLog)
    .values({
      actorId: u.id,
      actorName: u.name,
      action: "update_state",
      entityType: "signalement",
      entityId: data.signalementId,
      details: `→ ${data.etat}${data.comment ? ` — ${data.comment}` : ""}`,
    })
    .run();
  // Notification au signalant (CdC §2.1 Pôle 3 : notification à chaque
  // changement d'état).
  const labels: Record<string, string> = {
    "pris-en-compte": "pris en compte",
    "en-cours": "en cours de traitement",
    resolu: "résolu",
  };
  await notify({
    userId: sig.auteurId,
    kind: "signalement_state",
    titre: `Votre signalement est ${labels[data.etat] ?? data.etat}`,
    body: data.comment ?? sig.titre,
    href: `/signalements/${sig.id}`,
    emailData: {
      kind: "signalement_state",
      titre: sig.titre,
      etatLabel: labels[data.etat] ?? data.etat,
      comment: data.comment ?? null,
      href: `/signalements/${sig.id}`,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath(`/signalements/${data.signalementId}`);
}
