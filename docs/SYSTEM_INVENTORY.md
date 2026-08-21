# ASHFALL v0.14 System Inventory

Status: **observed implementation inventory**, audited against the canonical split source on branch `codex/v014-source-migration` during the v0.14.x foundation checkpoint.

This document describes what the v0.14.0 client actually does. It is not a replacement design and it does not promote proposed roadmap architecture to current fact. Proposed extraction boundaries are explicitly labeled **Proposed seam**.

## Repository units

| Unit | Observed responsibility |
| --- | --- |
| `index.html` | Static game shell, fixed `960×608` canvas, HUD, overlays, lobby, profile, service, training, wager, summary, and action controls. |
| `css/game.css` | Entire visual system, viewport layout, overlays, canvas scaling, HUD modes, responsive rules, sprite/UI polish, and accessibility-visible states. |
| `js/game.js` | One strict-mode IIFE containing content definitions, storage, transport, room state, world state, simulation, progression, settlement, rendering, audio, and input. At audit: 3,852 lines, 496,337 bytes, and 563 top-level function declarations. |
| `assets/` | 57 canonical PNGs: camp art, textures, bosses, six-class animation sheets, and defeat/down visuals. Source references and file names are guarded by tests. |
| `scripts/build-bundle.mjs` | Dependency-free bundler that embeds CSS, JavaScript, and all referenced assets into the QA/release HTML; `--check` verifies exact parity without rewriting. |
| `release/ASHFALL_Huntbound_Alpha_v0.14.0_Open_World.html` | Self-contained QA/release artifact generated from split source. It is not development source. |
| `tests/source-invariants.test.mjs` | Static compatibility guards for split boot, 57 assets, profile save key, ten equipment slots, bonfire returns, and exact-tile surface attacks. |
| `tests/release-bundle.test.mjs` | Byte-for-byte bundle parity guard. |
| `site/` | Versioned private ChatGPT Site shell, worker entry, D1 relay/schema/migration, locked dependency build, and presentation assets. The game payload is generated, not edited here. |
| `scripts/materialize-site.mjs` | Dependency-free promotion boundary that combines `site/` with the canonical root game in an explicitly chosen safe destination. |
| `tests/site-runtime.test.mjs` | Site materialization safety, manifest/relay wiring, and byte-parity coverage for the game source and all 57 assets. |

The physical D1 resource, private access policy, immutable versions, and deployment history remain Sites control-plane state. Git reproduces the source/build and logical `DB` binding, while the separate Sites-owned checkout remains the controlled deployment mirror.

## Runtime ownership map

| State | Current owner | Lifetime | Trust boundary |
| --- | --- | --- | --- |
| `profile` and the profile collection | The current browser | Durable `localStorage` | Untrusted local data; editable with browser tools. |
| Party records | The host browser that settles the run | Durable `localStorage` | Untrusted local data; guests do not receive the host's local party record. |
| `peerId` | One browser tab/session | `sessionStorage` | Identifier only; not authenticated identity. |
| `room` | Browser elected by `isHost` | Memory only | Gameplay-authoritative in the prototype, but not secure or server-authoritative. |
| `snapshot` | Each guest browser | Memory only | A host-authored clone used for display and local input checks. |
| `room.worldV14` | Host browser | Memory only | Current surface instance, encounters, resources, and entrances. Lost on refresh/room loss. |
| `room.run` | Host browser | Memory only | Expedition/skirmish simulation and reward calculation. Lost on refresh/room loss. |
| Settlement payload | Host browser creates; each recipient browser applies | Event/in-memory, then folded into local profile | No authentication, signature, revision check, or idempotency key. |
| HUD/render/audio/input state | Each browser | Memory only | Presentation only, although rendering and rules currently share globals. |
| Relay events | Private Site relay | About two hours according to the hosted implementation inventory | Mailbox transport only; it does not validate game rules or own game state. |

“Host-authoritative” below describes current control flow, not anti-cheat authority. A modified client can forge events, snapshots, profiles, or settlements.

## Subsystem inventory and extraction seams

### 1. Boot, shell, and input

**Observed code**

