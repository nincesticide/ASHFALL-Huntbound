import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { createGameRuntimeHarness } from "./helpers/game-runtime-harness.mjs";

function sorted(value) {
  if (Array.isArray(value)) return value.map(sorted);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sorted(value[key])]));
}

function materialProjection(run) {
  return sorted({
    runId: run.runId,
    runSchemaVersion: run.runSchemaVersion,
    rulesVersion: run.rulesVersion,
    missionId: run.missionId,
    difficulty: run.difficulty,
    modifier: run.modifier,
    depth: run.depth,
    round: run.round,
    phase: run.phase,
    map: run.map,
    deepHunt: run.deepHunt,
    stageEvent: run.stageEvent,
    mapProps: run.mapProps,
    lootables: run.lootables,
    enemies: run.enemies.map((enemy) => ({
      id: enemy.id,
      kind: enemy.kind,
      name: enemy.name,
      x: enemy.x,
      y: enemy.y,
      elite: enemy.elite,
      trait: enemy.trait,
      boss: enemy.boss,
      maxHp: enemy.maxHp,
      hp: enemy.hp,
      atk: enemy.atk,
      def: enemy.def,
      xp: enemy.xp,
      parts: enemy.parts,
      status: enemy.status,
    })),
    players: Object.fromEntries(Object.entries(run.players).map(([peerId, player]) => [peerId, {
      classId: player.classId,
      level: player.level,
      x: player.x,
      y: player.y,
      maxHp: player.maxHp,
      hp: player.hp,
      atk: player.atk,
      def: player.def,
      res: player.res,
      maxRes: player.maxRes,
      potions: player.potions,
    }])),
    determinismV147: run.determinismV147,
  });
}

function checksum(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function launchFixture({ ambientSeed, runSeed, burn = 0 }) {
  const harness = await createGameRuntimeHarness({ peerId: "replay-host", seed: ambientSeed });
  harness.createSoloHunter("Replay Warden", "warden");
  harness.selectExpedition("frontier", null);
  harness.toggleReady();
  if (burn) harness.burnPresentationEntropy(burn);
  harness.configureNextRun(runSeed, "replay-run-v147");
  harness.launchExpedition();
  return { harness, projection: materialProjection(harness.readState().room.run) };
}

test("a fixed run seed produces the same material expedition despite ambient presentation entropy", async () => {
  const first = await launchFixture({ ambientSeed: 0x11111111, runSeed: 0x1470aa55, burn: 0 });
  const second = await launchFixture({ ambientSeed: 0x99999999, runSeed: 0x1470aa55, burn: 20_000 });
  assert.equal(checksum(first.projection), checksum(second.projection));
  assert.deepEqual(first.projection, second.projection);
  assert.equal(first.projection.runSchemaVersion, 2);
  assert.equal(first.projection.rulesVersion, "0.14.0-r1");
  assert.equal(first.projection.determinismV147.seed, 0x1470aa55);
  assert.ok(first.projection.determinismV147.rngDraws > 0);
});

test("different run seeds produce a different material expedition", async () => {
  const first = await launchFixture({ ambientSeed: 1, runSeed: 0x10000001 });
  const second = await launchFixture({ ambientSeed: 1, runSeed: 0x20000002 });
  assert.notEqual(checksum(first.projection), checksum(second.projection));
});

test("accepted host actions append a character-bound monotonic command record", async () => {
  const { harness } = await launchFixture({ ambientSeed: 7, runSeed: 0x14701234 });
  const before = harness.readState().room.run.determinismV147;
  assert.equal(before.commands.length, 0);
  harness.submitAction({ type: "guard" });
  const after = harness.readState().room.run.determinismV147;
  assert.equal(after.commands.length, 1);
  assert.equal(after.commands[0].sequence, 1);
  assert.equal(after.commands[0].kind, "action");
  assert.equal(after.commands[0].payload.type, "guard");
  assert.match(after.commands[0].characterId, /^hunter_[a-f0-9]{32}$/);
  assert.equal(after.nextCommandSequence, 2);
});
