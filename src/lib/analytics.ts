"use client";

/**
 * Helpers d'analytique côté navigateur.
 *
 * Le script Plausible auto-hébergé expose `window.plausible(name, options)`.
 * On encapsule l'appel pour qu'il soit no-op si le script n'est pas
 * chargé (mode démo / dev) — aucune donnée n'est jamais perdue ou
 * envoyée silencieusement à un service tiers.
 *
 * Convention : noms d'events en kebab-case stable (les renommer revient
 * à perdre l'historique). Documentation des events dans
 * `src/lib/analytics-events.ts`.
 */

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void;
  }
}

export type EventProps = Record<string, string | number | boolean>;

export function track(eventName: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  if (typeof window.plausible === "function") {
    try {
      window.plausible(eventName, props ? { props } : undefined);
    } catch {
      /* ignore — analytics ne doit jamais casser l'app */
    }
  }
}
