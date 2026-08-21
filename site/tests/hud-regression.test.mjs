import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [indexSource, cssSource, gameSource] = await Promise.all([
  readFile(new URL("../public/game/index.html", import.meta.url), "utf8"),
  readFile(new URL("../public/game/css/game.css", import.meta.url), "utf8"),
  readFile(new URL("../public/game/js/game.js", import.meta.url), "utf8"),
]);

test("combat controls use a compact six-command bar with accessible shortcuts", () => {
  assert.match(indexSource, /class="panel actions-panel-v141 command-bar-v148"/);
  assert.match(indexSource, /id="actionHint" role="status" aria-live="polite"/);
  assert.match(indexSource, /id="targetInfo"[^>]+tabindex="0"/);

  const compactLayer = cssSource.slice(cssSource.indexOf("v0.14.8 CONTEXT-AWARE COMBAT COMMAND BAR"));
  assert.match(compactLayer, /grid-template-columns:repeat\(6,54px\)!important/);
  assert.match(compactLayer, /grid-template-columns:repeat\(6,52px\)!important/);
  assert.doesNotMatch(compactLayer, /grid-template-columns:repeat\(3,/);
  assert.match(compactLayer, /body\.mode-run-v141 \.prompt\{display:none!important\}/);

  for (const [id, key] of [
    ["attackBtn", "1"],
    ["skill1Btn", "2"],
    ["skill2Btn", "3"],
    ["guardBtn", "4"],
    ["potionBtn", "5"],
    ["reviveBtn", "6"],
  ]) {
    assert.match(gameSource, new RegExp(`\\["${id}"[^\\n]+"${key}"\\]`));
  }
  assert.match(gameSource, /setAttribute\('aria-keyshortcuts',key\)/);
});

test("command bar progressively discloses target detail and collapses for non-action phases", () => {
  for (const state of ["frozen", "choice", "path", "settlement", "incapacitated", "submitted", "active", "resolving"]) {
    assert.match(gameSource, new RegExp(`commandState='${state}'`));
  }
  assert.match(gameSource, /class="target-ribbon-v148"/);
  assert.match(gameSource, /class="target-detail-card-v148"/);
  assert.match(cssSource, /\.target-detail-card-v148\{[\s\S]*?display:none/);
  assert.match(cssSource, /#targetInfo:hover \.target-detail-card-v148[^{]*\{display:block\}/);
  assert.match(cssSource, /data-command-state="choice"\] \.actions/);
  assert.match(cssSource, /data-command-state="submitted"\] \.actions>button:not\(#cancelActionV131\)/);
  assert.match(cssSource, /data-command-state="settlement"\] \.actions>button:not\(#retrySettlementV145\)/);
});

test("HUD context automatically prioritizes map, party, and vitals by play mode", () => {
  assert.match(gameSource, /const HUD_CONTEXT_V148=\{mode:null\}/);
  assert.match(gameSource, /if\(mode==='run'\)\{setHudPanelV141\('party',true\);setHudPanelV141\('intel',false\)\}/);
  assert.match(gameSource, /else if\(mode==='world'\)\{setHudPanelV141\('party',false\);setHudPanelV141\('intel',true\)\}/);
  assert.match(gameSource, /else if\(mode==='camp'\)\{setHudPanelV141\('party',true\);setHudPanelV141\('intel',false\)\}/);
  assert.match(cssSource, /body\.mode-run-v141 #targetBadge\{display:none\}/);
  assert.match(cssSource, /body\.mode-run-v141 \.hud-dock-v132\{width:238px\}/);
  assert.match(cssSource, /body\.mode-run-v141 \.hud-drawer-v141\[data-hud-panel="party"\]\{width:224px/);
});

test("combat button handlers preserve the canonical gameplay actions", () => {
  assert.match(gameSource, /\$\('attackBtn'\)\.onclick=\(\)=>submitAction\(\{type:'attack'/);
  assert.match(gameSource, /\$\('skill1Btn'\)\.onclick=\(\)=>submitAction\(\{type:'skill1'/);
  assert.match(gameSource, /\$\('skill2Btn'\)\.onclick=/);
  assert.match(gameSource, /\$\('guardBtn'\)\.onclick=\(\)=>submitAction\(\{type:'guard'\}\)/);
  assert.match(gameSource, /\$\('potionBtn'\)\.onclick=\(\)=>submitAction\(\{type:'potion'\}\)/);
  assert.match(gameSource, /\$\('reviveBtn'\)\.onclick=\(\)=>submitAction\(\{type:'revive'\}\)/);
});
