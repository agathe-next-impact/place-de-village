// Données fictives — référence pour la structure d'API GraphQL à terme.
// Cf. data.jsx du paquet design-handoff.

export type SignalementEtat =
  | "signale"
  | "pris-en-compte"
  | "en-cours"
  | "resolu";

export type Signalement = {
  id: string;
  type: string;
  titre: string;
  auteur: string;
  etat: SignalementEtat;
  date: string;
  loc: string;
  icon: string;
};

export type Suggestion = {
  id: string;
  titre: string;
  auteur: string;
  cat: string;
  signaux: { vis: number; important: number; contribuer: number };
  contributions: number;
  age: string;
  mature?: boolean;
};

export type Discussion = {
  id: string;
  titre: string;
  anim: string;
  contribs: number;
  accord: number;
  nuance: number;
  objection: number;
  question: number;
  derniereSynth: string | null;
  mature?: boolean;
};

export type Proposition = {
  id: string;
  titre: string;
  soutiens: number;
  seuil: number;
  jours: number;
  statut: "soutien" | "reponse-mairie";
  reponseDate?: string;
};

export type Mission = {
  id: string;
  titre: string;
  cat: string;
  date: string;
  duree: string;
  lieu: string;
  besoin: number;
  inscrits: number;
  ref: string;
};

export type Entraide = {
  id: string;
  type: "demande" | "offre";
  titre: string;
  auteur: string;
  age?: string;
  quartier: string;
  date: string;
  desc: string;
};

export type AgendaItem = {
  id: string;
  date: string;
  jour: string;
  titre: string;
  heure: string;
  lieu: string;
  type: "officiel" | "asso" | "benevolat";
};

export type Annonce = { id: string; titre: string; date: string; resume: string };

export type Equipement = {
  id: string;
  nom: string;
  capacite: string;
  tarif: string;
  dispo: string;
};

export type MairieAlert = {
  id: string;
  type: "signalement" | "proposition" | "reservation" | "asso";
  titre: string;
  age: string;
  priorite: "haute" | "normale";
};

