"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  TRIZAC_DATA,
  type Signalement,
  type SignalementEtat,
  type Suggestion,
  type Mission,
  type Proposition,
} from "./data";

/**
 * Store applicatif côté client. En production, ces opérations seront des
 * Server Actions Next.js qui écrivent dans WordPress via WPGraphQL et
 * recalculent l'agrégat — cf. README "State management".
 *
 * Ici, on conserve les mutations en mémoire pour rendre la démo cliquable
 * (soutiens, inscriptions, signaux, nouveaux signalements / idées).
 */

type Signal = "vis" | "important" | "contribuer";

type StoreState = {
  signalements: Signalement[];
  suggestions: Suggestion[];
  propositions: Proposition[];
  missions: Mission[];
  /** propositions soutenues par l'utilisateur courant (set d'IDs). */
  supportedPropositions: Set<string>;
  /** missions auxquelles l'utilisateur est inscrit. */
  registeredMissions: Set<string>;
  /** signaux émis par l'utilisateur, scoping suggestionId → set de types. */
  emittedSignals: Record<string, Set<Signal>>;
};

type StoreActions = {
  addSignalement: (s: Omit<Signalement, "id" | "etat" | "auteur" | "date">) => Signalement;
  updateSignalementState: (id: string, etat: SignalementEtat) => void;
  addSuggestion: (s: Pick<Suggestion, "titre" | "cat">) => Suggestion;
  promoteToProposition: (
    s: Pick<Proposition, "titre" | "seuil"> & { discussionTitre?: string },
  ) => Proposition;
  toggleSupport: (propositionId: string) => boolean;
  toggleRegistration: (missionId: string) => boolean;
  emitSignal: (suggestionId: string, signal: Signal) => boolean;
};

type StoreContext = StoreState & StoreActions;

const StoreCtx = createContext<StoreContext | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [signalements, setSignalements] = useState<Signalement[]>(
    TRIZAC_DATA.signalements,
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>(
    TRIZAC_DATA.suggestions,
  );
  const [propositions, setPropositions] = useState<Proposition[]>(
    TRIZAC_DATA.propositions,
  );
  const [missions, setMissions] = useState<Mission[]>(TRIZAC_DATA.missions);

  const [supportedPropositions, setSupported] = useState<Set<string>>(new Set());
  const [registeredMissions, setRegistered] = useState<Set<string>>(new Set());
  const [emittedSignals, setEmitted] = useState<Record<string, Set<Signal>>>({});

  const addSignalement = useCallback<StoreActions["addSignalement"]>(
    (input) => {
      const id = `s-${Date.now()}`;
      const newOne: Signalement = {
        id,
        etat: "signale",
        auteur: TRIZAC_DATA.user.name.split(" ")[0] + " " + TRIZAC_DATA.user.name.split(" ")[1][0] + ".",
        date: "à l'instant",
        ...input,
      };
      setSignalements((prev) => [newOne, ...prev]);
      return newOne;
    },
    [],
  );

  const updateSignalementState = useCallback<
    StoreActions["updateSignalementState"]
  >((id, etat) => {
    setSignalements((prev) => prev.map((s) => (s.id === id ? { ...s, etat } : s)));
  }, []);

  const addSuggestion = useCallback<StoreActions["addSuggestion"]>(
    ({ titre, cat }) => {
      const id = `idx-${Date.now()}`;
      const u = TRIZAC_DATA.user.name.split(" ");
      const newOne: Suggestion = {
        id,
        titre,
        cat,
        auteur: `${u[0]} ${u[1][0]}.`,
        signaux: { vis: 0, important: 0, contribuer: 0 },
        contributions: 0,
        age: "à l'instant",
      };
      setSuggestions((prev) => [newOne, ...prev]);
      return newOne;
    },
    [],
  );

  const promoteToProposition = useCallback<StoreActions["promoteToProposition"]>(
    ({ titre, seuil }) => {
      const id = `p-${Date.now()}`;
      const newOne: Proposition = {
        id,
        titre,
        soutiens: 0,
        seuil,
        jours: 21,
        statut: "soutien",
      };
      setPropositions((prev) => [newOne, ...prev]);
      return newOne;
    },
    [],
  );

  const toggleSupport = useCallback<StoreActions["toggleSupport"]>(
    (propositionId) => {
      let now = false;
      setSupported((prev) => {
        const next = new Set(prev);
        if (next.has(propositionId)) {
          next.delete(propositionId);
          setPropositions((ps) =>
            ps.map((p) =>
              p.id === propositionId ? { ...p, soutiens: Math.max(0, p.soutiens - 1) } : p,
            ),
          );
          now = false;
        } else {
          next.add(propositionId);
          setPropositions((ps) =>
            ps.map((p) =>
              p.id === propositionId ? { ...p, soutiens: p.soutiens + 1 } : p,
            ),
          );
          now = true;
        }
        return next;
      });
      return now;
    },
    [],
  );

  const toggleRegistration = useCallback<StoreActions["toggleRegistration"]>(
    (missionId) => {
      let registered = false;
      setRegistered((prev) => {
        const next = new Set(prev);
        if (next.has(missionId)) {
          next.delete(missionId);
          setMissions((ms) =>
            ms.map((m) =>
              m.id === missionId ? { ...m, inscrits: Math.max(0, m.inscrits - 1) } : m,
            ),
          );
          registered = false;
        } else {
          next.add(missionId);
          setMissions((ms) =>
            ms.map((m) =>
              m.id === missionId && m.inscrits < m.besoin
                ? { ...m, inscrits: m.inscrits + 1 }
                : m,
            ),
          );
          registered = true;
        }
        return next;
      });
      return registered;
    },
    [],
  );

  const emitSignal = useCallback<StoreActions["emitSignal"]>(
    (suggestionId, signal) => {
      let added = false;
      setEmitted((prev) => {
        const next = { ...prev };
        const set = new Set(next[suggestionId] ?? []);
        if (set.has(signal)) {
          // unicité par habitant × cible × type — on retire si déjà émis
          set.delete(signal);
          setSuggestions((ss) =>
            ss.map((s) =>
              s.id === suggestionId
                ? {
                    ...s,
                    signaux: {
                      ...s.signaux,
                      [signal]: Math.max(0, s.signaux[signal] - 1),
                    },
                  }
                : s,
            ),
          );
          added = false;
        } else {
          set.add(signal);
          setSuggestions((ss) =>
            ss.map((s) =>
              s.id === suggestionId
                ? {
                    ...s,
                    signaux: { ...s.signaux, [signal]: s.signaux[signal] + 1 },
                  }
                : s,
            ),
          );
          added = true;
        }
        next[suggestionId] = set;
        return next;
      });
      return added;
    },
    [],
  );

  const value = useMemo<StoreContext>(
    () => ({
      signalements,
      suggestions,
      propositions,
      missions,
      supportedPropositions,
      registeredMissions,
      emittedSignals,
      addSignalement,
      updateSignalementState,
      addSuggestion,
      promoteToProposition,
      toggleSupport,
      toggleRegistration,
      emitSignal,
    }),
    [
      signalements,
      suggestions,
      propositions,
      missions,
      supportedPropositions,
      registeredMissions,
      emittedSignals,
      addSignalement,
      updateSignalementState,
      addSuggestion,
      promoteToProposition,
      toggleSupport,
      toggleRegistration,
      emitSignal,
    ],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
