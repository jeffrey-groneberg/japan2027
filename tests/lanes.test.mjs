import assert from "node:assert/strict";
import test from "node:test";
import { trip } from "../site/trip-data.js";
import { buildDayLanes } from "../site/lane-data.js";

const hotelDays = new Set(["2027-07-21", "2027-07-23", "2027-07-25", "2027-07-27", "2027-07-28", "2027-07-29", "2027-07-30"]);

function activityLocations(lane) {
  return lane.blocks.filter(({ kind }) => kind === "activity").map(({ locationId, title }) => locationId ?? title);
}

test("every lane is chronological, complete and free of unverified travel gaps", () => {
  for (const day of trip.days) {
    const schedule = buildDayLanes(day.date);
    assert.ok(schedule.lanes.length >= 1, day.date);
    assert.ok(schedule.end > schedule.start, day.date);
    assert.equal(schedule.hasMissingJourneys, false, day.date);
    const signatures = new Set();
    for (const lane of schedule.lanes) {
      assert.ok(lane.difference, `${day.date}: ${lane.title}`);
      const keys = new Set();
      const activityNumbers = new Set();
      let previousEnd = -Infinity;
      for (const block of lane.blocks) {
        assert.ok(block.start >= schedule.start, `${day.date}: ${block.title}`);
        assert.ok(block.end <= schedule.end, `${day.date}: ${block.title}`);
        assert.ok(block.duration > 0, `${day.date}: ${block.title}`);
        assert.ok(block.start >= previousEnd, `${day.date}: ${lane.title} overlaps at ${block.title}`);
        previousEnd = block.end;
        assert.ok(!keys.has(block.key), `${day.date}: duplicate key ${block.key}`);
        keys.add(block.key);
        if (block.kind === "activity") {
          assert.match(block.number, /^[A-Z]\d+$/);
          assert.ok(!activityNumbers.has(block.number), `${day.date}: duplicate number ${block.number}`);
          activityNumbers.add(block.number);
        } else {
          assert.equal(block.number, null);
        }
        if (block.kind === "travel") {
          assert.ok(block.journey.steps.length, `${day.date}: ${block.title}`);
          assert.ok(block.journey.verify.length > 20, `${day.date}: ${block.title}`);
          assert.equal(block.journey.missing, undefined, `${day.date}: ${block.title}`);
        }
      }
      const signature = activityLocations(lane).join("|");
      assert.ok(!signatures.has(signature), `${day.date}: duplicate visible route ${lane.title}`);
      signatures.add(signature);
    }
  }
});

test("visually duplicate options become flex notes instead of duplicate lanes", () => {
  assert.equal(buildDayLanes("2027-07-09").lanes.length, 1, "DisneySea pacing is not another route.");
  assert.equal(buildDayLanes("2027-07-19").lanes.length, 1, "The harbor pause is already part of the aquarium route.");
  const aquarium = buildDayLanes("2027-07-19").lanes[0].blocks.find(({ placeId }) => placeId === "aquarium");
  assert.equal(aquarium.flexNotes[0].title, "Hafenpause statt weiterer Attraktion");
  const shibuya = buildDayLanes("2027-07-05");
  assert.equal(shibuya.lanes.length, 3);
  assert.match(shibuya.lanes[1].difference, /Dazu: Akihabara/);
  assert.match(shibuya.lanes[1].difference, /Entfällt: Shibuya Scramble Crossing, Shibuya Sky/);
});

test("travel blocks describe the actual previous location and named transport", () => {
  const shibuya = buildDayLanes("2027-07-05").lanes[0];
  const firstTrip = shibuya.blocks.find(({ kind }) => kind === "travel");
  assert.match(firstTrip.title, /Unterkunft in Komagome → Takeshita Street/);
  assert.match(firstTrip.journey.steps.join(" "), /JR.*Yamanote Line.*Harajuku/);
  const pokemon = shibuya.blocks.find(({ placeId }) => placeId === "pokemon");
  assert.match(pokemon.arrivalJourney.steps.join(" "), /Im Gebäude.*6\. Geschoss/);

  const sumo = buildDayLanes("2027-07-18").lanes.find(({ title }) => /Sumo-Show/.test(title));
  const sumoTrip = sumo.blocks.find(({ title }) => /Den Den Town.*HIRAKUZA/.test(title));
  assert.match(sumoTrip.journey.steps.join(" "), /Namba Parks/);
  assert.match(sumoTrip.journey.steps.join(" "), /8\. Stock/);

  const kibune = buildDayLanes("2027-07-14").lanes.find(({ title }) => /Kibune ohne/.test(title));
  const busTrip = kibune.blocks.find(({ kind, locationId }) => kind === "travel" && locationId === "kifune");
  assert.match(busTrip.journey.steps.join(" "), /Kyoto Bus 33/);
});

test("full-day replacement routes never retain the replaced excursion", () => {
  const takaoDay = buildDayLanes("2027-07-08");
  const ghibli = takaoDay.lanes.find(({ title }) => /Ghibli/.test(title));
  assert.deepEqual(activityLocations(ghibli), ["ghibli"]);
  const miraikan = takaoDay.lanes.find(({ title }) => /Wissenschaft/.test(title));
  assert.deepEqual(activityLocations(miraikan), ["miraikan"]);

  const naraDay = buildDayLanes("2027-07-13");
  const ninja = naraDay.lanes.find(({ title }) => /UZUMASA/.test(title));
  assert.deepEqual(activityLocations(ninja), ["uzumasa"]);
  assert.equal(ninja.blocks.some(({ locationId }) => ["nara", "todaiji"].includes(locationId)), false);
});

test("Vietnam keeps only three excursion days and collapses the rest to hotel time", () => {
  const excursions = new Map([
    ["2027-07-22", "hoian"],
    ["2027-07-24", "marble"],
    ["2027-07-26", "goldenBridge"],
  ]);
  for (const day of trip.days.filter(({ destination }) => destination === "vietnam")) {
    const schedule = buildDayLanes(day.date);
    if (hotelDays.has(day.date)) {
      assert.equal(schedule.lanes.length, 1, day.date);
      assert.deepEqual(activityLocations(schedule.lanes[0]), ["robinson"], day.date);
      assert.equal(schedule.lanes[0].blocks.some(({ kind }) => kind === "travel"), false, day.date);
    }
    if (excursions.has(day.date)) {
      assert.ok(activityLocations(schedule.lanes[0]).includes(excursions.get(day.date)), day.date);
      assert.ok(schedule.lanes[0].blocks.some(({ kind }) => kind === "travel"), day.date);
    }
  }
});

test("all copies of a place focus the canonical shared map marker", () => {
  for (const date of ["2027-07-05", "2027-07-07", "2027-07-12", "2027-07-18"]) {
    const schedule = buildDayLanes(date);
    const keysByPlace = new Map();
    for (const block of schedule.lanes.flatMap(({ blocks }) => blocks).filter(({ placeId }) => placeId)) {
      if (!keysByPlace.has(block.placeId)) keysByPlace.set(block.placeId, block.mapKey);
      assert.equal(block.mapKey, keysByPlace.get(block.placeId), `${date}: ${block.placeId}`);
    }
  }
});
