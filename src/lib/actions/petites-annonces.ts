"use server";

import { revalidatePath } from "next/cache";
import { eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth";
import { indexEntity, removeFromIndex } from "@/lib/search";

const idAuthor = (n: string) => {
  const parts = n.split(" ");
  return parts[0] + " " + (parts[1]?.[0] ?? "") + ".";
};

const New = z.object({
  type: z.enum(["don", "pret", "echange", "vente"]),
  cat: z.string().min(1),
  titre: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(1000),
  prix: z.string().trim().max(40).optional(),
});

export async function createPetiteAnnonce(input: z.infer<typeof New>) {
  const data = New.parse(input);
  const u = await getCurrentUser();
  const id = `pa-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  db.insert(schema.petitesAnnonces)
    .values({
      id,
      type: data.type,
      cat: data.cat,
      titre: data.titre,
      description: data.description,
      prix: data.prix ?? null,
      auteurId: u.id,
      auteur: idAuthor(u.name),
      expiresAt,
    })
    .run();
  indexEntity({
    entityType: "petite_annonce",
    entityId: id,
    href: "/petites-annonces",
    title: data.titre,
    body: data.description,
    themes: data.cat,
  });
  revalidatePath("/petites-annonces");
  revalidatePath("/", "layout");
  return { id };
}

export async function closePetiteAnnonce(id: string) {
  const u = await getCurrentUser();
  const a = db.select().from(schema.petitesAnnonces).where(eq(schema.petitesAnnonces.id, id)).get();
  if (!a) throw new Error("Introuvable");
  if (a.auteurId !== u.id) throw new Error("Seul l'auteur peut clôturer.");
  db.update(schema.petitesAnnonces).set({ closed: true }).where(eq(schema.petitesAnnonces.id, id)).run();
  removeFromIndex("petite_annonce", id);
  revalidatePath("/petites-annonces");
}

export async function activePetitesAnnonces() {
  const now = new Date();
  return db
    .select()
    .from(schema.petitesAnnonces)
    .where(gt(schema.petitesAnnonces.expiresAt, now))
    .all()
    .filter((a) => !a.closed);
}
