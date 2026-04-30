"use client";

import { useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { toggleSignal } from "@/lib/actions/agora";
import { track } from "@/lib/analytics";
import { EVENTS } from "@/lib/analytics-events";

const LABEL: Record<"vis" | "important" | "contribuer", string> = {
  vis: "Je vis ça",
  important: "Important",
  contribuer: "Je contribue",
};

export function SignalButton({
  suggestionId,
  type,
  count,
  active,
  className,
}: {
  suggestionId: string;
  type: "vis" | "important" | "contribuer";
  count: number;
  active: boolean;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const { show } = useToast();

  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const r = await toggleSignal(suggestionId, type);
            if (r.added) track(EVENTS.signalEmitted, { type });
            show({
              tone: r.added ? "success" : "info",
              title: r.added ? "Signal enregistré" : "Signal retiré",
              desc: LABEL[type],
            });
          } catch (e) {
            show({ tone: "danger", title: "Erreur", desc: String(e instanceof Error ? e.message : e) });
          }
        })
      }
      className={[
        "rounded p-1.5 flex flex-col items-center gap-0.5 min-h-[44px] border transition-colors",
        active
          ? "bg-primary/10 border-primary text-primary"
          : "bg-surface-alt border-line-soft text-ink-soft active:bg-line-soft",
        pending ? "opacity-60" : "",
        className ?? "",
      ].join(" ")}
    >
      <div className="text-[11px] font-medium">{LABEL[type]}</div>
      <div
        className={[
          "text-[13px] font-bold tabular-nums",
          active ? "text-primary" : "text-ink",
        ].join(" ")}
      >
        {count}
      </div>
    </button>
  );
}
