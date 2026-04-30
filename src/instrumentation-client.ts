/**
 * Hook Next.js client — initialisation Sentry navigateur.
 * Cf. https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    // PII : on n'envoie jamais les cookies depuis le navigateur
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
