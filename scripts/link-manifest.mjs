import { writeFileSync } from "node:fs";
import { resources, places } from "../site/guide-data.js";
import { trip } from "../site/trip-data.js";
import { googleMapsURL } from "../site/lib.js";
import { foodMapsURL, foodStops } from "../site/extras.js";

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
  ...trip.flights.flatMap((flight, i) => flight.links.filter((link) => !link.url.startsWith("https://www.lastminute.de/")).map((link, j) => ({
    id: `flight-${i}-${j}`, label: link.label, url: link.url, kind: "booking",
  }))),
  ...trip.accommodations.flatMap((city) => city.options.flatMap((stay) => stay.links.map((link, i) => ({
    id: `${stay.id}-link-${i}`, label: `${stay.name}: ${link.label}`, url: link.url, kind: "booking",
  })))),
  { id: "osm-copyright", label: "OpenStreetMap: Copyright & Lizenz", url: "https://www.openstreetmap.org/copyright", kind: "attribution" },
];
const unique = [...new Map(manifest.map((item) => [item.url, item])).values()];
writeFileSync(output, JSON.stringify(unique, null, 2) + "\n");
console.log(`${unique.length} unique published external URLs, including ${unique.filter((item) => item.kind === "map").length} coordinate-based Google Maps links.`);
