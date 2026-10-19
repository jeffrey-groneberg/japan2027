import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { trip } from "../site/trip-data.js";
import { dayGuides, places } from "../site/guide-data.js";
import { diningOptions, diningBookingLabels, diningCategoryLabels } from "../site/dining-data.js";
import { festivalOptions, festivalStatusLabels, fireworksContext } from "../site/festival-data.js";
import { photosByPlace } from "../site/poi-photos.js";
import { buildCalendar, festivalMapsURL, festivalsForDay, filterDays, filterDining, placesForDay } from "../site/lib.js";
import { alternatives, foodMapsURL } from "../site/extras.js";
import { linkAudit } from "../site/link-audit.js";

test("DisneySea moves to Friday without changing the zoo, Ghibli alternative or departure dates", () => {
  assert.equal(trip.days.find(({ date }) => date === "2027-07-09").title, "DisneySea");
  assert.equal(trip.days.find(({ date }) => date === "2027-07-06").title, "teamLab & Odaiba");
  assert.equal(new Date("2027-07-09T12:00:00Z").getUTCDay(), 5);
  assert.deepEqual(placesForDay("2027-07-09").map(({ id }) => id), ["disney"]);
  assert.deepEqual(placesForDay("2027-07-06").map(({ id }) => id), ["teamlab", "odaiba"]);
  assert.equal(placesForDay("2027-07-07")[0].id, "zoo");
  assert.match(dayGuides["2027-07-06"].correction, /dienstags geschlossen/);
  assert.match(dayGuides["2027-07-06"].booking, /bereits gekauftes Ticket/);
  assert.match(dayGuides["2027-07-09"].booking, /nicht automatisch gültig/);
  assert.equal(trip.days.find(({ date }) => date === "2027-07-11").destination, "kyoto");
  assert.equal(trip.days.find(({ date }) => date === "2027-07-20").destination, "vietnam");
  const calendar = buildCalendar(trip).replaceAll("\r\n ", "");
  const events = calendar.split("BEGIN:VEVENT");
  assert.match(events.find((event) => event.includes("DTSTART;VALUE=DATE:20270709")), /SUMMARY:DisneySea/);
  assert.match(events.find((event) => event.includes("DTSTART;VALUE=DATE:20270706")), /SUMMARY:teamLab & Odaiba/);
});

test("dining highlights cover only the requested cities with explicit child and access information", () => {
  assert.deepEqual(new Set(diningOptions.map(({ destination }) => destination)), new Set(["tokyo", "kyoto", "osaka"]));
  assert.equal(new Set(diningOptions.map(({ id }) => id)).size, diningOptions.length);
  assert.ok(diningOptions.some(({ category }) => category === "view"));
  assert.ok(diningOptions.some(({ category }) => category === "experience"));
  for (const entry of diningOptions) {
    assert.ok(diningCategoryLabels[entry.category], entry.id);
    assert.ok(diningBookingLabels[entry.booking], entry.id);
    for (const key of ["why", "children", "practical", "bookingNote", "accessNote"]) {
      assert.ok(entry[key].length > 60, `${entry.id}: ${key}`);
    }
    assert.ok(entry.sources.length);
    for (const url of [entry.url, foodMapsURL(entry), ...entry.sources.map(({ url }) => url), ...(entry.bookingUrl ? [entry.bookingUrl] : [])]) {
      assert.equal(new URL(url).protocol, "https:");
      assert.ok(linkAudit[url], `${entry.id}: ${url}`);
    }
    if (entry.booking === "required") assert.equal(entry.walkIn, false, entry.id);
  }
});

test("spontaneous dining uses verified walk-in rules and does not include reservation-only cafes", () => {
  const spontaneous = filterDining(diningOptions, { spontaneous: true });
  assert.ok(spontaneous.length >= 2);
  assert.deepEqual(spontaneous.map(({ id }) => id).sort(), ["hirakuza-osaka", "kyoto-ramen-koji", "sky-buffet-51"]);
  assert.deepEqual(filterDining(diningOptions, { destination: "kyoto", spontaneous: true }).map(({ id }) => id), ["kyoto-ramen-koji"]);
  assert.deepEqual(filterDining(diningOptions, { destination: "tokyo", category: "view", spontaneous: true }), []);
  assert.equal(filterDining(diningOptions, { destination: "osaka" }).some(({ destination }) => destination !== "osaka"), false);
  assert.ok(diningOptions.filter(({ id }) => id.startsWith("pokemon-cafe")).every(({ booking }) => booking === "required"));
});

test("UZUMASA replaces Nara as a complete ninja day and keeps child safety explicit", () => {
  const option = alternatives["2027-07-13"].find(({ places: ids }) => ids.includes("uzumasa"));
  assert.ok(option);
  assert.match(option.title, /statt Nara/);
  assert.match(option.text, /Nicht anschließend noch nach Nara/);
  assert.match(option.text, /feste Schuhe/);
  assert.match(option.booking, /getrennte Leistungen/);
  assert.match(option.transit, /Uzumasa Tenjingawa/);
  assert.deepEqual(option.resources, ["uzumasaNinja", "uzumasaMaze", "uzumasaTickets", "uzumasaAccess"]);
  assert.deepEqual(places.uzumasa.coordinates, [35.016452, 135.708023]);
  assert.match(places.uzumasa.description, /Geheimtüren/);
  assert.deepEqual(placesForDay("2027-07-13").map(({ id }) => id), ["nara", "todaiji"]);
  assert.deepEqual(filterDays(trip.days, { query: "Ninja-Haus" }).map(({ date }) => date), ["2027-07-13"]);
  const event = buildCalendar(trip).replaceAll("\r\n ", "").split("BEGIN:VEVENT")
    .find((entry) => entry.includes("DTSTART;VALUE=DATE:20270713"));
  assert.match(event, /Alternative: UZUMASA Ninja-Haus statt Nara/);
  assert.match(event, /Kulinarik: UZUMASA Kyoto Village/);
});

