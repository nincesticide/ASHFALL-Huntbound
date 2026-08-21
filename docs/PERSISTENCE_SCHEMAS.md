# ASHFALL v0.14 Persistence and Runtime Schemas

Status: **observed, informal schemas plus the implemented local backup contract**, audited against the canonical split source during the v0.14.x foundation checkpoint.

The current code uses JavaScript objects, not a formal schema library. The pseudo-TypeScript below records fields actually constructed, defaulted, read, or written by v0.14. Optional markers mean a field may be absent in an older save, a newly constructed object, or a particular item/run variant. It does not mean the field is safe to discard.

Sections labeled **Proposed future schema** are roadmap guidance only and are not implemented.

## Browser persistence keys

| Storage | Literal key | Observed value | Owner/source anchors |
| --- | --- | --- | --- |
| `localStorage` | `ashfall_mp_alpha_profiles_v1` | JSON object keyed by profile UUID | `PROFILE_KEY`, `loadProfiles`, `saveProfiles`, `persistProfile`, `newProfile`, `ensureProfileShape` |
| `localStorage` | `ashfall_save_recovery_v1` | One versioned snapshot containing the exact pre-migration/import roster text | `RECOVERY_KEY`, `writeRecoverySnapshot`, `readRecovery` in `js/save-system.js` |
| `localStorage` | `ashfall_corrupt_quarantine_v1` | Exact unreadable roster text preserved before an explicit recovery restore | `QUARANTINE_KEY`, `restoreRecovery` in `js/save-system.js` |
| `localStorage` | `ashfall_party_records_v1` | JSON object keyed by sorted party names joined with `|` | `PARTY_RECORD_KEY`, `loadPartyRecords`, `updatePartyRecord` |
| `sessionStorage` | `ashfall_mp_peer_id` | String UUID/random ID for this tab session | `SESSION_PEER`, `peerId` initialization |

No IndexedDB database, cookie, Cache Storage record, filesystem save, or server-owned character record exists in this repository. Hunter backup/import/recovery is entirely local and requires no paid service.

Storage behavior that matters:

- `AshfallSaveSystem.readProfiles` validates the whole canonical roster and returns structured success/error state plus the original raw text. Malformed or unsafe data blocks character creation, persistence, and normal import instead of becoming an empty roster.
- `persistProfile` still stores the canonical bare profile map under the unchanged v1 key, but writes now catch browser/quota failures and reject stale or corrupt bases.
- Export files use the versioned `ashfall-huntbound-save` envelope (`formatVersion: 1`, `gameVersion`, `exportedAt`, `profileKey`, and `profiles`). The live canonical storage representation is not enveloped or renamed.
- Import is previewed and merge-only by default. Unrelated local hunters survive; byte-identical IDs are skipped; differing records with the same ID are retained as separate `(Recovered)` hunters with new IDs.
- Before implicit profile migration or any import/valid recovery merge, the exact current roster text is written to `ashfall_save_recovery_v1`. If that snapshot cannot be written, the live roster is not changed.
- If the live roster is malformed, export downloads its raw bytes. An explicit restore of a valid automatic snapshot first preserves the malformed bytes under `ashfall_corrupt_quarantine_v1`.
- `ensureProfileShape` remains the in-game mutating compatibility wrapper, but it delegates to the pure, idempotent `normalizeProfileV014` path covered by current, legacy, unknown-field, and all-class fixtures.
- Party records are updated only in host-side `settleRun`; they are local records, not shared or authoritative leaderboards.

### Local export envelope v1

```ts
type AshfallLocalExportV1 = {
  format: "ashfall-huntbound-save";
  formatVersion: 1;
  gameVersion: "0.14.0";
  exportedAt: string; // ISO timestamp
  profileKey: "ashfall_mp_alpha_profiles_v1";
  profiles: StoredProfilesV1;
};
```

The import limit is 4 MB and 100 hunters. Files with future format versions, unsupported classes, mismatched IDs, unsafe object keys/IDs, markup-bearing values, invalid roots, or excessive complexity are rejected before storage is touched.

## Observed private relay persistence

The versioned Site runtime declares the logical D1 binding `DB` in `site/.openai/hosting.json`. `site/db/schema.ts` and `site/drizzle/0000_spooky_zombie.sql` define one transport table:

