import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

await import("../js/save-system.js");

const saveSystem = globalThis.AshfallSaveSystem;
const testsDirectory = dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = resolve(testsDirectory, "fixtures", "saves");

async function readFixture(name) {
  return JSON.parse(await readFile(join(fixturesDirectory, name), "utf8"));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

test("the rich v0.14 fixture is idempotent and preserves current and future data", async () => {
  const roster = await readFixture("current-v014-rich.json");
  const original = structuredClone(roster);
  deepFreeze(roster);

  const once = saveSystem.normalizeCollectionV014(roster);
  const twice = saveSystem.normalizeCollectionV014(once);
  const profile = once["fixture-current-warden"];

  assert.deepEqual(roster, original, "normalization must not mutate imported input");
  assert.deepEqual(once, original, "a complete current save should not be changed");
  assert.deepEqual(twice, once, "normalization must be idempotent");
  assert.deepEqual(
    saveSystem.EQUIPMENT_SLOTS.map((slot) => profile.equipment[slot].id),
    [
      "gear-head",
      "gear-shoulders",
      "gear-chest",
      "gear-gloves",
      "gear-boots",
      "gear-weapon",
      "gear-offhand",
      "gear-ring-1",
      "gear-ring-2",
      "gear-necklace",
    ],
  );
  assert.equal(profile.inventory[0].identityTier, "Masterworked");
  assert.equal(profile.futureProfile.ritualRank, 7);
  assert.equal(profile.materials.emberglass, 11);
  assert.deepEqual(profile.equipment.futureSlot, { unlocked: true });
  assert.deepEqual(profile.inventory[0].futureSocket, { kind: "void", rank: 2 });
  assert.equal(profile.loadouts["1"].futureRule, "retain-me");
  assert.equal(profile.worldV14.futureWeatherSeed, "storm-77");
  assert.equal(profile.worldV14.contracts.futureBeasts, 4);
  assert.equal(profile.lifetime.futureDeaths, 3);
});

test("all six canonical classes receive only their own mastery and skill defaults", async () => {
  const roster = await readFixture("class-matrix.json");
  const validation = saveSystem.validateProfileCollection(roster);
  assert.equal(validation.ok, true);

  const normalized = saveSystem.normalizeCollectionV014(roster);
  assert.deepEqual(
    Object.values(normalized).map((profile) => profile.classId).sort(),
    ["arcanist", "berserker", "ranger", "shadow", "templar", "warden"],
  );
  for (const profile of Object.values(normalized)) {
    assert.equal(profile.classMastery[profile.classId], 0);
    assert.deepEqual(profile.skillXp[profile.classId], { s1: 0, s2: 0 });
    assert.equal(Object.keys(profile.classMastery).length, 1);
    assert.equal(Object.keys(profile.skillXp).length, 1);
  }
});

test("legacy three-slot saves migrate into the ten-slot armory without duplicate items", async () => {
  const roster = await readFixture("legacy-v013-three-slot.json");
  const original = structuredClone(roster);
  const normalized = saveSystem.normalizeCollectionV014(roster);
  const profile = normalized["fixture-legacy-ranger"];

  assert.deepEqual(roster, original, "legacy input must remain available for recovery");
  assert.equal(profile.equipment.weapon.id, "legacy-weapon");
  assert.equal(profile.equipment.weapon.equipSlot, "weapon");
  assert.equal(profile.equipment.chest.id, "legacy-armor");
  assert.equal(profile.equipment.chest.type, "chest");
  assert.equal(profile.equipment.chest.equipSlot, "chest");
  assert.equal(profile.equipment.necklace.id, "legacy-charm");
  assert.equal(profile.equipment.necklace.type, "necklace");
  assert.equal(profile.equipment.necklace.equipSlot, "necklace");
  assert.equal(profile.equipment.armor, null);
  assert.equal(profile.equipment.charm, null);
  assert.equal(profile.inventory[0].type, "chest");
  assert.equal(profile.inventory[1].type, "ring");
  assert.equal(profile.inventory[1].equipSlot, "ring1");
  assert.equal(profile.loadouts.old.chest, "legacy-armor");
  assert.equal(profile.loadouts.old.necklace, "legacy-charm");
  assert.equal("armor" in profile.loadouts.old, false);
  assert.equal("charm" in profile.loadouts.old, false);

  const physicalIds = [
    ...saveSystem.EQUIPMENT_SLOTS.map((slot) => profile.equipment[slot]?.id),
    ...profile.inventory.map((item) => item.id),
  ].filter(Boolean);
  assert.equal(new Set(physicalIds).size, physicalIds.length);
  assert.deepEqual(saveSystem.normalizeProfileV014(profile), profile);
});

test("conflicting legacy aliases are recovered to inventory instead of discarded", () => {
  const profile = saveSystem.normalizeProfileV014({
    id: "alias-conflict",
    name: "Alias Keeper",
    classId: "templar",
    inventory: [],
    equipment: {
      chest: { id: "canonical-chest", type: "chest", name: "Current Chest" },
      armor: { id: "legacy-armor", type: "armor", name: "Legacy Armor" },
      necklace: { id: "canonical-necklace", type: "necklace", name: "Current Necklace" },
      charm: { id: "legacy-charm", type: "charm", name: "Legacy Charm" },
      futureSlot: { unlocked: true },
    },
  });

  assert.equal(profile.equipment.chest.id, "canonical-chest");
  assert.equal(profile.equipment.necklace.id, "canonical-necklace");
  assert.deepEqual(
    profile.inventory.map((item) => [item.id, item.type, item.equipSlot]),
    [
      ["legacy-armor", "chest", null],
      ["legacy-charm", "necklace", null],
    ],
  );
  assert.deepEqual(profile.equipment.futureSlot, { unlocked: true });
});

test("partial Emberwood progress receives complete nested defaults", () => {
  const profile = saveSystem.normalizeProfileV014({
    id: "partial-world",
    name: "Wayfinder",
    classId: "shadow",
    worldV14: { enteredLowlands: true, contracts: { wolves: 2 }, futureSeed: 77 },
  });

  assert.deepEqual(profile.worldV14.discoveredRegions, ["emberwood"]);
  assert.deepEqual(profile.worldV14.waypoints, ["emberwatch"]);
  assert.deepEqual(profile.worldV14.contractsClaimed, {});
  assert.deepEqual(profile.worldV14.contracts, { wolves: 2, resources: 0, elites: 0 });
  assert.equal(profile.worldV14.surfaceClears, 0);
  assert.equal(profile.worldV14.futureSeed, 77);
});
