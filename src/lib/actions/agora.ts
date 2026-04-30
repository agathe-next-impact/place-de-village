"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/actions/notifications";
import { indexEntity } from "@/lib/search";

const idAuthor = (n: string) => {
  const parts = n.split(" ");
  return parts[0] + " " + (parts[1]?.[0] ?? "") + ".";
};

// ─── Suggestions / idées ──────────────────────────────────────────────
const NewIdea = z.object({
  titre: z.string().trim().min(10).max(280),
  cat: z.string().min(1),
});

export async function createSuggestion(input: z.infer<typeof NewIdea>) {
  const data = NewIdea.parse(input);
  const u = await getCurrentUser();
  const id = `idx-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  db.insert(schema.suggestions)
    .values({ id, titre: data.titre, cat: data.cat, auteurId: u.id, auteur: idAuthor(u.name) })
    .run();
  db.insert(schema.auditLog)
    .values({ actorId: u.id, actorName: u.name, action: "create", entityType: "suggestion", entityId: id, details: data.titre.slice(0, 80) })
    .run();
  indexEntity({
    entityType: "suggestion",
    entityId: id,
    href: `/idees/${id}`,
    title: data.titre,
    themes: data.cat,
  });
  revalidatePath("/", "layout");
  return { id };
}

export async function toggleSignal(suggestionId: string, type: "vis" | "important" | "contribuer") {
  const u = await getCurrentUser();
  const existing = db
    .select()
    .from(schema.signalEmissions)
    .where(
      and(
        eq(schema.signalEmissions.userId, u.id),
        eq(schema.signalEmissions.suggestionId, suggestionId),
        eq(schema.signalEmissions.type, type),
      ),
    )
    .get();
  if (existing) {
    db.delete(schema.signalEmissions)
      .where(
        and(
          eq(schema.signalEmissions.userId, u.id),
          eq(schema.signalEmissions.suggestionId, suggestionId),
          eq(schema.signalEmissions.type, type),
        ),
      )
      .run();
    revalidatePath("/", "layout");
    return { added: false };
  }
  db.insert(schema.signalEmissions).values({ userId: u.id, suggestionId, type }).run();
  revalidatePath("/", "layout");
  return { added: true };
}

// ─── Discussions ─────────────────────────────────────────────────────
const NewContribution = z.object({
  discussionId: z.string(),
  type: z.enum(["accord", "nuance", "objection", "question", "factuel"]),
  texte: z.string().trim().min(20).max(2000),
});

export async function addContribution(input: z.infer<typeof NewContribution>) {
  const data = NewContribution.parse(input);
  const u = await getCurrentUser();
  db.insert(schema.contributions)
    .values({
      discussionId: data.discussionId,
      type: data.type,
      texte: data.texte,
      auteurId: u.id,
      auteur: idAuthor(u.name),
    })
    .run();
  // Recalcul de la maturité : ≥ 15 contribs et au moins une objection traitée et synthèse
  const counts = db
    .select({ c: sql<number>`count(*)` })
    .from(schema.contributions)
    .where(eq(schema.contributions.discussionId, data.discussionId))
    .get();
  if ((counts?.c ?? 0) >= 15) {
    db.update(schema.discussions)
      .set({ mature: true })
      .where(eq(schema.discussions.id, data.discussionId))
      .run();
  }
  db.insert(schema.auditLog)
    .values({ actorId: u.id, actorName: u.name, action: "contribute", entityType: "discussion", entityId: data.discussionId, details: data.type })
    .run();
  revalidatePath("/", "layout");
  revalidatePath(`/discussions/${data.discussionId}`);
}

// ─── Propositions ────────────────────────────────────────────────────
const Promote = z.object({
  discussionId: z.string(),
  titre: z.string().trim().min(10).max(120),
  constat: z.string().trim().min(30),
  proposition: z.string().trim().min(30),
  justification: z.string().trim().min(30),
  vigilance: z.string().trim().min(10),
});

export async function promoteToProposition(input: z.infer<typeof Promote>) {
  const data = Promote.parse(input);
  const u = await getCurrentUser();
  // Vérification que la discussion est mature (séparation des rôles : qui
  // propose ne valide pas — on stocke en "instruction" jusqu'à validation)
  const disc = db
    .select()
    .from(schema.discussions)
    .where(eq(schema.discussions.id, data.discussionId))
    .get();
  if (!disc) throw new Error("Discussion introuvable");
  if (!disc.mature) throw new Error("La discussion n'est pas suffisamment mûre.");

  const id = `p-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  db.insert(schema.propositions)
    .values({
      id,
      titre: data.titre,
      constat: data.constat,
      proposition: data.proposition,
      justification: data.justification,
      vigilance: data.vigilance,
      discussionId: data.discussionId,
      seuil: 100,
      joursRestants: 21,
      statut: "instruction",
    })
    .run();
  db.insert(schema.auditLog)
    .values({
      actorId: u.id,
      actorName: u.name,
      action: "promote",
      entityType: "proposition",
      entityId: id,
      details: `Issue de discussion ${data.discussionId}`,
    })
    .run();
  indexEntity({
    entityType: "proposition",
    entityId: id,
    href: `/propositions/${id}`,
    title: data.titre,
    body: [data.constat, data.proposition, data.justification, data.vigilance].join("\n"),
  });
  revalidatePath("/", "layout");
  return { id };
}

