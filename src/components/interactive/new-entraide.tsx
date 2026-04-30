"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { useToast } from "@/components/ui/toast";
import { createEntraide } from "@/lib/actions/aide";

export function NewEntraideForm() {
  const router = useRouter();
  const [type, setType] = useState<"demande" | "offre">("demande");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [quartier, setQuartier] = useState("Bourg");
  const [date, setDate] = useState("");
  const [pending, start] = useTransition();
  const { show } = useToast();
  const valid = titre.trim().length >= 5 && description.trim().length >= 10;

  return (
    <Surface>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          start(async () => {
            try {
              await createEntraide({ type, titre: titre.trim(), description: description.trim(), quartier, date: date || undefined });
              show({ tone: "success", title: "Annonce publiée", desc: titre });
              router.push("/aide");
            } catch (err) {
              show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
            }
          });
        }}
        className="space-y-3"
      >
        <fieldset>
          <legend className="text-[12px] font-semibold text-ink-soft block mb-2">Type</legend>
          <div className="flex gap-2">
            {(["demande", "offre"] as const).map((t) => {
              const active = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={active}
                  className={[
                    "flex-1 px-3 py-2 rounded font-semibold text-[13px] border min-h-[44px]",
                    active ? "bg-primary text-white border-primary" : "bg-surface border-line-soft text-ink",
                  ].join(" ")}
                >
                  {t === "demande" ? "↓ Je demande" : "↑ J'offre"}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-[12px] font-semibold text-ink-soft block mb-1">Titre</span>
          <input value={titre} onChange={(e) => setTitre(e.target.value)} required minLength={5} className="form-input" placeholder="Courses pour samedi" />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-soft block mb-1">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required minLength={10} className="form-input resize-none" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[12px] font-semibold text-ink-soft block mb-1">Quartier</span>
            <input value={quartier} onChange={(e) => setQuartier(e.target.value)} required className="form-input" />
          </label>
          <label className="block">
            <span className="text-[12px] font-semibold text-ink-soft block mb-1">Quand (optionnel)</span>
            <input value={date} onChange={(e) => setDate(e.target.value)} className="form-input" placeholder="samedi matin" />
          </label>
        </div>
        <Button full size="lg" type="submit" disabled={!valid || pending}>Publier</Button>
        <div className="text-[11.5px] text-ink-muted">
          Vos coordonnées personnelles ne sont jamais exposées. La mise en relation se fait par
          messagerie interne asynchrone.
        </div>
      </form>
      <style>{`.form-input{width:100%;padding:.5rem .75rem;background:#fff;border:1px solid #e3ddd2;border-radius:4px;font-size:14px;color:#1c1a17;outline:none;min-height:44px;font-family:inherit}.form-input:focus{border-color:#1f6e7a}`}</style>
    </Surface>
  );
}
