"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { addContribution } from "@/lib/actions/agora";

const TYPES = [
  { id: "accord" as const, label: "Accord", color: "#7a8c3a" },
  { id: "nuance" as const, label: "Nuance", color: "#1f6e7a" },
  { id: "objection" as const, label: "Objection", color: "#a8332b" },
  { id: "question" as const, label: "Question", color: "#e8a838" },
  { id: "factuel" as const, label: "Apport factuel", color: "#7a746c" },
];

export function ContributeForm({ discussionId }: { discussionId: string }) {
  const [type, setType] = useState<typeof TYPES[number]["id"]>("accord");
  const [texte, setTexte] = useState("");
  const [pending, start] = useTransition();
  const { show } = useToast();
  const valid = texte.trim().length >= 20;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        start(async () => {
          try {
            await addContribution({ discussionId, type, texte: texte.trim() });
            show({ tone: "success", title: "Contribution publiée" });
            setTexte("");
          } catch (err) {
            show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
          }
        });
      }}
    >
      <div className="text-[12px] font-semibold text-ink-soft mb-2">Type de contribution</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {TYPES.map((t) => {
          const active = type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              aria-pressed={active}
              className={[
                "px-2.5 py-1.5 rounded text-[12.5px] font-semibold border min-h-[36px]",
                active ? "border-current text-white" : "bg-surface-alt border-line-soft text-ink-soft",
              ].join(" ")}
              style={active ? { backgroundColor: t.color, borderColor: t.color } : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <textarea
        rows={3}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder="Votre contribution… (min. 20 caractères)"
        minLength={20}
        required
        className="w-full p-2.5 bg-surface border border-line-soft rounded text-[13.5px] text-ink resize-none outline-none focus:border-primary"
      />
      <div className="flex justify-end mt-2">
        <Button type="submit" disabled={!valid || pending} size="sm">
          Publier
        </Button>
      </div>
    </form>
  );
}
