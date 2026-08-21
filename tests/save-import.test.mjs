import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

await import("../js/save-system.js");

const saveSystem = globalThis.AshfallSaveSystem;
const testsDirectory = dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = resolve(testsDirectory, "fixtures", "saves");

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]));
    this.writes = [];
    this.failKey = null;
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.writes.push({ key, value: String(value) });
    if (this.failKey === key) throw new Error(`simulated ${key} write failure`);
    this.values.set(key, String(value));
  }

  seed(key, value) {
    this.values.set(key, String(value));
  }
}

function normalizedProfile(id = "base-warden", overrides = {}) {
  return saveSystem.normalizeProfileV014({
    id,
    name: "Base Warden",
    classId: "warden",
    ...overrides,
  });
}

test("export creates a versioned, deterministic envelope and round-trips every field", async () => {
  const profiles = JSON.parse(
    await readFile(join(fixturesDirectory, "current-v014-rich.json"), "utf8"),
  );
  const now = new Date("2026-08-21T12:00:00.000Z");
  const exported = saveSystem.stringifyExport(profiles, { now });

  assert.equal(exported.ok, true);
  const envelope = JSON.parse(exported.text);
  assert.equal(envelope.format, "ashfall-huntbound-save");
  assert.equal(envelope.formatVersion, 1);
  assert.equal(envelope.gameVersion, "0.14.0");
  assert.equal(envelope.exportedAt, now.toISOString());
  assert.equal(envelope.profileKey, "ashfall_mp_alpha_profiles_v1");
  assert.deepEqual(envelope.profiles, profiles);

  const imported = saveSystem.parseImportText(exported.text);
  assert.equal(imported.ok, true);
  assert.deepEqual(imported.profiles, profiles);
});

