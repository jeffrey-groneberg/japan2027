import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { trip } from "../site/trip-data.js";
import {
  buildCalendar, countdown, defaultState, destinations, filterDays,
  foldCalendarLine, metadataFor, parseState,
  entriesForDay, googleMapsURL, placesForDay,
} from "../site/lib.js";
import { bases, dayGuides, places, railGuide, resources } from "../site/guide-data.js";
import { linkAudit, retiredLinks } from "../site/link-audit.js";
import { alternatives, foodByPlace, foodMapsURL, foodStops } from "../site/extras.js";

test("all 30 original travel dates are unique, ordered and contiguous", () => {
  assert.equal(trip.days.length, 30);
  assert.equal(trip.startDate, "2027-07-03");
  assert.equal(trip.endDate, "2027-08-01");
  assert.equal(new Set(trip.days.map((day) => day.date)).size, 30);
  for (const [index, day] of trip.days.entries()) {
    assert.equal(Date.parse(`${day.date}T00:00:00Z`), Date.parse("2027-07-03T00:00:00Z") + index * 86400000);
    assert.ok(day.title && day.activities.length && day.activities.every((activity) => activity.length > 0));
    assert.ok(["reise", ...destinations.map((destination) => destination.id)].includes(day.destination));
    assert.ok(metadataFor(day).mapQuery);
  }
});

test("all flights, accommodation alternatives, booking links and deadlines survive", () => {
  assert.equal(trip.flights.length, 3);
  assert.equal(trip.accommodations.flatMap((city) => city.options).length, 10);
  assert.equal(trip.checklist.length, 8);
  const links = [
    ...trip.flights.flatMap((flight) => flight.links),
    ...trip.accommodations.flatMap((city) => city.options.flatMap((stay) => stay.links)),
  ];
  assert.equal(links.length, 13);
  for (const link of links) assert.equal(new URL(link.url).protocol, "https:");
  assert.match(trip.flights[0].details, /15:05/);
  assert.match(trip.flights[1].details, /10:10/);
  assert.match(trip.flights[2].details, /06:30/);
  assert.match(trip.days.find((day) => day.date === "2027-07-12").title, /Nintendo Museum/);
  assert.match(trip.days.find((day) => day.date === "2027-07-16").title, /Super Nintendo World/);
  assert.ok(trip.stops[3].notes.some((note) => note.includes("1,5 Std.")));
});

test("transition days belong to the arriving destination and remain findable", () => {
  for (const [destination, count] of [["tokyo", 7], ["kyoto", 4], ["osaka", 5], ["vietnam", 12], ["reise", 2]]) {
    assert.equal(filterDays(trip.days, { destination }).length, count);
  }
  assert.equal(trip.days.find((day) => day.date === "2027-07-11").destination, "kyoto");
  assert.equal(trip.days.find((day) => day.date === "2027-07-15").destination, "osaka");
  assert.equal(trip.days.find((day) => day.date === "2027-07-20").destination, "vietnam");
});

test("search includes the original practical details and composes with filters", () => {
  assert.ok(filterDays(trip.days, { query: "Tokio" }).length >= 7);
  assert.equal(filterDays(trip.days, { query: "nintendo museum" }).length, 1);
  assert.ok(filterDays(trip.days, { query: "Großraumtaxi" }).length);
  assert.ok(filterDays(trip.days, { query: "grossraumtaxi" }).length);
  assert.equal(filterDays(trip.days, { destination: "osaka", query: "DisneySea" }).length, 0);
  assert.equal(filterDays(trip.days, { savedOnly: true }, ["2027-07-12"]).length, 1);
  assert.equal(filterDays(trip.days, { savedOnly: true }).length, 0);
  assert.equal(filterDays(trip.days, { query: "zz-no-such-activity" }).length, 0);
});

