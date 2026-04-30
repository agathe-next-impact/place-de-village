// Cadre mobile pour la prévisualisation desktop. Sur mobile,
// l'écran prend toute la place. Cf. README — la cible production
// est une PWA mobile-first installable.

import Link from "next/link";
import { listAllUsers, getCurrentUserPub } from "@/lib/queries";
import { isAuthenticated } from "@/lib/auth";
import { RoleSwitcher } from "@/components/interactive/role-switcher";

export async function PhoneFrame({ children }: { children: React.ReactNode }) {
  const [users, me, authenticated] = await Promise.all([
    listAllUsers(),
    getCurrentUserPub(),
    isAuthenticated(),
  ]);
  return (
    <div className="min-h-screen w-full bg-bg flex flex-col items-center justify-center md:p-8 gap-3">
      <div className="w-full max-w-[420px] flex justify-end px-2">
        <RoleSwitcher
          profiles={users.map((u) => ({ id: u.id, name: u.name, role: u.role }))}
          currentId={me.id}
          authenticated={authenticated}
        />
      </div>
      <div
        className={[
          "relative w-full max-w-[420px] bg-bg",
          "min-h-screen md:min-h-[calc(100vh-4rem)] md:rounded-[28px] md:overflow-hidden",
          "md:shadow-[0_30px_80px_rgba(0,0,0,0.18)] md:border md:border-line-soft md:max-h-[900px]",
        ].join(" ")}
      >
        <div className="relative h-full overflow-y-auto pb-24 scrollbar-none">
          {children}
          <FooterLinks />
        </div>
      </div>
    </div>
  );
}

function FooterLinks() {
  return (
    <footer className="px-[18px] py-6 text-[11px] text-ink-muted flex flex-wrap gap-x-3 gap-y-1 justify-center border-t border-line-soft mt-6">
      <Link href="/mentions-legales" className="hover:text-ink underline">
        Mentions légales
      </Link>
      <Link href="/confidentialite" className="hover:text-ink underline">
        Confidentialité
      </Link>
      <Link href="/accessibilite" className="hover:text-ink underline">
        Accessibilité
      </Link>
      <Link href="/mes-donnees" className="hover:text-ink underline">
        Mes données
      </Link>
      <Link href="/auth/login" className="hover:text-ink underline">
        Se connecter
      </Link>
    </footer>
  );
}
