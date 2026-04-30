"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/actions/notifications";

const NewEntraide = z.object({
  type: z.enum(["demande", "offre"]),
  titre: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(800),
  quartier: z.string().trim().min(1),
  date: z.string().trim().optional(),
});

const idAuthor = (n: string) => {
  const parts = n.split(" ");
  return parts[0] + " " + (parts[1]?.[0] ?? "") + ".";
};

export async function createEntraide(input: z.infer<typeof NewEntraide>) {
  const data = NewEntraide.parse(input);
  const u = await getCurrentUser();
  const id = `e-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  db.insert(schema.entraide)
    .values({
      id,
      type: data.type,
      titre: data.titre,
      description: data.description,
      quartier: data.quartier,
      date: data.date ?? null,
      auteurId: u.id,
      auteur: idAuthor(u.name),
    })
    .run();
  revalidatePath("/", "layout");
  return { id };
}

/** Ouvre (ou réutilise) une conversation pair-à-pair pour un item d'entraide. */
export async function openConversation(entraideId: string) {
  const u = await getCurrentUser();
  const e = db.select().from(schema.entraide).where(eq(schema.entraide.id, entraideId)).get();
  if (!e) throw new Error("Annonce d'entraide introuvable.");
  if (e.auteurId === u.id) throw new Error("Vous êtes l'auteur de cette annonce.");

  // canonique : aId = plus petit lex, bId = plus grand
  const aId = u.id < e.auteurId ? u.id : e.auteurId;
  const bId = u.id < e.auteurId ? e.auteurId : u.id;

  const existing = db
    .select()
    .from(schema.conversations)
    .where(
      and(
        eq(schema.conversations.entraideId, entraideId),
        eq(schema.conversations.aId, aId),
        eq(schema.conversations.bId, bId),
      ),
    )
    .get();
  if (existing) return { id: existing.id };

  const id = `c-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  db.insert(schema.conversations).values({ id, entraideId, aId, bId }).run();
  revalidatePath("/messages");
  return { id };
}

const NewMessage = z.object({
  conversationId: z.string(),
  body: z.string().trim().min(1).max(2000),
});

export async function sendMessage(input: z.infer<typeof NewMessage>) {
  const data = NewMessage.parse(input);
  const u = await getCurrentUser();
  const conv = db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.id, data.conversationId))
    .get();
  if (!conv) throw new Error("Conversation introuvable.");
  if (conv.aId !== u.id && conv.bId !== u.id) throw new Error("Accès refusé.");
  db.insert(schema.messages)
    .values({ conversationId: data.conversationId, authorId: u.id, body: data.body })
    .run();
  // Notification au destinataire
  const otherId = conv.aId === u.id ? conv.bId : conv.aId;
  await notify({
    userId: otherId,
    kind: "new_message",
    titre: `Nouveau message de ${u.name}`,
    body: data.body.slice(0, 80),
    href: `/messages/${data.conversationId}`,
    emailData: {
      kind: "new_message",
      fromName: u.name,
      preview: data.body.slice(0, 200),
      href: `/messages/${data.conversationId}`,
    },
  });
  revalidatePath(`/messages/${data.conversationId}`);
  revalidatePath("/messages");
}

export async function closeEntraide(entraideId: string) {
  const u = await getCurrentUser();
  const e = db.select().from(schema.entraide).where(eq(schema.entraide.id, entraideId)).get();
  if (!e) throw new Error("Introuvable");
  if (e.auteurId !== u.id) throw new Error("Seul l'auteur peut clôturer.");
  db.update(schema.entraide).set({ closed: true }).where(eq(schema.entraide.id, entraideId)).run();
  revalidatePath("/", "layout");
}

/** Conversations de l'utilisateur courant (les deux côtés). */
export async function listConversationsOfUser() {
  const u = await getCurrentUser();
  return db
    .select()
    .from(schema.conversations)
    .where(or(eq(schema.conversations.aId, u.id), eq(schema.conversations.bId, u.id)))
    .orderBy(asc(schema.conversations.createdAt))
    .all();
}
