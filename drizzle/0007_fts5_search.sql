-- Recherche full-text via SQLite FTS5 (intégré nativement).
-- Pas de table de schéma classique : table virtuelle.
--
-- Cf. CdC §2.1 Pôle 5 « recherche plein texte » sur les comptes
-- rendus, et plus largement sur les contenus citoyens (suggestions,
-- propositions, annonces, signalements).
--
-- Tokenizer `unicode61` (par défaut) : suppression d'accents et
-- normalisation Unicode → la recherche « mairie » trouve aussi
-- « mairíe » et « MAIRIE ». BM25 par défaut.

CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5 (
  entity_type UNINDEXED,
  entity_id UNINDEXED,
  href UNINDEXED,
  title,
  body,
  themes,
  tokenize = 'unicode61 remove_diacritics 2'
);
