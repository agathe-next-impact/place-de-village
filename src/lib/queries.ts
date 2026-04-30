import "server-only";
import { and, asc, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db, schema } from "./db/client";
import { getCurrentUser } from "./auth";

// ─── Signalements ────────────────────────────────────────────────────
export async function listSignalements() {
  return db
    .select()
    .from(schema.signalements)
    .orderBy(desc(schema.signalements.createdAt))
    .all();
}

export async function getSignalement(id: string) {
  const s = db.select().from(schema.signalements).where(eq(schema.signalements.id, id)).get();
  if (!s) return null;
  const history = db
    .select()
    .from(schema.signalementHistory)
    .where(eq(schema.signalementHistory.signalementId, id))
    .orderBy(asc(schema.signalementHistory.at))
    .all();
  return { ...s, history };
}

// ─── Suggestions ─────────────────────────────────────────────────────
export async function listSuggestions() {
  const items = db
    .select()
    .from(schema.suggestions)
    .orderBy(desc(schema.suggestions.createdAt))
    .all();
  const u = await getCurrentUser();
  return items.map((s) => {
    const counts = db
      .select({
        type: schema.signalEmissions.type,
        c: sql<number>`count(*)`,
      })
      .from(schema.signalEmissions)
      .where(eq(schema.signalEmissions.suggestionId, s.id))
      .groupBy(schema.signalEmissions.type)
      .all();
    const signaux = { vis: 0, important: 0, contribuer: 0 };
    for (const c of counts) signaux[c.type as keyof typeof signaux] = c.c;
    const myEmissions = db
      .select({ type: schema.signalEmissions.type })
      .from(schema.signalEmissions)
      .where(
        and(
          eq(schema.signalEmissions.suggestionId, s.id),
          eq(schema.signalEmissions.userId, u.id),
        ),
      )
      .all()
      .map((r) => r.type);
    const sec = Math.floor(Date.now() / 1000) - Math.floor(s.createdAt.getTime() / 1000);
    const age =
      sec < 3600
        ? "à l'instant"
        : sec < 24 * 3600
          ? `${Math.floor(sec / 3600)} h`
          : sec < 30 * 24 * 3600
            ? `${Math.floor(sec / (24 * 3600))} j`
            : `${Math.floor(sec / (30 * 24 * 3600))} mois`;
    return { ...s, signaux, myEmissions, age };
  });
}

export async function getSuggestion(id: string) {
  const all = await listSuggestions();
  return all.find((s) => s.id === id) ?? null;
}

// ─── Discussions ─────────────────────────────────────────────────────
export async function listDiscussions() {
  const items = db.select().from(schema.discussions).all();
  return items.map((d) => {
    const counts = db
      .select({ type: schema.contributions.type, c: sql<number>`count(*)` })
      .from(schema.contributions)
      .where(eq(schema.contributions.discussionId, d.id))
      .groupBy(schema.contributions.type)
      .all();
    const buckets = { accord: 0, nuance: 0, objection: 0, question: 0, factuel: 0 };
    let total = 0;
    for (const c of counts) {
      buckets[c.type as keyof typeof buckets] = c.c;
      total += c.c;
    }
    return { ...d, contribs: total, ...buckets };
  });
}

export async function getDiscussion(id: string) {
  const all = await listDiscussions();
  const d = all.find((x) => x.id === id);
  if (!d) return null;
  const contribs = db
    .select()
    .from(schema.contributions)
    .where(eq(schema.contributions.discussionId, id))
    .orderBy(desc(schema.contributions.at))
    .all();
  const synth = db
    .select()
    .from(schema.synthesises)
    .where(eq(schema.synthesises.discussionId, id))
    .orderBy(desc(schema.synthesises.publishedAt))
    .all();
  return { ...d, list: contribs, synthesises: synth };
}

