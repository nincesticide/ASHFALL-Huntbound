import { webcrypto } from "node:crypto";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const helpersDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(helpersDirectory, "..", "..");
const gameSourcePath = join(projectRoot, "js", "game.js");
const supportSourcePaths = [
  join(projectRoot, "js", "save-system.js"),
  join(projectRoot, "js", "world-contracts.js"),
];

const bootAnchor =
  "initInterfaceV132();wireSkillTooltips();renderSavedCharacters();renderClassGrid();mobileCharacterSelectInit();drawCamp();renderAll();requestAnimationFrame(spriteAnimationLoop);";

// This code is injected into an in-memory copy of game.js. It is never written to,
// bundled with, or served by the production game.
const testBridgeSource = String.raw`
if (globalThis.__ASHFALL_TEST_MODE__) {
  let testTransportSequence = 0;
  const testOutbox = [];
  send = message => {
    const event = {
      ...structuredCloneSafe(message),
      _transportId: peerId + ':test:' + (++testTransportSequence),
      _senderPeerId: peerId,
    };
    rememberTransportEventV141(event._transportId);
    testOutbox.push(event);
    return event;
  };
  broadcastSnapshot = () => {
    if (isHost && room) {
      room.stateVersionV146 = (Number.isSafeInteger(room.stateVersionV146) ? room.stateVersionV146 : 0) + 1;
      send({ type: 'snapshot', stateVersion: room.stateVersionV146, room });
    }
    snapshot = structuredCloneSafe(room);
  };
  renderAll = () => {};
  renderLobby = () => {};
  renderProfile = () => {};
  renderSavedCharacters = () => {};
  flashSavedV131 = () => {};
  hide = () => {};
  show = () => {};
  toast = () => {};
  notifyV11 = () => {};
  flowBannerV13 = () => {};
  beep = () => {};
  rollMerchantAfterHunt = () => {};
  showSummary = settlement => { lastSummary = structuredCloneSafe(settlement); };

  function createTestHunter(name, classId, role) {
    profile = newProfile(name, classId);
    ensureProfileShape(profile);
    const stored = readProfileStorageV144();
    if (!stored.ok) throw new Error('Unable to read test hunter storage.');
    stored.profiles[profile.id] = profile;
    if (!saveProfiles(stored.profiles, { expectedRaw: stored.raw })) throw new Error('Unable to persist the test hunter.');
    isHost = role !== 'guest';
    roomCode = 'TEST01';
    bc = { close() {} };
    room = null;
    snapshot = null;
    lastSummary = null;
    if (role !== 'guest') {
      room = {
        code: roomCode,
        hostPeerId: peerId,
        players: {},
        missionId: 'frontier',
        delveId: null,
        difficulty: 'normal',
        run: null,
        log: [],
        merchant: { active: false, misses: 0 }
      };
      room.players[peerId] = playerJoinPayload();
      room.players[peerId].campX = 14;
      room.players[peerId].campY = 15;
      snapshot = structuredCloneSafe(room);
    }
    testOutbox.length = 0;
    return peerId;
  }

  globalThis.__ASHFALL_TEST_API__ = Object.freeze({
    createSoloHunter(name = 'Route Tester', classId = 'warden') {
      return createTestHunter(name, classId, 'host');
    },
    createGuestHunter(name = 'Guest Tester', classId = 'ranger') {
      return createTestHunter(name, classId, 'guest');
    },
    loadStoredHunter(profileId, role = 'host') {
      const stored = readProfileStorageV144();
      profile = stored.ok ? stored.profiles[profileId] : null;
      if (!profile) throw new Error('Stored hunter was not found.');
      ensureProfileShape(profile);
      isHost = role !== 'guest';
      roomCode = 'TEST01';
      bc = { close() {} };
      room = null;
      snapshot = null;
      lastSummary = null;
      testOutbox.length = 0;
      return peerId;
    },
    readState() {
      return structuredCloneSafe({ peerId, profile, room, snapshot, lastSummary, isHost, roomCode });
    },
    readSavedProfiles() {
      return structuredCloneSafe(loadProfiles());
    },
    joinPayload() {
      return structuredCloneSafe(playerJoinPayload());
    },
    receiveEvent(event) {
      receiveTransportEventV141(structuredCloneSafe(event));
    },
    drainOutbox() {
      return testOutbox.splice(0).map(structuredCloneSafe);
    },
    placeCampPlayer(x, y, playerId = peerId) {
      const player = room?.players?.[playerId];
      if (!player) throw new Error('Create a solo hunter before placing the camp player.');
      player.campX = x;
      player.campY = y;
    },
    placeWorldPlayer(x, y, playerId = peerId) {
      const player = room?.players?.[playerId];
      if (!player) throw new Error('Create a solo hunter before placing the world player.');
      player.worldX = x;
      player.worldY = y;
    },
    enterWorld() {
      return enterWorldV14(peerId);
    },
    interactWorld(objectId, autoAttack = false) {
      return hostWorldInteractV141(peerId, objectId, autoAttack);
    },
    selectExpedition(missionId = 'frontier', delveId = null) {
      if (!room || !isHost) throw new Error('Only a host room can select an expedition.');
      room.missionId = missionId;
      room.delveId = delveId;
    },
    toggleReady() {
      return toggleReady();
    },
    launchExpedition() {
      return launchExpedition();
    },
    patchRunLoot(playerId, patch) {
      const player = room?.run?.players?.[playerId];
      if (!player) throw new Error('Run player was not found.');
      const next = structuredCloneSafe(patch);
      for (const [key, value] of Object.entries(next)) {
        if (value && typeof value === 'object' && !Array.isArray(value) && player.runLoot[key] && typeof player.runLoot[key] === 'object' && !Array.isArray(player.runLoot[key])) player.runLoot[key] = { ...player.runLoot[key], ...value };
        else player.runLoot[key] = value;
      }
    },
    finishCurrentStage() {
      const run = room?.run;
      if (!run) throw new Error('Launch a run before finishing a stage.');
      run.enemies.forEach(enemy => { enemy.hp = 0; });
      return onStageClear(run);
    },
    forceDelveComplete() {
      const run = room?.run;
      if (!run?.isDelve) throw new Error('Launch a Delve before forcing its final clear.');
      run.depth = runDepthLimit(run);
      run.enemies.forEach(enemy => { enemy.hp = 0; });
      return onStageClear(run);
    },
    forceDeepHuntBossClear() {
      const run = room?.run;
      if (!run?.deepHunt?.active) throw new Error('Launch a Deep Hunt before forcing its boss clear.');
      run.deepHunt.currentNode = { id: 'test-boss', type: 'boss', name: 'Direfang Den', canExtract: false };
      run.deepHunt.history.push(structuredCloneSafe(run.deepHunt.currentNode));
      run.deepHunt.bossRevealed = true;
      run.depth = runDepthLimit(run);
      run.enemies.forEach(enemy => { enemy.hp = 0; });
      return onStageClear(run);
    },
    openExtractionWindow(safe = true) {
      const run = room?.run;
      if (!run?.deepHunt?.active) throw new Error('Launch a Deep Hunt before opening extraction.');
      run.phase = 'choice';
      run.cleared = true;
      run.votes = {};
      run.deepHunt.currentNode = { ...(run.deepHunt.currentNode || {}), canExtract: !!safe };
      broadcastSnapshot();
    },
    vote(choice) {
      if (isHost) return hostVote(peerId, choice);
      return send({ type: 'vote', peerId, vote: choice });
    },
    leaveRoom() {
      return leaveRoom(true);
    },
    returnFromSummary() {
      return returnToCampFromSummaryV142();
    },
    craftHuntRecipe(recipeId) {
      return craftHuntRecipeV131(recipeId);
    },
    retrySettlement() {
      return commitPendingSettlementV145();
    },
    forcePartyWipe() {
      const run = room?.run;
      const player = run?.players?.[peerId];
      if (!run || !player) throw new Error('Launch a run before forcing a party wipe.');
      player.downs = player.classId === 'berserker' && player.talents.includes('undying') ? 3 : 2;
      player.hp = 0;
      downPlayer(run, player);
      return checkWipe(run);
    }
  });
  return;
}
`;

