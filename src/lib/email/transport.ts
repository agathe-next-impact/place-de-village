import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import path from "node:path";
import fs from "node:fs";

/**
 * Transport email — délibérément standard SMTP. Compatible avec :
 *   - Postfix self-hosted (le plus indépendant)
 *   - Mailcow / Mail-in-a-Box auto-hébergés
 *   - OVHcloud, Infomaniak, Mailjet, Brevo, etc.
 *
 * Aucun SDK propriétaire. Configuration purement via env vars
 * (RFC 5321 / 5322 SMTP). Cf. CdC §3.1 préférence self-hosting.
 *
 * En l'absence de SMTP_HOST configuré, le transport bascule en mode
 * "outbox" : les emails sont écrits dans data/outbox/ + marqués
 * `captured` en DB. Le développement et la démo n'exigent rien.
 */

let cached: Transporter | null = null;

export function isSmtpConfigured() {
  return !!process.env.SMTP_HOST;
}

export function getMailer(): Transporter {
  if (cached) return cached;
  if (!isSmtpConfigured()) {
    throw new Error("SMTP non configuré (SMTP_HOST manquant)");
  }
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    requireTLS: process.env.SMTP_REQUIRE_TLS !== "false",
  });
  return cached;
}

export const DEFAULT_FROM =
  process.env.EMAIL_FROM ?? "Trizac · Place du village <noreply@trizac.fr>";

const OUTBOX_DIR = path.resolve(process.cwd(), "data/outbox");

export async function captureToOutbox(args: {
  id: number;
  to: string;
  subject: string;
  text: string;
  html?: string | null;
}) {
  if (!fs.existsSync(OUTBOX_DIR)) fs.mkdirSync(OUTBOX_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safe = args.to.replace(/[^a-zA-Z0-9_-]+/g, "_");
  const file = path.join(OUTBOX_DIR, `${stamp}-${safe}-${args.id}.eml`);
  const lines = [
    `From: ${DEFAULT_FROM}`,
    `To: ${args.to}`,
    `Subject: ${args.subject}`,
    `Date: ${new Date().toUTCString()}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    args.text,
  ];
  if (args.html) {
    lines.push("");
    lines.push("--- HTML ---");
    lines.push(args.html);
  }
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  return file;
}

export function listOutbox(limit = 50) {
  if (!fs.existsSync(OUTBOX_DIR)) return [] as { name: string; sizeKb: number; mtime: Date }[];
  return fs
    .readdirSync(OUTBOX_DIR)
    .filter((f) => f.endsWith(".eml"))
    .map((name) => {
      const stat = fs.statSync(path.join(OUTBOX_DIR, name));
      return { name, sizeKb: Math.round(stat.size / 102.4) / 10, mtime: stat.mtime };
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    .slice(0, limit);
}

export function readOutbox(name: string) {
  const safe = name.replace(/[^a-zA-Z0-9._-]+/g, "");
  const file = path.join(OUTBOX_DIR, safe);
  if (!file.startsWith(OUTBOX_DIR) || !fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8");
}
