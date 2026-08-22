# Road Wolf v1 — board normalization

The approved Road Wolf shipped as a presentation board, not an engine atlas. These scripts
turn `assets/monsters/common/road_wolf/source/road_wolf_approved_sheet.png` into the
transparent, bottom-center-anchored atlas the renderer loads.

Run from the repository root:

```bash
node tools/road-wolf-normalize/segment.mjs assets/monsters/common/road_wolf/source/road_wolf_approved_sheet.png /tmp/wolfseg
node tools/road-wolf-normalize/compose.mjs assets/monsters/common/road_wolf/source/road_wolf_approved_sheet.png /tmp/wolfseg/blobs.json assets/monsters/common/road_wolf/road_wolf.atlas.png
```

`segment.mjs` masks to the panel interiors named in `road_wolf.crop-map.json`, finds
connected components, splits the panels where poses overlap, and writes `blobs.json` plus a
`debug.png` with every accepted box drawn — check that image before trusting a re-run.

`compose.mjs` reads the frame selections in its `SEQ` table, keys them to blob indices from
`blobs.json`, drops the board background to transparent, fills interior holes, downscales
0.75 with area averaging, and lays the frames out 6 columns × 15 rows at 128×96 with the
anchor at (64, 89).

`png.mjs` is a dependency-free 8-bit PNG codec so this runs on a bare Node install.

Re-running `segment.mjs` after editing the crop map can renumber blobs; if it does, the
`SEQ` table in `compose.mjs` needs the new indices.
