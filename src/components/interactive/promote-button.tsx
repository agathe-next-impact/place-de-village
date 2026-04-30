"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { promoteToProposition } from "@/lib/actions/agora";

export function PromoteButton({
  discussionId,
  discussionTitre,
}: {
  discussionId: string;
  discussionTitre: string;
}) {
  const [open, setOpen] = useState(false);
  const [constat, setConstat] = useState("");
  const [propo, setPropo] = useState("");
  const [justif, setJustif] = useState("");
  const [vigil, setVigil] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const { show } = useToast();

  const valid =
    constat.trim().length >= 30 &&
    propo.trim().length >= 30 &&
    justif.trim().length >= 30 &&
    vigil.trim().length >= 10;

  return (
    <>
      <Button onClick={() => setOpen(true)}>Promouvoir en proposition</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Promouvoir en proposition"
        description="Format imposé pour cadrer la délibération. Friction maximale volontaire (CdC §2.1)."
        footer={
          <>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              full
              type="submit"
              form="promote-form"
              disabled={!valid || pending}
              className={!valid ? "opacity-60 cursor-not-allowed" : ""}
            >
              Soumettre
            </Button>
          </>
        }
      >
        <form
          id="promote-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            start(async () => {
              try {
                const titre = propo.split("\n")[0].slice(0, 90) || discussionTitre;
                const r = await promoteToProposition({
                  discussionId,
                  titre,
                  constat,
                  proposition: propo,
                  justification: justif,
                  vigilance: vigil,
                });
                show({
                  tone: "success",
                  title: "Proposition envoyée pour validation",
                  desc: "Le référent municipal vérifiera les prérequis.",
                });
                setOpen(false);
                router.push(`/propositions/${r.id}`);
              } catch (err) {
                show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
              }
            });
          }}
          className="space-y-3"
        >
          <Field label="Constat" help="Quelle situation observée appelle une décision ?" value={constat} onChange={setConstat} minLength={30} />
          <Field label="Proposition" help="Que proposez-vous, en une phrase actionnable ?" value={propo} onChange={setPropo} minLength={30} />
          <Field label="Justification" help="Quels arguments / données / retours d'expérience la fondent ?" value={justif} onChange={setJustif} minLength={30} />
          <Field label="Points de vigilance" help="Quelles objections sont à traiter dès la mise en œuvre ?" value={vigil} onChange={setVigil} minLength={10} />
        </form>
      </Modal>
    </>
  );
}

function Field({
  label,
  help,
  value,
  onChange,
  minLength,
}: {
  label: string;
  help: string;
  value: string;
  onChange: (v: string) => void;
  minLength: number;
}) {
  const ok = value.trim().length >= minLength;
  return (
    <div>
      <label className="text-[12px] font-semibold text-ink-soft block mb-1">{label}</label>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        className="w-full p-2.5 bg-surface border border-line-soft rounded text-[13.5px] text-ink resize-none outline-none focus:border-primary"
      />
      <div className="text-[10.5px] text-ink-muted mt-1">
        {help} {!ok && value.length > 0 && (
          <span className="text-danger"> — minimum {minLength} caractères</span>
        )}
      </div>
    </div>
  );
}
