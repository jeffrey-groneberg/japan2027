import { dayGuides, places } from "./guide-data.js";
import { alternatives } from "./extras.js";
import {
  journeyProfiles,
  locationLabels,
  optionLocations,
  travelConnection,
} from "./travel-data.js";

const START_OF_DAY = 8 * 60;
const MIN_VISIBLE_SPAN = 4 * 60;
const BUFFER_THRESHOLD = 30;
const RETURN_BREAK_THRESHOLD = 180;

function number(value) {
  return Number(String(value).replace(",", "."));
}

function durationFrom(text = "", fallback = 75) {
  const hoursRange = text.match(/(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)\s*(?:Std|Stunden)/i);
  if (hoursRange) return Math.round((number(hoursRange[1]) + number(hoursRange[2])) * 30);
  const minuteRange = text.match(/(\d+)\s*[–-]\s*(\d+)\s*Min/i);
  if (minuteRange) return Math.round((number(minuteRange[1]) + number(minuteRange[2])) / 2);
  const hours = text.match(/(?:etwa\s*)?(\d+(?:[.,]\d+)?)\s*(?:Std|Stunden)/i);
  if (hours) return Math.round(number(hours[1]) * 60);
  const minutes = text.match(/(?:etwa\s*)?(\d+)\s*Min/i);
  if (minutes) return number(minutes[1]);
  if (/ganzer tag/i.test(text)) return 480;
  if (/halber bis ganzer tag/i.test(text)) return 360;
  if (/halber tag/i.test(text)) return 270;
  if (/kurz|kleine runde/i.test(text)) return 45;
  return fallback;
}

function timeFrom(text = "", fallback = START_OF_DAY) {
  const exact = text.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  if (exact) return number(exact[1]) * 60 + number(exact[2]);
  if (/nach der landung|ankunft/i.test(text)) return 15 * 60;
  if (/später nachmittag/i.test(text)) return 17 * 60;
  if (/früher abend/i.test(text)) return 18 * 60;
  if (/nachmittag/i.test(text)) return 15 * 60;
  if (/mittag/i.test(text)) return 12 * 60 + 30;
  if (/abend|spät/i.test(text)) return 18 * 60 + 30;
  if (/nacht/i.test(text)) return 20 * 60;
  if (/früh morgens|vor dem losfahren|vor der landung/i.test(text)) return 8 * 60 + 30;
  if (/\bfrüh\b|vormitt|morgen/i.test(text)) return 10 * 60;
  return fallback;
}

function parseClock(value) {
  if (typeof value === "number") return value;
  const match = String(value ?? "").match(/^(\d{1,2}):(\d{2})$/);
  return match ? number(match[1]) * 60 + number(match[2]) : null;
}

function titleFor(step, placeId) {
  return placeId ? places[placeId].name : step.title;
}

function isBufferStep(step) {
  return /(?:mittag|essen|pause|freie zeit|faulenzen|hotel, pool|hafenpause)/i.test(`${step.title} ${step.text}`);
}

function primaryBlocks(date) {
  const guide = dayGuides[date];
  const profile = journeyProfiles[date] ?? {};
  let cursor = START_OF_DAY;
  const blocks = [];
  for (const [stepIndex, step] of guide.steps.entries()) {
    const explicitStart = parseClock(profile.stepStarts?.[stepIndex]);
    const hinted = explicitStart ?? timeFrom(step.time, START_OF_DAY + stepIndex * 150);
    cursor = Math.max(cursor, hinted);
    if (step.places?.length) {
      for (const [placeIndex, placeId] of step.places.entries()) {
        const place = places[placeId];
        const duration = Math.max(60, profile.placeDurations?.[placeId] ?? durationFrom(place.suggestedTime, 75));
        blocks.push({
          kind: "activity",
          source: "primary",
          step,
          stepIndex,
          placeIndex,
          placeId,
          locationId: placeId,
          title: titleFor(step, placeId),
          text: placeIndex === 0 ? step.text : "",
          start: cursor,
          duration,
        });
        cursor += duration;
      }
    } else {
      const duration = Math.max(60, durationFrom(step.time, 75));
      const locationId = profile.stepLocations?.[stepIndex] ?? null;
      const kind = profile.travelOnlySteps?.includes(stepIndex) ? "travel-target" : isBufferStep(step) ? "buffer" : "activity";
      blocks.push({
        kind,
        source: kind === "buffer" ? "buffer" : "primary",
        step,
        stepIndex,
        placeIndex: null,
        placeId: null,
        locationId,
        title: step.title,
        text: step.text,
        start: cursor,
        duration,
      });
      cursor += duration;
    }
  }
  return blocks;
}

