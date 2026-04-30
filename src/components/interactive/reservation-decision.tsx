"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { updateReservationStatus } from "@/lib/actions/reservations";

export function ReservationDecision({ reservationId }: { reservationId: string }) {
  const [pending, start] = useTransition();
  const [refusing, setRefusing] = useState(false);
  const [motif, setMotif] = useState("");
  const { show } = useToast();

  const decide = (next: "valide" | "refus", refusMotif?: string) =>
    start(async () => {
      try {
        await updateReservationStatus(reservationId, next, refusMotif);
        show({
          tone: next === "valide" ? "success" : "info",
          title: next === "valide" ? "Réservation validée" : "Réservation refusée",
        });
      } catch (err) {
        show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
      }
    });

  return (
    <div className="mt-2">
      {refusing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            decide("refus", motif.trim() || "Motif non précisé");
            setRefusing(false);
            setMotif("");
          }}
          className="space-y-2"
        >
          <input
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Motif du refus (recommandé)"
            className="w-full px-3 py-2 bg-surface border border-line-soft rounded text-[13px] outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" type="button" onClick={() => setRefusing(false)}>
              Annuler
            </Button>
            <Button size="sm" type="submit" className="bg-danger border-danger text-white" disabled={pending}>
              Confirmer le refus
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" disabled={pending} onClick={() => decide("valide")}>
            Valider
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setRefusing(true)}>
            Refuser…
          </Button>
        </div>
      )}
    </div>
  );
}