- DOM contract: `index.html`, including `#game`, overlays, HUD drawers, profile tabs, lobby controls, and action buttons.
- Boot tail: `js/game.js` `initInterfaceV132`, `wireSkillTooltips`, `renderSavedCharacters`, `renderClassGrid`, `drawCamp`, `renderAll`, and `spriteAnimationLoop` (near lines 3,845–3,852).
- Canvas pointer conversion: `canvasTileFromPointerV141` and the `canvas.addEventListener('click', ...)` handler (near lines 3,803–3,804).
- Keyboard and held movement: `MOVE_KEYS`, `movementOverlayOpen`, `processHeldCampMovement`, and window key listeners (near lines 3,806–3,842).

**Authority:** local presentation/input. Input becomes authoritative only after the host handlers validate it.

**Proposed seam:** a `client/input` adapter that emits typed intentions (`Move`, `Interact`, `ChooseAction`, `Vote`) without reading or mutating simulation state. Keep the existing DOM IDs and keyboard behavior behind a compatibility controller until browser parity tests pass.

### 2. Rendering, animation, effects, and audio

**Observed code**

- Camp/boss/class asset registries and loaders begin at `CAMP_ART_DATA`, `BOSS_SPRITES`, class source constants, and `V7_CLASS_SOURCES` (lines 5–513).
- Six-class action and defeat rendering: `triggerClassVisualAction`, `drawClassDefeatSpriteV141`, and `drawClassSpriteV7` (lines 537–609).
- Combat particles/meters/audio: `pushCombatFloaterEntity`, `emitWorldFx`, `renderCombatMeters`, `emitEnemyAttackFx`, and `beep` (lines 646–710).
- World/run/camp drawing: `drawWorldV14`, `draw`, `drawCamp`, `drawRunPlayer`, and `drawEnemy` (lines 1,236 and 3,354–3,637).
- UI projection: `renderAll`, `renderPlayer`, `renderParty`, `renderRunLoot`, `renderLog`, `renderActions`, `renderProfile`, and `renderProfileExtrasV132` (lines 3,062–3,737).

**Authority:** local projection only. Visual timestamps such as `hitFlash`, `visualAction`, `moveVisual`, `animStarted`, and effect queues are carried beside rule state in places but must not decide durable outcomes.

**Proposed seam:** renderer functions consume an immutable `ViewModel`; effect/audio functions consume domain events. First classify and exclude presentation-only fields from future snapshots and replay hashes.

### 3. Content registries

**Observed code**

- Classes and core talents: `CLASSES`, `TALENTS` (lines 712–765).
- Hunter's Ascent: `V11_TREE_DEFS`, `V11_COSTS`, and `v11Tree` (lines 767–785).
- Missions, difficulty, modifiers, contracts, enemies, zone stages/gear/lieutenants: `MISSIONS` through `V09_LIEUTENANTS` (lines 788–887).
- Traits, quests, lore, bosses, anatomy, materials, sets, mythics: `V10_ITEM_TRAITS`, `V10_FRONTIER_QUESTS`, `PART_DEFS`, `KILL_MATS`, `MONSTER_SETS`, and `MYTHICS`.
- Open-world region and contracts: `V14_WORLD_REGIONS`, `V14_WORLD_CONTRACTS`.
- Relics, specializations, boons, route choices: `CLASS_RELIC_BASES`, `RELIC_POWERS`, `SPECIALIZATIONS`, `RUN_BOONS`, and `PATH_CHOICES`.
- Deep Hunts and Delves: `DEEP_NODE_POOLS`, `DEEP_BOSS_APPROACH`, `V132_DELVES`.
- Huntforged recipes are generated at startup by `huntCraftRecipesV131` into `HUNT_CRAFT_RECIPES_V131`.

**Authority:** code-shipped constants interpreted by every client. There is no independent content version registry or validation pass.

**Proposed seam:** move registries, unchanged, into data modules with stable IDs and a `contentVersion`. Add reference validation before changing values or adding content. Do not combine this mechanical move with balance changes.

### 4. Character profiles and progression

**Observed code**

