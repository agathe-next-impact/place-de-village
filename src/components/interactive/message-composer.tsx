"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { sendMessage } from "@/lib/actions/aide";
import { track } from "@/lib/analytics";
import { EVENTS } from "@/lib/analytics-events";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  const { show } = useToast();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim()) return;
        start(async () => {
          try {
            await sendMessage({ conversationId, body: body.trim() });
            track(EVENTS.messageSent);
            setBody("");
          } catch (err) {
            show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
          }
        });
      }}
      className="flex gap-2 items-end"
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Votre message…"
        rows={2}
        className="flex-1 p-2.5 bg-surface border border-line-soft rounded text-[13.5px] text-ink resize-none outline-none focus:border-primary"
      />
      <Button type="submit" disabled={!body.trim() || pending} icon={<Send size={16} strokeWidth={2} />}>
        Envoyer
      </Button>
    </form>
  );
}
