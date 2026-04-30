# Déploiement sur Vercel

> ## ⚠️ Avertissement souveraineté
>
> **Vercel est un fournisseur cloud américain** (Vercel Inc., Delaware,
> infrastructure AWS), soumis au Cloud Act et au FISA 702. Le déploiement
> sur Vercel **ne respecte pas l'exigence §3.1 du cahier des charges**
> (« hébergement en UE, aucune dépendance indirecte à un fournisseur
> américain »).
>
> Cette procédure est **réservée aux usages non-prod** : démo, staging
> de présentation, environnement d'apprentissage. Pour la mise en
> production publique conforme RGPD + souveraineté, voir
> [`DEPLOY-SCALEWAY.md`](./DEPLOY-SCALEWAY.md) (Scaleway Paris) ou
> l'équivalent OVHcloud.

## Aperçu

| Élément | En local | Sur Vercel |
|---|---|---|
| Runtime app | `next start` | Edge / Node serverless |
| DB | `data/trizac.db` (better-sqlite3) | **Turso** (LibSQL managé, EU possible) |
| Filesystem | OK | **Éphémère** → outbox email/SMS désactivés |
| Emails | mode `outbox` (data/outbox/) | **SMTP réel obligatoire** |
| SMS | mode `outbox` (data/sms-outbox/) | **Provider réel obligatoire** |
| Cron | local | **Vercel Cron** |
| Auth sessions | cookie HttpOnly + DB | identique |
| Sentry / Plausible | facultatif | facultatif (recommandé) |

## Pré-requis

- Compte Vercel (free tier suffit pour démo)
- Compte Turso : <https://turso.tech> (free tier 500 DB, ~9 GB)
- Un domaine — facultatif, Vercel attribue un `*.vercel.app`
- Un fournisseur SMTP UE (Brevo, Infomaniak, OVH ; ou un Postfix
  externe accessible)
- Optionnel : provider SMS (SMSPartner si rappels J-1 voulus)

## 1. Préparer la base de données (Turso)

SQLite local ne fonctionne pas sur Vercel : le filesystem est en
lecture seule (sauf `/tmp`, qui est éphémère et non partagé entre
invocations). On migre vers **Turso** (LibSQL = fork SQLite avec
client réseau). Avantage : zéro changement de syntaxe SQL, le schéma
Drizzle est compatible tel quel.

**Note souveraineté** : Turso est aussi une société américaine
(ChiselStrike Inc.), même si l'instance peut être déployée dans une
région EU. C'est l'une des raisons pour lesquelles Scaleway Postgres
ou OVHcloud Managed DB sont préférables en prod.

```bash
# Installer le CLI Turso
curl -sSfL https://get.tur.so/install.sh | bash

# Se connecter
turso auth signup    # ou turso auth login

# Créer une DB en région UE
turso db create trizac-prod --location cdg   # cdg = Paris

# Récupérer URL + token
turso db show trizac-prod --url
turso db tokens create trizac-prod
```

Garder ces deux valeurs sous la main : `TURSO_DATABASE_URL` et
`TURSO_AUTH_TOKEN`.

## 2. Adapter le client DB (changement code)

Le client `better-sqlite3` n'est pas compatible serverless. On le
remplace par `@libsql/client` qui parle le même dialecte mais via
HTTP/WebSocket.

```bash
npm install @libsql/client
npm uninstall better-sqlite3 @types/better-sqlite3
```

Modifier `src/lib/db/client.ts` :

```ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
export { schema };
```

