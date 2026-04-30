import { NextResponse } from "next/server";
import { dispatchPendingSms } from "@/lib/sms";

/**
 * Cron infra → POST /api/cron/sms
 *
 * Consomme tous les SMS programmés dont la date d'envoi est passée.
 * À déclencher périodiquement (toutes les 5–15 min) depuis :
 *   - Scaleway Serverless Cron
 *   - cron-job.org auto-hébergé
 *   - systemd timer côté serveur
 *
 * Protégé par un secret partagé (CRON_SECRET) injecté en header
 * `Authorization: Bearer <secret>`. Si CRON_SECRET n'est pas défini,
 * l'endpoint accepte toute requête (mode démo / dev local).
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }
  const r = await dispatchPendingSms();
  return NextResponse.json(r);
}
