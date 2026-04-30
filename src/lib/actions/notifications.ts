"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth";

/**
 * Notification interne — l'envoi email/SMS effectif est délégué à un cron
 * et au service Brevo / OVHcloud SMS en production. Ici, on persiste
 * uniquement la notification dans la table.
 */
export async function notify(args: {
  userId: string;
  kind: string;
  titre: string;
  body?: string;
  href?: string;
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
