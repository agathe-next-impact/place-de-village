import { describe, expect, it } from "vitest";

/**
 * Tests des invariants de configuration Sentry / log local.
 * Le module `@/lib/errors` dépend de `server-only` et de la DB,
 * donc on teste ici les contrats côté config et l'absence de fuites
 * de PII dans le shape attendu.
 */

describe("Sentry — règle env (DSN absent = pas d'appel réseau)", () => {
  function shouldInitSentry(env: NodeJS.ProcessEnv) {
    return !!env.SENTRY_DSN;
  }
  it("désactivé sans DSN", () => {
    expect(shouldInitSentry({} as never)).toBe(false);
  });
  it("activé avec DSN configuré", () => {
    expect(
      shouldInitSentry({
        SENTRY_DSN: "https://abc@sentry.example.fr/1",
      } as never),
    ).toBe(true);
  });
});

describe("Sentry — masquage PII dans beforeSend", () => {
  // Réplique la logique du beforeSend de sentry.server.config
  function beforeSend(event: { request?: { headers?: Record<string, string> } }) {
    if (event.request?.headers) {
      delete event.request.headers["cookie"];
      delete event.request.headers["authorization"];
    }
    return event;
  }
  it("supprime les en-têtes sensibles avant envoi", () => {
    const e = beforeSend({
      request: {
        headers: {
          cookie: "trizac_session=secret",
          authorization: "Bearer xxx",
          "user-agent": "Mozilla",
        },
      },
    });
    expect(e.request?.headers?.cookie).toBeUndefined();
    expect(e.request?.headers?.authorization).toBeUndefined();
    expect(e.request?.headers?.["user-agent"]).toBe("Mozilla");
  });
});

describe("Captage d'erreur — taille limitée pour éviter les abus", () => {
  function safeMessage(err: unknown) {
    return (err instanceof Error ? err.message : String(err)).slice(0, 1000);
  }
  it("tronque les messages très longs", () => {
    const big = "x".repeat(5000);
    expect(safeMessage(new Error(big))).toHaveLength(1000);
  });
  it("supporte les erreurs non-Error", () => {
    expect(safeMessage("string error")).toBe("string error");
    expect(safeMessage({ foo: 1 })).toBe("[object Object]");
  });
});
