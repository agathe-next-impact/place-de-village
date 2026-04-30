export const metadata = { title: "Mentions légales · Trizac" };

export default function Page() {
  return (
    <article className="prose prose-ink max-w-none">
      <h1 className="text-[28px] font-bold tracking-title text-ink mb-4">
        Mentions légales
      </h1>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Éditeur</h2>
      <p className="text-[14px] text-ink-soft leading-relaxed">
        Commune de Trizac (à compléter en production). Adresse de la mairie,
        SIRET, directeur·rice de publication.
      </p>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Hébergement</h2>
      <p className="text-[14px] text-ink-soft leading-relaxed">
        Hébergement applicatif chez OVHcloud (Roubaix, France) ou Scaleway
        (Paris, France). Aucune donnée n'est hébergée hors de l'Union
        européenne. Cf. la politique de souveraineté détaillée dans le cahier
        des charges (§3.1).
      </p>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Propriété intellectuelle</h2>
      <p className="text-[14px] text-ink-soft leading-relaxed">
        Le code source de la plateforme est publié sous licence libre. Les
        contenus citoyens publiés (idées, contributions, signalements) restent
        la propriété de leur auteur·rice et sont rendus publics conformément à
        la finalité du service.
      </p>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Contact</h2>
      <p className="text-[14px] text-ink-soft leading-relaxed">
        Référent·e de la plateforme : à compléter. Adresse de contact RGPD :
        dpo@trizac.fr (à substituer par le DPO mutualisé désigné).
      </p>
    </article>
  );
}
