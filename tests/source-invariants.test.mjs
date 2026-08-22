import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const testsDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testsDirectory, "..");

const [indexSource, cssSource, saveSystemSource, worldContractsSource, gameSource] = await Promise.all([
  readFile(join(projectRoot, "index.html"), "utf8"),
  readFile(join(projectRoot, "css", "game.css"), "utf8"),
  readFile(join(projectRoot, "js", "save-system.js"), "utf8"),
  readFile(join(projectRoot, "js", "world-contracts.js"), "utf8"),
  readFile(join(projectRoot, "js", "game.js"), "utf8"),
]);

function sourceBetween(start, end) {
  const startIndex = gameSource.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing source anchor: ${start}`);
  const endIndex = gameSource.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing source anchor: ${end}`);
  return gameSource.slice(startIndex, endIndex);
}

test("index.html boots the split development source", () => {
  assert.equal(
    indexSource.match(/<link rel="stylesheet" href="css\/game\.css">/g)?.length,
    1,
  );
  assert.equal(
    indexSource.match(/<script src="js\/save-system\.js"><\/script>/g)?.length,
    1,
  );
  assert.equal(
    indexSource.match(/<script src="js\/world-contracts\.js"><\/script>/g)?.length,
    1,
  );
  assert.equal(indexSource.match(/<script src="js\/game\.js"><\/script>/g)?.length, 1);
  assert.ok(cssSource.length > 0, "css/game.css must not be empty");
  assert.ok(saveSystemSource.length > 0, "js/save-system.js must not be empty");
  assert.ok(worldContractsSource.length > 0, "js/world-contracts.js must not be empty");
  assert.ok(gameSource.length > 0, "js/game.js must not be empty");
  assert.ok(
    indexSource.indexOf("js/save-system.js") < indexSource.indexOf("js/game.js") &&
      indexSource.indexOf("js/world-contracts.js") < indexSource.indexOf("js/game.js"),
    "support modules must load before the game",
  );
});

test("all 57 canonical PNG assets exist and are referenced", async () => {
  const assetReferencePattern = /assets\/asset_[0-9]+_[a-f0-9]+\.png/g;
  const references = [
    ...new Set(
      `${indexSource}\n${cssSource}\n${saveSystemSource}\n${worldContractsSource}\n${gameSource}`.match(
        assetReferencePattern,
      ) ?? [],
    ),
  ].sort();
  const assetFiles = (await readdir(join(projectRoot, "assets")))
    .filter((file) => /^asset_[0-9]+_[a-f0-9]+\.png$/.test(file))
    .map((file) => `assets/${file}`)
    .sort();

  assert.equal(assetFiles.length, 57);
  assert.deepEqual(assetFiles, references, "assets/ and source references must stay in lockstep");
  await Promise.all(
    assetFiles.map(async (assetPath) => {
      const bytes = await readFile(join(projectRoot, assetPath));
      assert.deepEqual(
        [...bytes.subarray(0, 8)],
        [137, 80, 78, 71, 13, 10, 26, 10],
        `${assetPath} must retain a valid PNG signature`,
      );
    }),
  );
});

test("localStorage character saves retain the canonical profile key", () => {
  assert.match(saveSystemSource, /const PROFILE_KEY = 'ashfall_mp_alpha_profiles_v1';/);
  assert.match(gameSource, /const PROFILE_KEY=SAVE_SYSTEM\.PROFILE_KEY/);
  assert.match(saveSystemSource, /storage\.getItem\(PROFILE_KEY\)/);
  assert.match(saveSystemSource, /storage\.setItem\(PROFILE_KEY, serialized\)/);
  assert.deepEqual(
    [...`${saveSystemSource}\n${gameSource}`.matchAll(/ashfall_[a-z0-9_]*profiles[a-z0-9_]*/g)].map(
      (match) => match[0],
    ),
    ["ashfall_mp_alpha_profiles_v1"],
    "introducing another profile key requires an explicit save migration",
  );
  assert.match(saveSystemSource, /const RECOVERY_KEY = 'ashfall_save_recovery_v1';/);
  assert.match(saveSystemSource, /const QUARANTINE_KEY = 'ashfall_corrupt_quarantine_v1';/);
  assert.match(gameSource, /SAVE_SYSTEM\.readProfiles\(localStorage\)/);
  assert.match(gameSource, /SAVE_SYSTEM\.importProfiles\(localStorage/);
  assert.match(indexSource, /id="saveExportV144"/);
  assert.match(indexSource, /id="saveImportV144"/);
  assert.match(indexSource, /id="saveRestoreV144"/);
});

test("the armory retains all ten canonical equipment slots and labels", () => {
  const orderMatch = gameSource.match(/const ARMORY_SLOT_ORDER_V132=\[([^\]]+)\];/);
  assert.ok(orderMatch, "ARMORY_SLOT_ORDER_V132 is missing");
  const slots = [...orderMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  assert.deepEqual(slots, [
    "head",
    "shoulders",
    "chest",
    "gloves",
    "boots",
    "weapon",
    "offhand",
    "ring1",
    "ring2",
    "necklace",
  ]);

  const labelMatch = gameSource.match(/const ARMORY_SLOT_LABEL_V132=\{([^}]+)\};/);
  assert.ok(labelMatch, "ARMORY_SLOT_LABEL_V132 is missing");
  const labels = Object.fromEntries(
    [...labelMatch[1].matchAll(/([a-z0-9]+):'([^']+)'/g)].map((match) => [match[1], match[2]]),
  );
  assert.deepEqual(labels, {
    head: "Head",
    shoulders: "Shoulders",
    chest: "Chest",
    gloves: "Gloves",
    boots: "Boots",
    weapon: "Weapon",
    offhand: "Shield / Offhand",
    ring1: "Ring I",
    ring2: "Ring II",
    necklace: "Necklace",
  });
});

