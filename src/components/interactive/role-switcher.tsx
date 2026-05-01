"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, LogOut, Users } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { logout, switchUser } from "@/lib/actions/auth";

type Profile = { id: string; name: string; role: string };

export function RoleSwitcher({
  profiles,
  currentId,
  authenticated,
  demoMode = false,
}: {
  profiles: Profile[];
  currentId: string;
  authenticated: boolean;
  demoMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const { show } = useToast();
  const router = useRouter();
  const current = profiles.find((p) => p.id === currentId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-line-soft bg-surface text-[12px] font-semibold text-ink-soft min-h-[36px]"
      >
        <Users size={14} strokeWidth={1.6} />
        {current?.name ?? "Profil"}
        {demoMode && <span className="text-ink-muted">· {authenticated ? "session" : "démo"}</span>}
      </button>
      {open && (
        <ul
          role="menu"
          aria-label="Profils"
          className="absolute right-0 top-full mt-1 z-40 min-w-[260px] bg-surface border border-line-soft rounded-lg shadow-fab-lg py-1 max-h-[60vh] overflow-y-auto"
        >
          {demoMode && (
            <>
              <li className="px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-eyebrow text-ink-muted border-b border-line-soft">
                Démo · changer de profil
              </li>
              {profiles.map((p) => {
                const active = p.id === currentId;
                return (
                  <li key={p.id} role="none">
                    <button
                      role="menuitemradio"
                      aria-checked={active}
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          try {
                            await switchUser(p.id);
                            show({ tone: "info", title: "Profil changé", desc: `${p.name} (${p.role})` });
                            setOpen(false);
                          } catch (err) {
                            show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
                          }
                        })
                      }
                      className={[
                        "w-full text-left px-3 py-2 text-[13px] flex items-center justify-between gap-2",
                        active ? "bg-primary/10 text-primary font-semibold" : "text-ink hover:bg-surface-alt",
                      ].join(" ")}
                    >
                      <span>{p.name}</span>
                      <span className="text-[10.5px] uppercase tracking-eyebrow text-ink-muted">{p.role}</span>
                    </button>
                  </li>
                );
              })}
              <li role="none" className="border-t border-line-soft mt-1 pt-1" />
            </>
          )}
          {authenticated ? (
            <li role="none">
              <button
                role="menuitem"
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    try {
                      await logout();
                      show({ tone: "info", title: "Déconnecté·e" });
                      setOpen(false);
                      router.push("/auth/login");
                    } catch (err) {
                      show({ tone: "danger", title: "Erreur", desc: String(err instanceof Error ? err.message : err) });
                    }
                  })
                }
                className="w-full text-left px-3 py-2 text-[13px] text-danger hover:bg-surface-alt flex items-center gap-2"
              >
                <LogOut size={14} strokeWidth={1.6} />
                Se déconnecter
              </button>
            </li>
          ) : (
            <li role="none">
              <Link
                href="/auth/login"
                role="menuitem"
                className="w-full text-left px-3 py-2 text-[13px] text-ink hover:bg-surface-alt flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <LogIn size={14} strokeWidth={1.6} />
                Se connecter
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
