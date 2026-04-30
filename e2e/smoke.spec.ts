import { expect, test } from "@playwright/test";

const ROUTES = [
  { path: "/", expect: "Bonjour" },
  { path: "/signalements", expect: "Signalements" },
  { path: "/signalements?view=map", expect: "IGN" },
  { path: "/signaler", expect: "Étape" },
  { path: "/agora", expect: "Agora citoyenne" },
  { path: "/agora?view=discus", expect: "Discussions" },
  { path: "/agora?view=propo", expect: "Propositions" },
  { path: "/aide", expect: "Entraide" },
  { path: "/messages", expect: "conversations" },
  { path: "/moi", expect: "carnet de bord" },
  { path: "/agenda", expect: "Agenda communal" },
  { path: "/agenda?view=calendrier", expect: "nov." },
  { path: "/reservation", expect: "Réserver" },
  { path: "/petites-annonces", expect: "Petites annonces" },
  { path: "/conseil-municipal", expect: "Conseil municipal" },
  { path: "/notifications", expect: "Notifications" },
  { path: "/mairie", expect: "Pulsation de Trizac" },
  { path: "/mairie/journal", expect: "Journal des décisions" },
  { path: "/mairie/reservations", expect: "Réservations à valider" },
  { path: "/mairie/moderation", expect: "Signalements de contenu" },
  { path: "/mairie/emails", expect: "File d'envoi" },
  { path: "/mentions-legales", expect: "Mentions légales" },
  { path: "/confidentialite", expect: "Politique de confidentialité" },
  { path: "/accessibilite", expect: "Déclaration d'accessibilité" },
  { path: "/mes-donnees", expect: "Mes données" },
  { path: "/auth/login", expect: "Se connecter" },
  { path: "/auth/register", expect: "Créer un compte" },
  { path: "/auth/magic", expect: "Connexion par email" },
];

test.describe("Smoke — toutes les routes principales", () => {
  for (const r of ROUTES) {
    test(`${r.path}`, async ({ page }) => {
      const res = await page.goto(r.path);
      expect(res?.status(), `HTTP status pour ${r.path}`).toBeLessThan(400);
      await expect(page.locator("body")).toContainText(r.expect);
    });
  }
});

test("API ICS expose un calendrier valide", async ({ request }) => {
  const r = await request.get("/api/ics");
  expect(r.status()).toBe(200);
  expect(r.headers()["content-type"]).toContain("text/calendar");
  const body = await r.text();
  expect(body).toContain("BEGIN:VCALENDAR");
  expect(body).toContain("END:VCALENDAR");
  expect(body).toContain("BEGIN:VEVENT");
});
