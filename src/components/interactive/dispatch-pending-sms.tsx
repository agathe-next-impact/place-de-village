"use client";

import { useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { dispatchPendingNow } from "@/lib/actions/sms";

export function DispatchPendingButton() {
  const [pending, start] = useTransition();
  const { show } = useToast();
  return (
    <Button
      variant="ghost"
      icon={<Send size={14} strokeWidth={1.6} />}
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const r = await dispatchPendingNow();
            show({
              tone: "info",
              title: "Dispatch déclenché",
              desc: `${r.dispatched} SMS traité${r.dispatched > 1 ? "s" : ""}.`,
            });
          } catch (err) {
            show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
          }
        })
      }
    >
      Forcer le dispatch maintenant
    </Button>
  );
}
