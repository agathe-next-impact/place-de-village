import "server-only";
import { eq, lte } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { getProvider } from "./transport";
import { hasConsent } from "@/lib/consents";
import type { SmsTemplate } from "./templates";

export { smsTemplates } from "./templates";
export { listOutbox, isRealProviderConfigured } from "./transport";

type QueueArgs = {
  to: string;
  template: string;
  rendered: SmsTemplate;
  relatedEntity?: string;
  scheduledAt?: Date;
};

/** Programme un SMS (envoi immédiat ou différé). */
export async function queueSms(args: QueueArgs) {
  const inserted = db
    .insert(schema.smsQueue)
    .values({
      toPhone: args.to,
      body: args.rendered.body,
      template: args.template,
      relatedEntity: args.relatedEntity ?? null,
      scheduledAt: args.scheduledAt ?? new Date(),
    })
    .returning()
    .get();
  // Si l'envoi est immédiat ou passé, on dispatche tout de suite
  if (!args.scheduledAt || args.scheduledAt <= new Date()) {
    await dispatchSms(inserted.id);
  }
  return inserted;
}

export async function dispatchSms(id: number) {
  const row = db.select().from(schema.smsQueue).where(eq(schema.smsQueue.id, id)).get();
  if (!row || row.status !== "pending") return;
  try {
    const provider = getProvider();
    await provider.send({ to: row.toPhone, body: row.body, queueId: id });
    db.update(schema.smsQueue)
      .set({
        status: provider.name === "outbox" ? "captured" : "sent",
        sentAt: new Date(),
        attempts: row.attempts + 1,
      })
      .where(eq(schema.smsQueue.id, id))
      .run();
  } catch (err) {
    db.update(schema.smsQueue)
      .set({
        status: row.attempts + 1 >= 5 ? "failed" : "pending",
        attempts: row.attempts + 1,
        lastError: err instanceof Error ? err.message : String(err),
      })
      .where(eq(schema.smsQueue.id, id))
      .run();
    const { captureError } = await import("@/lib/errors");
    captureError(err, {
      context: { smsId: id, template: row.template, attempts: row.attempts + 1 },
      tags: { module: "sms", template: row.template },
    });
  }
}

/**
 * Consomme tous les SMS pending dont scheduled_at est passé.
 * Appelé par /api/cron/sms (par un cron infra : Scaleway Serverless,
 * Cron-job.org auto-hébergé, systemd timer…).
 */
export async function dispatchPendingSms() {
  const now = new Date();
  const pending = db
    .select()
    .from(schema.smsQueue)
    .where(eq(schema.smsQueue.status, "pending"))
    .all()
    .filter((r) => r.scheduledAt <= now);
  for (const r of pending) await dispatchSms(r.id);
  return { dispatched: pending.length };
}

/**
 * Envoie un SMS à un utilisateur si consentement `sms` accordé et
 * numéro de téléphone connu. Retourne `false` si l'utilisateur ne
 * peut pas recevoir.
 */
export async function notifySms(args: {
  userId: string;
  template: string;
  rendered: SmsTemplate;
  relatedEntity?: string;
  scheduledAt?: Date;
}) {
  const u = db.select().from(schema.users).where(eq(schema.users.id, args.userId)).get();
  if (!u) return false;
  if (!u.phone) return false;
  const granted = await hasConsent(u.id, "sms", false);
  if (!granted) return false;
  await queueSms({
    to: u.phone,
    template: args.template,
    rendered: args.rendered,
    relatedEntity: args.relatedEntity,
    scheduledAt: args.scheduledAt,
  });
  return true;
}
