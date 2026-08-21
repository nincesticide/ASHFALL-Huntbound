# ASHFALL / Huntbound — v0.14.0 Open World

Canonical split-source game client, QA release package, and private ChatGPT Site runtime for ASHFALL. The Site shell, D1 relay schema/migration, locked build, and logical hosting configuration are versioned under `site/`; the physical managed resource and private access policy remain Sites control-plane state.

See [ROADMAP.md](ROADMAP.md) for the approved product direction and milestone gates, [docs/BACKLOG.md](docs/BACKLOG.md) for categorized work and acceptance criteria, and [docs/ONLINE_ARCHITECTURE.md](docs/ONLINE_ARCHITECTURE.md) for the proposed path to authoritative online play.

The observed v0.14 implementation is recorded in [docs/SYSTEM_INVENTORY.md](docs/SYSTEM_INVENTORY.md), with current browser, runtime, item, run, settlement, and relay shapes in [docs/PERSISTENCE_SCHEMAS.md](docs/PERSISTENCE_SCHEMAS.md).

## v0.14 foundation

- Emberwatch is the persistent hub.
- The North Gate leads to Emberwood Lowlands surface exploration.
- Surface mobs, elites, resources, contracts, caches, and Delve entrances coexist with the existing Hunt Board.
- Deep Hunts and Delves preserve extraction gameplay.
- Huntforged equipment retains the Tempered → Masterworked → Awakened identity path.
- Existing localStorage character/save compatibility is preserved.

## Current polish checkpoint

- North Gate and Hunt Board now occupy separate, readable interaction spaces.
- The fixed 960×608 game canvas uses a fullscreen, no-page-scroll presentation with floating HP/resource bars and toggleable HUD drawers.
- Emberwatch and Emberwood paths, map edges, minimap routing, and letterboxed canvas clicks were cleaned up.
- Emberwatch ↔ Emberwood transitions use validated gate/bonfire spawn points; same-map surface combat victories preserve each surviving hunter's position.
- Surface resources, encounters, and Delve entrances are host-browser-authoritative in the current untrusted multiplayer prototype.
- All six classes render distinct prone downed/fallen states derived from their canonical class sprite atlases.
- Local hunter saves now support versioned JSON export, validated preview, non-destructive merge import, automatic pre-change recovery snapshots, and corrupt-byte quarantine without changing the canonical storage key.
- Dependency-free fixtures exercise current v0.14 data, legacy three-slot armory migration, all six classes, unknown-field retention, storage failures, and recovery; executable route tests run the production game through North Gate, animal combat, resource collection, wipe/bonfire return, and Emberroot Cellar entry.
- Deep Hunt plans now activate correctly when a supported Hunt Board expedition launches.
- Run settlements carry stable run/settlement identities, apply through bounded local receipt ledgers, and remain retryable in the active run if the profile write fails. Surface resource grants also roll back on failure, remain gatherable, and reject duplicate receipts.
- Generic and Huntforged crafting roll back their complete in-memory mutation when the canonical profile write fails.
- Executable lifecycle coverage now follows a solo hunter through Delve settlement and bonfire return, Deep Hunt extraction or boss clear, Huntforged crafting, and a fresh-storage reload. Multiplayer protocol coverage runs host/guest join, readiness, launch, extraction, direct/final-snapshot settlement recovery, replay/reload rejection, stale-snapshot rejection, and extraction reevaluation after departure.
- Transport hardening serializes relay POSTs, degrades cleanly on non-OK responses, rejects stale monotonic snapshots, and reevaluates combat, extraction choice, or wipe immediately when a hunter leaves.
- The ChatGPT Site deployment adds an HTTP multiplayer relay for different browsers/devices; this split-source package retains the same-browser `BroadcastChannel` fast path and gracefully falls back when that relay endpoint is unavailable.

These protections harden the free local/host-browser prototype; they do not add production authentication, server-owned characters, authoritative simulation, host migration, or durable mid-run reconnect. Those remain online-gated roadmap work.

## Source layout

- `index.html` — shell and UI markup
- `css/game.css` — game UI and presentation
- `js/save-system.js` — pure local save validation, v0.14 compatibility normalization, export/import, and recovery
- `js/world-contracts.js` — pure Emberwatch/Emberwood spawn and exact-interaction route contracts
- `js/game.js` — current gameplay source
- `assets/` — extracted sprites/textures previously embedded as base64
- `site/` — versioned private Site shell, worker, relay, migration, and locked build; `public/game` is generated from root source
- `scripts/materialize-site.mjs` — safely produces a complete deployable Site tree without creating a second editable game source
- `tests/extraction-lifecycle.test.mjs` — deterministic solo Delve/Deep Hunt, settlement, crafting, bonfire-return, and reload coverage
- `tests/multiplayer-protocol.test.mjs` — deterministic two-player settlement delivery/replay plus snapshot-order and party-departure coverage
- `migration_manifest.json` — historical record of the original bundled-HTML extraction; its source-size fields are provenance, not live build metrics

The source is intentionally only split at the asset/CSS/JS boundary for the first migration. Future refactors should split `game.js` subsystem-by-subsystem while keeping behavior and saves stable.

## QA release bundle

Run `node scripts/build-bundle.mjs` to regenerate the self-contained browser build at
`release/ASHFALL_Huntbound_Alpha_v0.14.0_Open_World.html`. The bundle is generated
directly from the split source and embeds all 57 canonical assets.

Run `npm test` to check syntax, the stable save key and ten-slot definitions, current/legacy save compatibility, failure-safe import/recovery, executable golden routes, full solo extraction/crafting/reload behavior, multiplayer protocol behavior, critical source wiring, v0.14 asset integrity, release parity, and Site materialization. Individual lifecycle and protocol checks are available as `npm run test:lifecycle` and `npm run test:multiplayer`. Run `npm run build` after changing split source or assets.

The exact-57 asset invariant intentionally freezes the canonical v0.14 manifest. A later milestone that adds art must update the manifest expectation and content version deliberately; it must not weaken the existing-file checks silently.

## Private Site reproduction

Run `npm run site:materialize -- --out <empty-directory>` to combine `site/` with the canonical game source. The materializer is dependency-free, rejects broad/nonempty destinations unless explicitly forced, and is covered by byte-parity tests. The Site remains owner-only unless the owner separately approves an access-policy change.

The current relay stays within the existing free-only architecture: no R2, paid database, hosted game server, marketplace service, or external authentication vendor. Polling now backs off while idle, new rooms use six-character codes, and schema DDL no longer runs on every request. Provider quotas can change, so any change capable of creating a charge still requires explicit approval.