// ─── Propositions ────────────────────────────────────────────────────
export async function listPropositions() {
  const items = db.select().from(schema.propositions).orderBy(desc(schema.propositions.createdAt)).all();
  const u = await getCurrentUser();
  return items.map((p) => {
    const cnt = db
      .select({ c: sql<number>`count(*)` })
      .from(schema.supports)
      .where(eq(schema.supports.propositionId, p.id))
      .get()?.c ?? 0;
    const supported =
      db
        .select()
        .from(schema.supports)
        .where(and(eq(schema.supports.propositionId, p.id), eq(schema.supports.userId, u.id)))
        .get() != null;
    return { ...p, soutiens: cnt, supported };
  });
}

export async function getProposition(id: string) {
  const all = await listPropositions();
  return all.find((p) => p.id === id) ?? null;
}

// ─── Missions ────────────────────────────────────────────────────────
export async function listMissions() {
  const items = db.select().from(schema.missions).orderBy(desc(schema.missions.createdAt)).all();
  const u = await getCurrentUser();
  return items.map((m) => {
    const inscrits = db
      .select({ c: sql<number>`count(*)` })
      .from(schema.missionRegistrations)
      .where(eq(schema.missionRegistrations.missionId, m.id))
      .get()?.c ?? 0;
    const registered =
      db
        .select()
        .from(schema.missionRegistrations)
        .where(
          and(
            eq(schema.missionRegistrations.missionId, m.id),
            eq(schema.missionRegistrations.userId, u.id),
          ),
        )
        .get() != null;
    return { ...m, inscrits, registered };
  });
}

export async function getMission(id: string) {
  const all = await listMissions();
  return all.find((m) => m.id === id) ?? null;
}

// ─── Entraide / messagerie ───────────────────────────────────────────
export async function listEntraide() {
  return db
    .select()
    .from(schema.entraide)
    .orderBy(desc(schema.entraide.createdAt))
    .all()
    .filter((e) => !e.closed);
}

export async function getEntraide(id: string) {
  return db.select().from(schema.entraide).where(eq(schema.entraide.id, id)).get() ?? null;
}

export async function getConversation(id: string) {
  const c = db.select().from(schema.conversations).where(eq(schema.conversations.id, id)).get();
  if (!c) return null;
  const u = await getCurrentUser();
  if (c.aId !== u.id && c.bId !== u.id) return null;
  const messages = db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, id))
    .orderBy(asc(schema.messages.at))
    .all();
  const otherId = c.aId === u.id ? c.bId : c.aId;
  const other = db.select().from(schema.users).where(eq(schema.users.id, otherId)).get();
  const entr = db.select().from(schema.entraide).where(eq(schema.entraide.id, c.entraideId)).get();
  return { ...c, messages, other: other ?? null, entraide: entr ?? null, me: u };
}

export async function listMyConversations() {
  const u = await getCurrentUser();
  const convs = db
    .select()
    .from(schema.conversations)
    .where(
      sql`${schema.conversations.aId} = ${u.id} OR ${schema.conversations.bId} = ${u.id}`,
    )
    .orderBy(desc(schema.conversations.createdAt))
    .all();
  return convs.map((c) => {
    const otherId = c.aId === u.id ? c.bId : c.aId;
    const other = db.select().from(schema.users).where(eq(schema.users.id, otherId)).get();
    const entr = db.select().from(schema.entraide).where(eq(schema.entraide.id, c.entraideId)).get();
    const last = db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, c.id))
      .orderBy(desc(schema.messages.at))
      .limit(1)
      .get();
    return { ...c, other: other ?? null, entraide: entr ?? null, lastMessage: last ?? null };
  });
}

// ─── Vie locale ──────────────────────────────────────────────────────
export async function listAgenda() {
  return db.select().from(schema.agendaItems).orderBy(asc(schema.agendaItems.iso)).all();
}

export async function listAnnonces() {
  return db.select().from(schema.annonces).orderBy(desc(schema.annonces.createdAt)).all();
}

export async function listAssociations() {
  return db.select().from(schema.associations).orderBy(asc(schema.associations.nom)).all();
}

