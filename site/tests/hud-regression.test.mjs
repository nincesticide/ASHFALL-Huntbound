import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [indexSource, cssSource, gameSource] = await Promise.all([
  readFile(new URL("../public/game/index.html", import.meta.url), "utf8"),
  readFile(new URL("../public/game/css/game.css", import.meta.url), "utf8"),
  readFile(new URL("../public/game/js/game.js", import.meta.url), "utf8"),
]);

test("combat controls use a compact six-command bar with accessible shortcuts", () => {
  assert.match(indexSource, /class="panel actions-panel-v141 command-bar-v148 command-bar-v149"/);
  assert.match(indexSource, /id="actionHint" role="status" aria-live="polite"/);
  assert.match(indexSource, /id="targetInfo"[^>]+tabindex="0"/);

  const compactLayer = cssSource.slice(cssSource.indexOf("v0.14.8 CONTEXT-AWARE COMBAT COMMAND BAR"));
  assert.match(compactLayer, /grid-template-columns:repeat\(6,54px\)!important/);
  assert.match(compactLayer, /grid-template-columns:repeat\(6,52px\)!important/);
  assert.match(compactLayer, /body\.mode-run-v141 \.prompt\{display:none!important\}/);
  const battlefieldLayer = cssSource.slice(cssSource.indexOf("v0.15.0 BATTLEFIELD-FIRST HUD"));
  assert.match(battlefieldLayer, /\.command-bar-v149 \.actions\{grid-template-columns:repeat\(6,53px\)!important/);

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

test("field HUD keeps the radar visible while secondary panels stay opt-in", () => {
  assert.match(gameSource, /const HUD_CONTEXT_V148=\{mode:null\}/);
  assert.match(gameSource, /if\(mode==='run'\)\{setHudPanelV141\('party',false\);setHudPanelV141\('intel',false\)\}/);
  assert.match(gameSource, /else if\(mode==='world'\)\{setHudPanelV141\('party',false\);setHudPanelV141\('intel',false\)\}/);
  assert.match(gameSource, /else if\(mode==='camp'\)\{setHudPanelV141\('party',false\);setHudPanelV141\('intel',false\)\}/);
  assert.match(cssSource, /body\.mode-run-v141 #targetBadge\{display:none\}/);
  assert.match(cssSource, /\.hud-drawer-v141\.radar-panel-v149\{display:block!important/);
  assert.match(cssSource, /\.radar-panel-v149 canvas\.minimap\{width:100px!important;height:62px!important/);
  assert.match(cssSource, /#hudDockV132\{display:none!important\}/);
  assert.match(cssSource, /\.combat-vitals-bars-v149\{display:grid;grid-template-columns:1fr 1fr/);
});

test("Deep Hunt route data is removed from ordinary combat and opens only in the Hunt Map", () => {
  const commandStart = indexSource.indexOf('class="panel actions-panel-v141 command-bar-v148 command-bar-v149"');
  const commandEnd = indexSource.indexOf('class="deep-summary-v150"', commandStart);
  const commandMarkup = indexSource.slice(commandStart, commandEnd);
  assert.notEqual(commandStart, -1);
  assert.notEqual(commandEnd, -1);
  assert.match(commandMarkup, /id="pathPanel"/);
  assert.doesNotMatch(commandMarkup, /id="expeditionPanel"/);
  assert.match(indexSource, /id="huntMapOverlayV150" aria-hidden="true"/);
  assert.match(indexSource, /id="expeditionPanel" class="expeditionpanel"/);
  assert.match(indexSource, /id="huntMapBtnV150"[^>]+aria-keyshortcuts="M"/);
  assert.match(gameSource, /function setHuntMapV150\(open\)/);
  assert.match(gameSource, /if\(huntMapOpenV150&&\(e\.key==='Escape'\|\|key==='m'\)\)/);
  assert.match(gameSource, /if\(run\?\.deepHunt\?\.active&&key==='m'\)/);
  assert.match(cssSource, /\.hunt-map-overlay-v150\{[^}]*display:none/);
  assert.match(cssSource, /\.hunt-map-overlay-v150\.show\{display:grid\}/);
});

test("route decisions, objectives, player vitals, and bosses stay in edge-mounted presentation", () => {
  assert.match(gameSource, /\(run\.pathChoices\|\|\[\]\)\.slice\(0,3\)/);
  assert.match(gameSource, /DANGER \+\$\{danger\}%/);
  assert.match(gameSource, /QUICK ACTION — DOES NOT END TURN/);
  assert.match(indexSource, /id="combatStatusEffectsV150"/);
  assert.match(indexSource, /id="bossCombatHudV150"/);
  assert.match(indexSource, /id="objectiveTrackerV150"/);
  assert.match(cssSource, /\.objective-tracker-v150\{position:absolute;left:10px;top:83px/);
  assert.match(cssSource, /\.boss-combat-hud-v150\{display:none;position:absolute;left:50%;top:44px/);
  assert.match(cssSource, /\.command-bar-v149\{bottom:7px!important;width:390px!important/);
  assert.match(cssSource, /flex:0 0 30px!important;width:30px!important;min-width:30px!important/);
  assert.doesNotMatch(gameSource, /\n\s*drawBossHealthBar\(run\);/);
  assert.match(gameSource, /setHudPanelV141\('party',false\);setHudPanelV141\('intel',false\);setHudPanelV141\('meters',false\);setHudPanelV141\('loot',false\);setHudPanelV141\('log',false\)/);
});

test("world clock and reusable equipment objects exercise the physical inventory loop", () => {
  assert.match(indexSource, /id="worldClockV149"/);
  assert.match(indexSource, /id="combatHpFillV149"/);
  assert.match(indexSource, /id="combatResFillV149"/);
  assert.match(gameSource, /const V149_WORLD_MINUTES_PER_REAL_MINUTE=60/);
  assert.match(gameSource, /function worldClockStateV149\(/);
  assert.match(gameSource, /function persistWorldClockV149\(/);
  assert.match(gameSource, /const V149_GEAR_VISUALS=Object\.freeze\(\{head:'head',shoulders:'shoulders',chest:'chest',gloves:'gloves',boots:'boots',weapon:'weapon',offhand:'offhand',ring:'ring',necklace:'necklace'\}\)/);
  assert.match(gameSource, /const gearDrops=\[/);
  assert.match(gameSource, /objType:'gear'/);
  assert.match(gameSource, /if\(o\.objType==='gear'\)/);
  assert.match(gameSource, /profile\.inventory\.push\(normalizeItemV132\(reward\.gear\)\)/);
  assert.match(cssSource, /\.gear-object-v149\.gear-weapon>i/);
  assert.match(cssSource, /\.gear-object-v149\.gear-ring>i/);
});

test("combat button handlers preserve the canonical gameplay actions", () => {
  assert.match(gameSource, /\$\('attackBtn'\)\.onclick=\(\)=>submitAction\(\{type:'attack'/);
  assert.match(gameSource, /\$\('skill1Btn'\)\.onclick=\(\)=>submitAction\(\{type:'skill1'/);
  assert.match(gameSource, /\$\('skill2Btn'\)\.onclick=/);
  assert.match(gameSource, /\$\('guardBtn'\)\.onclick=\(\)=>submitAction\(\{type:'guard'\}\)/);
  assert.match(gameSource, /\$\('potionBtn'\)\.onclick=\(\)=>submitAction\(\{type:'potion'\}\)/);
  assert.match(gameSource, /\$\('reviveBtn'\)\.onclick=\(\)=>submitAction\(\{type:'revive'\}\)/);
});
