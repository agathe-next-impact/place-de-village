import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Avatar } from "@/components/ui/avatar";
import { getConversation } from "@/lib/queries";
import { MessageComposer } from "@/components/interactive/message-composer";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getConversation(id);
  if (!c) notFound();

  return (
    <ScreenShell>
      <PageHeader
        subtitle={c.entraide?.titre ?? "Conversation"}
        title={c.other?.name ?? "Conversation"}
        action={<Link href="/messages" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />

      <div className="px-[18px] flex flex-col gap-2">
        {c.messages.length === 0 ? (
          <div className="text-center text-ink-muted text-[13px] py-6">
            Pas encore de message. Vous pouvez en envoyer un ci-dessous.
          </div>
        ) : (
          c.messages.map((m) => {
            const mine = m.authorId === c.me.id;
            return (
              <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                {!mine && <Avatar name={c.other?.name ?? "?"} size={28} />}
                <div className={`max-w-[78%]`}>
                  <Surface
                    padded={false}
                    className={`p-2.5 ${mine ? "bg-primary text-white border-primary" : ""}`}
                  >
                    <div className="text-[13.5px] leading-[1.45] whitespace-pre-line">{m.body}</div>
                    <div
                      className={`text-[10.5px] mt-1 ${
                        mine ? "text-white/70" : "text-ink-muted"
                      }`}
                    >
                      {m.at.toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </Surface>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-[18px] py-4 mt-4 border-t border-line-soft sticky bottom-0 bg-bg">
        <MessageComposer conversationId={c.id} />
      </div>

      <div className="px-[18px] pb-4 text-[11px] text-ink-muted leading-relaxed">
        Messagerie asynchrone — pas de chat instantané. Vos coordonnées personnelles ne sont
        jamais exposées. Modération a posteriori : signaler un comportement inapproprié au
        référent municipal.
      </div>
    </ScreenShell>
  );
}
