import "server-only";
import path from "node:path";
import fs from "node:fs";

/**
 * Couche d'abstraction SMS — délibérément simple.
 *
 * Stratégie d'indépendance :
 *   1. Aucun SDK propriétaire. Les providers sont implémentés via
 *      `fetch` standard contre l'API HTTP du fournisseur.
 *   2. Interface unique `SmsProvider` → on switche de fournisseur sans
 *      toucher au code applicatif.
 *   3. Provider `outbox` par défaut, qui capture en local (zéro
 *      configuration, dev/CI sans connectivité externe).
 *
 * Providers fournis :
 *   - `outbox` : écrit dans data/sms-outbox/ (mode démo).
 *   - `smspartner` : SMSPartner (France), HTTP REST + clé API simple.
 *
 * Ajouter un provider = un nouveau fichier dans providers/ + une
 * branche dans `getProvider()`.
 */

export type SendResult = { providerMessageId?: string };

export interface SmsProvider {
  readonly name: string;
  send(args: { to: string; body: string; queueId: number }): Promise<SendResult>;
}

const OUTBOX_DIR = path.resolve(process.cwd(), "data/sms-outbox");

class OutboxProvider implements SmsProvider {
  readonly name = "outbox";
  async send({ to, body, queueId }: { to: string; body: string; queueId: number }) {
    if (!fs.existsSync(OUTBOX_DIR)) fs.mkdirSync(OUTBOX_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safe = to.replace(/[^a-zA-Z0-9+_-]+/g, "_");
    const file = path.join(OUTBOX_DIR, `${stamp}-${safe}-${queueId}.txt`);
    fs.writeFileSync(
      file,
      `To: ${to}\nDate: ${new Date().toUTCString()}\nLength: ${body.length} chars\n---\n${body}\n`,
      "utf8",
    );
    return { providerMessageId: `outbox-${queueId}` };
  }
}

/**
 * SMSPartner — fournisseur français, conforme RGPD, hébergement UE.
 * Doc : https://api.smspartner.fr/v1/send
 *
 * Champs requis dans l'env :
 *   SMS_PROVIDER=smspartner
 *   SMSPARTNER_API_KEY=xxxxxx
 *   SMSPARTNER_SENDER=Trizac      # 11 chars max alphanum, sans accent
 */
class SmsPartnerProvider implements SmsProvider {
  readonly name = "smspartner";
  constructor(
    private apiKey: string,
    private sender: string = "Trizac",
  ) {}
  async send({ to, body }: { to: string; body: string; queueId: number }) {
    const r = await fetch("https://api.smspartner.fr/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        apiKey: this.apiKey,
        phoneNumbers: to,
        message: body,
        sender: this.sender,
      }),
    });
    const text = await r.text();
    if (!r.ok) throw new Error(`smspartner HTTP ${r.status} : ${text.slice(0, 200)}`);
    let providerMessageId: string | undefined;
    try {
      const json = JSON.parse(text);
      providerMessageId = json?.message_id ?? json?.messageId;
    } catch {
      /* réponse non-JSON, on ignore */
    }
    return { providerMessageId };
  }
}

/**
 * OVHcloud SMS — fournisseur français cloud souverain (UE).
 * L'API V6 d'OVH demande une signature HMAC-SHA1 par requête. Pour
 * éviter d'inclure ici la complexité de la signature, on documente
 * simplement le contrat — l'implémentation détaillée est laissée au
 * sprint d'intégration (ovh-api-node ou implémentation maison qui
 * reproduit le schéma de signature documenté).
 *
 *   https://api.ovh.com/console/#/sms/{serviceName}/jobs#POST
 *
 * Si vous voulez l'activer rapidement, SMSPartner suffit pour le MVP.
 */
class OvhSmsProvider implements SmsProvider {
  readonly name = "ovh-sms";
  async send(): Promise<SendResult> {
    throw new Error(
      "Provider ovh-sms : implémentation HMAC à compléter (cf. transport.ts).",
    );
  }
}

let cached: SmsProvider | null = null;

export function getProvider(): SmsProvider {
  if (cached) return cached;
  const which = (process.env.SMS_PROVIDER ?? "outbox").toLowerCase();
  if (which === "smspartner") {
    const key = process.env.SMSPARTNER_API_KEY;
    if (!key) throw new Error("SMSPARTNER_API_KEY manquant");
    cached = new SmsPartnerProvider(key, process.env.SMSPARTNER_SENDER);
  } else if (which === "ovh-sms") {
    cached = new OvhSmsProvider();
  } else {
    cached = new OutboxProvider();
  }
  return cached;
}

export function isRealProviderConfigured() {
  const which = (process.env.SMS_PROVIDER ?? "outbox").toLowerCase();
  return which !== "outbox";
}

export function listOutbox(limit = 50) {
  if (!fs.existsSync(OUTBOX_DIR)) return [] as { name: string; sizeKb: number; mtime: Date }[];
  return fs
    .readdirSync(OUTBOX_DIR)
    .filter((f) => f.endsWith(".txt"))
    .map((name) => {
      const stat = fs.statSync(path.join(OUTBOX_DIR, name));
      return { name, sizeKb: Math.round(stat.size / 102.4) / 10, mtime: stat.mtime };
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    .slice(0, limit);
}
