import assert from "node:assert/strict";
import test from "node:test";

import {
  createGameRuntimeHarness,
  createMemoryStorage,
} from "./helpers/game-runtime-harness.mjs";

const PROFILE_KEY = "ashfall_mp_alpha_profiles_v1";
const BONFIRE_SPAWNS = new Set(["14,12", "16,12", "14,11", "16,11"]);

function enterEmberwood(game) {
  game.placeCampPlayer(15, 3);
  game.enterWorld();
}

test("Emberroot Cellar clears, settles, returns to the bonfire, and survives reload", async () => {
  const localStorage = createMemoryStorage();
  const game = await createGameRuntimeHarness({ localStorage, peerId: "solo-delve" });
  const peerId = game.createSoloHunter("Cellar Keeper", "warden");
  const hunterId = game.readState().profile.id;

  enterEmberwood(game);
  game.placeWorldPlayer(26, 9);
  game.interactWorld("embercellar");
  game.forceDelveComplete();

  const settled = game.readState();
  assert.equal(settled.room.run, null);
  assert.equal(settled.room.worldV14.region, "emberwood");
  assert.equal(settled.lastSummary.success, true);
  assert.equal(settled.lastSummary.outcome, "clear");
  assert.equal(settled.lastSummary.isDelve, true);
  assert.equal(settled.lastSummary.delveId, "embercellar");
  assert.equal(settled.lastSummary.depth, 3);
  assert.equal(settled.profile.gold, 230);
  assert.equal(settled.profile.materials.common, 9);
  assert.equal(settled.profile.materials.rare, 0);
  assert.equal(settled.profile.lifetime.runs, 1);
  assert.equal(settled.profile.lifetime.success, 1);
  assert.equal(settled.profile.settlementReceiptsV145.length, 1);

  game.returnFromSummary();
  const returned = game.readState();
  const campPlayer = returned.room.players[peerId];
  assert.equal(returned.room.run, null);
  assert.equal(returned.room.worldV14, null);
  assert.equal(returned.room.worldSelectionV141, null);
  assert.equal(returned.room.delveId, null);
  assert.ok(BONFIRE_SPAWNS.has(`${campPlayer.campX},${campPlayer.campY}`));

  const reloaded = await createGameRuntimeHarness({ localStorage, peerId: "solo-delve-reload" });
  reloaded.loadStoredHunter(hunterId);
  const persisted = reloaded.readState().profile;
  assert.equal(persisted.gold, 230);
  assert.equal(persisted.materials.common, 9);
  assert.equal(persisted.lifetime.success, 1);
  assert.deepEqual(persisted.settlementReceiptsV145, settled.profile.settlementReceiptsV145);
});

test("a Deep Hunt boss settlement funds Huntforged crafting and the crafted identity survives reload", async () => {
  const localStorage = createMemoryStorage();
  const game = await createGameRuntimeHarness({ localStorage, peerId: "solo-deep" });
  const peerId = game.createSoloHunter("Forge Path", "ranger");
  const hunterId = game.readState().profile.id;

  game.selectExpedition("frontier", null);
  game.toggleReady();
  game.launchExpedition();
  game.patchRunLoot(peerId, {
    xp: 100,
    mastery: 50,
    skill1: 8,
    skill2: 5,
    gold: 100,
    common: 12,
    rare: 3,
    kills: 1,
    bosses: 1,
    namedParts: { direfang_fang: 2, direfang_heart: 1 },
  });
  game.forceDeepHuntBossClear();

  const settled = game.readState();
  assert.equal(settled.lastSummary.outcome, "clear");
  assert.equal(settled.lastSummary.bossTrophy, "Direfang Alpha");
  assert.equal(settled.profile.gold, 195);
  assert.equal(settled.profile.materials.common, 12);
  assert.equal(settled.profile.materials.rare, 3);
  assert.equal(settled.profile.monsterParts.direfang_fang, 2);
  assert.equal(settled.profile.monsterParts.direfang_heart, 1);
  assert.ok(settled.profile.trophies.includes("Direfang Alpha"));

  game.returnFromSummary();
  const beforeFailedCraft = game.readState().profile;
  localStorage.failWritesFor(PROFILE_KEY);
  assert.equal(game.craftHuntRecipe("direfang_weapon"), false);
  assert.deepEqual(game.readState().profile, beforeFailedCraft, "failed crafting must roll back costs and gear");

  localStorage.allowWritesFor(PROFILE_KEY);
  const crafted = game.craftHuntRecipe("direfang_weapon");
  assert.equal(crafted.craftedFrom, "direfang_weapon");
  assert.equal(crafted.huntforged, true);
  assert.equal(crafted.identityTier, "Huntforged");
  assert.equal(crafted.setId, "direfang");
  assert.equal(crafted.rarity, "epic");
  assert.equal(crafted.ilvl, 14);

  const forged = game.readState().profile;
  assert.equal(forged.gold, 70);
  assert.equal(forged.materials.common, 4);
  assert.equal(forged.materials.rare, 1);
  assert.equal(forged.monsterParts.direfang_fang, 0);
  assert.equal(forged.monsterParts.direfang_heart, 0);
  assert.equal(forged.inventory.filter((item) => item.craftedFrom === "direfang_weapon").length, 1);

  const reloaded = await createGameRuntimeHarness({ localStorage, peerId: "solo-deep-reload" });
  reloaded.loadStoredHunter(hunterId);
  const persisted = reloaded.readState().profile;
  assert.equal(persisted.gold, 70);
  assert.equal(persisted.materials.common, 4);
  assert.equal(persisted.materials.rare, 1);
  assert.ok(persisted.trophies.includes("Direfang Alpha"));
  assert.equal(persisted.inventory.filter((item) => item.craftedFrom === "direfang_weapon").length, 1);
});