```ts
type MultiplayerEventRow = {
  id: number;            // INTEGER PRIMARY KEY AUTOINCREMENT
  room_code: string;     // TEXT NOT NULL; validated as 4–8 uppercase letters/digits
  sender_peer_id: string;// TEXT NOT NULL; client-supplied, truncated to 80 characters
  payload: string;       // TEXT NOT NULL; opaque JSON event, maximum 220,000 encoded bytes
  created_at: number;    // INTEGER NOT NULL; browser-independent Worker Date.now()
};
```

Indexes cover `(room_code, id)` for cursor polling and `created_at` for expiry cleanup. The relay accepts `GET` and `POST`; clients have no delete endpoint. Rows older than two hours are removed during POST cleanup, limited to approximately once per minute per warm Worker isolate.

This table is a temporary mailbox, not authoritative persistence. It has no account, membership, room secret, command schema, acknowledgement, settlement ledger, character record, or game-state checkpoint. The physical database resource and access policy are managed by the Sites control plane and are not stored in Git.

## Observed profile collection

```ts
type StoredProfilesV1 = Record<ProfileId, ObservedProfile>;
```

The outer object has no metadata or version. The key is expected to equal `profile.id`, but this invariant is not validated.

## Observed character profile

Owners and anchors: `newProfile`, `ensureProfileShape`, `ensureArmoryShapeV132`, `ensureWorldProfileV14`, `persistProfile`, `applySettlement`.

```ts
type ObservedProfile = {
  id: string;
  name: string;
  classId: "warden" | "berserker" | "ranger" | "arcanist" | "templar" | "shadow";

  level: number;
  xp: number;
  gold: number;
  materials: { common: number; rare: number };

  classMastery: Record<ClassId, number>;
  skillXp: Record<ClassId, { s1: number; s2: number }>;
  talents: string[];
  ascentNodes: string[];
  selectedSpec: string | null;
  ascension: number;
  ashMarks: number;

  inventory: ObservedItem[];
  equipment: ObservedEquipment;
  loadouts: Record<string, ObservedLoadout>;
  loadoutNamesV131: Record<string, string>;
  trackedRecipeV131: string | null;
  autoPotionV131: boolean;

  discoveredDelvesV132: string[];
  worldV14?: ObservedWorldProgress;
  contractTiers: Record<string, number>;
  huntQuestClaims: Record<string, boolean>;

  relicsFound: string[];
  mythicsFound: string[];
  monsterMastery: Record<MonsterKind, { kills: number; parts: number }>;
  monsterParts: Record<PartKey, number>;
  nemeses: Record<MonsterKind, ObservedNemesis>;
  trophies: string[];

  bestScores: Record<ScoreKey, number>;
  bestTimes: Record<ScoreKey, number>;
  lifetime: ObservedLifetime;
  deathCache: ObservedDeathCache | null;
  dropPity: { relic: number; mythic: number };

  companyName: string | null;
  companyClaims: Record<string, boolean>;
  titles: string[];
  selectedTitle: string;
  wagerStats: ObservedWagerStats;
  merchantStocks: Record<VisitId, ObservedMerchantOffer[]>;
};
```

### Profile defaults and late-added fields

`newProfile` constructs the core identity, progression, starter equipment, discovery, collection, and lifetime fields. `ensureProfileShape` additionally creates or normalizes:

- `trackedRecipeV131`, `loadoutNamesV131`, and `autoPotionV131`;
- `huntQuestClaims`;
- expanded lifetime counters;
- ten-slot equipment plus null legacy keys;
- every collection/map that older saves might lack.

`worldV14` is lazy and only appears after `ensureWorldProfileV14` runs. There is no explicit “profile schema v14” discriminator.

### Observed nested profile shapes

