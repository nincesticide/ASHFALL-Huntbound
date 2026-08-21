# ASHFALL v0.14.1 Battlefield HUD

This patch converts the persistent combat UI into a battlefield-first layout.

## Included

- `ASHFALL_v0.14.1_Battlefield_HUD.css` — HUD layout and presentation overrides.
- `ASHFALL_v0.14.1_Battlefield_HUD.js` — DOM migration, Hunt Map overlay, drawers, target frame, responsive HUD state.

## Behavior

- The game canvas owns the center of the viewport.
- HP/resource and six combat actions live in a dedicated bottom dock outside the canvas.
- The selected target appears in a compact top-center frame.
- Objectives remain upper-left and can collapse.
- Minimap and compact utility buttons remain upper-right.
- Party, meters, loot, and log open as drawers and are closed by default.
- Deep Hunt route map opens with `M` and closes with `M` or `Esc`.
- Route choices appear temporarily above the hotbar.

## Integration

The playable v0.14.1 QA HTML already contains this patch. When moving it into split source, append the CSS patch after the existing game CSS and load/append the JS patch after existing game functions but before final initialization. The patch calls `initBattleHudV141()` during initialization and wraps `renderAll()`.

## QA resolutions

Tested without page errors at 1366×768, 1920×1080, and 2560×1440 using a lightweight asset build. Target selection, Hunt Map, and Party drawer were also exercised.
