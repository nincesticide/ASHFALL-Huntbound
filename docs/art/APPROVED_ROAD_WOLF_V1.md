# Approved Road Wolf v1

This bundle contains the approved high-detail Road Wolf animation design.

## Scope

- Replace standard enemy kind `wolf` only.
- Do **not** replace `direwolf` / Direfang Alpha.
- Do not alter AI, stats, collision, targeting, multiplayer, deterministic simulation, saves, loot, or progression.

## Approved animations

- Idle: 4 frames
- Walk: 6 frames
- Attack: 6 frames; visual impact at frame 4
- Hit: 3 frames
- Death: 6 frames with a short final-frame hold
- South, north and east facings; west may mirror east

## Visual requirements

Preserve the approved black-brown fur, pale eyes, scars, cold-blue rim light, contact shadow, strong quadruped silhouette and three-quarter top-down perspective. The source board must be normalized into transparent, consistently anchored frames before game ingestion.

## Production output expected from Codex

```text
assets/monsters/common/road_wolf/
  road_wolf.atlas.png
  road_wolf.sprite.json
  road_wolf.crop-map.json
  road_wolf.preview.html
```

The game must retain its current procedural wolf renderer as an asset-load fallback.
