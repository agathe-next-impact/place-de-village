# Place de Village — prototype

> Plateforme citoyenne municipale (PWA mobile-first), implémentée à partir du
> [cahier des charges](https://github.com/agathe-next-impact/place-village/blob/main/CAHIER-DES-CHARGES.md)
> et du paquet de design hand-off (direction « sobre »).

## Stack

- Next.js 16 (App Router, RSC + Server Actions visés)
- React 19
- TypeScript strict
- Tailwind CSS 3 (tokens du design system « sobre » — cf. `tailwind.config.ts`)
- `lucide-react` pour l'iconographie
- Pas de Radix dans ce scaffolding initial : à introduire pour les composants
  qui en bénéficient (Dialog, Tabs, Switch, Toast, Popover) lors de
  l'implémentation des écrans détaillés non maquettés.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir <http://localhost:3000>.

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

## À faire ensuite (cf. README du paquet design hand-off, section
"Hors-périmètre de la maquette")

- Pages d'authentification (NextAuth + JWT WordPress)
- Détails (signalement / discussion / proposition)
- Formulaire de promotion discussion → proposition (friction maximale)
- Calendrier de réservation d'équipement
- États vides / états de chargement / états d'erreur
- Pages légales et page « Mes données » (RGPD)
- Connexion à WordPress headless via WPGraphQL + codegen
- Notifications email (Brevo / Listmonk)
- Remplacer la carte SVG placeholder par MapLibre + tuiles IGN ou OSM

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
