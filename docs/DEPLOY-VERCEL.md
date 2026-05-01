# Déploiement sur Vercel

Stack optimisée pour Vercel : un minimum d'outils tiers, un maximum
d'intégrations natives.

| Brique | Choix |
|---|---|
| Runtime app | **Vercel** (Next.js 16, App Router) |
| Base de données | **Vercel Postgres** (Neon EU) |
| Recherche | **Postgres tsvector + GIN** (intégré, pas de service séparé) |
| Cron | **Vercel Cron** (configuré dans `vercel.json`) |
| Analytics | **Vercel Web Analytics + Speed Insights** (sans cookies) |
| Suivi d'erreurs | **Sentry Cloud** (intégration Vercel marketplace) |
| Emails transactionnels | **Resend** (recommandé, intégration Vercel) ou tout SMTP |
| SMS (rappels J-1) | **SMSPartner** (FR), provider HTTP standard |
| Domaine + TLS | Vercel (Let's Encrypt automatique) |
| Storage statique | Vercel Edge Network (auto) |

## Pré-requis

- Compte Vercel
- Compte Resend (`https://resend.com`) — free tier : 3 000 emails/mois
- Domaine personnel (optionnel — Vercel attribue un `*.vercel.app`)
- Compte Sentry (optionnel) — intégration Vercel marketplace en 2 clics

## 1. Connecter le repo à Vercel

```bash
npm install -g vercel
vercel link
```

Ou via l'UI : **Add New → Project → Import Git Repository** → choisir
`place-de-village`. Vercel détecte automatiquement Next.js.

## 2. Créer la base Vercel Postgres

Dans le dashboard Vercel → onglet **Storage** → **Create Database** →
**Postgres** (= Neon). Choisir région **`fra1` (Frankfurt)** si
disponible.

Vercel injecte automatiquement les vars d'env :

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

Le client `src/lib/db/client.ts` lit déjà `POSTGRES_URL` automatiquement.
Les migrations s'appliquent au build via `npm run db:migrate` (cf.
`vercel.json`).

## 3. Variables d'environnement

Dans **Project → Settings → Environment Variables** (Production +
Preview) :

```bash
# URL publique
PUBLIC_BASE_URL=https://votre-domaine.fr

# DB — pas besoin si Vercel Postgres connecté (auto-injecté)

# Email — Resend (le plus simple)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxx     # clé Resend
EMAIL_FROM=Trizac <noreply@votre-domaine.fr>

# SMS — SMSPartner (FR)
SMS_PROVIDER=smspartner
SMSPARTNER_API_KEY=••••••
SMSPARTNER_SENDER=Trizac

# Cron secret — Vercel Cron envoie automatiquement
# Authorization: Bearer <CRON_SECRET>
CRON_SECRET=$(openssl rand -base64 32)

# Sentry (optionnel — installation auto via Vercel marketplace)
SENTRY_DSN=https://xxx@oxxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@oxxx.ingest.sentry.io/xxx
```

## 4. Configurer Resend

1. Créer un compte sur <https://resend.com>
2. Vérifier le domaine `votre-domaine.fr` (DNS records à ajouter chez
   votre registrar)
3. Créer une clé API → coller dans `SMTP_PASS`

Resend expose un SMTP standard sur `smtp.resend.com:465` — aucun SDK
nécessaire, le code utilise `nodemailer` directement.

## 5. Activer Vercel Cron

Le fichier `vercel.json` à la racine déclare :

```json
{
  "crons": [
    { "path": "/api/cron/sms", "schedule": "*/15 * * * *" }
  ]
}
```

Vercel appelle automatiquement `POST /api/cron/sms` toutes les
15 minutes avec un header `Authorization: Bearer $CRON_SECRET`. Notre
endpoint vérifie ce header — aucune autre configuration nécessaire.

> **Free tier Vercel** : 1 cron job, 10 invocations/jour. Passer en
> Pro si vous avez besoin de plus de fréquence.

## 6. Activer Vercel Analytics

Dans le dashboard Vercel → **Project → Analytics** → activer
**Web Analytics** (free tier 25k évènements/mois).

Les composants `<Analytics />` et `<SpeedInsights />` sont déjà câblés
dans `src/components/plausible.tsx`. Aucun script tiers, aucun cookie.

Custom events automatiquement envoyés :
`idea-created`, `signal-emitted`, `support-toggled`,
`mission-registered`, `signalement-created`, `conversation-opened`,
`message-sent`, `reservation-requested`.

## 7. (Optionnel) Activer Sentry

Vercel **Marketplace → Sentry** → installer en 2 clics. Vercel injecte
automatiquement `SENTRY_DSN` et `NEXT_PUBLIC_SENTRY_DSN`.