```ts
type ObservedEquipment = {
  head: ObservedItem | null;
  shoulders: ObservedItem | null;
  chest: ObservedItem | null;
  gloves: ObservedItem | null;
  boots: ObservedItem | null;
  weapon: ObservedItem | null;
  offhand: ObservedItem | null;
  ring1: ObservedItem | null;
  ring2: ObservedItem | null;
  necklace: ObservedItem | null;

  // Retained as null compatibility keys after migration.
  armor: null;
  charm: null;
};

type ObservedLoadout = {
  gear: Record<EquipmentSlot, ItemId | null>;
  spec: string | null;
  talents: string[];
  ascentNodes: string[];

  // Older loadouts may instead have direct weapon/armor/charm/chest/necklace fields.
};

type ObservedLifetime = {
  runs: number;
  success: number;
  wipes: number;
  bosses: number;
  kills: number;
  elites: number;
  bestDepth: number;
  totalDepths: number;
  huntStreak: number;
  bestStreak: number;
  flawless: number;
  nemesisKills: number;
  partsBroken: number;
};

type ObservedNemesis = {
  kind: MonsterKind;
  name: string;
  rank: number;       // capped at 10 by applySettlement
  encounters: number;
};

type ObservedDeathCache = {
  gold: number;
  item: ObservedItem;
};

type ObservedWagerStats = {
  hands: number;
  wins: number;
  losses: number;
  net: number;
  bestWin: number;
  perfects: number;
};
```

Score key formats currently observed:

- Normal hunt: `${missionId}:${difficulty}`
- Delve: `delve:${delveId}:${difficulty}`
- Surface skirmish: `surface:${encounterId}:${difficulty}`

Company-claim keys are `${companyName}:${yearWeek}`. Names, not durable Company IDs, determine local membership and claim grouping.

## Observed durable world progress

Owner/anchor: `ensureWorldProfileV14`, with updates in resource delivery, world contracts, settlement, and `enterWorldV14`.

```ts
type ObservedWorldProgress = {
  discoveredRegions: string[];  // default ["emberwood"]
  contracts: {
    wolves: number;
    resources: number;
    elites: number;
  };
  contractsClaimed: Record<string, boolean>;
  waypoints: string[];          // default ["emberwatch"]
  enteredLowlands: boolean;
  surfaceClears: number;
};
```

Only `enteredLowlands` and `surfaceClears` receive explicit late-field checks after the object exists. Missing nested arrays/maps/counters inside a partially formed `worldV14` object are not fully normalized.

## Observed item shape

Owners and anchors: `normalizeItemV132`, `fillItemStatsV132`, `generateItem`, `generateRelic`, `generateMythic`, `generateBossSetDropV09`, `craftHuntRecipeV131`, `merchantGear`, `makeMerchantUnique`, and item mutation functions.

```ts
type ObservedItem = {
  id: string;
  type: "head" | "shoulders" | "chest" | "gloves" | "boots" |
        "weapon" | "offhand" | "ring" | "necklace";
  equipSlot?: EquipmentSlot | null;
  ilvl: number;
  rarity: "common" | "uncommon" | "rare" | "epic" |
          "legendary" | "relic" | "mythic";
  name: string;

  atk: number;
  def: number;
  hp: number;
  affixType: "crit" | "dodge" | "leech" | "atk" | "def" | "hp" | null;
  affixValue: number;
  enhance: number;
  value: number;

  refines?: number;
  favoriteV131?: boolean;
  lockedV131?: boolean;

  trait?: string;
  traitAwakened?: boolean;
  setId?: string;
  setName?: string;
  zoneId?: string;
  classLock?: ClassId;

  relicPower?: string;
  relicPowerName?: string;
  relicPowerDesc?: string;
  relicKey?: string;
  mythicKey?: string;
  merchantUnique?: boolean;

  craftedFrom?: string;
  huntforged?: boolean;
  identityBase?: string;
  identityTier?: "Huntforged" | "Tempered" | "Masterworked" | "Awakened";
  identityPath?: ["Huntforged", "Tempered", "Masterworked", "Awakened"];
  identityRank?: number;
};
```

Compatibility behavior:

- Legacy item type `armor` normalizes to `chest`; `charm` normalizes to `necklace`.
- Item types `ring1`/`ring2` normalize to type `ring` plus `equipSlot`.
- Normalization mutates the item in place.
- `ensureArmoryShapeV132` maps old equipment keys into the ten-slot armory and leaves `armor`/`charm` null.
- There is no item schema version, immutable template ID, roll seed, provenance chain, owner ID, creation timestamp, or mutation revision.

## Observed merchant stock persistence

`profile.merchantStocks[visitId]` stores personalized offers, including complete nested item objects and the `sold` flag.

```ts
type ObservedMerchantOffer = {
  id: string;
  kind: "common" | "rareMat" | "prep" | "gear";
  name: string;
  desc: string;
  price: number;
  qty?: number;
  item?: ObservedItem;
  named?: boolean;
  expensive?: boolean;
  sold?: boolean;
};
```