- Storage boundary: `PROFILE_KEY`, `loadProfiles`, `saveProfiles`, and `persistProfile` (lines 612 and 1,551–1,555).
- Construction and compatibility defaults: `newProfile`, `ensureProfileShape`, `ensureArmoryShapeV132`, and `normalizeItemV132`.
- XP/mastery/talents/Ascent/Ascension: `xpNext`, `masteryLevel`, `buyTalent`, `buyAscentNodeV11`, `ascendHunter`.
- Titles, records, Nemeses, Codex mastery, Delve discovery, contracts, and world progression are fields on the same profile object.
- `persistProfile` also renders saved characters and schedules `syncRoomProfile`, coupling storage to UI and multiplayer.

**Authority:** the local browser owns and can mutate its profile. In multiplayer the host receives a derived join payload, not the complete profile, and trusts it.

**Proposed seam:** extract a pure profile normalizer/migrator first, then a storage adapter with `loadAll`, `saveOne`, `export`, and `import`. Retain `ashfall_mp_alpha_profiles_v1` as the compatibility key during the first extraction and preserve unknown fields.

### 5. Items, armory, crafting, and economy

**Observed code**

- Ten-slot armory contract: `ARMORY_SLOT_ORDER_V132`, labels, compatibility, normalization, and `ensureArmoryShapeV132` (lines 1,043–1,100).
- Item generation: `generateItem`, `generateRelic`, `generateMythic`, `generateBossSetDropV09`, `merchantGear`, and `makeMerchantUnique`.
- Inventory actions: `equipRecovered`, `salvageItem`, favorite/lock toggles, loadouts, and Recovery Pouch `secureItem`/`hostSecure`.
- Craft/evolution: `craftGear`, `craftHuntRecipeV131`, `enhanceGear`, `refineGearV10`, `awakenGearV10`, and `evolveIdentityV14`.
- Currencies/materials live directly on the profile and are changed by many UI-facing functions.

**Authority:** profile-side spending/crafting is local-client-authoritative. Run drops are host-generated in the prototype, then sent in settlement and accepted by the recipient browser.

**Proposed seam:** extract item normalization and item/economy operations as pure functions returning `{profile, events}`. Keep IDs, stat formulas, legacy `armor`/`charm` migration, ten slots, and current reward math byte-for-byte behaviorally compatible before any rebalance.

### 6. Emberwatch hub and camp services

**Observed code**

- Camp services and coordinates: `CAMP_OBJECTS`, `CAMP_BLOCK_RECTS_V132`, `activeCampObjects`, `campBlocked`, `hostCampMove`, and `interactCampObject`.
- Return contract: `EMBERWATCH_RETURN_SPAWNS_V142`, `stagePartyAtBonfireV142`, `resetToEmberwatchV142`, and `returnPartyToEmberwatchV142`.
- Services: Hunt Board, Huntsmith/Forge, Crafter, Healer, Bonfire, training dummies, stash, War Table, Trophy Wall, Cinder's Wager, and traveling merchant.
- Company progress is a local aggregation across profiles with the same `companyName`; it is not a shared online company.

**Authority:** host owns shared camp positions/preparation/merchant presence. Each client owns profile purchases, crafting, wager results, Company claims, and permanent rewards.

**Proposed seam:** represent camp movement and services as commands against a hub state, while profile economy operations remain separate transactions. Lock the bonfire return coordinates and North Gate route in regression fixtures.

### 7. Open-world surface

**Observed code**

- Durable character discovery/progress: `ensureWorldProfileV14`.
- Runtime map/instance: `worldMapV14`, `buildWorldStateV14`, `refreshWorldStateV14`, and `worldObjectsV141` (lines 1,139–1,200).
- Host movement/interaction: `hostWorldMoveV14`, `hostWorldInteractV141`, `enterWorldV14`, and `leaveWorldV14`.
- Surface combat: `launchWorldSkirmishV14` and `generateSurfaceSkirmishV142`; combat copies the surface map and player coordinates.
- Resource rewards and Delve discovery: `deliverWorldRewardV141`, `applyWorldResourceRewardV141`, and `applyWorldDelveDiscoveryV141`.
- Exact-tile click and `autoAttack` behavior is guarded by source invariants.

**Authority:** host owns runtime map objects, range validation, resource depletion, encounter start, and room transitions. Each recipient client persists its own resource reward, contract progress, and discovery after a host event.

**Proposed seam:** split `WorldProfile` (durable discoveries/counters) from `SurfaceInstance` (runtime entities/respawns). They currently share the name `worldV14` at different nesting levels, which must not leak into a versioned schema.

