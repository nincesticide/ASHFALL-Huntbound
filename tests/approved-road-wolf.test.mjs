import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { decodePng } from "../tools/road-wolf-normalize/png.mjs";

const testsDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testsDirectory, "..");
const wolfDirectory = join(projectRoot, "assets", "monsters", "common", "road_wolf");

const [manifest, atlasBytes, gameSource] = await Promise.all([
  readFile(join(wolfDirectory, "road_wolf.sprite.json"), "utf8").then(JSON.parse),
  readFile(join(wolfDirectory, "road_wolf.atlas.png")),
  readFile(join(projectRoot, "js", "game.js"), "utf8"),
]);
const atlas = decodePng(atlasBytes);

function frameAlphaBounds(row, column) {
  const { frameWidth, frameHeight } = manifest;
  let opaque = 0;
  let bottom = -1;
  for (let y = 0; y < frameHeight; y += 1) {
    for (let x = 0; x < frameWidth; x += 1) {
      const alpha = atlas.data[
        ((row * frameHeight + y) * atlas.width + column * frameWidth + x) * 4 + 3
      ];
      if (alpha > 200) {
        opaque += 1;
        if (y > bottom) bottom = y;
      }
    }
  }
  return { opaque, bottom };
}

function eachFrame(visit) {
  for (const [name, animation] of Object.entries(manifest.animations)) {
    for (const [direction, row] of Object.entries(animation.rows)) {
      for (let column = 0; column < animation.frames; column += 1) {
        visit(`${name}/${direction} frame ${column}`, row, column);
      }
    }
  }
}

test("the approved Road Wolf is mapped only to the standard wolf", () => {
  assert.deepEqual(manifest.enemyKinds, ["wolf"]);
  assert.ok(manifest.excludeKinds.includes("direwolf"));
  assert.equal(manifest.frameWidth, 128);
  assert.equal(manifest.frameHeight, 96);
  assert.equal(manifest.animations.attack.eventFrame, 4);
});

test("the atlas matches the grid its manifest declares", () => {
  assert.equal(atlas.width, manifest.columns * manifest.frameWidth);
  assert.equal(atlas.height, manifest.rows * manifest.frameHeight);
  assert.equal(manifest.rowOrder.length, manifest.rows);
});

test("every declared frame carries artwork and lost the board background", () => {
  const { frameWidth, frameHeight } = manifest;
  eachFrame((label, row, column) => {
    const { opaque } = frameAlphaBounds(row, column);
    assert.ok(opaque > 400, `${label} is nearly empty (${opaque}px)`);
    assert.ok(
      opaque < frameWidth * frameHeight * 0.6,
      `${label} still carries the presentation board background`,
    );
  });
});

test("every frame rests on the declared ground anchor", () => {
  // Frames that do not share a ground line make the wolf bob through its walk cycle.
  eachFrame((label, row, column) => {
    const { bottom } = frameAlphaBounds(row, column);
    assert.ok(bottom >= 0, `${label} has no opaque pixel`);
    assert.ok(
      Math.abs(bottom - manifest.anchor.y) <= 3,
      `${label} rests at y=${bottom}, expected the anchor at ${manifest.anchor.y}`,
    );
  });
});

test("the renderer hook is visual-only and cannot capture Direfang Alpha", () => {
  assert.match(gameSource, /approved Road Wolf sprite v1/);
  assert.match(gameSource, /function drawApprovedWolfBodyV1/);
  assert.match(gameSource, /if\(e\.kind!=='wolf'\|\|!approvedWolfAtlasLoadedV1/);
  // The procedural wolf must stay reachable when the atlas fails to load.
  assert.match(
    gameSource,
    /if\(drawApprovedWolfBodyV1\(e,xx,yy,now\)\)\{\}else if\(k==='wolf'\)\{/,
  );
});
