import { listAgenda } from "@/lib/queries";

/**
 * Export ICS de l'agenda communal — Pôle 5 §2.1.
 * RFC 5545 minimal. Pas d'horaires précis stockés (heure libre type "20h00"),
 * on génère donc des événements toute la journée.
 */
export async function GET() {
  const items = await listAgenda();
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Trizac//Agenda//FR",
    "CALSCALE:GREGORIAN",
  ];
  for (const e of items) {
    if (!e.iso) continue;
    const dt = e.iso.replaceAll("-", "");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.id}@trizac.fr`);
    lines.push(`SUMMARY:${escape(e.titre)}`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push(`DTEND;VALUE=DATE:${dt}`);
    lines.push(`LOCATION:${escape(e.lieu)}`);
    lines.push(`DESCRIPTION:${escape(e.heure)} · Trizac`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n"), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="trizac-agenda.ics"',
    },
  });
}

function escape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