test("local state round-trips and corrupt or obsolete data never silently succeeds", () => {
  const state = defaultState(trip);
  state.favorites = ["2027-07-06"];
  state.completed = ["task-0"];
  state.theme = "dark";
  assert.deepEqual(parseState(JSON.stringify(state), trip), state);
  assert.deepEqual(parseState(null, trip), defaultState(trip));
  assert.throws(() => parseState("{broken", trip));
  for (const mutate of [
    (value) => { value.version = 5; },
    (value) => { value.favorites = ["2030-01-01"]; },
    (value) => { value.completed = ["task-0", "task-0"]; },
    (value) => { value.stays.kyoto = "invalid"; },
    (value) => { value.theme = "invalid"; },
  ]) {
    const invalid = structuredClone(state);
    mutate(invalid);
    assert.throws(() => parseState(JSON.stringify(invalid), trip), /does not match/);
  }
});

test("calendar export has all 30 all-day events, correct exclusive ends and UTC stamps", () => {
  const calendar = buildCalendar(trip, new Date("2026-10-19T10:00:00Z"));
  assert.equal(calendar.match(/BEGIN:VEVENT/g).length, 30);
  assert.match(calendar, /DTSTART;VALUE=DATE:20270703/);
  assert.match(calendar, /DTSTART;VALUE=DATE:20270801/);
  assert.match(calendar, /DTEND;VALUE=DATE:20270802/);
  assert.match(calendar, /DTSTAMP:20261019T100000Z/);
  for (const line of calendar.split("\r\n")) assert.ok(Buffer.byteLength(line, "utf8") <= 75);
  assert.ok(calendar.endsWith("END:VCALENDAR\r\n"));
});

test("calendar folding preserves multibyte characters and escapes user-visible punctuation", () => {
  const original = "DESCRIPTION:" + "東京, Grüße; Straße ".repeat(20);
  const folded = foldCalendarLine(original);
  assert.equal(folded.replaceAll("\r\n ", ""), original);
  for (const line of folded.split("\r\n")) assert.ok(Buffer.byteLength(line, "utf8") <= 75);
  const calendar = buildCalendar({ days: [{ date: "2027-07-03", destination: "tokyo", title: "A, B; C\\D\nE", activities: [] }] });
  assert.ok(calendar.includes("SUMMARY:A\\, B\\; C\\\\D\\nE"));
});

test("every travel day has a concrete sequence, actionable transport and ticket guidance", () => {
  const hotelDays = new Set(["2027-07-21", "2027-07-23", "2027-07-25", "2027-07-27", "2027-07-28", "2027-07-29", "2027-07-30"]);
  assert.deepEqual(Object.keys(dayGuides).sort(), trip.days.map((day) => day.date).sort());
  for (const [date, guide] of Object.entries(dayGuides)) {
    assert.ok(guide.summary.length >= 50, date);
    assert.ok(guide.steps.length >= (hotelDays.has(date) ? 1 : 2), date);
    assert.ok(guide.transit.title && guide.transit.ticket.length >= (hotelDays.has(date) ? 20 : 50), date);
    assert.ok(guide.transit.steps.length >= (hotelDays.has(date) ? 1 : 2), date);
    if (hotelDays.has(date)) {
      assert.equal(guide.steps.length, 1, date);
      assert.match(guide.steps[0].title, /Hotel, Pool/);
      assert.match(guide.transit.title, /kein Transfer/i);
    }
    for (const step of guide.steps) {
      assert.ok(step.title && step.time && step.text.trim(), `${date}: ${step.title}`);
      for (const id of step.places ?? []) assert.ok(places[id], `${date}: ${id}`);
    }
    for (const id of guide.resources ?? []) assert.ok(resources[id], id);
  }
  assert.ok(railGuide.some((item) => item.text.includes("JR ist ein Betreiber")));
  assert.ok(railGuide.some((item) => item.text.includes("500 ¥")));
  assert.ok(railGuide.some((item) => `${item.title} ${item.text}`.includes("Reisepass")));
});

test("every mapped place has attributed coordinates and an exact matching Google Maps URL", () => {
  for (const [id, place] of Object.entries(places)) {
    assert.ok(place.evidence.length > 15, id);
    assert.ok(resources[place.resource], `${id}: official resource`);
    assert.ok(place.description.length > 100, `${id}: useful description`);
    const [lat, lon] = place.coordinates;
    assert.ok(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180, id);
    const url = new URL(googleMapsURL(place));
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, "www.google.com");
    assert.equal(url.searchParams.get("api"), "1");
    assert.equal(url.searchParams.get("query"), place.coordinates.join(","));
    assert.equal(url.searchParams.has("query_place_id"), false);
  }
  assert.throws(() => googleMapsURL({ name: "Unknown", coordinates: null }), /No verified coordinates/);
  assert.notDeepEqual(places.usj.coordinates, places.nintendoWorld.coordinates);
  assert.notDeepEqual(places.tsukiji.coordinates, [35.661389, 139.769722]);
  assert.deepEqual(places.robinson.coordinates, [15.56194, 108.5732632]);
  assert.deepEqual(places.coop.coordinates, [15.5729589, 108.4838371]);
});

