import {
  chmod,
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
} from "node:fs/promises";
import { basename, dirname, isAbsolute, join, parse, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const siteSource = join(projectRoot, "site");

function isMissing(error) {
  return error && typeof error === "object" && error.code === "ENOENT";
}

async function pathExists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (isMissing(error)) return false;
    throw error;
  }
}

async function physicalPath(path) {
  const absolutePath = resolve(path);
  let cursor = absolutePath;
  const missingSegments = [];

  while (true) {
    try {
      return resolve(await realpath(cursor), ...missingSegments);
    } catch (error) {
      if (!isMissing(error)) throw error;
      const parent = dirname(cursor);
      if (parent === cursor) return absolutePath;
      missingSegments.unshift(basename(cursor));
      cursor = parent;
    }
  }
}

function isWithin(path, parent) {
  const pathFromParent = relative(parent, path);
  return (
    pathFromParent === "" ||
    (!pathFromParent.startsWith("..") && !isAbsolute(pathFromParent))
  );
}

async function assertSafeDestination(destination) {
  const [destinationPath, rootPath, sourcePath] = await Promise.all([
    physicalPath(destination),
    physicalPath(projectRoot),
    physicalPath(siteSource),
  ]);

  if (destinationPath === parse(destinationPath).root) {
    throw new Error("Refusing to materialize a Site over a filesystem root.");
  }
  if (destinationPath === rootPath) {
    throw new Error("Refusing to materialize a Site over the ASHFALL project root.");
  }
  if (isWithin(rootPath, destinationPath)) {
    throw new Error("Refusing to materialize a Site into an ancestor of the ASHFALL project.");
  }
  if (isWithin(destinationPath, sourcePath)) {
    throw new Error("Refusing to materialize inside the versioned site/ source tree.");
  }

  return destinationPath;
}

async function ensureRealDirectory(path) {
  if (!(await pathExists(path))) {
    await mkdir(path, { recursive: true });
    return;
  }

  const pathStats = await lstat(path);
  if (pathStats.isSymbolicLink() || !pathStats.isDirectory()) {
    throw new Error(`Refusing to traverse a non-directory or symbolic link: ${path}`);
  }
}

async function assertSafeFileTarget(path) {
  if (!(await pathExists(path))) return;
  const pathStats = await lstat(path);
  if (pathStats.isSymbolicLink() || !pathStats.isFile() || pathStats.nlink > 1) {
    throw new Error(`Refusing to overwrite an unsafe managed file target: ${path}`);
  }
}

async function copyDirectoryContents(source, destination) {
  await ensureRealDirectory(destination);
  const entries = (await readdir(source, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const entry of entries) {
    const sourcePath = join(source, entry.name);
    const destinationPath = join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryContents(sourcePath, destinationPath);
      continue;
    }
    if (!entry.isFile()) {
      throw new Error(`Refusing unsupported entry in versioned Site source: ${sourcePath}`);
    }

    await assertSafeFileTarget(destinationPath);
    await copyFile(sourcePath, destinationPath);
    const sourceMode = (await stat(sourcePath)).mode & 0o777;
    await chmod(destinationPath, sourceMode);
  }
}

async function prepareDestination(destination, force) {
  if (!(await pathExists(destination))) {
    await mkdir(destination, { recursive: true });
    return;
  }

  const destinationStats = await lstat(destination);
  if (destinationStats.isSymbolicLink() || !destinationStats.isDirectory()) {
    throw new Error("Site output must be a real directory, not a file or symbolic link.");
  }

  const entries = await readdir(destination);
  if (entries.length > 0 && !force) {
    throw new Error(
      "Site output already exists and is nonempty; pass --force to overwrite managed files safely.",
    );
  }
  if (entries.length > 0 && force) {
    const sourceManifestPath = join(siteSource, ".openai", "hosting.json");
    const destinationManifestPath = join(destination, ".openai", "hosting.json");
    await assertSafeFileTarget(destinationManifestPath);

    let sourceManifest;
    let destinationManifest;
    try {
      sourceManifest = JSON.parse(await readFile(sourceManifestPath, "utf8"));
      destinationManifest = JSON.parse(await readFile(destinationManifestPath, "utf8"));
    } catch (error) {
      if (isMissing(error)) {
        throw new Error(
          "Refusing --force for a nonempty directory without the matching Site hosting manifest.",
        );
      }
      throw new Error(
        "Refusing --force because the source or destination Site hosting manifest is invalid.",
        { cause: error },
      );
    }

    if (
      typeof sourceManifest.project_id !== "string" ||
      destinationManifest.project_id !== sourceManifest.project_id
    ) {
      throw new Error(
        "Refusing --force because the destination belongs to a different Site project.",
      );
    }
  }
}

