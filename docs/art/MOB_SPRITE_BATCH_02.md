# Mob Sprite Batch 02 — Ashfall Hollow Undead

Batch 02 adds three animation-ready standard-mob rigs for the Ashfall Hollow roster:

- `bonearcher` → **Bone Archer**
- `gravehusk` → **Grave Husk**
- `skeleton` → **Restless Dead**

## Animation contract

Each rig follows the established monster pipeline:

- 64×64 transparent frame cells
- 6 columns
- south, side and north facings
- west mirrored from side
- 6-frame idle
- 6-frame walk
- 6-frame basic attack
- 6-frame special attack
- 6-frame hit reaction
- 6-frame death
- bottom-center anchor
- basic damage event on frame 4
- special event marker on frame 4

## Attack identities

| Enemy | Basic attack | Special | Runtime event |
|---|---|---|---|
| Bone Archer | Bone arrow | Bone Volley | `bone_volley` |
| Grave Husk | Corpse Slam | Grave Burst | `grave_burst` |
| Restless Dead | Rusted Slash | Grave Lunge | `grave_lunge` |

## Art direction

### Bone Archer

- exposed ivory bones and grave-dark wrappings
- oversized readable bow silhouette
- pale-blue spectral arrows during Bone Volley
- death animation collapses the skeleton rather than fading it intact

### Grave Husk

- massive corpse-brute silhouette
- broad shoulders, swollen torso and dragging weight
- earth-green necrotic accents
- Grave Burst produces radial grave-energy and bone-shard FX

### Restless Dead

- lighter undead melee silhouette than Grave Husk
- rusted sword and ragged burial cloth
- cold grave-light attack trails
- Grave Lunge has a readable forward spectral arc

## Integration boundary

This batch is art/runtime-only. It does **not** modify:

- `js/game.js`
- combat resolution
- multiplayer or room authority
- security/session work
- saves and persistence
- loot or balance

The procedural enemy renderer remains the fallback until the active security/session PR is ready to accept renderer changes.

## Planned output

```text
assets/monsters/common/bone_archer/
  bone_archer.atlas.svg
  bone_archer.sprite.json
assets/monsters/common/grave_husk/
  grave_husk.atlas.svg
  grave_husk.sprite.json
assets/monsters/common/restless_dead/
  restless_dead.atlas.svg
  restless_dead.sprite.json
assets/monsters/batches/batch-02.manifest.json
tools/mob-sprite-batch-02-preview.html
```

## Acceptance checklist

- [x] animation timing and event contract defined
- [x] three distinct rig silhouettes designed
- [x] contact-sheet preview generated
- [x] deterministic generator prepared
- [ ] generated atlases materialized in the branch
- [ ] browser preview smoke-tested from GitHub output
- [ ] renderer ingestion performed after the security/session conflict window closes