export async function listCcm() {
  return db.select().from(schema.ccm).orderBy(desc(schema.ccm.date)).all();
}

export async function searchCcm(q: string) {
  const all = await listCcm();
  const needle = q.toLowerCase().trim();
  if (!needle) return all;
  return all.filter(
    (c) =>
      c.titre.toLowerCase().includes(needle) ||
      c.body.toLowerCase().includes(needle) ||
      (c.themes ?? "").toLowerCase().includes(needle),
  );
}

export async function listPetitesAnnonces() {
  const now = new Date();
  return db
    .select()
    .from(schema.petitesAnnonces)
    .where(gt(schema.petitesAnnonces.expiresAt, now))
    .orderBy(desc(schema.petitesAnnonces.createdAt))
    .all()
    .filter((a) => !a.closed);
}

// ─── Réservations ────────────────────────────────────────────────────
export async function listEquipements() {
  const items = db.select().from(schema.equipements).all();
  return items.map((eq) => {
    const next = db
      .select()
      .from(schema.reservations)
      .where(
        and(
          sql`${schema.reservations.equipementId} = ${eq.id}`,
          sql`${schema.reservations.statut} IN ('valide','en-attente')`,
        ),
      )
      .orderBy(asc(schema.reservations.startIso))
      .limit(1)
      .get();
    return { ...eq, nextReservation: next ?? null };
  });
}

export async function listReservationsForEquipement(equipementId: string) {
  return db
    .select()
    .from(schema.reservations)
    .where(eq(schema.reservations.equipementId, equipementId))
    .orderBy(asc(schema.reservations.startIso))
    .all();
}

// ─── Tableau de bord mairie ──────────────────────────────────────────
export async function pulse() {
  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const habitantsActifs = db
    .select({ c: sql<number>`count(distinct ${schema.auditLog.actorId})` })
    .from(schema.auditLog)
    .where(gt(schema.auditLog.at, monthAgo))
    .get()?.c ?? 0;
  const contribsSem = db
    .select({ c: sql<number>`count(*)` })
    .from(schema.contributions)
    .where(gt(schema.contributions.at, weekAgo))
    .get()?.c ?? 0;
  const ouverts = db
    .select({ c: sql<number>`count(*)` })
    .from(schema.signalements)
    .where(sql`${schema.signalements.etat} != 'resolu'`)
    .get()?.c ?? 0;
  const reservPending = db
    .select({ c: sql<number>`count(*)` })
    .from(schema.reservations)
    .where(eq(schema.reservations.statut, "en-attente"))
    .get()?.c ?? 0;
  return { habitantsActifs, contribsSem, ouverts, reservPending };
}

export async function listMairieAlerts() {
  // Alertes : signalements > 7 j sans suite + propositions seuil atteint + réservations en attente
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const sigs = db
    .select()
    .from(schema.signalements)
    .where(
      and(
        eq(schema.signalements.etat, "signale"),
        sql`${schema.signalements.createdAt} < ${Math.floor(sevenDaysAgo.getTime() / 1000)}`,
      ),
    )
    .all()
    .map((s) => ({
      id: `sig-${s.id}`,
      type: "signalement" as const,
      titre: s.titre,
      age: "> 7 j sans suite",
      priorite: "haute" as const,
      href: `/signalements/${s.id}`,
    }));

  const props = db
    .select()
    .from(schema.propositions)
    .where(eq(schema.propositions.statut, "reponse-mairie"))
    .all()
    .map((p) => ({
      id: `pro-${p.id}`,
      type: "proposition" as const,
      titre: `${p.titre} — réponse due`,
      age: p.reponseDate ?? "réponse due",
      priorite: "haute" as const,
      href: `/propositions/${p.id}`,
    }));

  const resvs = db
    .select()
    .from(schema.reservations)
    .where(eq(schema.reservations.statut, "en-attente"))
    .all();
  const resvAlert = resvs.length
    ? [
        {
          id: "resv-pending",
          type: "reservation" as const,
          titre: `${resvs.length} demande${resvs.length > 1 ? "s" : ""} de réservation à valider`,
          age: "à traiter",
          priorite: "normale" as const,
          href: "/mairie/reservations",
        },
      ]
    : [];

  return [...sigs, ...props, ...resvAlert];
}

