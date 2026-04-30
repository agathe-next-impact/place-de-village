"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { updatePhoneAndConsent } from "@/lib/actions/sms";

const CONSENTS_INIT = {
  contributions: true,
  digest: false,
  geoloc: true,
  sms: false,
};

export default function Page() {
  const [consents, setConsents] = useState(CONSENTS_INIT);
  const [phone, setPhone] = useState("");
  const [phonePending, startPhone] = useTransition();
  const { show } = useToast();
  const update = (k: keyof typeof CONSENTS_INIT, v: boolean) =>
    setConsents((prev) => ({ ...prev, [k]: v }));

  return (
    <article>
      <h1 className="text-[28px] font-bold tracking-title text-ink mb-4">
        Mes données
      </h1>

      <p className="text-[14px] text-ink-soft leading-relaxed">
        Cette page vous permet d'exercer les droits qui vous sont garantis par
        le RGPD. Vos modifications sont enregistrées et tracées. Pour toute
        question, contactez{" "}
        <a className="text-primary underline" href="mailto:dpo@trizac.fr">
          dpo@trizac.fr
        </a>
        .
      </p>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Mes consentements</h2>
      <fieldset className="space-y-2 mt-2">
        <legend className="sr-only">Consentements granulaires</legend>
        {(
          [
            {
              id: "contributions" as const,
              label: "Publier des contributions citoyennes",
              required: true,
            },
            { id: "digest" as const, label: "Recevoir le digest hebdomadaire", required: false },
            { id: "geoloc" as const, label: "Géolocalisation lors des signalements", required: false },
            { id: "sms" as const, label: "Rappels SMS la veille des missions de bénévolat", required: false },
          ]
        ).map((c) => (
          <label
            key={c.id}
            className="flex items-start gap-2.5 p-3 bg-surface border border-line-soft rounded text-[13.5px] text-ink cursor-pointer"
          >
            <input
              type="checkbox"
              disabled={c.required}
              checked={consents[c.id]}
              onChange={(e) => {
                update(c.id, e.target.checked);
                show({
                  tone: e.target.checked ? "success" : "info",
                  title: e.target.checked
                    ? "Consentement accordé"
                    : "Consentement révoqué",
                  desc: c.label,
                });
              }}
              className="mt-0.5 w-4 h-4 accent-primary"
            />
            <span className="flex-1">
              {c.label}
              {c.required && (
                <span className="text-ink-muted text-[11px]"> · requis pour utiliser le service</span>
              )}
            </span>
          </label>
        ))}
      </fieldset>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Mon téléphone</h2>
      <p className="text-[13px] text-ink-soft mb-2">
        Optionnel. Utilisé uniquement pour les rappels SMS la veille des
        missions de bénévolat (si le consentement ci-dessus est accordé).
        Numéro non exposé publiquement.
      </p>
      <form
        className="bg-surface border border-line-soft rounded p-3 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          startPhone(async () => {
            try {
              await updatePhoneAndConsent({ phone, smsConsent: consents.sms });
              show({ tone: "success", title: "Téléphone enregistré" });
            } catch (err) {
              show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
            }
          });
        }}
      >
        <label className="flex-1 min-w-[200px]">
          <span className="text-[12px] font-semibold text-ink-soft block mb-1">
            Numéro de téléphone
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 6 11 22 33 44 ou 06 11 22 33 44"
            className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-[14px] text-ink outline-none focus:border-primary min-h-[44px]"
          />
        </label>
        <Button type="submit" disabled={phonePending}>
          Enregistrer
        </Button>
      </form>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Vos droits RGPD</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <ActionCard
          title="Demander une copie de mes données"
          desc="Export complet, format JSON, livré sous 30 jours."
          onAction={() =>
            show({
              tone: "info",
              title: "Export demandé",
              desc: "Vous recevrez un email lorsque l'archive sera prête.",
            })
          }
        />
        <ActionCard
          title="Supprimer mon compte"
          desc="Suppression complète, ou pseudonymisation des contributions publiques au choix."
          tone="danger"
          onAction={() =>
            show({
              tone: "info",
              title: "Demande de suppression enregistrée",
              desc: "Un email de confirmation est requis pour finaliser.",
            })
          }
        />
        <ActionCard
          title="Demander une rectification"
          desc="Corriger une donnée inexacte (nom, email, etc.)."
          onAction={() =>
            show({
              tone: "info",
              title: "Demande envoyée",
            })
          }
        />
        <ActionCard
          title="M'opposer à un traitement"
          desc="Pour les traitements basés sur l'intérêt public uniquement."
          onAction={() =>
            show({
              tone: "info",
              title: "Demande d'opposition envoyée",
            })
          }
        />
      </div>
    </article>
  );
}

function ActionCard({
  title,
  desc,
  onAction,
  tone,
}: {
  title: string;
  desc: string;
  onAction: () => void;
  tone?: "danger";
}) {
  return (
    <div className="bg-surface border border-line-soft rounded-lg p-4 flex flex-col gap-2">
      <div className="font-semibold text-[14px] text-ink">{title}</div>
      <div className="text-[12.5px] text-ink-soft flex-1">{desc}</div>
      <div className="mt-2">
        <Button
          variant={tone === "danger" ? "ghost" : "secondary"}
          onClick={onAction}
          size="sm"
          className={tone === "danger" ? "text-danger border-danger/40" : ""}
        >
          Demander
        </Button>
      </div>
    </div>
  );
}
