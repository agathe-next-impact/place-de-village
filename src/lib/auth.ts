import { cookies } from "next/headers";
import { db, schema } from "./db/client";
import { eq } from "drizzle-orm";

const COOKIE = "trizac_user";

/**
 * Auth de démo. En production : NextAuth.js + JWT WordPress, cookie HttpOnly
 * SameSite=Lax, refresh token côté serveur (cf. CdC §4 + README "State
 * management"). Ici, on stocke seulement l'id utilisateur dans un cookie
 * HttpOnly pour faire fonctionner les Server Actions.
 */

export async function getCurrentUser() {
  const c = await cookies();
  const id = c.get(COOKIE)?.value ?? "u1";
  const u = db.select().from(schema.users).where(eq(schema.users.id, id)).get();
  if (u) return u;
  // fallback : utilisateur principal du seed
  return db.select().from(schema.users).where(eq(schema.users.id, "u1")).get()!;
}

export async function setCurrentUser(id: string) {
  const c = await cookies();
  c.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCurrentUser() {
  const c = await cookies();
  c.delete(COOKIE);
}
