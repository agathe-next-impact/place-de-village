import { describe, expect, it } from "vitest";
import { safeFtsQuery } from "@/lib/search";

describe("safeFtsQuery — neutralise les opérateurs FTS5 et reste utilisable", () => {
  it("encadre les tokens et ajoute préfixe sur le dernier", () => {
    expect(safeFtsQuery("marché producteurs")).toBe('"marché" "producteurs"*');
  });

  it("ignore les tokens trop courts", () => {
    expect(safeFtsQuery("a marché à b")).toBe('"marché"*');
  });

  it("neutralise les opérateurs FTS5 en encadrant chaque token de guillemets", () => {
    // Sans encadrage, l'utilisateur pourrait forger une requête FTS5
    // (NEAR, OR, AND, NOT, ^, *, parenthèses). Encadrés par des
    // guillemets, ces mots-clés sont traités comme des tokens littéraux.
    const out = safeFtsQuery('vélo OR (mairie AND NOT école)');
    expect(out).not.toContain("(");
    expect(out).not.toContain(")");
    // Chaque token est entre guillemets → FTS5 le voit comme un mot
    expect(out).toContain('"OR"');
    expect(out).toContain('"AND"');
    expect(out).toContain('"NOT"');
    expect(out).toContain('"vélo"');
    expect(out).toContain('"mairie"');
  });

  it("renvoie une chaîne vide si rien d'utilisable", () => {
    expect(safeFtsQuery("")).toBe("");
    expect(safeFtsQuery("   ")).toBe("");
    expect(safeFtsQuery("?!")).toBe("");
  });

  it("autorise les tirets et apostrophes (mots composés français)", () => {
    expect(safeFtsQuery("nid-de-poule")).toBe('"nid-de-poule"*');
    expect(safeFtsQuery("aujourd'hui")).toBe(`"aujourd'hui"*`);
  });

  it("normalise NFKD avant tokenisation", () => {
    const composed = "café";
    const decomposed = "café"; // 'e' + combining acute accent
    expect(safeFtsQuery(composed)).toBe(safeFtsQuery(decomposed));
  });
});