The corresponding room merchant state is ephemeral. Old visit stocks are not pruned from the profile.

## Observed party-record persistence

Owner/anchor: `loadPartyRecords`, `updatePartyRecord`.

```ts
type StoredPartyRecordsV1 = Record<string, {
  names: string[];
  clears: number;
  wipes: number;
  bestScore: number;
  bestTime: number | null;
  bestDepth: number;
}>;
```

The record key is sorted display names joined with `|`, so renamed hunters or duplicate names can fragment or collide. There is no run ID or party member profile ID list.

## Observed join/player projection

`playerJoinPayload` derives the profile subset sent into a room. This object is not persisted separately.

```ts
type ObservedRoomPlayer = {
  peerId: string;
  name: string;
  classId: ClassId;
  level: number;
  mastery: number;
  gearRating: number;
  gearTraits: string[];
  talents: string[];
  ascentNodes: string[];
  power: { atk: number; def: number; hp: number; crit: number; dodge: number; leech: number };
  relicPowers: string[];
  skillLevels: { s1: number; s2: number };
  monsterMastery: Record<string, { kills: number; parts: number }>;
  selectedSpec: string | null;
  ascension: number;
  nemesisSeed: ObservedNemesis | null;
  deathCache: ObservedDeathCache | null;
  dropPity: { relic: number; mythic: number };
  trophies: string[];
  title: string;
  autoPotionV131: boolean;

  ready: boolean;
  campX: number;
  campY: number;
  worldX?: number;
  worldY?: number;
  facing: "north" | "south" | "east" | "west";
  prep: { healer?: boolean; feast?: boolean; merchantPotions?: number };
  connected?: boolean;
};
```

The host trusts all derived progression/stat fields in this payload. `peerId` is not bound to a character or account.

## Observed room and surface-instance shapes

Owners and anchors: `createRoom`, `broadcastSnapshot`, `onNetwork`, `buildWorldStateV14`.

```ts
type ObservedRoom = {
  code: string;
  hostPeerId: string;
  players: Record<PeerId, ObservedRoomPlayer>;
  missionId: string;
  delveId: string | null;
  difficulty: "normal" | "veteran" | "nightmare";
  run: ObservedRun | null;
  log: string[];
  merchant: {
    active: boolean;
    visitId: string;
    mood: string;
    misses: number;
    arrivedAt: number;
  };
  worldV14?: ObservedSurfaceInstance | null;
  worldSelectionV141?: {
    kind: "delve";
    delveId: string;
    selectedBy: PeerId;
  } | null;
};

type ObservedSurfaceInstance = {
  active: true;
  region: string;
  map: TileKind[][];
  encounters: Array<{
    id: string;
    x: number;
    y: number;
    name: string;
    kind: MonsterKind;
    count: number;
    elite: boolean;
    done: boolean;
    respawnAt: number;
  }>;
  resources: Array<{
    id: string;
    x: number;
    y: number;
    name: string;
    kind: "herb" | "ore" | "cache";
    done: boolean;
  }>;
  entrances: Array<{
    id: string;
    x: number;
    y: number;
    name: string;
    delveId: string;
  }>;
  startedAt: number;
};
```

`ObservedSurfaceInstance` is memory-only and host-owned. It is not the same schema as durable `profile.worldV14`, despite using the same property name.

## Observed run shape

Owners and anchors: `launchExpedition`, `launchWorldSkirmishV14`, `createRunPlayer`, `generateStage`, `buildDeepHuntPlan`, `settleRun`.

