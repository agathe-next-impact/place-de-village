import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * Schéma SQLite local — utilisé pour la démo et le développement.
 * En production, le backend canonique est WordPress headless via WPGraphQL
 * (cf. CdC §4). Ce schéma reste compatible : il est conçu pour être
 * remplaçable sans refonte UI.
 */

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["habitant", "agent", "referent", "maire"] })
    .notNull()
    .default("habitant"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const consents = sqliteTable(
  "consents",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    finality: text("finality", {
      enum: ["contributions", "digest", "geoloc", "sms"],
    }).notNull(),
    granted: integer("granted", { mode: "boolean" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.finality] }),
  }),
);

// ─── Pôle 3 : Signalements ────────────────────────────────────────────
export const signalements = sqliteTable(
  "signalements",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(), // Voirie, Éclairage, …
    titre: text("titre").notNull(),
    description: text("description"),
    auteurId: text("auteur_id")
      .notNull()
      .references(() => users.id),
    auteur: text("auteur").notNull(), // dénormalisé pour l'affichage rapide
    etat: text("etat", {
      enum: ["signale", "pris-en-compte", "en-cours", "resolu"],
    })
      .notNull()
      .default("signale"),
    loc: text("loc").notNull(),
    lat: integer("lat"),
    lng: integer("lng"),
    icon: text("icon").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    etatIdx: index("signalements_etat_idx").on(t.etat),
    createdIdx: index("signalements_created_idx").on(t.createdAt),
  }),
);

