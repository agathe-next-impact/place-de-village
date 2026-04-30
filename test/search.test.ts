import { describe, expect, it } from "vitest";
import { safeFtsQuery } from "@/lib/search";

/**
 * Avec Postgres `websearch_to_tsquery`, on n'a plus besoin d'échapper
 * les opérateurs côté application — la fonction Postgres gère le
 * langage utilisateur (espaces = AND, OR explicite, "-mot" pour
 * exclure, "phrase" entre guillemets).
 *
 * `safeFtsQuery` se contente d'une normalisation Unicode et d'un trim.
 */

describe("safeFtsQuery — normalisation simple", () => {
  it("normalise NFC pour stabilité (caractère composé vs décomposé)", () => {
    const composed = "café";
    const decomposed = "café"; // 'e' + combining acute accent
    expect(safeFtsQuery(composed)).toBe(safeFtsQuery(decomposed));
  });

  it("trim les espaces périphériques", () => {
    expect(safeFtsQuery("  marché producteurs  ")).toBe("marché producteurs");
  });

  it("renvoie une chaîne vide pour une entrée vide ou whitespace", () => {
    expect(safeFtsQuery("")).toBe("");
    expect(safeFtsQuery("   ")).toBe("");
  });

  it("conserve les apostrophes et tirets (mots composés français)", () => {
    expect(safeFtsQuery("aujourd'hui")).toBe("aujourd'hui");
    expect(safeFtsQuery("nid-de-poule")).toBe("nid-de-poule");
  });
});
