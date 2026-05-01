import Link from "next/link";
import { Plus } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { listPetitesAnnonces, getCurrentUserPub } from "@/lib/queries";
import { FlagButton } from "@/components/interactive/flag-button";

const TYPE_LABEL: Record<string, string> = {
  don: "Don",
  pret: "Prêt",
  echange: "Échange",
  vente: "Vente",
};
const TYPE_COLOR: Record<string, string> = {
  don: "#7a8c3a",
  pret: "#1f6e7a",
  echange: "#e8a838",
  vente: "#7a746c",
};

export default async function Page() {
  const [items, me] = await Promise.all([listPetitesAnnonces(), getCurrentUserPub()]);
  return (
    <ScreenShell>
      <PageHeader
        subtitle="Pôle 5 — Vie locale"
        title="Petites annonces"
        action={
          <Link
            href="/petites-annonces/nouvelle"
            aria-label="Nouvelle annonce"
            className="w-10 h-10 rounded-pill bg-primary text-white flex items-center justify-center shadow-fab no-underline"
          >
            <Plus size={20} strokeWidth={2} />
          </Link>
        }
      />

      <div className="px-[18px] text-[12.5px] text-ink-soft mb-2">
        Don, prêt, échange, vente entre particuliers de la commune. Durée 30 jours, renouvelable.
        <strong className="block text-ink-muted text-[11px] mt-1">Pas d'annonces commerciales.</strong>
      </div>

      <Section dense>
        {items.length === 0 ? (
          <div className="px-[18px] py-12 text-center">
            <div className="text-ink-muted text-[13px] mb-3">
              Aucune annonce active.
            </div>
            <Link
              href="/petites-annonces/nouvelle"
              className="inline-flex items-center px-3.5 py-2 rounded bg-primary text-white text-[13px] font-semibold no-underline min-h-[36px]"
            >
              Publier la première annonce
            </Link>
          </div>
        ) : (
          items.map((a) => (
            <Surface key={a.id}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Chip size="sm" color={TYPE_COLOR[a.type]}>{TYPE_LABEL[a.type]}</Chip>
                <Chip size="sm">{a.cat}</Chip>
              </div>
              <div className="font-bold text-[15px] text-ink leading-[1.3] tracking-title">{a.titre}</div>
              <div className="text-[13px] text-ink-soft mt-1.5 leading-[1.5]">{a.description}</div>
              {a.prix && (
                <div className="text-[12.5px] text-ink mt-2 font-semibold">{a.prix}</div>
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="text-[11px] text-ink-muted">
                  {a.auteur} · expire le {a.expiresAt.toLocaleDateString("fr-FR")}
                </div>
                {a.auteurId !== me.id && <FlagButton entityType="petite_annonce" entityId={a.id} />}
              </div>
            </Surface>
          ))
        )}
      </Section>
    </ScreenShell>
  );
}
