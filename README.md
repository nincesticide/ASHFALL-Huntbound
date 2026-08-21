# ASHFALL / Huntbound — v0.14.0 Open World

Canonical split-source development package for ASHFALL.

## v0.14 foundation
- Emberwatch is the persistent hub.
- The North Gate leads to Emberwood Lowlands surface exploration.
- Surface mobs, elites, resources, contracts, caches, and Delve entrances coexist with the existing Hunt Board.
- Deep Hunts and Delves preserve extraction gameplay.
- Huntforged equipment retains the Tempered → Masterworked → Awakened identity path.
- Existing localStorage character/save compatibility is preserved.

## Source layout
- `index.html` — shell and UI markup
- `css/game.css` — game UI and presentation
- `js/game.js` — current gameplay source
- `assets/` — extracted sprites/textures previously embedded as base64

The source is intentionally only split at the asset/CSS/JS boundary for the first migration. Future refactors should split `game.js` subsystem-by-subsystem while keeping behavior and saves stable.