test("death, summary, gate, and multiplayer returns converge on the Emberwatch bonfire", () => {
  assert.match(
    worldContractsSource,
    /\[14, 12\][\s\S]*\[16, 12\][\s\S]*\[14, 11\][\s\S]*\[16, 11\]/,
  );
  assert.match(gameSource, /EMBERWATCH_RETURN_SPAWNS_V142=WORLD_CONTRACTS\.EMBERWATCH_RETURN_SPAWNS/);

  const resetFlow = sourceBetween("function resetToEmberwatchV142", "function returnPartyToEmberwatchV142");
  assert.match(resetFlow, /WORLD_CONTRACTS\.resetRoomToEmberwatch\(room\)/);
  assert.match(worldContractsSource, /room\.worldV14 = null/);
  assert.match(worldContractsSource, /room\.worldSelectionV141 = null/);
  assert.match(worldContractsSource, /stagePartyAtBonfire\(room\.players\)/);

  const summaryFlow = sourceBetween("function returnToCampFromSummaryV142", "function enterWorldV14");
  assert.match(summaryFlow, /returnPartyToEmberwatchV142\(/);
  assert.match(summaryFlow, /send\(\{type:'returnToCampV142',peerId\}\)/);
  assert.match(gameSource, /\$\('summaryClose'\)\.onclick=returnToCampFromSummaryV142/);

  const gateFlow = sourceBetween("function leaveWorldV14", "function worldOccupiedV14");
  assert.match(gateFlow, /returnPartyToEmberwatchV142\(/);

  const settlementFlow = sourceBetween("function settleRun", "function applySettlement");
  assert.match(settlementFlow, /if\(!pending\.success\)resetToEmberwatchV142\(\)/);

  assert.match(
    gameSource,
    /msg\.type==='returnToCampV142'.*returnPartyToEmberwatchV142\(/,
  );
});

test("surface encounter clicks target the exact tile and preserve the auto-attack contract", () => {
  const clickFlow = sourceBetween(
    "canvas.addEventListener('click'",
    "const MOVE_KEYS=",
  );
  assert.match(clickFlow, /WORLD_CONTRACTS\.exactObjectAtTile\(worldObjectsV141\(\),x,y\)/);
  assert.match(worldContractsSource, /object\.x === x && object\.y === y/);
  assert.match(clickFlow, /interactWorldV14\(o,\{autoAttack:o\.objType==='encounter'\}\)/);
  assert.doesNotMatch(
    clickFlow,
    /worldObjectsV141\(\)\.map\(q=>\(\{\.\.\.q,clickDist/,
    "surface objects must not activate from adjacent click tiles",
  );

  const interactionFlow = sourceBetween("function hostWorldInteractV141", "const V14_WORLD_CONTRACTS");
  assert.match(interactionFlow, /launchWorldSkirmishV14\(o,pid,autoAttack\)/);
  assert.match(
    interactionFlow,
    /send\(\{type:'worldInteractV141',peerId,objectId:o\.id,autoAttack:!!opts\.autoAttack\}\)/,
  );
  assert.match(gameSource, /hostWorldInteractV141\(sender,msg\.objectId,!!msg\.autoAttack\)/);

  const skirmishFlow = sourceBetween("function generateSurfaceSkirmishV142", "function worldResourceRewardV141");
  assert.match(skirmishFlow, /run\.map=structuredCloneSafe\(w\.map\)/);
  assert.match(skirmishFlow, /p\.x=wp\?\.worldX\?\?5;p\.y=wp\?\.worldY\?\?9/);
  assert.match(skirmishFlow, /if\(autoAttack&&attacker&&target\)\{hostCommand\(/);
  assert.match(skirmishFlow, /action:\{type:'attack'/);
});

test("the private room client uses authenticated sessions, heartbeat leases, and free-quota-aware polling", () => {
  const transportFlow = sourceBetween(
    "let remoteTransportV141=",
    "let combatMeterMode=",
  );
  assert.doesNotMatch(transportFlow, /method:'DELETE'/);
  assert.match(transportFlow, /'x-ashfall-member-token'/);
  assert.match(transportFlow, /'x-ashfall-room-session'/);
  assert.match(transportFlow, /Date\.now\(\)-state\.heartbeatAt>=12000/);
  assert.match(transportFlow, /Math\.min\(document\.hidden\?5000:2400,650\+state\.idlePolls\*140\)/);
  assert.match(
    gameSource,
    /const ROOM_CODE_ALPHABET_V143='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';/,
  );
  assert.match(
    gameSource,
    /crypto\.getRandomValues\(new Uint8Array\(6\)\)/,
  );
});

test("every inline event handler is reachable from the global scope", () => {
  // game.js runs inside an IIFE, so a function referenced by an inline onclick=
  // only resolves if it was also assigned to window. Anything missing throws
  // ReferenceError the moment a player clicks the control.
  const exported = new Set(
    [...gameSource.matchAll(/window\.([A-Za-z0-9_$]+)\s*=/g)].map((match) => match[1]),
  );
  const referenced = new Set();
  for (const source of [gameSource, indexSource]) {
    for (const match of source.matchAll(
      /\bon(?:click|change|input|submit|keyup|keydown)\s*=\s*["']([A-Za-z0-9_$]+)\s*\(/g,
    )) {
      referenced.add(match[1]);
    }
  }
  const unreachable = [...referenced].filter((name) => !exported.has(name)).sort();
  assert.deepEqual(
    unreachable,
    [],
    `inline handlers missing a window export: ${unreachable.join(", ")}`,
  );
});
