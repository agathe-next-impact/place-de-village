"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { updateSignalementState } from "@/lib/actions/signal";

const NEXT_LABEL: Record<"pris-en-compte" | "en-cours" | "resolu", string> = {
  "pris-en-compte": "Prendre en compte",
  "en-cours": "Marquer en cours",
  resolu: "Marquer résolu",
};

export function SignalementStateUpdate({
  signalementId,
  current,
}: {
  signalementId: string;
  current: "signale" | "pris-en-compte" | "en-cours" | "resolu";
}) {
  const [pending, start] = useTransition();
  const [opening, setOpening] = useState<keyof typeof NEXT_LABEL | null>(null);
  const [comment, setComment] = useState("");
  const { show } = useToast();

  const order = ["signale", "pris-en-compte", "en-cours", "resolu"] as const;
  const idx = order.indexOf(current);
  const possibles = order.slice(idx + 1) as Array<keyof typeof NEXT_LABEL>;

  if (possibles.length === 0) {
    return (
      <div className="text-[12.5px] text-ink-muted">
        Signalement clôturé. Aucune action possible.
      </div>
    );
  }

  const submit = (next: keyof typeof NEXT_LABEL) => {
    start(async () => {
      try {
        await updateSignalementState({ signalementId, etat: next, comment: comment.trim() || undefined });
        show({ tone: "success", title: "État mis à jour", desc: NEXT_LABEL[next] });
        setOpening(null);
        setComment("");
      } catch (err) {
        show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
      }
    });
  };

  if (opening) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(opening);
        }}
        className="space-y-2"
      >
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-soft block mb-1">
            Commentaire (visible par le signalant et le public)
          </span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Service informé, intervention prévue cette semaine, …"
            className="w-full p-2.5 bg-surface border border-line-soft rounded text-[13.5px] text-ink resize-none outline-none focus:border-primary"
          />
        </label>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" type="button" onClick={() => setOpening(null)}>
            Annuler
          </Button>
          <Button size="sm" type="submit" disabled={pending}>
            Confirmer : {NEXT_LABEL[opening]}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {possibles.map((n) => (
        <Button
          key={n}
          size="sm"
          variant={n === "resolu" ? "primary" : "secondary"}
          onClick={() => setOpening(n)}
        >
          {NEXT_LABEL[n]}
        </Button>
      ))}
    </div>
  );
}
