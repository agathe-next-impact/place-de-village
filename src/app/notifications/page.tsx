import Link from "next/link";
import { Bell, BellOff, Check } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { listMyNotifications } from "@/lib/queries";
import { MarkAllReadButton } from "@/components/interactive/mark-all-read";

export default async function Page() {
  const items = await listMyNotifications();
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <ScreenShell>
      <PageHeader
        subtitle={`${unread} non lue${unread > 1 ? "s" : ""}`}
        title="Notifications"
        action={unread > 0 ? <MarkAllReadButton /> : null}
      />
      <Section dense>
        {items.length === 0 ? (
          <div className="px-[18px] py-12 text-center">
            <BellOff size={28} strokeWidth={1.6} className="text-ink-muted mx-auto mb-2" />
            <div className="text-[14px] font-semibold text-ink">Aucune notification.</div>
            <div className="text-[12.5px] text-ink-muted mt-1">
              Vous serez prévenu·e à chaque évolution importante.
            </div>
          </div>
        ) : (
          items.map((n) => {
            const inner = (
              <Surface
                className={!n.readAt ? "border-l-[3px] border-l-primary" : "opacity-80"}
              >
                <div className="flex items-start gap-2.5">
                  {!n.readAt ? (
                    <span aria-label="Non lue" className="w-2 h-2 mt-1.5 rounded-pill bg-primary flex-shrink-0" />
                  ) : (
                    <Check size={14} strokeWidth={1.6} className="text-ink-muted mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] text-ink">{n.titre}</div>
                    {n.body && <div className="text-[12.5px] text-ink-soft mt-0.5">{n.body}</div>}
                    <div className="text-[11px] text-ink-muted mt-1">
                      {n.at.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <Bell size={14} strokeWidth={1.6} className="text-ink-muted mt-1 flex-shrink-0" />
                </div>
              </Surface>
            );
            return n.href ? (
              <Link key={n.id} href={n.href} className="contents">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })
        )}
      </Section>
    </ScreenShell>
  );
}