function cloneIntoHostRealm(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [String(key), String(value)]));
  const failedKeys = new Set();
  return {
    getItem(key) {
      return values.has(String(key)) ? values.get(String(key)) : null;
    },
    setItem(key, value) {
      if (failedKeys.has(String(key))) throw new Error(`Injected storage failure for ${String(key)}`);
      values.set(String(key), String(value));
    },
    removeItem(key) {
      values.delete(String(key));
    },
    clear() {
      values.clear();
    },
    failWritesFor(key) {
      failedKeys.add(String(key));
    },
    allowWritesFor(key) {
      failedKeys.delete(String(key));
    },
    snapshot() {
      return Object.fromEntries(values);
    },
  };
}

function createClassList() {
  const names = new Set();
  return {
    add(...tokens) {
      tokens.forEach((token) => names.add(token));
    },
    remove(...tokens) {
      tokens.forEach((token) => names.delete(token));
    },
    toggle(token, force) {
      const enabled = force == null ? !names.has(token) : Boolean(force);
      if (enabled) names.add(token);
      else names.delete(token);
      return enabled;
    },
    contains(token) {
      return names.has(token);
    },
  };
}

function createCanvasContext() {
  const noop = () => {};
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "measureText") return () => ({ width: 0 });
        if (property === "createLinearGradient" || property === "createRadialGradient") {
          return () => ({ addColorStop: noop });
        }
        return noop;
      },
      set() {
        return true;
      },
    },
  );
}

