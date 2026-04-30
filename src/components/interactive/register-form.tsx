"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { registerUser } from "@/lib/actions/auth";

const CONSENTS = [
  {
    id: "contributions" as const,
    label: "Publier des contributions citoyennes (idées, soutiens, signalements)",
    required: true,
  },
  { id: "actu" as const, label: "Recevoir le digest hebdomadaire d'actualité communale par email" },
  { id: "geoloc" as const, label: "Utiliser la géolocalisation lors des signalements (jamais stockée précisément)" },
  { id: "sms" as const, label: "Recevoir des rappels SMS la veille de mes missions de bénévolat" },
];

export function RegisterForm() {
  const router = useRouter();
  const { show } = useToast();
  const [pending, start] = useTransition();
  const [v, setV] = useState({ firstname: "", lastname: "", email: "", password: "" });

  const valid =
    v.firstname.trim().length >= 2 &&
    v.lastname.trim().length >= 2 &&
    /.+@.+\..+/.test(v.email) &&
    v.password.length >= 8;

  return (
    <>
      <h1 className="text-[22px] font-bold tracking-title text-ink">Créer un compte</h1>
      <p className="text-[13px] text-ink-soft mt-1">
        Cochez les usages que vous autorisez — vous pouvez les modifier à tout
        moment depuis « Mes données ».
      </p>

      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          start(async () => {
            try {
              await registerUser({
                email: v.email,
                name: `${v.firstname.trim()} ${v.lastname.trim()}`,
                password: v.password,
              });
              show({ tone: "success", title: "Compte créé", desc: v.email });
              router.push("/");
            } catch (err) {
              show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
            }
          });
        }}
      >
        <Input id="firstname" label="Prénom" autoComplete="given-name" required value={v.firstname} onChange={(x) => setV({ ...v, firstname: x })} />
        <Input id="lastname" label="Nom" autoComplete="family-name" required value={v.lastname} onChange={(x) => setV({ ...v, lastname: x })} />
        <Input id="email" label="Adresse email" type="email" autoComplete="email" required value={v.email} onChange={(x) => setV({ ...v, email: x })} />
        <Input id="password" label="Mot de passe (≥ 8 caractères)" type="password" autoComplete="new-password" required minLength={8} value={v.password} onChange={(x) => setV({ ...v, password: x })} />

        <fieldset className="mt-4">
          <legend className="text-[12px] font-semibold text-ink-soft block mb-2">
            Consentements (granulaires, révocables — RGPD)
          </legend>
          <div className="space-y-2">
            {CONSENTS.map((c) => (
              <label
                key={c.id}
                className="flex items-start gap-2.5 text-[13px] text-ink cursor-pointer"
              >
                <input
                  type="checkbox"
                  required={c.required}
                  defaultChecked={c.required}
                  className="mt-0.5 w-4 h-4 accent-primary"
                />
                <span>
                  {c.label}
                  {c.required && (
                    <span className="text-ink-muted text-[11px]"> · obligatoire</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="text-[11.5px] text-ink-muted leading-relaxed">
          En créant votre compte, vous acceptez nos{" "}
          <Link href="/mentions-legales" className="text-primary underline">mentions légales</Link>{" "}
          et notre{" "}
          <Link href="/confidentialite" className="text-primary underline">politique de confidentialité</Link>.
        </p>

        <Button full size="lg" type="submit" disabled={!valid || pending}>
          Créer mon compte
        </Button>
      </form>

      <hr className="my-5 border-line-soft" />

      <p className="text-[13px] text-ink-soft text-center">
        Déjà inscrit ?{" "}
        <Link href="/auth/login" className="text-primary font-semibold underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}

function Input({
  id, label, type = "text", autoComplete, required, minLength, value, onChange,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[12px] font-semibold text-ink-soft block mb-1">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-[14px] text-ink outline-none focus:border-primary min-h-[44px]"
      />
    </div>
  );
}
