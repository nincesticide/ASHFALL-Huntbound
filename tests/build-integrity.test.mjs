// Static guards for the four defects that shipped in v0.14.1. Each of these would have
// failed on the released build; none of them needs a browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game = fs.readFileSync('js/game.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const hudCss = fs.readFileSync('css/battlefield-hud.css', 'utf8');

test('every inline event handler resolves to a global', () => {
  const exported = new Set([...game.matchAll(/window\.([A-Za-z0-9_$]+)\s*=/g)].map(m => m[1]));
  const referenced = new Set();
  for (const src of [game, html]) {
    for (const m of src.matchAll(/\bon(?:click|change|input|submit|keyup|keydown)\s*=\s*["']([A-Za-z0-9_$]+)\s*\(/g)) {
      referenced.add(m[1]);
    }
  }
  const unreachable = [...referenced].filter(fn => !exported.has(fn)).sort();
  assert.deepEqual(
    unreachable, [],
    `inline handlers not exported to window (they throw when clicked): ${unreachable.join(', ')}`
  );
});

test('the battlefield HUD lives inside the game scope it patches', () => {
  // initBattleHudV141 reassigns renderAll and movementOverlayOpen, which are bindings
  // inside game.js's IIFE. Loading it as a second script cannot work.
  assert.match(game, /function buildBattleHudV141\(\)/);
  assert.match(game, /const baseRenderAll=renderAll;renderAll=function\(\)/);
  assert.ok(!fs.existsSync('js/battlefield-hud.js'), 'js/battlefield-hud.js should no longer exist');
  assert.ok(!html.includes('battlefield-hud.js'), 'index.html should not load the HUD as a separate script');
});

test('HUD init is guarded and only then unlocks the destructive stylesheet', () => {
  assert.match(game, /catch\(err\)\{console\.error\('Battlefield HUD failed to initialize/);
  assert.match(game, /if\(!built\)return false;\s*document\.body\.classList\.add\('hud141'\)/);
});

test('no HUD stylesheet rule restructures the page without body.hud141', () => {
  const stripped = hudCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = new Set();
  let depth = 0, buf = '';
  for (const ch of stripped) {
    if (ch === '{') { if (depth === 0) selectors.add(buf.trim()); depth++; buf = ''; }
    else if (ch === '}') { depth--; buf = ''; }
    else if (depth === 0) buf += ch;
  }
  const ungated = [...selectors].filter(s =>
    s && !s.startsWith('@') && s !== ':root' && !s.includes('v141') && !s.includes('hud141'));
  assert.deepEqual(
    ungated, [],
    `these rules apply even when the HUD failed to build: ${ungated.join(' | ')}`
  );
});

test('a corrupt profile store is backed up instead of silently replaced', () => {
  assert.match(game, /const PROFILE_BACKUP_KEY=/);
  // The old code was: catch(e){return{}} — which persistProfile then wrote back over the roster.
  assert.ok(
    !/function loadProfiles\(\)\{try\{return JSON\.parse\(localStorage\.getItem\(PROFILE_KEY\)\|\|'\{\}'\)\}catch\(e\)\{return\{\}\}\}/.test(game),
    'loadProfiles still swallows a parse failure and returns an empty roster'
  );
  assert.match(game, /if\(localStorage\.getItem\(PROFILE_BACKUP_KEY\)==null\)localStorage\.setItem\(PROFILE_BACKUP_KEY,raw\)/);
  assert.match(game, /profileStoreUnreadable=true/);
});

test('writing the profile store handles a full or blocked quota', () => {
  const save = game.match(/function saveProfiles\(p\)\{[\s\S]*?\n\}/);
  assert.ok(save, 'saveProfiles not found');
  assert.match(save[0], /try\{/);
  assert.match(save[0], /catch\(e\)\{/);
  assert.match(save[0], /QuotaExceededError/);
});
