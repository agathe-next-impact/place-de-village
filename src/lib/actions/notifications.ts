"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth";
import { notifyEmail, templates } from "@/lib/email";

/**
 * Notification interne — persistée + déclenche aussi un email
 * transactionnel quand un template existe pour le `kind` et que
 * l'utilisateur a le consentement `transac_email` (par défaut accordé,
 * révocable depuis /mes-donnees).
 */
export async function notify(args: {
  userId: string;
  kind: string;
  titre: string;
  body?: string;
  href?: string;
  /** Données structurées pour le template email associé. */
  emailData?: EmailData;
}) {
  db.insert(schema.notifications)
    .values({
      userId: args.userId,
      kind: args.kind,
      titre: args.titre,
      body: args.body ?? null,
      href: args.href ?? null,
    })
    .run();

  // Routing vers le template email approprié
  const rendered = renderForKind(args);
  if (rendered) {
    try {
      await notifyEmail({
        userId: args.userId,
        template: args.kind,
        rendered,
      });
    } catch (err) {
      // l'erreur d'envoi email ne doit jamais empêcher la notification
      // in-app de fonctionner — on capture pour Sentry / log local
      // mais on ne re-throw pas.
      const { captureError } = await import("@/lib/errors");
      captureError(err, {
        context: { kind: args.kind, userId: args.userId },
        tags: { module: "email" },
      });
    }
  }
}

type EmailData =
  | { kind: "signalement_state"; titre: string; etatLabel: string; comment?: string | null; href: string }
  | { kind: "new_message"; fromName: string; preview: string; href: string }
  | { kind: "mission_inscription"; titre: string; date: string; lieu: string; href: string }
  | { kind: "reservation_valide"; equipement: string; href: string }
  | { kind: "reservation_refus"; equipement: string; motif?: string | null; href: string }
  | { kind: "proposition_seuil"; titre: string; soutiens: number; href: string };

function renderForKind(args: { kind: string; titre: string; body?: string; href?: string; emailData?: EmailData }) {
  const ed = args.emailData;
  if (ed?.kind === "signalement_state") {
    return templates.signalementState({
      titre: ed.titre,
      etatLabel: ed.etatLabel,
      comment: ed.comment,
      href: ed.href,
    });
  }
  if (ed?.kind === "new_message") {
    return templates.newMessage({ fromName: ed.fromName, preview: ed.preview, href: ed.href });
  }
  if (ed?.kind === "mission_inscription") {
    return templates.missionInscription({
      titre: ed.titre,
      date: ed.date,
      lieu: ed.lieu,
      href: ed.href,
    });
  }
  if (ed?.kind === "reservation_valide") {
    return templates.reservation({ valide: true, equipement: ed.equipement, href: ed.href });
  }
  if (ed?.kind === "reservation_refus") {
    return templates.reservation({
      valide: false,
      equipement: ed.equipement,
      motif: ed.motif,
      href: ed.href,
    });
  }
  if (ed?.kind === "proposition_seuil") {
    return templates.propositionSeuil({
      titre: ed.titre,
      soutiens: ed.soutiens,
      href: ed.href,
    });
  }
  // Fallback générique pour les notifications sans template dédié
  return templates.generic({ titre: args.titre, body: args.body, href: args.href });
}

export async function markAllRead() {
  const u = await getCurrentUser();
  db.update(schema.notifications)
    .set({ readAt: new Date() })
    .where(and(eq(schema.notifications.userId, u.id), isNull(schema.notifications.readAt)))
    .run();
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
