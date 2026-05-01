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
import { queueAndSendEmail, templates } from "@/lib/email";

const APP_URL = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";

// ─── Inscription ──────────────────────────────────────────────────────
const Register = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(120),
});

export async function registerUser(input: z.infer<typeof Register>) {
  const data = Register.parse(input);
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, data.email)).then(r => r[0]);
  if (existing) {
    throw new Error("Un compte existe déjà pour cette adresse email.");
  }
  const id = `u-${randomBytes(8).toString("hex")}`;
  const hash = await hashPassword(data.password);
  await db.insert(schema.users)
    .values({ id, email: data.email, name: data.name, role: "habitant", passwordHash: hash })
    ;
  const ua = (await headers()).get("user-agent") ?? null;
  await createSession(id, ua ?? undefined);
  // Email de bienvenue
  try {
    await queueAndSendEmail({
      to: data.email,
      toName: data.name,
      template: "welcome",
      rendered: templates.welcome({ name: data.name }),
    });
  } catch (err) {
    console.error("[email]", err);
  }
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
  const u = await db.select().from(schema.users).where(eq(schema.users.email, data.email)).then(r => r[0]);
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
 * Génère un magic link et l'envoie par email via SMTP. Si SMTP n'est
 * pas configuré, l'email est capturé en outbox local — l'UI affiche
 * alors également le lien direct pour faciliter la démo.
 */
export async function requestMagicLink(input: z.infer<typeof MagicEmail>) {
  const data = MagicEmail.parse(input);
  const token = await createMagicToken(data.email);
  const path = `/api/magic/${token}`;
  const fullUrl = `${APP_URL}${path}`;
  try {
    await queueAndSendEmail({
      to: data.email,
      template: "magic-link",
      rendered: templates.magicLink({ url: fullUrl, ttlMin: 15 }),
    });
  } catch (err) {
    console.error("[email]", err);
  }
  // En démo (pas de SMTP), on retourne aussi l'URL pour permettre la connexion immédiate.
  return { url: path, email: data.email, smtpConfigured: !!process.env.SMTP_HOST };
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
 * Switch instantané vers un autre utilisateur seedé. Bypass volontaire
 * de la vérification de mot de passe. Activé uniquement quand
 * `DEMO_MODE=true` — désactivé par défaut en production.
 */
export async function switchUser(userId: string) {
  if (process.env.DEMO_MODE !== "true") {
    throw new Error("Mode démo désactivé.");
  }
  const u = await db.select().from(schema.users).where(eq(schema.users.id, userId)).then(r => r[0]);
  if (!u) throw new Error("Utilisateur introuvable.");
  await destroyCurrentSession();
  const ua = (await headers()).get("user-agent") ?? null;
  await createSession(u.id, ua ?? undefined);
  revalidatePath("/", "layout");
}