function createBrowserShim(options = {}) {
  const context2d = createCanvasContext();
  const elements = new Map();

  function makeElement(id = "") {
    const children = [];
    const element = {
      id,
      className: "",
      classList: createClassList(),
      dataset: {},
      style: { setProperty() {} },
      width: 960,
      height: 608,
      textContent: "",
      innerHTML: "",
      disabled: false,
      checked: false,
      value: "",
      children,
      getContext() {
        return context2d;
      },
      addEventListener() {},
      removeEventListener() {},
      setAttribute() {},
      removeAttribute() {},
      appendChild(child) {
        children.push(child);
        return child;
      },
      prepend(child) {
        children.unshift(child);
        return child;
      },
      remove() {},
      insertAdjacentHTML() {},
      scrollIntoView() {},
      querySelector() {
        return makeElement();
      },
      querySelectorAll() {
        return [];
      },
      getBoundingClientRect() {
        return { left: 0, top: 0, width: 960, height: 608 };
      },
      get lastElementChild() {
        return children.at(-1) ?? null;
      },
      get offsetWidth() {
        return 960;
      },
    };
    return element;
  }

  function getElement(id) {
    if (!elements.has(id)) elements.set(id, makeElement(id));
    return elements.get(id);
  }

  class FakeImage {
    constructor() {
      this.complete = false;
      this.naturalWidth = 0;
      this.onload = null;
    }

    set src(value) {
      this.source = value;
    }

    get src() {
      return this.source;
    }
  }

  const localStorage = options.localStorage || createMemoryStorage();
  const sessionStorage = options.sessionStorage || createMemoryStorage();
  const document = {
    body: getElement("body"),
    activeElement: null,
    getElementById: getElement,
    createElement: () => makeElement(),
    querySelector: () => makeElement(),
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {},
  };

  return {
    document,
    Image: FakeImage,
    localStorage,
    sessionStorage,
    elements,
  };
}

function createDeterministicMath(seed = 0x14_00_142) {
  let state = seed >>> 0;
  const deterministicMath = Object.create(Math);
  Object.defineProperty(deterministicMath, "random", {
    value() {
      state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
      return state / 0x1_0000_0000;
    },
  });
  return deterministicMath;
}

