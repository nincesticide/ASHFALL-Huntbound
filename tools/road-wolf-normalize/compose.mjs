// Compose the Road Wolf atlas from segmented board blobs.
import fs from 'node:fs';
import { decodePng, encodePng } from './png.mjs';

const SRC = process.argv[2], BLOBS = process.argv[3], OUT = process.argv[4];
const img = decodePng(fs.readFileSync(SRC));
const { width: W, height: H, data } = img;
const panels = JSON.parse(fs.readFileSync(BLOBS, 'utf8'));

const BG = [10, 15, 19], THRESH = 22, SCALE = 0.75;
const CELL_W = 128, CELL_H = 96, ANCHOR_X = 64, ANCHOR_Y = 89;

// Frame selections: arrays of blob-index groups; each group of indices is one frame (union).
const SEQ = {
  idle_south: [[0], [1], [2], [1]],
  idle_east: [[0], [1], [2], [1]],
  idle_north: [[0], [1], [2], [1]],
  walk_south: [[0], [1], [2], [0], [1], [2]],
  walk_east: [[0], [1], [2], [3], [4], [5]],
  walk_north: [[0], [1], [2], [0], [1], [2]],
  attack_south: [[0], [1], [2], [3], [4], [5, 6]],
  attack_east: [[0], [1], [3], [2], [4, 5], [4, 5]],
  attack_north: [[0], [1], [2], [3], [4], [5, 6]],
  hit_south: [[0], [1], [2]],
  hit_east: [[0], [1], [3]],
  hit_north: [[0], [1], [2]],
  death_south: [[0], [1], [2, 3], [4, 5], [6], [6]],
  death_east: [[0], [1], [2, 5], [3, 4], [3, 4], [3, 4]],
  death_north: [[0], [1], [2, 3], [4], [5, 6], [5, 6]],
};
const ROW_ORDER = [
  'idle_south', 'idle_east', 'idle_north',
  'walk_south', 'walk_east', 'walk_north',
  'attack_south', 'attack_east', 'attack_north',
  'hit_south', 'hit_east', 'hit_north',
  'death_south', 'death_east', 'death_north',
];

const colorDist = i => Math.max(Math.abs(data[i] - BG[0]), Math.abs(data[i + 1] - BG[1]), Math.abs(data[i + 2] - BG[2]));

// Extract one frame: union of constituent rects -> RGBA sprite with soft alpha.
function extractFrame(rects) {
  const minX = Math.min(...rects.map(r => r.x)), minY = Math.min(...rects.map(r => r.y));
  const maxX = Math.max(...rects.map(r => r.x + r.w - 1)), maxY = Math.max(...rects.map(r => r.y + r.h - 1));
  const fw = maxX - minX + 1, fh = maxY - minY + 1;
  const fgm = new Uint8Array(fw * fh);
  for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
    if (colorDist(((minY + y) * W + (minX + x)) * 4) > THRESH) fgm[y * fw + x] = 1;
  }
  // Connected components (8-conn); keep components intersecting a constituent rect
  // and at least 3% the size of the largest kept, to shed neighbor-sprite bleed.
  const lbl = new Int32Array(fw * fh).fill(-1);
  const comps = [];
  const stack = new Int32Array(fw * fh);
  for (let s = 0; s < fw * fh; s++) {
    if (!fgm[s] || lbl[s] >= 0) continue;
    const id = comps.length;
    let sp = 0; stack[sp++] = s; lbl[s] = id;
    const px = [];
    while (sp > 0) {
      const p = stack[--sp]; px.push(p);
      const x = p % fw, y = (p / fw) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= fw || ny >= fh) continue;
        const np = ny * fw + nx;
        if (fgm[np] && lbl[np] < 0) { lbl[np] = id; stack[sp++] = np; }
      }
    }
    comps.push(px);
  }
  const inRect = p => {
    const x = p % fw + minX, y = ((p / fw) | 0) + minY;
    return rects.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  };
  const biggest = Math.max(...comps.map(c => c.length));
  const keep = new Uint8Array(fw * fh);
  for (const c of comps) {
    if (c.length < Math.max(10, biggest * 0.03)) continue;
    if (!c.some(inRect)) continue;
    for (const p of c) keep[p] = 1;
  }
  // Fill interior holes: flood non-kept from border; unreached non-kept = hole.
  const outside = new Uint8Array(fw * fh);
  let sp = 0;
  for (let x = 0; x < fw; x++) { for (const y of [0, fh - 1]) { const p = y * fw + x; if (!keep[p] && !outside[p]) { outside[p] = 1; stack[sp++] = p; } } }
  for (let y = 0; y < fh; y++) { for (const x of [0, fw - 1]) { const p = y * fw + x; if (!keep[p] && !outside[p]) { outside[p] = 1; stack[sp++] = p; } } }
  while (sp > 0) {
    const p = stack[--sp], x = p % fw, y = (p / fw) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= fw || ny >= fh) continue;
      const np = ny * fw + nx;
      if (!keep[np] && !outside[np]) { outside[np] = 1; stack[sp++] = np; }
    }
  }
  const rgba = Buffer.alloc(fw * fh * 4);
  for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
    const p = y * fw + x, si = ((minY + y) * W + (minX + x)) * 4, di = p * 4;
    const solid = keep[p] || (!outside[p]);
    if (solid) {
      rgba[di] = data[si]; rgba[di + 1] = data[si + 1]; rgba[di + 2] = data[si + 2]; rgba[di + 3] = 255;
    } else {
      // Soft edge: near-mask pixels fade in by color distance.
      let nearMask = false;
      for (let dy = -1; dy <= 1 && !nearMask; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < fw && ny < fh && keep[ny * fw + nx]) { nearMask = true; break; }
      }
      if (nearMask) {
        const d = colorDist(si);
        const a = Math.max(0, Math.min(255, Math.round((d / THRESH) * 160)));
        rgba[di] = data[si]; rgba[di + 1] = data[si + 1]; rgba[di + 2] = data[si + 2]; rgba[di + 3] = a;
      }
    }
  }
  return { w: fw, h: fh, rgba };
}

