"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function Page() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { show } = useToast();

  return (
    <>
      <h1 className="text-[22px] font-bold tracking-title text-ink">
        Connexion par email
      </h1>
      <p className="text-[13px] text-ink-soft mt-1">
        Recevez un lien à usage unique. Pas de mot de passe à retenir.
      </p>

      {sent ? (
        <div className="mt-5 bg-success/10 border border-success/30 rounded-lg p-4 text-[13px] text-ink">
          Si un compte est associé à <strong>{email}</strong>, un lien de
          connexion vient d'être envoyé. Il expire dans 15 minutes.
        </div>
      ) : (
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            show({
              tone: "info",
              title: "Email envoyé",
              desc: "Vérifiez votre boîte (et vos spams).",
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
          <Button full size="lg" type="submit">
            Envoyer le lien
          </Button>
        </form>
      )}

      <hr className="my-5 border-line-soft" />

      <p className="text-[13px] text-ink-soft text-center">
        <Link
          href="/auth/login"
          className="text-primary font-semibold underline"
        >
          Revenir à la connexion classique
        </Link>
      </p>
    </>
  );
}