function createVmContext(options = {}) {
  const browser = createBrowserShim(options);
  const noop = () => {};
  const sandbox = {
    __ASHFALL_TEST_MODE__: true,
    ...browser,
    crypto: webcrypto,
    performance,
    Math: createDeterministicMath(options.seed),
    Date,
    TextEncoder,
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    requestAnimationFrame: noop,
    cancelAnimationFrame: noop,
    addEventListener: noop,
    removeEventListener: noop,
    navigator: {
      clipboard: {
        writeText: async () => {},
      },
    },
    location: { hash: "", href: "http://ashfall.test/game/index.html" },
    confirm: () => true,
    prompt: () => "",
    alert: noop,
    btoa: (value) => Buffer.from(String(value), "binary").toString("base64"),
    atob: (value) => Buffer.from(String(value), "base64").toString("binary"),
    unescape,
    encodeURIComponent,
    AudioContext: class FakeAudioContext {},
    BroadcastChannel: class FakeBroadcastChannel {
      postMessage() {}
      close() {}
    },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  return vm.createContext(sandbox);
}

export async function createGameRuntimeHarness(options = {}) {
  const [productionSource, ...supportSources] = await Promise.all([
    readFile(gameSourcePath, "utf8"),
    ...supportSourcePaths.map((sourcePath) => readFile(sourcePath, "utf8")),
  ]);
  const anchorCount = productionSource.split(bootAnchor).length - 1;
  if (anchorCount !== 1) {
    throw new Error(`Expected one ASHFALL boot anchor, found ${anchorCount}.`);
  }

  const instrumentedSource = productionSource.replace(
    bootAnchor,
    `${testBridgeSource}\n${bootAnchor}`,
  );
  const localStorage = options.localStorage || createMemoryStorage();
  const sessionStorage = options.sessionStorage || createMemoryStorage();
  if (options.peerId) sessionStorage.setItem('ashfall_mp_peer_id', options.peerId);
  const context = createVmContext({ localStorage, sessionStorage, seed: options.seed });
  supportSources.forEach((supportSource, index) => {
    vm.runInContext(supportSource, context, {
      filename: supportSourcePaths[index],
      timeout: 5_000,
    });
  });
  vm.runInContext(instrumentedSource, context, {
    filename: gameSourcePath,
    timeout: 5_000,
  });

  const api = context.__ASHFALL_TEST_API__;
  if (!api) throw new Error("ASHFALL test bridge did not initialize.");

  return Object.freeze({
    createSoloHunter(name, classId) {
      return api.createSoloHunter(name, classId);
    },
    createGuestHunter(name, classId) {
      return api.createGuestHunter(name, classId);
    },
    loadStoredHunter(profileId, { role = 'host' } = {}) {
      return api.loadStoredHunter(profileId, role);
    },
    readState() {
      return cloneIntoHostRealm(api.readState());
    },
    readSavedProfiles() {
      return cloneIntoHostRealm(api.readSavedProfiles());
    },
    joinPayload() {
      return cloneIntoHostRealm(api.joinPayload());
    },
    receiveEvent(event) {
      api.receiveEvent(cloneIntoHostRealm(event));
    },
    drainOutbox() {
      return cloneIntoHostRealm(api.drainOutbox());
    },
    placeCampPlayer(x, y) {
      api.placeCampPlayer(x, y);
    },
    placeWorldPlayer(x, y) {
      api.placeWorldPlayer(x, y);
    },
    enterWorld() {
      api.enterWorld();
    },
    interactWorld(objectId, { autoAttack = false } = {}) {
      api.interactWorld(objectId, autoAttack);
    },
    forcePartyWipe() {
      return api.forcePartyWipe();
    },
    selectExpedition(missionId, delveId) {
      api.selectExpedition(missionId, delveId);
    },
    toggleReady() {
      api.toggleReady();
    },
    launchExpedition() {
      api.launchExpedition();
    },
    patchRunLoot(playerId, patch) {
      api.patchRunLoot(playerId, cloneIntoHostRealm(patch));
    },
    finishCurrentStage() {
      return api.finishCurrentStage();
    },
    forceDelveComplete() {
      return api.forceDelveComplete();
    },
    forceDeepHuntBossClear() {
      return api.forceDeepHuntBossClear();
    },
    openExtractionWindow({ safe = true } = {}) {
      api.openExtractionWindow(safe);
    },
    vote(choice) {
      return api.vote(choice);
    },
    leaveRoom() {
      return api.leaveRoom();
    },
    returnFromSummary() {
      return api.returnFromSummary();
    },
    craftHuntRecipe(recipeId) {
      return cloneIntoHostRealm(api.craftHuntRecipe(recipeId));
    },
    retrySettlement() {
      return api.retrySettlement();
    },
    localStorage,
    sessionStorage,
  });
}
