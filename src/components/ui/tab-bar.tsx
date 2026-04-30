"use client";

import { Home, MapPin, MessageSquare, HandHeart, User } from "lucide-react";
import { cn } from "@/lib/cn";

export type TabId = "home" | "signal" | "agora" | "aide" | "me";

const TABS: { id: TabId; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: "home", label: "Accueil", Icon: Home },
  { id: "signal", label: "Signaler", Icon: MapPin },
  { id: "agora", label: "Agora", Icon: MessageSquare },
  { id: "aide", label: "Entraide", Icon: HandHeart },
  { id: "me", label: "Moi", Icon: User },
];

export function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <nav
      aria-label="Navigation principale"
      className="absolute bottom-0 left-0 right-0 flex bg-surface border-t border-line-soft pt-2 pb-7 z-30"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1.5 bg-transparent border-0",
              isActive ? "text-primary" : "text-ink-muted",
            )}
          >
            <tab.Icon size={22} strokeWidth={isActive ? 2 : 1.6} />
            <span
              className={cn(
                "text-[10.5px] tracking-[0.02em]",
                isActive ? "font-bold" : "font-medium",
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
