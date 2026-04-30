"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { requestMagicLink } from "@/lib/actions/auth";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<{ email: string; url: string; smtpConfigured: boolean } | null>(null);
  const [pending, start] = useTransition();
  const { show } = useToast();

  return (
    <>
      <h1 className="text-[22px] font-bold tracking-title text-ink">Connexion par email</h1>
      <p className="text-[13px] text-ink-soft mt-1">
        Recevez un lien à usage unique. Pas de mot de passe à retenir.
      </p>

      {sent ? (
        <>
          <div className="mt-5 bg-success/10 border border-success/30 rounded-lg p-4 text-[13px] text-ink">
            Un lien de connexion vient d'être envoyé à <strong>{sent.email}</strong>.
            Il expire dans 15 minutes.
          </div>
          {!sent.smtpConfigured && (
            <div className="mt-3 bg-accent-soft border border-accent/30 rounded-lg p-3 text-[12.5px] text-ink-soft">
              <strong className="text-ink">Mode démo</strong> — SMTP non configuré.
              L'email a été capturé dans <code>data/outbox/</code>. Pour la démo,
              cliquez :
              <div className="mt-2">
                <Link
                  href={sent.url}
                  className="inline-block bg-primary text-white px-3 py-2 rounded font-semibold underline"
                >
                  Ouvrir le magic link
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              try {
                const r = await requestMagicLink({ email: email.trim() });
                setSent({ email: r.email, url: r.url, smtpConfigured: r.smtpConfigured });
                show({ tone: "info", title: "Email envoyé", desc: "Vérifiez votre boîte (et vos spams)." });
              } catch (err) {
                show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
              }
            });
          }}
        >
          <div>
            <label htmlFor="email" className="text-[12px] font-semibold text-ink-soft block mb-1">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-[14px] text-ink outline-none focus:border-primary min-h-[44px]"
            />
          </div>
          <Button full size="lg" type="submit" disabled={pending}>
            Envoyer le lien
          </Button>
        </form>
      )}

      <hr className="my-5 border-line-soft" />

      <p className="text-[13px] text-ink-soft text-center">
        <Link href="/auth/login" className="text-primary font-semibold underline">
          Revenir à la connexion classique
        </Link>
      </p>
    </>
  );
}