test("preview is pure and additive import preserves existing hunters while copying conflicts", () => {
  const existing = { "base-warden": normalizedProfile() };
  const imported = {
    "base-warden": normalizedProfile("base-warden", { name: "Changed Warden", gold: 99 }),
    "new-ranger": saveSystem.normalizeProfileV014({
      id: "new-ranger",
      name: "New Ranger",
      classId: "ranger",
    }),
  };
  const originalRaw = JSON.stringify(existing);
  const storage = new MemoryStorage({ [saveSystem.PROFILE_KEY]: originalRaw });

  const plan = saveSystem.planProfileMerge(existing, imported);
  assert.deepEqual(plan, {
    added: 1,
    duplicates: 0,
    conflicts: 1,
    total: 2,
    resultingTotal: 3,
  });
  assert.equal(storage.writes.length, 0, "preview must not write to Storage");

  const result = saveSystem.importProfiles(storage, imported, {
    expectedRaw: originalRaw,
    makeId: () => "recovered-warden",
    now: new Date("2026-08-21T12:00:00.000Z"),
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.added, ["new-ranger"]);
  assert.deepEqual(result.conflicts, [
    { originalId: "base-warden", recoveredId: "recovered-warden" },
  ]);
  assert.deepEqual(result.profiles["base-warden"], existing["base-warden"]);
  assert.equal(result.profiles["recovered-warden"].name, "Changed Warden (Recovered)");
  assert.equal(result.profiles["recovered-warden"].id, "recovered-warden");
  assert.deepEqual(
    storage.writes.map((write) => write.key),
    [saveSystem.RECOVERY_KEY, saveSystem.PROFILE_KEY],
    "the recovery snapshot must be written before the live roster",
  );
  const recoveryEnvelope = JSON.parse(storage.getItem(saveSystem.RECOVERY_KEY));
  assert.equal(recoveryEnvelope.raw, originalRaw);
});

test("identical imports are skipped without creating recovered copies", () => {
  const profiles = { "base-warden": normalizedProfile() };
  const raw = JSON.stringify(profiles);
  const storage = new MemoryStorage({ [saveSystem.PROFILE_KEY]: raw });
  const result = saveSystem.importProfiles(storage, structuredClone(profiles), {
    expectedRaw: raw,
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.added, []);
  assert.deepEqual(result.conflicts, []);
  assert.deepEqual(result.duplicates, ["base-warden"]);
  assert.deepEqual(result.profiles, profiles);
});

test("corrupt current bytes are exposed and block every normal write", async () => {
  const corrupt = await readFile(join(fixturesDirectory, "corrupt-truncated.txt"), "utf8");
  const storage = new MemoryStorage({ [saveSystem.PROFILE_KEY]: corrupt });
  const read = saveSystem.readProfiles(storage);
  assert.equal(read.ok, false);
  assert.equal(read.code, "invalid_json");
  assert.equal(read.raw, corrupt);

  const write = saveSystem.writeProfiles(storage, { "base-warden": normalizedProfile() });
  assert.equal(write.ok, false);
  assert.equal(write.code, "corrupt_current_save");
  assert.equal(storage.getItem(saveSystem.PROFILE_KEY), corrupt);
  assert.equal(storage.writes.length, 0);
});

test("backup failure aborts import and leaves the canonical roster byte-identical", () => {
  const profiles = { "base-warden": normalizedProfile() };
  const raw = JSON.stringify(profiles);
  const storage = new MemoryStorage({ [saveSystem.PROFILE_KEY]: raw });
  storage.failKey = saveSystem.RECOVERY_KEY;

  const result = saveSystem.importProfiles(
    storage,
    {
      "new-ranger": saveSystem.normalizeProfileV014({
        id: "new-ranger",
        name: "New Ranger",
        classId: "ranger",
      }),
    },
    { expectedRaw: raw },
  );

  assert.equal(result.ok, false);
  assert.equal(result.code, "backup_write_failed");
  assert.equal(storage.getItem(saveSystem.PROFILE_KEY), raw);
  assert.equal(storage.writes.some((write) => write.key === saveSystem.PROFILE_KEY), false);
});

test("canonical write failure leaves the old roster and exact recovery snapshot intact", () => {
  const profiles = { "base-warden": normalizedProfile() };
  const raw = JSON.stringify(profiles);
  const storage = new MemoryStorage({ [saveSystem.PROFILE_KEY]: raw });
  storage.failKey = saveSystem.PROFILE_KEY;

  const result = saveSystem.importProfiles(
    storage,
    {
      "new-ranger": saveSystem.normalizeProfileV014({
        id: "new-ranger",
        name: "New Ranger",
        classId: "ranger",
      }),
    },
    { expectedRaw: raw },
  );

  assert.equal(result.ok, false);
  assert.equal(result.code, "storage_write_failed");
  assert.equal(storage.getItem(saveSystem.PROFILE_KEY), raw);
  assert.equal(JSON.parse(storage.getItem(saveSystem.RECOVERY_KEY)).raw, raw);
  assert.deepEqual(
    storage.writes.map((write) => write.key),
    [saveSystem.RECOVERY_KEY, saveSystem.PROFILE_KEY],
  );
});

test("a changed roster invalidates an old preview before any write", () => {
  const original = { "base-warden": normalizedProfile() };
  const originalRaw = JSON.stringify(original);
  const storage = new MemoryStorage({ [saveSystem.PROFILE_KEY]: originalRaw });
  const changed = { ...original, "new-shadow": normalizedProfile("new-shadow", { classId: "shadow" }) };
  const changedRaw = JSON.stringify(changed);
  storage.seed(saveSystem.PROFILE_KEY, changedRaw);

  const result = saveSystem.importProfiles(storage, original, { expectedRaw: originalRaw });
  assert.equal(result.ok, false);
  assert.equal(result.code, "stale_preview");
  assert.equal(storage.getItem(saveSystem.PROFILE_KEY), changedRaw);
  assert.equal(storage.writes.length, 0);
});

test("automatic recovery can quarantine corrupt bytes and restore the last valid roster", async () => {
  const corrupt = await readFile(join(fixturesDirectory, "corrupt-truncated.txt"), "utf8");
  const profiles = { "base-warden": normalizedProfile() };
  const validRaw = JSON.stringify(profiles);
  const storage = new MemoryStorage();
  assert.equal(saveSystem.writeRecoverySnapshot(storage, validRaw).ok, true);
  storage.seed(saveSystem.PROFILE_KEY, corrupt);
  storage.writes = [];

  const result = saveSystem.restoreRecovery(storage, { expectedRaw: corrupt });
  assert.equal(result.ok, true);
  assert.equal(result.restoredCorrupt, true);
  assert.equal(storage.getItem(saveSystem.PROFILE_KEY), validRaw);
  assert.equal(JSON.parse(storage.getItem(saveSystem.QUARANTINE_KEY)).raw, corrupt);
  assert.deepEqual(
    storage.writes.map((write) => write.key),
    [saveSystem.QUARANTINE_KEY, saveSystem.PROFILE_KEY],
  );
});

test("future formats, unsafe keys, and unsupported classes are rejected", () => {
  const future = saveSystem.parseImportText(
    JSON.stringify({ format: saveSystem.EXPORT_FORMAT, formatVersion: 999, profiles: {} }),
  );
  assert.equal(future.ok, false);
  assert.equal(future.code, "unsupported_version");

  const unsafe = saveSystem.parseImportText(
    '{"unsafe":{"id":"unsafe","name":"Unsafe","classId":"warden","nested":{"constructor":{"polluted":true}}}}',
  );
  assert.equal(unsafe.ok, false);
  assert.equal(unsafe.code, "unsafe_data");

  const unsupported = saveSystem.parseImportText(
    JSON.stringify({ necro: { id: "necro", name: "Necro", classId: "necromancer" } }),
  );
  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.code, "invalid_class");
});

test("a single legacy profile can be imported without wrapping it by hand", () => {
  const parsed = saveSystem.parseImportText(
    JSON.stringify({ id: "solo-ranger", name: "Solo Ranger", classId: "ranger" }),
  );
  assert.equal(parsed.ok, true);
  assert.equal(parsed.source, "legacy-profile");
  assert.equal(parsed.count, 1);
  assert.equal(parsed.profiles["solo-ranger"].equipment.armor, null);
  assert.equal(parsed.profiles["solo-ranger"].equipment.charm, null);
});
