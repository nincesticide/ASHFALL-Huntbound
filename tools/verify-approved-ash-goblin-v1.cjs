#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const game=fs.readFileSync(path.join(root,'js','game.js'),'utf8');
const meta=JSON.parse(fs.readFileSync(path.join(root,'assets','monsters','common','ash_goblin','ash_goblin.sprite.json'),'utf8'));
const atlas=fs.readFileSync(path.join(root,'assets','monsters','common','ash_goblin','ash_goblin.atlas.png'));
const required=[
  '/* ===== approved Ash Goblin animated sprite v1 =====',
  "e.kind==='goblin'||e.kind==='gutterling'",
  "APPROVED_GOBLIN_ATLAS_V1.src='assets/monsters/common/ash_goblin/ash_goblin.atlas.png'",
  'if(drawApprovedGoblinSpriteV1(e,now))return true;',
  'queueApprovedGoblinDeathV1(e);',
  'drawApprovedGoblinDeathsV1();'
];
for(const needle of required)if(!game.includes(needle))throw new Error(`Missing integration marker: ${needle}`);
if(!game.includes("BOSS_SPRITES[kind]"))throw new Error('Boss sprite runtime unexpectedly missing.');
if(!game.includes('bossgoblin'))throw new Error('Gutter King boss mapping unexpectedly missing.');
if(meta.frameWidth!==96||meta.frameHeight!==96||meta.columns!==6||meta.rows!==24)throw new Error('Unexpected Ash Goblin atlas geometry.');
for(const name of ['idle','walk','attack','special','hit','death'])if(!meta.animations[name])throw new Error(`Missing animation ${name}`);
if(meta.animations.attack.damageFrame!==4||meta.animations.special.eventFrame!==4)throw new Error('Gameplay presentation event frames changed.');
if(!meta.enemyKinds.includes('goblin')||!meta.enemyKinds.includes('gutterling')||meta.enemyKinds.includes('bossgoblin'))throw new Error('Goblin visual mapping scope is wrong.');
if(atlas.length<100000||atlas[0]!==0x89||atlas.toString('ascii',1,4)!=='PNG')throw new Error('Atlas is not a valid production PNG payload.');
console.log('Approved Ash Goblin v1 integration contract verified: goblin + gutterling only; bossgoblin excluded.');
