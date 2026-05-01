import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "./client";

/**
 * Seed minimal pour mise en production : applique les migrations puis
 * crée un panel d'utilisateurs représentatif des 4 rôles supportés
 * (maire, agent, referent, habitant). Aucune donnée fonctionnelle
 * (signalements, idées, missions, etc.) n'est insérée — la base reste
 * vierge en attente des contributions réelles des habitants.
 *
 * Idempotent : ré-exécutable sans casse. Si l'email existe déjà, on
 * met à jour le mot de passe + le rôle. Sinon on crée le compte avec
 * un id aléatoire.
 *
 * Variables d'environnement requises :
 *   SEED_DOMAIN     — domaine email (ex: "trizac.fr")
 *   SEED_PASSWORD   — mot de passe initial partagé (≥ 8 car.)
 *
 * Le mot de passe est commun à tous les comptes — chaque utilisateur
 * doit le changer à la première connexion via /moi.
 */

type SeededUser = {
  localPart: string;
  name: string;
  role: "maire" | "agent" | "referent" | "habitant";
};

const TEMPLATE: ReadonlyArray<SeededUser> = [
  // Conseil municipal (admin)
  { localPart: "maire", name: "Mairie · Maire", role: "maire" },
  { localPart: "secretariat", name: "Mairie · Secrétariat général", role: "maire" },
  // Agents techniques
  { localPart: "voirie", name: "Services techniques · Voirie", role: "agent" },
  { localPart: "espaces-verts", name: "Services techniques · Espaces verts", role: "agent" },
  // Référents associatifs
  { localPart: "comite-fetes", name: "Comité des fêtes", role: "referent" },
  { localPart: "ccas", name: "CCAS", role: "referent" },
  // Habitants test
  { localPart: "habitant1", name: "Habitant·e 1", role: "habitant" },
  { localPart: "habitant2", name: "Habitant·e 2", role: "habitant" },
  { localPart: "habitant3", name: "Habitant·e 3", role: "habitant" },
];

async function main() {
  await migrate(db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });

  const domain = process.env.SEED_DOMAIN?.toLowerCase().replace(/^@/, "");
  const password = process.env.SEED_PASSWORD;

  if (!domain || !password) {
    console.error(
      "Erreur : SEED_DOMAIN et SEED_PASSWORD sont requis.\n" +
        "Exemple :\n" +
        "  SEED_DOMAIN=trizac.fr SEED_PASSWORD='changemechangeme' \\\n" +
        "    npm run db:seed:minimal\n",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Erreur : SEED_PASSWORD doit faire au moins 8 caractères.");
    process.exit(1);
  }
  if (!/^[a-z0-9.\-]+$/.test(domain)) {
    console.error(`Erreur : SEED_DOMAIN invalide (\"${domain}\").`);
    process.exit(1);
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
        .set({ passwordHash, name: u.name, role: u.role, emailVerifiedAt: new Date() })
        .where(eq(schema.users.email, email));
      updated.push(`${email}  (${u.role})`);
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
      created.push(`${email}  (${u.role})`);
    }
  }

  console.log("");
  console.log(`✓ Seed terminé · domaine: @${domain}`);
  console.log(`  Mot de passe partagé : ${password}`);
  console.log(`  → À changer à la première connexion via /moi`);
  console.log("");
  if (created.length) {
    console.log(`Créés (${created.length}) :`);
    for (const line of created) console.log(`  + ${line}`);
  }
  if (updated.length) {
    console.log(`Mis à jour (${updated.length}) :`);
    for (const line of updated) console.log(`  ~ ${line}`);
  }
  console.log("");
  console.log(`Connexion : ${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/auth/login`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
