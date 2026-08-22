// Segment the Road Wolf presentation board into sprite blobs.
// Outputs: blobs.json (bboxes classified by panel) + debug.png (bboxes drawn).
import fs from 'node:fs';
import { decodePng, encodePng } from './png.mjs';

const SRC = process.argv[2];
const OUTDIR = process.argv[3];
const img = decodePng(fs.readFileSync(SRC));
const { width: W, height: H, data } = img;
console.log(`board ${W}x${H}`);

// Background estimate: median color over a sparse grid.
const rs = [], gs = [], bs = [];
for (let y = 0; y < H; y += 7) for (let x = 0; x < W; x += 7) {
  const i = (y * W + x) * 4;
  rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]);
}
const med = a => a.sort((p, q) => p - q)[a.length >> 1];
const bg = [med(rs), med(gs), med(bs)];
console.log('bg estimate', bg);

const THRESH = 22;
// Only pixels inside a crop-map panel interior count as candidate foreground;
// the decorative frame, labels, and divider lines all live in the gutters.
const COLS_M = [[105, 345], [360, 596], [605, 855], [865, 1095], [1110, 1400]];
const BANDS_M = [[100, 425], [440, 758], [770, 1048]];
const inPanel = (x, y) => COLS_M.some(([a, b]) => x >= a && x <= b) && BANDS_M.some(([a, b]) => y >= a && y <= b);
const fg = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (!inPanel(x, y)) continue;
  const i = (y * W + x) * 4;
  const d = Math.max(Math.abs(data[i] - bg[0]), Math.abs(data[i + 1] - bg[1]), Math.abs(data[i + 2] - bg[2]));
  if (d > THRESH) fg[y * W + x] = 1;
}

// Connected components, 8-connectivity, iterative flood fill.
const label = new Int32Array(W * H).fill(-1);
const blobs = [];
const stack = new Int32Array(W * H);
for (let start = 0; start < W * H; start++) {
  if (!fg[start] || label[start] >= 0) continue;
  const id = blobs.length;
  let sp = 0; stack[sp++] = start; label[start] = id;
  let minX = W, maxX = 0, minY = H, maxY = 0, area = 0;
  while (sp > 0) {
    const p = stack[--sp];
    const px = p % W, py = (p / W) | 0;
    area++;
    if (px < minX) minX = px; if (px > maxX) maxX = px;
    if (py < minY) minY = py; if (py > maxY) maxY = py;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = px + dx, ny = py + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const np = ny * W + nx;
      if (fg[np] && label[np] < 0) { label[np] = id; stack[sp++] = np; }
    }
  }
  blobs.push({ minX, maxX, minY, maxY, area });
}
console.log(`raw components: ${blobs.length}`);

// Merge overlapping / near bboxes repeatedly.
const GAP = 3;
// Drop specks and line-like components (panel edges bleeding into panels) before merging.
let merged = blobs.filter(b => {
  const w = b.maxX - b.minX + 1, h = b.maxY - b.minY + 1;
  if (b.area < 12) return false;
  if ((w > 200 && h <= 6) || (h > 200 && w <= 6)) return false;
  return true;
});
let changed = true;
while (changed) {
  changed = false;
  outer: for (let i = 0; i < merged.length; i++) {
    for (let j = i + 1; j < merged.length; j++) {
      const a = merged[i], b = merged[j];
      if (a.minX - GAP <= b.maxX && b.minX - GAP <= a.maxX && a.minY - GAP <= b.maxY && b.minY - GAP <= a.maxY) {
        a.minX = Math.min(a.minX, b.minX); a.maxX = Math.max(a.maxX, b.maxX);
        a.minY = Math.min(a.minY, b.minY); a.maxY = Math.max(a.maxY, b.maxY);
        a.area += b.area;
        merged.splice(j, 1);
        changed = true;
        break outer;
      }
    }
  }
}

// Split oversized blobs (overlapping sprites) at foreground-projection valleys.
function projections(b) {
  const cols = new Array(b.maxX - b.minX + 1).fill(0);
  const rows = new Array(b.maxY - b.minY + 1).fill(0);
  for (let y = b.minY; y <= b.maxY; y++) for (let x = b.minX; x <= b.maxX; x++) {
    if (fg[y * W + x]) { cols[x - b.minX]++; rows[y - b.minY]++; }
  }
  return { cols, rows };
}
function tighten(b) {
  const { cols, rows } = projections(b);
  let x0 = 0; while (x0 < cols.length && cols[x0] === 0) x0++;
  let x1 = cols.length - 1; while (x1 > 0 && cols[x1] === 0) x1--;
  let y0 = 0; while (y0 < rows.length && rows[y0] === 0) y0++;
  let y1 = rows.length - 1; while (y1 > 0 && rows[y1] === 0) y1--;
  return { minX: b.minX + x0, maxX: b.minX + x1, minY: b.minY + y0, maxY: b.minY + y1, area: b.area };
}
function splitAxis(b, axis, maxSize) {
  const size = axis === 'x' ? b.maxX - b.minX + 1 : b.maxY - b.minY + 1;
  if (size <= maxSize) return [b];
  const proj = axis === 'x' ? projections(b).cols : projections(b).rows;
  const lo = axis === 'x' ? b.minX : b.minY;
  // Find the best valley in the middle 70%: prefer zero runs, else minimum sum.
  const margin = Math.max(20, Math.floor(size * 0.15));
  let best = -1, bestVal = Infinity;
  for (let i = margin; i < size - margin; i++) {
    if (proj[i] < bestVal) { bestVal = proj[i]; best = i; }
  }
  if (best < 0) return [b];
  const a = { ...b }, c = { ...b };
  if (axis === 'x') { a.maxX = lo + best; c.minX = lo + best + 1; }
  else { a.maxY = lo + best; c.minY = lo + best + 1; }
  const ta = tighten(a), tc = tighten(c);
  return [...splitAxis(ta, axis, maxSize), ...splitAxis(tc, axis, maxSize)];
}