```ts
type ObservedRun = {
  missionId: string;
  isDelve?: boolean;
  delveId?: string | null;
  delve?: object | null;
  isWorldSkirmish?: boolean;
  worldEncounter?: object | null;

  difficulty: "normal" | "veteran" | "nightmare";
  modifier: object;
  dailyBoost: number;
  ghostTarget?: number | null;

  depth: number;
  maxDepth?: number;
  round: number;
  totalRounds: number;
  phase: "player" | "resolve" | "choice" | "path" | "ended";
  result?: "clear" | "extract" | "wipe";
  startedAt: number;
  campaignVersion: "v0.14.0";

  map: TileKind[][];
  players: Record<PeerId, ObservedRunPlayer>;
  enemies: ObservedEnemy[];
  votes: Record<PeerId, "extract" | "descend">;
  log: string[];

  cleared: boolean;
  currentPath: object | null;
  pathChoices: object[] | null;
  stageEvent: object | null;
  stageWeather?: string;
  zoneStageName?: string;

  deathCaches: Array<{
    peerId: PeerId;
    x: number;
    y: number;
    cache: ObservedDeathCache;
    collected: boolean;
  }>;
  huntHeat: number;
  deepHunt?: ObservedDeepHunt | null;

  // Stage/boss variants add these as needed.
  mapProps?: object[];
  lootables?: object[];
  raidHazards?: object[];
  deepChallenge?: object | null;
  deepHazard?: object | null;
  bossTelegraph?: string | null;
  bossStage?: boolean;
  bossIntroRound?: number;
  surfaceCombatV142?: boolean;
};
```

`campaignVersion` is an observed content label, not a run schema version. Runs are not checkpointed to durable storage.

### Observed Deep Hunt state

```ts
type ObservedDeepHunt = {
  cfg: {
    active: true;
    hardCap: number;
    minBossDepth: number;
    spoorRequired: number;
  };
  start: DeepNode;
  tiers: Record<number, DeepNode[]>;
  bossNode: DeepNode;
  currentNode?: DeepNode;
  spoor: number;
  bossRevealed: boolean;
  history: DeepNode[];
  revealedDepth: number;
};
```

Deep nodes are content-shaped objects with common `id`, `depth`, `type`, `name`, and `desc`, plus optional encounter, enemy, elite, reward, loot, track, extraction, healing, boon, cache, timer, hazard, and resolution fields. They are generated with ambient randomness and later mutated (for example `_resolved`).

### Observed run player

```ts
type ObservedRunPlayer = {
  peerId: string;
  name: string;
  classId: ClassId;
  level: number;
  mastery: number;
  gearRating: number;
  gearTraits: string[];
  talents: string[];
  ascentNodes: string[];
  skillLevels: { s1: number; s2: number };
  power: object;
  relicPowers: string[];
  monsterMastery: object;
  selectedSpec: string | null;
  ascension: number;
  nemesisSeed: ObservedNemesis | null;
  deathCache: ObservedDeathCache | null;
  dropPity: { relic: number; mythic: number };

  x: number;
  y: number;
  facing: string;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  res: number;
  maxRes: number;

  downs: number;
  downed: boolean;
  dead: boolean;
  downedAt: number | null;
  deadAt: number | null;
  guarding: boolean;
  retaliation: boolean;
  status: {
    poison: number;
    burn: number;
    bleed: number;
    partyDef: number;
    closingGuard: number;
  };
  potions: number;
  xpMult: number;
  submitted: boolean;
  pending?: ObservedAction | null;
  connected?: boolean;

  boons: string[];
  runLoot: ObservedRunLoot;
  combat: { damage: number; healing: number; revives: number; parts: number };
  secondLightUsed: boolean;
  frenzyCharges: number;
  quickUsed: boolean;

  deathCacheCollected?: boolean;
  visualAction?: object | null;
  hitFlash?: number;
};
```

### Observed run loot

```ts
type ObservedRunLoot = {
  xp: number;
  mastery: number;
  skill1: number;
  skill2: number;
  gold: number;
  common: number;
  rare: number;
  kills: number;
  bosses: number;
  elites: number;
  items: ObservedItem[];
  secureId: ItemId | null;
  namedParts: Record<PartKey, number>;
  killsByKind: Record<MonsterKind, number>;
  partsByKind: Record<MonsterKind, number>;
  nemesisDefeated: MonsterKind[];
};
```

### Observed enemy baseline

Enemy and boss shapes are polymorphic and grow during combat. The shared baseline created by stage/surface spawners is:

```ts
type ObservedEnemy = {
  id: string;
  kind: MonsterKind;
  name: string;
  x: number;
  y: number;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  xp: number;
  elite: boolean;
  trait: string | null;
  boss: boolean;
  status: { poison: number; burn: number; bleed: number; stagger?: number };
  intent: string | null;
  alerted?: boolean;
  parts: Array<{
    id: string;
    name: string;
    key: PartKey;
    label: string;
    maxHp: number;
    hp: number;
    broken: boolean;
    effect: string;
  }>;

  // Bosses/specials add phase, cooldown, telegraph, footprint, hazard,
  // vulnerability, animation, and target fields.
  [variantField: string]: unknown;
};
```

