export const metadata = { title: "Confidentialité · Trizac" };

export default function Page() {
  return (
    <article>
      <h1 className="text-[28px] font-bold tracking-title text-ink mb-4">
        Politique de confidentialité
      </h1>

      <p className="text-[14px] text-ink-soft leading-relaxed">
        La plateforme manipule des données personnelles dans le cadre d'une
        mission d'intérêt public communal. Elle est conforme au RGPD et à la
        Loi Informatique et Libertés.
      </p>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Données collectées</h2>
      <ul className="list-disc list-outside pl-5 space-y-1 text-[14px] text-ink-soft">
        <li>Identité (nom, prénom, email) à la création de compte.</li>
        <li>
          Géolocalisation lors d'un signalement (avec votre consentement
          explicite, jamais de stockage à l'adresse précise).
        </li>
        <li>Engagements bénévolat : missions, heures données.</li>
        <li>Contenus publiés : idées, contributions, soutiens, signalements.</li>
      </ul>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Finalités et bases légales</h2>
      <p className="text-[14px] text-ink-soft">
        Quatre finalités distinctes, traçables et révocables indépendamment :
      </p>
      <ul className="list-disc list-outside pl-5 space-y-1 text-[14px] text-ink-soft">
        <li>
          <strong>Contributions citoyennes</strong> — base légale : mission
          d'intérêt public.
        </li>
        <li>
          <strong>Digest hebdomadaire</strong> — base légale : consentement
          explicite.
        </li>
        <li>
          <strong>Géolocalisation</strong> — base légale : consentement explicite.
        </li>
        <li>
          <strong>Rappels SMS bénévolat</strong> — base légale : consentement
          explicite.
        </li>
      </ul>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Durée de conservation</h2>
      <p className="text-[14px] text-ink-soft">
        90 jours sur le flux principal des signaux, archivage ensuite.
        Suppression des comptes inactifs après 24 mois avec notification
        préalable.
      </p>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Sous-traitants</h2>
      <p className="text-[14px] text-ink-soft">
        Hébergement (OVHcloud / Scaleway / Infomaniak), emails (Postfix
        self-hosted / Listmonk / Brevo SMTP), SMS (SMSPartner / OVHcloud
        SMS), analytics (Plausible auto-hébergé). Tous sont localisés en
        Union européenne et liés par un contrat de sous-traitance RGPD (DPA).
      </p>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Mesure d'audience</h2>
      <p className="text-[14px] text-ink-soft">
        Notre instance <strong>Plausible auto-hébergée</strong> mesure le
        trafic agrégé : pages consultées, sessions, sources. Elle{" "}
        <strong>n'utilise aucun cookie</strong>, ne crée aucun profil
        individuel et ne suit pas les utilisateur·rices entre sites.
        À ce titre, et conformément à la position de la CNIL, son
        fonctionnement ne requiert pas de bandeau de consentement.
      </p>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Vos droits</h2>
      <p className="text-[14px] text-ink-soft">
        Accès, rectification, suppression, limitation, opposition, portabilité.
        Exerçables depuis la page <a className="text-primary underline" href="/mes-donnees">Mes données</a>{" "}
        ou par email à dpo@trizac.fr.
      </p>
    </article>
  );
}
