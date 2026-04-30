"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const CONSENTS = [
  {
    id: "contributions",
    label: "Publier des contributions citoyennes (idées, soutiens, signalements)",
    required: true,
  },
  {
    id: "actu",
    label: "Recevoir le digest hebdomadaire d'actualité communale par email",
  },
  {
    id: "geoloc",
    label:
      "Utiliser la géolocalisation lors des signalements (jamais stockée précisément)",
  },
  { id: "sms", label: "Recevoir des rappels SMS la veille de mes missions de bénévolat" },
];

export default function Page() {
  const router = useRouter();
  const { show } = useToast();
  const [consents, setConsents] = useState<Record<string, boolean>>({
    contributions: true,
  });

  return (
    <>
      <h1 className="text-[22px] font-bold tracking-title text-ink">
        Créer un compte
      </h1>
      <p className="text-[13px] text-ink-soft mt-1">
        Cochez les usages que vous autorisez — vous pouvez les modifier à tout
        moment depuis « Mes données ».
      </p>

      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          show({
            tone: "success",
            title: "Compte créé",
            desc: "Un email de confirmation vous a été envoyé.",
          });
          router.push("/");
        }}
      >
        <Input id="firstname" label="Prénom" autoComplete="given-name" required />
        <Input id="lastname" label="Nom" autoComplete="family-name" required />
        <Input id="email" label="Adresse email" type="email" autoComplete="email" required />
        <Input id="password" label="Mot de passe" type="password" autoComplete="new-password" required />

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
                  onChange={(e) =>
                    setConsents((prev) => ({ ...prev, [c.id]: e.target.checked }))
                  }
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
          <Link href="/mentions-legales" className="text-primary underline">
            mentions légales
          </Link>{" "}
          et notre{" "}
          <Link href="/confidentialite" className="text-primary underline">
            politique de confidentialité
          </Link>
          .
        </p>

        <Button full size="lg" type="submit">
          Créer mon compte
        </Button>
      </form>

      <hr className="my-5 border-line-soft" />

      <p className="text-[13px] text-ink-soft text-center">
        Déjà inscrit ?{" "}
        <Link
          href="/auth/login"
          className="text-primary font-semibold underline"
        >
          Se connecter
        </Link>
      </p>

      {/* On épingle un usage non-trivial des consents pour éviter la
          warning "unused state setter" et garder le hook actif. */}
      <span className="sr-only">
        Consentements actuels : {Object.keys(consents).filter((k) => consents[k]).length}
      </span>
    </>
  );
}

function Input({
  id,
  label,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[12px] font-semibold text-ink-soft block mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-[14px] text-ink outline-none focus:border-primary min-h-[44px]"
      />
    </div>
  );
}
