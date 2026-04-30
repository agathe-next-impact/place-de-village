import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema } from "./db/client";

export type Finality = "contributions" | "digest" | "geoloc" | "sms" | "transac_email";

/**
 * Lit le consentement d'un utilisateur pour une finalité. Si aucune
 * entrée n'existe en DB, renvoie `defaultValue` (par défaut : false).
 *
 * Pour les emails transactionnels (changement d'état signalement,
 * confirmation d'inscription mission, etc.), le défaut est `true` :
 * conforme au RGPD car ils relèvent de la mission d'intérêt public
 * du service municipal et sont indispensables à son fonctionnement.
 */
export async function hasConsent(userId: string, finality: Finality, defaultValue = false) {
  const row = await db
    .select()
    .from(schema.consents)
    .where(and(eq(schema.consents.userId, userId), eq(schema.consents.finality, finality)))
    .then(r => r[0]);
  if (!row) return defaultValue;
  return Boolean(row.granted);
}

export async function setConsent(userId: string, finality: Finality, granted: boolean) {
  const existing = await db
    .select()
    .from(schema.consents)
    .where(and(eq(schema.consents.userId, userId), eq(schema.consents.finality, finality)))
    .then(r => r[0]);
  if (existing) {
    await db.update(schema.consents)
      .set({ granted, updatedAt: new Date() })
      .where(and(eq(schema.consents.userId, userId), eq(schema.consents.finality, finality)))
      ;
  } else {
    await db.insert(schema.consents).values({ userId, finality, granted, updatedAt: new Date() });
  }
}

export async function listConsents(userId: string) {
  return await db.select().from(schema.consents).where(eq(schema.consents.userId, userId));
}
