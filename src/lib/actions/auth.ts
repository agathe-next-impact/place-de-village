"use server";

import { revalidatePath } from "next/cache";
import { setCurrentUser, clearCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db/client";
import { eq } from "drizzle-orm";

export async function switchUser(userId: string) {
  const u = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (!u) throw new Error("Utilisateur introuvable.");
  await setCurrentUser(userId);
  revalidatePath("/", "layout");
}

export async function logout() {
  await clearCurrentUser();
  revalidatePath("/", "layout");
}
