import Link from "next/link";
import { Search } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { searchCcm } from "@/lib/queries";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const items = await searchCcm(q);

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Pôle 5 — Vie locale"
        title="Conseil municipal"
        action={<Link href="/agenda" className="text-[12px] text-primary font-semibold underline">Agenda</Link>}
      />

      <form action="/conseil-municipal" method="get" className="px-[18px] pb-3.5">
        <label className="relative block">
          <span className="sr-only">Recherche dans les comptes rendus</span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
            <Search size={16} strokeWidth={1.6} />
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher : voirie, école, budget…"
            className="w-full pl-9 pr-3 py-2.5 bg-surface border border-line-soft rounded text-[14px] text-ink outline-none focus:border-primary min-h-[44px]"
          />
        </label>
      </form>

      <Section dense>
        {items.length === 0 ? (
          <div className="px-[18px] py-12 text-center text-ink-muted text-[13px]">
            Aucun compte rendu ne correspond à votre recherche.
          </div>
        ) : (
          items.map((c) => (
            <Surface key={c.id}>
              <div className="text-[11.5px] text-ink-muted">{c.date}</div>
              <div className="font-bold text-[15.5px] text-ink leading-[1.3] tracking-title mt-1">
                {c.titre}
              </div>
              <div className="text-[13px] text-ink-soft mt-2 leading-[1.5]">{c.body}</div>
              {c.themes && (
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                  {c.themes.split(",").map((t) => (
                    <Chip size="sm" key={t}>{t.trim()}</Chip>
                  ))}
                </div>
              )}
            </Surface>
          ))
        )}
      </Section>
    </ScreenShell>
  );
}