// Keep sprite-sized blobs whose center lies inside the crop-map panel space.
const COLS = { idle: [105, 345], walk: [360, 596], attack: [605, 855], hit: [865, 1095], death: [1110, 1400] };
const BANDS = { south: [100, 425], north: [440, 758], east: [770, 1048] };
const finals = [];
for (const b0 of merged) {
  const w0 = b0.maxX - b0.minX + 1, h0 = b0.maxY - b0.minY + 1;
  const cx0 = (b0.minX + b0.maxX) / 2, cy0 = (b0.minY + b0.maxY) / 2;
  if (b0.area < 350 || w0 < 25 || h0 < 18) continue;
  let anim = null, dir = null;
  for (const [k, [x0, x1]] of Object.entries(COLS)) if (cx0 >= x0 - 15 && cx0 <= x1 + 15) anim = k;
  for (const [k, [y0, y1]] of Object.entries(BANDS)) if (cy0 >= y0 - 15 && cy0 <= y1 + 15) dir = k;
  if (!anim || !dir) continue;
  // Direction-specific max frame sizes: side (east) wolves are long; split anything bigger.
  const maxW = dir === 'east' ? 175 : 115;
  const maxH = 120;
  let parts = splitAxis(b0, 'y', maxH).flatMap(p => splitAxis(p, 'x', maxW));
  for (const b of parts) {
    const w = b.maxX - b.minX + 1, h = b.maxY - b.minY + 1;
    if (w < 25 || h < 18) continue;
    finals.push({ anim, dir, x: b.minX, y: b.minY, w, h, area: b.area });
  }
}

// Sort into sub-rows within each panel (gap>28px in y-centers starts a new row).
const panels = {};
for (const f of finals) {
  const key = `${dirName(f)}`;
  (panels[key] ||= []).push(f);
}
function dirName(f) { return `${f.anim}_${f.dir}`; }
for (const key of Object.keys(panels)) {
  const list = panels[key];
  list.sort((a, b) => (a.y + a.h / 2) - (b.y + b.h / 2));
  let row = 0, lastCy = -1e9;
  for (const f of list) {
    const cy = f.y + f.h / 2;
    if (cy - lastCy > 28) { if (lastCy > -1e8) row++; }
    f.row = row; lastCy = cy;
  }
  list.sort((a, b) => a.row - b.row || a.x - b.x);
  list.forEach((f, i) => { f.idx = i; });
}

fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(`${OUTDIR}/blobs.json`, JSON.stringify(panels, null, 1));

// Debug image: draw 2px red bbox borders on a copy.
const dbg = Buffer.from(data);
function rect(x0, y0, x1, y1, r, g, b) {
  for (let t = 0; t < 2; t++) {
    for (let x = Math.max(0, x0 - t); x <= Math.min(W - 1, x1 + t); x++) {
      for (const y of [y0 - t, y1 + t]) if (y >= 0 && y < H) { const i = (y * W + x) * 4; dbg[i] = r; dbg[i + 1] = g; dbg[i + 2] = b; }
    }
    for (let y = Math.max(0, y0 - t); y <= Math.min(H - 1, y1 + t); y++) {
      for (const x of [x0 - t, x1 + t]) if (x >= 0 && x < W) { const i = (y * W + x) * 4; dbg[i] = r; dbg[i + 1] = g; dbg[i + 2] = b; }
    }
  }
}
const colors = { idle: [255, 60, 60], walk: [60, 220, 60], attack: [255, 180, 40], hit: [80, 160, 255], death: [230, 80, 230] };
let count = 0;
for (const key of Object.keys(panels)) for (const f of panels[key]) { const c = colors[f.anim]; rect(f.x, f.y, f.x + f.w - 1, f.y + f.h - 1, ...c); count++; }
fs.writeFileSync(`${OUTDIR}/debug.png`, encodePng(W, H, dbg));

for (const key of Object.keys(panels).sort()) {
  const list = panels[key];
  console.log(`${key}: ${list.length} blobs -> ${list.map(f => `#${f.idx}[r${f.row}] ${f.w}x${f.h}@(${f.x},${f.y})`).join(' ')}`);
}
console.log(`kept ${count} blobs; debug at ${OUTDIR}/debug.png`);