export const TRIZAC_DATA = {
  user: { name: "Camille Vidal", heuresBenevolat: 12, missionsTerminees: 4 },
  signalements: [
    { id: "s1", type: "Voirie", titre: "Nid-de-poule rue du Lavoir", auteur: "Jean M.", etat: "en-cours", date: "il y a 2 j", loc: "Rue du Lavoir", icon: "MapPin" },
    { id: "s2", type: "Éclairage", titre: "Lampadaire éteint place de l'Église", auteur: "Marie D.", etat: "pris-en-compte", date: "il y a 3 j", loc: "Pl. de l'Église", icon: "Lightbulb" },
    { id: "s3", type: "Espaces verts", titre: "Branche cassée parc du Calvaire", auteur: "Paul R.", etat: "resolu", date: "résolu hier", loc: "Parc du Calvaire", icon: "TreeDeciduous" },
    { id: "s4", type: "Propreté", titre: "Dépôt sauvage chemin des Vignes", auteur: "Sophie L.", etat: "signale", date: "aujourd'hui", loc: "Chemin des Vignes", icon: "Trash2" },
  ] satisfies Signalement[],
  suggestions: [
    { id: "idx1", titre: "Créer un verger partagé près de l'école", auteur: "Hélène P.", cat: "Environnement", signaux: { vis: 8, important: 14, contribuer: 5 }, contributions: 7, age: "12 j" },
    { id: "idx2", titre: "Marché de producteurs le samedi matin", auteur: "Antoine F.", cat: "Vie locale", signaux: { vis: 22, important: 31, contribuer: 9 }, contributions: 15, age: "1 mois", mature: true },
    { id: "idx3", titre: "Banc supplémentaire square Émilie-Boisson", auteur: "Mireille T.", cat: "Cadre de vie", signaux: { vis: 4, important: 7, contribuer: 1 }, contributions: 2, age: "3 j" },
  ] satisfies Suggestion[],
  discussions: [
    { id: "d1", titre: "Aménagement de la place Saint-Pierre", anim: "Mireille T. + 1", contribs: 23, accord: 12, nuance: 6, objection: 3, question: 2, derniereSynth: "15 avril", mature: true },
    { id: "d2", titre: "Quel avenir pour l'ancien presbytère ?", anim: "Mairie", contribs: 9, accord: 4, nuance: 3, objection: 1, question: 1, derniereSynth: null },
  ] satisfies Discussion[],
  propositions: [
    { id: "p1", titre: "Marché de producteurs hebdomadaire", soutiens: 87, seuil: 100, jours: 14, statut: "soutien" },
    { id: "p2", titre: "Plan vélo communal 2026-2028", soutiens: 142, seuil: 100, jours: 0, statut: "reponse-mairie", reponseDate: "sous 60 j" },
  ] satisfies Proposition[],
  missions: [
    { id: "m1", titre: "Préparation marché de Noël", cat: "Événements", date: "sam. 6 déc.", duree: "4 h", lieu: "Salle des fêtes", besoin: 8, inscrits: 5, ref: "Comité des fêtes" },
    { id: "m2", titre: "Visite à Mme Boucherie", cat: "Aînés", date: "mer. 5 nov.", duree: "1 h", lieu: "Domicile, Rue Haute", besoin: 1, inscrits: 0, ref: "CCAS" },
    { id: "m3", titre: "Nettoyage sentier des Buronniers", cat: "Espaces", date: "dim. 23 nov.", duree: "3 h", lieu: "Départ mairie", besoin: 12, inscrits: 8, ref: "Mairie" },
    { id: "m4", titre: "Aide aux devoirs école primaire", cat: "Périscolaire", date: "récurrent", duree: "1 h / sem.", lieu: "École", besoin: 4, inscrits: 2, ref: "Sou des écoles" },
  ] satisfies Mission[],
  entraide: [
    { id: "e1", type: "demande", titre: "Courses pour samedi", auteur: "Yvette G.", age: "78 ans", quartier: "Bourg", date: "samedi matin", desc: "Je ne peux plus porter lourd, j'aurais besoin d'aide pour 2 sacs de courses." },
    { id: "e2", type: "offre", titre: "Prêt remorque + voiture", auteur: "Romain B.", quartier: "La Salesse", date: "week-ends", desc: "Je peux prêter ma remorque ou aller en déchèterie pour les voisins." },
    { id: "e3", type: "demande", titre: "Covoiturage RDV Aurillac", auteur: "Nicole F.", quartier: "Le Veysset", date: "jeudi 13 nov. 14h", desc: "Rendez-vous médical, je peux participer aux frais." },
    { id: "e4", type: "offre", titre: "Aide démarches numériques", auteur: "Lucas D.", quartier: "Bourg", date: "sur rendez-vous", desc: "Étudiant, je peux aider pour impôts, ameli, France Connect, etc." },
  ] satisfies Entraide[],
  agenda: [
    { id: "a1", date: "5 nov.", jour: "mer", titre: "Conseil municipal", heure: "20h00", lieu: "Mairie", type: "officiel" },
    { id: "a2", date: "8 nov.", jour: "sam", titre: "Loto du foot", heure: "20h30", lieu: "Salle des fêtes", type: "asso" },
    { id: "a3", date: "11 nov.", jour: "mar", titre: "Cérémonie du 11 novembre", heure: "11h00", lieu: "Monument aux morts", type: "officiel" },
    { id: "a4", date: "23 nov.", jour: "dim", titre: "Nettoyage sentier des Buronniers", heure: "9h00", lieu: "Mairie", type: "benevolat" },
    { id: "a5", date: "6 déc.", jour: "sam", titre: "Marché de Noël", heure: "14h-19h", lieu: "Place de l'Église", type: "asso" },
  ] satisfies AgendaItem[],
  annonces: [
    { id: "an1", titre: "Travaux rue de la Vialette", date: "28 oct. 2026", resume: "Réfection de la chaussée du 4 au 18 novembre. Circulation alternée." },
    { id: "an2", titre: "Fermeture mairie 1er novembre", date: "24 oct. 2026", resume: "La mairie sera fermée le 1er novembre. Permanence d'urgence au 04 71 …" },
  ] satisfies Annonce[],
  equipements: [
    { id: "eq1", nom: "Salle des fêtes", capacite: "120 pers.", tarif: "80 €/jour habitants", dispo: "Prochaine dispo : 15 nov." },
    { id: "eq2", nom: "Salle associative", capacite: "30 pers.", tarif: "Gratuit asso. locales", dispo: "Dispo ce week-end" },
    { id: "eq3", nom: "Pack tables + chaises", capacite: "8 tables, 60 chaises", tarif: "Caution 100 €", dispo: "Dispo" },
    { id: "eq4", nom: "Sono mobile", capacite: "300 W", tarif: "Caution 200 €", dispo: "Réservé jusqu'au 8 nov." },
  ] satisfies Equipement[],
  mairieAlerts: [
    { id: "al1", type: "signalement", titre: "Nid-de-poule rue du Lavoir", age: "> 7 j sans suite", priorite: "haute" },
    { id: "al2", type: "proposition", titre: "Plan vélo communal — réponse due", age: "d'ici 60 j", priorite: "haute" },
    { id: "al3", type: "reservation", titre: "3 demandes de réservation à valider", age: "aujourd'hui", priorite: "normale" },
    { id: "al4", type: "asso", titre: "« Vélo Loisirs Trizac » — inscription", age: "hier", priorite: "normale" },
  ] satisfies MairieAlert[],
};
