import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";

/**
 * Recherche full-text Postgres native — `tsvector` + index GIN +
 * extension `pg_trgm`, créés par drizzle/0001_fts.sql.
 *
 * Aucune table d'indexation séparée : la recherche se fait
 * directement sur suggestions / propositions / ccm / annonces /
 * signalements / petites_annonces, qui exposent une colonne `search`
 * `GENERATED ALWAYS … STORED`. Postgres maintient l'index à
 * l'INSERT/UPDATE — pas de hook applicatif nécessaire.
 *
 * Classement via `ts_rank_cd`, snippet via `ts_headline` avec
 * markup `<mark>` pour le highlighting.
 *
 * `websearch_to_tsquery` interprète une requête style moteur de
 * recherche grand public (espace = AND, `OR`, `-mot`…). C'est
 * directement utilisable depuis l'input utilisateur sans escaping
 * supplémentaire.
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

export function safeFtsQuery(raw: string): string {
  return raw.normalize("NFC").trim();
}

const ALL_TYPES: SearchEntityType[] = [
  "suggestion",
  "proposition",
  "ccm",
  "annonce",
  "signalement",
  "petite_annonce",
];

const HEADLINE_OPTS =
  "StartSel=<mark>, StopSel=</mark>, MaxFragments=1, MaxWords=12, MinWords=3";

function partSql(t: SearchEntityType, q: string) {
  // Chaque sous-requête a son propre param $1 via le template `sql` :
  // postgres-js renumérote correctement à la concaténation.
  switch (t) {
    case "suggestion":
      return sql`
        SELECT 'suggestion'::text AS entity_type, id::text AS entity_id,
               '/idees/' || id AS href, titre AS title,
               ts_headline('french', titre, websearch_to_tsquery('french', ${q}),
                 ${HEADLINE_OPTS}) AS snippet,
               ts_rank_cd(search, websearch_to_tsquery('french', ${q})) AS rank
        FROM suggestions
        WHERE search @@ websearch_to_tsquery('french', ${q})
      `;
    case "proposition":
      return sql`
        SELECT 'proposition'::text, id::text, '/propositions/' || id, titre,
               ts_headline('french', coalesce(proposition, titre),
                 websearch_to_tsquery('french', ${q}), ${HEADLINE_OPTS}),
               ts_rank_cd(search, websearch_to_tsquery('french', ${q}))
        FROM propositions
        WHERE search @@ websearch_to_tsquery('french', ${q})
      `;
    case "ccm":
      return sql`
        SELECT 'ccm'::text, id::text, '/conseil-municipal', titre,
               ts_headline('french', body, websearch_to_tsquery('french', ${q}),
                 ${HEADLINE_OPTS}),
               ts_rank_cd(search, websearch_to_tsquery('french', ${q}))
        FROM ccm
        WHERE search @@ websearch_to_tsquery('french', ${q})
      `;
    case "annonce":
      return sql`
        SELECT 'annonce'::text, id::text, '/', titre,
               ts_headline('french', coalesce(body, resume),
                 websearch_to_tsquery('french', ${q}), ${HEADLINE_OPTS}),
               ts_rank_cd(search, websearch_to_tsquery('french', ${q}))
        FROM annonces
        WHERE search @@ websearch_to_tsquery('french', ${q})
      `;
    case "signalement":
      return sql`
        SELECT 'signalement'::text, id::text, '/signalements/' || id, titre,
               ts_headline('french', coalesce(description, loc),
                 websearch_to_tsquery('french', ${q}), ${HEADLINE_OPTS}),
               ts_rank_cd(search, websearch_to_tsquery('french', ${q}))
        FROM signalements
        WHERE search @@ websearch_to_tsquery('french', ${q})
      `;
    case "petite_annonce":
      return sql`
        SELECT 'petite_annonce'::text, id::text, '/petites-annonces', titre,
               ts_headline('french', description,
                 websearch_to_tsquery('french', ${q}), ${HEADLINE_OPTS}),
               ts_rank_cd(search, websearch_to_tsquery('french', ${q}))
        FROM petites_annonces
        WHERE search @@ websearch_to_tsquery('french', ${q})
          AND closed = false AND expires_at > now()
      `;
  }
}

export async function searchAll(
  query: string,
  opts: { types?: SearchEntityType[]; limit?: number } = {},
): Promise<SearchHit[]> {
  const q = safeFtsQuery(query);
  if (!q) return [];
  const limit = Math.min(opts.limit ?? 30, 100);
  const types = opts.types && opts.types.length > 0 ? opts.types : ALL_TYPES;
  const parts = types.map((t) => partSql(t, q));
  // sql.join concatène en gérant correctement les paramètres bind
  const union = sql.join(parts, sql` UNION ALL `);
  const rows = (await db.execute(sql`
    WITH r AS (${union})
    SELECT entity_type AS "entityType", entity_id AS "entityId",
           href, title, snippet, rank
    FROM r
    ORDER BY rank DESC
    LIMIT ${limit}
  `)) as unknown as Array<{
    entityType: SearchEntityType;
    entityId: string;
    href: string;
    title: string;
    snippet: string;
    rank: number | string;
  }>;
  return rows.map((r) => ({
    entityType: r.entityType,
    entityId: r.entityId,
    href: r.href,
    title: r.title,
    snippet: r.snippet,
    rank: Number(r.rank),
  }));
}

// Pas de mutation côté app : tsvector est maintenu par Postgres via
// la colonne GENERATED ALWAYS STORED. On garde ces no-ops pour
// préserver la signature de l'API (les Server Actions existantes
// continuent de compiler sans changement).
export function indexEntity(_args: {
  entityType: SearchEntityType;
  entityId: string;
  href: string;
  title: string;
  body?: string | null;
  themes?: string | null;
}): void {
  /* no-op : maintenu par Postgres */
}

export function removeFromIndex(
  _entityType: SearchEntityType,
  _entityId: string,
): void {
  /* no-op */
}