Animation fields currently travel beside combat state and are not separated from material replay state.

## Observed settlement shape

Owner/anchors: host `settleRun` constructs; local `applySettlement` consumes.

```ts
type ObservedSettlement = {
  success: boolean;
  label: string;
  mission: string;
  missionId: string;
  isDelve: boolean;
  isWorldSkirmish: boolean;
  worldEncounter: object | null;
  delveId: string | null;
  depth: number;
  difficulty: string;
  modifier: string;
  stageEvent: string | null;
  grade: "S" | "A" | "B" | "D";
  elapsed: number;
  score: number;
  partyScore: number;
  mvpAwards: Array<{ title: string; name: string; value: string }>;

  xp: number;
  mastery: number;
  skill1: number;
  skill2: number;
  kills: number;
  bosses: number;
  elites: number;
  downs: number;
  partsBroken: number;
  damage: number;
  healing: number;
  revives: number;

  gold: number;
  common: number;
  rare: number;
  namedParts: Record<PartKey, number>;
  killsByKind: Record<MonsterKind, number>;
  partsByKind: Record<MonsterKind, number>;
  nemesisDefeated: MonsterKind[];
  deathCacheCollected: boolean;
  dropPity: { relic: number; mythic: number };
  items: ObservedItem[];

  wiped: boolean;
  bossTrophy: string | null;
  nemesisSurvivor: {
    kind: MonsterKind;
    name: string;
    rank: number;
  } | null;
  deathCache: ObservedDeathCache | null;

  routeNames: string[];
  huntHeat: number;
  spoor: number;
  bossRevealed: boolean;
  safeExtract: boolean;
};
```

Settlement is not stored as an independent record. The most recent object is held in memory as `lastSummary`, while `applySettlement` folds it directly into the profile and writes the profile collection.

Critical observed gaps:

- no `schemaVersion`, `settlementId`, `runId`, player/profile ID, content version, source revision, result hash, or signature;
- no ledger of applied settlement IDs;
- no atomic compare-and-swap against a profile revision;
- no rollback record;
- a duplicate accepted settlement event can reapply XP, currency, materials, items, counters, and other rewards.

## Current authority boundaries

| Mutation | Honest-client authority | Durable owner | Current validation |
| --- | --- | --- | --- |
| Create/select/normalize character | Local browser | Local browser | Shape defaults only; no authenticity. |
| Equip/craft/salvage/enhance/wager/purchase | Local browser | Local browser | UI/function preconditions only. |
| Join payload stats | Joining client supplies; host trusts | None separately | No account/profile binding or signature. |
| Camp/surface movement and interaction | Host browser | None | Host checks occupancy/range/state. |
| Resource depletion and encounter/Delve selection | Host browser | Runtime only | Host checks current object and range. |
| Resource/discovery permanent reward | Host emits; recipient applies | Recipient local profile | Message targeting plus local function checks. |
| Combat, AI, drops, votes, extraction | Host browser | Runtime only | Host rule functions in `game.js`. |
| Settlement calculation | Host browser | Event only | Host code; no server verification. |
| Settlement application | Each recipient browser | Recipient local profile | No idempotency or revision check. |
| Party records | Host browser | Host `localStorage` | Names used as identity. |

The private relay forwards opaque JSON. It does not change these authority boundaries.

## Known unversioned or ambiguous fields

| Area | Observed risk |
| --- | --- |
| Profile collection | Key name ends in `_v1`, but neither envelope nor profile carries a schema version. |
| Implicit migrations | `ensureProfileShape` uses truthy fallbacks (`value || default`), which cannot distinguish missing, invalid, and intentionally zero/null in every case. |
| Partial `worldV14` | Only two late fields are explicitly repaired; nested fields can remain absent. |
| Items | No schema/template/provenance version; legacy type conversion mutates objects in place. |
| Merchant stocks | Entire generated offers persist indefinitely under random visit IDs; no pruning/versioning. |
| Loadouts | Current `gear` map and older direct keys coexist informally. |
| Score keys | Meaning is encoded into colon-delimited strings without a key schema. |
| Companies | Display name is the grouping ID; weekly claim identity is string concatenation. |
| Room/run | No protocol/schema version. `campaignVersion` is content-facing and does not cover shape. |
| Randomness | No stored seed or RNG cursor, so runs and item rolls cannot be reproduced. |
| Time | Absolute millisecond timestamps have no clock source/version and runtime expiry is not checkpointed. |
| Runtime vs presentation | Visual/animation timestamps are mixed into snapshot objects. |
| Settlement | No unique identity or applied ledger; duplicate delivery is economically unsafe. |
| Parse failure | Invalid JSON becomes an empty collection with no backup or user-visible recovery path. |