export async function toggleSupport(propositionId: string) {
  const u = await getCurrentUser();
  const existing = db
    .select()
    .from(schema.supports)
    .where(and(eq(schema.supports.userId, u.id), eq(schema.supports.propositionId, propositionId)))
    .get();
  if (existing) {
    db.delete(schema.supports)
      .where(and(eq(schema.supports.userId, u.id), eq(schema.supports.propositionId, propositionId)))
      .run();
    revalidatePath("/", "layout");
    return { supported: false };
  }
  db.insert(schema.supports).values({ userId: u.id, propositionId }).run();
  // Recalcul du statut : passage en "reponse-mairie" si seuil atteint
  const p = db.select().from(schema.propositions).where(eq(schema.propositions.id, propositionId)).get();
  if (p) {
    const cnt = db
      .select({ c: sql<number>`count(*)` })
      .from(schema.supports)
      .where(eq(schema.supports.propositionId, propositionId))
      .get();
    if ((cnt?.c ?? 0) >= p.seuil && p.statut === "soutien") {
      db.update(schema.propositions)
        .set({ statut: "reponse-mairie", reponseDate: "sous 60 j", joursRestants: 0 })
        .where(eq(schema.propositions.id, propositionId))
        .run();
      // Alerte la mairie (tous les profils maire / référent)
      const officials = db
        .select()
        .from(schema.users)
        .where(sql`${schema.users.role} IN ('maire', 'referent')`)
        .all();
      const updated = db
        .select({ c: sql<number>`count(*)` })
        .from(schema.supports)
        .where(eq(schema.supports.propositionId, propositionId))
        .get()?.c ?? p.seuil;
      for (const o of officials) {
        await notify({
          userId: o.id,
          kind: "proposition_seuil",
          titre: "Proposition citoyenne : seuil atteint",
          body: `« ${p.titre} » — réponse formelle à publier sous 60 jours.`,
          href: `/propositions/${propositionId}`,
          emailData: {
            kind: "proposition_seuil",
            titre: p.titre,
            soutiens: updated,
            href: `/propositions/${propositionId}`,
          },
        });
      }
    }
  }
  revalidatePath("/", "layout");
  return { supported: true };
}

const NewSynthesis = z.object({
  discussionId: z.string(),
  texte: z.string().trim().min(80).max(4000),
});

/** Publier une synthèse de discussion. Réservé aux référents et à l'animation. */
export async function publishSynthesis(input: z.infer<typeof NewSynthesis>) {
  const data = NewSynthesis.parse(input);
  const u = await getCurrentUser();
  if (u.role === "habitant") {
    throw new Error("Seul·e un·e animateur·rice ou référent·e peut publier une synthèse.");
  }
  db.insert(schema.synthesises)
    .values({ discussionId: data.discussionId, texte: data.texte, authorId: u.id, authorName: u.name })
    .run();
  // Met à jour le marqueur de date de dernière synthèse sur la discussion
  const today = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(new Date());
  db.update(schema.discussions)
    .set({ derniereSynth: today })
    .where(eq(schema.discussions.id, data.discussionId))
    .run();
  db.insert(schema.auditLog)
    .values({ actorId: u.id, actorName: u.name, action: "publish_synthesis", entityType: "discussion", entityId: data.discussionId })
    .run();
  revalidatePath("/", "layout");
  revalidatePath(`/discussions/${data.discussionId}`);
}

/** Validation d'une proposition par référent municipal (passe en soutien). */
export async function validateProposition(propositionId: string) {
  const u = await getCurrentUser();
  if (u.role !== "referent" && u.role !== "maire")
    throw new Error("Action réservée au référent municipal.");
  db.update(schema.propositions)
    .set({ statut: "soutien" })
    .where(eq(schema.propositions.id, propositionId))
    .run();
  db.insert(schema.auditLog)
    .values({ actorId: u.id, actorName: u.name, action: "validate", entityType: "proposition", entityId: propositionId })
    .run();
  revalidatePath("/", "layout");
}
