import { describe, expect, it } from "vitest";
import { smsTemplates } from "@/lib/sms/templates";

describe("Templates SMS", () => {
  it("missionReminder reste en 1 segment SMS standard (≤160 chars)", () => {
    const r = smsTemplates.missionReminder({
      titre: "Préparation marché de Noël",
      lieu: "Salle des fêtes",
      heure: "14h",
    });
    expect(r.body).toContain("Trizac");
    expect(r.body).toContain("Préparation marché de Noël");
    expect(r.chars).toBeLessThanOrEqual(160);
    expect(r.segments).toBe(1);
  });

  it("missionReminder accepte des libellés plus longs en plusieurs segments", () => {
    const r = smsTemplates.missionReminder({
      titre: "Préparation du marché de Noël annuel et du stand de chocolat chaud pour l'AFM",
      lieu: "Grande salle des fêtes du bourg, place de l'Église",
      heure: "14h00",
    });
    expect(r.chars).toBeGreaterThan(160);
    expect(r.segments).toBeGreaterThanOrEqual(2);
  });

  it("phoneVerification est court (1 segment)", () => {
    const r = smsTemplates.phoneVerification({ code: "938472" });
    expect(r.body).toContain("938472");
    expect(r.segments).toBe(1);
  });
});

describe("Validation téléphone", () => {
  // Réplique de la regex utilisée dans updatePhoneAndConsent
  const re = /^\+?[0-9 .-]{6,20}$/;
  it("accepte les formats courants", () => {
    expect(re.test("+33 6 11 22 33 44")).toBe(true);
    expect(re.test("06 11 22 33 44")).toBe(true);
    expect(re.test("+33611223344")).toBe(true);
    expect(re.test("01.23.45.67.89")).toBe(true);
  });
  it("rejette les formats invalides", () => {
    expect(re.test("Mon téléphone")).toBe(false);
    expect(re.test("123")).toBe(false);
    expect(re.test("+33 (0)6 11 22")).toBe(false);
  });
});

describe("Provider factory — règle env", () => {
  function pickProvider(env: NodeJS.ProcessEnv) {
    return (env.SMS_PROVIDER ?? "outbox").toLowerCase();
  }
  it("retombe sur outbox si SMS_PROVIDER absent", () => {
    expect(pickProvider({} as never)).toBe("outbox");
  });
  it("smspartner reconnu (insensible à la casse)", () => {
    expect(pickProvider({ SMS_PROVIDER: "SMSPartner" } as never)).toBe("smspartner");
  });
});
