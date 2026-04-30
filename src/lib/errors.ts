import "server-only";
import * as Sentry from "@sentry/nextjs";
import { db, schema } from "@/lib/db/client";

/**
 * Capture une erreur côté serveur :
 *   1. Persiste dans error_log (toujours, pour visibilité immédiate
 *      depuis /mairie/errors).
 *   2. Envoie à Sentry si SENTRY_DSN est configuré (instance UE
 *      auto-hébergée recommandée).
 *
 * Les erreurs des Server Actions sont auto-instrumentées par
 * @sentry/nextjs, mais cette fonction permet d'enrichir explicitement
 * avec un contexte métier et de garder une trace locale même quand
 * Sentry n'est pas joignable.
 */
export function captureError(
  err: unknown,
  meta?: { context?: Record<string, unknown>; userId?: string; tags?: Record<string, string> },
) {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack ?? null : null;
  let sentryEventId: string | undefined;
  try {
    if (process.env.SENTRY_DSN) {
      sentryEventId = Sentry.captureException(err, {
        user: meta?.userId ? { id: meta.userId } : undefined,
        tags: meta?.tags,
        extra: meta?.context,
      });
    }
  } catch {
    /* on n'échoue jamais ici */
  }
  try {
    db.insert(schema.errorLog)
      .values({
        level: "error",
        message: message.slice(0, 1000),
        stack: stack?.slice(0, 4000) ?? null,
        context: meta?.context ? JSON.stringify(meta.context).slice(0, 2000) : null,
        runtime: process.env.NEXT_RUNTIME ?? "nodejs",
        sentryEventId: sentryEventId ?? null,
      })
      .run();
  } catch {
    // Si même la DB échoue (peu probable hors disque plein), on
    // accepte la perte plutôt que de bloquer l'application.
  }
  // En cas de log local seul, on print également pour les logs serveur
  if (!process.env.SENTRY_DSN) {
    console.error("[captureError]", message, meta?.context ?? "");
  }
}

export function captureMessage(message: string, meta?: { tags?: Record<string, string> }) {
  if (process.env.SENTRY_DSN) {
    try {
      Sentry.captureMessage(message, { tags: meta?.tags, level: "info" });
    } catch {
      /* ignore */
    }
  }
  try {
    db.insert(schema.errorLog)
      .values({
        level: "info",
        message: message.slice(0, 1000),
        runtime: process.env.NEXT_RUNTIME ?? "nodejs",
      })
      .run();
  } catch {
    /* ignore */
  }
}
