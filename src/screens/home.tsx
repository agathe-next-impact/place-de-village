import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  HandHeart,
  Heart,
  Landmark,
  Lightbulb,
  MapPin,
  Search,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { TrizacMark } from "@/components/ui/trizac-mark";
import {
  countMyUnread,
  getCurrentUserPub,
  listAgenda,
  listAnnonces,
  listMissions,
  listPropositions,
  listSignalements,
} from "@/lib/queries";

const QUICK_ACTIONS = [
  { id: "signaler", label: "Signaler", sub: "voirie, éclairage…", href: "/signaler", Icon: MapPin, colorVar: "#a8332b" },
  { id: "idee", label: "Proposer une idée", sub: "30 secondes", href: "/agora", Icon: Lightbulb, colorVar: "#e8a838" },
  { id: "mission", label: "Donner un coup de main", sub: "missions ouvertes", href: "/moi", Icon: HandHeart, colorVar: "#1f6e7a" },
  { id: "aide", label: "Demander un service", sub: "voisinage", href: "/aide", Icon: Heart, colorVar: "#1f6e7a" },
] as const;

export async function HomeScreen() {
  const [signalements, missions, propositions, agenda, annonces, unread, me] = await Promise.all([
    listSignalements(),
    listMissions(),
    listPropositions(),
    listAgenda(),
    listAnnonces(),
    countMyUnread(),
    getCurrentUserPub(),
  ]);
  const firstName = me.name.split(" ")[0] ?? me.name;

  const ouverts = signalements.filter((s) => s.etat !== "resolu").length;
  const missionsOpen = missions.filter((m) => m.inscrits < m.besoin).length;
  const propActive = propositions.filter((p) => p.statut !== "publiee").length;

  const PULSATION = [
    { val: ouverts, lab: "signalements\nen cours", href: "/signalements" },
    { val: missionsOpen, lab: "missions\nà pourvoir", href: "/moi" },
    { val: propActive, lab: "propositions\nactives", href: "/agora?view=propo" },
  ];

  const annonce = annonces[0];

  return (
    <div>
      <div className="px-[18px] pt-5 pb-6 relative">
        <div className="flex items-center justify-between mb-4">
          <TrizacMark />
          <div className="flex items-center gap-2">
            <Link
              href="/recherche"
              aria-label="Rechercher dans la plateforme"
              className="w-9 h-9 rounded-pill bg-surface border border-line-soft flex items-center justify-center text-ink"
            >
              <Search size={16} strokeWidth={1.6} />
            </Link>
            <Link
              href="/notifications"
              aria-label={`Notifications${unread > 0 ? ` (${unread} non lues)` : ""}`}
              className="relative w-9 h-9 rounded-pill bg-surface border border-line-soft flex items-center justify-center text-ink"
            >
              <Bell size={16} strokeWidth={1.6} />
              {unread > 0 && (
                <span
                  aria-hidden
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-pill bg-danger text-white text-[10px] font-bold flex items-center justify-center tabular-nums"
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          </div>
        </div>
        <div className="text-[26px] font-bold leading-[1.15] tracking-title text-ink">
          Bonjour {firstName},
          <br />
          <span className="text-primary">la place est ouverte.</span>
        </div>
        <div className="text-[13px] text-ink-soft mt-1.5">
          5 nov. — 12 °C, ciel voilé
        </div>
      </div>

      <div className="px-[18px]">
        <Surface padded={false} className="flex justify-between p-3.5">
          {PULSATION.map((x, i) => (
            <Link
              key={i}
              href={x.href}
              className={[
                "flex-1 text-center no-underline text-ink hover:bg-surface-alt rounded transition-colors py-1",
                i < 2 ? "border-r border-line-soft" : "",
              ].join(" ")}
            >
              <div className="font-bold text-[22px] text-ink leading-none tabular-nums">{x.val}</div>
              <div className="text-[10.5px] text-ink-muted mt-1 whitespace-pre-line leading-[1.25]">
                {x.lab}
              </div>
            </Link>
          ))}
        </Surface>
      </div>

      <Section title="Que voulez-vous faire ?">
        <div className="grid grid-cols-2 gap-2.5">
          {QUICK_ACTIONS.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              className="bg-surface border border-line-soft rounded-lg p-3.5 text-left flex flex-col gap-2 min-h-[44px] no-underline"
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ backgroundColor: `${c.colorVar}22`, color: c.colorVar }}
              >
                <c.Icon size={18} strokeWidth={1.6} />
              </div>
              <div>
                <div className="font-semibold text-[14px] text-ink">{c.label}</div>
                <div className="text-[11.5px] text-ink-muted mt-0.5">{c.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="À l'affiche cette semaine" action={<Link href="/agenda" className="no-underline">Tout voir →</Link>}>
        {agenda.slice(0, 2).map((e) => {
          const color =
            e.type === "officiel" ? "#1f6e7a" : e.type === "asso" ? "#e8a838" : "#1f6e7a";
          return (
            <Link key={e.id} href="/agenda" className="contents">
              <Surface as="button" className="w-full">
                <div className="flex gap-3 items-center">
                  <div
                    className="w-12 text-center flex-shrink-0 py-1.5 rounded"
                    style={{ backgroundColor: `${color}22` }}
                  >
                    <div className="text-[10px] font-semibold text-ink-soft uppercase">
                      {e.jour}
                    </div>
                    <div className="font-bold text-[16px] text-ink leading-none">
                      {e.date.split(" ")[0]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-semibold text-[14px] text-ink">
                      {e.titre}
                    </div>
                    <div className="text-[12px] text-ink-muted mt-0.5">
                      {e.heure} · {e.lieu}
                    </div>
                  </div>
                  <Chip size="sm" color={color}>
                    {e.type === "officiel" ? "Mairie" : e.type === "asso" ? "Asso" : "Bénévolat"}
                  </Chip>
                </div>
              </Surface>
            </Link>
          );
        })}
        {agenda.length === 0 && (
          <div className="text-[13px] text-ink-muted text-center py-4">
            Aucun événement programmé cette semaine.
          </div>
        )}
      </Section>

      <Section title="Vie du village">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { href: "/conseil-municipal", label: "Conseil\nmunicipal", Icon: Landmark, color: "#1f6e7a" },
              { href: "/reservation", label: "Réserver\nun équipement", Icon: CalendarDays, color: "#e8a838" },
              { href: "/petites-annonces", label: "Petites\nannonces", Icon: ShoppingBag, color: "#7a8c3a" },
            ] as const
          ).map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="bg-surface border border-line-soft rounded-lg p-3 text-left flex flex-col gap-1.5 no-underline min-h-[44px]"
            >
              <div
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{ backgroundColor: `${c.color}22`, color: c.color }}
              >
                <c.Icon size={16} strokeWidth={1.6} />
              </div>
              <div className="font-semibold text-[12px] text-ink leading-[1.25] whitespace-pre-line">
                {c.label}
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {annonce && (
        <Section
          title="Mot de la mairie"
          action={
            <Link href="/conseil-municipal" className="no-underline">
              CCM →
            </Link>
          }
        >
          <Link href="/conseil-municipal" className="contents">
            <div className="bg-primary-soft border border-primary/30 rounded-lg p-3.5 border-l-[3px] border-l-primary cursor-pointer hover:bg-primary-soft/70 transition-colors">
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Building2 size={13} strokeWidth={1.6} className="text-primary" />
                  <div className="text-[11px] font-semibold uppercase tracking-eyebrow text-primary">
                    Annonce officielle
                  </div>
                </div>
                <ChevronRight size={14} strokeWidth={1.6} className="text-primary" />
              </div>
              <div className="font-semibold text-[14px] text-ink mb-1">
                {annonce.titre}
              </div>
              <div className="text-[13px] text-ink-soft leading-[1.5]">
                {annonce.resume}
              </div>
              <div className="text-[11px] text-ink-muted mt-2">
                Publié le {annonce.date}
              </div>
            </div>
          </Link>
        </Section>
      )}
    </div>
  );
}
