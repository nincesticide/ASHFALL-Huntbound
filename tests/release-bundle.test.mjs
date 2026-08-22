import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const testsDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testsDirectory, "..");
const releasePath = join(
  projectRoot,
  "release",
  "ASHFALL_Huntbound_Alpha_v0.14.0_Open_World.html",
);

test("the committed release bundle is byte-for-byte current and --check does not rewrite it", async () => {
  const beforeBytes = await readFile(releasePath);
  const beforeStat = await stat(releasePath);
  const result = spawnSync(process.execPath, ["scripts/build-bundle.mjs", "--check"], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  // 57 canonical assets/asset_*.png plus each monster atlas under assets/monsters/.
  // Raise this deliberately when an atlas is added, so a sprite silently dropping
  // out of the single-file release fails here instead of shipping.
  assert.match(result.stdout, /Verified .* byte-for-byte with 58 embedded assets/);
  const afterBytes = await readFile(releasePath);
  const afterStat = await stat(releasePath);
  assert.deepEqual(afterBytes, beforeBytes);
  assert.equal(afterStat.mtimeMs, beforeStat.mtimeMs);
});