test("the Shibuya day includes the official Pokemon Center alongside Nintendo in PARCO", () => {
  assert.deepEqual(placesForDay("2027-07-05").map((place) => place.id), ["takeshita", "nintendoTokyo", "pokemon", "crossing", "sky"]);
  assert.deepEqual(placesForDay("2027-07-05").map((place) => place.number), [1, 2, 3, 4, 5]);
  assert.equal(places.pokemon.mapGroup, places.nintendoTokyo.mapGroup);
  assert.deepEqual(places.pokemon.coordinates, [35.6619997, 139.6984094]);
  assert.equal(resources.pokemon.url, "https://shop.pokemon.co.jp/en/shop/pokemoncenter-shibuya/");
  assert.ok(dayGuides["2027-07-05"].booking.includes("Shibuya Sky"));
  assert.deepEqual(placesForDay("2027-07-03"), []);
});

test("all bases have grocery and shopping choices, without inventing a private apartment address", () => {
  assert.equal(bases.length, 4);
  for (const base of bases) {
    const choices = base.shopping.map((id) => places[id]);
    assert.ok(choices.every(Boolean));
    assert.ok(choices.some((place) => place.kind === "Lebensmittel"));
    assert.ok(choices.some((place) => /Shopping|Souvenir/.test(place.kind)));
    assert.ok(base.firstShop.length > 80);
  }
  assert.match(bases[0].description, /genaue Adresse.*nicht bestätigt/);
  assert.match(bases[3].description, /nicht bestätigt/);
});

test("new instructions explicitly correct three material errors in the source", () => {
  assert.match(dayGuides["2027-07-07"].booking, /montags geschlossen/);
  assert.match(dayGuides["2027-07-12"].correction, /Taxi/);
  assert.match(dayGuides["2027-07-22"].correction, /50 km \/ 60 Minuten/);
  assert.match(dayGuides["2027-07-26"].correction, /bestätigte Gesamtdauer/);
});

test("the zoo is prioritized on Wednesday, Shibuya moves to Monday and calendar dates agree", () => {
  assert.equal(trip.days.find((day) => day.date === "2027-07-05").title, "Shibuya & Harajuku");
  assert.equal(trip.days.find((day) => day.date === "2027-07-07").title, "Ueno Zoo & Asakusa");
  assert.equal(new Date("2027-07-07T12:00:00Z").getUTCDay(), 3);
  assert.equal(dayGuides["2027-07-07"].steps[0].places[0], "zoo");
  assert.match(dayGuides["2027-07-07"].steps[0].time, /9:30/);
  assert.match(dayGuides["2027-07-07"].steps[2].time, /optional/);
  assert.match(dayGuides["2027-07-05"].booking, /umgebucht/);
  const events = buildCalendar(trip).replaceAll("\r\n ", "").split("BEGIN:VEVENT");
  assert.ok(events.find((event) => event.includes("DTSTART;VALUE=DATE:20270705")).includes("SUMMARY:Shibuya & Harajuku"));
  assert.ok(events.find((event) => event.includes("DTSTART;VALUE=DATE:20270707")).includes("SUMMARY:Ueno Zoo & Asakusa"));
});

test("every point appears once inline and uses the same chronological number as its map marker", () => {
  for (const day of trip.days) {
    const entries = entriesForDay(day.date);
    const ids = entries.filter((entry) => entry.placeId).map((entry) => entry.placeId);
    assert.equal(new Set(ids).size, ids.length, day.date);
    assert.deepEqual(entries.map((entry) => entry.number), Array.from({ length: entries.length }, (_, index) => index + 1));
    for (const point of placesForDay(day.date)) {
      assert.equal(entries[point.number - 1].placeId, point.id);
    }
    assert.equal(entries.filter((entry) => entry.showContext).length, dayGuides[day.date].steps.length);
  }
  assert.deepEqual(placesForDay("2027-07-07").map(({ number }) => number), [1, 3, 4]);
});

