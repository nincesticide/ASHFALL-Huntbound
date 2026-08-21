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
  broadcastSnapshot = () => { snapshot = structuredCloneSafe(room); };
  renderAll = () => {};
  renderLobby = () => {};
  renderProfile = () => {};
  persistProfile = () => {};
  hide = () => {};
  show = () => {};
  toast = () => {};
  notifyV11 = () => {};
  flowBannerV13 = () => {};
  beep = () => {};
  rollMerchantAfterHunt = () => {};
  applySettlement = settlement => { lastSummary = structuredCloneSafe(settlement); };

  globalThis.__ASHFALL_TEST_API__ = Object.freeze({
    createSoloHunter(name = 'Route Tester', classId = 'warden') {
      profile = newProfile(name, classId);
      ensureProfileShape(profile);
      isHost = true;
      room = {
        code: 'TEST01',
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
      snapshot = structuredCloneSafe(room);
      lastSummary = null;
      return peerId;
    },
    readState() {
      return structuredCloneSafe({ peerId, profile, room, snapshot, lastSummary });
    },
    placeCampPlayer(x, y) {
      const player = room?.players?.[peerId];
      if (!player) throw new Error('Create a solo hunter before placing the camp player.');
      player.campX = x;
      player.campY = y;
    },
    placeWorldPlayer(x, y) {
      const player = room?.players?.[peerId];
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

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(String(key)) ? values.get(String(key)) : null;
    },
    setItem(key, value) {
      values.set(String(key), String(value));
    },
    removeItem(key) {
      values.delete(String(key));
    },
    clear() {
      values.clear();
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

function createBrowserShim() {
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

  const localStorage = createMemoryStorage();
  const sessionStorage = createMemoryStorage();
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

function createVmContext() {
  const browser = createBrowserShim();
  const noop = () => {};
  const sandbox = {
    __ASHFALL_TEST_MODE__: true,
    ...browser,
    crypto: webcrypto,
    performance,
    Math: createDeterministicMath(),
    Date,
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

export async function createGameRuntimeHarness() {
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
  const context = createVmContext();
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
    readState() {
      return cloneIntoHostRealm(api.readState());
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
  });
}
