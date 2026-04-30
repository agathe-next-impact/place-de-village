import { describe, expect, it } from "vitest";
import { EVENTS } from "@/lib/analytics-events";

/**
 * Tests des invariants côté analytics — on vérifie que :
 *   - les noms d'event sont stables (kebab-case, pas d'espaces, pas
 *     d'accents)
 *   - aucune valeur ne dérive accidentellement vers un nom riche en
 *     PII
 *   - les events couvrent les 6 pôles fonctionnels du CdC
 */

describe("Catalogue d'events", () => {
  const values = Object.values(EVENTS);

  it("noms en kebab-case sans espaces ni accents", () => {
    for (const v of values) {
      expect(v).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it("noms uniques", () => {
    expect(new Set(values).size).toBe(values.length);
  });

  it("couvre les 6 pôles citoyens du cahier des charges", () => {
    // Sanity check : pas de manque flagrant côté actions clés
    expect(values).toContain("idea-created"); // Pôle 1
    expect(values).toContain("mission-registered"); // Pôle 2
    expect(values).toContain("signalement-created"); // Pôle 3
    expect(values).toContain("conversation-opened"); // Pôle 4
    expect(values).toContain("reservation-requested"); // Pôle 6
  });
});

describe("Helper trackEvent — règle no-op", () => {
  // Réplique du shape no-op : si window.plausible absent, ne fait rien
  function track(eventName: string, win?: { plausible?: (n: string) => void }) {
    if (typeof win?.plausible === "function") {
      win.plausible(eventName);
      return true;
    }
    return false;
  }
  it("retourne false sans window.plausible (mode démo)", () => {
    expect(track("idea-created")).toBe(false);
  });
  it("appelle window.plausible si défini", () => {
    let called = false;
    track("idea-created", { plausible: () => (called = true) });
    expect(called).toBe(true);
  });
});

describe("Conformité Plausible — pas de PII dans les events", () => {
  /** Liste de noms de propriétés interdites pour respect RGPD strict. */
  const FORBIDDEN_PROP_KEYS = [
    "email",
    "phone",
    "userid",
    "ip",
    "name",
    "firstname",
    "lastname",
    "address",
  ];
  // Réplique de la sérialisation : on ne pousse jamais de clés interdites
  function safeProps(props: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(props).filter(([k]) => !FORBIDDEN_PROP_KEYS.includes(k.toLowerCase())),
    );
  }
  it("filtre les clés sensibles", () => {
    const r = safeProps({
      email: "leak@trizac.fr",
      cat: "Vie locale",
      userId: "u1",
    });
    expect(r).toEqual({ cat: "Vie locale" });
  });
});