export const signalementHistory = sqliteTable("signalement_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  signalementId: text("signalement_id")
    .notNull()
    .references(() => signalements.id, { onDelete: "cascade" }),
  etat: text("etat").notNull(),
  comment: text("comment"),
  agentId: text("agent_id").references(() => users.id),
  at: integer("at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Pôle 1 : Agora ───────────────────────────────────────────────────
export const suggestions = sqliteTable("suggestions", {
  id: text("id").primaryKey(),
  titre: text("titre").notNull(),
  cat: text("cat").notNull(),
  auteurId: text("auteur_id")
    .notNull()
    .references(() => users.id),
  auteur: text("auteur").notNull(),
  contributions: integer("contributions").notNull().default(0),
  mature: integer("mature", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Signaux qualifiés émis par un habitant sur une suggestion.
 * Unicité (habitant × suggestion × type) — cf. CdC §4.4.
 */
export const signalEmissions = sqliteTable(
  "signal_emissions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    suggestionId: text("suggestion_id")
      .notNull()
      .references(() => suggestions.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["vis", "important", "contribuer"],
    }).notNull(),
    at: integer("at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.suggestionId, t.type] }),
  }),
);

export const discussions = sqliteTable("discussions", {
  id: text("id").primaryKey(),
  titre: text("titre").notNull(),
  anim: text("anim").notNull(),
  derniereSynth: text("derniere_synth"),
  mature: integer("mature", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Contributions structurées (5 types imposés). Aucune dérive en fil de
 * commentaires — cf. CdC §2.1 Pôle 1 Étage 2.
 */
export const contributions = sqliteTable("contributions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  discussionId: text("discussion_id")
    .notNull()
    .references(() => discussions.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: ["accord", "nuance", "objection", "question", "factuel"],
  }).notNull(),
  texte: text("texte").notNull(),
  auteurId: text("auteur_id")
    .notNull()
    .references(() => users.id),
  auteur: text("auteur").notNull(),
  at: integer("at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const propositions = sqliteTable("propositions", {
  id: text("id").primaryKey(),
  titre: text("titre").notNull(),
  constat: text("constat"),
  proposition: text("proposition"),
  justification: text("justification"),
  vigilance: text("vigilance"),
  discussionId: text("discussion_id").references(() => discussions.id),
  seuil: integer("seuil").notNull().default(100),
  joursRestants: integer("jours_restants").notNull().default(21),
  statut: text("statut", {
    enum: ["instruction", "soutien", "reponse-mairie", "publiee"],
  })
    .notNull()
    .default("instruction"),
  reponseDate: text("reponse_date"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const supports = sqliteTable(
  "supports",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propositionId: text("proposition_id")
      .notNull()
      .references(() => propositions.id, { onDelete: "cascade" }),
    at: integer("at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.propositionId] }),
  }),
);

// ─── Pôle 2 : Bénévolat ───────────────────────────────────────────────
export const missions = sqliteTable("missions", {
  id: text("id").primaryKey(),
  titre: text("titre").notNull(),
  cat: text("cat").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  duree: text("duree").notNull(),
  lieu: text("lieu").notNull(),
  besoin: integer("besoin").notNull(),
  ref: text("ref").notNull(),
  refUserId: text("ref_user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const missionRegistrations = sqliteTable(
  "mission_registrations",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    missionId: text("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    at: integer("at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.missionId] }),
  }),
);

// ─── Pôle 4 : Entraide ────────────────────────────────────────────────
export const entraide = sqliteTable("entraide", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["demande", "offre"] }).notNull(),
  titre: text("titre").notNull(),
  description: text("description").notNull(),
  quartier: text("quartier").notNull(),
  date: text("date"),
  auteurId: text("auteur_id")
    .notNull()
    .references(() => users.id),
  auteur: text("auteur").notNull(),
  age: text("age"),
  closed: integer("closed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Messagerie interne asynchrone — Pôle 4 entraide.
 * Pas de chat instantané. Pas d'exposition des coordonnées personnelles.
 */
export const conversations = sqliteTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    entraideId: text("entraide_id")
      .notNull()
      .references(() => entraide.id, { onDelete: "cascade" }),
    aId: text("a_id")
      .notNull()
      .references(() => users.id),
    bId: text("b_id")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    uniq: uniqueIndex("conv_pair_uniq").on(t.entraideId, t.aId, t.bId),
  }),
);

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  at: integer("at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Pôle 5 : Vie locale ──────────────────────────────────────────────
export const annonces = sqliteTable("annonces", {
  id: text("id").primaryKey(),
  titre: text("titre").notNull(),
  resume: text("resume").notNull(),
  body: text("body"),
  date: text("date").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const agendaItems = sqliteTable("agenda_items", {
  id: text("id").primaryKey(),
  titre: text("titre").notNull(),
  date: text("date").notNull(), // affichage "5 nov."
  jour: text("jour").notNull(), // "mer"
  heure: text("heure").notNull(),
  lieu: text("lieu").notNull(),
  type: text("type", { enum: ["officiel", "asso", "benevolat"] }).notNull(),
  iso: text("iso"), // YYYY-MM-DD pour la vue calendrier
});

export const associations = sqliteTable("associations", {
  id: text("id").primaryKey(),
  nom: text("nom").notNull(),
  description: text("description"),
  contact: text("contact"),
  membres: text("membres"),
});

export const ccm = sqliteTable("ccm", {
  // Comptes rendus de conseil municipal
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  titre: text("titre").notNull(),
  body: text("body").notNull(),
  themes: text("themes"), // CSV simple
});

/** Petites annonces (don / prêt / échange / vente). Durée 30 jours. */
export const petitesAnnonces = sqliteTable("petites_annonces", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["don", "pret", "echange", "vente"] }).notNull(),
  cat: text("cat").notNull(),
  titre: text("titre").notNull(),
  description: text("description").notNull(),
  prix: text("prix"),
  auteurId: text("auteur_id")
    .notNull()
    .references(() => users.id),
  auteur: text("auteur").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  closed: integer("closed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Pôle 6 : Réservations ────────────────────────────────────────────
export const equipements = sqliteTable("equipements", {
  id: text("id").primaryKey(),
  nom: text("nom").notNull(),
  capacite: text("capacite").notNull(),
  tarif: text("tarif").notNull(),
  description: text("description"),
});

export const reservations = sqliteTable("reservations", {
  id: text("id").primaryKey(),
  equipementId: text("equipement_id")
    .notNull()
    .references(() => equipements.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  userName: text("user_name").notNull(),
  startIso: text("start_iso").notNull(), // YYYY-MM-DD
  endIso: text("end_iso").notNull(),
  motif: text("motif").notNull(),
  statut: text("statut", {
    enum: ["en-attente", "valide", "refus", "annule"],
  })
    .notNull()
    .default("en-attente"),
  refusMotif: text("refus_motif"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Transparence : journal des décisions ─────────────────────────────
export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorId: text("actor_id").references(() => users.id),
  actorName: text("actor_name"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: text("details"),
  at: integer("at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
