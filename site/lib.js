import { dayGuides, places } from "./guide-data.js";
import { alternatives, foodByPlace, foodStops } from "./extras.js";

export const destinations = [
  { id: "tokyo", name: "Tokyo", japanese: "東京", dates: "4.–11. Juli", nights: 7, country: "Japan", symbol: "city-tokyo" },
  { id: "kyoto", name: "Kyoto", japanese: "京都", dates: "11.–15. Juli", nights: 4, country: "Japan", symbol: "city-kyoto" },
  { id: "osaka", name: "Osaka", japanese: "大阪", dates: "15.–20. Juli", nights: 5, country: "Japan", symbol: "city-osaka" },
  { id: "vietnam", name: "Da Nang & Hoi An", japanese: "ベトナム", dates: "20.–31. Juli", nights: 11, country: "Vietnam", symbol: "city-vietnam" },
];

export const STORAGE_KEY = "japan-vietnam-2027:planner:v1";

const dayMetadata = {
  "2027-07-03": ["transfer", "Frankfurt Airport, Germany"],
  "2027-07-04": ["transfer", "Komagome Station, Tokyo, Japan"],
  "2027-07-05": ["culture", "Senso-ji, Tokyo, Japan"],
  "2027-07-06": ["park", "Tokyo DisneySea, Japan"],
  "2027-07-07": ["city", "Shibuya Parco, Tokyo, Japan"],
  "2027-07-08": ["nature", "Mount Takao, Japan"],
  "2027-07-09": ["culture", "teamLab Planets, Tokyo, Japan"],
  "2027-07-10": ["city", "Akihabara, Tokyo, Japan"],
  "2027-07-11": ["transfer", "Kyoto Station, Japan"],
  "2027-07-12": ["culture", "Nintendo Museum, Uji, Japan"],
  "2027-07-13": ["nature", "Nara Park, Japan"],
  "2027-07-14": ["nature", "Kurama, Kyoto, Japan"],
  "2027-07-15": ["transfer", "Arashiyama, Kyoto, Japan"],
  "2027-07-16": ["park", "Universal Studios Japan, Osaka"],
  "2027-07-17": ["nature", "Minoh Falls, Osaka, Japan"],
  "2027-07-18": ["city", "Den Den Town, Osaka, Japan"],
  "2027-07-19": ["culture", "Osaka Aquarium Kaiyukan, Japan"],
  "2027-07-20": ["transfer", "Da Nang International Airport, Vietnam"],
  "2027-07-21": ["beach", "Nam Hoi An, Vietnam"],
  "2027-07-22": ["culture", "Hoi An Ancient Town, Vietnam"],
  "2027-07-23": ["beach", "Nam Hoi An, Vietnam"],
  "2027-07-24": ["nature", "Marble Mountains, Da Nang, Vietnam"],
  "2027-07-25": ["beach", "Nam Hoi An, Vietnam"],
  "2027-07-26": ["park", "Ba Na Hills, Vietnam"],
  "2027-07-27": ["beach", "Hoi An, Vietnam"],
  "2027-07-28": ["beach", "Hoi An, Vietnam"],
  "2027-07-29": ["beach", "Nam Hoi An, Vietnam"],
  "2027-07-30": ["beach", "Nam Hoi An, Vietnam"],
  "2027-07-31": ["transfer", "Da Nang International Airport, Vietnam"],
  "2027-08-01": ["transfer", "Frankfurt Airport, Germany"],
};

export const categories = {
  transfer: { label: "Unterwegs", icon: "train" },
  culture: { label: "Kultur & Entdecken", icon: "spark" },
  park: { label: "Parks & Gaming", icon: "game" },
  city: { label: "Stadt & Streetfood", icon: "city" },
  nature: { label: "Draußen sein", icon: "mountain" },
  beach: { label: "Strand & Erholung", icon: "sun" },
};

export function metadataFor(day) {
  const [category, mapQuery] = dayMetadata[day.date] ?? ["city", `${day.title}, ${destinationName(day.destination)}`];
  return { category, ...categories[category], mapQuery };
}

export function destinationName(id) {
  return destinations.find((destination) => destination.id === id)?.name ?? "An- & Rückreise";
}

export function dateFromISO(value) {
  return new Date(`${value}T12:00:00Z`);
}

export function formatDate(value, options = { weekday: "long", day: "numeric", month: "long" }) {
  return new Intl.DateTimeFormat("de-DE", { ...options, timeZone: "UTC" }).format(dateFromISO(value));
}

function normalize(value) {
  return value.toLocaleLowerCase("de-DE").normalize("NFD").replace(/\p{Diacritic}/gu, "").replaceAll("ß", "ss");
}

