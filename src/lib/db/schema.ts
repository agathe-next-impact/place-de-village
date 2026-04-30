import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Schéma Postgres — exécution sur Vercel Postgres (Neon UE / US),
 * Postgres managé Scaleway, OVH, ou Postgres local via docker-compose.
 *
 * Pour le runtime local de dev sans Docker, voir `npm run db:up`
 * (lance un Postgres temporaire pgvector via Docker).
 */

const now = sql`now()`;

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["habitant", "agent", "referent", "maire"] })
    .notNull()
    .default("habitant"),
  passwordHash: text("password_hash"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  /** Téléphone E.164 (ex: +33611223344). */
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().default(now),
    userAgent: text("user_agent"),
  },
  (t) => ({ userIdx: index("sessions_user_idx").on(t.userId) }),
);

export const magicTokens = pgTable("magic_tokens", {
  token: text("token").primaryKey(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
});

export const consents = pgTable(
  "consents",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    finality: text("finality", {
      enum: ["contributions", "digest", "geoloc", "sms", "transac_email"],
    }).notNull(),
    granted: boolean("granted").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(now),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.finality] }) }),
);

/** File d'attente d'emails sortants. */
export const emailQueue = pgTable(
  "email_queue",
  {
    id: serial("id").primaryKey(),
    toAddress: text("to_address").notNull(),
    toName: text("to_name"),
    subject: text("subject").notNull(),
    text: text("text").notNull(),
    html: text("html"),
    template: text("template").notNull(),
    relatedEntity: text("related_entity"),
    status: text("status", { enum: ["pending", "sent", "captured", "failed"] })
      .notNull()
      .default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => ({ statusIdx: index("email_queue_status_idx").on(t.status) }),
);

/** File d'attente SMS. */
export const smsQueue = pgTable(
  "sms_queue",
  {
    id: serial("id").primaryKey(),
    toPhone: text("to_phone").notNull(),
    body: text("body").notNull(),
    template: text("template").notNull(),
    relatedEntity: text("related_entity"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull().default(now),
    status: text("status", { enum: ["pending", "sent", "captured", "failed"] })
      .notNull()
      .default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => ({
    statusIdx: index("sms_queue_status_idx").on(t.status),
    schedIdx: index("sms_queue_sched_idx").on(t.scheduledAt),
  }),
);

// ─── Pôle 3 : Signalements ────────────────────────────────────────────
export const signalements = pgTable(
  "signalements",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    titre: text("titre").notNull(),
    description: text("description"),
    auteurId: text("auteur_id").notNull().references(() => users.id),
    auteur: text("auteur").notNull(),
    etat: text("etat", {
      enum: ["signale", "pris-en-compte", "en-cours", "resolu"],
    })
      .notNull()
      .default("signale"),
    loc: text("loc").notNull(),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    icon: text("icon").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(now),
  },
  (t) => ({
    etatIdx: index("signalements_etat_idx").on(t.etat),
    createdIdx: index("signalements_created_idx").on(t.createdAt),
  }),
);

export const signalementHistory = pgTable("signalement_history", {
  id: serial("id").primaryKey(),
  signalementId: text("signalement_id")
    .notNull()
    .references(() => signalements.id, { onDelete: "cascade" }),
  etat: text("etat").notNull(),
  comment: text("comment"),
  agentId: text("agent_id").references(() => users.id),
  at: timestamp("at", { withTimezone: true }).notNull().default(now),
});

// ─── Pôle 1 : Agora ───────────────────────────────────────────────────
export const suggestions = pgTable("suggestions", {
  id: text("id").primaryKey(),
  titre: text("titre").notNull(),
  cat: text("cat").notNull(),
  auteurId: text("auteur_id").notNull().references(() => users.id),
  auteur: text("auteur").notNull(),
  contributions: integer("contributions").notNull().default(0),
  mature: boolean("mature").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
});

export const signalEmissions = pgTable(
  "signal_emissions",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    suggestionId: text("suggestion_id")
      .notNull()
      .references(() => suggestions.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["vis", "important", "contribuer"] }).notNull(),
    at: timestamp("at", { withTimezone: true }).notNull().default(now),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.suggestionId, t.type] }) }),
);

export const discussions = pgTable("discussions", {
  id: text("id").primaryKey(),
  titre: text("titre").notNull(),
  anim: text("anim").notNull(),
  derniereSynth: text("derniere_synth"),
  mature: boolean("mature").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
});

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  discussionId: text("discussion_id")
    .notNull()
    .references(() => discussions.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: ["accord", "nuance", "objection", "question", "factuel"],
  }).notNull(),
  texte: text("texte").notNull(),
  auteurId: text("auteur_id").notNull().references(() => users.id),
  auteur: text("auteur").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull().default(now),
});

export const synthesises = pgTable("synthesises", {
  id: serial("id").primaryKey(),
  discussionId: text("discussion_id")
    .notNull()
    .references(() => discussions.id, { onDelete: "cascade" }),
  texte: text("texte").notNull(),
  authorId: text("author_id").notNull().references(() => users.id),
  authorName: text("author_name").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().default(now),
});

