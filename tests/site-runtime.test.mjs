import assert from "node:assert/strict";
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { materializeSite } from "../scripts/materialize-site.mjs";

const testsDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testsDirectory, "..");
const siteSource = join(projectRoot, "site");

async function makeTestDirectory(label) {
  return mkdtemp(join(tmpdir(), `ashfall-${label}-`));
}

async function removeExactTestDirectory(path) {
  assert.ok(
    path.startsWith(join(tmpdir(), "ashfall-")),
    `Refusing test cleanup outside the ASHFALL temp namespace: ${path}`,
  );
  await rm(path, { recursive: true, force: true });
}

async function assertSameBytes(expectedPath, actualPath) {
  const [expected, actual] = await Promise.all([readFile(expectedPath), readFile(actualPath)]);
  assert.ok(actual.equals(expected), `${actualPath} must be byte-identical to ${expectedPath}`);
}

async function assertMissing(path) {
  await assert.rejects(
    lstat(path),
    (error) => error && typeof error === "object" && error.code === "ENOENT",
    `${path} must not exist`,
  );
}

test("materializes the versioned Site runtime around the canonical v0.14 game", async () => {
  const tempDirectory = await makeTestDirectory("site-runtime");
  const destination = join(tempDirectory, "runtime");

  try {
    await assertMissing(join(siteSource, "public", "game"));
    const result = await materializeSite({ out: destination });
    assert.equal(result.destination, destination);
    assert.equal(result.assetCount, 57);

    const gameFiles = [
      ["index.html"],
      ["css", "game.css"],
      ["js", "save-system.js"],
      ["js", "world-contracts.js"],
      ["js", "game.js"],
    ];
    await Promise.all(
      gameFiles.map((segments) =>
        assertSameBytes(join(projectRoot, ...segments), join(destination, "public", "game", ...segments)),
      ),
    );

    const canonicalAssets = (await readdir(join(projectRoot, "assets")))
      .filter((file) => file.endsWith(".png"))
      .sort();
    const materializedAssets = (await readdir(join(destination, "public", "game", "assets")))
      .filter((file) => file.endsWith(".png"))
      .sort();
    assert.equal(canonicalAssets.length, 57);
    assert.deepEqual(materializedAssets, canonicalAssets);
    await Promise.all(
      canonicalAssets.map((asset) =>
        assertSameBytes(
          join(projectRoot, "assets", asset),
          join(destination, "public", "game", "assets", asset),
        ),
      ),
    );

    const criticalRuntimeFiles = [
      ".openai/hosting.json",
      "package.json",
      "app/layout.tsx",
      "app/page.tsx",
      "db/multiplayer.ts",
      "db/schema.ts",
      "drizzle/0000_spooky_zombie.sql",
      "types/cloudflare-runtime.d.ts",
      "vite.config.ts",
      "worker/index.ts",
    ];
    await Promise.all(
      criticalRuntimeFiles.map(async (runtimePath) => {
        const runtimeStats = await lstat(join(destination, runtimePath));
        assert.ok(runtimeStats.isFile(), `${runtimePath} must be a versioned Site runtime file`);
      }),
    );

    const manifest = JSON.parse(await readFile(join(destination, ".openai", "hosting.json"), "utf8"));
    assert.equal(manifest.d1, "DB");
    assert.match(manifest.project_id, /^appgprj_[a-z0-9]+$/);

    const [pageSource, relaySource, schemaSource, workerSource, materializedGitignore] = await Promise.all([
      readFile(join(destination, "app", "page.tsx"), "utf8"),
      readFile(join(destination, "db", "multiplayer.ts"), "utf8"),
      readFile(join(destination, "db", "schema.ts"), "utf8"),
      readFile(join(destination, "worker", "index.ts"), "utf8"),
      readFile(join(destination, ".gitignore"), "utf8"),
    ]);
    assert.match(pageSource, /src=["']\/game\/index\.html["']/);
    assert.match(relaySource, /export async function handleMultiplayerRequest/);
    assert.match(relaySource, /multiplayer_events/);
    assert.match(relaySource, /const CLEANUP_INTERVAL_MS = 60 \* 1000/);
    assert.doesNotMatch(relaySource, /request\.method === ["']DELETE["']/);
    assert.doesNotMatch(relaySource, /ensureSchema/);
    assert.match(relaySource, /allow: ["']GET, POST["']/);
    assert.match(schemaSource, /multiplayerEvents/);
    assert.match(workerSource, /url\.pathname === ["']\/api\/multiplayer["']/);
    assert.match(workerSource, /handleMultiplayerRequest\(request, env\.DB\)/);
    assert.match(workerSource, /return handler\.fetch\(request, env, ctx\)/);
    assert.doesNotMatch(
      materializedGitignore,
      /(?:^|\n)\/public\/game\/?(?:\n|$)/,
      "the deployable Site must not ignore its generated game payload",
    );
  } finally {
    await removeExactTestDirectory(tempDirectory);
  }
});

test("refuses dangerous or implicit materialization targets", async () => {
  await assert.rejects(materializeSite(), /explicit Site output path/);
  await assert.rejects(materializeSite({ out: "/" }), /filesystem root/);
  await assert.rejects(materializeSite({ out: projectRoot }), /project root/);
  await assert.rejects(materializeSite({ out: siteSource }), /versioned site\/ source tree/);
});

test("requires force for nonempty output and force preserves unrelated files", async () => {
  const tempDirectory = await makeTestDirectory("site-force");
  const destination = join(tempDirectory, "runtime");
  const markerPath = join(destination, "keep-me.txt");

  try {
    await materializeSite({ out: destination });
    await writeFile(markerPath, "unmanaged destination content\n");
    await assert.rejects(materializeSite({ out: destination }), /nonempty/);

    const result = await materializeSite({ out: destination, force: true });
    assert.equal(result.assetCount, 57);
    assert.equal(await readFile(markerPath, "utf8"), "unmanaged destination content\n");
    await assertSameBytes(
      join(projectRoot, "js", "game.js"),
      join(destination, "public", "game", "js", "game.js"),
    );
  } finally {
    await removeExactTestDirectory(tempDirectory);
  }
});

test("refuses force for an unrelated nonempty directory", async () => {
  const tempDirectory = await makeTestDirectory("site-unrelated");
  const destination = join(tempDirectory, "not-a-site");

  try {
    await mkdir(destination);
    await writeFile(join(destination, "unrelated.txt"), "not a Site checkout\n");
    await assert.rejects(
      materializeSite({ out: destination, force: true }),
      /matching Site hosting manifest/,
    );
  } finally {
    await removeExactTestDirectory(tempDirectory);
  }
});
