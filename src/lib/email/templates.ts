/**
 * Templates email — texte + HTML minimaliste, sans dépendance à un
 * framework email tiers. Volonté d'indépendance et de portabilité :
 * un email rendu reste lisible dans tous les clients (texte) et
 * raisonnablement stylé dans les clients qui le permettent (HTML).
 *
 * Convention : chaque template renvoie { subject, text, html }.
 */

const APP_NAME = "Trizac · Place du village";
const APP_URL = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";

function shell(title: string, body: string, ctaUrl?: string, ctaLabel?: string) {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:Inter,Public Sans,system-ui,sans-serif;color:#1c1a17">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e3ddd2;border-radius:6px">
        <tr><td style="padding:18px 22px;border-bottom:1px solid #e3ddd2">
          <strong style="font-size:15px;color:#1f6e7a;letter-spacing:-0.02em">${escapeHtml(APP_NAME)}</strong>
        </td></tr>
        <tr><td style="padding:22px;font-size:14.5px;line-height:1.6;color:#1c1a17">
          <h1 style="margin:0 0 12px;font-size:18px;color:#1c1a17;letter-spacing:-0.02em">${escapeHtml(title)}</h1>
          ${body}
          ${ctaUrl && ctaLabel ? `<p style="margin:18px 0 0"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#1f6e7a;color:#ffffff;padding:10px 18px;border-radius:4px;text-decoration:none;font-weight:600">${escapeHtml(ctaLabel)}</a></p>` : ""}
        </td></tr>
        <tr><td style="padding:14px 22px;border-top:1px solid #e3ddd2;font-size:11px;color:#7a746c">
          Vous recevez ce message depuis la plateforme citoyenne municipale de votre commune.
          Vous pouvez gérer vos consentements depuis <a href="${escapeHtml(APP_URL)}/mes-donnees" style="color:#1f6e7a">Mes données</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Templates ─────────────────────────────────────────────────────────

export type TemplateOutput = { subject: string; text: string; html: string };

export const templates = {
  /** Confirmation d'inscription. */
  welcome(args: { name: string }): TemplateOutput {
    const subject = "Bienvenue sur Trizac";
    const text = [
      `Bonjour ${args.name},`,
      "",
      "Votre compte sur la plateforme citoyenne de Trizac est créé.",
      "Vous pouvez désormais publier des idées, soutenir des propositions,",
      "vous engager comme bénévole ou demander de l'entraide.",
      "",
      `${APP_URL}`,
      "",
      "— L'équipe Trizac",
    ].join("\n");
    const html = shell(
      subject,
      `<p>Bonjour ${escapeHtml(args.name)},</p><p>Votre compte sur la plateforme citoyenne de Trizac est créé. Vous pouvez désormais publier des idées, soutenir des propositions, vous engager comme bénévole ou demander de l'entraide.</p>`,
      APP_URL,
      "Ouvrir Trizac",
    );
    return { subject, text, html };
  },

  /** Magic link pour se connecter sans mot de passe. */
  magicLink(args: { url: string; ttlMin: number }): TemplateOutput {
    const subject = "Votre lien de connexion Trizac";
    const text = [
      "Voici votre lien de connexion. Il expire dans " + args.ttlMin + " minutes.",
      "",
      args.url,
      "",
      "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.",
    ].join("\n");
    const html = shell(
      subject,
      `<p>Voici votre lien de connexion. Il expire dans <strong>${args.ttlMin} minutes</strong> et n'est utilisable qu'une seule fois.</p><p style="font-size:12px;color:#7a746c;word-break:break-all">${escapeHtml(args.url)}</p>`,
      args.url,
      "Me connecter",
    );
    return { subject, text, html };
  },

  /** Transition d'état d'un signalement. */
  signalementState(args: {
    titre: string;
    etatLabel: string;
    comment?: string | null;
    href: string;
  }): TemplateOutput {
    const subject = `Votre signalement est ${args.etatLabel}`;
    const text = [
      `Bonjour,`,
      "",
      `Le signalement « ${args.titre} » que vous avez fait sur Trizac vient d'être ${args.etatLabel}.`,
      args.comment ? `\nCommentaire de l'agent : « ${args.comment} »\n` : "",
      `Suivi : ${APP_URL}${args.href}`,
    ]
      .filter(Boolean)
      .join("\n");
    const html = shell(
      subject,
      `<p>Le signalement « ${escapeHtml(args.titre)} » vient d'être <strong>${escapeHtml(args.etatLabel)}</strong>.</p>` +
        (args.comment
          ? `<blockquote style="margin:12px 0;padding:8px 12px;border-left:3px solid #1f6e7a;background:#cfe1e4;color:#4d4843">« ${escapeHtml(args.comment)} »</blockquote>`
          : ""),
      `${APP_URL}${args.href}`,
      "Voir le détail",
    );
    return { subject, text, html };
  },

  /** Nouveau message dans une conversation d'entraide. */
  newMessage(args: { fromName: string; preview: string; href: string }): TemplateOutput {
    const subject = `Nouveau message de ${args.fromName}`;
    const text = [
      `${args.fromName} vient de vous écrire sur Trizac :`,
      "",
      `« ${args.preview} »`,
      "",
      `Répondre : ${APP_URL}${args.href}`,
    ].join("\n");
    const html = shell(
      subject,
      `<p><strong>${escapeHtml(args.fromName)}</strong> vient de vous écrire :</p><blockquote style="margin:12px 0;padding:8px 12px;border-left:3px solid #1f6e7a;background:#cfe1e4;color:#4d4843">« ${escapeHtml(args.preview)} »</blockquote>`,
      `${APP_URL}${args.href}`,
      "Répondre dans Trizac",
    );
    return { subject, text, html };
  },

  /** Confirmation d'inscription à une mission. */
  missionInscription(args: {
    titre: string;
    date: string;
    lieu: string;
    href: string;
  }): TemplateOutput {
    const subject = `Inscription confirmée — ${args.titre}`;
    const text = [
      `Votre inscription à la mission de bénévolat est confirmée :`,
      "",
      `  ${args.titre}`,
      `  ${args.date} · ${args.lieu}`,
      "",
      "Vous recevrez un rappel par email la veille de la mission.",
      `Détails : ${APP_URL}${args.href}`,
    ].join("\n");
    const html = shell(
      subject,
      `<p>Votre inscription est confirmée pour la mission :</p><p><strong>${escapeHtml(args.titre)}</strong><br><span style="color:#4d4843">${escapeHtml(args.date)} · ${escapeHtml(args.lieu)}</span></p><p style="font-size:12px;color:#7a746c">Vous recevrez un rappel par email la veille de la mission.</p>`,
      `${APP_URL}${args.href}`,
      "Voir la mission",
    );
    return { subject, text, html };
  },

  /** Validation ou refus de réservation. */
  reservation(args: {
    valide: boolean;
    equipement: string;
    motif?: string | null;
    href: string;
  }): TemplateOutput {
    const subject = args.valide ? "Réservation validée" : "Demande de réservation refusée";
    const text = args.valide
      ? `Votre réservation de ${args.equipement} est validée. Détails : ${APP_URL}${args.href}`
      : `Votre demande de réservation de ${args.equipement} a été refusée.${args.motif ? `\nMotif : ${args.motif}` : ""}\n${APP_URL}${args.href}`;
    const html = shell(
      subject,
      args.valide
        ? `<p>Votre réservation de <strong>${escapeHtml(args.equipement)}</strong> est <strong style="color:#7a8c3a">validée</strong>.</p>`
        : `<p>Votre demande de réservation de <strong>${escapeHtml(args.equipement)}</strong> a été <strong style="color:#a8332b">refusée</strong>.</p>${args.motif ? `<p style="color:#4d4843">Motif : ${escapeHtml(args.motif)}</p>` : ""}`,
      `${APP_URL}${args.href}`,
      "Voir la réservation",
    );
    return { subject, text, html };
  },

  /** Seuil de proposition atteint — alerte mairie. */
  propositionSeuil(args: { titre: string; soutiens: number; href: string }): TemplateOutput {
    const subject = "Proposition citoyenne : seuil atteint";
    const text = [
      `La proposition « ${args.titre} » a atteint ${args.soutiens} soutiens.`,
      "",
      "Vous devez publier une réponse formelle (positive, négative ou mise à l'étude) sous 60 jours.",
      "",
      `${APP_URL}${args.href}`,
    ].join("\n");
    const html = shell(
      subject,
      `<p>La proposition « <strong>${escapeHtml(args.titre)}</strong> » a atteint <strong>${args.soutiens} soutiens</strong>.</p><p>Vous devez publier une réponse formelle (positive, négative ou mise à l'étude) <strong>sous 60 jours</strong>.</p>`,
      `${APP_URL}${args.href}`,
      "Voir la proposition",
    );
    return { subject, text, html };
  },

  /** Notification générique — pour les events sans template dédié. */
  generic(args: { titre: string; body?: string; href?: string }): TemplateOutput {
    const subject = args.titre;
    const text = [args.titre, "", args.body ?? "", args.href ? `${APP_URL}${args.href}` : ""]
      .filter(Boolean)
      .join("\n");
    const html = shell(
      subject,
      `${args.body ? `<p>${escapeHtml(args.body)}</p>` : ""}`,
      args.href ? `${APP_URL}${args.href}` : undefined,
      args.href ? "Voir sur Trizac" : undefined,
    );
    return { subject, text, html };
  },
};
