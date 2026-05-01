import Link from "next/link";
import { Search } from "lucide-react";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { searchAll, type SearchEntityType } from "@/lib/search";

const TYPE_LABEL: Record<SearchEntityType, string> = {
  ccm: "Conseil municipal",
  suggestion: "Idée Agora",
  proposition: "Proposition",
  annonce: "Annonce mairie",
  signalement: "Signalement",
  petite_annonce: "Petite annonce",
};

const TYPE_COLOR: Record<SearchEntityType, string> = {
  ccm: "#1f6e7a",
  suggestion: "#e8a838",
  proposition: "#1f6e7a",
  annonce: "#1f6e7a",
  signalement: "#a8332b",
  petite_annonce: "#7a8c3a",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const filter = sp.type as SearchEntityType | undefined;
  const hits = q
    ? await searchAll(q, filter ? { types: [filter], limit: 60 } : { limit: 60 })
    : [];

  // Group by type for display
  const grouped = new Map<SearchEntityType, typeof hits>();
  for (const h of hits) {
    const arr = grouped.get(h.entityType) ?? [];
    arr.push(h);
    grouped.set(h.entityType, arr);
  }

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Recherche full-text · SQLite FTS5"
        title="Rechercher"
        action={<Link href="/" className="text-[12px] text-primary font-semibold underline">Accueil</Link>}
      />

      <form action="/recherche" method="get" className="px-[18px] pb-3.5">
        <label className="relative block">
          <span className="sr-only">Recherche dans tous les contenus citoyens</span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
            <Search size={16} strokeWidth={1.6} />
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Idée, proposition, signalement, conseil municipal…"
            autoFocus
            className="w-full pl-9 pr-3 py-2.5 bg-surface border border-line-soft rounded text-[14px] text-ink outline-none focus:border-primary min-h-[44px]"
          />
        </label>
      </form>

      {q && (
        <div className="px-[18px] pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
          <FilterChip current={filter} value={undefined} q={q} label="Tout" count={hits.length} />
          {(Object.keys(TYPE_LABEL) as SearchEntityType[]).map((t) => {
            const c = grouped.get(t)?.length ?? 0;
            if (c === 0 && filter !== t) return null;
            return (
              <FilterChip
                key={t}
                current={filter}
                value={t}
                q={q}
                label={TYPE_LABEL[t]}
                count={c}
              />
            );
          })}
        </div>
      )}

      {!q ? (
        <div className="px-[18px] py-12 text-center">
          <div className="text-ink-muted text-[13px] mb-4">
            Tapez quelques mots pour rechercher dans toutes les contributions
            citoyennes, propositions, comptes rendus de conseil municipal,
            annonces et signalements.
          </div>
          <div className="text-[12px] text-ink-muted">Suggestions :</div>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {["marché", "vélo", "école", "voirie"].map((s) => (
              <Link
                key={s}
                href={`/recherche?q=${encodeURIComponent(s)}`}
                className="px-3 py-1.5 rounded-pill bg-surface border border-line-soft text-[12px] text-ink no-underline"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      ) : hits.length === 0 ? (
        <div className="px-[18px] py-12 text-center">
          <div className="text-ink-muted text-[13px] mb-3">
            Aucun résultat pour <strong className="text-ink">« {q} »</strong>.
          </div>
          <Link
            href="/recherche"
            className="text-[12px] text-primary font-semibold underline"
          >
            Effacer la recherche
          </Link>
        </div>
      ) : (
        <Section dense>
          {hits.map((h) => (
            <Link key={`${h.entityType}-${h.entityId}`} href={h.href} className="contents">
              <Surface as="button" className="w-full">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-semibold text-[14px] text-ink leading-snug flex-1">
                    {h.title}
                  </div>
                  <Chip size="sm" color={TYPE_COLOR[h.entityType]}>
                    {TYPE_LABEL[h.entityType]}
                  </Chip>
                </div>
                {h.snippet && (
                  <div
                    className="text-[12.5px] text-ink-soft leading-snug [&_mark]:bg-accent-soft [&_mark]:text-ink [&_mark]:px-0.5 [&_mark]:rounded-sm"
                    dangerouslySetInnerHTML={{ __html: h.snippet }}
                  />
                )}
              </Surface>
            </Link>
          ))}
        </Section>
      )}
    </ScreenShell>
  );
}

function FilterChip({
  current,
  value,
  q,
  label,
  count,
}: {
  current: SearchEntityType | undefined;
  value: SearchEntityType | undefined;
  q: string;
  label: string;
  count: number;
}) {
  const active = current === value;
  const href = value ? `/recherche?q=${encodeURIComponent(q)}&type=${value}` : `/recherche?q=${encodeURIComponent(q)}`;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "px-3 py-1.5 rounded font-semibold text-[12px] whitespace-nowrap min-h-[36px] flex items-center no-underline",
        active ? "bg-ink text-surface border border-ink" : "text-ink border border-line-soft",
      ].join(" ")}
    >
      {label} <span className="opacity-60 ml-1">· {count}</span>
    </Link>
  );
}