// Area-average downscale with alpha premultiply.
function scaleFrame(f, s) {
  const nw = Math.max(1, Math.round(f.w * s)), nh = Math.max(1, Math.round(f.h * s));
  const out = Buffer.alloc(nw * nh * 4);
  for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
    const x0 = x / s, x1 = (x + 1) / s, y0 = y / s, y1 = (y + 1) / s;
    let r = 0, g = 0, b = 0, a = 0, wsum = 0;
    for (let sy = Math.floor(y0); sy < Math.min(f.h, Math.ceil(y1)); sy++) {
      const wy = Math.min(y1, sy + 1) - Math.max(y0, sy);
      for (let sx = Math.floor(x0); sx < Math.min(f.w, Math.ceil(x1)); sx++) {
        const wx = Math.min(x1, sx + 1) - Math.max(x0, sx);
        const wgt = wx * wy, i = (sy * f.w + sx) * 4, al = f.rgba[i + 3] / 255;
        r += f.rgba[i] * al * wgt; g += f.rgba[i + 1] * al * wgt; b += f.rgba[i + 2] * al * wgt;
        a += al * wgt; wsum += wgt;
      }
    }
    const di = (y * nw + x) * 4;
    if (a > 0.001) {
      out[di] = Math.round(r / a); out[di + 1] = Math.round(g / a); out[di + 2] = Math.round(b / a);
      out[di + 3] = Math.min(255, Math.round((a / wsum) * 255));
    }
  }
  return { w: nw, h: nh, rgba: out };
}

// Trim to the visible bounding box so every frame's ground line lands on the anchor.
// Without this, stray soft-alpha rows left by segmentation shift frames by several pixels
// and the wolf visibly bobs through a walk cycle.
const ALPHA_FLOOR = 40;
function trimFrame(f) {
  let x0 = f.w, x1 = -1, y0 = f.h, y1 = -1;
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
    if (f.rgba[(y * f.w + x) * 4 + 3] >= ALPHA_FLOOR) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return f;
  const nw = x1 - x0 + 1, nh = y1 - y0 + 1;
  const out = Buffer.alloc(nw * nh * 4);
  for (let y = 0; y < nh; y++) {
    f.rgba.copy(out, y * nw * 4, ((y + y0) * f.w + x0) * 4, ((y + y0) * f.w + x0 + nw) * 4);
  }
  return { w: nw, h: nh, rgba: out };
}

const atlas = Buffer.alloc(6 * CELL_W * ROW_ORDER.length * CELL_H * 4);
const ATLAS_W = 6 * CELL_W;
let report = [];
ROW_ORDER.forEach((key, row) => {
  const blobs = panels[key];
  const seq = SEQ[key];
  if (!blobs || !seq) throw new Error(`missing ${key}`);
  seq.forEach((group, col) => {
    const rects = group.map(i => {
      const b = blobs.find(bb => bb.idx === i);
      if (!b) throw new Error(`${key}: blob #${i} not found`);
      return b;
    });
    const frame = trimFrame(scaleFrame(extractFrame(rects), SCALE));
    // Anchor: bottom-center of sprite at (ANCHOR_X, ANCHOR_Y) in the cell.
    const ox = col * CELL_W + ANCHOR_X - Math.round(frame.w / 2);
    const oy = row * CELL_H + ANCHOR_Y - frame.h;
    for (let y = 0; y < frame.h; y++) for (let x = 0; x < frame.w; x++) {
      const tx = ox + x, ty = oy + y;
      if (tx < col * CELL_W || tx >= (col + 1) * CELL_W || ty < row * CELL_H || ty >= (row + 1) * CELL_H) continue;
      const si = (y * frame.w + x) * 4, di = (ty * ATLAS_W + tx) * 4;
      atlas[di] = frame.rgba[si]; atlas[di + 1] = frame.rgba[si + 1]; atlas[di + 2] = frame.rgba[si + 2]; atlas[di + 3] = frame.rgba[si + 3];
    }
    report.push(`${key}[${col}] <- blobs ${group.join('+')} -> ${frame.w}x${frame.h}`);
  });
});
fs.writeFileSync(OUT, encodePng(ATLAS_W, ROW_ORDER.length * CELL_H, atlas));
console.log(report.join('\n'));
console.log(`atlas: ${OUT} (${ATLAS_W}x${ROW_ORDER.length * CELL_H})`);
