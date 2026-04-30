import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Vercel Web Analytics + Speed Insights — natifs Vercel, sans cookies.
 *
 * Pas de configuration : actifs uniquement quand l'app tourne sur
 * Vercel. En local, les composants sont no-op (vérifient la présence
 * des headers Vercel runtime).
 *
 * `Analytics` mesure les pages vues + custom events (via
 * `import { track } from '@vercel/analytics'`).
 * `SpeedInsights` mesure les Core Web Vitals (LCP, FCP, INP, CLS).
 *
 * Conformité RGPD : aucune donnée personnelle envoyée par défaut,
 * pas de cookies tiers, pas de fingerprinting.
 *
 * Le composant garde le nom historique « PlausibleScript » pour ne
 * pas casser les imports existants.
 */
export function PlausibleScript() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
