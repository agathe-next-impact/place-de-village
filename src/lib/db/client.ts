import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Connexion Postgres unique (pool de l'instance), partagée par toutes
 * les requêtes serveur — Server Components, Server Actions, scripts
 * CLI (seed, migrate).
 *
 * En dev local : DATABASE_URL pointe sur un Postgres lancé via
 * `docker compose up -d` (cf. docker-compose.yml).
 *
 * Sur Vercel : Vercel Postgres (Neon) injecte automatiquement
 * POSTGRES_URL ; on fallback dessus.
 */
const url =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  "postgres://trizac:trizac@localhost:5432/trizac";

const client = postgres(url, {
  // Options conservatrices : 10 connexions max, prepared statements
  // désactivés pour compatibilité maximale avec les poolers (PgBouncer
  // transaction mode utilisé par Vercel/Neon). `max: 1` recommandé en
  // serverless si chaque invocation crée un client neuf.
  max: process.env.VERCEL ? 1 : 10,
  prepare: false,
});

export const db = drizzle(client, { schema });
export { schema };
