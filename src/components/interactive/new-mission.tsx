"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { useToast } from "@/components/ui/toast";
import { createMission } from "@/lib/actions/missions";

const CATS = ["Événements", "Aînés", "Espaces", "Périscolaire", "Solidarité", "Autre"];

export function NewMissionForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const { show } = useToast();
  const [v, setV] = useState({
    titre: "",
    cat: CATS[0],
    description: "",
    date: "",
    duree: "",
    lieu: "",
    besoin: 1,
    ref: "",
  });

  const valid =
    v.titre.trim().length >= 5 &&
    v.date.trim().length > 0 &&
    v.duree.trim().length > 0 &&
    v.lieu.trim().length > 0 &&
    v.ref.trim().length > 0;

  return (
    <Surface>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          start(async () => {
            try {
              const r = await createMission(v);
              show({ tone: "success", title: "Mission publiée", desc: v.titre });
              router.push(`/missions/${r.id}`);
            } catch (err) {
              show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
            }
          });
        }}
        className="space-y-3"
      >
        <Field label="Intitulé">
          <input
            value={v.titre}
            onChange={(e) => setV({ ...v, titre: e.target.value })}
            required
            minLength={5}
            className="form-input"
            placeholder="Préparation marché de Noël"
          />
        </Field>
        <Field label="Catégorie">
          <select value={v.cat} onChange={(e) => setV({ ...v, cat: e.target.value })} className="form-input">
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Description (contexte)">
          <textarea
            rows={3}
            value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })}
            className="form-input resize-none"
            placeholder="Ce qu'il faudra faire concrètement…"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Date">
            <input
              value={v.date}
              onChange={(e) => setV({ ...v, date: e.target.value })}
              required
              className="form-input"
              placeholder="sam. 6 déc."
            />
          </Field>
          <Field label="Durée">
            <input
              value={v.duree}
              onChange={(e) => setV({ ...v, duree: e.target.value })}
              required
              className="form-input"
              placeholder="4 h"
            />
          </Field>
        </div>
        <Field label="Lieu">
          <input
            value={v.lieu}
            onChange={(e) => setV({ ...v, lieu: e.target.value })}
            required
            className="form-input"
            placeholder="Salle des fêtes"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Bénévoles recherchés">
            <input
              type="number"
              min={1}
              max={99}
              value={v.besoin}
              onChange={(e) => setV({ ...v, besoin: Number(e.target.value) })}
              required
              className="form-input"
            />
          </Field>
          <Field label="Référent">
            <input
              value={v.ref}
              onChange={(e) => setV({ ...v, ref: e.target.value })}
              required
              className="form-input"
              placeholder="Comité des fêtes"
            />
          </Field>
        </div>

        <Button full type="submit" size="lg" disabled={!valid || pending}>
          Publier la mission
        </Button>
      </form>
      <style>{`.form-input{width:100%;padding:.5rem .75rem;background:#fff;border:1px solid #e3ddd2;border-radius:4px;font-size:14px;color:#1c1a17;outline:none;min-height:44px;font-family:inherit}.form-input:focus{border-color:#1f6e7a}`}</style>
    </Surface>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold text-ink-soft block mb-1">{label}</span>
      {children}
    </label>
  );
}
