# Place de Village — prototype

> Plateforme citoyenne municipale (PWA mobile-first), implémentée à partir du
> [cahier des charges](https://github.com/agathe-next-impact/place-village/blob/main/CAHIER-DES-CHARGES.md)
> et du paquet de design hand-off (direction « sobre »).

## Stack

- Next.js 16 (App Router, **RSC + Server Actions**)
- React 19
- TypeScript strict
- Tailwind CSS 3 (tokens du design system « sobre » — cf. `tailwind.config.ts`)
- `lucide-react` pour l'iconographie
- **SQLite + Drizzle ORM** comme backend de démo (à remplacer par
  WordPress headless + WPGraphQL en production, cf. CdC §4)
- **Zod** pour la validation côté serveur
- Cookie HttpOnly de session (auth démo, à remplacer par NextAuth + JWT WP)

## Démarrer

```bash
npm install
npm run db:migrate    # crée data/trizac.db et applique le schéma
npm run db:seed       # peuple ~30 entités fictives (utilisateurs, signalements, idées, missions…)
npm run dev
```

Ouvrir <http://localhost:3000>. Le store SQLite est dans `data/trizac.db`
(ignoré par git). Pour repartir de zéro : `rm -rf data/ && npm run db:seed`.

## Écrans livrés

| Route | Onglet / écran | Source de référence |
|---|---|---|
| `/` | Accueil (hub) — onglet par défaut | `screens-1.jsx` |
| `/?tab=signal` | Signalements (liste / carte / saisie 2 étapes) | `screens-1.jsx` |
| `/?tab=agora` | Agora — Idées, Discussions, Propositions | `screens-2.jsx` |
| `/?tab=me` | Moi — bénévolat communal | `screens-2.jsx` |
| `/?tab=aide` | Entraide entre voisins | `screens-3.jsx` |
| `/agenda` | Agenda communal + annuaire associations | `screens-3.jsx` |
| `/reservation` | Réservation d'équipements communaux | `screens-3.jsx` |
| `/mairie` | Tableau de bord mairie (référent) | `screens-3.jsx` |

## Design tokens (direction « sobre »)

Voir `tailwind.config.ts` pour les couleurs, rayons, tracking, ombres,
tailles. Règles d'or :

- Pas d'ombre décorative (sauf FAB primaire et FAB Agora).
- La couleur n'est jamais le seul vecteur d'information : tout état coloré
  est doublé d'un libellé textuel, d'une icône, ou d'un point coloré
  (`prefixDot` sur les chips d'état).
- Cibles tactiles ≥ 44 × 44 px.
- Focus visible obligatoire (configuré globalement dans `globals.css`).

## Backend (démo SQLite)

- **Schéma Drizzle** dans `src/lib/db/schema.ts` : 19 tables couvrant les
  6 pôles + audit + messagerie + consentements RGPD.
- **Server Actions** dans `src/lib/actions/*.ts` : signalements, agora
  (idées / signaux / contributions / propositions / soutiens), missions,
  entraide & messagerie, réservations, petites annonces. Toutes les actions
  écrivent dans la DB et appellent `revalidatePath`.
- **Lectures RSC** centralisées dans `src/lib/queries.ts` (joins, comptages,
  agrégations, scoping par utilisateur courant).
- **Détection de doublons** sur les signalements (même type + lieu commun,
  proposition de rattachement à l'UI — cf. CdC §2.1 Pôle 3).
- **Promotion automatique** d'une proposition en « réponse mairie due »
  quand le seuil de soutiens est atteint (CdC §2.1 Pôle 1 Étage 3).
- **Maturation automatique** d'une discussion à partir de 15 contributions.
- **Vérification de conflit de réservation** côté serveur (overlap des
  plages avec une réservation validée existante).
- **Journal des décisions** (`audit_log`) auto-alimenté par les actions
  sensibles : visible par la mairie sur `/mairie/journal`.
- **Export ICS** de l'agenda communal sur `/api/ics`.

## Fonctionnalités câblées (état actuel)

- **State store global** (`StoreProvider`, Context React) : signalements
  (création + état), suggestions, propositions, missions, signaux qualifiés
  (toggleable), soutiens (toggleable), inscriptions (toggleable). Toutes les
  mutations sont en mémoire — à brancher sur des Server Actions Next.js +
  WPGraphQL en production.
- **Toasts a11y** (`role=region` + `aria-live="polite"`).
- **Modal accessible** (focus trap léger, Escape ferme, scroll-lock).
- **Formulaires** : nouvelle idée (avec validation et catégorie),
  promotion discussion → proposition (format imposé constat / proposition /
  justification / vigilance — friction maximale conforme CdC §2.1), création
  signalement en 2 étapes, login / register / magic link.
- **Pages détail** : `/signalements/[id]` (avec timeline 4 états),
  `/idees/[id]`, `/discussions/[id]` (avec promotion mature),
  `/propositions/[id]`, `/missions/[id]`.
- **Pages institutionnelles** (groupe `(legal)`) : `/mentions-legales`,
  `/confidentialite` (4 finalités, durées de conservation, sous-traitants UE),
  `/accessibilite` (déclaration RGAA AA), `/mes-donnees` (consentements
  granulaires révocables, droits RGPD).
- **Pages d'auth** : `/auth/login`, `/auth/register` (consentements
  granulaires), `/auth/magic` (lien email à usage unique).
- **PWA** : `manifest.webmanifest`, `icon.svg`, theme-color, viewport
  zoomable, lien skip-content vers `#main-content`.

## À brancher avant la mise en prod

- Auth réelle (NextAuth.js + JWT WordPress, cookie HttpOnly SameSite=Lax).
- WPGraphQL + codegen TypeScript pour remplacer le store en mémoire par des
  Server Actions et de l'ISR.
- MapLibre + tuiles IGN ou OSM (le SVG est un placeholder).
- Notifications email (Brevo ou Listmonk auto-hébergé), SMS (OVHcloud SMS).
- Plausible auto-hébergé.
- Détection des doublons de signalements (proximité géo + thématique).
- Calendrier de réservation d'équipement (vue mois + sélecteur).
- Audit RGAA AA exhaustif et publication de la déclaration.
- Tests Vitest + Playwright en CI.
- Radix UI pour les composants critiques (`Dialog`, `Tabs`, `Toast`,
  `Switch`, `Popover`) — actuellement re-implémentés a minima.

## Accessibilité (RGAA AA — cf. CdC §3.3)

- Sémantique HTML : `<main>`, `<nav>`, `<section>`, `<header>`, `<button>`.
- Cibles tactiles minimales appliquées via `min-h-[44px]` sur les boutons.
- Focus visible : ring 2 px primary, offset 2 px (`globals.css`).
- Contrastes vérifiés (cf. README du paquet — primary 4.6:1, ink 14:1, ink-muted
  4.5:1 sur fond bg).
- Couleur jamais seul vecteur d'info.
- À tester avec NVDA + VoiceOver avant mise en prod.

## Structure

```
src/
├── app/
│   ├── layout.tsx               ← <html> + <body> + globals.css
│   ├── globals.css              ← Tailwind + reset + Inter
│   ├── page.tsx                 ← shell SPA (5 onglets)
│   ├── agenda/page.tsx
│   ├── reservation/page.tsx
│   └── mairie/page.tsx
├── components/
│   ├── phone-frame.tsx          ← cadre mobile (preview desktop)
│   └── ui/
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── chip.tsx
│       ├── page-header.tsx
│       ├── section.tsx
│       ├── surface.tsx
│       ├── tab-bar.tsx
│       └── trizac-mark.tsx
├── lib/
│   ├── cn.ts
│   └── data.ts                  ← données fictives (référence schéma API)
└── screens/
    ├── home.tsx
    ├── signal.tsx               ← liste + carte + saisie 2 étapes
    ├── agora.tsx                ← idées / discussions / propositions
    ├── me.tsx                   ← bénévolat communal
    ├── aide.tsx                 ← entraide voisinage
    ├── agenda.tsx
    ├── reserv.tsx
    └── mairie.tsx
```
