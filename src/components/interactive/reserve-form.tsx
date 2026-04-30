"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { useToast } from "@/components/ui/toast";
import { createReservation } from "@/lib/actions/reservations";
import { track } from "@/lib/analytics";
import { EVENTS } from "@/lib/analytics-events";

export function ReserveForm({ equipementId }: { equipementId: string }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);
  const [start, setStart] = useState(tomorrow);
  const [end, setEnd] = useState(tomorrow);
  const [motif, setMotif] = useState("");
  const [pending, startT] = useTransition();
  const { show } = useToast();
  const valid = motif.trim().length >= 5 && start <= end;

  return (
    <Surface>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          startT(async () => {
            try {
              await createReservation({ equipementId, startIso: start, endIso: end, motif: motif.trim() });
              track(EVENTS.reservationRequested);
              show({ tone: "success", title: "Demande envoyée", desc: "En attente de validation." });
              router.push("/reservation");
            } catch (err) {
              show({ tone: "danger", title: "Indisponible", desc: String(err instanceof Error ? err.message : err) });
            }
          });
        }}
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[12px] font-semibold text-ink-soft block mb-1">Du</span>
            <input
              type="date"
              min={today}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              className="form-input"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-semibold text-ink-soft block mb-1">Au</span>
            <input
              type="date"
              min={start}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
              className="form-input"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-soft block mb-1">Motif</span>
          <input
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            required
            minLength={5}
            className="form-input"
            placeholder="Anniversaire de famille, AG association, …"
          />
        </label>
        <Button full size="lg" type="submit" disabled={!valid || pending}>Demander</Button>
      </form>
      <style>{`.form-input{width:100%;padding:.5rem .75rem;background:#fff;border:1px solid #e3ddd2;border-radius:4px;font-size:14px;color:#1c1a17;outline:none;min-height:44px;font-family:inherit}.form-input:focus{border-color:#1f6e7a}`}</style>
    </Surface>
  );
}
