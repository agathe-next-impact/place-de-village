import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 4321);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false, // SQLite + cookie de session : on évite la concurrence
  workers: 1,
  reporter: process.env.CI ? "github" : [["list"]],
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "fr-FR",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 420, height: 900 },
        // En local, on utilise le Chromium pré-installé pour ne pas avoir
        // à télécharger les browsers Playwright.
        launchOptions: process.env.PW_CHROME_PATH
          ? { executablePath: process.env.PW_CHROME_PATH }
          : undefined,
      },
    },
  ],
  webServer: {
    command: `npm run db:migrate && npm run db:seed && npm start -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NODE_ENV: "production", PUBLIC_BASE_URL: BASE_URL },
  },
});
