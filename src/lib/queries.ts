import "server-only";
import { and, asc, desc, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { db, schema } from "./db/client";
import { getCurrentUser } from "./auth";

// ─── Signalements ────────────────────────────────────────────────────
export async function listSignalements() {
  return await db
    .select()
    .from(schema.signalements)
    .orderBy(desc(schema.signalements.createdAt));
}

export async function getSignalement(id: string) {
  const s = (await db
    .select()
    .from(schema.signalements)
    .where(eq(schema.signalements.id, id)))[0];
  if (!s) return null;
  const history = await db
    .select()
    .from(schema.signalementHistory)
    .where(eq(schema.signalementHistory.signalementId, id))
    .orderBy(asc(schema.signalementHistory.at));
  return { ...s, history };
}

// ─── Suggestions ─────────────────────────────────────────────────────
export async function listSuggestions() {
  const items = await db
    .select()
    .from(schema.suggestions)
    .orderBy(desc(schema.suggestions.createdAt));
  const u = await getCurrentUser();
  return Promise.all(
    items.map(async (s) => {
      const counts = await db
        .select({
          type: schema.signalEmissions.type,
          c: sql<number>`count(*)::int`,
        })
        .from(schema.signalEmissions)
        .where(eq(schema.signalEmissions.suggestionId, s.id))
        .groupBy(schema.signalEmissions.type);
      const signaux = { vis: 0, important: 0, contribuer: 0 };
      for (const c of counts)
        signaux[c.type as keyof typeof signaux] = Number(c.c);
      const myEmissions = (
        await db
          .select({ type: schema.signalEmissions.type })
          .from(schema.signalEmissions)
          .where(
            and(
              eq(schema.signalEmissions.suggestionId, s.id),
              eq(schema.signalEmissions.userId, u.id),
            ),
          )
      ).map((r) => r.type);
      const sec =
        Math.floor(Date.now() / 1000) - Math.floor(s.createdAt.getTime() / 1000);
      const age =
        sec < 3600
          ? "à l'instant"
          : sec < 24 * 3600
            ? `${Math.floor(sec / 3600)} h`
            : sec < 30 * 24 * 3600
              ? `${Math.floor(sec / (24 * 3600))} j`
              : `${Math.floor(sec / (30 * 24 * 3600))} mois`;
      return { ...s, signaux, myEmissions, age };
    }),
  );
}

export async function getSuggestion(id: string) {
  const all = await listSuggestions();
  return all.find((s) => s.id === id) ?? null;
}

// ─── Discussions ─────────────────────────────────────────────────────
export async function listDiscussions() {
  const items = await db.select().from(schema.discussions);
  return Promise.all(
    items.map(async (d) => {
      const counts = await db
        .select({
          type: schema.contributions.type,
          c: sql<number>`count(*)::int`,
        })
        .from(schema.contributions)
        .where(eq(schema.contributions.discussionId, d.id))
        .groupBy(schema.contributions.type);
      const buckets = { accord: 0, nuance: 0, objection: 0, question: 0, factuel: 0 };
      let total = 0;
      for (const c of counts) {
        const n = Number(c.c);
        buckets[c.type as keyof typeof buckets] = n;
        total += n;
      }
      return { ...d, contribs: total, ...buckets };
    }),
  );
}

export async function getDiscussion(id: string) {
  const all = await listDiscussions();
  const d = all.find((x) => x.id === id);
  if (!d) return null;
  const list = await db
    .select()
    .from(schema.contributions)
    .where(eq(schema.contributions.discussionId, id))
    .orderBy(desc(schema.contributions.at));
  const synthesises = await db
    .select()
    .from(schema.synthesises)
    .where(eq(schema.synthesises.discussionId, id))
    .orderBy(desc(schema.synthesises.publishedAt));
  return { ...d, list, synthesises };
}

// ─── Propositions ────────────────────────────────────────────────────
export async function listPropositions() {
  const items = await db
    .select()
    .from(schema.propositions)
    .orderBy(desc(schema.propositions.createdAt));
  const u = await getCurrentUser();
  return Promise.all(
    items.map(async (p) => {
      const cnt = Number(
        (
          await db
            .select({ c: sql<number>`count(*)::int` })
            .from(schema.supports)
            .where(eq(schema.supports.propositionId, p.id))
        )[0]?.c ?? 0,
      );
      const supported =
        (
          await db
            .select()
            .from(schema.supports)
            .where(
              and(
                eq(schema.supports.propositionId, p.id),
                eq(schema.supports.userId, u.id),
              ),
            )
        ).length > 0;
      return { ...p, soutiens: cnt, supported };
    }),
  );
}

export async function getProposition(id: string) {
  const all = await listPropositions();
  return all.find((p) => p.id === id) ?? null;
}

// ─── Missions ────────────────────────────────────────────────────────
export async function listMissions() {
  const items = await db
    .select()
    .from(schema.missions)
    .orderBy(desc(schema.missions.createdAt));
  const u = await getCurrentUser();
  return Promise.all(
    items.map(async (m) => {
      const inscrits = Number(
        (
          await db
            .select({ c: sql<number>`count(*)::int` })
            .from(schema.missionRegistrations)
            .where(eq(schema.missionRegistrations.missionId, m.id))
        )[0]?.c ?? 0,
      );
      const registered =
        (
          await db
            .select()
            .from(schema.missionRegistrations)
            .where(
              and(
                eq(schema.missionRegistrations.missionId, m.id),
                eq(schema.missionRegistrations.userId, u.id),
              ),
            )
        ).length > 0;
      return { ...m, inscrits, registered };
    }),
  );
}

export async function getMission(id: string) {
  const all = await listMissions();
  return all.find((m) => m.id === id) ?? null;
}

// ─── Entraide / messagerie ───────────────────────────────────────────
export async function listEntraide() {
  return (
    await db
      .select()
      .from(schema.entraide)
      .orderBy(desc(schema.entraide.createdAt))
  ).filter((e) => !e.closed);
}

export async function getEntraide(id: string) {
  return (
    (
      await db.select().from(schema.entraide).where(eq(schema.entraide.id, id))
    )[0] ?? null
  );
}

export async function getConversation(id: string) {
  const c = (
    await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, id))
  )[0];
  if (!c) return null;
  const u = await getCurrentUser();
  if (c.aId !== u.id && c.bId !== u.id) return null;
  const messages = await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, id))
    .orderBy(asc(schema.messages.at));
  const otherId = c.aId === u.id ? c.bId : c.aId;
  const other = (
    await db.select().from(schema.users).where(eq(schema.users.id, otherId))
  )[0];
  const entr = (
    await db.select().from(schema.entraide).where(eq(schema.entraide.id, c.entraideId))
  )[0];
  return { ...c, messages, other: other ?? null, entraide: entr ?? null, me: u };
}

