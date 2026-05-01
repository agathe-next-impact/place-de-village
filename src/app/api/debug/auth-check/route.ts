import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "@/lib/db/client";

/**
 * Endpoint de diagnostic auth — temporaire.
 *
 * À supprimer une fois le bug d'authentification résolu.
 *
 * Protection : nécessite un Bearer token correspondant à CRON_SECRET
 * (déjà défini sur Vercel pour le cron SMS).
 *
 * Usage :
 *   curl -X POST https://votre-domaine/api/debug/auth-check \
 *     -H "Authorization: Bearer $CRON_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"email":"maire@trizac.fr","password":"motdepasse123"}'
 *
 * Retourne : DB host vu par l'app, présence du user, longueur+préfixe
 * du hash en base, et résultat de bcrypt.compare avec le password fourni.
 */
export const runtime = "nodejs";

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

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }
  const { email, password } = body;
  if (!email) {
    return NextResponse.json({ error: "email requis dans le body" }, { status: 400 });
  }

  const normalized = String(email).trim().toLowerCase();
  const u = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalized))
    .then((r) => r[0]);

  const result: Record<string, unknown> = {
    dbHost: dbHost(),
    queriedEmail: normalized,
    userFound: Boolean(u),
  };

  if (u) {
    result.userId = u.id;
    result.role = u.role;
    result.hashLength = u.passwordHash?.length ?? 0;
    result.hashPrefix = u.passwordHash?.substring(0, 7) ?? null;
    result.emailVerified = u.emailVerifiedAt instanceof Date;
    if (password && u.passwordHash) {
      try {
        result.passwordMatches = await bcrypt.compare(String(password), u.passwordHash);
      } catch (err) {
        result.passwordMatches = false;
        result.compareError = String(err);
      }
    }
  } else {
    // Lister les emails proches pour aider à diagnostiquer une casse / typo
    const all = await db.select({ email: schema.users.email }).from(schema.users).limit(20);
    result.allEmailsSample = all.map((r) => r.email);
  }

  return NextResponse.json(result);
}