test("HIRAKUZA is an honest family sumo dinner show, not a professional tournament claim", () => {
  const entry = diningOptions.find(({ id }) => id === "hirakuza-osaka");
  assert.ok(entry);
  assert.equal(entry.destination, "osaka");
  assert.equal(entry.booking, "recommended");
  assert.equal(entry.walkIn, true);
  assert.match(entry.why, /kein offizielles Profi-Turnier/);
  assert.match(entry.children, /3 bis 12/);
  assert.match(entry.bookingNote, /drei Tage vor der Show/);
  assert.match(entry.accessNote, /touristische Entertainment-Show/);
  assert.equal(entry.bookingUrl, "https://ars-hirakuza.triplabo.com/home?lang=en");
  const option = alternatives["2027-07-18"].find(({ dining }) => dining === entry.id);
  assert.ok(option);
  assert.match(option.text, /kein offizielles Profi-Turnier/);
  assert.match(option.booking, /vier Sitzplätze/);
  assert.match(option.transit, /Namba Parks/);
  const event = buildCalendar(trip).replaceAll("\r\n ", "").split("BEGIN:VEVENT")
    .find((calendarEntry) => calendarEntry.includes("DTSTART;VALUE=DATE:20270718"));
  assert.match(event, /Alternative: Sumo-Show mit Abendessen/);
});

test("festivals use proposal dates with honest unconfirmed status and do not overload fixed days", () => {
  const windows = { tokyo: ["2027-07-04", "2027-07-11"], kyoto: ["2027-07-11", "2027-07-15"], osaka: ["2027-07-15", "2027-07-20"] };
  for (const event of festivalOptions) {
    assert.ok(festivalStatusLabels[event.dateStatus], event.id);
    assert.notEqual(event.dateStatus, "confirmed-2027", "No current source confirms an explicit 2027 edition.");
    const [start, end] = windows[event.fromDestination ?? event.destination];
    for (const date of event.proposedDates) assert.ok(date >= start && date < end, `${event.id}: ${date}`);
    for (const key of ["when", "why", "children", "logistics", "planAdvice"]) assert.ok(event[key].length > 60, `${event.id}: ${key}`);
    for (const url of [event.url, festivalMapsURL(event), ...event.sources.map(({ url }) => url)]) {
      assert.equal(new URL(url).protocol, "https:");
      assert.ok(linkAudit[url], `${event.id}: ${url}`);
    }
  }
  assert.deepEqual(festivalsForDay("2027-07-09").map(({ id }) => id), ["disney-believe"]);
  assert.equal(festivalsForDay("2027-07-10")[0].id, "sensoji-hozuki");
  assert.equal(festivalsForDay("2027-07-17")[0].fromDestination, "osaka");
  assert.match(festivalsForDay("2027-07-17")[0].planAdvice, /ERSATZ für Minoh/);
  assert.match(festivalsForDay("2027-07-14")[0].children, /Nicht von autofreien Straßen/);
  assert.match(festivalsForDay("2027-07-07")[0].planAdvice, /Nicht Zoo, Asakusa und Iriya/);
  assert.deepEqual(filterDays(trip.days, { query: "Prunkwinden" }).map(({ date }) => date), ["2027-07-07"]);
  assert.ok(buildCalendar(trip).replaceAll("\r\n ", "").includes("Jahrestermin · Programm 2027 noch prüfen"));
  assert.equal(fireworksContext.length, 2);
  for (const entry of fireworksContext) assert.ok(linkAudit[entry.url]);
});

test("real POI photos are local, licensed, correctly credited and complemented by explicit illustrations", async () => {
  assert.ok(Object.keys(photosByPlace).length >= 20);
  assert.ok(Object.keys(photosByPlace).length < Object.keys(places).length);
  for (const [id, photo] of Object.entries(photosByPlace)) {
    assert.ok(places[id], id);
    assert.ok(photo.author && photo.alt && photo.file && photo.license, id);
    assert.equal(new URL(photo.sourceUrl).hostname, "commons.wikimedia.org");
    assert.equal(new URL(photo.licenseUrl).protocol, "https:");
    assert.ok(linkAudit[photo.sourceUrl], photo.sourceUrl);
    assert.ok(linkAudit[photo.licenseUrl], photo.licenseUrl);
    for (const path of [photo.src, photo.thumb]) {
      assert.ok(path.startsWith("./assets/poi/"), path);
      const bytes = await readFile(new URL(`../site/${path.slice(2)}`, import.meta.url));
      assert.ok(bytes.length > 100, path);
      assert.ok((bytes[0] === 255 && bytes[1] === 216) || (bytes[0] === 137 && bytes[1] === 80) || (bytes[0] === 82 && bytes[1] === 73), path);
    }
  }
  const svg = await readFile(new URL("../site/assets/poi-illustrations.svg", import.meta.url), "utf8");
  for (const scene of ["shrine", "mountain", "park", "museum", "shopping", "crossing", "food", "view", "feast", "ninja", "sumo"]) {
    assert.ok(svg.includes(`id="scene-${scene}"`), scene);
  }
  assert.doesNotMatch(svg, /(?:fill|stroke)="#/);
  assert.equal(photosByPlace.pokemon.src, photosByPlace.nintendoTokyo.src, "The shared PARCO exterior must not pretend to be a shop-interior photo.");
});
