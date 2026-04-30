"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { markAllRead } from "@/lib/actions/notifications";

export function MarkAllReadButton() {
  const [pending, start] = useTransition();
  const { show } = useToast();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await markAllRead();
            show({ tone: "info", title: "Marquées comme lues" });
          } catch (err) {
            show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
          }
        })
      }
    >
      Tout marquer lu
    </Button>
  );
}
