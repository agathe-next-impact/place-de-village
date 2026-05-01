import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "./db/client";

const SESSION_COOKIE = "trizac_session";
const SESSION_TTL_DAYS = 30;
const MAGIC_TTL_MIN = 15;
const ROUNDS = 10;

/**
 * Auth maison — sessions opaques persistées en DB, cookie HttpOnly
 * SameSite=Lax. Cf. CdC §4 : en production, NextAuth.js + JWT WordPress
 * remplaceront cette couche.
 */

function newId(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: string, userAgent?: string) {
  const id = newId(48);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400 * 1000);
  await db.insert(schema.sessions)
    .values({ id, userId, expiresAt, userAgent: userAgent ?? null })
    ;
  const c = await cookies();
  c.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 86400,
  });
  return id;
}

export async function destroyCurrentSession() {
  const c = await cookies();
  const sid = c.get(SESSION_COOKIE)?.value;
  if (sid) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, sid));
  }
  c.delete(SESSION_COOKIE);
}

/**
 * Lit la session côté serveur. Renouvelle `lastSeenAt`. En production
 * (DEMO_MODE !== "true"), redirige vers `/auth/login` si pas de session
 * valide — le middleware filtre normalement déjà ces cas mais on
 * sécurise en double.
 *
 * En mode démo, fallback sur l'utilisateur `u1` (Camille) pour que la
 * navigation fonctionne sans login.
 */
export async function getCurrentUser() {
  const c = await cookies();
  const sid = c.get(SESSION_COOKIE)?.value;
  const demo = process.env.DEMO_MODE === "true";
  if (sid) {
    const sess = await db
      .select()
      .from(schema.sessions)
      .where(and(eq(schema.sessions.id, sid), gt(schema.sessions.expiresAt, new Date())))
      .then(r => r[0]);
    if (sess) {
      await db.update(schema.sessions)
        .set({ lastSeenAt: new Date() })
        .where(eq(schema.sessions.id, sid));
      const u = await db.select().from(schema.users).where(eq(schema.users.id, sess.userId)).then(r => r[0]);
      if (u) return u;
    } else {
      c.delete(SESSION_COOKIE);
    }
  }
  if (!demo) redirect("/auth/login");
  // Mode démo uniquement : profil par défaut.
  const fallback = await db.select().from(schema.users).where(eq(schema.users.id, "u1")).then(r => r[0]);
  if (fallback) return fallback;
  const any = await db.select().from(schema.users).limit(1).then(r => r[0]);
  if (any) return any;
  throw new Error("Aucun utilisateur en base — exécuter `npm run db:seed`.");
}

export async function getCurrentSession() {
  const c = await cookies();
  const sid = c.get(SESSION_COOKIE)?.value;
  if (!sid) return null;
  return await db.select().from(schema.sessions).where(eq(schema.sessions.id, sid)).then(r => r[0]) ?? null;
}

export async function isAuthenticated() {
  return (await getCurrentSession()) !== null;
}

/**
 * Bloque l'action si pas de session réelle. À utiliser au début des
 * server actions sensibles (création de signalement par exemple).
 *
 * En démo, on tolère par défaut (le RoleSwitcher pose un cookie de
 * session pour la démo). Cette fonction reste utile dès qu'on retire
 * le RoleSwitcher en production.
 */
export async function assertAuth() {
  const sess = await getCurrentSession();
  if (!sess) throw new Error("Vous devez être connecté·e pour effectuer cette action.");
  return sess;
}

// ─── Magic links ─────────────────────────────────────────────────────
export async function createMagicToken(email: string) {
  const token = newId(32);
  const expiresAt = new Date(Date.now() + MAGIC_TTL_MIN * 60 * 1000);
  await db.insert(schema.magicTokens).values({ token, email: email.toLowerCase(), expiresAt });
  return token;
}

/** Consomme un magic link (usage unique). Retourne l'utilisateur ou throw. */
export async function consumeMagicToken(token: string) {
  const row = await db.select().from(schema.magicTokens).where(eq(schema.magicTokens.token, token)).then(r => r[0]);
  if (!row) throw new Error("Lien invalide.");
  if (row.consumedAt) throw new Error("Lien déjà utilisé.");
  if (row.expiresAt < new Date()) throw new Error("Lien expiré.");
  await db.update(schema.magicTokens)
    .set({ consumedAt: new Date() })
    .where(eq(schema.magicTokens.token, token))
    ;
  let u = await db.select().from(schema.users).where(eq(schema.users.email, row.email)).then(r => r[0]);
  if (!u) {
    // Première connexion par lien : on crée le compte habitant à la volée
    const id = `u-${randomBytes(8).toString("hex")}`;
    await db.insert(schema.users)
      .values({ id, email: row.email, name: row.email.split("@")[0], role: "habitant", emailVerifiedAt: new Date() })
      ;
    u = await db.select().from(schema.users).where(eq(schema.users.id, id)).then(r => r[0])!;
  } else if (!u.emailVerifiedAt) {
    await db.update(schema.users)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(schema.users.id, u.id))
      ;
  }
  return u;
}
