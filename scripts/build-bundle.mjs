import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const outputPath = join(
  projectRoot,
  "release",
  "ASHFALL_Huntbound_Alpha_v0.14.0_Open_World.html",
);

export async function buildBundleInMemory() {
  const [indexSource, cssSource, saveSystemSource, worldContractsSource, gameSource] = await Promise.all([
    readFile(join(projectRoot, "index.html"), "utf8"),
    readFile(join(projectRoot, "css", "game.css"), "utf8"),
    readFile(join(projectRoot, "js", "save-system.js"), "utf8"),
    readFile(join(projectRoot, "js", "world-contracts.js"), "utf8"),
    readFile(join(projectRoot, "js", "game.js"), "utf8"),
  ]);

  // Canonical numbered assets, plus per-monster atlases under assets/monsters/.
  // Without the second alternative a monster atlas stays an unresolved relative
  // path in the single-file release, so the standalone build silently falls back
  // to the procedural renderer while the served build looks correct.
  const assetPattern = /assets\/(?:asset_[0-9]+_[a-f0-9]+|monsters\/[A-Za-z0-9_\-./]+)\.png/g;
  const assetPaths = [
    ...new Set(
      `${cssSource}\n${saveSystemSource}\n${worldContractsSource}\n${gameSource}`.match(
        assetPattern,
      ) ?? [],
    ),
  ];
  const embeddedAssets = new Map();

  await Promise.all(
    assetPaths.map(async (assetPath) => {
      const bytes = await readFile(join(projectRoot, assetPath));
      embeddedAssets.set(assetPath, `data:image/png;base64,${bytes.toString("base64")}`);
    }),
  );

  const embedAssets = (source) =>
    assetPaths.reduce(
      (result, assetPath) => result.replaceAll(assetPath, embeddedAssets.get(assetPath)),
      source,
    );

  const bundledCss = embedAssets(cssSource).replaceAll("</style", "<\\/style");
  const bundledSaveSystem = embedAssets(saveSystemSource).replaceAll("</script", "<\\/script");
  const bundledWorldContracts = embedAssets(worldContractsSource).replaceAll(
    "</script",
    "<\\/script",
  );
  const bundledGame = embedAssets(gameSource).replaceAll("</script", "<\\/script");
  const bundledHtml = indexSource
    .replace(
      '<link rel="stylesheet" href="css/game.css">',
      `<style>\n${bundledCss}\n</style>`,
    )
    .replace(
      '<script src="js/save-system.js"></script>',
      `<script>\n${bundledSaveSystem}\n</script>`,
    )
    .replace(
      '<script src="js/world-contracts.js"></script>',
      `<script>\n${bundledWorldContracts}\n</script>`,
    )
    .replace(
      '<script src="js/game.js"></script>',
      `<script>\n${bundledGame}\n</script>`,
    );

  if (
    bundledHtml === indexSource ||
    /<(?:link|script)[^>]+(?:css\/game\.css|js\/(?:save-system|world-contracts|game)\.js)/.test(
      bundledHtml,
    )
  ) {
    throw new Error("Bundle generation failed: source links were not replaced.");
  }

  return { bundledHtml, assetPaths };
}

export async function writeBundle() {
  const { bundledHtml, assetPaths } = await buildBundleInMemory();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bundledHtml);
  console.log(
    `Built ${outputPath} with ${assetPaths.length} embedded assets (${Buffer.byteLength(bundledHtml)} bytes).`,
  );
}

export async function checkBundle() {
  const [{ bundledHtml, assetPaths }, releaseBytes] = await Promise.all([
    buildBundleInMemory(),
    readFile(outputPath),
  ]);
  const expectedBytes = Buffer.from(bundledHtml);
  if (!releaseBytes.equals(expectedBytes)) {
    throw new Error(
      `Release bundle is stale: expected ${expectedBytes.length} bytes but found ${releaseBytes.length}. Run npm run build.`,
    );
  }
  console.log(
    `Verified ${outputPath} byte-for-byte with ${assetPaths.length} embedded assets (${releaseBytes.length} bytes).`,
  );
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const args = process.argv.slice(2);
  const unknownArgs = args.filter((arg) => arg !== "--check");
  if (unknownArgs.length) {
    throw new Error(`Unknown argument${unknownArgs.length === 1 ? "" : "s"}: ${unknownArgs.join(", ")}`);
  }
  if (args.includes("--check")) await checkBundle();
  else await writeBundle();
}