test("booking caveats distinguish exact room evidence and the officially announced route", () => {
  const sakura = trip.accommodations[1].options.find((option) => option.id === "kyoto-2");
  assert.match(linkAudit[sakura.links[0].url].notice, /widersprüchlich/);
  const olfea = trip.accommodations[2].options.find((option) => option.id === "osaka-1");
  assert.match(linkAudit[olfea.links[0].url].notice, /15.–20.07.2027/);
  assert.equal(linkAudit[resources.kansaiDaNang.url].verification, "browser-dom");
  assert.match(linkAudit[resources.kansaiDaNang.url].message, /Keine Bestätigung der Buchbarkeit/);
});

test("every published official, booking and coordinate link has an honest recorded check", () => {
  for (const resource of Object.values(resources)) assert.ok(linkAudit[resource.url], resource.url);
  for (const place of Object.values(places)) {
    const url = googleMapsURL(place);
    assert.equal(linkAudit[url]?.status, "ok", place.name);
    assert.equal(linkAudit[url]?.httpStatus, 200, place.name);
  }
  for (const city of trip.accommodations) {
    for (const option of city.options) {
      for (const link of option.links) {
        assert.ok(linkAudit[link.url]);
        assert.equal(linkAudit[link.url].verification, "browser-dom", "Previously restricted pages need actual browser evidence.");
      }
    }
  }
  assert.ok(Object.keys(linkAudit).length >= 110);
  assert.equal(Object.values(linkAudit).filter((entry) => entry.kind === "map").length, 48);
  assert.equal(retiredLinks.length, 1);
  for (const entry of Object.values(linkAudit)) {
    assert.match(entry.checkedAt, /^\d{4}-\d{2}-\d{2}T/);
    assert.ok(Number.isFinite(Date.parse(entry.checkedAt)));
    assert.ok(entry.message);
  }
});

test("old browser preferences migrate without losing favorites or retaining removed budget state", () => {
  const old = { ...defaultState(trip), version: 1, budget: [{ min: 1, max: 2 }] };
  old.favorites = ["2027-07-07"];
  const migrated = parseState(JSON.stringify(old), trip);
  assert.equal(migrated.version, 2);
  assert.deepEqual(migrated.favorites, ["2027-07-07"]);
  assert.equal("budget" in migrated, false);
});

test("route decisions stay explicit while Vietnam hotel days remain intentionally empty", () => {
  const hotelDays = ["2027-07-21", "2027-07-23", "2027-07-25", "2027-07-27", "2027-07-28", "2027-07-29", "2027-07-30"];
  for (const date of hotelDays) assert.equal(alternatives[date], undefined, date);
  for (const [date, options] of Object.entries(alternatives)) {
    assert.ok(dayGuides[date], date);
    assert.ok(options.length, date);
    for (const alternative of options) {
      assert.ok(alternative.title && alternative.when && alternative.text.length > 60);
      for (const id of alternative.places) assert.ok(places[id], `${date}: ${id}`);
      for (const id of alternative.resources ?? []) assert.ok(resources[id], `${date}: ${id}`);
    }
  }
  for (const id of Object.keys(places)) {
    const food = foodStops[foodByPlace[id]];
    assert.ok(food, `Missing food recommendation for ${id}`);
    assert.ok(food.why.length > 80 && food.children.length > 80 && food.practical.length > 50, id);
    assert.equal(new URL(food.url).protocol, "https:");
    const maps = new URL(foodMapsURL(food));
    assert.equal(maps.hostname, "www.google.com");
    assert.equal(maps.searchParams.get("api"), "1");
    assert.equal(maps.searchParams.get("query"), food.query);
    assert.ok(linkAudit[food.url], food.url);
    assert.ok(linkAudit[maps.href], maps.href);
  }
  assert.match(foodStops.hatena.practical, /Museumsticket/);
  assert.match(foodStops.mochi.children, /sicherem Kauen/);
  assert.match(foodStops.tsujiri.children, /Koffein/);
  assert.match(foodStops.hoian.name, /Morning Glory/);
});