for (const scenario of [
  { name: "safe", safe: true, gold: 150, common: 20, rare: 20 },
  { name: "field", safe: false, gold: 135, common: 17, rare: 17 },
]) {
  test(`${scenario.name} Deep Hunt extraction settles the intended carried currency`, async () => {
    const game = await createGameRuntimeHarness({ peerId: `extract-${scenario.name}` });
    const peerId = game.createSoloHunter(`${scenario.name} Extractor`, "shadow");
    game.selectExpedition("frontier", null);
    game.toggleReady();
    game.launchExpedition();
    game.patchRunLoot(peerId, { gold: 100, common: 20, rare: 20 });
    game.openExtractionWindow({ safe: scenario.safe });
    game.vote("extract");

    const state = game.readState();
    assert.equal(state.room.run, null);
    assert.equal(state.lastSummary.success, true);
    assert.equal(state.lastSummary.outcome, "extract");
    assert.equal(state.lastSummary.safeExtract, scenario.safe);
    assert.equal(state.profile.gold, scenario.gold);
    assert.equal(state.profile.materials.common, scenario.common);
    assert.equal(state.profile.materials.rare, scenario.rare);
  });
}

test("a rejected profile write keeps a retryable settlement and applies it exactly once after recovery", async () => {
  const localStorage = createMemoryStorage();
  const game = await createGameRuntimeHarness({ localStorage, peerId: "settlement-retry" });
  const peerId = game.createSoloHunter("Retry Keeper", "templar");
  game.selectExpedition("frontier", null);
  game.toggleReady();
  game.launchExpedition();
  game.patchRunLoot(peerId, { gold: 60, common: 4, rare: 1 });

  localStorage.failWritesFor(PROFILE_KEY);
  assert.equal(game.forceDeepHuntBossClear(), false);
  const blocked = game.readState();
  assert.equal(blocked.room.run.phase, "settlement_failed");
  assert.equal(blocked.profile.gold, 50);
  assert.equal(blocked.profile.lifetime.runs, 0);
  assert.equal(blocked.profile.settlementReceiptsV145.length, 0);
  assert.equal(blocked.lastSummary, null);

  localStorage.allowWritesFor(PROFILE_KEY);
  assert.equal(game.retrySettlement(), true);
  const recovered = game.readState();
  assert.equal(recovered.room.run, null);
  assert.equal(recovered.profile.gold, 155);
  assert.equal(recovered.profile.materials.common, 4);
  assert.equal(recovered.profile.materials.rare, 1);
  assert.equal(recovered.profile.lifetime.runs, 1);
  assert.equal(recovered.profile.lifetime.success, 1);
  assert.equal(recovered.profile.settlementReceiptsV145.length, 1);
});
