import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TrizacMark } from "@/components/ui/trizac-mark";

const LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/accessibilite", label: "Accessibilité" },
  { href: "/mes-donnees", label: "Mes données" },
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-line-soft">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-ink no-underline">
            <ArrowLeft size={18} strokeWidth={1.6} />
            <TrizacMark size={24} />
          </Link>
          <span className="sr-only">Pages institutionnelles</span>
        </div>
      </header>
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        {children}
        <nav
          aria-label="Pages institutionnelles"
          className="mt-10 pt-6 border-t border-line-soft flex flex-wrap gap-3 text-[13px]"
        >
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-primary underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
