import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { db, schema } from "@/lib/db/client";

/**
 * Endpoint de seed temporaire — exécute la logique de seed-minimal
 * directement depuis le runtime serveur de l'app, garantissant qu'on
 * tape sur la DB que l'app lit réellement (sans dépendre d'un
 * .env.production.local potentiellement obsolète côté CLI).
 *
 * Protégé par Bearer CRON_SECRET.
 *
 * Usage :
 *   POST /api/debug/seed
 *   Authorization: Bearer <CRON_SECRET>
 *   Content-Type: application/json
 *   { "domain": "trizac.fr", "password": "mairie15400?" }
 *
 * Retourne la liste des comptes créés/mis à jour.
 *
 * À supprimer une fois la mise en prod stabilisée.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

type SeededUser = {
  localPart: string;
  name: string;
  role: "maire" | "agent" | "referent" | "habitant";
};

const TEMPLATE: ReadonlyArray<SeededUser> = [
  { localPart: "maire", name: "Mairie · Maire", role: "maire" },
  { localPart: "secretariat", name: "Mairie · Secrétariat général", role: "maire" },
  { localPart: "voirie", name: "Services techniques · Voirie", role: "agent" },
  { localPart: "espaces-verts", name: "Services techniques · Espaces verts", role: "agent" },
  { localPart: "comite-fetes", name: "Comité des fêtes", role: "referent" },
  { localPart: "ccas", name: "CCAS", role: "referent" },
  { localPart: "habitant1", name: "Habitant·e 1", role: "habitant" },
  { localPart: "habitant2", name: "Habitant·e 2", role: "habitant" },
  { localPart: "habitant3", name: "Habitant·e 3", role: "habitant" },
];

function dbHost(): string {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";
  try {
    return new URL(url).host;
  } catch {
    return url ? "<unparseable>" : "<missing>";
  }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non défini" }, { status: 500 });
  }
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { domain?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const domain = body.domain?.toLowerCase().replace(/^@/, "") ?? "trizac.fr";
  const password = body.password;

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "password requis (>= 8 caractères)" },
      { status: 400 },
    );
  }
  if (!/^[a-z0-9.\-]+$/.test(domain)) {
    return NextResponse.json({ error: `domain invalide: ${domain}` }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created: string[] = [];
  const updated: string[] = [];

  for (const u of TEMPLATE) {
    const email = `${u.localPart}@${domain}`;
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .then((r) => r[0]);

    if (existing) {
      await db
        .update(schema.users)
        .set({
          passwordHash,
          name: u.name,
          role: u.role,
          emailVerifiedAt: new Date(),
        })
        .where(eq(schema.users.email, email));
      updated.push(`${email} (${u.role})`);
    } else {
      const id = `seed-${u.role}-${randomBytes(6).toString("hex")}`;
      await db.insert(schema.users).values({
        id,
        email,
        name: u.name,
        role: u.role,
        passwordHash,
        emailVerifiedAt: new Date(),
      });
      created.push(`${email} (${u.role})`);
    }
  }

  return NextResponse.json({
    dbHost: dbHost(),
    domain,
    sharedPassword: password,
    created,
    updated,
    totalAccounts: TEMPLATE.length,
    note: "Tous les comptes partagent ce mot de passe. À changer via /moi après login.",
  });
}
