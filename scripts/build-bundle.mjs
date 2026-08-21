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

const [indexSource, cssSource, gameSource] = await Promise.all([
  readFile(join(projectRoot, "index.html"), "utf8"),
  readFile(join(projectRoot, "css", "game.css"), "utf8"),
  readFile(join(projectRoot, "js", "game.js"), "utf8"),
]);

const assetPattern = /assets\/asset_[0-9]+_[a-f0-9]+\.png/g;
const assetPaths = [...new Set(`${cssSource}\n${gameSource}`.match(assetPattern) ?? [])];
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
const bundledGame = embedAssets(gameSource).replaceAll("</script", "<\\/script");

const bundledHtml = indexSource
  .replace(
    '<link rel="stylesheet" href="css/game.css">',
    `<style>\n${bundledCss}\n</style>`,
  )
  .replace(
    '<script src="js/game.js"></script>',
    `<script>\n${bundledGame}\n</script>`,
  );

if (bundledHtml === indexSource) {
  throw new Error("Bundle generation failed: source links were not replaced.");
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, bundledHtml);

console.log(
  `Built ${outputPath} with ${assetPaths.length} embedded assets (${Buffer.byteLength(bundledHtml)} bytes).`,
);