> **Nota FTS5** : Turso supporte FTS5 (c'est SQLite). La migration
> `0007_fts5_search.sql` passe telle quelle. Le client FTS dans
> `src/lib/search/index.ts` qui ouvre `data/trizac.db` directement
> doit aussi être migré sur le client libsql (sinon la recherche
> tombera en panne sur Vercel).

Modifier `src/lib/search/index.ts` :

```ts
import { db } from "@/lib/db/client";

// remplacer les db.prepare(...).all/run par
// db.$client.execute({ sql, args })
```

L'API Drizzle `client.execute` accepte les requêtes brutes. Le code
existant doit être réécrit pour appeler ce client au lieu de
better-sqlite3 direct.

## 3. Migrer le schéma sur Turso

```bash
# Avec les vars d'env Turso pointées dans .env.local
TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... \
  npm run db:migrate
TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... \
  npm run db:seed
```

Le seed est facultatif en prod (à n'exécuter qu'en environnement de
démo, pas avec des comptes réels).

## 4. Connecter le repo à Vercel

```bash
npm install -g vercel   # CLI
vercel link             # lie le repo local au projet Vercel
vercel pull             # synchronise les env vars
```

Ou via l'UI Vercel : **Add New → Project → Import Git** → choisir le
repo `place-de-village`.

## 5. Variables d'environnement

Dans Vercel → Project → Settings → Environment Variables (les
définir pour `Production` ET `Preview`) :

```bash
# Application
PUBLIC_BASE_URL=https://votre-domaine.fr   # ou https://xxx.vercel.app

# Base de données (étape 1)
TURSO_DATABASE_URL=libsql://trizac-prod-xxx.turso.io
TURSO_AUTH_TOKEN=eyJxxxxxx

# Auth — secret de session (générer 32+ caractères aléatoires)
SESSION_COOKIE_SECRET=$(openssl rand -base64 48)

# Emails — SMTP obligatoire car pas d'outbox sur Vercel
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_USER=trizac@example.fr
SMTP_PASS=••••••••
EMAIL_FROM=Trizac <noreply@trizac.fr>

# SMS — recommandé : SMSPartner (FR/RGPD)
SMS_PROVIDER=smspartner
SMSPARTNER_API_KEY=••••••
SMSPARTNER_SENDER=Trizac

# Cron secret — pour Vercel Cron qui appelle /api/cron/sms
CRON_SECRET=$(openssl rand -base64 32)

# Sentry (facultatif, voir §3.1 — préférer une instance UE auto-hébergée
# pointée par DSN). GlitchTip self-hosted est aussi compatible.
SENTRY_DSN=https://...@sentry.example.fr/1
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.example.fr/1

# Plausible (facultatif, instance auto-hébergée)
NEXT_PUBLIC_PLAUSIBLE_HOST=https://plausible.example.fr
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=votre-domaine.fr
```

## 6. Configuration du build

Créer `vercel.json` à la racine :

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run db:migrate && npm run build",
  "installCommand": "npm install",
  "regions": ["fra1"],
  "crons": [
    {
      "path": "/api/cron/sms",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

- **`regions: ["fra1"]`** — force Frankfurt (la région la plus proche
  d'utilisateurs FR) plutôt que `iad1` (Washington DC) par défaut.
  Cela limite (sans annuler) l'exposition au Cloud Act dans le sens
  où les fonctions s'exécutent en UE — mais l'opérateur, le compte et
  les logs restent US.
- **`crons`** : Vercel Cron déclenche `POST /api/cron/sms` toutes les
  15 minutes. **Vercel envoie un header `Authorization: Bearer
  $CRON_SECRET`** automatiquement, donc notre endpoint protégé est
  compatible tel quel (vérifier que le secret correspond).

## 7. Premier déploiement

```bash
vercel --prod
```

Ou simplement `git push` sur la branche `main` une fois le projet
connecté → Vercel build et déploie automatiquement.

Suivre les logs : Vercel → Project → Deployments → cliquer sur le
build en cours → onglet "Build Logs" puis "Functions Logs".

## 8. Domaine personnalisé

Vercel → Project → Settings → Domains → ajouter `trizac.fr` (ou
sous-domaine). Vercel donne un enregistrement DNS à créer chez votre
registrar (CNAME `cname.vercel-dns.com` ou A vers une IP Vercel).

> Pour la souveraineté DNS, préférer un registrar français (OVH,
> Gandi, Online.net) à Cloudflare ou Namecheap.

Vercel provisionne automatiquement un certificat Let's Encrypt.

## 9. Vérifier post-déploiement

- [ ] `https://votre-domaine.fr/` → page d'accueil chargée
- [ ] `/auth/login` avec `camille@trizac.fr / trizac` → connexion OK
- [ ] `/recherche?q=marché` → résultats indexés
- [ ] `/mairie/emails` → vérifier qu'un email transite réellement
      (provider SMTP actif, plus en mode outbox)
- [ ] `/mairie/sms` → après inscription à une mission, le SMS doit
      apparaître programmé
- [ ] Vercel → Project → Functions → `/api/cron/sms` → exécutions
      cron observables toutes les 15 min
- [ ] Sentry / GlitchTip → premier event reçu
- [ ] Plausible → premier visiteur compté

## 10. Limitations / pièges connus

| Problème | Cause | Mitigation |
|---|---|---|
| Logs serverless brefs (10 min) | Free tier Vercel | Sentry / log distant |
| Cold start sur Functions | Serverless | Acceptable en démo, à mesurer |
| `data/outbox/` vide | FS éphémère | Mode outbox désactivé en prod, SMTP réel obligatoire |
| Recherche FTS plus lente | Latence Turso vs SQLite local | Cache HTTP via `Cache-Control` ; ou héberger Turso près des Functions |
| Coût Turso au-delà du free tier | 500 DB · 9 GB max | Surveiller, ou migrer Postgres |
| Aucune souveraineté juridique | Cloud Act US | Déployer sur Scaleway/OVHcloud à terme |

## Procédure de rollback

Vercel → Project → Deployments → cliquer sur un déploiement antérieur
réussi → "Promote to Production".

Ou en CLI :

```bash
vercel rollback <deployment-url>
```

## Pour aller plus loin (production conforme)

Quand le projet sortira de la phase démo, basculer sur
**Scaleway Paris (fr-par)** :

- Container Serverless Scaleway (Frankfurt ou Paris) pour Next.js
- Postgres managé Scaleway (région Paris, hébergement français)
- Object Storage Scaleway pour les assets
- Migration Drizzle SQLite → Postgres : une journée de travail
  (changement de driver `drizzle-orm/postgres-js`, types de colonnes
  `integer{mode:timestamp}` → `timestamp with time zone`, FTS5 →
  `tsvector` / `pg_trgm`).

Le coût mensuel estimé pour Trizac (~3 000 hab) :
- Container Scaleway : ~5 €/mois
- Postgres managé 1 vCPU / 2 Go : ~25 €/mois
- Object Storage : <1 €/mois
- **Total : ~30 €/mois**, 100 % UE, hors Cloud Act.

C'est l'option à viser pour la mise en service publique.
