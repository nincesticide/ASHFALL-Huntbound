# ASHFALL Standard-Mob Sprite Pipeline

This directory is intentionally isolated from the live `game.js` renderer so art production can proceed in parallel with security, persistence, and online-session work.

## Current pilot pack

Animation-ready atlases now exist for four representative rigs:

- `wolf` → Road Wolf / quadruped
- `goblin` → Ash Goblin / small humanoid
- `spider` → Gloam Spider / arachnid
- `wraith` → Bell Wraith / spectral/floating

Each pilot includes:

- 64×64 transparent frame cells
- south, side, and north directions
- mirrored side direction for west
- 6-frame idle
- 6-frame walk
- 6-frame basic attack
- 6-frame special attack
- 6-frame hit reaction
- 6-frame death
- JSON timing/event metadata

The atlases are SVG rig masters so they remain text-reviewable in Git and can be exported to PNG later without changing the manifest contract. They are implementation pilots, not a claim that all final painted monster artwork is complete.

## Integration

Load `js/mob-sprite-runtime.js`, initialize `AshfallMobSprites.MobSpriteLibrary`, and call `draw(...)`. The runtime returns `false` for unconverted monsters so the existing procedural renderer can remain as a fallback.

Preview the pilot in `tools/mob-sprite-preview.html`.

## Conflict boundary

This branch does not modify the authoritative combat, multiplayer, security, persistence, or session-resolution code. Integration into `game.js` should occur only after the current online/security branch is ready to accept renderer changes.
