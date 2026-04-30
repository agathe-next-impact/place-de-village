// NB : pas d'`import "server-only"` ici — ce fichier est aussi importé
// par le script de seed CLI (tsx). La frontière serveur est assurée
// par better-sqlite3, qui n'est jamais chargeable côté client.
import Database from "better-sqlite3";
import path from "node:path";

/**
 * Recherche full-text sur les contenus citoyens, via SQLite FTS5
 * intégré (zéro infrastructure supplémentaire). Couvre :
 *
 *   - ccm           — comptes rendus de conseil municipal
 *   - suggestion    — idées Agora
 *   - proposition   — propositions citoyennes
 *   - annonce       — annonces officielles mairie
 *   - signalement   — signalements pratiques
 *   - petite_annonce — petites annonces locales
 *
 * Tokenizer `unicode61 remove_diacritics 2` : insensible à la casse
 * et aux accents. BM25 par défaut. Snippet avec markup `<mark>`
 * pour le highlighting.
 *
 * Migration future possible vers Meilisearch / Typesense en gardant
 * l'API de ce module — voir README, section « Recherche ».
 */

export type SearchEntityType =
  | "ccm"
  | "suggestion"
  | "proposition"
  | "annonce"
  | "signalement"
  | "petite_annonce";

export type SearchHit = {
  entityType: SearchEntityType;
  entityId: string;
  href: string;
  title: string;
  snippet: string;
  rank: number;
};

// On utilise un client better-sqlite3 dédié pour pouvoir exécuter
// des requêtes FTS5 brutes (Drizzle ne sait pas modéliser les tables
// virtuelles).
const dbPath = path.resolve(process.cwd(), "data/trizac.db");
let cached: Database.Database | null = null;
function getDb() {
  if (cached) return cached;
  cached = new Database(dbPath);
  cached.pragma("journal_mode = WAL");
  return cached;
}

/**
 * Échappe une requête utilisateur en syntaxe FTS5 sûre. On encadre
 * chaque token alphanumérique par des guillemets pour neutraliser
 * les opérateurs (NEAR, OR, AND, NOT, ^, *, etc.) tout en autorisant
 * la recherche multi-mots.
 */
export function safeFtsQuery(raw: string): string {
  // NFC garde les caractères accentués composés en un seul codepoint
  // (« é », « à », …). NFKD les décomposerait en lettre + accent
  // combinant et le filtre `\p{L}` couperait les mots en deux.
  const tokens = raw
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .map((t) => `"${t.replace(/"/g, '""')}"`);
  if (tokens.length === 0) return "";
  // tous les tokens en AND implicite + match préfixe sur le dernier
  // pour rendre la recherche progressive plus naturelle
  const last = tokens.pop()!;
  return [...tokens, `${last}*`].join(" ");
}

export type SearchOptions = {
  types?: SearchEntityType[];
  limit?: number;
};

export function searchAll(query: string, opts: SearchOptions = {}): SearchHit[] {
  const fts = safeFtsQuery(query);
  if (!fts) return [];
  const db = getDb();
  const limit = Math.min(opts.limit ?? 30, 100);
  let sql = `
    SELECT
      entity_type AS entityType,
      entity_id AS entityId,
      href,
      title,
      snippet(search_index, 4, '<mark>', '</mark>', '…', 12) AS snippet,
      bm25(search_index) AS rank
    FROM search_index
    WHERE search_index MATCH ?
  `;
  const params: unknown[] = [fts];
  if (opts.types && opts.types.length > 0) {
    sql +=
      " AND entity_type IN (" + opts.types.map(() => "?").join(",") + ")";
    params.push(...opts.types);
  }
  sql += " ORDER BY rank LIMIT ?";
  params.push(limit);
  return db.prepare(sql).all(...params) as SearchHit[];
}

// ─── Mutations de l'index ─────────────────────────────────────────────

export function indexEntity(args: {
  entityType: SearchEntityType;
  entityId: string;
  href: string;
  title: string;
  body?: string | null;
  themes?: string | null;
}) {
  const db = getDb();
  // upsert : on supprime puis insère
  db.prepare(
    "DELETE FROM search_index WHERE entity_type = ? AND entity_id = ?",
  ).run(args.entityType, args.entityId);
  db.prepare(
    `INSERT INTO search_index (entity_type, entity_id, href, title, body, themes)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    args.entityType,
    args.entityId,
    args.href,
    args.title,
    args.body ?? "",
    args.themes ?? "",
  );
}

export function removeFromIndex(entityType: SearchEntityType, entityId: string) {
  const db = getDb();
  db.prepare(
    "DELETE FROM search_index WHERE entity_type = ? AND entity_id = ?",
  ).run(entityType, entityId);
}

/** Vide complètement l'index. Utilisé au seed pour repartir propre. */
export function clearIndex() {
  const db = getDb();
  db.prepare("DELETE FROM search_index").run();
}

export function indexCount() {
  const db = getDb();
  return (
    (db.prepare("SELECT count(*) as c FROM search_index").get() as { c: number })?.c ?? 0
  );
}
