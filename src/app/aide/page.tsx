import Link from "next/link";
import { ArrowDown, ArrowUp, MessageSquare, Plus } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Avatar } from "@/components/ui/avatar";
import { listEntraide, getCurrentUserPub } from "@/lib/queries";
import { OpenConversationButton } from "@/components/interactive/open-conversation-button";
import { FlagButton } from "@/components/interactive/flag-button";

type Filter = "tout" | "demande" | "offre";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const sp = await searchParams;
  const view: Filter =
    sp.view === "demande" ? "demande" : sp.view === "offre" ? "offre" : "tout";
  const [items, me] = await Promise.all([listEntraide(), getCurrentUserPub()]);
  const filtered = view === "tout" ? items : items.filter((e) => e.type === view);

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Pôle 4"
        title="Entraide entre voisins"
        action={
          <Link
            href="/aide/nouvelle"
            aria-label="Nouvelle annonce"
            className="w-10 h-10 rounded-pill bg-primary text-white flex items-center justify-center shadow-fab no-underline"
          >
            <Plus size={20} strokeWidth={2} />
          </Link>
        }
      />

      <div className="px-[18px] pb-3.5 flex items-center justify-between gap-2">
        <div className="flex bg-surface-alt p-[3px] rounded gap-0.5 flex-1">
          {(
            [
              { id: "tout" as const, label: "Tout", href: "/aide" },
              { id: "demande" as const, label: "Demandes", href: "/aide?view=demande" },
              { id: "offre" as const, label: "Offres", href: "/aide?view=offre" },
            ]
          ).map((o) => {
            const active = view === o.id;
            return (
              <Link
                key={o.id}
                href={o.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex-1 px-2.5 py-2 rounded font-semibold text-[13px] no-underline text-center min-h-[36px] flex items-center justify-center",
                  active ? "bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "text-ink-muted",
                ].join(" ")}
              >
                {o.label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/messages"
          className="text-[12px] text-primary font-semibold underline whitespace-nowrap"
        >
          Mes messages
        </Link>
      </div>

      <Section dense>
        {filtered.length === 0 ? (
          <div className="px-[18px] py-12 text-center text-ink-muted text-[13px]">
            Aucune annonce. Le bouton « + » permet d'en publier une.
          </div>
        ) : (
          filtered.map((e) => {
            const isDemande = e.type === "demande";
            const c = isDemande ? "#1f6e7a" : "#7a8c3a";
            const Icon = isDemande ? ArrowDown : ArrowUp;
            const isMine = e.auteurId === me.id;
            return (
              <Surface key={e.id}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-eyebrow px-2 py-0.5 rounded-pill flex items-center gap-1"
                    style={{ backgroundColor: `${c}22`, color: c }}
                  >
                    <Icon size={10} strokeWidth={2} />
                    {isDemande ? "demande" : "offre"}
                  </span>
                  <span className="text-[11.5px] text-ink-muted">· {e.quartier}</span>
                </div>
                <div className="font-bold text-[15.5px] text-ink leading-[1.3] tracking-title">{e.titre}</div>
                <div className="text-[13px] text-ink-soft mt-1.5 leading-[1.5]">{e.description}</div>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-line-soft">
                  <div className="flex items-center gap-2">
                    <Avatar name={e.auteur} size={26} />
                    <div>
                      <div className="text-[12px] font-semibold text-ink">
                        {e.auteur}
                        {e.age ? `, ${e.age}` : ""}
                      </div>
                      {e.date && <div className="text-[11px] text-ink-muted">{e.date}</div>}
                    </div>
                  </div>
                  {isMine ? (
                    <span className="text-[11.5px] text-ink-muted italic">Votre annonce</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <FlagButton entityType="entraide" entityId={e.id} />
                      <OpenConversationButton
                        entraideId={e.id}
                        label={isDemande ? "Aider" : "Contacter"}
                        icon={<MessageSquare size={14} strokeWidth={1.6} />}
                      />
                    </div>
                  )}
                </div>
              </Surface>
            );
          })
        )}
      </Section>
    </ScreenShell>
  );
}