Sans Sentry, la capture d'erreurs reste en local (`error_log`,
visible sur `/mairie/errors`).

## 8. Premier déploiement

```bash
vercel --prod
```

Ou simplement `git push` sur la branche `main` après avoir connecté
le repo Git. Vercel build et déploie automatiquement.

Suivi du build : **Deployments → cliquer sur le build en cours →
Build Logs**.

## 9. Domaine personnalisé

**Project → Settings → Domains** → ajouter `votre-domaine.fr`.
Vercel donne un enregistrement DNS à créer chez votre registrar
(CNAME `cname.vercel-dns.com` ou A vers une IP Vercel). Certificat
Let's Encrypt provisionné automatiquement.

## 10. Seed initial — deux options

### Option A — Vraie production (recommandé)

Crée un unique compte « maire » (admin), aucune donnée fictive :

```powershell
# PowerShell (Windows)
vercel env pull .env.production.local --environment=production
$env:SEED_ADMIN_EMAIL = "admin@votre-domaine.fr"
$env:SEED_ADMIN_PASSWORD = "un-mot-de-passe-fort-min-8-car"
npm run db:seed:minimal:prod
```

```bash
# Bash (Linux/Mac/WSL/Git Bash)
vercel env pull .env.production.local --environment=production
SEED_ADMIN_EMAIL=admin@votre-domaine.fr \
SEED_ADMIN_PASSWORD='un-mot-de-passe-fort-min-8-car' \
  npm run db:seed:minimal:prod
```

Idempotent : ré-exécutable sans casser le compte existant (upsert
sur l'email). Connectez-vous ensuite sur `/auth/login`, changez le
mot de passe, et invitez les habitants.

### Option B — Démo / staging

Peuple les données fictives (15 utilisateurs, signalements, idées,
missions, etc.) :

```bash
vercel env pull .env.production.local --environment=preview
npx tsx --env-file=.env.production.local src/lib/db/seed.ts
```

⚠️ **Destructif** (TRUNCATE de toutes les tables). À NE PAS lancer
sur une base contenant de vraies données.

### Mode démo — variable `DEMO_MODE`

Pour activer le RoleSwitcher (impersonation sans mot de passe) et
la navigation sans login forcé, ajouter dans Vercel → Settings →
Environment Variables (**Preview uniquement**) :

```
DEMO_MODE=true
```

⚠️ **NE JAMAIS** activer en Production : bypass l'authentification.

## 11. Vérifier post-déploiement

- [ ] `https://votre-domaine.fr/` → page d'accueil chargée
- [ ] `/auth/login` avec `camille@trizac.fr / trizac` → connexion OK
- [ ] `/recherche?q=marché` → résultats avec snippets `<mark>`
- [ ] `/mairie/emails` → un email transite réellement (Resend)
- [ ] `/mairie/sms` → après inscription mission, SMS programmé
- [ ] **Vercel → Project → Crons** → `/api/cron/sms` exécuté toutes
      les 15 min
- [ ] **Vercel → Analytics** → premier visiteur compté
- [ ] Sentry → premier event reçu (si activé)

## Procédure de rollback

**Vercel → Project → Deployments** → cliquer sur un déploiement
antérieur réussi → **Promote to Production**.

Ou en CLI :

```bash
vercel rollback <deployment-url>
```

## Limitations connues

| Limite | Cause | Mitigation |
|---|---|---|
| Cold start fonctions | Serverless | Acceptable en démo, Pro pour Always-On |
| Free tier 10 invocations cron/jour | Pricing Vercel | Plan Pro (20 $/mo) ou cron externe |
| Free Postgres : 256 MB / 60h compute | Quota Neon via Vercel | Plan Pro de Neon directement, ou Scaleway |
| Pas de filesystem persistant | Serverless | Outbox local désactivé, SMTP/SMS providers réels obligatoires |

## Coût estimé pour Trizac (3 000 hab)

| Brique | Plan free | Plan payant si dépassé |
|---|---|---|
| Vercel Hobby (free) | OK pour démo | Pro 20 $/mo (cron illimité, build minutes) |
| Vercel Postgres free | 256 MB | Hobby 1 GB ~10 $/mo, Pro illimité |
| Vercel Analytics free | 25 k évènements | Pro 20 $/mo (250 k évts) |
| Resend free | 3 000 emails/mo | Pro 20 $/mo (50 k emails) |
| SMSPartner | pay-as-you-go | ~0,06 €/SMS |
| Sentry free | 5 k events/mo | Team 26 $/mo |

**Total démo** : 0 €/mois (hors quelques SMS).
**Total prod sereine** : ~50–80 $/mois pour une commune active.
