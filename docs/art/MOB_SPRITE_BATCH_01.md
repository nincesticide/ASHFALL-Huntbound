# Mob Sprite Batch 01 — Frontier Completion

Branch: `art/mob-sprites-v1`

This batch continues standard-mob art in parallel with the security and play-session work. It does not modify `game.js`, networking, persistence, save data, combat authority, or settlement authority.

## Animation-ready mobs

### Emberback Boar

- Rig: quadruped
- Basic attack: tusk rush
- Special: **Cinder Charge**
- Special event: `charge_dust`
- Readable features: white tusks, ember cracks, heavy boar silhouette

### Briar Thornling

- Rig: plant brute
- Basic attack: branch swipe
- Special: **Briar Burst**
- Special event: `thorn_burst`
- Readable features: orange core-eyes, root legs, thorn crown

### Gutter Bombardier

- Rig: small humanoid ranged
- Basic attack: thrown bomb
- Special: **Powder Keg**
- Special event: `bomb_explosion`
- Readable features: scrap helmet, bomb satchel, live fuse

## Shared elite overlays

- Frenzied
- Armored
- Vampiric
- Golden Quarry

The overlays are transparent animation layers intended to render above compatible standard-mob sprites. They do not require duplicated full monster atlases.

## Shared animation contract

- 64×64 transparent frame cells
- south, side, and north directions
- west mirrored from side
- 6-frame idle
- 6-frame walk
- 6-frame basic attack
- 6-frame special attack
- 6-frame hit reaction
- 6-frame death
- basic damage event on frame 4
- special event on frame 4

## Generation and validation

`tools/generate-mob-batch-01.js` creates the SVG atlases and JSON manifests. The isolated GitHub workflow validates all generated JSON and SVG files before committing them to the art branch.

## Integration boundary

The generated files are renderer inputs only. `MobSpriteLibrary` continues to return `false` for unavailable sprites, so the procedural renderer remains the fallback until the security/session branch has a safe renderer-integration window.
