"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { useToast } from "@/components/ui/toast";
import { createPetiteAnnonce } from "@/lib/actions/petites-annonces";

const TYPES = ["don", "pret", "echange", "vente"] as const;
const CATS = ["Mobilier", "Outils", "Jardin", "Vêtements", "Alimentation", "Services", "Autre"];

export function NewPetiteAnnonceForm() {
  const router = useRouter();
  const [type, setType] = useState<typeof TYPES[number]>("don");
  const [cat, setCat] = useState(CATS[0]);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
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
              await createPetiteAnnonce({
                type,
                cat,
                titre: titre.trim(),
                description: description.trim(),
                prix: prix.trim() || undefined,
              });
              show({
                tone: "success",
                title: "Annonce publiée",
                desc: "Visible 30 jours, renouvelable.",
              });
              router.push("/petites-annonces");
            } catch (err) {
              show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
            }
          });
        }}
        className="space-y-3"
      >
        <fieldset>
          <legend className="text-[12px] font-semibold text-ink-soft block mb-2">Type</legend>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={[
                  "px-3 py-2 rounded font-semibold text-[13px] border min-h-[44px] capitalize",
                  type === t ? "bg-primary text-white border-primary" : "bg-surface border-line-soft text-ink",
                ].join(" ")}
              >
                {t === "pret" ? "prêt" : t === "echange" ? "échange" : t}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-[12px] font-semibold text-ink-soft block mb-1">Catégorie</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="form-input">
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-soft block mb-1">Titre</span>
          <input value={titre} onChange={(e) => setTitre(e.target.value)} required minLength={5} className="form-input" placeholder="Canapé 3 places" />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-soft block mb-1">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required minLength={10} className="form-input resize-none" />
        </label>
        {type === "vente" && (
          <label className="block">
            <span className="text-[12px] font-semibold text-ink-soft block mb-1">Prix (optionnel)</span>
            <input value={prix} onChange={(e) => setPrix(e.target.value)} className="form-input" placeholder="50 €" />
          </label>
        )}

        <Button full size="lg" type="submit" disabled={!valid || pending}>Publier</Button>
        <div className="text-[11.5px] text-ink-muted">
          Pas d'annonces commerciales. Modération a posteriori — la mairie peut retirer une
          annonce non conforme.
        </div>
      </form>
      <style>{`.form-input{width:100%;padding:.5rem .75rem;background:#fff;border:1px solid #e3ddd2;border-radius:4px;font-size:14px;color:#1c1a17;outline:none;min-height:44px;font-family:inherit}.form-input:focus{border-color:#1f6e7a}`}</style>
    </Surface>
  );
}
