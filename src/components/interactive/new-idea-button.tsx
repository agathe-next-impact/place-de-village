"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createSuggestion } from "@/lib/actions/agora";
import { track } from "@/lib/analytics";
import { EVENTS } from "@/lib/analytics-events";

const CATEGORIES = [
  "Cadre de vie",
  "Mobilité",
  "Jeunesse",
  "Aînés",
  "Environnement",
  "Vie locale",
];

export function NewIdeaButton() {
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState("");
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [pending, start] = useTransition();
  const { show } = useToast();
  const valid = titre.trim().length >= 10;

  return (
    <>
      <button
        type="button"
        aria-label="Nouvelle idée"
        onClick={() => setOpen(true)}
        className="bg-primary text-white px-[18px] py-3 rounded-pill font-semibold text-[14px] flex items-center gap-2 shadow-fab-lg min-h-[44px]"
      >
        <Plus size={16} strokeWidth={2} />
        Nouvelle idée
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Proposer une idée"
        description="Décrivez en une phrase ce que vous aimeriez voir évoluer dans la commune."
        footer={
          <>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              full
              type="submit"
              form="new-idea-form"
              disabled={!valid || pending}
              className={!valid ? "opacity-60 cursor-not-allowed" : ""}
            >
              Publier
            </Button>
          </>
        }
      >
        <form
          id="new-idea-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            start(async () => {
              try {
                await createSuggestion({ titre: titre.trim(), cat });
                track(EVENTS.ideaCreated, { cat });
                show({
                  tone: "success",
                  title: "Idée publiée",
                  desc: "Les habitants peuvent désormais émettre des signaux.",
                });
                setTitre("");
                setOpen(false);
              } catch (err) {
                show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
              }
            });
          }}
        >
          <label htmlFor="idee-titre" className="text-[12px] font-semibold text-ink-soft block mb-1.5">
            Votre idée
          </label>
          <textarea
            id="idee-titre"
            rows={3}
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex. Créer un verger partagé près de l'école"
            required
            minLength={10}
            className="w-full p-3 bg-surface border border-line-soft rounded text-[14px] text-ink resize-none outline-none focus:border-primary"
          />
          <div className="text-[11px] text-ink-muted mt-1">
            {titre.length} caractères
            {!valid && titre.length > 0 && (
              <span className="text-danger"> — minimum 10</span>
            )}
          </div>

          <label htmlFor="idee-cat" className="text-[12px] font-semibold text-ink-soft block mb-1.5 mt-3">
            Thématique
          </label>
          <select
            id="idee-cat"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-line-soft rounded text-[14px] text-ink outline-none focus:border-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="text-[11.5px] text-ink-muted mt-3 leading-relaxed">
            En publiant, vous acceptez la modération a posteriori et la{" "}
            <Link href="/confidentialite" className="text-primary underline">
              politique de confidentialité
            </Link>
            .
          </div>
        </form>
      </Modal>
    </>
  );
}
