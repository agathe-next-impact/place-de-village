"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { loginUser } from "@/lib/actions/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const { show } = useToast();

  return (
    <>
      <h1 className="text-[22px] font-bold tracking-title text-ink">Se connecter</h1>
      <p className="text-[13px] text-ink-soft mt-1">
        Entrez votre adresse email et votre mot de passe. Vous pouvez aussi
        recevoir un lien de connexion sans mot de passe.
      </p>

      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            try {
              await loginUser({ email, password: pwd });
              show({ tone: "success", title: "Connexion réussie", desc: email });
              router.push("/");
            } catch (err) {
              show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
            }
          });
        }}
      >
        <Field id="email" label="Adresse email" type="email" autoComplete="email" value={email} onChange={setEmail} required />
        <Field id="password" label="Mot de passe" type="password" autoComplete="current-password" value={pwd} onChange={setPwd} required />
        <Button full size="lg" type="submit" disabled={pending}>
          Se connecter
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/auth/magic" className="text-[13px] text-primary font-semibold underline">
          Recevoir un lien de connexion par email
        </Link>
      </div>

      <hr className="my-5 border-line-soft" />

      <p className="text-[13px] text-ink-soft text-center">
        Pas encore de compte ?{" "}
        <Link href="/auth/register" className="text-primary font-semibold underline">
          Créer un compte
        </Link>
      </p>

      <p className="mt-4 text-[11.5px] text-ink-muted text-center leading-relaxed">
        Démo : tous les profils seedés ont le mot de passe <code>trizac</code>.
        Exemples : <code>camille@trizac.fr</code> (habitante),{" "}
        <code>voirie@trizac.fr</code> (agent), <code>maire@trizac.fr</code>.
      </p>
    </>
  );
}

function Field({
  id, label, type, autoComplete, value, onChange, required,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[12px] font-semibold text-ink-soft block mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-[14px] text-ink outline-none focus:border-primary min-h-[44px]"
      />
    </div>
  );
}