export function filterDays(days, { destination = "all", query = "", savedOnly = false }, favorites = []) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return days.filter((day) => {
    if (destination !== "all" && day.destination !== destination) return false;
    if (savedOnly && !favorites.includes(day.date)) return false;
    const searchable = normalize([
      day.title, day.base, ...day.activities, destinationName(day.destination),
      day.destination === "tokyo" ? "Tokio Japan" : day.destination,
      formatDate(day.date),
      dayGuides[day.date]?.summary ?? "",
      ...(dayGuides[day.date]?.steps ?? []).flatMap((step) => [
        step.title, step.text, ...(step.places ?? []).map((id) => places[id]?.name ?? ""),
      ]),
    ].join(" "));
    return terms.every((term) => searchable.includes(term));
  });
}

export function countdown(start, end, now = new Date()) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const first = Date.parse(`${start}T00:00:00Z`);
  const last = Date.parse(`${end}T00:00:00Z`);
  const days = Math.round((first - today) / 86400000);
  if (days > 0) return `Noch ${days} ${days === 1 ? "Tag" : "Tage"}`;
  if (today <= last) return `Reisetag ${1 - days} von 30`;
  return "Was für eine Reise!";
}

export function defaultState(trip) {
  return {
    version: 2,
    favorites: [],
    completed: [],
    stays: Object.fromEntries(trip.accommodations.map((city) => [city.id, city.options[0].id])),
    theme: null,
  };
}

export function parseState(raw, trip) {
  if (raw === null) return defaultState(trip);
  const state = JSON.parse(raw);
  const validIds = (values, allowed) => Array.isArray(values)
    && values.every((value) => typeof value === "string" && allowed.includes(value))
    && new Set(values).size === values.length;
  if (!state || ![1, 2].includes(state.version)
    || !validIds(state.favorites, trip.days.map((day) => day.date))
    || !validIds(state.completed, trip.checklist.map((task) => task.id))
    || !state.stays || typeof state.stays !== "object"
    || !trip.accommodations.every((city) => city.options.some((option) => option.id === state.stays[city.id]))
    || ![null, "light", "dark"].includes(state.theme)) {
    throw new Error("Saved planner data does not match the current itinerary.");
  }
  return { version: 2, favorites: state.favorites, completed: state.completed, stays: state.stays, theme: state.theme };
}

function escapeCalendar(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
}

// Calendar lines are limited in UTF-8 bytes, not JavaScript string length.
export function foldCalendarLine(value) {
  const encoder = new TextEncoder();
  const lines = [];
  let line = "";
  let size = 0;
  for (const character of value) {
    const bytes = encoder.encode(character).length;
    if (size + bytes > 75) {
      lines.push(line);
      line = " ";
      size = 1;
    }
    line += character;
    size += bytes;
  }
  lines.push(line);
  return lines.join("\r\n");
}

export function buildCalendar(trip, now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Japan Vietnam 2027//Reiseplan//DE",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Japan & Vietnam 2027",
  ];
  for (const day of trip.days) {
    const next = dateFromISO(day.date);
    next.setUTCDate(next.getUTCDate() + 1);
    lines.push(
      "BEGIN:VEVENT",
      `UID:japan-vietnam-2027-${day.date}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day.date.replaceAll("-", "")}`,
      `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replaceAll("-", "")}`,
      `SUMMARY:${escapeCalendar(day.title)}`,
      `LOCATION:${escapeCalendar(destinationName(day.destination))}`,
      `DESCRIPTION:${escapeCalendar([
        dayGuides[day.date]?.summary ?? "",
        ...(dayGuides[day.date]?.steps ?? []).map((step) => `${step.time}: ${step.title}\n${step.text}`),
        ...(dayGuides[day.date]?.correction ? [dayGuides[day.date].correction] : []),
        ...(alternatives[day.date] ?? []).map((option) => `Alternative: ${option.title}\n${option.text}`),
        ...[...new Set(placesForDay(day.date).map((place) => foodByPlace[place.id]))].filter(Boolean).map((id) => {
          const food = foodStops[id];
          return `Kulinarik: ${food.name}\n${food.why}\nFür Kinder: ${food.children}`;
        }),
      ].join("\n"))}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(foldCalendarLine).join("\r\n")}\r\n`;
}

export function googleMapsURL(place) {
  if (!Array.isArray(place.coordinates) || place.coordinates.length !== 2
    || !place.coordinates.every(Number.isFinite)) {
    throw new Error(`No verified coordinates for ${place.name}.`);
  }
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", place.coordinates.join(","));
  return url.href;
}

export function placesForDay(date) {
  const ids = [...new Set((dayGuides[date]?.steps ?? []).flatMap((step) => step.places ?? []))];
  return ids.map((id, index) => ({ id, number: index + 1, ...places[id] }));
}
