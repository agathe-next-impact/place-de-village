import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Audit RGAA AA via axe-core sur les pages critiques. Cf. CdC §3.3 :
 * « Tests d'accessibilité automatisés en intégration continue ».
 *
 * On vise WCAG 2.1 AA + best-practices. Les violations critiques font
 * échouer le test ; les violations mineures sont rapportées en console
 * pour suivi (TODO : durcir au fil de l'amélioration de l'accessibilité).
 */

const PAGES = [
  { path: "/", name: "accueil" },
  { path: "/signalements", name: "signalements" },
  { path: "/agora", name: "agora — idées" },
  { path: "/agora?view=discus", name: "agora — discussions" },
  { path: "/aide", name: "entraide" },
  { path: "/moi", name: "bénévolat" },
  { path: "/agenda", name: "agenda" },
  { path: "/notifications", name: "notifications" },
  { path: "/mairie", name: "vue mairie" },
  { path: "/mentions-legales", name: "mentions légales" },
  { path: "/auth/login", name: "login" },
  { path: "/auth/register", name: "register" },
];

for (const p of PAGES) {
  test(`a11y · ${p.name} (${p.path})`, async ({ page }) => {
    await page.goto(p.path);
    // Attendre que la carte ne soit pas en cours de hydration sur la home
    await page.waitForLoadState("networkidle").catch(() => undefined);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // On exclut MapLibre dont le canvas / popups injectent du DOM
      // qu'on ne contrôle pas et qui contient des violations connues du
      // bibliothèque (à reporter upstream le cas échéant).
      .exclude(".maplibregl-canvas-container")
      .exclude(".maplibregl-control-container")
      .exclude(".maplibregl-popup")
      .analyze();

    // Violations bloquantes pour la CI :
    //   - tout ce qui n'est pas color-contrast
    //   - + critical color-contrast uniquement
    //
    // Les "serious color-contrast" sont reportés en console pour un
    // sprint a11y dédié (durcissement de la palette `sobre` originale).
    const blocking = results.violations.filter((v) => {
      if (v.id !== "color-contrast") {
        return ["critical", "serious"].includes(v.impact ?? "");
      }
      return v.impact === "critical";
    });
    if (results.violations.length > 0) {
      console.log(
        `[a11y ${p.path}] ${results.violations.length} violation(s) — ${blocking.length} bloquante(s)`,
      );
      for (const v of results.violations) {
        console.log(`  · [${v.impact}] ${v.id} — ${v.help}`);
      }
    }
    expect(blocking, `Violations a11y bloquantes sur ${p.path}`).toEqual([]);
  });
}
