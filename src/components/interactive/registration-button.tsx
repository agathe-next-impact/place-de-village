"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { toggleRegistration } from "@/lib/actions/missions";
import { track } from "@/lib/analytics";
import { EVENTS } from "@/lib/analytics-events";

export function RegistrationButton({
  missionId,
  registered,
  complet,
  titre,
  full,
  size = "sm",
}: {
  missionId: string;
  registered: boolean;
  complet: boolean;
  titre: string;
  full?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [pending, start] = useTransition();
  const { show } = useToast();

  if (complet && !registered) {
    return (
      <Button size={size} variant="ghost" disabled aria-disabled>
        Complet
      </Button>
    );
  }

  return (
    <Button
      size={size}
      full={full}
      variant={registered ? "secondary" : "primary"}
      aria-pressed={registered}
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const r = await toggleRegistration(missionId);
            if (r.registered) track(EVENTS.missionRegistered);
            show({
              tone: r.registered ? "success" : "info",
              title: r.registered ? "Inscription confirmée" : "Inscription annulée",
              desc: titre,
            });
          } catch (e) {
            show({ tone: "danger", title: "Erreur", desc: String(e instanceof Error ? e.message : e) });
          }
        })
      }
    >
      {registered ? "Inscrit·e ✓" : "Je m'inscris"}
    </Button>
  );
}