### 8. Room and multiplayer transport

**Observed code**

- Local/remote transport: `setupChannel`, `send`, `startRemoteTransportV141`, `remotePostV141`, and `receiveTransportEventV141`.
- Same-browser fast path: `BroadcastChannel('ashfall-mp-' + roomCode)`.
- Remote path: `GET` polling and `POST` events through `/api/multiplayer`; clients have no room-delete endpoint.
- New rooms use six-character unambiguous codes. Relay polling starts at 180 ms after activity and backs off to at most 900 ms while idle or 1.5 seconds after errors.
- Deduplication: in-memory `_transportId` set capped at 900 entries.
- Room lifecycle and host dispatch: `createRoom`, `joinRoom`, `broadcastSnapshot`, `onNetwork`, and `leaveRoom`.
- Guests send commands; the host mutates `room`; guests accept full `snapshot` messages.

**Authority:** the host browser is the rules authority in honest clients. The relay is an unauthenticated mailbox and accepts opaque events. Room codes and `_senderPeerId` are not credentials.

**Proposed seam:** define a versioned protocol and transport interface before changing the backend. Separate command validation from message delivery. Preserve a local transport implementation for free offline/same-browser play.

### 9. Run creation, map/stage generation, Delves, and Deep Hunts

**Observed code**

- Expedition creation: `launchExpedition`; surface run creation: `launchWorldSkirmishV14`.
- Run player projection: `playerJoinPayload` then `createRunPlayer`.
- Map/stage generation: `generateStage`, `generateOpenMap`, `generateDungeonMap`, Emberwood generators, boss arenas, lootables, and spawn repair.
- Deep Hunt graph: `buildDeepHuntPlan`, `applyDeepNodeEntry`, `deepChoicesForNextDepth`, `preparePathChoice`, and `choosePathChoice`.
- Delve floors: `V132_DELVES`, `runDepthLimit`, and the Delve branch in `onStageClear`.
- Extraction choice: `hostVote` and `settleRun`.

**Authority:** the host creates all random content using ambient `Math.random`, owns the run, resolves votes, and broadcasts full snapshots.

**Proposed seam:** inject seeded RNG and a content registry without changing generation formulas. Then extract `createRun`, `generateStage`, route selection, and extraction as pure state transitions. A seed plus ordered commands must reproduce maps, enemies, drops, and settlement inputs.

### 10. Combat, AI, anatomy, down/death, and bosses

**Observed code**

- Command flow: `submitAction` → host `hostCommand` → `resolveRound` → `resolvePlayerAction` → `resolveEnemyPhase`.
- Player rules: basic attacks, six class skill implementations in `useClassSkill`, guarding, potions, revive, status ticks, range, line of sight, Engage Step, gear traits, relics, specializations, and Ascent multipliers.
- Enemy behavior: aggro/pathing in the `V132` awareness helpers, enemy specials, elite traits, and `enemyAttack`.
- Bosses: Direfang-specific AI, campaign boss telegraphs/phases, World Eater phase gates/hazards, colossal boss construction, and anatomy `PART_DEFS`/`damagePart`.
- Defeat: `downPlayer`, `checkWipe`, campsite/rescue revival, disconnect handling, and class defeat rendering.

**Authority:** host simulation in multiplayer; the local host is also the solo simulation. Guest-side range checks improve UX but host checks and resolution decide the honest-client result.

**Proposed seam:** extract command validation and round resolution together so one rules engine serves solo, local co-op, and later server instances. Emit presentation events instead of calling rendering/audio functions from rules. Preserve all boss thresholds and anatomy effects with deterministic fixtures.

### 11. Settlement, extraction loss, and recovery

**Observed code**

- Score and MVPs: `computeHuntScore`, `computeMVP`, `strongestSurvivor`.
- Host result construction: `settleRun` (lines 2,933–2,958).
- Client profile mutation: `applySettlement` (lines 2,960–2,975).
- Wipe recovery: Recovery Pouch `secureId`, `deathCache`, Nemesis survivor promotion, probabilistic item recovery, and bonfire reset.
- Party records: `loadPartyRecords` and `updatePartyRecord`.

**Authority:** host calculates a settlement per player. The target client trusts and applies it to local storage. There is no `runId`, `settlementId`, applied-settlement ledger, signature, revision, or transaction; duplicate delivery can duplicate rewards.