export async function listMyConversations() {
  const u = await getCurrentUser();
  const convs = await db
    .select()
    .from(schema.conversations)
    .where(
      sql`${schema.conversations.aId} = ${u.id} OR ${schema.conversations.bId} = ${u.id}`,
    )
    .orderBy(desc(schema.conversations.createdAt));
  return Promise.all(
    convs.map(async (c) => {
      const otherId = c.aId === u.id ? c.bId : c.aId;
      const other = (
        await db.select().from(schema.users).where(eq(schema.users.id, otherId))
      )[0];
      const entr = (
        await db.select().from(schema.entraide).where(eq(schema.entraide.id, c.entraideId))
      )[0];
      const last = (
        await db
          .select()
          .from(schema.messages)
          .where(eq(schema.messages.conversationId, c.id))
          .orderBy(desc(schema.messages.at))
          .limit(1)
      )[0];
      return {
        ...c,
        other: other ?? null,
        entraide: entr ?? null,
        lastMessage: last ?? null,
      };
    }),
  );
}

// ─── Vie locale ──────────────────────────────────────────────────────
export async function listAgenda() {
  return await db.select().from(schema.agendaItems).orderBy(asc(schema.agendaItems.iso));
}

export async function listAnnonces() {
  return await db
    .select()
    .from(schema.annonces)
    .orderBy(desc(schema.annonces.createdAt));
}

export async function listAssociations() {
  return await db
    .select()
    .from(schema.associations)
    .orderBy(asc(schema.associations.nom));
}

export async function listCcm() {
  return await db.select().from(schema.ccm).orderBy(desc(schema.ccm.date));
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
  return (
    await db
      .select()
      .from(schema.petitesAnnonces)
      .where(gt(schema.petitesAnnonces.expiresAt, new Date()))
      .orderBy(desc(schema.petitesAnnonces.createdAt))
  ).filter((a) => !a.closed);
}

// ─── Réservations ────────────────────────────────────────────────────
export async function listEquipements() {
  const items = await db.select().from(schema.equipements);
  return Promise.all(
    items.map(async (eq2) => {
      const next = (
        await db
          .select()
          .from(schema.reservations)
          .where(
            and(
              eq(schema.reservations.equipementId, eq2.id),
              sql`${schema.reservations.statut} IN ('valide','en-attente')`,
            ),
          )
          .orderBy(asc(schema.reservations.startIso))
          .limit(1)
      )[0];
      return { ...eq2, nextReservation: next ?? null };
    }),
  );
}

export async function listReservationsForEquipement(equipementId: string) {
  return await db
    .select()
    .from(schema.reservations)
    .where(eq(schema.reservations.equipementId, equipementId))
    .orderBy(asc(schema.reservations.startIso));
}

// ─── Tableau de bord mairie ──────────────────────────────────────────
export async function pulse() {
  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const habitantsActifs = Number(
    (
      await db
        .select({
          c: sql<number>`count(distinct ${schema.auditLog.actorId})::int`,
        })
        .from(schema.auditLog)
        .where(gt(schema.auditLog.at, monthAgo))
    )[0]?.c ?? 0,
  );
  const contribsSem = Number(
    (
      await db
        .select({ c: sql<number>`count(*)::int` })
        .from(schema.contributions)
        .where(gt(schema.contributions.at, weekAgo))
    )[0]?.c ?? 0,
  );
  const ouverts = Number(
    (
      await db
        .select({ c: sql<number>`count(*)::int` })
        .from(schema.signalements)
        .where(sql`${schema.signalements.etat} != 'resolu'`)
    )[0]?.c ?? 0,
  );
  const reservPending = Number(
    (
      await db
        .select({ c: sql<number>`count(*)::int` })
        .from(schema.reservations)
        .where(eq(schema.reservations.statut, "en-attente"))
    )[0]?.c ?? 0,
  );
  return { habitantsActifs, contribsSem, ouverts, reservPending };
}