function alternativeStart(option, primary) {
  const explicit = parseClock(option.laneStart);
  if (explicit !== null) return explicit;
  const matching = primary.filter((block) => block.placeId && option.places.includes(block.placeId));
  if (matching.length) return Math.min(...matching.map(({ start }) => start));
  return timeFrom(`${option.when} ${option.title}`, primary[Math.floor(primary.length / 2)]?.start ?? 11 * 60);
}

function alternativeBlocks(option, start) {
  const blocks = [];
  if (option.places.length) {
    let cursor = start;
    const totalOverride = Number.isFinite(option.laneDuration) ? option.laneDuration : null;
    for (const [index, placeId] of option.places.entries()) {
      const remaining = option.places.length - index;
      const duration = totalOverride
        ? Math.max(60, Math.round((totalOverride - (cursor - start)) / remaining))
        : Math.max(60, durationFrom(places[placeId].suggestedTime, 90));
      blocks.push({
        kind: "activity",
        source: "alternative",
        option,
        placeId,
        locationId: placeId,
        title: places[placeId].name,
        text: index === 0 ? option.text : "",
        start: cursor,
        duration,
      });
      cursor += duration;
    }
  } else {
    blocks.push({
      kind: "activity",
      source: "alternative",
      option,
      placeId: null,
      locationId: optionLocations[option.title] ?? null,
      title: option.title,
      text: option.text,
      start,
      duration: Math.max(60, option.laneDuration ?? durationFrom(option.when, 90)),
    });
  }
  return blocks;
}

function completeVariant(option, primary) {
  const start = alternativeStart(option, primary);
  const alternative = alternativeBlocks(option, start);
  if (option.laneScope === "full-day") return alternative;
  const optionEnd = Math.max(...alternative.map((block) => block.start + block.duration));
  const blocks = primary
    .filter((block) => block.start + block.duration <= start || block.start >= optionEnd)
    .map((block) => ({ ...block, source: "shared" }));
  blocks.push(...alternative);
  blocks.sort((a, b) => a.start - b.start);
  let cursor = Math.min(...blocks.map(({ start: blockStart }) => blockStart));
  for (const block of blocks) {
    block.start = Math.max(block.start, cursor);
    cursor = block.start + block.duration;
  }
  return blocks;
}

function activitySignature(blocks) {
  return blocks
    .filter(({ kind }) => kind === "activity")
    .map(({ placeId, locationId, title }) => placeId ?? locationId ?? title)
    .join("|");
}

function attachFlexNotes(blocks, notes) {
  for (const option of notes) {
    const target = [...blocks].reverse().find(({ placeId }) => placeId && option.places.includes(placeId)) ?? blocks[0];
    if (!target) continue;
    target.flexNotes = [...(target.flexNotes ?? []), option];
  }
}

function locationName(id) {
  return places[id]?.name ?? locationLabels[id] ?? id;
}

function createTravelBlock(connection, start, extraText = "") {
  return {
    kind: "travel",
    source: "travel",
    placeId: null,
    locationId: connection.to,
    title: `${locationName(connection.from)} → ${locationName(connection.to)}`,
    text: extraText || connection.summary,
    start,
    duration: connection.duration,
    journey: connection,
  };
}

