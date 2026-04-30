"use client";

import { Home, MapPin, MessageSquare, HandHeart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type TabId = "home" | "signal" | "agora" | "aide" | "me";

const TABS: {
  id: TabId;
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}[] = [
  { id: "home", href: "/", label: "Accueil", Icon: Home },
  { id: "signal", href: "/signalements", label: "Signaler", Icon: MapPin },
  { id: "agora", href: "/agora", label: "Agora", Icon: MessageSquare },
  { id: "aide", href: "/aide", label: "Entraide", Icon: HandHeart },
  { id: "me", href: "/moi", label: "Moi", Icon: User },
];

function activeFromPath(pathname: string): TabId {
  if (pathname.startsWith("/signalements") || pathname === "/signaler") return "signal";
  if (pathname.startsWith("/agora") || pathname.startsWith("/idees") || pathname.startsWith("/discussions") || pathname.startsWith("/propositions"))
    return "agora";
  if (pathname.startsWith("/aide") || pathname.startsWith("/messages")) return "aide";
  if (pathname.startsWith("/moi") || pathname.startsWith("/missions")) return "me";
  return "home";
}

export function TabBar() {
  const pathname = usePathname();
  const active = activeFromPath(pathname);
  return (
    <nav
      aria-label="Navigation principale"
      className="absolute bottom-0 left-0 right-0 flex bg-surface border-t border-line-soft pt-2 pb-7 z-30"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1.5 no-underline",
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
          </Link>
        );
      })}
    </nav>
  );
}
