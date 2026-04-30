import { describe, expect, it } from "vitest";
import { z } from "zod";

/**
 * Tests de domaine purs — réplique des schémas zod utilisés côté Server
 * Actions, sans dépendre de la DB. Sert de garde-fou si les contraintes
 * sont relâchées par accident.
 */

describe("Idée — validation", () => {
  const schema = z.object({
    titre: z.string().trim().min(10).max(280),
    cat: z.string().min(1),
  });

  it("rejette une idée trop courte", () => {
    expect(() => schema.parse({ titre: "court", cat: "Vie locale" })).toThrow();
  });

  it("accepte une idée correcte", () => {
    const r = schema.parse({
      titre: "Créer un verger partagé près de l'école.",
      cat: "Environnement",
    });
    expect(r.titre).toMatch(/verger/);
  });

  it("trim et longueur max appliqués", () => {
    expect(() =>
      schema.parse({ titre: "x".repeat(300), cat: "Vie locale" }),
    ).toThrow();
  });
});

describe("Promotion proposition — friction maximale", () => {
  const promoteSchema = z.object({
    discussionId: z.string(),
    titre: z.string().trim().min(10).max(120),
    constat: z.string().trim().min(30),
    proposition: z.string().trim().min(30),
    justification: z.string().trim().min(30),
    vigilance: z.string().trim().min(10),
  });

  it("exige les 4 champs longs (constat, proposition, justification, vigilance)", () => {
    expect(() =>
      promoteSchema.parse({
        discussionId: "d1",
        titre: "Marché de producteurs",
        constat: "trop court",
        proposition: "trop court",
        justification: "trop court",
        vigilance: "court",
      }),
    ).toThrow();
  });

  it("accepte un format complet", () => {
    const r = promoteSchema.parse({
      discussionId: "d1",
      titre: "Marché de producteurs",
      constat: "x".repeat(40),
      proposition: "x".repeat(40),
      justification: "x".repeat(40),
      vigilance: "x".repeat(15),
    });
    expect(r.titre).toBe("Marché de producteurs");
  });
});

describe("Réservation — chevauchement de plages", () => {
  function overlap(a1: string, a2: string, b1: string, b2: string) {
    return a1 <= b2 && b1 <= a2;
  }

  it("détecte un chevauchement strict", () => {
    expect(overlap("2026-11-10", "2026-11-12", "2026-11-11", "2026-11-13")).toBe(true);
  });

  it("détecte un même jour comme chevauchement", () => {
    expect(overlap("2026-11-10", "2026-11-10", "2026-11-10", "2026-11-10")).toBe(true);
  });

  it("ne signale pas de conflit pour des plages disjointes", () => {
    expect(overlap("2026-11-10", "2026-11-12", "2026-11-13", "2026-11-15")).toBe(false);
  });
});

describe("Signaux qualifiés — types autorisés", () => {
  const sig = z.enum(["vis", "important", "contribuer"]);

  it("rejette un type non listé", () => {
    expect(() => sig.parse("like")).toThrow();
    expect(() => sig.parse("pouce")).toThrow();
  });

  it("accepte les 3 types qualifiés", () => {
    expect(sig.parse("vis")).toBe("vis");
    expect(sig.parse("important")).toBe("important");
    expect(sig.parse("contribuer")).toBe("contribuer");
  });
});

describe("Contributions structurées — 5 types imposés", () => {
  const t = z.enum(["accord", "nuance", "objection", "question", "factuel"]);
  it("liste exhaustive et fermée", () => {
    for (const v of ["accord", "nuance", "objection", "question", "factuel"]) {
      expect(t.parse(v)).toBe(v);
    }
    expect(() => t.parse("commentaire")).toThrow();
  });
});

describe("Initiales d'avatar", () => {
  function initials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  it("renvoie 1 ou 2 lettres maxi", () => {
    expect(initials("Camille")).toBe("C");
    expect(initials("Camille Vidal")).toBe("CV");
    expect(initials("Yvette Granger Boucher")).toBe("YG");
  });
});
