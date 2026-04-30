"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Sparkles, TriangleAlert } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useStaticDiscussions } from "@/screens/agora";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const D = useStaticDiscussions();
  const d = D.find((x) => x.id === id);
  const [openPromote, setOpenPromote] = useState(false);

  if (!d) {
    return (
      <ScreenShell active="agora">
        <PageHeader
          title="Discussion introuvable"
          subtitle="Erreur"
          onBack={() => router.push("/?tab=agora")}
        />
      </ScreenShell>
    );
  }

  const segs = [
    { val: d.accord, color: "#7a8c3a", label: "accords" },
    { val: d.nuance, color: "#1f6e7a", label: "nuances" },
    { val: d.objection, color: "#a8332b", label: "objections" },
    { val: d.question, color: "#e8a838", label: "questions" },
  ];

  return (
    <ScreenShell active="agora">
      <PageHeader
        subtitle="Discussion"
        title={d.titre}
        onBack={() => router.push("/?tab=agora")}
      />

      <div className="px-[18px]">
        <Surface>
          <div className="text-[12px] text-ink-muted">
            Animé par {d.anim} · {d.contribs} contributions
          </div>
          <div className="flex h-2 rounded overflow-hidden mt-3 gap-px" aria-hidden>
            {segs.map((s) => (
              <div key={s.label} style={{ flex: s.val, backgroundColor: s.color }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-[12px] text-ink-soft">
            {segs.map((s) => (
              <span key={s.label}>
                <span className="font-bold" style={{ color: s.color }}>
                  {s.val}
                </span>{" "}
                {s.label}
              </span>
            ))}
          </div>
          {d.derniereSynth && (
            <div className="mt-3 px-2.5 py-2 bg-surface-alt rounded text-[12px] text-ink-soft flex items-center gap-1.5">
              <FileText size={12} strokeWidth={1.6} /> Synthèse du {d.derniereSynth}
            </div>
          )}
        </Surface>
      </div>

      <Section title="Contributions structurées">
        <Surface>
          <div className="text-[12px] text-ink-soft mb-2.5">
            5 types imposés pour structurer la délibération sans dériver en fil
            de commentaires.
          </div>
          <ul className="space-y-2 text-[13px]">
            {(
              [
                { c: "#7a8c3a", t: "Accord", desc: "« Je partage ce constat / cette orientation. »" },
                { c: "#1f6e7a", t: "Nuance", desc: "« Je nuance, voici à quelle condition. »" },
                { c: "#a8332b", t: "Objection", desc: "« Voici pourquoi je m'y oppose et ce qui doit être traité. »" },
                { c: "#e8a838", t: "Question", desc: "« Avant d'avancer, voici ce qu'il manque comme info. »" },
                { c: "#7a746c", t: "Apport factuel", desc: "« Voici une donnée, un exemple, un retour d'expérience. »" },
              ] as const
            ).map((x) => (
              <li key={x.t} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="w-2 h-2 mt-1.5 rounded-pill flex-shrink-0"
                  style={{ backgroundColor: x.c }}
                />
                <div>
                  <span className="font-semibold text-ink">{x.t}</span> —{" "}
                  <span className="text-ink-soft">{x.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </Surface>
      </Section>

      {d.mature ? (
        <Section title="Maturité">
          <div className="bg-success/10 border border-success/30 rounded-lg p-3.5 flex items-start gap-2.5">
            <Sparkles size={18} strokeWidth={1.8} className="text-success flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-[13.5px] text-ink">
                Maturation suffisante atteinte
              </div>
              <div className="text-[12px] text-ink-soft mt-1">
                La discussion peut être promue en proposition. La promotion
                exige la validation d'un référent municipal et un format imposé
                (constat / proposition / justification / vigilance).
              </div>
              <div className="mt-2.5">
                <Button onClick={() => setOpenPromote(true)}>
                  Promouvoir en proposition
                </Button>
              </div>
            </div>
          </div>
        </Section>
      ) : (
        <Section title="Maturité">
          <div className="bg-surface-alt rounded-lg p-3.5 flex items-start gap-2.5 text-[12.5px] text-ink-soft">
            <TriangleAlert
              size={16}
              strokeWidth={1.8}
              className="text-ink-muted flex-shrink-0 mt-0.5"
            />
            La discussion n'a pas encore atteint le seuil de maturité (objections
            traitées, synthèse récente, volume de contributions).
          </div>
        </Section>
      )}

      <PromoteModal
        open={openPromote}
        onClose={() => setOpenPromote(false)}
        title={d.titre}
      />
    </ScreenShell>
  );
}

function PromoteModal({
  open,
  onClose,
  title,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
}) {
  const [constat, setConstat] = useState("");
  const [propo, setPropo] = useState("");
  const [justif, setJustif] = useState("");
  const [vigil, setVigil] = useState("");
  const { promoteToProposition } = useStore();
  const { show } = useToast();
  const router = useRouter();

  const valid =
    constat.trim().length >= 30 &&
    propo.trim().length >= 30 &&
    justif.trim().length >= 30 &&
    vigil.trim().length >= 10;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const created = promoteToProposition({ titre: propo.split("\n")[0].slice(0, 90) || title, seuil: 100 });
    show({
      tone: "success",
      title: "Proposition envoyée pour validation",
      desc: "Le référent municipal vérifiera les prérequis sous 7 jours.",
    });
    onClose();
    router.push(`/propositions/${created.id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Promouvoir en proposition"
      description="Format imposé pour cadrer la délibération. Friction maximale volontaire (cf. CdC §2.1)."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button
            full
            type="submit"
            form="promote-form"
            disabled={!valid}
            className={!valid ? "opacity-60 cursor-not-allowed" : ""}
          >
            Soumettre
          </Button>
        </>
      }
    >
      <form id="promote-form" onSubmit={submit} className="space-y-3">
        <Field
          label="Constat"
          help="Quelle situation observée appelle une décision ?"
          value={constat}
          onChange={setConstat}
          minLength={30}
        />
        <Field
          label="Proposition"
          help="Que proposez-vous, en une phrase actionnable ?"
          value={propo}
          onChange={setPropo}
          minLength={30}
        />
        <Field
          label="Justification"
          help="Quels arguments / données / retours d'expérience la fondent ?"
          value={justif}
          onChange={setJustif}
          minLength={30}
        />
        <Field
          label="Points de vigilance"
          help="Quelles objections sont à traiter dès la mise en œuvre ?"
          value={vigil}
          onChange={setVigil}
          minLength={10}
        />
      </form>
    </Modal>
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
      <label className="text-[12px] font-semibold text-ink-soft block mb-1">
        {label}
      </label>
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
