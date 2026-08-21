import assert from "node:assert/strict";
import test from "node:test";

import {
  createGameRuntimeHarness,
  createMemoryStorage,
} from "./helpers/game-runtime-harness.mjs";

const BONFIRE_SPAWNS = new Set(["14,12", "16,12", "14,11", "16,11"]);
const PROFILE_KEY = "ashfall_mp_alpha_profiles_v1";

async function soloAtEmberwatch() {
  const game = await createGameRuntimeHarness();
  const peerId = game.createSoloHunter();
  return { game, peerId };
}

function enterEmberwood(game) {
  // North Gate is at 15,2. The production interaction contract requires
  // Manhattan distance <= 1 rather than standing on the service tile.
  game.placeCampPlayer(15, 3);
  game.enterWorld();
}

test("North Gate enters Emberwood and places the solo party at the intended approach", async () => {
  const { game, peerId } = await soloAtEmberwatch();

  enterEmberwood(game);
  const state = game.readState();
  const player = state.room.players[peerId];

  assert.equal(state.room.run, null);
  assert.equal(state.room.worldV14.active, true);
  assert.equal(state.room.worldV14.region, "emberwood");
  assert.equal(player.worldX, 5);
  assert.equal(player.worldY, 9);
  assert.equal(player.facing, "east");
  assert.equal(state.profile.worldV14.enteredLowlands, true);
});

test("the exact animal encounter starts combat in place instead of teleporting the hunter", async () => {
  const { game, peerId } = await soloAtEmberwatch();
  enterEmberwood(game);

  // Road Wolf Pack is at 8,5; this is its adjacent, walkable interaction tile.
  game.placeWorldPlayer(7, 5);
  game.interactWorld("wolfpack1");
  const state = game.readState();
  const combatPlayer = state.room.run.players[peerId];

  assert.equal(state.room.run.isWorldSkirmish, true);
  assert.equal(state.room.run.worldEncounter.id, "wolfpack1");
  assert.equal(state.room.run.worldEncounter.name, "Road Wolf Pack");
  assert.equal(state.room.run.zoneStageName, "Road Wolf Pack");
  assert.equal(combatPlayer.x, 7);
  assert.equal(combatPlayer.y, 5);
  assert.equal(state.room.run.map[5][7], state.room.worldV14.map[5][7]);
  assert.ok(state.room.run.enemies.length >= 1);
  assert.ok(state.room.run.enemies.every((enemy) => enemy.kind === "wolf"));
});

test("a surface resource grants its reward once and cannot be collected twice", async () => {
  const { game } = await soloAtEmberwatch();
  enterEmberwood(game);

  // Emberleaf Patch is at 6,13.
  game.placeWorldPlayer(5, 13);
  game.interactWorld("herb1");
  const afterFirstCollection = game.readState();

  assert.equal(
    afterFirstCollection.room.worldV14.resources.find((resource) => resource.id === "herb1").done,
    true,
  );
  assert.equal(afterFirstCollection.profile.gold, 70);
  assert.equal(afterFirstCollection.profile.materials.common, 2);
  assert.equal(afterFirstCollection.profile.materials.rare, 0);
  assert.equal(afterFirstCollection.profile.worldV14.contracts.resources, 1);

  game.interactWorld("herb1");
  const afterSecondCollection = game.readState();

  assert.equal(afterSecondCollection.profile.gold, 70);
  assert.equal(afterSecondCollection.profile.materials.common, 2);
  assert.equal(afterSecondCollection.profile.materials.rare, 0);
  assert.equal(afterSecondCollection.profile.worldV14.contracts.resources, 1);
});

test("a rejected resource save leaves the node gatherable and grants once after recovery", async () => {
  const localStorage = createMemoryStorage();
  const game = await createGameRuntimeHarness({ localStorage, peerId: "resource-retry" });
  game.createSoloHunter("Resource Keeper", "arcanist");
  enterEmberwood(game);
  game.placeWorldPlayer(5, 13);

  localStorage.failWritesFor(PROFILE_KEY);
  game.interactWorld("herb1");
  const blocked = game.readState();
  assert.equal(blocked.room.worldV14.resources.find((resource) => resource.id === "herb1").done, false);
  assert.equal(blocked.profile.gold, 50);
  assert.equal(blocked.profile.materials.common, 0);
  assert.equal(blocked.profile.worldRewardReceiptsV145.length, 0);

  localStorage.allowWritesFor(PROFILE_KEY);
  game.interactWorld("herb1");
  const recovered = game.readState();
  assert.equal(recovered.room.worldV14.resources.find((resource) => resource.id === "herb1").done, true);
  assert.equal(recovered.profile.gold, 70);
  assert.equal(recovered.profile.materials.common, 2);
  assert.equal(recovered.profile.worldRewardReceiptsV145.length, 1);
});

test("a surface party wipe clears the field and returns the hunter to the bonfire", async () => {
  const { game, peerId } = await soloAtEmberwatch();
  enterEmberwood(game);
  game.placeWorldPlayer(7, 5);
  game.interactWorld("wolfpack1");

  assert.equal(game.forcePartyWipe(), true);
  const state = game.readState();
  const campPlayer = state.room.players[peerId];

  assert.equal(state.room.run, null);
  assert.equal(state.room.worldV14, null);
  assert.equal(state.room.worldSelectionV141, null);
  assert.equal(state.room.delveId, null);
  assert.equal("worldX" in campPlayer, false);
  assert.equal("worldY" in campPlayer, false);
  assert.equal(campPlayer.facing, "north");
  assert.equal(campPlayer.ready, false);
  assert.ok(BONFIRE_SPAWNS.has(`${campPlayer.campX},${campPlayer.campY}`));
  assert.equal(state.lastSummary.success, false);
  assert.equal(state.lastSummary.wiped, true);
});

test("the Emberroot Cellar entrance launches the correct Delve", async () => {
  const { game, peerId } = await soloAtEmberwatch();
  enterEmberwood(game);

  // Emberroot Cellar is at 27,9.
  game.placeWorldPlayer(26, 9);
  game.interactWorld("embercellar");
  const state = game.readState();

  assert.equal(state.room.run.isDelve, true);
  assert.equal(state.room.run.delveId, "embercellar");
  assert.equal(state.room.run.delve.id, "embercellar");
  assert.equal(state.room.run.delve.name, "Emberroot Cellar");
  assert.equal(state.room.run.missionId, "frontier");
  assert.equal(state.room.run.players[peerId].peerId, peerId);
  assert.equal(state.room.worldSelectionV141, null);
  assert.equal(state.room.worldV14.region, "emberwood");
});
