import {
  Bell,
  Building2,
  HandHeart,
  Heart,
  Lightbulb,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Surface } from "@/components/ui/surface";
import { Section } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { TrizacMark } from "@/components/ui/trizac-mark";
import {
  listAgenda,
  listAnnonces,
  listMissions,
  listPropositions,
  listSignalements,
} from "@/lib/queries";

const QUICK_ACTIONS = [
  { id: "signaler", label: "Signaler", sub: "voirie, éclairage…", href: "/?tab=signal", Icon: MapPin, colorVar: "#a8332b" },
  { id: "idee", label: "Proposer une idée", sub: "30 secondes", href: "/?tab=agora", Icon: Lightbulb, colorVar: "#e8a838" },
  { id: "mission", label: "Donner un coup de main", sub: "missions ouvertes", href: "/?tab=me", Icon: HandHeart, colorVar: "#1f6e7a" },
  { id: "aide", label: "Demander un service", sub: "voisinage", href: "/?tab=aide", Icon: Heart, colorVar: "#1f6e7a" },
] as const;

export async function HomeScreen() {
  const [signalements, missions, propositions, agenda, annonces] = await Promise.all([
    listSignalements(),
    listMissions(),
    listPropositions(),
    listAgenda(),
    listAnnonces(),
  ]);

  const ouverts = signalements.filter((s) => s.etat !== "resolu").length;
  const missionsOpen = missions.filter((m) => m.inscrits < m.besoin).length;
  const propActive = propositions.filter((p) => p.statut !== "publiee").length;

  const PULSATION = [
    { val: ouverts, lab: "signalements\nen cours" },
    { val: missionsOpen, lab: "missions\nà pourvoir" },
    { val: propActive, lab: "propositions\nactives" },
  ];

  const annonce = annonces[0];

  return (
    <div>
      <div className="px-[18px] pt-5 pb-6 relative">
        <div className="flex items-center justify-between mb-4">
          <TrizacMark />
          <Link
            href="/messages"
            aria-label="Messages"
            className="w-9 h-9 rounded-pill bg-surface border border-line-soft flex items-center justify-center text-ink"
          >
            <Bell size={16} strokeWidth={1.6} />
          </Link>
        </div>
        <div className="text-[26px] font-bold leading-[1.15] tracking-title text-ink">
          Bonjour Camille,
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
            <div
              key={i}
              className={`flex-1 text-center ${i < 2 ? "border-r border-line-soft" : ""}`}
            >
              <div className="font-bold text-[22px] text-ink leading-none tabular-nums">{x.val}</div>
              <div className="text-[10.5px] text-ink-muted mt-1 whitespace-pre-line leading-[1.25]">
                {x.lab}
              </div>
            </div>
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
            <Surface key={e.id}>
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
                <div className="flex-1 min-w-0">
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
          );
        })}
      </Section>

      {annonce && (
        <Section title="Mot de la mairie">
          <div className="bg-primary-soft border border-primary/30 rounded-lg p-3.5 border-l-[3px] border-l-primary">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Building2 size={13} strokeWidth={1.6} className="text-primary" />
              <div className="text-[11px] font-semibold uppercase tracking-eyebrow text-primary">
                Annonce officielle
              </div>
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
        </Section>
      )}
    </div>
  );
}
