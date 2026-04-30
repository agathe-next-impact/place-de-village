"use client";

import { track as vercelTrack } from "@vercel/analytics";

/**
 * Wrapper sur `@vercel/analytics`.
 *
 * En local / hors-Vercel, `vercelTrack` est no-op : aucune donnée
 * envoyée. Aucune PII ne doit transiter par ces events (cf. tests
 * `test/analytics.test.ts`).
 */
export type EventProps = Record<string, string | number | boolean>;

export function track(eventName: string, props?: EventProps) {
  try {
    vercelTrack(eventName, props);
  } catch {
    /* analytics ne doit jamais casser l'app */
  }
}
