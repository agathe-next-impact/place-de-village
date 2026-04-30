"use client";

import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: React.ReactNode;
};

export function PageHeader({ title, subtitle, onBack, action }: PageHeaderProps) {
  return (
    <header className="px-[18px] pt-3.5 pb-2.5 flex items-start gap-2.5">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour"
          className="w-9 h-9 rounded-pill bg-surface-alt border border-line-soft flex items-center justify-center text-ink mt-0.5 flex-shrink-0"
        >
          <ArrowLeft size={16} strokeWidth={1.6} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        {subtitle && (
          <div className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink-muted mb-1">
            {subtitle}
          </div>
        )}
        <h1 className="m-0 text-[26px] font-bold leading-[1.15] tracking-title text-ink">
          {title}
        </h1>
      </div>
      {action}
    </header>
  );
}
