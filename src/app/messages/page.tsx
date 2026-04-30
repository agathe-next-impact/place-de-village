import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Avatar } from "@/components/ui/avatar";
import { listMyConversations } from "@/lib/queries";

export default async function Page() {
  const conv = await listMyConversations();
  return (
    <ScreenShell>
      <PageHeader
        subtitle="Messagerie interne · asynchrone"
        title="Mes conversations"
        action={<Link href="/aide" className="text-[12px] text-primary font-semibold underline">Aide</Link>}
      />
      {conv.length === 0 ? (
        <div className="px-[18px] py-12 text-center text-ink-muted text-[13px]">
          Vous n'avez pas encore de conversation. Ouvrez-en une depuis l'onglet « Entraide ».
        </div>
      ) : (
        <Section dense>
          {conv.map((c) => (
            <Link key={c.id} href={`/messages/${c.id}`} className="contents">
              <Surface as="button" className="w-full">
                <div className="flex items-center gap-2.5">
                  <Avatar name={c.other?.name ?? "?"} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] text-ink truncate">
                      {c.other?.name ?? "Inconnu"}
                    </div>
                    <div className="text-[11.5px] text-ink-muted truncate">
                      {c.entraide?.titre}
                    </div>
                    {c.lastMessage && (
                      <div className="text-[12.5px] text-ink-soft mt-1 truncate">
                        {c.lastMessage.body}
                      </div>
                    )}
                  </div>
                </div>
              </Surface>
            </Link>
          ))}
        </Section>
      )}
    </ScreenShell>
  );
}
