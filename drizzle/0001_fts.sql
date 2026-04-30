-- Recherche full-text Postgres natif via tsvector + GIN.
-- Pas besoin d'extension externe : tsvector / to_tsvector / GIN sont
-- intégrés à Postgres. On ajoute pg_trgm (extension standard) pour
-- des recherches floues / autocomplétion sur les titres.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Suggestions (Agora — idées)
ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(titre, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(cat, '')), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS suggestions_search_idx ON suggestions USING gin(search);

-- Propositions
ALTER TABLE propositions ADD COLUMN IF NOT EXISTS search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(titre, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(constat, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(proposition, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(justification, '')), 'C') ||
    setweight(to_tsvector('french', coalesce(vigilance, '')), 'C')
  ) STORED;
CREATE INDEX IF NOT EXISTS propositions_search_idx ON propositions USING gin(search);

-- Comptes rendus de conseil municipal
ALTER TABLE ccm ADD COLUMN IF NOT EXISTS search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(titre, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(body, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(themes, '')), 'A')
  ) STORED;
CREATE INDEX IF NOT EXISTS ccm_search_idx ON ccm USING gin(search);

-- Annonces officielles
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(titre, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(resume, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(body, '')), 'C')
  ) STORED;
CREATE INDEX IF NOT EXISTS annonces_search_idx ON annonces USING gin(search);

-- Signalements
ALTER TABLE signalements ADD COLUMN IF NOT EXISTS search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(titre, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(loc, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(type, '')), 'A')
  ) STORED;
CREATE INDEX IF NOT EXISTS signalements_search_idx ON signalements USING gin(search);

-- Petites annonces
ALTER TABLE petites_annonces ADD COLUMN IF NOT EXISTS search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(titre, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(cat, '')), 'A')
  ) STORED;
CREATE INDEX IF NOT EXISTS petites_annonces_search_idx ON petites_annonces USING gin(search);
