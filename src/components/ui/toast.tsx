"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Check, Info, TriangleAlert, X } from "lucide-react";

type Tone = "success" | "info" | "danger";

type Toast = { id: string; tone: Tone; title: string; desc?: string };

type ToastCtx = {
  show: (t: Omit<Toast, "id">) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

const TONE_STYLE: Record<Tone, { color: string; Icon: typeof Check }> = {
  success: { color: "#7a8c3a", Icon: Check },
  info: { color: "#1f6e7a", Icon: Info },
  danger: { color: "#a8332b", Icon: TriangleAlert },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastCtx["show"]>((t) => {
    const id = `t-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
      >
        {toasts.map((t) => {
          const tone = TONE_STYLE[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto w-full max-w-[400px] bg-surface border border-line-soft rounded-lg shadow-fab-lg p-3 flex items-start gap-2.5"
              style={{ borderLeftWidth: 3, borderLeftColor: tone.color }}
            >
              <tone.Icon
                size={18}
                strokeWidth={1.8}
                className="flex-shrink-0 mt-0.5"
                style={{ color: tone.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-ink">
                  {t.title}
                </div>
                {t.desc && (
                  <div className="text-[12px] text-ink-soft mt-0.5">{t.desc}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Fermer la notification"
                className="text-ink-muted hover:text-ink p-1 -m-1 rounded"
              >
                <X size={14} strokeWidth={1.6} />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/**
 * Hook utilitaire pour les fenêtres modales : ferme avec Escape.
 */
export function useEscapeToClose(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}
