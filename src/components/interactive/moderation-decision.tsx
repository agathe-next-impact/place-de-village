"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { resolveFlag } from "@/lib/actions/moderation";

export function ModerationDecision({ flagId }: { flagId: number }) {
  const [pending, start] = useTransition();
  const { show } = useToast();

  const decide = (status: "traite" | "ignore") =>
    start(async () => {
      try {
        await resolveFlag(flagId, status);
        show({
          tone: status === "traite" ? "success" : "info",
          title: status === "traite" ? "Signalement traité" : "Signalement ignoré",
        });
      } catch (err) {
        show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
      }
    });

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => decide("traite")}>
        Traiter
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => decide("ignore")}>
        Ignorer
      </Button>
    </div>
  );
}
