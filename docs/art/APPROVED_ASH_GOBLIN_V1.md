# Approved Ash Goblin Animated Sprite v1

This package replaces the regular goblin-family presentation with the approved high-detail Ash Goblin artwork while preserving all gameplay and security behavior.

## Temporary visual mapping

- `goblin` — Ash Goblin
- `gutterling` — Gutter Bombardier mechanics, temporarily displayed with the approved Ash Goblin atlas

Explicitly excluded:

- `bossgoblin`
- The Gutter King
- every non-goblin enemy

## Included animation states

- Idle — four frames at 5 FPS, looping
- Walk — six frames at 10 FPS, looping
- Attack — six frames at 12 FPS, impact presentation on frame 4
- Special / poison toss — six frames at 10 FPS, release presentation on frame 4
- Hit — three frames at 12 FPS
- Death — six frames at 8 FPS, with final-frame hold

The atlas uses 96×96 transparent cells, a bottom-center `(48, 87)` anchor, and four directional rows. Logical collision remains one tile.

## Runtime behavior

The integration is presentation-only:

- existing combat resolves independently of animation;
- existing attack and hit timestamps drive the visual state;
- movement is visually interpolated without changing pathfinding;
- death is queued visually after authoritative kill resolution;
- elite, target and HP overlays remain separate;
- failed asset loads fall back to the existing procedural renderer.

## Source integrity boundary

The materializer patches only `js/game.js`, then rebuilds the existing generated release artifact. It does not alter authentication, remote room authority, replay protection, persistence schemas, saves, deterministic RNG, enemy stats, AI, loot, targeting, collision or boss assets.
