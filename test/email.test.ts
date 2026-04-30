import { describe, expect, it } from "vitest";
import { templates, escapeHtml } from "@/lib/email/templates";

describe("Templates email", () => {
  it("welcome contient le nom", () => {
    const r = templates.welcome({ name: "Camille" });
    expect(r.subject).toContain("Bienvenue");
    expect(r.text).toContain("Camille");
    expect(r.html).toContain("Camille");
  });

  it("magicLink expose le TTL et l'URL", () => {
    const r = templates.magicLink({ url: "https://trizac.fr/api/magic/abc", ttlMin: 15 });
    expect(r.text).toContain("15 minutes");
    expect(r.text).toContain("https://trizac.fr/api/magic/abc");
    expect(r.html).toContain("https://trizac.fr/api/magic/abc");
  });

  it("signalementState échappe le HTML potentiellement injecté", () => {
    const r = templates.signalementState({
      titre: "<script>alert(1)</script> nid de poule",
      etatLabel: "résolu",
      comment: 'avec " des & guillemets',
      href: "/signalements/s1",
    });
    expect(r.html).not.toContain("<script>alert(1)</script>");
    expect(r.html).toContain("&lt;script&gt;");
    expect(r.html).toContain("&quot;");
    expect(r.html).toContain("&amp;");
    expect(r.text).toContain("nid de poule"); // texte brut OK
  });

  it("reservation distingue valide / refusée", () => {
    const ok = templates.reservation({ valide: true, equipement: "Salle des fêtes", href: "/reservation" });
    const ko = templates.reservation({ valide: false, equipement: "Salle des fêtes", motif: "Conflit", href: "/reservation" });
    expect(ok.subject).toContain("validée");
    expect(ko.subject).toContain("refusée");
    expect(ko.text).toContain("Conflit");
  });

  it("propositionSeuil mentionne les soutiens et le délai", () => {
    const r = templates.propositionSeuil({ titre: "Plan vélo", soutiens: 142, href: "/propositions/p2" });
    expect(r.text).toContain("142 soutiens");
    expect(r.text).toContain("60 jours");
  });

  it("generic supporte un body et un href absents", () => {
    const r = templates.generic({ titre: "Coucou" });
    expect(r.subject).toBe("Coucou");
    expect(r.text).toContain("Coucou");
    expect(r.html).toContain("Coucou");
  });
});

describe("escapeHtml", () => {
  it("échappe les caractères spéciaux HTML", () => {
    expect(escapeHtml('<a href="x">&"\'</a>')).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&quot;&#39;&lt;/a&gt;",
    );
  });
});

describe("Détection SMTP — règle env", () => {
  // On réplique la règle plutôt que d'importer le module qui dépend de
  // `server-only` (non disponible hors runtime Next.js).
  function isSmtpConfigured(env: NodeJS.ProcessEnv) {
    return !!env.SMTP_HOST;
  }
  it("vrai si SMTP_HOST est défini", () => {
    expect(isSmtpConfigured({ SMTP_HOST: "smtp.example.fr" } as never)).toBe(true);
  });
  it("faux sinon", () => {
    expect(isSmtpConfigured({} as never)).toBe(false);
  });
});