function bufferCopy(start, duration, locationId, position = "middle") {
  const midpoint = start + duration / 2;
  let title = "Zeitpuffer & Pause";
  let text = `Kein fester Programmpunkt. Bei ${locationName(locationId)} trinken, ausruhen und ohne Zeitdruck weitergehen.`;
  if (position === "before") {
    if (start + duration >= 15 * 60) {
      title = "Freier Tag bis zum Start";
      text = "Bis zu diesem Programmpunkt bleibt der Tag bewusst frei. Im Hotel oder in der Unterkunft bleiben und erst rechtzeitig zur Anreise aufbrechen.";
    } else if (start + duration >= 12 * 60) {
      title = "Freier Vormittag / späterer Start";
      text = "Der Vormittag bleibt bewusst frei. Frühstücken, ausruhen und erst rechtzeitig zur Anreise aufbrechen.";
    } else {
      title = "Späterer Start / Frühstück";
      text = "Die Route beginnt bewusst später. Frühstücken, Taschen prüfen und erst dann ohne Hektik losgehen.";
    }
  } else if (position === "after") {
    title = "Freie Zeit / früher zurück";
    text = "Die Route ist hier beendet. Der restliche Zeitraum bleibt bewusst frei oder dient der Rückkehr und Erholung in der Unterkunft.";
  } else if (midpoint >= 11 * 60 && midpoint <= 14 * 60 + 30) {
    title = "Mittagessen & Pause";
    text = `Zeit für eine richtige Mahlzeit, Getränke und eine Sitzpause bei ${locationName(locationId)}. Kein zusätzlicher Pflichtstopp.`;
  } else if (duration >= 120) {
    title = "Freie Zeit / Erholung";
    text = `Dieser Zeitraum bleibt bewusst frei. Bei ${locationName(locationId)} ausruhen oder in die Unterkunft zurückkehren; nichts Zusätzliches muss hineinpassen.`;
  }
  return {
    kind: "buffer",
    source: "buffer",
    placeId: null,
    locationId,
    title,
    text,
    start,
    duration,
  };
}

function insertBuffer(blocks, start, end, locationId, position = "middle") {
  const duration = end - start;
  if (duration >= BUFFER_THRESHOLD) blocks.push(bufferCopy(start, duration, locationId, position));
  return duration >= BUFFER_THRESHOLD ? end : start;
}

function connectionOrMissing(date, from, to) {
  return travelConnection(date, from, to) ?? {
    from,
    to,
    mode: "check",
    duration: 45,
    summary: "Für diesen Ortswechsel fehlt noch eine abschließend verifizierte Verbindung.",
    steps: ["Verbindung vor Veröffentlichung gegen eine offizielle Betreiber- oder Zielseite prüfen."],
    verify: "Noch nicht freigeben.",
    missing: true,
  };
}

