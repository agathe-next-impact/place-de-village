"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { toggleSupport } from "@/lib/actions/agora";

export function SupportButton({
  propositionId,
  supported,
  titre,
  full,
  size = "md",
}: {
  propositionId: string;
  supported: boolean;
  titre: string;
  full?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [pending, start] = useTransition();
  const { show } = useToast();
  return (
    <Button
      full={full}
      size={size}
      variant={supported ? "secondary" : "primary"}
      icon={<Check size={size === "lg" ? 18 : 16} strokeWidth={2} />}
      aria-pressed={supported}
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const r = await toggleSupport(propositionId);
            show({
              tone: r.supported ? "success" : "info",
              title: r.supported ? "Soutien enregistré" : "Soutien retiré",
              desc: titre,
            });
          } catch (e) {
            show({ tone: "danger", title: "Erreur", desc: String(e instanceof Error ? e.message : e) });
          }
        })
      }
    >
      {supported ? "Soutenu ✓" : size === "lg" ? "Je soutiens" : "Soutenir"}
    </Button>
  );
}
