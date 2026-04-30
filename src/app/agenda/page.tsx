import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { listAgenda, listAssociations } from "@/lib/queries";

const TYPE_COLOR = { officiel: "#1f6e7a", asso: "#e8a838", benevolat: "#1f6e7a" } as const;
const TYPE_LABEL = { officiel: "Conseil / Mairie", asso: "Association", benevolat: "Bénévolat" } as const;

const FRENCH_MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const sp = await searchParams;
  const view = sp.view === "calendrier" ? "calendrier" : "liste";
  const [agenda, associations] = await Promise.all([listAgenda(), listAssociations()]);

  return (
    <ScreenShell>
      <PageHeader
        subtitle="Pôle 5 — Vie locale"
        title="Agenda communal"
        action={
          <div className="flex flex-col gap-1 items-end">
            <Link href="/petites-annonces" className="text-[11.5px] text-primary font-semibold underline">
              Petites annonces
            </Link>
            <Link href="/conseil-municipal" className="text-[11.5px] text-primary font-semibold underline">
              Conseil municipal
            </Link>
          </div>
        }
      />

      <div className="px-[18px] pb-3.5 flex gap-1.5">
        <Link
          href="/agenda"
          aria-current={view === "liste" ? "page" : undefined}
          className={[
            "px-3.5 py-2 rounded font-semibold text-[13px] no-underline min-h-[36px] flex items-center",
            view === "liste" ? "bg-ink text-surface border border-ink" : "text-ink border border-line-soft",
          ].join(" ")}
        >
          Liste
        </Link>
        <Link
          href="/agenda?view=calendrier"
          aria-current={view === "calendrier" ? "page" : undefined}
          className={[
            "px-3.5 py-2 rounded font-semibold text-[13px] no-underline min-h-[36px] flex items-center",
            view === "calendrier" ? "bg-ink text-surface border border-ink" : "text-ink border border-line-soft",
          ].join(" ")}
        >
          Calendrier
        </Link>
        <a
          href="/api/ics"
          className="ml-auto text-[12px] text-primary font-semibold underline self-center"
        >
          Export ICS
        </a>
      </div>

      {view === "liste" ? <ListView items={agenda} /> : <MonthView items={agenda} />}

      <Section title="Associations actives">
        <div className="grid grid-cols-2 gap-2">
          {associations.map((a) => (
            <Surface key={a.id} padded={false} className="p-3">
              <div className="font-semibold text-[13px] text-ink">{a.nom}</div>
              <div className="text-[11px] text-ink-muted mt-0.5">{a.membres}</div>
            </Surface>
          ))}
        </div>
      </Section>
    </ScreenShell>
  );
}

function ListView({ items }: { items: Awaited<ReturnType<typeof listAgenda>> }) {
  // Group by month label
  const groups = new Map<string, typeof items>();
  for (const e of items) {
    const m = e.iso ? new Date(e.iso) : null;
    const key = m
      ? `${FRENCH_MONTHS[m.getMonth()].replace(".", "").toUpperCase()} ${m.getFullYear()}`
      : "À venir";
    const arr = groups.get(key) ?? [];
    arr.push(e);
    groups.set(key, arr);
  }
  return (
    <>
      {Array.from(groups.entries()).map(([month, evs]) => (
        <div key={month}>
          <div className="px-[18px] pb-1 pt-2">
            <div className="font-bold text-[14px] text-ink-muted uppercase tracking-[0.1em]">{month}</div>
          </div>
          <Section dense>
            {evs.map((e) => {
              const c = TYPE_COLOR[e.type as keyof typeof TYPE_COLOR];
              return (
                <div key={e.id} className="flex gap-3 px-[18px] py-1.5">
                  <div className="w-14 flex-shrink-0 text-center">
                    <div className="bg-surface-alt rounded py-2 border border-line-soft">
                      <div className="text-[10px] font-bold text-ink-muted uppercase">{e.jour}</div>
                      <div className="font-bold text-[22px] text-ink leading-none">{e.date.split(" ")[0]}</div>
                      <div className="text-[9px] text-ink-muted mt-0.5">{e.date.split(" ")[1]}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Surface padded={false} className="p-3 border-l-[3px]" style={{ borderLeftColor: c }}>
                      <div className="font-semibold text-[14px] text-ink">{e.titre}</div>
                      <div className="text-[12px] text-ink-soft mt-1">{e.heure} · {e.lieu}</div>
                      <div className="mt-2">
                        <Chip size="sm" color={c}>{TYPE_LABEL[e.type as keyof typeof TYPE_LABEL]}</Chip>
                      </div>
                    </Surface>
                  </div>
                </div>
              );
            })}
          </Section>
        </div>
      ))}
    </>
  );
}

function MonthView({ items }: { items: Awaited<ReturnType<typeof listAgenda>> }) {
  // Vue novembre 2026 (premier événement)
  const first = items.find((i) => i.iso) ?? items[0];
  const ref = first?.iso ? new Date(first.iso) : new Date();
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // 0 = lundi
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: { day: number | null; events: typeof items }[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null, events: [] });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, events: items.filter((i) => i.iso === iso) });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, events: [] });

  return (
    <div className="px-[18px] pb-3">
      <div className="bg-surface border border-line-soft rounded-lg p-3">
        <div className="font-bold text-[14px] text-ink-muted uppercase tracking-[0.1em] mb-2">
          {FRENCH_MONTHS[month]} {year}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} className="text-center text-[10.5px] font-semibold text-ink-muted py-1">
              {d}
            </div>
          ))}
          {cells.map((c, i) => (
            <div
              key={i}
              className={[
                "aspect-square rounded text-[11.5px] flex flex-col items-center p-0.5",
                c.day == null ? "" : "bg-surface-alt/40",
                c.events.length > 0 ? "ring-1 ring-primary" : "",
              ].join(" ")}
            >
              {c.day != null && (
                <>
                  <div className="font-semibold text-ink">{c.day}</div>
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {c.events.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        title={e.titre}
                        className="w-1 h-1 rounded-pill"
                        style={{ backgroundColor: TYPE_COLOR[e.type as keyof typeof TYPE_COLOR] }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="text-[11px] text-ink-muted mt-2">
        Astuce : « Export ICS » permet d'intégrer l'agenda dans votre calendrier personnel.
      </div>
    </div>
  );
}