**Proposed seam:** make settlement a pure, versioned, idempotent operation. First preserve the exact v0.14 loss/reward formulas in golden fixtures; only then add durable transaction IDs and authoritative persistence.

### 12. Build, release, and regression protection

**Observed code**

- Split source is canonical; the release HTML is generated.
- `npm test` runs syntax/source invariants, release parity, and Site materialization/parity checks with no third-party package dependency.
- CI rebuild/check behavior lives in `.github/workflows/rebuild-v014-release.yml`.

**Authority:** repository/CI quality gate.

**Proposed seam:** add behavior fixtures beside existing invariants. Every extraction must keep `npm test`, release parity, localStorage compatibility, and browser boot coverage green.

## Dependency choke points

These are observed coupling risks, not reasons to rewrite working gameplay.

1. `js/game.js` shares mutable globals (`profile`, `room`, `snapshot`, `isHost`, selected targets, DOM nodes, canvas context) across every subsystem.
2. Rules call UI/audio/storage/network functions directly. Examples include settlement calling `persistProfile`, damage calling effect functions, and storage scheduling `syncRoomProfile`.
3. `Math.random`, `Date.now`, `performance.now`, and `crypto.randomUUID` are called directly, so deterministic replay is not currently possible.
4. `room || snapshot` is a convenient read alias but obscures whether a caller is reading authoritative host state or a guest projection.
5. `profile.worldV14` and `room.worldV14` are unrelated durable/runtime shapes with the same property name.
6. Full room snapshots contain runtime and presentation-adjacent fields, increasing relay traffic and weakening protocol boundaries.
7. Many data shapes grow by assignment instead of construction, so absent, defaulted, legacy, and transient fields are not formally distinguishable.

## Prioritized extraction order

Each step is intended to be small, reversible, and behavior-preserving.

1. **Freeze observed contracts with fixtures.** Capture representative old/current profiles, all item families, world progress, solo/host/guest joins, surface/Delve/Deep Hunt runs, wipe/extract/clear settlements, and bonfire returns.
2. **Extract schemas, normalization, and storage adapters.** Move `newProfile`, `ensureProfileShape`, `ensureWorldProfileV14`, item normalization, and storage calls behind stable APIs without changing the current key.
3. **Extract content registries.** Move constants to validated modules, add stable content IDs/version metadata, and keep values unchanged.
4. **Extract pure item/economy operations.** Cover equip, salvage, craft, enhance, refine, awaken, identity evolution, purchases, and loadouts with before/after fixtures.
5. **Inject deterministic services.** Introduce RNG, clock, and ID interfaces; seed generation tests while retaining current formulas.
6. **Extract run rules.** Move run construction, stage generation, combat, AI, bosses, routes, extraction, and settlement to command-in/state-and-event-out modules.
7. **Version the multiplayer protocol.** Define command/event/snapshot envelopes and validation, retaining both local `BroadcastChannel` and hosted relay adapters.
8. **Separate projection from rules.** Convert current render/HUD/audio code to consume view models and domain events, then reduce snapshot payloads.
9. **Introduce authoritative online services only after parity.** The same extracted rules must run locally for solo/free play and on an authenticated service for authoritative characters.

## Acceptance criteria for the inventory/extraction foundation

- `npm test` and `node scripts/build-bundle.mjs --check` pass after every extraction checkpoint.
- A fixture copied from `ashfall_mp_alpha_profiles_v1` loads without loss, gains defaults idempotently, and saves back under the same character ID.
- All ten equipment slots, legacy `armor`/`charm` migration, 57 assets, class animations, down/death visuals, and bundled artifact remain intact.
- Emberwatch → North Gate → Emberwood → surface encounter/resource/Delve → extraction or defeat → Emberwatch bonfire passes in solo and 2–4-player matrices.
- Given a fixed content version, seed, initial state, and command list, the extracted run produces an identical material result and settlement hash.
- Guest commands cannot mutate authoritative state without validation; duplicate/out-of-order transport events do not duplicate rewards.
- No UI, balance, art, content, or save-key redesign is bundled into a mechanical extraction change.
- Offline/single-player play remains fully functional without a paid service or network connection.
