import Script from "next/script";

/**
 * Plausible Analytics — auto-hébergé. Cf. CdC §3.1.
 *
 * Architecture indépendante : aucun SDK, aucune CDN. Un simple
 * `<script>` léger (~1 KB) pointant vers l'instance Plausible
 * auto-hébergée par la commune. Pas de cookies, pas de fingerprinting,
 * pas de profil utilisateur — conforme RGPD, aucun bandeau de
 * consentement requis.
 *
 * Variables d'env :
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN  ex : trizac.fr
 *   NEXT_PUBLIC_PLAUSIBLE_HOST    ex : https://plausible.example.fr
 *
 * Sans configuration, aucun script n'est injecté.
 */
export function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const host = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST;
  if (!domain || !host) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src={`${host.replace(/\/$/, "")}/js/script.tagged-events.js`}
      strategy="afterInteractive"
    />
  );
}