## Safe extraction seams

1. **Raw storage adapter:** read the existing keys without transformation; expose parse errors and raw recovery bytes instead of returning an indistinguishable empty object.
2. **Pure normalizers:** clone, normalize, preserve unknown fields, and return diagnostics. Cover `Profile`, `WorldProgress`, `Item`, `Equipment`, `Loadout`, and `PartyRecord` independently.
3. **Compatibility repository:** continue reading/writing `ashfall_mp_alpha_profiles_v1` while calling the pure normalizers. Do not introduce a second live profile key without an explicit migration/export plan.
4. **Fixture-backed domain operations:** move equipment, crafting, economy, progression, and settlement mutations into pure functions with exact before/after fixtures.
5. **Runtime schemas:** define `Room`, `SurfaceInstance`, `Run`, `RunPlayer`, `Enemy`, `Command`, and `Settlement` independently from the durable profile.
6. **Deterministic services:** inject RNG, clock, and ID generation; record seed/content version and exclude presentation fields from state hashes.
7. **Idempotent settlement:** assign a durable settlement ID and profile revision; apply once transactionally and record the application.
8. **Realm boundary:** keep legacy local characters playable offline but never silently treat editable local saves as authoritative online/ranked characters.

## Proposed future schema

This section is **not observed code**. It is the minimum target envelope for safe migration and eventual authoritative play.

```ts
type ProposedEnvelope<T> = {
  schemaVersion: number;
  contentVersion: string;
  realm: "local" | "online";
  revision: number;
  createdAt: string;
  updatedAt: string;
  data: T;
};

type ProposedRunIdentity = {
  runId: string;
  schemaVersion: number;
  contentVersion: string;
  rulesVersion: string;
  seed: string;
  rngCursor: number;
};

type ProposedSettlementEnvelope = {
  settlementId: string;
  runId: string;
  profileId: string;
  schemaVersion: number;
  contentVersion: string;
  expectedProfileRevision: number;
  outcome: ObservedSettlement;
  resultHash: string;
  issuedAt: string;
};
```

The first local migration should wrap or version data without changing gameplay values. Unknown future fields should survive round trips. Online schemas can later use the same domain shapes, but online identity, inventory, currency, and settlement must be server-owned.

## Prioritized schema work

1. Capture raw old/current save fixtures and malformed/truncated examples before changing loaders.
2. Define executable validators/normalizers for profile, world progress, equipment, item, loadout, and party records.
3. Add player-controlled JSON export and non-destructive import with preview, validation, and backup.
4. Add explicit local schema/content versions and idempotent migrations while retaining the canonical key.
5. Define command, room, surface, run, enemy, and settlement schemas plus protocol envelopes.
6. Add deterministic seed/clock/ID services and golden run/settlement fixtures.
7. Add settlement IDs, applied ledgers, revisions, and atomic application.
8. Add an explicit local-versus-online realm boundary before server-owned characters or economy.

## Acceptance criteria

- Current and legacy profile fixtures load with the same character IDs, levels, currencies, trophies, discoveries, items, loadouts, and ten equipped slots.
- Running a migration twice yields byte-equivalent normalized data after stable key ordering; no counter or reward changes twice.
- Unknown fields survive load/save unless an explicit migration documents their removal.
- Corrupt or newer-than-supported data never causes the existing storage value to be overwritten with `{}`.
- Export → clean browser → import reproduces the profile and all nested item/world data after validation.
- Legacy `armor`/`charm` items and loadouts migrate once to `chest`/`necklace` without duplication.
- A settlement can be delivered repeatedly, out of order, or after reconnect and still mutate a profile at most once.
- A fixed seed, content/rules version, initial run state, and command sequence reproduce the same material run state and settlement hash.
- Local/offline saves continue to work for free; editable local data is clearly separated from authoritative online characters.
