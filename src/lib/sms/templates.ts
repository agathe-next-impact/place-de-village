/**
 * Templates SMS — courts par construction (160 caractères = 1 SMS).
 * Au-delà, la facturation passe en multi-segments.
 */

export type SmsTemplate = { body: string; chars: number; segments: number };

function build(text: string): SmsTemplate {
  const chars = text.length;
  // Approximation : encoding GSM-7 limite à 160/153/153/...
  const segments = chars <= 160 ? 1 : Math.ceil((chars - 7) / 153) + 1;
  return { body: text, chars, segments };
}

export const smsTemplates = {
  /** Rappel J-1 d'une mission de bénévolat. */
  missionReminder(args: { titre: string; lieu: string; heure?: string }): SmsTemplate {
    const heure = args.heure ? `, ${args.heure}` : "";
    return build(
      `[Trizac] Rappel demain : ${args.titre}${heure} a ${args.lieu}. Annulation : repondez NON.`,
    );
  },

  /** Confirmation immédiate (envoyée si SMS activé, en plus de l'email). */
  missionConfirmation(args: { titre: string; date: string }): SmsTemplate {
    return build(
      `[Trizac] Inscription confirmee : ${args.titre}, ${args.date}. Vous recevrez un rappel la veille.`,
    );
  },

  /** Code de vérification numéro de téléphone. */
  phoneVerification(args: { code: string }): SmsTemplate {
    return build(`[Trizac] Code de verification : ${args.code}. Valide 10 min.`);
  },
};
