// Idem search/index.ts : pas de `server-only` ici car on l'utilise
// aussi depuis le seed CLI.
import { db, schema } from "@/lib/db/client";
import { clearIndex, indexEntity } from ".";

/**
 * Réindexe complètement le contenu searchable depuis la DB. Utilisé
 * par le seed et par un script CLI optionnel pour reconstruire
 * l'index si on a perdu / migré le fichier.
 */
export function reindexAll() {
  clearIndex();

  for (const c of db.select().from(schema.ccm).all()) {
    indexEntity({
      entityType: "ccm",
      entityId: c.id,
      href: "/conseil-municipal",
      title: c.titre,
      body: c.body,
      themes: c.themes ?? null,
    });
  }

  for (const s of db.select().from(schema.suggestions).all()) {
    indexEntity({
      entityType: "suggestion",
      entityId: s.id,
      href: `/idees/${s.id}`,
      title: s.titre,
      themes: s.cat,
    });
  }

  for (const p of db.select().from(schema.propositions).all()) {
    indexEntity({
      entityType: "proposition",
      entityId: p.id,
      href: `/propositions/${p.id}`,
      title: p.titre,
      body: [p.constat, p.proposition, p.justification, p.vigilance]
        .filter(Boolean)
        .join("\n"),
    });
  }

  for (const a of db.select().from(schema.annonces).all()) {
    indexEntity({
      entityType: "annonce",
      entityId: a.id,
      href: "/",
      title: a.titre,
      body: [a.resume, a.body].filter(Boolean).join("\n"),
    });
  }

  for (const s of db.select().from(schema.signalements).all()) {
    indexEntity({
      entityType: "signalement",
      entityId: s.id,
      href: `/signalements/${s.id}`,
      title: s.titre,
      body: [s.loc, s.description].filter(Boolean).join("\n"),
      themes: s.type,
    });
  }

  for (const a of db.select().from(schema.petitesAnnonces).all()) {
    indexEntity({
      entityType: "petite_annonce",
      entityId: a.id,
      href: "/petites-annonces",
      title: a.titre,
      body: a.description,
      themes: a.cat,
    });
  }
}
