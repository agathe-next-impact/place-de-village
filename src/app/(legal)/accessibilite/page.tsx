export const metadata = { title: "Accessibilité · Trizac" };

export default function Page() {
  return (
    <article>
      <h1 className="text-[28px] font-bold tracking-title text-ink mb-4">
        Déclaration d'accessibilité
      </h1>

      <p className="text-[14px] text-ink-soft leading-relaxed">
        La commune de Trizac s'engage à rendre cette plateforme accessible
        conformément à l'article 47 de la loi n°2005-102 du 11 février 2005.
        Le niveau de conformité visé est le niveau <strong>AA du Référentiel
        Général d'Amélioration de l'Accessibilité (RGAA)</strong> dans sa
        version en vigueur.
      </p>

      <h2 className="text-[18px] font-bold mt-6 mb-2">État de conformité</h2>
      <p className="text-[14px] text-ink-soft">
        À l'ouverture en production, un audit RGAA exhaustif sera publié ici.
        En version préliminaire, le service vise une conformité progressive.
      </p>

      <h2 className="text-[18px] font-bold mt-6 mb-2">Mesures prises</h2>
      <ul className="list-disc list-outside pl-5 space-y-1 text-[14px] text-ink-soft">
        <li>Composants UI accessibles (Radix UI ou équivalent) à l'origine.</li>
        <li>Sémantique HTML stricte (jamais de div cliquable).</li>
        <li>Contrastes vérifiés AA, AAA recherché.</li>
        <li>Tailles de police ≥ 16 px sur mobile.</li>
        <li>Cibles tactiles ≥ 44 × 44 px.</li>
        <li>Navigation clavier complète, focus visible obligatoire.</li>
        <li>
          La couleur n'est jamais le seul vecteur d'information (libellé +
          icône + point coloré en redondance).
        </li>
        <li>Compatibilité testée avec NVDA et VoiceOver.</li>
      </ul>

      <h2 className="text-[18px] font-bold mt-6 mb-2">
        Retour d'expérience et contact
      </h2>
      <p className="text-[14px] text-ink-soft">
        Si vous rencontrez une difficulté d'accès, écrivez à{" "}
        <a className="text-primary underline" href="mailto:accessibilite@trizac.fr">
          accessibilite@trizac.fr
        </a>
        . Nous nous engageons à vous répondre sous 7 jours.
      </p>
    </article>
  );
}
