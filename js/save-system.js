(function installAshfallSaveSystem(root) {
  'use strict';

  const PROFILE_KEY = 'ashfall_mp_alpha_profiles_v1';
  const RECOVERY_KEY = 'ashfall_save_recovery_v1';
  const QUARANTINE_KEY = 'ashfall_corrupt_quarantine_v1';
  const EXPORT_FORMAT = 'ashfall-huntbound-save';
  const RECOVERY_FORMAT = 'ashfall-huntbound-recovery';
  const FORMAT_VERSION = 1;
  const GAME_VERSION = '0.14.0';
  const MAX_IMPORT_BYTES = 4 * 1024 * 1024;
  const MAX_PROFILES = 100;
  const CLASS_IDS = new Set([
    'warden',
    'berserker',
    'ranger',
    'arcanist',
    'templar',
    'shadow',
  ]);
  const EQUIPMENT_SLOTS = [
    'head',
    'shoulders',
    'chest',
    'gloves',
    'boots',
    'weapon',
    'offhand',
    'ring1',
    'ring2',
    'necklace',
  ];
  const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
  const SAFE_ID = /^[A-Za-z0-9_.:-]{1,160}$/;

  function resultError(code, message, extra = {}) {
    return { ok: false, code, message, ...extra };
  }

  function isPlainRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function byteLength(text) {
    return new TextEncoder().encode(text).byteLength;
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function finiteNumber(value, fallback = 0) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  function inspectJsonSafety(value) {
    const stack = [{ value, depth: 0 }];
    let visited = 0;
    while (stack.length) {
      const entry = stack.pop();
      visited += 1;
      if (visited > 100000) return 'Save data is too complex to import safely.';
      if (entry.depth > 80) return 'Save data is nested too deeply to import safely.';
      if (typeof entry.value === 'string' && /[<>]/.test(entry.value)) {
        return 'Save data contains unsafe markup characters.';
      }
      if (!entry.value || typeof entry.value !== 'object') continue;
      for (const key of Object.keys(entry.value)) {
        if (FORBIDDEN_KEYS.has(key)) return `Save data contains a forbidden key: ${key}.`;
        stack.push({ value: entry.value[key], depth: entry.depth + 1 });
      }
    }
    return null;
  }

  function validateProfileCollection(profiles) {
    if (!isPlainRecord(profiles)) {
      return resultError('invalid_collection', 'The save roster must be a JSON object.');
    }
    const entries = Object.entries(profiles);
    if (entries.length > MAX_PROFILES) {
      return resultError(
        'too_many_profiles',
        `This backup contains more than ${MAX_PROFILES} hunters.`,
      );
    }
    const safetyError = inspectJsonSafety(profiles);
    if (safetyError) return resultError('unsafe_data', safetyError);

    for (const [profileId, profile] of entries) {
      if (!SAFE_ID.test(profileId)) {
        return resultError('invalid_profile_id', `Hunter key "${profileId}" is not valid.`);
      }
      if (!isPlainRecord(profile)) {
        return resultError('invalid_profile', `Hunter "${profileId}" is not a JSON object.`);
      }
      if (profile.id !== profileId) {
        return resultError(
          'profile_id_mismatch',
          `Hunter key "${profileId}" does not match its stored ID.`,
        );
      }
      if (!CLASS_IDS.has(profile.classId)) {
        return resultError(
          'invalid_class',
          `Hunter "${profileId}" has an unknown class.`,
        );
      }
      if (
        typeof profile.name !== 'string' ||
        profile.name.trim().length === 0 ||
        profile.name.length > 32
      ) {
        return resultError(
          'invalid_name',
          `Hunter "${profileId}" has an invalid name.`,
        );
      }
      if (!SAFE_ID.test(profile.id)) {
        return resultError('invalid_profile_id', `Hunter "${profileId}" has an invalid ID.`);
      }
      const stack = [profile];
      while (stack.length) {
        const current = stack.pop();
        if (!current || typeof current !== 'object') continue;
        if (
          isPlainRecord(current) &&
          Object.hasOwn(current, 'id') &&
          typeof current.id === 'string' &&
          !SAFE_ID.test(current.id)
        ) {
          return resultError(
            'invalid_nested_id',
            `Hunter "${profileId}" contains an unsafe object ID.`,
          );
        }
        for (const child of Object.values(current)) {
          if (child && typeof child === 'object') stack.push(child);
        }
      }
    }
    return { ok: true, profiles };
  }

  function parseCollectionText(raw) {
    if (raw === null || raw === '') return { ok: true, profiles: {}, raw };
    if (typeof raw !== 'string') {
      return resultError('invalid_raw', 'Stored save data is not text.', { raw: null });
    }
    if (byteLength(raw) > MAX_IMPORT_BYTES) {
      return resultError('save_too_large', 'Stored save data exceeds the safe size limit.', { raw });
    }
    let profiles;
    try {
      profiles = JSON.parse(raw);
    } catch (error) {
      return resultError('invalid_json', 'Stored save data is not valid JSON.', { raw, error });
    }
    const validation = validateProfileCollection(profiles);
    if (!validation.ok) return { ...validation, raw };
    return { ok: true, profiles, raw };
  }

  function readProfiles(storage) {
    let raw;
    try {
      raw = storage.getItem(PROFILE_KEY);
    } catch (error) {
      return resultError('storage_read_failed', 'The browser blocked access to local saves.', {
        raw: null,
        error,
      });
    }
    return parseCollectionText(raw);
  }

  function normalizeItem(item, slot = null) {
    if (!item || typeof item !== 'object') return item;
    if (item.type === 'armor') item.type = 'chest';
    if (item.type === 'charm') item.type = 'necklace';
    if (item.type === 'ring1' || item.type === 'ring2') {
      item.equipSlot = item.type;
      item.type = 'ring';
    }
    if (slot && EQUIPMENT_SLOTS.includes(slot)) item.equipSlot = slot;
    return item;
  }

  function normalizeArmory(profile) {
    const oldEquipment = isPlainRecord(profile.equipment) ? profile.equipment : {};
    const equipment = Object.fromEntries(EQUIPMENT_SLOTS.map((slot) => [slot, null]));
    if (oldEquipment.weapon) equipment.weapon = normalizeItem(oldEquipment.weapon, 'weapon');
    if (oldEquipment.chest || oldEquipment.armor) {
      equipment.chest = normalizeItem(oldEquipment.chest || oldEquipment.armor, 'chest');
    }
    if (oldEquipment.necklace || oldEquipment.charm) {
      equipment.necklace = normalizeItem(
        oldEquipment.necklace || oldEquipment.charm,
        'necklace',
      );
    }
    for (const slot of EQUIPMENT_SLOTS) {
      if (oldEquipment[slot] && !equipment[slot]) {
        equipment[slot] = normalizeItem(oldEquipment[slot], slot);
      }
    }
    const equippedIds = new Set(
      Object.values(equipment)
        .filter((item) => item && typeof item.id === 'string')
        .map((item) => item.id),
    );
    for (const [legacyKey, canonicalKey] of [
      ['armor', 'chest'],
      ['charm', 'necklace'],
    ]) {
      const displaced = oldEquipment[legacyKey];
      if (
        displaced &&
        displaced !== oldEquipment[canonicalKey] &&
        typeof displaced.id === 'string' &&
        !equippedIds.has(displaced.id) &&
        !profile.inventory.some((item) => item?.id === displaced.id)
      ) {
        const recovered = normalizeItem(displaced);
        recovered.equipSlot = null;
        profile.inventory.push(recovered);
      }
    }
    for (const [key, value] of Object.entries(oldEquipment)) {
      if (!EQUIPMENT_SLOTS.includes(key) && key !== 'armor' && key !== 'charm') {
        equipment[key] = value;
      }
    }
    equipment.armor = null;
    equipment.charm = null;
    profile.equipment = equipment;
    profile.inventory.forEach((item) => normalizeItem(item));
    for (const loadout of Object.values(profile.loadouts)) {
      if (!loadout || typeof loadout !== 'object') continue;
      if (loadout.armor && !loadout.chest) {
        loadout.chest = loadout.armor;
        delete loadout.armor;
      }
      if (loadout.charm && !loadout.necklace) {
        loadout.necklace = loadout.charm;
        delete loadout.charm;
      }
    }
  }

  function normalizeProfileV014(source, options = {}) {
    const profile = options.clone === false ? source : cloneJson(source);
    profile.level = finiteNumber(profile.level, 1);
    profile.xp = finiteNumber(profile.xp, 0);
    profile.gold = finiteNumber(profile.gold, 0);
    profile.materials = isPlainRecord(profile.materials) ? profile.materials : {};
    profile.materials.common = finiteNumber(profile.materials.common, 0);
    profile.materials.rare = finiteNumber(profile.materials.rare, 0);
    profile.classMastery = isPlainRecord(profile.classMastery) ? profile.classMastery : {};
    profile.classMastery[profile.classId] = finiteNumber(
      profile.classMastery[profile.classId],
      0,
    );
    profile.skillXp = isPlainRecord(profile.skillXp) ? profile.skillXp : {};
    profile.skillXp[profile.classId] = isPlainRecord(profile.skillXp[profile.classId])
      ? profile.skillXp[profile.classId]
      : {};
    profile.skillXp[profile.classId].s1 = finiteNumber(profile.skillXp[profile.classId].s1, 0);
    profile.skillXp[profile.classId].s2 = finiteNumber(profile.skillXp[profile.classId].s2, 0);

    const arrayDefaults = {
      talents: [],
      ascentNodes: [],
      inventory: [],
      discoveredDelvesV132: ['embercellar'],
      relicsFound: [],
      mythicsFound: [],
      trophies: [],
      titles: ['Hunter'],
    };
    for (const [key, fallback] of Object.entries(arrayDefaults)) {
      if (!Array.isArray(profile[key])) profile[key] = cloneJson(fallback);
    }

    const recordDefaults = [
      'loadoutNamesV131',
      'huntQuestClaims',
      'contractTiers',
      'monsterMastery',
      'monsterParts',
      'nemeses',
      'bestScores',
      'bestTimes',
      'loadouts',
      'dropPity',
      'companyClaims',
      'wagerStats',
      'merchantStocks',
    ];
    for (const key of recordDefaults) {
      if (!isPlainRecord(profile[key])) profile[key] = {};
    }

    profile.trackedRecipeV131 = profile.trackedRecipeV131 || null;
    profile.autoPotionV131 = Boolean(profile.autoPotionV131);
    profile.selectedSpec = profile.selectedSpec || null;
    profile.ascension = finiteNumber(profile.ascension, 0);
    profile.ashMarks = finiteNumber(profile.ashMarks, 0);
    profile.deathCache = profile.deathCache || null;
    profile.dropPity.relic = finiteNumber(profile.dropPity.relic, 0);
    profile.dropPity.mythic = finiteNumber(profile.dropPity.mythic, 0);
    profile.companyName = profile.companyName || null;
    profile.selectedTitle = profile.selectedTitle || 'Hunter';
    Object.assign(profile.wagerStats, {
      hands: finiteNumber(profile.wagerStats.hands, 0),
      wins: finiteNumber(profile.wagerStats.wins, 0),
      losses: finiteNumber(profile.wagerStats.losses, 0),
      net: finiteNumber(profile.wagerStats.net, 0),
      bestWin: finiteNumber(profile.wagerStats.bestWin, 0),
      perfects: finiteNumber(profile.wagerStats.perfects, 0),
    });

    profile.lifetime = isPlainRecord(profile.lifetime) ? profile.lifetime : {};
    for (const key of [
      'runs',
      'success',
      'wipes',
      'bosses',
      'kills',
      'elites',
      'bestDepth',
      'totalDepths',
      'huntStreak',
      'bestStreak',
      'flawless',
      'nemesisKills',
      'partsBroken',
    ]) {
      profile.lifetime[key] = finiteNumber(profile.lifetime[key], 0);
    }

    if (isPlainRecord(profile.worldV14)) {
      if (!Array.isArray(profile.worldV14.discoveredRegions)) {
        profile.worldV14.discoveredRegions = ['emberwood'];
      }
      if (!isPlainRecord(profile.worldV14.contracts)) profile.worldV14.contracts = {};
      for (const key of ['wolves', 'resources', 'elites']) {
        profile.worldV14.contracts[key] = finiteNumber(profile.worldV14.contracts[key], 0);
      }
      if (!isPlainRecord(profile.worldV14.contractsClaimed)) {
        profile.worldV14.contractsClaimed = {};
      }
      if (!Array.isArray(profile.worldV14.waypoints)) {
        profile.worldV14.waypoints = ['emberwatch'];
      }
      profile.worldV14.enteredLowlands = Boolean(profile.worldV14.enteredLowlands);
      profile.worldV14.surfaceClears = finiteNumber(profile.worldV14.surfaceClears, 0);
    }

    normalizeArmory(profile);
    return profile;
  }

  function normalizeCollectionV014(profiles) {
    return Object.fromEntries(
      Object.entries(profiles).map(([id, profile]) => [id, normalizeProfileV014(profile)]),
    );
  }

  function createExportEnvelope(profiles, options = {}) {
    const validation = validateProfileCollection(profiles);
    if (!validation.ok) return validation;
    return {
      ok: true,
      envelope: {
        format: EXPORT_FORMAT,
        formatVersion: FORMAT_VERSION,
        gameVersion: GAME_VERSION,
        exportedAt: (options.now || new Date()).toISOString(),
        profileKey: PROFILE_KEY,
        profiles: cloneJson(profiles),
      },
    };
  }

  function stringifyExport(profiles, options = {}) {
    const created = createExportEnvelope(profiles, options);
    if (!created.ok) return created;
    return { ok: true, text: `${JSON.stringify(created.envelope, null, 2)}\n` };
  }

  function parseImportText(text) {
    if (typeof text !== 'string') {
      return resultError('invalid_import', 'The selected backup is not readable text.');
    }
    if (byteLength(text) > MAX_IMPORT_BYTES) {
      return resultError('import_too_large', 'The selected backup exceeds the 4 MB limit.');
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      return resultError('invalid_json', 'The selected backup is not valid JSON.', { error });
    }

    let profiles;
    let source = 'legacy-roster';
    if (isPlainRecord(parsed) && Object.hasOwn(parsed, 'format')) {
      if (parsed.format !== EXPORT_FORMAT) {
        return resultError('unknown_format', 'This file is not an ASHFALL hunter backup.');
      }
      if (parsed.formatVersion !== FORMAT_VERSION) {
        return resultError(
          'unsupported_version',
          `Backup format version ${String(parsed.formatVersion)} is not supported.`,
        );
      }
      profiles = parsed.profiles;
      source = 'backup-v1';
    } else if (
      isPlainRecord(parsed) &&
      typeof parsed.id === 'string' &&
      typeof parsed.name === 'string' &&
      typeof parsed.classId === 'string'
    ) {
      profiles = { [parsed.id]: parsed };
      source = 'legacy-profile';
    } else {
      profiles = parsed;
    }

    const validation = validateProfileCollection(profiles);
    if (!validation.ok) return validation;
    const normalizedProfiles = normalizeCollectionV014(profiles);
    const normalizedValidation = validateProfileCollection(normalizedProfiles);
    if (!normalizedValidation.ok) return normalizedValidation;
    return {
      ok: true,
      source,
      profiles: normalizedProfiles,
      count: Object.keys(normalizedProfiles).length,
    };
  }

  function sameJson(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  function planProfileMerge(existingProfiles, importedProfiles) {
    let added = 0;
    let duplicates = 0;
    let conflicts = 0;
    for (const [id, imported] of Object.entries(importedProfiles)) {
      if (!Object.hasOwn(existingProfiles, id)) added += 1;
      else if (sameJson(existingProfiles[id], imported)) duplicates += 1;
      else conflicts += 1;
    }
    return {
      added,
      duplicates,
      conflicts,
      total: Object.keys(importedProfiles).length,
      resultingTotal: Object.keys(existingProfiles).length + added + conflicts,
    };
  }

  function nextConflictId(originalId, usedIds, makeId) {
    for (let attempt = 0; attempt < 32; attempt += 1) {
      const candidate = String(makeId());
      if (SAFE_ID.test(candidate) && !usedIds.has(candidate)) return candidate;
    }
    for (let index = 1; index < 10000; index += 1) {
      const candidate = `${originalId.slice(0, 120)}-recovered-${index}`;
      if (!usedIds.has(candidate)) return candidate;
    }
    throw new Error('Unable to allocate a safe recovered hunter ID.');
  }

  function mergeProfileCollections(existingProfiles, importedProfiles, options = {}) {
    const makeId =
      options.makeId ||
      (() =>
        root.crypto?.randomUUID?.() ||
        `recovered-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const merged = cloneJson(existingProfiles);
    const usedIds = new Set(Object.keys(merged));
    const result = { profiles: merged, added: [], duplicates: [], conflicts: [] };

    for (const [id, imported] of Object.entries(importedProfiles)) {
      if (!Object.hasOwn(merged, id)) {
        merged[id] = cloneJson(imported);
        usedIds.add(id);
        result.added.push(id);
        continue;
      }
      if (sameJson(merged[id], imported)) {
        result.duplicates.push(id);
        continue;
      }
      const recoveredId = nextConflictId(id, usedIds, makeId);
      const recovered = cloneJson(imported);
      recovered.id = recoveredId;
      recovered.name = `${recovered.name} (Recovered)`.slice(0, 32);
      merged[recoveredId] = recovered;
      usedIds.add(recoveredId);
      result.conflicts.push({ originalId: id, recoveredId });
    }
    return result;
  }

  function makeRecoveryEnvelope(raw, options = {}) {
    return {
      format: RECOVERY_FORMAT,
      formatVersion: FORMAT_VERSION,
      savedAt: (options.now || new Date()).toISOString(),
      reason: options.reason || 'before-change',
      profileKey: PROFILE_KEY,
      raw: raw === null || raw === '' ? '{}' : raw,
    };
  }

  function writeRecoverySnapshot(storage, raw, options = {}) {
    const envelope = makeRecoveryEnvelope(raw, options);
    try {
      storage.setItem(RECOVERY_KEY, JSON.stringify(envelope));
    } catch (error) {
      return resultError(
        'backup_write_failed',
        'ASHFALL could not create a recovery snapshot, so no save changes were made.',
        { error },
      );
    }
    return { ok: true, envelope };
  }

  function readRecovery(storage) {
    let raw;
    try {
      raw = storage.getItem(RECOVERY_KEY);
    } catch (error) {
      return resultError('storage_read_failed', 'The browser blocked recovery storage.', { error });
    }
    if (!raw) return resultError('no_recovery', 'No automatic recovery snapshot exists yet.');
    let envelope;
    try {
      envelope = JSON.parse(raw);
    } catch (error) {
      return resultError('invalid_recovery', 'The recovery snapshot is not valid JSON.', { error });
    }
    if (
      !isPlainRecord(envelope) ||
      envelope.format !== RECOVERY_FORMAT ||
      envelope.formatVersion !== FORMAT_VERSION ||
      typeof envelope.raw !== 'string'
    ) {
      return resultError('invalid_recovery', 'The recovery snapshot format is not supported.');
    }
    const parsed = parseCollectionText(envelope.raw);
    if (!parsed.ok) {
      return resultError('invalid_recovery', 'The recovery snapshot contains invalid save data.');
    }
    return {
      ok: true,
      envelope,
      profiles: normalizeCollectionV014(parsed.profiles),
      count: Object.keys(parsed.profiles).length,
    };
  }

  function writeProfiles(storage, profiles, options = {}) {
    const current = readProfiles(storage);
    if (!current.ok) {
      return resultError(
        'corrupt_current_save',
        'Current local save data is unreadable. Export the raw recovery file before changing it.',
        { current },
      );
    }
    if (Object.hasOwn(options, 'expectedRaw') && current.raw !== options.expectedRaw) {
      return resultError(
        'stale_preview',
        'Local saves changed in another tab. Review the latest roster before trying again.',
        { current },
      );
    }
    const validation = validateProfileCollection(profiles);
    if (!validation.ok) return validation;
    let serialized;
    try {
      serialized = JSON.stringify(profiles);
    } catch (error) {
      return resultError('serialize_failed', 'The hunter roster could not be serialized.', { error });
    }

    if (options.backupCurrent) {
      const backup = writeRecoverySnapshot(storage, current.raw, options);
      if (!backup.ok) return backup;
    }
    try {
      storage.setItem(PROFILE_KEY, serialized);
    } catch (error) {
      return resultError('storage_write_failed', 'The browser could not save the hunter roster.', {
        error,
      });
    }
    return { ok: true, profiles, raw: serialized };
  }

  function importProfiles(storage, importedProfiles, options = {}) {
    const current = readProfiles(storage);
    if (!current.ok) {
      return resultError(
        'corrupt_current_save',
        'Current local save data is unreadable. Import is blocked to prevent data loss.',
        { current },
      );
    }
    if (Object.hasOwn(options, 'expectedRaw') && current.raw !== options.expectedRaw) {
      return resultError(
        'stale_preview',
        'Local saves changed after the import preview. Preview the file again before applying it.',
        { current },
      );
    }
    const validation = validateProfileCollection(importedProfiles);
    if (!validation.ok) return validation;
    const normalizedExisting = normalizeCollectionV014(current.profiles);
    const normalizedExistingValidation = validateProfileCollection(normalizedExisting);
    if (!normalizedExistingValidation.ok) return normalizedExistingValidation;
    const merged = mergeProfileCollections(normalizedExisting, importedProfiles, options);
    const written = writeProfiles(storage, merged.profiles, {
      backupCurrent: true,
      reason: options.reason || 'before-import',
      now: options.now,
      expectedRaw: current.raw,
    });
    if (!written.ok) return written;
    return { ok: true, ...merged };
  }

  function restoreRecovery(storage, options = {}) {
    const recovery = readRecovery(storage);
    if (!recovery.ok) return recovery;
    const current = readProfiles(storage);
    if (Object.hasOwn(options, 'expectedRaw') && current.raw !== options.expectedRaw) {
      return resultError(
        'stale_preview',
        'Local saves changed after the recovery preview. Review the snapshot again.',
        { current },
      );
    }
    if (current.ok) {
      return importProfiles(storage, recovery.profiles, {
        ...options,
        expectedRaw: current.raw,
        reason: 'before-recovery-merge',
      });
    }
    if (typeof current.raw !== 'string') {
      return resultError(
        'storage_read_failed',
        'The browser did not expose the unreadable save bytes, so recovery cannot proceed safely.',
      );
    }
    const quarantine = makeRecoveryEnvelope(current.raw, {
      now: options.now,
      reason: 'corrupt-save-quarantine',
    });
    try {
      storage.setItem(QUARANTINE_KEY, JSON.stringify(quarantine));
    } catch (error) {
      return resultError(
        'quarantine_write_failed',
        'ASHFALL could not preserve the unreadable bytes, so recovery made no changes.',
        { error },
      );
    }
    try {
      storage.setItem(PROFILE_KEY, recovery.envelope.raw);
    } catch (error) {
      return resultError(
        'storage_write_failed',
        'The recovery snapshot could not be restored. The unreadable save remains unchanged.',
        { error },
      );
    }
    return {
      ok: true,
      profiles: recovery.profiles,
      added: Object.keys(recovery.profiles),
      duplicates: [],
      conflicts: [],
      restoredCorrupt: true,
      quarantinedRaw: current.raw,
    };
  }

  root.AshfallSaveSystem = Object.freeze({
    PROFILE_KEY,
    RECOVERY_KEY,
    QUARANTINE_KEY,
    EXPORT_FORMAT,
    FORMAT_VERSION,
    GAME_VERSION,
    MAX_IMPORT_BYTES,
    MAX_PROFILES,
    EQUIPMENT_SLOTS: Object.freeze([...EQUIPMENT_SLOTS]),
    validateProfileCollection,
    parseCollectionText,
    readProfiles,
    normalizeProfileV014,
    normalizeCollectionV014,
    createExportEnvelope,
    stringifyExport,
    parseImportText,
    planProfileMerge,
    mergeProfileCollections,
    writeRecoverySnapshot,
    readRecovery,
    writeProfiles,
    importProfiles,
    restoreRecovery,
  });
})(globalThis);
