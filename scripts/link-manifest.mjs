import { writeFileSync } from "node:fs";
import { resources, places } from "../site/guide-data.js";
import { trip } from "../site/trip-data.js";
import { festivalMapsURL, googleMapsURL } from "../site/lib.js";
import { foodMapsURL, foodStops } from "../site/extras.js";
import { diningOptions } from "../site/dining-data.js";
import { festivalOptions, fireworksContext } from "../site/festival-data.js";
import { photosByPlace } from "../site/poi-photos.js";

const output = process.argv[2];
if (!output) throw new Error("Usage: node scripts/link-manifest.mjs OUTPUT.json");
const manifest = [
  ...Object.entries(resources).map(([id, resource]) => ({ id: `official-${id}`, ...resource, kind: "official" })),
  ...Object.entries(places).filter(([, place]) => place.coordinates).map(([id, place]) => ({
    id: `map-${id}`, label: `Google Maps: ${place.name}`, url: googleMapsURL(place), coordinates: place.coordinates, evidence: place.evidence, kind: "map",
  })),
  ...Object.entries(foodStops).flatMap(([id, food]) => [
    { id: `food-${id}`, label: `Kulinarik: ${food.name}`, url: food.url, kind: "official" },
    { id: `foodmap-${id}`, label: `Google Maps: ${food.name}`, url: foodMapsURL(food), kind: "food-map" },
  ]),
  ...diningOptions.flatMap((entry) => [
    { id: `dining-${entry.id}`, label: entry.name, url: entry.url, kind: "official" },
    { id: `diningmap-${entry.id}`, label: `Google Maps: ${entry.name}`, url: foodMapsURL(entry), kind: "dining-map" },
    ...(entry.bookingUrl ? [{ id: `diningbook-${entry.id}`, label: `${entry.name}: Reservierung`, url: entry.bookingUrl, kind: "official" }] : []),
    ...entry.sources.map((source, index) => ({ id: `diningsource-${entry.id}-${index}`, label: source.label, url: source.url, kind: "official" })),
  ]),
  ...festivalOptions.flatMap((event) => [
    { id: `festival-${event.id}`, label: event.title, url: event.url, kind: "official" },
    { id: `festivalmap-${event.id}`, label: `Google Maps: ${event.title}`, url: festivalMapsURL(event), kind: "event-map" },
    ...event.sources.map((source, index) => ({ id: `festivalsource-${event.id}-${index}`, label: source.label, url: source.url, kind: "official" })),
  ]),
  ...fireworksContext.map((event, index) => ({ id: `fireworks-${index}`, label: event.title, url: event.url, kind: "official" })),
  ...Object.entries(photosByPlace).flatMap(([id, photo]) => [
    { id: `photo-${id}`, label: photo.file, url: photo.sourceUrl, kind: "photo" },
    { id: `license-${id}`, label: photo.license, url: photo.licenseUrl, kind: "license" },
  ]),
  ...trip.flights.flatMap((flight, i) => flight.links.filter((link) => !link.url.startsWith("https://www.lastminute.de/")).map((link, j) => ({
    id: `flight-${i}-${j}`, label: link.label, url: link.url, kind: "booking",
  }))),
  ...trip.accommodations.flatMap((city) => city.options.flatMap((stay) => stay.links.map((link, i) => ({
    id: `${stay.id}-link-${i}`, label: `${stay.name}: ${link.label}`, url: link.url, kind: "booking",
  })))),
  { id: "osm-copyright", label: "OpenStreetMap: Copyright & Lizenz", url: "https://www.openstreetmap.org/copyright", kind: "attribution" },
];
const byURL = new Map();
for (const item of manifest) if (!byURL.has(item.url)) byURL.set(item.url, item);
const unique = [...byURL.values()];
writeFileSync(output, JSON.stringify(unique, null, 2) + "\n");
console.log(`${unique.length} unique published external URLs, including ${unique.filter((item) => item.kind === "map").length} coordinate-based Google Maps links.`);
