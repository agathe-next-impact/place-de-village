import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "./client";

/**
 * Seed minimal pour mise en production : applique les migrations puis
 * insère/met à jour un unique compte « maire » (admin de la mairie).
 * Aucune donnée de démo (signalements, idées, missions, etc.) n'est
 * créée — la base est laissée vide en attente des contributions
 * réelles des habitants.
 *
 * Idempotent : ré-exécutable sans casser un compte existant. Si un
 * user avec le même email existe déjà (peu importe son id), on met à
 * jour son mot de passe + rôle. Sinon on insère un nouveau compte
 * avec un id aléatoire.
 *
 * Variables d'environnement requises :
 *   SEED_ADMIN_EMAIL     — email de l'administrateur mairie
 *   SEED_ADMIN_PASSWORD  — mot de passe initial (à changer après login)
 *
 * Optionnel :
 *   SEED_ADMIN_NAME      — nom affiché (défaut : "Mairie")
 */
async function main() {
  await migrate(db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });

  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Mairie";

  if (!email || !password) {
    console.error(
      "Erreur : SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD sont requis.\n" +
        "Exemple :\n" +
        "  SEED_ADMIN_EMAIL=admin@trizac.fr SEED_ADMIN_PASSWORD='changeme' \\\n" +
        "    npm run db:seed:minimal",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Erreur : SEED_ADMIN_PASSWORD doit faire au moins 8 caractères.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .then((r) => r[0]);

  if (existing) {
    await db
      .update(schema.users)
      .set({ passwordHash, name, role: "maire", emailVerifiedAt: new Date() })
      .where(eq(schema.users.email, email));
    console.log(`✓ Compte mis à jour`);
    console.log(`  email: ${email}`);
    console.log(`  id   : ${existing.id} (existant)`);
  } else {
    const id = `admin-${randomBytes(8).toString("hex")}`;
    await db.insert(schema.users).values({
      id,
      email,
      name,
      role: "maire",
      passwordHash,
      emailVerifiedAt: new Date(),
    });
    console.log(`✓ Compte créé`);
    console.log(`  email: ${email}`);
    console.log(`  id   : ${id}`);
  }
  console.log(`  rôle : maire`);
  console.log(`  → Connexion : ${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/auth/login`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