test("Ghibli is a reserved-ticket alternative, not an additional mountain-day obligation", () => {
  const option = alternatives["2027-07-08"].find(({ places }) => places.includes("ghibli"));
  assert.ok(option);
  assert.deepEqual(option.places, ["ghibli"]);
  assert.match(option.when, /bestätigtem Zeitfensterticket/);
  assert.match(option.booking, /10. Juni 2027/);
  assert.match(option.booking, /03:00 Uhr MESZ/);
  assert.match(option.booking, /Lawson/);
  assert.match(option.transit, /JR Chuo Line/);
  assert.deepEqual(placesForDay("2027-07-08").map(({ id }) => id), ["takao"]);
  assert.deepEqual(places.ghibli.coordinates, [35.696238, 139.5704317]);
  assert.match(places.ghibli.description, /bis zwölf Jahre/);
  assert.match(foodStops[foodByPlace.ghibli].practical, /Nur mit Museumseintritt/);
  assert.deepEqual(filterDays(trip.days, { query: "Ghibli" }).map(({ date }) => date), ["2027-07-08"]);
  assert.deepEqual(filterDays(trip.days, { query: "Straw Hat" }).map(({ date }) => date), ["2027-07-08"]);
  assert.deepEqual(filterDays(trip.days, { query: "Pokemon Center" }).map(({ date }) => date), ["2027-07-05"]);
  assert.equal(Object.keys(places).some((id) => /akira|ghost|transformers|skytree/i.test(id)), false);
  const event = buildCalendar(trip).replaceAll("\r\n ", "").split("BEGIN:VEVENT").find((event) => event.includes("DTSTART;VALUE=DATE:20270708"));
  assert.match(event, /SUMMARY:Wandertag: Mount Takao/);
  assert.match(event, /Route: Ghibli Museum statt Mount Takao/);
  assert.match(event, /03:00 Uhr MESZ/);
  assert.match(event, /Optionale Kulinarik: Straw Hat/);
});

test("adding the optional Ghibli booking preserves all previous checklist identities and saved progress", () => {
  assert.deepEqual(trip.checklist.map(({ id }) => id).sort(), Array.from({ length: 8 }, (_, index) => `task-${index}`));
  const task = trip.checklist.find(({ id }) => id === "task-7");
  assert.match(task.title, /Optional: Ghibli/);
  assert.match(task.deadline, /10.06.2027.*03:00 MESZ/);
  assert.deepEqual(task.resources, ["ghibliTickets"]);
  const previous = { ...defaultState(trip), completed: ["task-0", "task-3", "task-6"] };
  assert.deepEqual(parseState(JSON.stringify(previous), trip).completed, previous.completed);
});

test("countdown handles departure, the full trip and the time after returning", () => {
  assert.equal(countdown(trip.startDate, trip.endDate, new Date(2027, 6, 2, 18)), "Noch 1 Tag");
  assert.equal(countdown(trip.startDate, trip.endDate, new Date(2027, 6, 3, 0)), "Reisetag 1 von 30");
  assert.equal(countdown(trip.startDate, trip.endDate, new Date(2027, 7, 1, 23)), "Reisetag 30 von 30");
  assert.equal(countdown(trip.startDate, trip.endDate, new Date(2027, 7, 2)), "Was für eine Reise!");
});

test("the site is build-free, project-path-safe and keeps its design contract", async () => {
  const html = await readFile(new URL("../site/index.html", import.meta.url), "utf8");
  assert.match(html, /135a2d75/);
  assert.match(html, /<html lang="de"/);
  assert.doesNotMatch(html, /(?:src|href)="\/(?:app|styles|assets|trip)/);
  assert.doesNotMatch(html, /<script[^>]+src="https?:/);
  assert.doesNotMatch(html, /<link[^>]+href="https?:/);
  assert.match(html, /clawpilotTheme/);
  assert.match(html, /--cp-bg: #f7f4ef/);
  assert.match(html, /--cp-bg: #3d3b3a/);
  assert.ok((await readFile(new URL("../site/assets/lilita-one.ttf", import.meta.url))).byteLength > 10000);
});