export async function listAuditLog(limit = 50) {
  return db
    .select()
    .from(schema.auditLog)
    .orderBy(desc(schema.auditLog.at))
    .limit(limit)
    .all();
}

export async function listAllUsers() {
  return db.select().from(schema.users).where(sql`${schema.users.id} NOT LIKE 'seed-%' AND ${schema.users.id} NOT LIKE 'support-%'`).all();
}

export async function getCurrentUserPub() {
  const u = await getCurrentUser();
  return { id: u.id, name: u.name, role: u.role };
}

// ─── Notifications ───────────────────────────────────────────────────
export async function listMyNotifications(limit = 30) {
  const u = await getCurrentUser();
  return db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, u.id))
    .orderBy(desc(schema.notifications.at))
    .limit(limit)
    .all();
}

export async function countMyUnread() {
  const u = await getCurrentUser();
  return db
    .select({ c: sql<number>`count(*)` })
    .from(schema.notifications)
    .where(and(eq(schema.notifications.userId, u.id), isNull(schema.notifications.readAt)))
    .get()?.c ?? 0;
}

// ─── Modération ──────────────────────────────────────────────────────
export async function listOpenModerationFlags() {
  return db
    .select()
    .from(schema.moderationFlags)
    .where(eq(schema.moderationFlags.status, "ouvert"))
    .orderBy(desc(schema.moderationFlags.at))
    .all();
}

// ─── Email queue ─────────────────────────────────────────────────────
export async function listEmailQueue(limit = 50) {
  return db
    .select()
    .from(schema.emailQueue)
    .orderBy(desc(schema.emailQueue.createdAt))
    .limit(limit)
    .all();
}

// ─── SMS queue ───────────────────────────────────────────────────────
export async function listSmsQueue(limit = 50) {
  return db
    .select()
    .from(schema.smsQueue)
    .orderBy(desc(schema.smsQueue.createdAt))
    .limit(limit)
    .all();
}

// ─── Analytics locales ───────────────────────────────────────────────
/**
 * Stats locales tirées de l'audit_log. Pas un substitut à Plausible
 * (qui mesure sessions, trafic, rétention) — fournit juste des
 * chiffres bruts sur les actions citoyennes pour la vue mairie.
 */
export async function localStats(days = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000);
  const rows = db
    .select({
      action: schema.auditLog.action,
      entityType: schema.auditLog.entityType,
      c: sql<number>`count(*)`,
    })
    .from(schema.auditLog)
    .where(gt(schema.auditLog.at, cutoff))
    .groupBy(schema.auditLog.action, schema.auditLog.entityType)
    .all();
  const total = rows.reduce((s, r) => s + r.c, 0);
  const distinctUsers =
    db
      .select({ c: sql<number>`count(distinct ${schema.auditLog.actorId})` })
      .from(schema.auditLog)
      .where(gt(schema.auditLog.at, cutoff))
      .get()?.c ?? 0;
  return { rows, total, distinctUsers, days };
}

// ─── Error log ───────────────────────────────────────────────────────
export async function listErrors(limit = 80) {
  return db
    .select()
    .from(schema.errorLog)
    .orderBy(desc(schema.errorLog.at))
    .limit(limit)
    .all();
}

export async function countOpenErrors(sinceDays = 7) {
  const cutoff = new Date(Date.now() - sinceDays * 24 * 3600 * 1000);
  return (
    db
      .select({ c: sql<number>`count(*)` })
      .from(schema.errorLog)
      .where(and(eq(schema.errorLog.level, "error"), gt(schema.errorLog.at, cutoff)))
      .get()?.c ?? 0
  );
}
