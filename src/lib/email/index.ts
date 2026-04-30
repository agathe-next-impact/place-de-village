import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { captureToOutbox, DEFAULT_FROM, getMailer, isSmtpConfigured } from "./transport";
import { templates, type TemplateOutput } from "./templates";
import { hasConsent } from "@/lib/consents";

export { templates };

type QueueArgs = {
  to: string;
  toName?: string;
  template: string;
  rendered: TemplateOutput;
  relatedEntity?: string;
};

/**
 * Pousse un email dans la queue persistée. Tente immédiatement de le
 * délivrer (SMTP réel) ou de le capturer en outbox local (mode démo).
 *
 * Côté production, cette fonction se contenterait d'écrire en queue,
 * un cron / worker se chargeant du dispatch et du retry. Pour la démo,
 * on effectue les deux opérations en synchrone.
 */
export async function queueAndSendEmail(args: QueueArgs) {
  const inserted = db
    .insert(schema.emailQueue)
    .values({
      toAddress: args.to,
      toName: args.toName ?? null,
      subject: args.rendered.subject,
      text: args.rendered.text,
      html: args.rendered.html ?? null,
      template: args.template,
      relatedEntity: args.relatedEntity ?? null,
    })
    .returning()
    .get();

  await dispatchEmail(inserted.id);
  return inserted;
}

export async function dispatchEmail(id: number) {
  const row = db.select().from(schema.emailQueue).where(eq(schema.emailQueue.id, id)).get();
  if (!row || row.status !== "pending") return;
  try {
    if (isSmtpConfigured()) {
      const mailer = getMailer();
      await mailer.sendMail({
        from: DEFAULT_FROM,
        to: row.toName ? `${row.toName} <${row.toAddress}>` : row.toAddress,
        subject: row.subject,
        text: row.text,
        html: row.html ?? undefined,
      });
      db.update(schema.emailQueue)
        .set({ status: "sent", sentAt: new Date(), attempts: row.attempts + 1 })
        .where(eq(schema.emailQueue.id, id))
        .run();
    } else {
      await captureToOutbox({
        id,
        to: row.toAddress,
        subject: row.subject,
        text: row.text,
        html: row.html,
      });
      db.update(schema.emailQueue)
        .set({ status: "captured", sentAt: new Date(), attempts: row.attempts + 1 })
        .where(eq(schema.emailQueue.id, id))
        .run();
    }
  } catch (err) {
    db.update(schema.emailQueue)
      .set({
        status: row.attempts + 1 >= 5 ? "failed" : "pending",
        attempts: row.attempts + 1,
        lastError: err instanceof Error ? err.message : String(err),
      })
      .where(eq(schema.emailQueue.id, id))
      .run();
    const { captureError } = await import("@/lib/errors");
    captureError(err, {
      context: { emailId: id, template: row.template, attempts: row.attempts + 1 },
      tags: { module: "email", template: row.template },
    });
  }
}

/**
 * Envoie un email transactionnel à un utilisateur si son consentement
 * `transac_email` est accordé. La règle par défaut est : transactionnel
 * = activé sauf opposition explicite (cf. CdC §3.2 finalités).
 */
export async function notifyEmail(args: {
  userId: string;
  template: string;
  rendered: TemplateOutput;
  relatedEntity?: string;
}) {
  const u = db.select().from(schema.users).where(eq(schema.users.id, args.userId)).get();
  if (!u) return;
  const granted = await hasConsent(u.id, "transac_email", true);
  if (!granted) return;
  await queueAndSendEmail({
    to: u.email,
    toName: u.name,
    template: args.template,
    rendered: args.rendered,
    relatedEntity: args.relatedEntity,
  });
}
