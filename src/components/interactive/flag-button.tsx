"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { flagContent } from "@/lib/actions/moderation";

type Entity = "suggestion" | "contribution" | "entraide" | "message" | "petite_annonce";

const REASONS = [
  "Spam ou contenu commercial",
  "Insulte ou attaque personnelle",
  "Information inexacte ou trompeuse",
  "Atteinte à la vie privée",
  "Contenu inapproprié",
  "Autre",
];

export function FlagButton({
  entityType,
  entityId,
  size = "sm",
}: {
  entityType: Entity;
  entityId: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [extra, setExtra] = useState("");
  const [pending, start] = useTransition();
  const { show } = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Signaler ce contenu"
        className={[
          "inline-flex items-center gap-1 text-ink-muted hover:text-danger",
          size === "sm" ? "text-[11.5px]" : "text-[13px]",
        ].join(" ")}
      >
        <Flag size={size === "sm" ? 12 : 14} strokeWidth={1.6} />
        Signaler
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Signaler ce contenu"
        description="Le référent municipal examinera votre signalement. La modération intervient a posteriori."
        footer={
          <>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              full
              type="submit"
              form="flag-form"
              disabled={pending}
            >
              Envoyer
            </Button>
          </>
        }
      >
        <form
          id="flag-form"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              try {
                const fullReason = extra.trim() ? `${reason} — ${extra.trim()}` : reason;
                await flagContent({ entityType, entityId, reason: fullReason });
                show({ tone: "success", title: "Signalement envoyé" });
                setOpen(false);
                setExtra("");
              } catch (err) {
                show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
              }
            });
          }}
          className="space-y-3"
        >
          <fieldset>
            <legend className="text-[12px] font-semibold text-ink-soft block mb-2">Motif</legend>
            <div className="space-y-1.5">
              {REASONS.map((r) => (
                <label key={r} className="flex items-center gap-2 text-[13px] cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="text-[12px] font-semibold text-ink-soft block mb-1">
              Précision (optionnel)
            </span>
            <textarea
              rows={3}
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              maxLength={300}
              className="w-full p-2.5 bg-surface border border-line-soft rounded text-[13.5px] text-ink resize-none outline-none focus:border-primary"
            />
          </label>
        </form>
      </Modal>
    </>
  );
}
