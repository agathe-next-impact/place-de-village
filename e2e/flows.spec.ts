import { test, expect } from "@playwright/test";

/**
 * Flows e2e couvrant les parcours utilisateur clés. On utilise des
 * comptes seedés (mot de passe « trizac »).
 *
 * - Habitant : login → publier une idée → soutenir une proposition.
 * - Agent : login → faire évoluer un signalement.
 * - Magic link : générer + consommer dans la même session.
 */

async function login(
  page: import("@playwright/test").Page,
  email: string,
  password = "trizac",
) {
  await page.goto("/auth/login");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL("**/", { timeout: 10_000 });
}

test.describe("Flow habitant", () => {
  test("login + publier idée + soutenir proposition", async ({ page }) => {
    await login(page, "camille@trizac.fr");
    await expect(page.getByText("Bonjour Camille")).toBeVisible();

    // Publier une idée depuis l'agora
    await page.goto("/agora");
    await page.getByRole("button", { name: "Nouvelle idée" }).click();
    const idea = `Verger participatif derrière l'école — ${Date.now()}`;
    await page.getByLabel("Votre idée").fill(idea);
    // attendre que le bouton soit enabled (controlled input → React tick)
    const publish = page.getByRole("button", { name: "Publier" });
    await expect(publish).toBeEnabled();
    await publish.click();
    await expect(page.getByText("Idée publiée")).toBeVisible({ timeout: 10_000 });
    // L'idée nouvellement créée doit apparaître dans la liste
    await expect(page.getByText(idea).first()).toBeVisible();

    // Soutenir une proposition
    await page.goto("/agora?view=propo");
    const propRow = page
      .getByRole("button", { name: /Soutenir|Soutenu/ })
      .first();
    await propRow.click();
    await expect(page.getByText(/Soutien (enregistré|retiré)/)).toBeVisible();
  });

  test("émettre un signal qualifié sur une idée", async ({ page }) => {
    await login(page, "camille@trizac.fr");
    await page.goto("/agora");
    const sigBtn = page
      .getByRole("button", { pressed: false, name: /Je vis ça/ })
      .first();
    if (await sigBtn.isVisible()) {
      await sigBtn.click();
      await expect(page.getByText(/Signal (enregistré|retiré)/)).toBeVisible();
    }
  });
});

test.describe("Flow agent municipal", () => {
  test("login + faire évoluer un signalement", async ({ page }) => {
    await login(page, "voirie@trizac.fr");
    await page.goto("/signalements");
    // Cliquer sur le 1er signalement de la liste (dans l'ordre seedé,
    // s4 « Dépôt sauvage » est en état "signale" donc actionnable).
    await page.getByText("Dépôt sauvage").first().click();
    await page.waitForURL(/\/signalements\/.+/);

    // Section "Action agent municipal" doit être visible
    await expect(page.getByText("Action agent municipal")).toBeVisible();
    await page.getByRole("button", { name: "Prendre en compte" }).click();
    await page.getByPlaceholder(/Service informé/).fill("Tournée prévue mardi.");
    await page
      .getByRole("button", { name: "Confirmer : Prendre en compte" })
      .click();
    await expect(page.getByText("État mis à jour")).toBeVisible();
    // 2 occurrences attendues : chip d'état + label dans la timeline
    await expect(page.getByText("Pris en compte").first()).toBeVisible();
  });
});

test.describe("Magic link", () => {
  test("génère un email + consommation du token connecte l'utilisateur", async ({
    page,
  }) => {
    await page.goto("/auth/magic");
    await page.getByLabel("Adresse email").fill("camille@trizac.fr");
    await page.getByRole("button", { name: "Envoyer le lien" }).click();
    await expect(page.getByText("vient d'être envoyé")).toBeVisible();
    // En l'absence de SMTP, le lien direct est affiché
    const link = page.getByRole("link", { name: "Ouvrir le magic link" });
    if (await link.isVisible()) {
      await Promise.all([page.waitForURL((u) => u.pathname === "/"), link.click()]);
      await expect(page.getByText("Bonjour")).toBeVisible();
    }
  });
});

test.describe("Modération", () => {
  test("habitant peut signaler une contribution", async ({ page }) => {
    await login(page, "marie@trizac.fr");
    await page.goto("/discussions/d1");
    const flag = page.getByRole("button", { name: /Signaler/ }).first();
    await flag.click();
    await page
      .getByRole("button", { name: "Envoyer" })
      .click();
    await expect(page.getByText("Signalement envoyé")).toBeVisible();
  });
});

test.describe("SMS", () => {
  test("inscription mission (Camille avec téléphone seedé) génère un SMS programmé", async ({
    page,
  }) => {
    await login(page, "camille@trizac.fr");
    await page.goto("/missions/m1");
    const btn = page
      .getByRole("button", { name: /Je m'inscris|Inscrit·e/ })
      .first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
    }
    // Le SMS programmé doit apparaître dans la file mairie
    await page.goto("/mairie/sms");
    await expect(page.getByText("+33611223344")).toBeVisible({ timeout: 10_000 });
  });
});
