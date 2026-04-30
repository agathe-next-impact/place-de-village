"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { db, schema } from "@/lib/db/client";
import {
  consumeMagicToken,
  createMagicToken,
  createSession,
  destroyCurrentSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

// ─── Inscription ──────────────────────────────────────────────────────
const Register = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(120),
});

export async function registerUser(input: z.infer<typeof Register>) {
  const data = Register.parse(input);
  const existing = db.select().from(schema.users).where(eq(schema.users.email, data.email)).get();
  if (existing) {
    throw new Error("Un compte existe déjà pour cette adresse email.");
  }
  const id = `u-${randomBytes(8).toString("hex")}`;
  const hash = await hashPassword(data.password);
  db.insert(schema.users)
    .values({ id, email: data.email, name: data.name, role: "habitant", passwordHash: hash })
    .run();
  const ua = (await headers()).get("user-agent") ?? null;
  await createSession(id, ua ?? undefined);
  revalidatePath("/", "layout");
  return { id, email: data.email };
}

// ─── Connexion classique ──────────────────────────────────────────────
const Login = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function loginUser(input: z.infer<typeof Login>) {
  const data = Login.parse(input);
  const u = db.select().from(schema.users).where(eq(schema.users.email, data.email)).get();
  // Refus volontairement neutre pour ne pas révéler si l'email existe
  const generic = "Identifiants invalides.";
  if (!u || !u.passwordHash) throw new Error(generic);
  const ok = await verifyPassword(data.password, u.passwordHash);
  if (!ok) throw new Error(generic);
  const ua = (await headers()).get("user-agent") ?? null;
  await createSession(u.id, ua ?? undefined);
  revalidatePath("/", "layout");
  return { id: u.id };
}

// ─── Magic link ───────────────────────────────────────────────────────
const MagicEmail = z.object({ email: z.string().trim().toLowerCase().email() });

/**
 * Génère un magic link. En production, envoyé par email via Brevo /
 * Listmonk auto-hébergé. En démo : on retourne le lien complet pour
 * que l'UI puisse l'afficher.
 */
export async function requestMagicLink(input: z.infer<typeof MagicEmail>) {
  const data = MagicEmail.parse(input);
  const token = await createMagicToken(data.email);
  const url = `/api/magic/${token}`;
  return { url, email: data.email };
}

export async function consumeMagicLink(token: string) {
  const u = await consumeMagicToken(token);
  const ua = (await headers()).get("user-agent") ?? null;
  await createSession(u.id, ua ?? undefined);
  revalidatePath("/", "layout");
  return u;
}

// ─── Déconnexion ──────────────────────────────────────────────────────
export async function logout() {
  await destroyCurrentSession();
  revalidatePath("/", "layout");
}

// ─── Démo : changer de profil ─────────────────────────────────────────
/**
 * Switch instantané vers un autre utilisateur seedé. Pour la démo
 * uniquement — bypass volontaire de la vérification de mot de passe.
 * À supprimer en production ou conditionner à NODE_ENV === 'development'.
 */
export async function switchUser(userId: string) {
  const u = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (!u) throw new Error("Utilisateur introuvable.");
  await destroyCurrentSession();
  const ua = (await headers()).get("user-agent") ?? null;
  await createSession(u.id, ua ?? undefined);
  revalidatePath("/", "layout");
}