export async function listMairieAlerts() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const sigs = (
    await db
      .select()
      .from(schema.signalements)
      .where(
        and(
          eq(schema.signalements.etat, "signale"),
          lt(schema.signalements.createdAt, sevenDaysAgo),
        ),
      )
  ).map((s) => ({
    id: `sig-${s.id}`,
    type: "signalement" as const,
    titre: s.titre,
    age: "> 7 j sans suite",
    priorite: "haute" as const,
    href: `/signalements/${s.id}`,
  }));

  const props = (
    await db
      .select()
      .from(schema.propositions)
      .where(eq(schema.propositions.statut, "reponse-mairie"))
  ).map((p) => ({
    id: `pro-${p.id}`,
    type: "proposition" as const,
    titre: `${p.titre} — réponse due`,
    age: p.reponseDate ?? "réponse due",
    priorite: "haute" as const,
    href: `/propositions/${p.id}`,
  }));

  const resvs = await db
    .select()
    .from(schema.reservations)
    .where(eq(schema.reservations.statut, "en-attente"));
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
  return await db
    .select()
    .from(schema.auditLog)
    .orderBy(desc(schema.auditLog.at))
    .limit(limit);
}

export async function listAllUsers() {
  return await db
    .select()
    .from(schema.users)
    .where(
      sql`${schema.users.id} NOT LIKE 'seed-%' AND ${schema.users.id} NOT LIKE 'support-%'`,
    );
}

export async function getCurrentUserPub() {
  const u = await getCurrentUser();
  return { id: u.id, name: u.name, role: u.role };
}

// ─── Notifications ───────────────────────────────────────────────────
export async function listMyNotifications(limit = 30) {
  const u = await getCurrentUser();
  return await db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, u.id))
    .orderBy(desc(schema.notifications.at))
    .limit(limit);
}

export async function countMyUnread() {
  const u = await getCurrentUser();
  return Number(
    (
      await db
        .select({ c: sql<number>`count(*)::int` })
        .from(schema.notifications)
        .where(
          and(eq(schema.notifications.userId, u.id), isNull(schema.notifications.readAt)),
        )
    )[0]?.c ?? 0,
  );
}

// ─── Modération ──────────────────────────────────────────────────────
export async function listOpenModerationFlags() {
  return await db
    .select()
    .from(schema.moderationFlags)
    .where(eq(schema.moderationFlags.status, "ouvert"))
    .orderBy(desc(schema.moderationFlags.at));
}

// ─── Email queue ─────────────────────────────────────────────────────
export async function listEmailQueue(limit = 50) {
  return await db
    .select()
    .from(schema.emailQueue)
    .orderBy(desc(schema.emailQueue.createdAt))
    .limit(limit);
}

// ─── SMS queue ───────────────────────────────────────────────────────
export async function listSmsQueue(limit = 50) {
  return await db
    .select()
    .from(schema.smsQueue)
    .orderBy(desc(schema.smsQueue.createdAt))
    .limit(limit);
}

// ─── Analytics locales ───────────────────────────────────────────────
export async function localStats(days = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000);
  const rows = await db
    .select({
      action: schema.auditLog.action,
      entityType: schema.auditLog.entityType,
      c: sql<number>`count(*)::int`,
    })
    .from(schema.auditLog)
    .where(gt(schema.auditLog.at, cutoff))
    .groupBy(schema.auditLog.action, schema.auditLog.entityType);
  const total = rows.reduce((s, r) => s + Number(r.c), 0);
  const distinctUsers = Number(
    (
      await db
        .select({
          c: sql<number>`count(distinct ${schema.auditLog.actorId})::int`,
        })
        .from(schema.auditLog)
        .where(gt(schema.auditLog.at, cutoff))
    )[0]?.c ?? 0,
  );
  return {
    rows: rows.map((r) => ({ ...r, c: Number(r.c) })),
    total,
    distinctUsers,
    days,
  };
}

// ─── Error log ───────────────────────────────────────────────────────
export async function listErrors(limit = 80) {
  return await db
    .select()
    .from(schema.errorLog)
    .orderBy(desc(schema.errorLog.at))
    .limit(limit);
}

export async function countOpenErrors(sinceDays = 7) {
  const cutoff = new Date(Date.now() - sinceDays * 24 * 3600 * 1000);
  return Number(
    (
      await db
        .select({ c: sql<number>`count(*)::int` })
        .from(schema.errorLog)
        .where(
          and(eq(schema.errorLog.level, "error"), gt(schema.errorLog.at, cutoff)),
        )
    )[0]?.c ?? 0,
  );
}
