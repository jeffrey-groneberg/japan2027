import { readFileSync, writeFileSync } from "node:fs";
import { trip } from "../site/trip-data.js";

if (!process.argv[2]) throw new Error("Usage: node scripts/publish-link-audit.mjs REPORT.json");
const report = JSON.parse(readFileSync(process.argv[2], "utf8"));
const audit = {};
for (const result of report) {
  if (["wrong-target", "unsafe-redirect"].includes(result.status)) {
    throw new Error(`Fix the incorrect destination before publishing: ${result.id}, ${result.finalUrl}`);
  }
  if (result.kind === "map" && !result.coordinateQueryPreserved) {
    throw new Error(`Google Maps did not retain the verified coordinates: ${result.id}`);
  }
  const ok = result.status === "reachable";
  const checkedOn = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC",
  }).format(new Date(result.checkedAt));
  let message = `Geprüft am ${checkedOn}: HTTP ${result.httpStatus}.`;
  if (result.kind === "map") message += " Der Zielparameter enthält unverändert die abgeglichenen Markerkoordinaten.";
  if (!ok) {
    if (result.httpStatus === 202) {
      message = "Anbieter liefert nur eine Prüf-/Zwischenseite (HTTP 202). Unterkunft, Reisedaten und Verfügbarkeit konnten nicht bestätigt werden.";
    } else if (result.kind === "booking") {
      message = `Automatischer Zugriff vom Anbieter beschränkt (HTTP ${result.httpStatus ?? "nicht verfügbar"}). Unterkunftszuordnung, Reisedaten und Verfügbarkeit nicht bestätigt.`;
    } else if (result.status === "restricted") {
      message = `Offizielle Domain; Zugriff bei der Prüfung beschränkt (HTTP ${result.httpStatus}). Seiteninhalt nicht vollständig bestätigbar.`;
    } else {
      message = "Offizielle Domain; Erreichbarkeit bei der Prüfung wegen Verbindungsfehler oder Zeitüberschreitung nicht bestätigt.";
    }
  }
  audit[result.url] = {
    label: result.label,
    kind: result.kind,
    status: ok ? "ok" : result.status,
    httpStatus: result.httpStatus,
    checkedAt: result.checkedAt,
    finalUrl: result.finalUrl,
    pageTitle: result.title,
    message,
  };
}
if (process.argv[3]) {
  const browserEvidence = JSON.parse(readFileSync(process.argv[3], "utf8"));
  for (const evidence of browserEvidence) {
    const result = report.find((entry) => entry.id === evidence.id);
    if (!result) throw new Error(`Browser evidence has no matching original URL: ${evidence.id}`);
    Object.assign(audit[result.url], {
      status: "ok",
      verification: "browser-dom",
      pageTitle: evidence.title,
      message: `Im Browser-DOM geprüft: ${evidence.note}`,
      ...(evidence.path ? { canonicalPath: evidence.path } : {}),
      ...(evidence.notice ? { notice: evidence.notice } : {}),
    });
  }
}
const retired = [{
  label: "Osaka → Da Nang: ursprünglicher lastminute.de-Suchlink",
  url: trip.flights[1].links[0].url,
  reason: "Weiterleitung in abgelaufene Suchsitzung (reason=gone); durch die offizielle VietJet-Seite ersetzt. Keine behauptete Verfügbarkeit für Juli 2027.",
}];
writeFileSync(new URL("../site/link-audit.js", import.meta.url),
  "// Generated from individual URL requests; access restrictions are not treated as successful verification.\n"
  + `export const linkAudit = ${JSON.stringify(audit, null, 2)};\n`
  + `export const retiredLinks = ${JSON.stringify(retired, null, 2)};\n`);
console.log(`Recorded ${Object.keys(audit).length} individual checks; ${Object.values(audit).filter((entry) => entry.status !== "ok").length} explicitly qualified results; ${retired.length} retired search link.`);
