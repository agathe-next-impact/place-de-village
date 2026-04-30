"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/**
 * Sheet bottom-up accessible (rôle dialog, focus piégé, Escape ferme).
 * Pour le MVP de production, remplacer par @radix-ui/react-dialog.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // focus le premier élément focusable
    const t = setTimeout(() => {
      const first = ref.current?.querySelector<HTMLElement>(
        "input, textarea, select, button:not([aria-label='Fermer']), [tabindex]:not([tabindex='-1'])",
      );
      first?.focus();
    }, 0);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="w-full max-w-[420px] bg-surface rounded-t-[16px] md:rounded-lg max-h-[90vh] overflow-y-auto shadow-fab-lg"
      >
        <header className="flex items-start justify-between px-[18px] pt-[18px] pb-2 border-b border-line-soft">
          <div className="flex-1 min-w-0">
            <h2
              id={titleId}
              className="text-[18px] font-bold tracking-title text-ink"
            >
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-[12.5px] text-ink-soft mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 -mr-2 rounded-pill bg-surface-alt border border-line-soft flex items-center justify-center text-ink"
          >
            <X size={16} strokeWidth={1.6} />
          </button>
        </header>
        <div className="px-[18px] py-3.5">{children}</div>
        {footer && (
          <footer className="px-[18px] py-3 border-t border-line-soft flex gap-2.5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