function normalizeOptions(options, additionalOptions) {
  if (typeof options === "string") return { ...additionalOptions, out: options };
  if (options === undefined) return {};
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("materializeSite expects an output path or an options object.");
  }
  return options;
}

/**
 * Copy the versioned ChatGPT Site runtime and inject the canonical split game.
 * Existing destinations are merged only when force is explicit; the destination
 * root itself is never deleted.
 */
export async function materializeSite(options, additionalOptions = {}) {
  const { out, force = false } = normalizeOptions(options, additionalOptions);
  if (typeof out !== "string" || out.trim() === "") {
    throw new Error("An explicit Site output path is required.");
  }
  if (typeof force !== "boolean") {
    throw new TypeError("The force option must be a boolean.");
  }

  const destination = await assertSafeDestination(out);
  const sourceStats = await lstat(siteSource).catch((error) => {
    if (isMissing(error)) {
      throw new Error("Versioned Site runtime is missing: expected site/ in the project root.");
    }
    throw error;
  });
  if (!sourceStats.isDirectory()) {
    throw new Error("Versioned Site runtime must be a directory: site/.");
  }
  if (await pathExists(join(siteSource, "public", "game"))) {
    throw new Error(
      "Versioned Site runtime must not contain site/public/game; the root game is canonical.",
    );
  }

  await prepareDestination(destination, force);
  await copyDirectoryContents(siteSource, destination);

  await ensureRealDirectory(join(destination, "public"));
  const gameDestination = join(destination, "public", "game");
  await rm(gameDestination, { recursive: true, force: true });
  await Promise.all([
    mkdir(join(gameDestination, "css"), { recursive: true }),
    mkdir(join(gameDestination, "js"), { recursive: true }),
    mkdir(join(gameDestination, "assets"), { recursive: true }),
  ]);

  await Promise.all([
    copyFile(join(projectRoot, "index.html"), join(gameDestination, "index.html")),
    copyFile(join(projectRoot, "css", "game.css"), join(gameDestination, "css", "game.css")),
    copyFile(
      join(projectRoot, "js", "save-system.js"),
      join(gameDestination, "js", "save-system.js"),
    ),
    copyFile(
      join(projectRoot, "js", "world-contracts.js"),
      join(gameDestination, "js", "world-contracts.js"),
    ),
    copyFile(join(projectRoot, "js", "game.js"), join(gameDestination, "js", "game.js")),
  ]);

  const assetFiles = (await readdir(join(projectRoot, "assets"), { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
    .map((entry) => entry.name)
    .sort();
  await Promise.all(
    assetFiles.map((assetFile) =>
      copyFile(
        join(projectRoot, "assets", assetFile),
        join(gameDestination, "assets", assetFile),
      ),
    ),
  );

  return { destination, assetCount: assetFiles.length };
}

function parseArguments(args) {
  let out;
  let force = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--force") {
      force = true;
      continue;
    }
    if (argument === "--out") {
      if (out !== undefined) throw new Error("--out may be supplied only once.");
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--out requires an explicit path.");
      }
      out = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }

  if (out === undefined) throw new Error("Usage: node scripts/materialize-site.mjs --out <path> [--force]");
  return { out, force };
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  try {
    const result = await materializeSite(parseArguments(process.argv.slice(2)));
    console.log(
      `Materialized ASHFALL Site at ${result.destination} with ${result.assetCount} canonical PNG assets.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
