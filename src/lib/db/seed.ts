import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";
import bcrypt from "bcryptjs";
import { db, schema } from "./client";

async function main() {
  await migrate(db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });

  // Mot de passe partagé pour les profils démo (à régénérer en prod).
  const SEED_PWD_HASH = bcrypt.hashSync("trizac", 10);

  // Idempotent : on vide les tables avant d'insérer.
  // L'ordre respecte les contraintes de clés étrangères.
  const TABLES = [
    schema.errorLog,
    schema.auditLog,
    schema.notifications,
    schema.moderationFlags,
    schema.synthesises,
    schema.reservations,
    schema.equipements,
    schema.petitesAnnonces,
    schema.ccm,
    schema.associations,
    schema.agendaItems,
    schema.annonces,
    schema.messages,
    schema.conversations,
    schema.entraide,
    schema.missionRegistrations,
    schema.missions,
    schema.supports,
    schema.propositions,
    schema.contributions,
    schema.discussions,
    schema.signalEmissions,
    schema.suggestions,
    schema.signalementHistory,
    schema.signalements,
    schema.consents,
    schema.magicTokens,
    schema.sessions,
    schema.emailQueue,
    schema.smsQueue,
    schema.users,
  ];
  for (const t of TABLES) await db.delete(t);

  // ── Users ──────────────────────────────────────────────────────────
  const seedUsers = [
    { id: "u1", email: "camille@trizac.fr", name: "Camille Vidal", role: "habitant" as const },
    { id: "u2", email: "jean@trizac.fr", name: "Jean Marin", role: "habitant" as const },
    { id: "u3", email: "marie@trizac.fr", name: "Marie Dupont", role: "habitant" as const },
    { id: "u4", email: "paul@trizac.fr", name: "Paul Roux", role: "habitant" as const },
    { id: "u5", email: "sophie@trizac.fr", name: "Sophie Lemaire", role: "habitant" as const },
    { id: "u6", email: "helene@trizac.fr", name: "Hélène Pinson", role: "habitant" as const },
    { id: "u7", email: "antoine@trizac.fr", name: "Antoine Faure", role: "habitant" as const },
    { id: "u8", email: "mireille@trizac.fr", name: "Mireille Thévenin", role: "habitant" as const },
    { id: "u9", email: "yvette@trizac.fr", name: "Yvette Granger", role: "habitant" as const },
    { id: "u10", email: "romain@trizac.fr", name: "Romain Boudet", role: "habitant" as const },
    { id: "u11", email: "nicole@trizac.fr", name: "Nicole Faure", role: "habitant" as const },
    { id: "u12", email: "lucas@trizac.fr", name: "Lucas Demeure", role: "habitant" as const },
    { id: "agent1", email: "voirie@trizac.fr", name: "Agent voirie", role: "agent" as const },
    { id: "ref1", email: "comite@trizac.fr", name: "Comité des fêtes", role: "referent" as const },
    { id: "maire", email: "maire@trizac.fr", name: "Maire de Trizac", role: "maire" as const },
  ];
  const SEED_PHONES: Record<string, string> = { u1: "+33611223344" };

  await db.insert(schema.users).values(
    seedUsers.map((u) => ({
      ...u,
      passwordHash: SEED_PWD_HASH,
      emailVerifiedAt: new Date(),
      phone: SEED_PHONES[u.id] ?? null,
    })),
  );

  await db.insert(schema.consents).values({
    userId: "u1",
    finality: "sms",
    granted: true,
    updatedAt: new Date(),
  });

  // ── Pôle 3 : Signalements ──────────────────────────────────────────
  await db.insert(schema.signalements).values([
    { id: "s1", type: "Voirie", titre: "Nid-de-poule rue du Lavoir", auteurId: "u2", auteur: "Jean M.", etat: "en-cours", loc: "Rue du Lavoir", lat: 45.224, lng: 2.464, icon: "MapPin" },
    { id: "s2", type: "Éclairage", titre: "Lampadaire éteint place de l'Église", auteurId: "u3", auteur: "Marie D.", etat: "pris-en-compte", loc: "Pl. de l'Église", lat: 45.2253, lng: 2.465, icon: "Lightbulb" },
    { id: "s3", type: "Espaces verts", titre: "Branche cassée parc du Calvaire", auteurId: "u4", auteur: "Paul R.", etat: "resolu", loc: "Parc du Calvaire", lat: 45.2225, lng: 2.4612, icon: "TreeDeciduous" },
    { id: "s4", type: "Propreté", titre: "Dépôt sauvage chemin des Vignes", auteurId: "u5", auteur: "Sophie L.", etat: "signale", loc: "Chemin des Vignes", lat: 45.2208, lng: 2.4685, icon: "Trash2" },
  ]);

  await db.insert(schema.signalementHistory).values([
    { signalementId: "s1", etat: "signale" },
    { signalementId: "s1", etat: "pris-en-compte", agentId: "agent1", comment: "Service voirie informé." },
    { signalementId: "s1", etat: "en-cours", agentId: "agent1", comment: "Intervention prévue cette semaine." },
    { signalementId: "s2", etat: "signale" },
    { signalementId: "s2", etat: "pris-en-compte", agentId: "agent1" },
    { signalementId: "s3", etat: "signale" },
    { signalementId: "s3", etat: "pris-en-compte", agentId: "agent1" },
    { signalementId: "s3", etat: "en-cours", agentId: "agent1" },
    { signalementId: "s3", etat: "resolu", agentId: "agent1", comment: "Branche enlevée par les services." },
    { signalementId: "s4", etat: "signale" },
  ]);

  // ── Pôle 1 : Agora ─────────────────────────────────────────────────
  await db.insert(schema.suggestions).values([
    { id: "idx1", titre: "Créer un verger partagé près de l'école", auteurId: "u6", auteur: "Hélène P.", cat: "Environnement", contributions: 7 },
    { id: "idx2", titre: "Marché de producteurs le samedi matin", auteurId: "u7", auteur: "Antoine F.", cat: "Vie locale", contributions: 15, mature: true },
    { id: "idx3", titre: "Banc supplémentaire square Émilie-Boisson", auteurId: "u8", auteur: "Mireille T.", cat: "Cadre de vie", contributions: 2 },
  ]);

  // Signaux qualifiés — utilisateurs synthétiques
  const sigData: Array<readonly [string, "vis" | "important" | "contribuer", number]> = [
    ["idx1", "vis", 8], ["idx1", "important", 14], ["idx1", "contribuer", 5],
    ["idx2", "vis", 22], ["idx2", "important", 31], ["idx2", "contribuer", 9],
    ["idx3", "vis", 4], ["idx3", "important", 7], ["idx3", "contribuer", 1],
  ];
  for (const [sugId, type, count] of sigData) {
    const synthUsers = Array.from({ length: count }, (_, i) => ({
      id: `seed-${sugId}-${type}-${i}`,
      email: `seed-${sugId}-${type}-${i}@seed.local`,
      name: `Habitant ${i}`,
    }));
    await db.insert(schema.users).values(synthUsers).onConflictDoNothing();
    await db.insert(schema.signalEmissions).values(
      synthUsers.map((u) => ({ userId: u.id, suggestionId: sugId, type })),
    );
  }

  await db.insert(schema.discussions).values([
    { id: "d1", titre: "Aménagement de la place Saint-Pierre", anim: "Mireille T. + 1", derniereSynth: "15 avril", mature: true },
    { id: "d2", titre: "Quel avenir pour l'ancien presbytère ?", anim: "Mairie" },
  ]);

  const contribCounts: Record<string, [number, number, number, number]> = {
    d1: [12, 6, 3, 2],
    d2: [4, 3, 1, 1],
  };
  for (const [discId, [acc, nuance, obj, q]] of Object.entries(contribCounts)) {
    const rows: typeof schema.contributions.$inferInsert[] = [];
    for (let i = 0; i < acc; i++) rows.push({ discussionId: discId, type: "accord", texte: `Contribution accord #${i + 1}`, auteurId: "u2", auteur: "Habitant" });
    for (let i = 0; i < nuance; i++) rows.push({ discussionId: discId, type: "nuance", texte: `Contribution nuance #${i + 1}`, auteurId: "u3", auteur: "Habitant" });
    for (let i = 0; i < obj; i++) rows.push({ discussionId: discId, type: "objection", texte: `Contribution objection #${i + 1}`, auteurId: "u4", auteur: "Habitant" });
    for (let i = 0; i < q; i++) rows.push({ discussionId: discId, type: "question", texte: `Contribution question #${i + 1}`, auteurId: "u5", auteur: "Habitant" });
    if (rows.length) await db.insert(schema.contributions).values(rows);
  }

  await db.insert(schema.propositions).values([
    { id: "p1", titre: "Marché de producteurs hebdomadaire", proposition: "Mettre en place un marché de producteurs le samedi matin sur la place de l'Église.", constat: "Les habitants n'ont pas accès facilement à des produits locaux.", justification: "Soutenir les producteurs du Cantal et créer un rendez-vous hebdomadaire de proximité.", vigilance: "Coordonner avec la voirie pour le stationnement des camions.", seuil: 100, joursRestants: 14, statut: "soutien" },
    { id: "p2", titre: "Plan vélo communal 2026-2028", proposition: "Aménager un réseau cyclable continu reliant le bourg aux hameaux principaux.", constat: "Les déplacements à vélo sont actuellement dangereux sur la départementale.", justification: "Conformité avec les objectifs régionaux mobilités douces et enjeux climat.", vigilance: "Budget pluri-annuel à arbitrer en conseil municipal.", seuil: 100, joursRestants: 0, statut: "reponse-mairie", reponseDate: "sous 60 j" },
  ]);

  // Soutiens fictifs (87 sur p1, 142 sur p2)
  for (const [propId, count] of [["p1", 87], ["p2", 142]] as const) {
    const synthUsers = Array.from({ length: count }, (_, i) => ({
      id: `support-${propId}-${i}`,
      email: `support-${propId}-${i}@seed.local`,
      name: `Soutien ${i}`,
    }));
    await db.insert(schema.users).values(synthUsers).onConflictDoNothing();
    await db.insert(schema.supports).values(synthUsers.map((u) => ({ userId: u.id, propositionId: propId })));
  }

  // ── Pôle 2 : Missions ──────────────────────────────────────────────
  await db.insert(schema.missions).values([
    { id: "m1", titre: "Préparation marché de Noël", cat: "Événements", date: "sam. 6 déc.", duree: "4 h", lieu: "Salle des fêtes", besoin: 8, ref: "Comité des fêtes", refUserId: "ref1" },
    { id: "m2", titre: "Visite à Mme Boucherie", cat: "Aînés", date: "mer. 5 nov.", duree: "1 h", lieu: "Domicile, Rue Haute", besoin: 1, ref: "CCAS" },
    { id: "m3", titre: "Nettoyage sentier des Buronniers", cat: "Espaces", date: "dim. 23 nov.", duree: "3 h", lieu: "Départ mairie", besoin: 12, ref: "Mairie" },
    { id: "m4", titre: "Aide aux devoirs école primaire", cat: "Périscolaire", date: "récurrent", duree: "1 h / sem.", lieu: "École", besoin: 4, ref: "Sou des écoles" },
  ]);

  const insc: ReadonlyArray<readonly [string, string]> = [
    ["u2", "m1"], ["u3", "m1"], ["u4", "m1"], ["u5", "m1"], ["u6", "m1"],
    ["u3", "m3"], ["u4", "m3"], ["u5", "m3"], ["u7", "m3"], ["u8", "m3"], ["u10", "m3"], ["u11", "m3"], ["u12", "m3"],
    ["u8", "m4"], ["u9", "m4"],
  ];
  await db.insert(schema.missionRegistrations).values(insc.map(([u, m]) => ({ userId: u, missionId: m })));

  // ── Pôle 4 : Entraide ──────────────────────────────────────────────
  await db.insert(schema.entraide).values([
    { id: "e1", type: "demande", titre: "Courses pour samedi", auteurId: "u9", auteur: "Yvette G.", age: "78 ans", quartier: "Bourg", date: "samedi matin", description: "Je ne peux plus porter lourd, j'aurais besoin d'aide pour 2 sacs de courses." },
    { id: "e2", type: "offre", titre: "Prêt remorque + voiture", auteurId: "u10", auteur: "Romain B.", quartier: "La Salesse", date: "week-ends", description: "Je peux prêter ma remorque ou aller en déchèterie pour les voisins." },
    { id: "e3", type: "demande", titre: "Covoiturage RDV Aurillac", auteurId: "u11", auteur: "Nicole F.", quartier: "Le Veysset", date: "jeudi 13 nov. 14h", description: "Rendez-vous médical, je peux participer aux frais." },
    { id: "e4", type: "offre", titre: "Aide démarches numériques", auteurId: "u12", auteur: "Lucas D.", quartier: "Bourg", date: "sur rendez-vous", description: "Étudiant, je peux aider pour impôts, ameli, France Connect, etc." },
  ]);

  // ── Pôle 5 : Vie locale ────────────────────────────────────────────
  await db.insert(schema.annonces).values([
    { id: "an1", titre: "Travaux rue de la Vialette", date: "28 oct. 2026", resume: "Réfection de la chaussée du 4 au 18 novembre. Circulation alternée.", body: "Détail complet des travaux et déviations…" },
    { id: "an2", titre: "Fermeture mairie 1er novembre", date: "24 oct. 2026", resume: "La mairie sera fermée le 1er novembre. Permanence d'urgence au 04 71 …" },
  ]);

  await db.insert(schema.agendaItems).values([
    { id: "a1", date: "5 nov.", jour: "mer", iso: "2026-11-05", titre: "Conseil municipal", heure: "20h00", lieu: "Mairie", type: "officiel" },
    { id: "a2", date: "8 nov.", jour: "sam", iso: "2026-11-08", titre: "Loto du foot", heure: "20h30", lieu: "Salle des fêtes", type: "asso" },
    { id: "a3", date: "11 nov.", jour: "mar", iso: "2026-11-11", titre: "Cérémonie du 11 novembre", heure: "11h00", lieu: "Monument aux morts", type: "officiel" },
    { id: "a4", date: "23 nov.", jour: "dim", iso: "2026-11-23", titre: "Nettoyage sentier des Buronniers", heure: "9h00", lieu: "Mairie", type: "benevolat" },
    { id: "a5", date: "6 déc.", jour: "sam", iso: "2026-12-06", titre: "Marché de Noël", heure: "14h-19h", lieu: "Place de l'Église", type: "asso" },
    { id: "a6", date: "13 déc.", jour: "dim", iso: "2026-12-13", titre: "Vide-greniers", heure: "9h-17h", lieu: "Salle des fêtes", type: "asso" },
    { id: "a7", date: "20 déc.", jour: "dim", iso: "2026-12-20", titre: "Concert chorale du Cantal", heure: "17h", lieu: "Église", type: "asso" },
  ]);

  await db.insert(schema.associations).values([
    { id: "as1", nom: "Comité des fêtes", description: "Animation des temps forts du village.", contact: "comite@trizac.fr", membres: "24 membres" },
    { id: "as2", nom: "Sou des écoles", description: "Soutien aux activités de l'école primaire.", contact: "sou@trizac.fr", membres: "18 membres" },
    { id: "as3", nom: "Amis du Patrimoine", description: "Préservation et valorisation du patrimoine bâti.", contact: "patrimoine@trizac.fr", membres: "32 membres" },
    { id: "as4", nom: "Foot Trizac", description: "Club de football communal.", contact: "foot@trizac.fr", membres: "47 licenciés" },
  ]);

  await db.insert(schema.ccm).values([
    { id: "ccm-2026-10", date: "2026-10-15", titre: "Conseil municipal d'octobre 2026", body: "Délibérations sur le budget supplémentaire, l'aménagement de la place Saint-Pierre, validation du plan vélo communal soumis par les habitants. Point sur les travaux rue de la Vialette.", themes: "budget,voirie,mobilité,proposition citoyenne" },
    { id: "ccm-2026-09", date: "2026-09-10", titre: "Conseil municipal de septembre 2026", body: "Vote du soutien aux associations 2026-2027. Point d'information sur l'école et les services périscolaires. Décision concernant la salle des fêtes.", themes: "associations,école,équipements" },
    { id: "ccm-2026-07", date: "2026-07-04", titre: "Conseil municipal de juillet 2026", body: "Point d'étape mi-année. Recrutement de l'agent voirie. Validation des fêtes communales 14 juillet et 15 août.", themes: "RH,événements" },
  ]);

  const monthMs = 30 * 24 * 3600 * 1000;
  const expiresAt = new Date(Date.now() + monthMs);
  await db.insert(schema.petitesAnnonces).values([
    { id: "pa1", type: "don", cat: "Mobilier", titre: "Canapé 3 places", description: "Bon état général, tissu beige. À récupérer sur place ce week-end.", auteurId: "u3", auteur: "Marie D.", expiresAt },
    { id: "pa2", type: "pret", cat: "Outils", titre: "Décolleuse à papier peint", description: "Disponible le week-end, contre une bouteille de vin.", auteurId: "u10", auteur: "Romain B.", expiresAt },
    { id: "pa3", type: "echange", cat: "Jardin", titre: "Pommes contre œufs", description: "Mes pommes contre vos œufs frais, à voir au cas par cas.", auteurId: "u6", auteur: "Hélène P.", expiresAt },
  ]);

  // ── Pôle 6 : Réservations ──────────────────────────────────────────
  await db.insert(schema.equipements).values([
    { id: "eq1", nom: "Salle des fêtes", capacite: "120 pers.", tarif: "80 €/jour habitants", description: "Salle principale du village, équipée cuisine + sono." },
    { id: "eq2", nom: "Salle associative", capacite: "30 pers.", tarif: "Gratuit asso. locales", description: "Salle de réunion, mobilier modulable." },
    { id: "eq3", nom: "Pack tables + chaises", capacite: "8 tables, 60 chaises", tarif: "Caution 100 €", description: "À retirer en mairie." },
    { id: "eq4", nom: "Sono mobile", capacite: "300 W", tarif: "Caution 200 €", description: "Caisson amplifié + 2 micros HF." },
  ]);

  await db.insert(schema.reservations).values([
    { id: "r1", equipementId: "eq1", userId: "u3", userName: "Marie D.", startIso: "2026-11-15", endIso: "2026-11-15", motif: "Anniversaire de famille", statut: "valide" },
    { id: "r2", equipementId: "eq4", userId: "u10", userName: "Romain B.", startIso: "2026-11-04", endIso: "2026-11-08", motif: "Loto du foot", statut: "valide" },
    { id: "r3", equipementId: "eq1", userId: "u7", userName: "Antoine F.", startIso: "2026-12-12", endIso: "2026-12-12", motif: "Repas associatif", statut: "en-attente" },
  ]);

  console.log("✓ seed completed");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