export const moderationFlags = pgTable("moderation_flags", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type", {
    enum: ["suggestion", "contribution", "entraide", "message", "petite_annonce"],
  }).notNull(),
  entityId: text("entity_id").notNull(),
  reporterId: text("reporter_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["ouvert", "traite", "ignore"] })
    .notNull()
    .default("ouvert"),
  resolvedById: text("resolved_by_id").references(() => users.id),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  at: timestamp("at", { withTimezone: true }).notNull().default(now),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  titre: text("titre").notNull(),
  body: text("body"),
  href: text("href"),
  readAt: timestamp("read_at", { withTimezone: true }),
  at: timestamp("at", { withTimezone: true }).notNull().default(now),
});

export const propositions = pgTable("propositions", {
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
});

export const supports = pgTable(
  "supports",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    propositionId: text("proposition_id")
      .notNull()
      .references(() => propositions.id, { onDelete: "cascade" }),
    at: timestamp("at", { withTimezone: true }).notNull().default(now),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.propositionId] }) }),
);

// ─── Pôle 2 : Bénévolat ───────────────────────────────────────────────
export const missions = pgTable("missions", {
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
});

export const missionRegistrations = pgTable(
  "mission_registrations",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    missionId: text("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    at: timestamp("at", { withTimezone: true }).notNull().default(now),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.missionId] }) }),
);

// ─── Pôle 4 : Entraide ────────────────────────────────────────────────
export const entraide = pgTable("entraide", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["demande", "offre"] }).notNull(),
  titre: text("titre").notNull(),
  description: text("description").notNull(),
  quartier: text("quartier").notNull(),
  date: text("date"),
  auteurId: text("auteur_id").notNull().references(() => users.id),
  auteur: text("auteur").notNull(),
  age: text("age"),
  closed: boolean("closed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
});

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    entraideId: text("entraide_id")
      .notNull()
      .references(() => entraide.id, { onDelete: "cascade" }),
    aId: text("a_id").notNull().references(() => users.id),
    bId: text("b_id").notNull().references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
  },
  (t) => ({ uniq: uniqueIndex("conv_pair_uniq").on(t.entraideId, t.aId, t.bId) }),
);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull().default(now),
});

// ─── Pôle 5 : Vie locale ──────────────────────────────────────────────
export const annonces = pgTable("annonces", {
  id: text("id").primaryKey(),
  titre: text("titre").notNull(),
  resume: text("resume").notNull(),
  body: text("body"),
  date: text("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
});

export const agendaItems = pgTable("agenda_items", {
  id: text("id").primaryKey(),
  titre: text("titre").notNull(),
  date: text("date").notNull(),
  jour: text("jour").notNull(),
  heure: text("heure").notNull(),
  lieu: text("lieu").notNull(),
  type: text("type", { enum: ["officiel", "asso", "benevolat"] }).notNull(),
  iso: text("iso"),
});

export const associations = pgTable("associations", {
  id: text("id").primaryKey(),
  nom: text("nom").notNull(),
  description: text("description"),
  contact: text("contact"),
  membres: text("membres"),
});

export const ccm = pgTable("ccm", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  titre: text("titre").notNull(),
  body: text("body").notNull(),
  themes: text("themes"),
});

export const petitesAnnonces = pgTable("petites_annonces", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["don", "pret", "echange", "vente"] }).notNull(),
  cat: text("cat").notNull(),
  titre: text("titre").notNull(),
  description: text("description").notNull(),
  prix: text("prix"),
  auteurId: text("auteur_id").notNull().references(() => users.id),
  auteur: text("auteur").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  closed: boolean("closed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
});

// ─── Pôle 6 : Réservations ────────────────────────────────────────────
export const equipements = pgTable("equipements", {
  id: text("id").primaryKey(),
  nom: text("nom").notNull(),
  capacite: text("capacite").notNull(),
  tarif: text("tarif").notNull(),
  description: text("description"),
});

export const reservations = pgTable("reservations", {
  id: text("id").primaryKey(),
  equipementId: text("equipement_id").notNull().references(() => equipements.id),
  userId: text("user_id").notNull().references(() => users.id),
  userName: text("user_name").notNull(),
  startIso: text("start_iso").notNull(),
  endIso: text("end_iso").notNull(),
  motif: text("motif").notNull(),
  statut: text("statut", { enum: ["en-attente", "valide", "refus", "annule"] })
    .notNull()
    .default("en-attente"),
  refusMotif: text("refus_motif"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(now),
});

export const errorLog = pgTable(
  "error_log",
  {
    id: serial("id").primaryKey(),
    level: text("level", { enum: ["error", "warn", "info"] }).notNull().default("error"),
    message: text("message").notNull(),
    stack: text("stack"),
    context: text("context"),
    runtime: text("runtime"),
    sentryEventId: text("sentry_event_id"),
    at: timestamp("at", { withTimezone: true }).notNull().default(now),
  },
  (t) => ({ atIdx: index("error_log_at_idx").on(t.at) }),
);

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  actorId: text("actor_id").references(() => users.id),
  actorName: text("actor_name"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: text("details"),
  at: timestamp("at", { withTimezone: true }).notNull().default(now),
});

/**
 * Index full-text texte normal (Postgres). Le service search/ utilise
 * `tsvector` calculé à la volée via un index GIN sur les colonnes
 * concernées, et `pg_trgm` pour le fuzzy matching. Pas de table
 * d'indexation séparée nécessaire — on requête directement sur
 * suggestions/propositions/etc.
 *
 * Voir migration drizzle/0001_search_indexes.sql qui crée les
 * extensions et les index.
 */
