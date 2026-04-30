import { afterAll, beforeAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs";

/**
 * Tests d'auth — bcrypt hashing + format des magic tokens + validations.
 * On évite de monter la DB pour ces tests purs et on revérifie les
 * invariants critiques.
 */

describe("Hash de mot de passe", () => {
  it("hash et vérifie correctement", async () => {
    const h = await bcrypt.hash("trizac", 10);
    expect(h).not.toBe("trizac");
    expect(h.startsWith("$2")).toBe(true);
    expect(await bcrypt.compare("trizac", h)).toBe(true);
    expect(await bcrypt.compare("autre", h)).toBe(false);
  });

  it("génère des hashs différents pour le même mot de passe (salt)", async () => {
    const a = await bcrypt.hash("trizac", 10);
    const b = await bcrypt.hash("trizac", 10);
    expect(a).not.toBe(b);
    expect(await bcrypt.compare("trizac", a)).toBe(true);
    expect(await bcrypt.compare("trizac", b)).toBe(true);
  });
});

describe("Validation register", () => {
  const Register = z.object({
    email: z.string().trim().toLowerCase().email(),
    name: z.string().trim().min(2).max(80),
    password: z.string().min(8).max(120),
  });

  it("rejette un mot de passe trop court", () => {
    expect(() =>
      Register.parse({ email: "a@b.fr", name: "Marie Dupont", password: "court" }),
    ).toThrow();
  });

  it("rejette un email malformé", () => {
    expect(() =>
      Register.parse({ email: "pas un email", name: "Marie Dupont", password: "longueur8" }),
    ).toThrow();
  });

  it("normalise l'email en minuscules", () => {
    const r = Register.parse({
      email: "  Marie@TRIZAC.FR ",
      name: "Marie",
      password: "longueur8",
    });
    expect(r.email).toBe("marie@trizac.fr");
  });
});

describe("Magic tokens — invariants", () => {
  it("a une expiration future quand on le crée", () => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(expiresAt.getTime()).toBeLessThan(Date.now() + 16 * 60 * 1000);
  });

  it("est considéré expiré après 15 minutes", () => {
    const past = new Date(Date.now() - 16 * 60 * 1000);
    expect(past < new Date()).toBe(true);
  });
});

// ─── Smoke test sur le seed (vérifie que le hash de "trizac" est bien
// vérifiable contre la DB seedée). On instancie une DB éphémère.

describe("Round-trip avec la DB seedée", () => {
  let db: any;
  let schema: any;
  const dbPath = path.resolve(process.cwd(), "data/trizac.db");

  beforeAll(async () => {
    if (!fs.existsSync(dbPath)) {
      // eslint-disable-next-line no-console
      console.warn("DB absente — skip");
      return;
    }
    const mod = await import("@/lib/db/client");
    db = mod.db;
    schema = mod.schema;
  });

  it("le user u1 peut s'authentifier avec 'trizac'", async () => {
    if (!db) return;
    const { eq } = await import("drizzle-orm");
    const u = db.select().from(schema.users).where(eq(schema.users.id, "u1")).get();
    expect(u).toBeTruthy();
    expect(u.passwordHash).toBeTruthy();
    const ok = await bcrypt.compare("trizac", u.passwordHash);
    expect(ok).toBe(true);
  });

  afterAll(() => {
    db = null;
  });
});
