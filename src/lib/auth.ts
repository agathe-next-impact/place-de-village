import "server-only";
import { cookies } from "next/headers";
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
  db.insert(schema.sessions)
    .values({ id, userId, expiresAt, userAgent: userAgent ?? null })
    .run();
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
    db.delete(schema.sessions).where(eq(schema.sessions.id, sid)).run();
  }
  c.delete(SESSION_COOKIE);
}

/**
 * Lit la session côté serveur. Renouvelle `lastSeenAt`. Retourne `null`
 * si pas de session valide. Pour les pages publiques, on tombe en démo
 * sur l'utilisateur `u1` afin que la navigation fonctionne sans login.
 */
export async function getCurrentUser() {
  const c = await cookies();
  const sid = c.get(SESSION_COOKIE)?.value;
  if (sid) {
    const sess = db
      .select()
      .from(schema.sessions)
      .where(and(eq(schema.sessions.id, sid), gt(schema.sessions.expiresAt, new Date())))
      .get();
    if (sess) {
      // sliding window — last seen
      db.update(schema.sessions)
        .set({ lastSeenAt: new Date() })
        .where(eq(schema.sessions.id, sid))
        .run();
      const u = db.select().from(schema.users).where(eq(schema.users.id, sess.userId)).get();
      if (u) return u;
    } else {
      // Cookie présent mais session invalide → clear
      c.delete(SESSION_COOKIE);
    }
  }
  // Démo : profil par défaut. À retirer en production.
  return db.select().from(schema.users).where(eq(schema.users.id, "u1")).get()!;
}

export async function getCurrentSession() {
  const c = await cookies();
  const sid = c.get(SESSION_COOKIE)?.value;
  if (!sid) return null;
  return db.select().from(schema.sessions).where(eq(schema.sessions.id, sid)).get() ?? null;
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
  db.insert(schema.magicTokens).values({ token, email: email.toLowerCase(), expiresAt }).run();
  return token;
}

/** Consomme un magic link (usage unique). Retourne l'utilisateur ou throw. */
export async function consumeMagicToken(token: string) {
  const row = db.select().from(schema.magicTokens).where(eq(schema.magicTokens.token, token)).get();
  if (!row) throw new Error("Lien invalide.");
  if (row.consumedAt) throw new Error("Lien déjà utilisé.");
  if (row.expiresAt < new Date()) throw new Error("Lien expiré.");
  db.update(schema.magicTokens)
    .set({ consumedAt: new Date() })
    .where(eq(schema.magicTokens.token, token))
    .run();
  let u = db.select().from(schema.users).where(eq(schema.users.email, row.email)).get();
  if (!u) {
    // Première connexion par lien : on crée le compte habitant à la volée
    const id = `u-${randomBytes(8).toString("hex")}`;
    db.insert(schema.users)
      .values({ id, email: row.email, name: row.email.split("@")[0], role: "habitant", emailVerifiedAt: new Date() })
      .run();
    u = db.select().from(schema.users).where(eq(schema.users.id, id)).get()!;
  } else if (!u.emailVerifiedAt) {
    db.update(schema.users)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(schema.users.id, u.id))
      .run();
  }
  return u;
}
