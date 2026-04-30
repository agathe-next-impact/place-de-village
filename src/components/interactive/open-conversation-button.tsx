"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { openConversation } from "@/lib/actions/aide";
import { track } from "@/lib/analytics";
import { EVENTS } from "@/lib/analytics-events";

export function OpenConversationButton({
  entraideId,
  label,
  icon,
}: {
  entraideId: string;
  label: string;
  icon?: React.ReactNode;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="primary"
      icon={icon}
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const r = await openConversation(entraideId);
            track(EVENTS.conversationOpened);
            router.push(`/messages/${r.id}`);
          } catch (err) {
            show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
          }
        })
      }
    >
      {label}
    </Button>
  );
}
