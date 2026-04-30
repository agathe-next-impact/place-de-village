"use client";

import { useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { publishSynthesis } from "@/lib/actions/agora";

export function SynthesisForm({ discussionId }: { discussionId: string }) {
  const [open, setOpen] = useState(false);
  const [texte, setTexte] = useState("");
  const [pending, start] = useTransition();
  const { show } = useToast();
  const valid = texte.trim().length >= 80;

  if (!open) {
    return (
      <Button size="sm" variant="ghost" icon={<FileText size={14} strokeWidth={1.6} />} onClick={() => setOpen(true)}>
        Publier une synthèse
      </Button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        start(async () => {
          try {
            await publishSynthesis({ discussionId, texte: texte.trim() });
            show({ tone: "success", title: "Synthèse publiée" });
            setOpen(false);
            setTexte("");
          } catch (err) {
            show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
          }
        });
      }}
      className="space-y-2"
    >
      <textarea
        rows={4}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder="Synthèse des positions exprimées, points de convergence, objections en suspens, prochaines étapes…"
        minLength={80}
        required
        className="w-full p-2.5 bg-surface border border-line-soft rounded text-[13.5px] text-ink resize-none outline-none focus:border-primary"
      />
      <div className="text-[11px] text-ink-muted">
        Minimum 80 caractères. La synthèse est visible publiquement et signée de votre nom.
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" type="button" onClick={() => setOpen(false)}>
          Annuler
        </Button>
        <Button size="sm" type="submit" disabled={!valid || pending}>
          Publier
        </Button>
      </div>
    </form>
  );
}
