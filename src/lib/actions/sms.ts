"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { dispatchPendingSms } from "@/lib/sms";
import { getCurrentUser } from "@/lib/auth";
import { setConsent } from "@/lib/consents";

export async function dispatchPendingNow() {
  const u = await getCurrentUser();
  if (u.role !== "referent" && u.role !== "agent" && u.role !== "maire") {
    throw new Error("Réservé à un référent municipal.");
  }
  const r = await dispatchPendingSms();
  revalidatePath("/mairie/sms");
  return r;
}

const PhoneUpdate = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 .-]{6,20}$/, "Format de téléphone invalide.")
    .or(z.literal("")),
  smsConsent: z.boolean().optional(),
});

/**
 * Met à jour le téléphone et le consentement SMS de l'utilisateur
 * courant. Les coordonnées personnelles ne sont jamais exposées dans
 * l'UI publique (cf. CdC §3.2).
 */
export async function updatePhoneAndConsent(input: z.infer<typeof PhoneUpdate>) {
  const data = PhoneUpdate.parse(input);
  const u = await getCurrentUser();
  const normalised = data.phone
    ? data.phone.replace(/[ .-]/g, "").replace(/^0/, "+33")
    : null;
  db.update(schema.users)
    .set({ phone: normalised })
    .where(eq(schema.users.id, u.id))
    .run();
  if (data.smsConsent != null) {
    await setConsent(u.id, "sms", data.smsConsent);
  }
  revalidatePath("/mes-donnees");
}
