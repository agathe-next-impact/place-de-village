import * as Sentry from "@sentry/nextjs";

/**
 * Configuration Sentry — runtime serveur (Server Components, Server
 * Actions, route handlers).
 *
 * No-op tant que SENTRY_DSN n'est pas défini. La capture d'erreurs
 * tombe alors sur le log local (cf. src/lib/errors.ts).
 *
 * Compatible avec :
 *   - Sentry self-hosted (Docker Compose ou Kubernetes, getsentry/onpremise)
 *   - GlitchTip (alternative légère 100% open-source, self-hosted)
 *   - Sentry SaaS (option commerciale)
 *
 * Le DSN porte le serveur cible : `https://<key>@<host>/<project>`.
 */

const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    release: process.env.SENTRY_RELEASE,
    // Souveraineté : aucune donnée n'est envoyée hors de l'instance
    // configurée. Le DSN doit pointer vers une instance UE.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    // Masquage systématique des en-têtes sensibles
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers["cookie"];
        delete event.request.headers["authorization"];
      }
      return event;
    },
  });
}
