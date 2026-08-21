# ASHFALL / Huntbound — v0.14.0 Open World

Canonical split-source game client and QA release package for ASHFALL. The current ChatGPT Site shell, D1 relay handler, and hosting configuration still live in the private Site workspace and must be migrated here before this repository can reproduce cross-browser hosting by itself.

See [ROADMAP.md](ROADMAP.md) for the approved product direction and milestone gates, [docs/BACKLOG.md](docs/BACKLOG.md) for categorized work and acceptance criteria, and [docs/ONLINE_ARCHITECTURE.md](docs/ONLINE_ARCHITECTURE.md) for the proposed path to authoritative online play.

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
- The ChatGPT Site deployment adds an HTTP multiplayer relay for different browsers/devices; this split-source package retains the same-browser `BroadcastChannel` fast path and gracefully falls back when that relay endpoint is unavailable.

## Source layout

- `index.html` — shell and UI markup
- `css/game.css` — game UI and presentation
- `js/game.js` — current gameplay source
- `assets/` — extracted sprites/textures previously embedded as base64

The source is intentionally only split at the asset/CSS/JS boundary for the first migration. Future refactors should split `game.js` subsystem-by-subsystem while keeping behavior and saves stable.

## QA release bundle

Run `node scripts/build-bundle.mjs` to regenerate the self-contained browser build at
`release/ASHFALL_Huntbound_Alpha_v0.14.0_Open_World.html`. The bundle is generated
directly from the split source and embeds all 57 canonical assets.

Run `npm test` to check syntax, the stable save key and ten-slot definitions, critical world-return and interaction source wiring, v0.14 asset integrity, and release parity. These are regression invariants, not functional save-migration or browser-play tests. Run `npm run build` after changing split source or assets.

The exact-57 asset invariant intentionally freezes the canonical v0.14 manifest. A later milestone that adds art must update the manifest expectation and content version deliberately; it must not weaken the existing-file checks silently.