function addJourneys(date, lane) {
  const profile = journeyProfiles[date] ?? {};
  let currentLocation = profile.origin ?? lane.blocks.find(({ locationId }) => locationId)?.locationId ?? null;
  let cursor = null;
  const output = [];
  for (const original of lane.blocks) {
    const block = { ...original };
    const target = block.locationId ?? currentLocation;
    const plannedStart = block.start;
    if (
      cursor !== null
      && target
      && currentLocation
      && target !== currentLocation
      && (profile.returnBefore?.includes(target) || plannedStart - cursor >= RETURN_BREAK_THRESHOLD)
      && currentLocation !== profile.origin
      && profile.origin
      && travelConnection(date, currentLocation, profile.origin)
      && travelConnection(date, profile.origin, target)
    ) {
      const back = connectionOrMissing(date, currentLocation, profile.origin);
      output.push(createTravelBlock(back, cursor));
      cursor += back.duration;
      currentLocation = profile.origin;
    }
    if (target && currentLocation && target !== currentLocation) {
      const connection = connectionOrMissing(date, currentLocation, target);
      const desiredStart = plannedStart - connection.duration;
      if (cursor === null) {
        cursor = desiredStart;
      } else if (desiredStart > cursor) {
        insertBuffer(output, cursor, desiredStart, currentLocation);
        cursor = desiredStart;
      }
      const inlineWalk = connection.mode === "walk" && connection.duration < 20 && block.kind !== "travel-target";
      if (inlineWalk) {
        block.arrivalJourney = connection;
        cursor += connection.duration;
      } else {
        const travel = createTravelBlock(connection, cursor, block.kind === "travel-target" ? block.text : "");
        output.push(travel);
        cursor += connection.duration;
      }
      currentLocation = target;
      if (block.kind === "travel-target") continue;
    } else if (target && !currentLocation) {
      currentLocation = target;
    }
    if (cursor === null) cursor = plannedStart;
    if (plannedStart > cursor) {
      const bufferedTo = insertBuffer(output, cursor, plannedStart, currentLocation);
      if (bufferedTo === cursor) block.start = cursor;
      cursor = bufferedTo;
    }
    block.start = Math.max(block.start, cursor);
    block.locationId = block.locationId ?? currentLocation;
    output.push(block);
    cursor = block.start + block.duration;
    if (target) currentLocation = target;
  }
  if (profile.returnTo && currentLocation && currentLocation !== profile.returnTo) {
    const connection = connectionOrMissing(date, currentLocation, profile.returnTo);
    output.push(createTravelBlock(connection, cursor ?? START_OF_DAY));
    cursor = (cursor ?? START_OF_DAY) + connection.duration;
  }
  const sorted = output.sort((a, b) => a.start - b.start);
  const merged = [];
  for (const block of sorted) {
    const previous = merged.at(-1);
    const previousEnd = previous ? previous.start + previous.duration : null;
    if (previous?.kind === "buffer" && block.kind === "buffer" && previous.locationId === block.locationId && block.start <= previousEnd) {
      previous.duration = Math.max(previousEnd, block.start + block.duration) - previous.start;
      previous.title = block.title === previous.title ? previous.title : "Mahlzeit, Pause & Zeitpuffer";
      previous.text = `${previous.text} ${block.text}`.trim();
    } else {
      merged.push(block);
    }
  }
  lane.blocks = merged;
  return lane;
}

function routeDifference(primary, lane) {
  if (lane.isPrimary) return "Vollständiger Tagesplan";
  const primaryLocations = primary.blocks.filter(({ kind, locationId }) => kind === "activity" && locationId).map(({ locationId }) => locationId);
  const laneLocations = lane.blocks.filter(({ kind, locationId }) => kind === "activity" && locationId).map(({ locationId }) => locationId);
  const added = [...new Set(laneLocations.filter((id) => !primaryLocations.includes(id)))].map(locationName);
  const removed = [...new Set(primaryLocations.filter((id) => !laneLocations.includes(id)))].map(locationName);
  const changes = [];
  if (added.length) changes.push(`Dazu: ${added.join(", ")}`);
  if (removed.length) changes.push(`Entfällt: ${removed.join(", ")}`);
  if (!changes.length) changes.push("Anderer Zeitumfang und Tagesrhythmus");
  return changes.join(" · ");
}

function decorateLane(lane, index) {
  const letter = String.fromCharCode(65 + index);
  lane.letter = letter;
  lane.label = `Route ${letter}`;
  lane.blocks.sort((a, b) => a.start - b.start);
  let activityIndex = 0;
  lane.blocks.forEach((block, blockIndex) => {
    if (block.kind === "activity") {
      activityIndex += 1;
      block.number = `${letter}${activityIndex}`;
    } else {
      block.number = null;
    }
    block.end = block.start + block.duration;
    block.key = `${lane.id}-${blockIndex}-${block.placeId ?? block.locationId ?? block.kind}`;
    block.laneId = lane.id;
    block.laneLabel = lane.label;
    block.laneTitle = lane.title;
  });
  return lane;
}

