/**
 * Catalogue des events d'analytique. Les noms sont stables (les renommer
 * casse l'historique). Tous les événements liés aux actions citoyennes
 * clés du cahier des charges, ce qui permet à la mairie de mesurer
 * l'usage réel par pôle :
 *
 *   - Pôle 1 Agora : idea-created, signal-emitted, support-toggled
 *   - Pôle 2 Bénévolat : mission-registered
 *   - Pôle 3 Signalements : signalement-created
 *   - Pôle 4 Entraide : conversation-opened, message-sent
 *   - Pôle 6 Réservation : reservation-requested
 *
 * Aucune PII n'est jamais émise (pas d'identifiant utilisateur, pas
 * d'email). Conformité RGPD garantie par construction côté Plausible.
 */
export const EVENTS = {
  ideaCreated: "idea-created",
  signalEmitted: "signal-emitted",
  supportToggled: "support-toggled",
  missionRegistered: "mission-registered",
  signalementCreated: "signalement-created",
  conversationOpened: "conversation-opened",
  messageSent: "message-sent",
  reservationRequested: "reservation-requested",
} as const;