function fillLaneEdges(lane, start, end) {
  const first = lane.blocks[0];
  const last = lane.blocks.at(-1);
  if (first && first.start - start >= BUFFER_THRESHOLD) lane.blocks.unshift(bufferCopy(start, first.start - start, journeyProfiles[lane.date]?.origin ?? first.locationId, "before"));
  const lastEnd = last ? last.start + last.duration : end;
  if (last && end - lastEnd >= BUFFER_THRESHOLD) lane.blocks.push(bufferCopy(lastEnd, end - lastEnd, journeyProfiles[lane.date]?.returnTo ?? last.locationId, "after"));
  return lane;
}

export function formatLaneTime(minutes) {
  const value = Math.max(0, Math.round(minutes));
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export function buildDayLanes(date) {
  const primary = primaryBlocks(date);
  const options = alternatives[date] ?? [];
  const flexNotes = options.filter(({ laneMode }) => laneMode === "note");
  const candidateRoutes = [];
  for (const [index, option] of options.filter(({ laneMode }) => laneMode !== "note").entries()) {
    const blocks = completeVariant(option, primary);
    if (activitySignature(blocks) === activitySignature(primary)) {
      flexNotes.push(option);
      continue;
    }
    candidateRoutes.push({
      id: `route-option-${index + 1}`,
      title: option.title,
      option,
      isPrimary: false,
      date,
      blocks,
    });
  }
  attachFlexNotes(primary, flexNotes);
  const lanes = [
    { id: "route-primary", title: "Empfohlene Route", isPrimary: true, date, blocks: primary },
    ...candidateRoutes,
  ].map((lane) => addJourneys(date, lane));
  for (const lane of lanes) lane.difference = routeDifference(lanes[0], lane);
  let starts = lanes.flatMap((lane) => lane.blocks.map(({ start }) => start));
  let ends = lanes.flatMap((lane) => lane.blocks.map(({ start, duration }) => start + duration));
  let start = Math.floor(Math.min(...starts) / 60) * 60;
  let end = Math.ceil(Math.max(...ends) / 60) * 60;
  if (end - start < MIN_VISIBLE_SPAN) end = start + MIN_VISIBLE_SPAN;
  for (const lane of lanes) fillLaneEdges(lane, start, end);
  const decorated = lanes.map(decorateLane);
  starts = decorated.flatMap((lane) => lane.blocks.map(({ start: blockStart }) => blockStart));
  ends = decorated.flatMap((lane) => lane.blocks.map(({ end: blockEnd }) => blockEnd));
  start = Math.floor(Math.min(...starts) / 60) * 60;
  end = Math.ceil(Math.max(...ends) / 60) * 60;
  const mapBlocks = [
    ...decorated[0].blocks.filter(({ kind, placeId }) => kind === "activity" && placeId),
    ...decorated.slice(1).flatMap((lane) => lane.blocks.filter(({ kind, placeId, source }) => kind === "activity" && placeId && source === "alternative")),
  ];
  const uniqueMapBlocks = [...new Map(mapBlocks.map((block) => [block.placeId, block])).values()];
  const mapKeyByPlace = new Map(uniqueMapBlocks.map((block) => [block.placeId, block.key]));
  for (const block of decorated.flatMap(({ blocks }) => blocks)) {
    if (block.placeId) block.mapKey = mapKeyByPlace.get(block.placeId);
  }
  return {
    start,
    end,
    lanes: decorated,
    mapBlocks: uniqueMapBlocks,
    hasMissingJourneys: decorated.some((lane) => lane.blocks.some(({ journey }) => journey?.missing)),
  };
}
