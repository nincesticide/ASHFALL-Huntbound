
(() => {
'use strict';

const CAMP_ART_DATA={"tent":"assets/asset_001_70fa2e8e5fa7cd79.png","merchant_stall":"assets/asset_002_2be7bc30235f0f43.png","forge":"assets/asset_003_1f0779f01c23dc3f.png","healer_tent":"assets/asset_004_2565dfa7c02739a6.png","crafter_tent":"assets/asset_005_ecf84bc83d1f8ea9.png","bonfire":"assets/asset_006_a49875829f45f093.png","hunt_board":"assets/asset_007_c9b148c10c990b53.png","stash":"assets/asset_008_14d2cfb8bd35e873.png","trophy_wall":"assets/asset_009_865d0a11fc1d1887.png","wager_table":"assets/asset_010_96b432e685ec2891.png","war_table":"assets/asset_011_db115fe5c31d4c84.png","training_dummy":"assets/asset_012_442ae5592e497080.png","storage":"assets/asset_013_de07a636eb4773aa.png","npc_smith":"assets/asset_014_84e5d54d8116bb60.png","npc_healer":"assets/asset_015_d1574688189286f9.png","npc_crafter":"assets/asset_016_b5539271f0e6b834.png","npc_gambler":"assets/asset_017_864b549a0c38d0e3.png","npc_merchant":"assets/asset_018_19b9a393b0d9c235.png","npc_huntsmith":"assets/asset_019_24ece44039066e77.png","grass_tex":"assets/asset_020_a1dea48f1cd36104.png","dirt_tex":"assets/asset_021_4f02a71eacf40827.png","stone_tex":"assets/asset_022_68e1969bc4f67a38.png","wood_tex":"assets/asset_023_811dff7bf4ef6d0a.png"};

const CAMP_ART={};
Object.entries(CAMP_ART_DATA).forEach(([k,src])=>{const im=new Image();im.decoding='async';im.src=src;CAMP_ART[k]=im});
function campArtReady(k){const im=CAMP_ART[k];return !!im&&im.complete&&im.naturalWidth>0}
function drawCampSprite(k,tx,ty,tw,th,alpha=1){const im=CAMP_ART[k];if(!campArtReady(k))return false;ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;ctx.drawImage(im,tx*TILE,ty*TILE,tw*TILE,th*TILE);ctx.restore();return true}
function drawCampTexture(k,x,y,a=1){const im=CAMP_ART[k];if(!campArtReady(k))return false;ctx.save();ctx.globalAlpha=a;ctx.imageSmoothingEnabled=false;ctx.drawImage(im,x*TILE,y*TILE,TILE,TILE);ctx.restore();return true}


const DIREFANG_SPRITE_SHEET='assets/asset_024_67eda3cd9117db44.png';
const BOSS_SPRITES={};
(()=>{
  const img=new Image();
  BOSS_SPRITES.direwolf={img,loaded:false,frameW:96,frameH:96,cols:6,rowMap:{idle:0,move:1,attack:2,pounce:3,howl:4},fps:{idle:5,move:8,attack:10,pounce:10,howl:7},scale:1.82,offsetX:4,offsetY:3};
  img.onload=()=>BOSS_SPRITES.direwolf.loaded=true;
  img.src=DIREFANG_SPRITE_SHEET;
})();
const V09_BOSS_ATLAS_DATA={"bossgoblin":"assets/asset_025_30f8a0038dcfd0f0.png","mire":"assets/asset_026_7ec6953fe2219ffe.png","bossknight":"assets/asset_027_6488f309a6e3785f.png","bossdrake":"assets/asset_028_db300087b0a8ef1d.png","riftboss":"assets/asset_029_625b113b9c4a7b39.png","worldeater":"assets/asset_030_430ad19d26609e86.png"};

Object.entries(V09_BOSS_ATLAS_DATA).forEach(([kind,src])=>{
  const img=new Image();
  const scale={bossgoblin:1.72,mire:1.76,bossknight:1.74,bossdrake:1.68,riftboss:1.78,worldeater:1.84}[kind]||1.72;BOSS_SPRITES[kind]={img,loaded:false,frameW:229,frameH:229,cols:6,rowMap:{idle:0,move:1,attack:2,special:3,enrage:4,pounce:3,howl:4},fps:{idle:5,move:8,attack:10,special:8,enrage:7,pounce:9,howl:7},scale,offsetX:0,offsetY:0};
  img.onload=()=>BOSS_SPRITES[kind].loaded=true;img.src=src;
});

function bossSpriteAsset(e){return e?.boss&&e?.kind?BOSS_SPRITES[e.kind]||null:null}
function setBossAnim(e,name,duration=520){if(!e)return;e.animName=name;e.animStarted=Date.now();e.animUntil=e.animStarted+duration}
function setBossMoveVisual(e,fromX,fromY,duration=300){if(!e)return;e.moveVisual={fromX,fromY,toX:e.x,toY:e.y,started:performance.now(),duration}}
function bossVisualPos(e){const m=e?.moveVisual;if(!m)return{x:e.x,y:e.y};const t=clamp((performance.now()-m.started)/m.duration,0,1),q=t<1?1-Math.pow(1-t,3):1;return{x:m.fromX+(m.toX-m.fromX)*q,y:m.fromY+(m.toY-m.fromY)*q}}

function bossAnimName(e){if(!e)return'idle';if(Date.now()<(e.animUntil||0))return e.animName||'idle';if(e.intent==='pounce'||e.intent==='howl')return 'howl';return 'idle'}
function drawBossSprite(e,px,py,w,h){
  const a=bossSpriteAsset(e);if(!a||!a.loaded)return false;
  const anim=bossAnimName(e),row=a.rowMap[anim]??0,fps=a.fps[anim]||8;
  const started=e.animStarted||Date.now();
  const frame=Math.floor(((Date.now()-started)/1000)*fps)%a.cols;
  const sx=frame*a.frameW,sy=row*a.frameH,dw=Math.round(w*a.scale),dh=Math.round(h*a.scale);
  const dx=Math.round(px-(dw-w)/2+(a.offsetX||0)),dy=Math.round(py-(dh-h)/2+(a.offsetY||0));
  const prevSmooth=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=false;ctx.drawImage(a.img,sx,sy,a.frameW,a.frameH,dx,dy,dw,dh);ctx.imageSmoothingEnabled=prevSmooth;return true
}
function initBossAI(e){e.cooldowns=e.cooldowns||{pounce:1,howl:2,rend:0};return e.cooldowns}
function tickBossCooldowns(e){const c=initBossAI(e);Object.keys(c).forEach(k=>c[k]=Math.max(0,(c[k]||0)-1));return c}
function bossTargetsInRange(run,e,range){return Object.values(run.players).filter(p=>!p.dead&&!p.downed&&distanceToEnemy(p,e)<=range)}
function bossMoveTowardTarget(run,e,t,steps=1){
  const fromX=e.x,fromY=e.y;let moved=0;
  for(let s=0;s<steps;s++){
    const dx=Math.sign(t.x-e.x),dy=Math.sign(t.y-e.y);
    const opts=Math.abs(t.x-e.x)>Math.abs(t.y-e.y)?[[dx,0],[0,dy],[dx,dy],[-dx,0],[0,-dy]]:[[0,dy],[dx,0],[dx,dy],[0,-dy],[-dx,0]];
    let stepMoved=false;
    for(const[ox,oy] of opts){if(!(ox||oy))continue;if(bossFootprintIsClear(run,e,e.x+ox,e.y+oy)){e.x+=ox;e.y+=oy;stepMoved=true;moved++;break}}
    if(!stepMoved)break;
  }
  if(moved)setBossMoveVisual(e,fromX,fromY,240+steps*90);
  return moved
}
function placeBossNearTile(run,e,tx,ty){
  const fromX=e.x,fromY=e.y,ring=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],[2,0],[-2,0],[0,2],[0,-2]];
  const candidates=ring.map(([dx,dy])=>({x:clamp(tx+dx,2,W-3),y:clamp(ty+dy,2,H-3)})).sort((a,b)=>(Math.abs(a.x-tx)+Math.abs(a.y-ty))-(Math.abs(b.x-tx)+Math.abs(b.y-ty))||Math.abs(a.x-e.x)+Math.abs(a.y-e.y)-Math.abs(b.x-e.x)-Math.abs(b.y-e.y));
  for(const c of candidates){if(bossFootprintIsClear(run,e,c.x,c.y)){e.x=c.x;e.y=c.y;setBossMoveVisual(e,fromX,fromY,420);return true}}
  return false
}
function bossHitPlayer(run,e,p,baseDamage,label='BITE',guardFactor=.52,bleed=0,maxRange=1){
  if(distanceToEnemy(p,e)>maxRange){run.log.push(`${e.name}'s ${label.toLowerCase()} cannot reach ${p.name}.`);return 0}
  if(chance(dodgeChance(p)*.82)){pushCombatFloaterPlayer(p,'EVADE','#9bd7ff',11,750);run.log.push(`${p.name} evades ${e.name}'s ${label.toLowerCase()}.`);return 0}
  let dmg=Math.max(1,Math.round(baseDamage)-Math.floor((p.def+(p.status.partyDef||0)+runDefBonus(p))*.58));if(p.guarding)dmg=Math.max(1,Math.round(dmg*ascentGuardV11(p,guardFactor)));
  p.hp-=dmg;p.hitFlash=Date.now();pulseStageV13('hurt');e.attackFlash=Date.now();e.attackDx=Math.sign(p.x-e.x);e.attackDy=Math.sign(p.y-e.y);emitEnemyAttackFx(e,p);pushCombatFloaterPlayer(p,`-${dmg}`,'#ef8b8b',12,850);pushCombatFeed('bad',e.name,dmg,label);const hitp=combatPointPlayer(p);emitWorldFx('spark',hitp.x,hitp.y,'#ff875e',8,420);if(bleed)p.status.bleed=Math.max(p.status.bleed||0,bleed);if(p.hp<=0)downPlayer(run,p);return dmg
}
function direfangRend(run,e,t){
  setBossAnim(e,'attack',620);e.cooldowns.rend=2;run.log.push(`⚔ ${e.name} tears into ${t.name} with Rending Maul!`);shakeScreen(3,110);
  const d1=bossHitPlayer(run,e,t,e.atk*1.02,'REND',.54,1);
  if(!t.dead&&!t.downed){const d2=bossHitPlayer(run,e,t,e.atk*.78,'MAUL',.58,2);if(d1||d2)run.log.push(`${t.name} suffers ${d1+d2} total damage from the combo.`)}
}
function direfangHowl(run,e){
  setBossAnim(e,'howl',980);e.cooldowns.howl=e.bossPhase>=3?3:4;const victims=bossTargetsInRange(run,e,3);const c=combatPointEntity(e);addRingFx(c.x,c.y,'#ff8d59',52,800,4);emitWorldFx('spark',c.x,c.y,'#ff9f62',22,780);shakeScreen(5,180);run.log.push(`⚠ ${e.name} unleashes Blood Howl! Hunters within 3 tiles are shredded and lose resolve.`);
  if(!victims.length)run.log.push('The party stays out of the howl radius.');
  victims.forEach(p=>{const dmg=bossHitPlayer(run,e,p,e.atk*(e.bossPhase>=3?1.02:.88),'HOWL',.44,e.bossPhase>=3?2:1,3);if(dmg){p.res=Math.max(0,p.res-2);run.log.push(`${p.name} is hit for ${dmg} and loses 2 resolve.`)}})
  e.intentTarget=null
}
function direfangPounce(run,e){
  const mark=e.intentTarget||{x:e.x,y:e.y,name:'the marked ground'};setBossAnim(e,'pounce',900);e.cooldowns.pounce=e.bossPhase>=3?2:3;placeBossNearTile(run,e,mark.x,mark.y);const c=combatPointEntity(e);addRingFx(c.x,c.y,'#ff704f',64,760,5);emitWorldFx('spark',c.x,c.y,'#ff7c56',26,760);shakeScreen(6,220);const victims=bossTargetsInRange(run,e,1);
  run.log.push(`⚠ ${e.name} crashes down in a pounce near ${mark.name}!`);
  if(!victims.length)run.log.push('The hunters slip clear of the impact zone.');
  victims.forEach(p=>{const dmg=bossHitPlayer(run,e,p,e.atk*(e.bossPhase>=3?1.25:1.12),'POUNCE',.42,2,1);if(dmg)run.log.push(`${p.name} is mauled for ${dmg} by the pounce.`)});
  e.intentTarget=null
}
function resolveDirefangBossAction(run,e,targets,t){
  initBossAI(e);
  if(e.intent==='pounce'){e.intent=null;run.bossTelegraph=null;direfangPounce(run,e);return true}
  if(e.intent==='howl'){e.intent=null;run.bossTelegraph=null;direfangHowl(run,e);return true}
  const dist=distanceToEnemy(t,e),closeCount=bossTargetsInRange(run,e,2).length;
  if(e.cooldowns.howl<=0&&closeCount>=2&&run.round>2&&chance(e.bossPhase>=3?.34:.24)){e.intent='howl';run.bossTelegraph=`${e.name} is drawing in a Blood Howl — stay beyond 3 tiles or guard!`;setBossAnim(e,'howl',900);run.log.push(`⚠ ${run.bossTelegraph}`);return true}
  const pounceMax=e.slowed?3:4;if(e.cooldowns.pounce<=0&&dist>=2&&dist<=pounceMax&&run.round>1&&chance(e.bossPhase>=3?.42:e.bossPhase===2?.34:.28)){e.intent='pounce';e.intentTarget={x:t.x,y:t.y,name:t.name};run.bossTelegraph=`${e.name} lowers itself to pounce at ${t.name}'s position — move or guard!`;setBossAnim(e,'howl',900);run.log.push(`⚠ ${run.bossTelegraph}`);return true}
  if(dist<=1){if(e.cooldowns.rend<=0&&chance(e.bossPhase>=2?.45:.32)){direfangRend(run,e,t);return true}setBossAnim(e,'attack',560);enemyAttack(run,e,t);return true}
  const moved=bossMoveTowardTarget(run,e,t,dist>5?2:1);if(moved){setBossAnim(e,'move',460);run.log.push(`${e.name} stalks closer through the hunting grounds.`)}return true
}
function drawBossTelegraphZones(run){
  const boss=run?.enemies?.find(e=>e.boss&&e.hp>0&&e.intent);if(!boss)return;const sec=performance.now()/1000,p=.45+.28*Math.sin(sec*8);ctx.save();ctx.globalCompositeOperation='lighter';
  if(boss.intentCells?.length){boss.intentCells.forEach(c=>{const x=c.x*TILE,y=c.y*TILE;ctx.fillStyle=`rgba(255,96,72,${.08+p*.09})`;ctx.fillRect(x+1,y+1,TILE-2,TILE-2);ctx.strokeStyle=`rgba(255,196,123,${.28+p*.28})`;ctx.strokeRect(x+3.5,y+3.5,TILE-7,TILE-7)});ctx.restore();return}
  if(boss.kind==='direwolf'&&boss.intent==='pounce'&&boss.intentTarget){
    for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++){const tx=(boss.intentTarget.x+xx)*TILE,ty=(boss.intentTarget.y+yy)*TILE;ctx.fillStyle=`rgba(255,96,66,${0.08+p*.08})`;ctx.fillRect(tx+1,ty+1,TILE-2,TILE-2);ctx.strokeStyle=`rgba(255,180,120,${0.25+p*.25})`;ctx.strokeRect(tx+2.5,ty+2.5,TILE-5,TILE-5)}
  }else if(boss.kind==='direwolf'&&boss.intent==='howl'){
    const c=combatPointEntity(boss);ctx.strokeStyle=`rgba(255,126,84,${0.4+p*.35})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(c.x,c.y,TILE*3.1,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1
  }else if(boss.intent==='devastate'){
    const c=combatPointEntity(boss);ctx.strokeStyle=`rgba(255,116,88,${0.3+p*.35})`;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(c.x,c.y+18,TILE*1.6,TILE*.6,0,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1
  }
  ctx.restore()
}

const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d');const minimapCanvas=$('minimap'),mctx=minimapCanvas?.getContext('2d');
const TILE=32,W=30,H=19;
const RANGER_IDLE_SRC='assets/asset_031_66296a55c3d35958.png';
const RANGER_WALK_SRC='assets/asset_032_f671486edd48cce1.png';
const RANGER_ATTACK_SRC='assets/asset_033_e153688c62bba046.png';
const RANGER_VOLLEY_SRC='assets/asset_034_6017ca5556706013.png';
const rangerIdleImg=new Image(),rangerWalkImg=new Image(),rangerAttackImg=new Image(),rangerVolleyImg=new Image();
let rangerAssetLoads=0;
rangerIdleImg.onload=()=>{rangerAssetLoads++;};
rangerWalkImg.onload=()=>{rangerAssetLoads++;};
rangerAttackImg.onload=()=>{rangerAssetLoads++;};
rangerVolleyImg.onload=()=>{rangerAssetLoads++;};
rangerIdleImg.src=RANGER_IDLE_SRC;rangerWalkImg.src=RANGER_WALK_SRC;rangerAttackImg.src=RANGER_ATTACK_SRC;rangerVolleyImg.src=RANGER_VOLLEY_SRC;

const SHADOW_IDLE_SRC='assets/asset_035_9738e5c21dfec703.png';
const SHADOW_WALK_SRC='assets/asset_036_b9b4d45c33eb90a1.png';
const SHADOW_ATTACK_SRC='assets/asset_037_5f740f9436519342.png';
const SHADOW_BACKSTAB_SRC='assets/asset_038_27c7e53e454064c3.png';
const SHADOW_FAN_SRC='assets/asset_039_b63d70a7f9c3adc6.png';
const shadowIdleImg=new Image(),shadowWalkImg=new Image(),shadowAttackImg=new Image(),shadowBackstabImg=new Image(),shadowFanImg=new Image();
let shadowAssetLoads=0;
shadowIdleImg.onload=()=>{shadowAssetLoads++;};
shadowWalkImg.onload=()=>{shadowAssetLoads++;};
shadowAttackImg.onload=()=>{shadowAssetLoads++;};
shadowBackstabImg.onload=()=>{shadowAssetLoads++;};
shadowFanImg.onload=()=>{shadowAssetLoads++;};
shadowIdleImg.src=SHADOW_IDLE_SRC;shadowWalkImg.src=SHADOW_WALK_SRC;shadowAttackImg.src=SHADOW_ATTACK_SRC;shadowBackstabImg.src=SHADOW_BACKSTAB_SRC;shadowFanImg.src=SHADOW_FAN_SRC;
const SHADOW_DIR_ROW={south:0,west:1,east:2,north:3};
const shadowMotion=new Map();
const shadowCombatFx=new Map();
function shadowDaggerOrigin(p,facing='south'){
  const x=(p?.x??0)*TILE,y=(p?.y??0)*TILE;
  if(facing==='west')return{x:x+9,y:y+14};
  if(facing==='east')return{x:x+23,y:y+14};
  if(facing==='north')return{x:x+16,y:y+11};
  return{x:x+16,y:y+15};
}
function triggerShadowCombatFx(p,type,targets=[]){
  if(!p||p.classId!=='shadow')return;
  const duration=type==='fan'?640:type==='backstab'?600:450,eventId=`${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const payload={
    eventId,peerId:p.peerId,type,duration,startedAt:Date.now(),facing:p.facing||'south',
    targets:(targets||[]).filter(Boolean).map((e,i)=>({id:e.id,x:e.x,y:e.y,size:e.size||1,boss:!!e.boss,index:i}))
  };
  p.visualAction=payload;
  shadowCombatFx.set(p.peerId,{...payload,start:performance.now()})
}
function activeShadowCombatFx(p,now=performance.now()){
  if(!p||p.classId!=='shadow')return null;
  const shared=p.visualAction,sharedAge=shared?.startedAt?Date.now()-shared.startedAt:Infinity;
  let fx=shadowCombatFx.get(p.peerId);
  if(shared&&sharedAge<=shared.duration+80&&(!fx||fx.eventId!==shared.eventId)){
    fx={...shared,start:now-Math.max(0,sharedAge)};
    shadowCombatFx.set(p.peerId,fx)
  }
  if(!fx)return null;
  if(now-fx.start>fx.duration){shadowCombatFx.delete(p.peerId);return null}
  return fx
}
function shadowAssetsReady(){return shadowAssetLoads>=5&&shadowIdleImg.complete&&shadowWalkImg.complete&&shadowAttackImg.complete&&shadowBackstabImg.complete&&shadowFanImg.complete}
function shadowVisualState(p,inCamp=false,now=performance.now()){
  const tx=inCamp?(p.campX??14):p.x,ty=inCamp?(p.campY??15):p.y,key=`${inCamp?'camp':'run'}:${p.peerId}`;
  let s=shadowMotion.get(key);
  if(!s){s={targetX:tx,targetY:ty,fromX:tx,fromY:ty,start:now,duration:360,facing:p.facing||'south'};shadowMotion.set(key,s)}
  const priorT=Math.min(1,Math.max(0,(now-s.start)/s.duration));
  const ease=priorT*priorT*(3-2*priorT);
  const currentX=s.fromX+(s.targetX-s.fromX)*ease,currentY=s.fromY+(s.targetY-s.fromY)*ease;
  if(tx!==s.targetX||ty!==s.targetY){
    const dx=tx-s.targetX,dy=ty-s.targetY;
    s.fromX=currentX;s.fromY=currentY;s.targetX=tx;s.targetY=ty;s.start=now;s.duration=360;
    s.facing=p.facing||rangerFacingFromDelta(dx,dy,s.facing)
  }else if(p.facing)s.facing=p.facing;
  const t=Math.min(1,Math.max(0,(now-s.start)/s.duration)),e=t*t*(3-2*t);
  const x=s.fromX+(s.targetX-s.fromX)*e,y=s.fromY+(s.targetY-s.fromY)*e,moving=t<1;
  const frame=moving?Math.min(5,Math.floor(t*6)):Math.floor(now/220)%4;
  return{x,y,moving,frame,facing:s.facing||'south'}
}
function drawShadowKnife(x1,y1,x2,y2,alpha=1){
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='rgba(228,232,238,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  const ang=Math.atan2(y2-y1,x2-x1),blade=6;
  ctx.fillStyle='rgba(220,225,235,.95)';ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-blade*Math.cos(ang-.35),y2-blade*Math.sin(ang-.35));ctx.lineTo(x2-blade*Math.cos(ang+.35),y2-blade*Math.sin(ang+.35));ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(108,84,52,.9)';ctx.fillRect(Math.round(x1)-1,Math.round(y1)-1,2,2);ctx.restore()
}
function drawShadowSlash(x,y,alpha=.8,color='rgba(210,60,70,.88)'){
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,7,-.8,.6);ctx.stroke();ctx.beginPath();ctx.moveTo(x-4,y-4);ctx.lineTo(x+4,y+4);ctx.stroke();ctx.restore()
}
function drawShadowCombatEffects(run,now=performance.now()){
  Object.values(run?.players||{}).forEach(p=>{
    if(p.classId!=='shadow')return;
    const fx=activeShadowCombatFx(p,now);if(!fx)return;const t=clamp01((now-fx.start)/fx.duration),origin=shadowDaggerOrigin(p,fx.facing||p.facing||'south');
    if(fx.type==='fan'){
      const targets=fx.targets.length?fx.targets:[{x:p.x+(fx.facing==='west'?-2:fx.facing==='east'?2:0),y:p.y+(fx.facing==='north'?-2:2),size:1,boss:false,index:0}];
      targets.slice(0,5).forEach((tgt,i)=>{const base=rangerEnemyCenter(tgt),delay=.28+i*.06,pt=clamp01((t-delay)/.24);if(pt<=0)return;const spread=(i-2)*3;const x=origin.x+(base.x+spread-origin.x)*pt,y=origin.y+(base.y-(i%2?2:-2)-origin.y)*pt;drawShadowKnife(origin.x,origin.y,x,y,Math.max(.35,1-Math.max(0,t-(delay+.24))*2.2));if(t>delay+.24&&t<delay+.46)drawShadowSlash(base.x+spread,base.y,1-(t-(delay+.24))/.22,'rgba(215,225,235,.7)')})
    }else{
      const tgt=fx.targets[0];if(!tgt)return;const dest=rangerEnemyCenter(tgt);if(t>.58)drawShadowSlash(dest.x,dest.y,1-Math.max(0,t-.58)/.42,fx.type==='backstab'?'rgba(228,62,76,.92)':'rgba(230,230,236,.7)')
    }
  })
}
function drawShadowSprite(p,inCamp=false){
  if(!shadowAssetsReady())return false;
  const now=performance.now(),s=shadowVisualState(p,inCamp,now),fx=!inCamp?activeShadowCombatFx(p,now):null,row=SHADOW_DIR_ROW[(fx?.facing)||s.facing]??0;
  const px=s.x*TILE,py=s.y*TILE,screenX=Math.round(px+TILE/2-24),screenY=Math.round(py+TILE-47);
  ctx.save();
const WARDEN_IDLE_SRC='assets/asset_040_2fd32be2e500480c.png';
const WARDEN_WALK_SRC='assets/asset_041_f1a3b8bfd5c8ca2c.png';
const WARDEN_ATTACK_SRC='assets/asset_042_94a5aafffd4d9516.png';
const WARDEN_SHIELDSLAM_SRC='assets/asset_043_5d58ce683fb31f24.png';
const WARDEN_FORTRESS_SRC='assets/asset_044_10cd68d5d9d3dc39.png';
const wardenIdleImg=new Image(),wardenWalkImg=new Image(),wardenAttackImg=new Image(),wardenShieldSlamImg=new Image(),wardenFortressImg=new Image();
let wardenAssetLoads=0;
wardenIdleImg.onload=()=>{wardenAssetLoads++;};
wardenWalkImg.onload=()=>{wardenAssetLoads++;};
wardenAttackImg.onload=()=>{wardenAssetLoads++;};
wardenShieldSlamImg.onload=()=>{wardenAssetLoads++;};
wardenFortressImg.onload=()=>{wardenAssetLoads++;};
wardenIdleImg.src=WARDEN_IDLE_SRC;wardenWalkImg.src=WARDEN_WALK_SRC;wardenAttackImg.src=WARDEN_ATTACK_SRC;wardenShieldSlamImg.src=WARDEN_SHIELDSLAM_SRC;wardenFortressImg.src=WARDEN_FORTRESS_SRC;
const WARDEN_DIR_ROW={south:0,west:1,east:2,north:3};
const wardenMotion=new Map();
const wardenCombatFx=new Map();
function triggerWardenCombatFx(p,type,targets=[]){
  if(!p||p.classId!=='warden')return;
  const duration=type==='fortress'?680:type==='shieldslam'?560:430,eventId=`${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const payload={
    eventId,peerId:p.peerId,type,duration,startedAt:Date.now(),facing:p.facing||'south',
    targets:(targets||[]).filter(Boolean).map((e,i)=>({id:e.id,x:e.x,y:e.y,size:e.size||1,boss:!!e.boss,index:i}))
  };
  p.visualAction=payload;
  wardenCombatFx.set(p.peerId,{...payload,start:performance.now()})
}
function activeWardenCombatFx(p,now=performance.now()){
  if(!p||p.classId!=='warden')return null;
  const shared=p.visualAction,sharedAge=shared?.startedAt?Date.now()-shared.startedAt:Infinity;
  let fx=wardenCombatFx.get(p.peerId);
  if(shared&&sharedAge<=shared.duration+80&&(!fx||fx.eventId!==shared.eventId)){
    fx={...shared,start:now-Math.max(0,sharedAge)};
    wardenCombatFx.set(p.peerId,fx)
  }
  if(!fx)return null;
  if(now-fx.start>fx.duration){wardenCombatFx.delete(p.peerId);return null}
  return fx
}
function wardenAssetsReady(){return wardenAssetLoads>=5&&wardenIdleImg.complete&&wardenWalkImg.complete&&wardenAttackImg.complete&&wardenShieldSlamImg.complete&&wardenFortressImg.complete}
function wardenVisualState(p,inCamp=false,now=performance.now()){
  const tx=inCamp?(p.campX??14):p.x,ty=inCamp?(p.campY??15):p.y,key=`${inCamp?'camp':'run'}:${p.peerId}`;
  let s=wardenMotion.get(key);
  if(!s){
    s={targetX:tx,targetY:ty,fromX:tx,fromY:ty,start:now,duration:360,facing:p.facing||'south'};
    wardenMotion.set(key,s)
  }
  const priorT=Math.min(1,Math.max(0,(now-s.start)/s.duration));
  const ease=priorT*priorT*(3-2*priorT);
  const currentX=s.fromX+(s.targetX-s.fromX)*ease,currentY=s.fromY+(s.targetY-s.fromY)*ease;
  if(tx!==s.targetX||ty!==s.targetY){
    const dx=tx-s.targetX,dy=ty-s.targetY;
    s.fromX=currentX;s.fromY=currentY;s.targetX=tx;s.targetY=ty;s.start=now;s.duration=360;
    s.facing=p.facing||rangerFacingFromDelta(dx,dy,s.facing)
  }else if(p.facing)s.facing=p.facing;
  const t=Math.min(1,Math.max(0,(now-s.start)/s.duration)),e=t*t*(3-2*t);
  const x=s.fromX+(s.targetX-s.fromX)*e,y=s.fromY+(s.targetY-s.fromY)*e,moving=t<1;
  const frame=moving?Math.min(5,Math.floor(t*6)):Math.floor(now/220)%4;
  return{x,y,moving,frame,facing:s.facing||'south'}
}
function drawWardenSprite(p,inCamp=false){
  if(!wardenAssetsReady())return false;
  const now=performance.now(),s=wardenVisualState(p,inCamp,now),fx=!inCamp?activeWardenCombatFx(p,now):null,row=WARDEN_DIR_ROW[(fx?.facing)||s.facing]??0;
  const px=s.x*TILE,py=s.y*TILE,screenX=Math.round(px+TILE/2-24),screenY=Math.round(py+TILE-47);
  ctx.save();
const EXTRA_CLASS_SRCS={
  berserker:{idle:'assets/asset_045_00b01a622aebd4e7.png',walk:'assets/asset_046_df5be5eb0c094d48.png',attack:'assets/asset_047_106792cf0bce5012.png'},
  arcanist:{idle:'assets/asset_048_d83b55efd931f417.png',walk:'assets/asset_049_ff4e011100d470a6.png',attack:'assets/asset_050_f228a7ab7196fb67.png'},
  templar:{idle:'assets/asset_051_ea8445ec25d651a3.png',walk:'assets/asset_052_17459d3a8e606182.png',attack:'assets/asset_053_3461221440b57d60.png'}
};
const extraClassImages={},extraClassMotion=new Map(),extraClassCombatFx=new Map();
let extraClassLoads=0;
Object.entries(EXTRA_CLASS_SRCS).forEach(([cid,set])=>{
  extraClassImages[cid]={};
  Object.entries(set).forEach(([anim,src])=>{const img=new Image();img.onload=()=>extraClassLoads++;img.src=src;extraClassImages[cid][anim]=img})
});
function extraClassReady(cid){const a=extraClassImages[cid];return !!a&&a.idle.complete&&a.walk.complete&&a.attack.complete}
function extraClassVisualState(p,inCamp=false,now=performance.now()){
  const tx=inCamp?(p.campX??14):p.x,ty=inCamp?(p.campY??15):p.y,key=`${inCamp?'camp':'run'}:${p.peerId}`;
  let s=extraClassMotion.get(key);
  if(!s){s={targetX:tx,targetY:ty,fromX:tx,fromY:ty,start:now,duration:360,facing:p.facing||'south'};extraClassMotion.set(key,s)}
  const prior=Math.min(1,Math.max(0,(now-s.start)/s.duration)),ez=prior*prior*(3-2*prior);
  const cx=s.fromX+(s.targetX-s.fromX)*ez,cy=s.fromY+(s.targetY-s.fromY)*ez;
  if(tx!==s.targetX||ty!==s.targetY){const dx=tx-s.targetX,dy=ty-s.targetY;s.fromX=cx;s.fromY=cy;s.targetX=tx;s.targetY=ty;s.start=now;s.facing=p.facing||rangerFacingFromDelta(dx,dy,s.facing)}
  else if(p.facing)s.facing=p.facing;
  const t=Math.min(1,Math.max(0,(now-s.start)/s.duration)),e=t*t*(3-2*t),moving=t<1;
  return{x:s.fromX+(s.targetX-s.fromX)*e,y:s.fromY+(s.targetY-s.fromY)*e,moving,frame:moving?Math.min(5,Math.floor(t*6)):Math.floor(now/230)%4,facing:s.facing||'south'}
}
function triggerExtraClassFx(p,type,targets=[]){
  if(!p||!['berserker','arcanist','templar'].includes(p.classId))return;
  const durations={attack:430,cleave:560,frenzy:720,lance:570,starfall:760,smite:570,radiant:760};
  const payload={eventId:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,peerId:p.peerId,type,duration:durations[type]||520,startedAt:Date.now(),facing:p.facing||'south',targets:(targets||[]).filter(Boolean).map((e,i)=>({id:e.id,x:e.x,y:e.y,size:e.size||1,boss:!!e.boss,index:i}))};
  p.visualAction=payload;extraClassCombatFx.set(p.peerId,{...payload,start:performance.now()})
}
function activeExtraClassFx(p,now=performance.now()){
  if(!p||!['berserker','arcanist','templar'].includes(p.classId))return null;
  const shared=p.visualAction,age=shared?.startedAt?Date.now()-shared.startedAt:Infinity;let fx=extraClassCombatFx.get(p.peerId);
  if(shared&&age<=shared.duration+100&&(!fx||fx.eventId!==shared.eventId)){fx={...shared,start:now-Math.max(0,age)};extraClassCombatFx.set(p.peerId,fx)}
  if(!fx)return null;if(now-fx.start>fx.duration){extraClassCombatFx.delete(p.peerId);return null}return fx
}
function drawExtraClassSprite(p,inCamp=false){
  if(!extraClassReady(p.classId))return false;
  const now=performance.now(),s=extraClassVisualState(p,inCamp,now),fx=!inCamp?activeExtraClassFx(p,now):null,row=RANGER_DIR_ROW[(fx?.facing)||s.facing]??0;
  const px=s.x*TILE,py=s.y*TILE,screenX=Math.round(px+TILE/2-24),screenY=Math.round(py+TILE-47),imgs=extraClassImages[p.classId];
  ctx.save();ctx.imageSmoothingEnabled=false;if(p.dead)ctx.globalAlpha=.35;
  ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(px+16,py+27,13,4,0,0,Math.PI*2);ctx.fill();
  if(fx){const frame=Math.min(5,Math.max(0,Math.floor(((now-fx.start)/fx.duration)*6)));ctx.drawImage(imgs.attack,frame*48,row*48,48,48,screenX,screenY,48,48)}
  else if(s.moving)ctx.drawImage(imgs.walk,s.frame*48,row*48,48,48,screenX,screenY,48,48);
  else ctx.drawImage(imgs.idle,s.frame*48,row*48,48,48,screenX,screenY+(Math.floor(now/520)%4===1?-1:0),48,48);
  if(Date.now()-(p.hitFlash||0)<150){ctx.globalAlpha=.48;ctx.fillStyle='#ff6b61';ctx.fillRect(px+6,py+4,20,25);ctx.globalAlpha=1}
  if(p.peerId===peerId){ctx.strokeStyle=inCamp?'#80def0':'#8dd9ff';ctx.lineWidth=2;ctx.strokeRect(px+3,py+2,26,29);ctx.lineWidth=1}
  if(!inCamp&&p.downed){ctx.strokeStyle='#ef6f6f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+5,py+5);ctx.lineTo(px+27,py+27);ctx.moveTo(px+27,py+5);ctx.lineTo(px+5,py+27);ctx.stroke();ctx.lineWidth=1}
  if(inCamp){ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle='#eef4fb';ctx.fillText(`${p.name}${p.title&&p.title!=='Hunter'?`, ${p.title}`:''}`,px+16,py+38);ctx.textAlign='left'}
  ctx.restore();return true
}

ctx.imageSmoothingEnabled=false;
  if(p.dead)ctx.globalAlpha=.35;
  ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(px+16,py+27,13,4,0,0,Math.PI*2);ctx.fill();
  if(fx){
    const frame=Math.min(5,Math.max(0,Math.floor(((now-fx.start)/fx.duration)*6)));
    const img=fx.type==='fortress'?wardenFortressImg:fx.type==='shieldslam'?wardenShieldSlamImg:wardenAttackImg;
    ctx.drawImage(img,frame*48,row*48,48,48,screenX,screenY,48,48)
  }else if(s.moving){
    ctx.drawImage(wardenWalkImg,s.frame*48,row*48,48,48,screenX,screenY,48,48)
  }else{
    const bob=Math.floor(now/520)%4===1?-1:0;
    ctx.drawImage(wardenIdleImg,s.frame*48,row*48,48,48,screenX,screenY+bob,48,48)
  }
  ctx.globalAlpha=1;
  if(p.peerId===peerId){ctx.strokeStyle=inCamp?'#80def0':'#8dd9ff';ctx.lineWidth=2;ctx.strokeRect(px+3,py+2,26,29);ctx.lineWidth=1}
  if(!inCamp&&p.downed){ctx.strokeStyle='#ef6f6f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+5,py+5);ctx.lineTo(px+27,py+27);ctx.moveTo(px+27,py+5);ctx.lineTo(px+5,py+27);ctx.stroke();ctx.lineWidth=1}
  if(inCamp){ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle='#eef4fb';ctx.fillText(`${p.name}${p.title&&p.title!=='Hunter'?`, ${p.title}`:''}`,px+16,py+38);ctx.textAlign='left'}
  ctx.restore();return true
}

ctx.imageSmoothingEnabled=false;
  if(p.dead)ctx.globalAlpha=.35;
  ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(px+16,py+27,13,4,0,0,Math.PI*2);ctx.fill();
  if(fx){
    const frame=Math.min(5,Math.max(0,Math.floor(((now-fx.start)/fx.duration)*6)));
    const img=fx.type==='fan'?shadowFanImg:fx.type==='backstab'?shadowBackstabImg:shadowAttackImg;
    ctx.drawImage(img,frame*48,row*48,48,48,screenX,screenY,48,48)
  }else if(s.moving){
    ctx.drawImage(shadowWalkImg,s.frame*48,row*48,48,48,screenX,screenY,48,48)
  }else{
    const bob=Math.floor(now/520)%4===1?-1:0;
    ctx.drawImage(shadowIdleImg,s.frame*48,row*48,48,48,screenX,screenY+bob,48,48)
  }
  ctx.globalAlpha=1;
  if(p.peerId===peerId){ctx.strokeStyle=inCamp?'#80def0':'#8dd9ff';ctx.lineWidth=2;ctx.strokeRect(px+3,py+2,26,29);ctx.lineWidth=1}
  if(!inCamp&&p.downed){ctx.strokeStyle='#ef6f6f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+5,py+5);ctx.lineTo(px+27,py+27);ctx.moveTo(px+27,py+5);ctx.lineTo(px+5,py+27);ctx.stroke();ctx.lineWidth=1}
  if(inCamp){ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle='#eef4fb';ctx.fillText(`${p.name}${p.title&&p.title!=='Hunter'?`, ${p.title}`:''}`,px+16,py+38);ctx.textAlign='left'}
  ctx.restore();return true
}

ctx.imageSmoothingEnabled=false;
const RANGER_DIR_ROW={south:0,west:1,east:2,north:3};
const RANGER_IDLE_COL={south:0,west:1,east:2,north:3};
const rangerMotion=new Map();

const rangerCombatFx=new Map();
function rangerEnemyCenter(e){
  const size=e?.size||1;
  if(e?.boss)return{x:(e.x+0.5)*TILE,y:(e.y-Math.floor(size/2)+size*.45)*TILE};
  return{x:(e.x??0)*TILE+16,y:(e.y??0)*TILE+14};
}
function rangerArrowOrigin(p,facing='south'){
  const x=(p?.x??0)*TILE,y=(p?.y??0)*TILE;
  if(facing==='west')return{x:x+8,y:y+14};
  if(facing==='east')return{x:x+24,y:y+14};
  if(facing==='north')return{x:x+16,y:y+10};
  return{x:x+18,y:y+14};
}
function triggerRangerCombatFx(p,type,targets=[]){
  if(!p||p.classId!=='ranger')return;
  const duration=type==='volley'?620:type==='twin'?540:420,eventId=`${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const payload={
    eventId,peerId:p.peerId,type,duration,startedAt:Date.now(),facing:p.facing||'south',
    targets:(targets||[]).filter(Boolean).map((e,i)=>({id:e.id,x:e.x,y:e.y,size:e.size||1,boss:!!e.boss,index:i}))
  };
  // Persist the short-lived visual event in shared run state so every party tab sees it.
  p.visualAction=payload;
  rangerCombatFx.set(p.peerId,{...payload,start:performance.now()})
}
function activeRangerCombatFx(p,now=performance.now()){
  if(!p||p.classId!=='ranger')return null;
  const shared=p.visualAction,sharedAge=shared?.startedAt?Date.now()-shared.startedAt:Infinity;
  let fx=rangerCombatFx.get(p.peerId);
  if(shared&&sharedAge<=shared.duration+80&&(!fx||fx.eventId!==shared.eventId)){
    fx={...shared,start:now-Math.max(0,sharedAge)};
    rangerCombatFx.set(p.peerId,fx)
  }
  if(!fx)return null;
  if(now-fx.start>fx.duration){
    rangerCombatFx.delete(p.peerId);
    return null
  }
  return fx
}
function clamp01(n){return Math.max(0,Math.min(1,n))}
function drawArrowPrimitive(x1,y1,x2,y2,alpha=1){
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='rgba(239,184,96,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  const ang=Math.atan2(y2-y1,x2-x1),hx=6,hy=3;
  ctx.fillStyle='rgba(208,214,224,.96)';ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-hx*Math.cos(ang-.38),y2-hx*Math.sin(ang-.38));ctx.lineTo(x2-hx*Math.cos(ang+.38),y2-hx*Math.sin(ang+.38));ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,220,150,.85)';ctx.fillRect(Math.round(x1)-1,Math.round(y1)-1,2,2);ctx.restore()
}
function drawRangerImpact(x,y,alpha=.9){
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='rgba(255,223,154,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();ctx.restore()
}
function drawRangerCombatEffects(run,now=performance.now()){
  Object.values(run?.players||{}).forEach(p=>{
    if(p.classId!=='ranger')return;
    const fx=activeRangerCombatFx(p,now);if(!fx)return;const t=clamp01((now-fx.start)/fx.duration),origin=rangerArrowOrigin(p,fx.facing||p.facing||'south');
    if(fx.type==='attack'){
      const tgt=fx.targets[0];if(!tgt)return;const dest=rangerEnemyCenter(tgt),pt=clamp01((t-.42)/.34),x=origin.x+(dest.x-origin.x)*pt,y=origin.y+(dest.y-origin.y)*pt;
      if(t>.42)drawArrowPrimitive(origin.x,origin.y,x,y,1-Math.max(0,t-.78)*2.5);if(t>.78)drawRangerImpact(dest.x,dest.y,1-(t-.78)/.22)
    }else if(fx.type==='twin'){
      const tgt=fx.targets[0];if(!tgt)return;const dest=rangerEnemyCenter(tgt);
      [0,1].forEach(i=>{const delay=.34+i*.12,pt=clamp01((t-delay)/.28);if(pt<=0)return;const oy=i===0?-2:3,x=origin.x+(dest.x-origin.x)*pt,y=origin.y+oy+(dest.y+oy-origin.y)*pt;drawArrowPrimitive(origin.x,origin.y+oy,x,y,1-Math.max(0,t-(delay+.28))*2.2);if(t>delay+.28&&t<delay+.48)drawRangerImpact(dest.x,dest.y+oy,1-(t-(delay+.28))/.2)})
    }else if(fx.type==='volley'){
      const targets=fx.targets.length?fx.targets:[{x:p.x+(fx.facing==='west'?-4:fx.facing==='east'?4:0),y:p.y+(fx.facing==='north'?-4:4),size:1,boss:false,index:0}];
      targets.slice(0,4).forEach((tgt,i)=>{const base=rangerEnemyCenter(tgt),delay=.26+i*.07,pt=clamp01((t-delay)/.30);if(pt<=0)return;const spread=(i-1.5)*4,x=origin.x+(base.x+spread-origin.x)*pt,y=origin.y+(base.y-2*(i%2)-origin.y)*pt;drawArrowPrimitive(origin.x,origin.y-1,x,y,Math.max(.35,1-Math.max(0,t-(delay+.3))*2));if(t>delay+.3&&t<delay+.54)drawRangerImpact(base.x+spread,base.y,1-(t-(delay+.3))/.24)})
    }
  })
}

function rangerAssetsReady(){return rangerAssetLoads>=4&&rangerIdleImg.complete&&rangerWalkImg.complete&&rangerAttackImg.complete&&rangerVolleyImg.complete}
function rangerFacingFromDelta(dx,dy,fallback='south'){
  if(Math.abs(dx)>Math.abs(dy))return dx>0?'east':dx<0?'west':fallback;
  if(dy!==0)return dy>0?'south':'north';
  return fallback
}
function rangerFacingToward(p,e){
  if(!p||!e)return p?.facing||'south';
  return rangerFacingFromDelta((e.x??p.x)-p.x,(e.y??p.y)-p.y,p.facing||'south')
}
function rangerVisualState(p,inCamp=false,now=performance.now()){
  const tx=inCamp?(p.campX??14):p.x,ty=inCamp?(p.campY??15):p.y,key=`${inCamp?'camp':'run'}:${p.peerId}`;
  let s=rangerMotion.get(key);
  if(!s){
    s={targetX:tx,targetY:ty,fromX:tx,fromY:ty,start:now,duration:360,facing:p.facing||'south'};
    rangerMotion.set(key,s)
  }
  const priorT=Math.min(1,Math.max(0,(now-s.start)/s.duration));
  const ease=priorT*priorT*(3-2*priorT);
  const currentX=s.fromX+(s.targetX-s.fromX)*ease,currentY=s.fromY+(s.targetY-s.fromY)*ease;
  if(tx!==s.targetX||ty!==s.targetY){
    const dx=tx-s.targetX,dy=ty-s.targetY;
    s.fromX=currentX;s.fromY=currentY;s.targetX=tx;s.targetY=ty;s.start=now;s.duration=360;
    s.facing=p.facing||rangerFacingFromDelta(dx,dy,s.facing)
  }else if(p.facing)s.facing=p.facing;
  const t=Math.min(1,Math.max(0,(now-s.start)/s.duration)),e=t*t*(3-2*t);
  const x=s.fromX+(s.targetX-s.fromX)*e,y=s.fromY+(s.targetY-s.fromY)*e,moving=t<1;
  const frame=moving?Math.min(5,Math.floor(t*6)):0;
  return{x,y,moving,frame,facing:s.facing||'south'}
}
function drawRangerSprite(p,inCamp=false){
  if(!rangerAssetsReady())return false;
  const now=performance.now(),s=rangerVisualState(p,inCamp,now),fx=!inCamp?activeRangerCombatFx(p,now):null,row=RANGER_DIR_ROW[(fx?.facing)||s.facing]??0;
  const px=s.x*TILE,py=s.y*TILE,screenX=Math.round(px+TILE/2-24),screenY=Math.round(py+TILE-47);
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(p.dead)ctx.globalAlpha=.35;
  ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(px+16,py+27,13,4,0,0,Math.PI*2);ctx.fill();
  if(fx){
    const frame=Math.min(5,Math.max(0,Math.floor(((now-fx.start)/fx.duration)*6))),img=fx.type==='volley'?rangerVolleyImg:rangerAttackImg;
    ctx.drawImage(img,frame*48,row*48,48,48,screenX,screenY,48,48)
  }else if(s.moving){
    ctx.drawImage(rangerWalkImg,s.frame*48,row*48,48,48,screenX,screenY,48,48)
  }else{
    const bob=Math.floor(now/520)%4===1?-1:0;
    ctx.drawImage(rangerIdleImg,(RANGER_IDLE_COL[s.facing]??0)*48,0,48,48,screenX,screenY+bob,48,48)
  }
  ctx.globalAlpha=1;
  if(p.peerId===peerId){
    ctx.strokeStyle=inCamp?'#80def0':'#8dd9ff';ctx.lineWidth=2;ctx.strokeRect(px+3,py+2,26,29);ctx.lineWidth=1
  }
  if(!inCamp&&p.downed){
    ctx.strokeStyle='#ef6f6f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+5,py+5);ctx.lineTo(px+27,py+27);ctx.moveTo(px+27,py+5);ctx.lineTo(px+5,py+27);ctx.stroke();ctx.lineWidth=1
  }
  if(inCamp){
    ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle='#eef4fb';
    ctx.fillText(`${p.name}${p.title&&p.title!=='Hunter'?`, ${p.title}`:''}`,px+16,py+38);ctx.textAlign='left'
  }
  ctx.restore();return true
}


/* ===== v0.7.1 unified sprite + movement runtime ===== */
const V7_CLASS_SOURCES={
 ranger:{idle:'assets/asset_054_06f6a89ec1b1b3a6.png',walk:'assets/asset_032_f671486edd48cce1.png',attack:'assets/asset_033_e153688c62bba046.png',volley:'assets/asset_034_6017ca5556706013.png'},
 shadow:{idle:'assets/asset_035_9738e5c21dfec703.png',walk:'assets/asset_036_b9b4d45c33eb90a1.png',attack:'assets/asset_037_5f740f9436519342.png',backstab:'assets/asset_038_27c7e53e454064c3.png',fan:'assets/asset_039_b63d70a7f9c3adc6.png'},
 warden:{idle:'assets/asset_040_2fd32be2e500480c.png',walk:'assets/asset_041_f1a3b8bfd5c8ca2c.png',attack:'assets/asset_042_94a5aafffd4d9516.png',shieldslam:'assets/asset_043_5d58ce683fb31f24.png',fortress:'assets/asset_044_10cd68d5d9d3dc39.png'},
 berserker:{idle:'assets/asset_045_00b01a622aebd4e7.png',walk:'assets/asset_046_df5be5eb0c094d48.png',attack:'assets/asset_047_106792cf0bce5012.png'},
 arcanist:{idle:'assets/asset_048_d83b55efd931f417.png',walk:'assets/asset_049_ff4e011100d470a6.png',attack:'assets/asset_050_f228a7ab7196fb67.png'},
 templar:{idle:'assets/asset_051_ea8445ec25d651a3.png',walk:'assets/asset_052_17459d3a8e606182.png',attack:'assets/asset_053_3461221440b57d60.png'},
};
const V7_CLASS_IMAGES={},v7ClassMotion=new Map();
Object.entries(V7_CLASS_SOURCES).forEach(([cid,set])=>{
  V7_CLASS_IMAGES[cid]={};
  Object.entries(set).forEach(([k,src])=>{const im=new Image();im.decoding='async';im.src=src;V7_CLASS_IMAGES[cid][k]=im})
});

/* ===== arcanist sprite override: mage-like one-hand wand pass ===== */
(()=>{
  const override={
    idle:'assets/asset_055_e8bf69b7a99904c6.png',
    walk:'assets/asset_056_58a2ea3cd8312a1b.png',
    attack:'assets/asset_057_a4c479b12b0ae1f7.png'
  };
  V7_CLASS_SOURCES.arcanist=override;
  V7_CLASS_IMAGES.arcanist={};
  Object.entries(override).forEach(([k,src])=>{const im=new Image();im.decoding='async';im.src=src;V7_CLASS_IMAGES.arcanist[k]=im});
})();

function v7SpriteReady(cid){
  const a=V7_CLASS_IMAGES[cid];
  return !!a&&['idle','walk','attack'].every(k=>a[k]?.complete&&a[k].naturalWidth>0)
}
function v7VisualAction(p,now=Date.now()){const a=p?.visualAction;if(!a?.startedAt||!a?.duration)return null;return now-a.startedAt<=a.duration+60?a:null}
const V72_ACTION_DURATIONS={attack:430,shieldslam:560,fortress:680,cleave:560,frenzy:720,twin:540,volley:620,lance:570,starfall:760,smite:570,radiant:760,backstab:600,fan:640};
function triggerClassVisualAction(p,type,targets=[]){
  if(!p)return;
  try{
    p.visualAction={
      eventId:`v72-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      peerId:p.peerId,type,duration:V72_ACTION_DURATIONS[type]||520,startedAt:Date.now(),facing:p.facing||'south',
      targets:(targets||[]).filter(Boolean).map((e,i)=>({id:e.id,x:e.x,y:e.y,size:e.size||1,boss:!!e.boss,index:i}))
    };
  }catch(err){console.warn('ASHFALL visual action skipped',err)}
}
const CLASS_STRIDE_MS={warden:78,berserker:70,ranger:64,arcanist:68,templar:74,shadow:58};
function v7MoveDuration(classId,inCamp,dist){
  const perTile=inCamp?122:205;
  const weight={warden:1.08,berserker:1.04,ranger:.96,arcanist:1,templar:1.04,shadow:.92}[classId]||1;
  return clamp(perTile*weight*Math.max(.12,dist),inCamp?55:100,inCamp?230:360)
}
function v7ClassState(p,inCamp=false,now=performance.now()){
  const tx=inCamp?(p.campX??14):p.x,ty=inCamp?(p.campY??15):p.y,key=`v71:${inCamp?'c':'r'}:${p.peerId}`;
  let s=v7ClassMotion.get(key);
  if(!s){s={fromX:tx,fromY:ty,targetX:tx,targetY:ty,start:now,duration:1,facing:p.facing||'south',walkEpoch:now,wasMoving:false};v7ClassMotion.set(key,s)}
  const oldT=clamp((now-s.start)/Math.max(1,s.duration),0,1),cx=s.fromX+(s.targetX-s.fromX)*oldT,cy=s.fromY+(s.targetY-s.fromY)*oldT,wasMoving=oldT<1;
  if(tx!==s.targetX||ty!==s.targetY){
    const stepDx=tx-s.targetX,stepDy=ty-s.targetY,dist=Math.hypot(tx-cx,ty-cy);
    s.fromX=cx;s.fromY=cy;s.targetX=tx;s.targetY=ty;s.start=now;s.duration=v7MoveDuration(p.classId,inCamp,dist);
    s.facing=p.facing||rangerFacingFromDelta(stepDx,stepDy,s.facing);
    if(!wasMoving)s.walkEpoch=now;
    s.wasMoving=true
  }else if(p.facing)s.facing=p.facing;
  const t=clamp((now-s.start)/Math.max(1,s.duration),0,1),moving=t<1;
  const x=s.fromX+(s.targetX-s.fromX)*t,y=s.fromY+(s.targetY-s.fromY)*t;
  if(!moving&&s.wasMoving){s.fromX=s.targetX;s.fromY=s.targetY;s.wasMoving=false}
  const stride=CLASS_STRIDE_MS[p.classId]||68,walkFrame=moving?Math.floor((now-s.walkEpoch)/stride)%6:0,idleFrame=Math.floor(now/230)%4;
  const gaitPhase=((now-s.walkEpoch)/(stride*6))*Math.PI*2,bob=moving?-Math.round(Math.abs(Math.sin(gaitPhase))*1):0;
  return{x,y,moving,walkFrame,idleFrame,facing:s.facing||'south',bob,progress:t}
}
function v7ActionSpriteKey(cid,type){
  if(cid==='ranger')return type==='volley'?'volley':'attack';
  if(cid==='shadow')return type==='backstab'?'backstab':type==='fan'?'fan':'attack';
  if(cid==='warden')return type==='shieldslam'?'shieldslam':type==='fortress'?'fortress':'attack';
  return 'attack'
}
function drawClassDefeatSpriteV141(p,st,row,imgs,now=performance.now()){
  const px=st.x*TILE,py=st.y*TILE,dead=!!p.dead,stamp=dead?(p.deadAt||Date.now()-700):(p.downedAt||Date.now()-500),age=Math.max(0,Date.now()-stamp),t=clamp(age/(dead?520:360),0,1),ease=1-Math.pow(1-t,3),dir=(st.facing==='west'||st.facing==='north')?-1:1,angle=dir*(dead?Math.PI*.53:Math.PI*.46)*ease,im=imgs.idle,frame=dead?0:Math.min(3,Math.floor(now/260)%4),classColor=CLASS_FX_COLOR[p.classId]||'#d67b69';
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.fillStyle=dead?'rgba(0,0,0,.48)':'rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(px+16,py+28,dead?19:17,dead?5:4,0,0,Math.PI*2);ctx.fill();
  ctx.translate(px+16,py+27);ctx.rotate(angle);ctx.globalAlpha=dead?.62:1;ctx.filter=dead?'grayscale(.82) brightness(.62) sepia(.18)':'saturate(.78) brightness(.82)';ctx.drawImage(im,frame*48,row*48,48,48,-24,-44,48,48);ctx.filter='none';ctx.globalAlpha=1;ctx.restore();
  ctx.save();ctx.textAlign='center';if(dead){const ash=.18+.09*Math.sin(now/430);ctx.strokeStyle=`rgba(178,139,118,${ash})`;ctx.beginPath();ctx.ellipse(px+16,py+28,20,6,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(220,184,145,.58)';ctx.font='bold 8px monospace';ctx.fillText('FALLEN',px+16,py+38)}else{const pulse=.55+.3*Math.sin(now/150);ctx.strokeStyle=`rgba(239,103,98,${pulse})`;ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.ellipse(px+16,py+28,19,6,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=classColor;ctx.fillRect(px+12,py+34,8,2);ctx.fillStyle='#ffd2c5';ctx.font='bold 8px monospace';ctx.fillText('REVIVE',px+16,py+43)}ctx.restore();return true
}
function drawClassSpriteV7(p,inCamp=false){
  if(!V7_CLASS_IMAGES[p.classId]||!v7SpriteReady(p.classId))return false;
  const now=performance.now(),st=v7ClassState(p,inCamp,now),act=inCamp?null:v7VisualAction(p),row={south:0,west:1,east:2,north:3}[(act?.facing)||st.facing]??0,imgs=V7_CLASS_IMAGES[p.classId];
  const px=st.x*TILE,py=st.y*TILE,sx=Math.round(px+TILE/2-24),sy=Math.round(py+TILE-47+st.bob);
  if(!inCamp&&(p.downed||p.dead))return drawClassDefeatSpriteV141(p,st,row,imgs,now);
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(px+16,py+27,st.moving?12:13,st.moving?3.4:4,0,0,Math.PI*2);ctx.fill();
  if(st.moving){
    ctx.fillStyle='rgba(190,170,130,.14)';const back=st.facing==='east'?6:st.facing==='west'?-6:0;ctx.fillRect(Math.round(px+15-back),Math.round(py+27),2,1)
  }
  if(act){
    const elapsed=Date.now()-act.startedAt,frame=Math.min(5,Math.max(0,Math.floor(elapsed/Math.max(1,act.duration)*6))),key=v7ActionSpriteKey(p.classId,act.type),im=imgs[key]||imgs.attack;
    ctx.drawImage(im,frame*48,row*48,48,48,sx,sy,48,48)
  }else if(st.moving)ctx.drawImage(imgs.walk,st.walkFrame*48,row*48,48,48,sx,sy,48,48);
  else ctx.drawImage(imgs.idle,st.idleFrame*48,row*48,48,48,sx,sy+(Math.floor(now/520)%4===1?-1:0),48,48);
  if(Date.now()-(p.hitFlash||0)<150){ctx.globalAlpha=.35;ctx.fillStyle='#ff514b';ctx.fillRect(px+5,py+3,22,26);ctx.globalAlpha=1}
  if(p.peerId===peerId){
    ctx.strokeStyle=inCamp?'rgba(128,222,240,.9)':'rgba(141,217,255,.95)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(px+16,py+27,14,5,0,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1
  }
  if(!inCamp&&p.submitted&&p.pending?.type==='move'){
    const nx=p.x+p.pending.dx,ny=p.y+p.pending.dy;ctx.strokeStyle='rgba(126,216,238,.55)';ctx.setLineDash([3,3]);ctx.strokeRect(nx*TILE+5,ny*TILE+5,TILE-10,TILE-10);ctx.setLineDash([])
  }
  if(inCamp){ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle='#eef4fb';ctx.fillText(`${p.name}${p.title&&p.title!=='Hunter'?`, ${p.title}`:''}`,px+16,py+38);ctx.textAlign='left'}
  ctx.restore();return true
}


const SAVE_SYSTEM=globalThis.AshfallSaveSystem,WORLD_CONTRACTS=globalThis.AshfallWorldContracts;
if(!SAVE_SYSTEM||!WORLD_CONTRACTS)throw new Error('ASHFALL support modules failed to load.');
const PROFILE_KEY=SAVE_SYSTEM.PROFILE_KEY;const PARTY_RECORD_KEY='ashfall_party_records_v1';
const SESSION_PEER='ashfall_mp_peer_id';
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[rand(0,a.length-1)];
const chance=p=>Math.random()<p;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const K=(x,y)=>`${x},${y}`;
const uid=()=>crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2);
const peerId=sessionStorage.getItem(SESSION_PEER)||uid();sessionStorage.setItem(SESSION_PEER,peerId);

let soundOn=true,audio=null,bc=null,isHost=false,roomCode=null,selectedMission='frontier';
let profile=null,room=null,snapshot=null,lastSummary=null,moveSaveTimer=null,selectedTargetId=null,selectedPartId=null;
let remoteTransportV141={room:null,cursor:0,controller:null,ready:Promise.resolve(),postQueue:Promise.resolve(),connected:false,idlePolls:0,nextPollDelay:180};
const transportSeenV141=new Set(),transportSeenOrderV141=[];
let lastAcceptedSnapshotVersionV146=0,acceptedSnapshotHostV146=null,acceptedVersionedSnapshotV146=false;
let lastProfileSyncedSettlementV146=null;

function rememberTransportEventV141(id){if(!id||transportSeenV141.has(id))return false;transportSeenV141.add(id);transportSeenOrderV141.push(id);while(transportSeenOrderV141.length>900)transportSeenV141.delete(transportSeenOrderV141.shift());return true}
function receiveTransportEventV141(event){if(!event)return;const id=event._transportId;if(id&&!rememberTransportEventV141(id))return;onNetwork(event)}
function setRemoteTransportStatusV141(connected){remoteTransportV141.connected=connected;document.body.classList.toggle('remote-mp-v141',connected);const badge=$('roomBadge');if(badge)badge.title=connected?'Remote multiplayer relay connected':'Local tab multiplayer fallback active'}
function stopRemoteTransportV141(){remoteTransportV141.controller?.abort();remoteTransportV141={room:null,cursor:0,controller:null,ready:Promise.resolve(),postQueue:Promise.resolve(),connected:false,idlePolls:0,nextPollDelay:180};setRemoteTransportStatusV141(false)}
function remotePostV141(event,code=remoteTransportV141.room){
  if(!code)return Promise.resolve(false);const state=remoteTransportV141;let body;try{body=JSON.stringify({room:code,event})}catch(err){if(remoteTransportV141===state)setRemoteTransportStatusV141(false);return Promise.resolve(false)}
  const post=async()=>{try{await state.ready;const res=await fetch('/api/multiplayer',{method:'POST',headers:{'content-type':'application/json'},body,credentials:'same-origin',keepalive:true});if(!res.ok)throw new Error(`relay ${res.status}`);if(remoteTransportV141===state){state.idlePolls=0;state.nextPollDelay=180;setRemoteTransportStatusV141(true)}return true}catch(err){if(err?.name!=='AbortError'&&remoteTransportV141===state)setRemoteTransportStatusV141(false);return false}};
  state.postQueue=state.postQueue.then(post,post);return state.postQueue
}
function startRemoteTransportV141(code){
  stopRemoteTransportV141();const controller=new AbortController(),state={room:code,cursor:0,controller,ready:null,postQueue:Promise.resolve(),connected:false,idlePolls:0,nextPollDelay:180};remoteTransportV141=state;
  state.ready=(async()=>{try{const res=await fetch(`/api/multiplayer?room=${encodeURIComponent(code)}&since=0`,{credentials:'same-origin',cache:'no-store',signal:controller.signal});if(!res.ok)throw new Error(`relay ${res.status}`);const data=await res.json(),events=data.events||[];state.cursor=data.cursor||0;events.forEach(row=>receiveTransportEventV141(row.event));state.idlePolls=events.length?0:1;state.nextPollDelay=events.length?180:350;setRemoteTransportStatusV141(true)}catch(err){if(err?.name!=='AbortError')setRemoteTransportStatusV141(false)}})();
  state.ready.then(async()=>{while(remoteTransportV141===state&&state.room===code&&!controller.signal.aborted){try{const res=await fetch(`/api/multiplayer?room=${encodeURIComponent(code)}&since=${state.cursor}`,{credentials:'same-origin',cache:'no-store',signal:controller.signal});if(!res.ok)throw new Error(`relay ${res.status}`);const data=await res.json(),events=data.events||[];for(const row of events){state.cursor=Math.max(state.cursor,row.id||0);receiveTransportEventV141(row.event)}if(events.length){state.idlePolls=0;state.nextPollDelay=180}else{state.idlePolls++;state.nextPollDelay=Math.min(900,260+state.idlePolls*90)}setRemoteTransportStatusV141(true)}catch(err){if(err?.name==='AbortError')break;state.nextPollDelay=1500;setRemoteTransportStatusV141(false)}await new Promise(resolve=>setTimeout(resolve,state.connected?state.nextPollDelay:1500))}})
}

let combatMeterMode='damage',combatFloaters=[],combatFeed=[],worldFx=[],screenShakeUntil=0,screenShakePower=0;
const CLASS_FX_COLOR={warden:'#8fc5ff',berserker:'#ff704f',ranger:'#79d99a',arcanist:'#b279ff',templar:'#f2cf72',shadow:'#b784f4'};
function combatPointEntity(e){
  if(!e)return{x:canvas.width/2,y:canvas.height/2};
  if(e.boss){const size=e.size||3;return{x:e.x*TILE+16,y:(e.y-Math.floor(size/2))*TILE+Math.round(size*TILE*.4)}}
  return{x:e.x*TILE+16,y:e.y*TILE+10}
}
function combatPointPlayer(p){return{x:(p.x??0)*TILE+16,y:(p.y??0)*TILE+7}}
function pushCombatFloaterEntity(e,text,color='#fff',size=13,life=900){
  const q=combatPointEntity(e);combatFloaters.push({x:q.x,y:q.y,text:String(text),color,size,born:performance.now(),life,vy:-22+Math.random()*-4,vx:(Math.random()-.5)*9})
}
function pushCombatFloaterPlayer(p,text,color='#fff',size=12,life=850){
  const q=combatPointPlayer(p);combatFloaters.push({x:q.x,y:q.y,text:String(text),color,size,born:performance.now(),life,vy:-20,vx:(Math.random()-.5)*8})
}
function pushCombatFeed(kind,source,amount,label=''){
  combatFeed.push({kind,source,amount,label,at:Date.now()});if(combatFeed.length>40)combatFeed.splice(0,combatFeed.length-40)
}
function emitWorldFx(kind,x,y,color='#fff',count=8,life=500){
  const now=performance.now();
  for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=10+Math.random()*35;worldFx.push({kind,x,y,color,born:now,life:life*(.75+Math.random()*.45),vx:Math.cos(a)*s,vy:Math.sin(a)*s-(kind==='spark'?10:0),r:1+Math.random()*2})}
  if(worldFx.length>260)worldFx.splice(0,worldFx.length-260)
}
function addRingFx(x,y,color='#fff',maxR=26,life=520,width=2){worldFx.push({kind:'ring',x,y,color,born:performance.now(),life,maxR,width})}
function addBeamFx(x1,y1,x2,y2,color='#fff',life=340,width=3){worldFx.push({kind:'beam',x:x1,y:y1,x2,y2,color,born:performance.now(),life,width})}
function shakeScreen(power=3,duration=120){screenShakePower=Math.max(screenShakePower,power);screenShakeUntil=performance.now()+duration}
function drawCombatFloaters(now=performance.now()){
  combatFloaters=combatFloaters.filter(f=>now-f.born<f.life);
  ctx.save();ctx.textAlign='center';
  combatFloaters.forEach(f=>{const t=(now-f.born)/1000,fade=Math.max(0,1-(now-f.born)/f.life);ctx.globalAlpha=Math.min(1,fade*1.7);ctx.font=`900 ${f.size}px ui-monospace,monospace`;ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.78)';ctx.strokeText(f.text,f.x+f.vx*t,f.y+f.vy*t);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x+f.vx*t,f.y+f.vy*t)});
  ctx.restore()
}
function drawWorldFx(now=performance.now()){
  worldFx=worldFx.filter(f=>now-f.born<f.life);
  ctx.save();ctx.globalCompositeOperation='lighter';
  worldFx.forEach(f=>{const t=Math.min(1,(now-f.born)/f.life),fade=1-t;ctx.globalAlpha=fade;
    if(f.kind==='ring'){ctx.strokeStyle=f.color;ctx.lineWidth=f.width||2;ctx.beginPath();ctx.arc(f.x,f.y,(f.maxR||26)*t,0,Math.PI*2);ctx.stroke()}
    else if(f.kind==='beam'){ctx.strokeStyle=f.color;ctx.lineWidth=(f.width||3)*(1-t*.6);ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x2,f.y2);ctx.stroke()}
    else{const tt=(now-f.born)/1000,x=f.x+f.vx*tt,y=f.y+f.vy*tt+(f.kind==='spark'?18*tt*tt:0);ctx.fillStyle=f.color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(f.r)),Math.max(1,Math.round(f.r)))}
  });ctx.restore()
}
function meterClassGlyph(cid){return{warden:'⛨',berserker:'✹',ranger:'➶',arcanist:'✦',templar:'✚',shadow:'◈'}[cid]||'•'}
function renderCombatMeters(r){
  const rows=$('damageMeterRows'),feed=$('combatFeedRows');if(!rows||!feed)return;
  const ps=Object.values(r?.run?.players||{});$('meterClock').textContent=r?.run?`R${r.run.round}`:'CAMP';
  if(!ps.length){rows.innerHTML='<div class="tiny">Meters begin when a hunt starts.</div>';feed.innerHTML='<div class="tiny">No combat events yet.</div>';return}
  const key=combatMeterMode==='heal'?'healing':'damage',sorted=ps.slice().sort((a,b)=>(b.combat?.[key]||0)-(a.combat?.[key]||0)),max=Math.max(1,...sorted.map(q=>q.combat?.[key]||0)),elapsed=Math.max(1,((Date.now()-(r?.run?.startedAt||Date.now()))/1000));
  rows.innerHTML=sorted.map((q,i)=>{const v=q.combat?.[key]||0,pct=Math.round(v/max*100),rate=(v/elapsed).toFixed(1);return`<div class="meterrow ${combatMeterMode==='heal'?'heal':''}"><div class="meterbar" style="width:${pct}%"></div><div class="meterline"><b><span class="class-pip">${meterClassGlyph(q.classId)}</span>${i+1}. ${q.name}</b><span>${v.toLocaleString()} <small>${rate}/s</small></span></div></div>`}).join('');
  const recent=combatFeed.slice(-8).reverse();feed.innerHTML=recent.length?recent.map(ev=>`<div class="${ev.kind==='crit'?'feed-crit':ev.kind==='heal'?'feed-heal':ev.kind==='bad'?'feed-bad':'feed-hit'}">${ev.source}: ${ev.label?ev.label+' ':''}${ev.amount!=null?Number(ev.amount).toLocaleString():''}</div>`).join(''):'<div class="tiny">Combat feed waiting...</div>'
}

function emitEnemyAttackFx(e,p){
  const a=combatPointEntity(e),b=combatPointPlayer(p),k=e.kind;
  if(k==='spider'){addBeamFx(a.x,a.y,b.x,b.y,'#65dd79',300,2);emitWorldFx('spark',b.x,b.y,'#65dd79',6,340)}
  else if(k==='cultist'){addBeamFx(a.x,a.y,b.x,b.y,'#ff834a',320,3);addRingFx(b.x,b.y,'#ff7a46',12,300,2)}
  else if(k==='wraith'){addBeamFx(a.x,a.y,b.x,b.y,'#8298ff',330,3);addRingFx(b.x,b.y,'#8298ff',14,360,2)}
  else if(k==='drake'){addBeamFx(a.x,a.y,b.x,b.y,'#a9e9f6',360,4);emitWorldFx('spark',b.x,b.y,'#d1f4fb',10,420)}
  else if(k==='slime'){addRingFx(b.x,b.y,'#77c98b',15,350,3)}
  else if(k==='golem'){addRingFx(b.x,b.y,'#a0b6c0',18,380,4);shakeScreen(3,100)}
  else if(k==='worldeater'){addRingFx(b.x,b.y,'#ff5350',20,420,4);emitWorldFx('spark',b.x,b.y,'#ff4c49',12,420)}
  else{addBeamFx(b.x-6,b.y-5,b.x+6,b.y+7,k==='wolf'?'#c8c2b5':'#d4d6dc',230,2)}
}

function abilityIconHTML(kind,label,cost=''){
  const glyph={attack:'⚔',guard:'⛨',potion:'✚',revive:'✦',warden1:'▣',warden2:'◉',berserker1:'🪓',berserker2:'✹',ranger1:'➶',ranger2:'≋',arcanist1:'✦',arcanist2:'☄',templar1:'✧',templar2:'✚',shadow1:'🗡',shadow2:'✣'}[kind]||'◆';
  const cls=kind==='attack'?'atk':kind==='guard'?'guard':kind==='potion'?'heal':kind==='revive'?'revive':kind.endsWith('1')?'s1':'s2';
  return`<span class="ability-icon ${cls}">${glyph}</span><span class="action-name">${label}</span>${cost?`<span class="action-cost">${cost}</span>`:''}`
}


function beep(f=360,d=.035,t='square',v=.018){
  if(!soundOn)return;
  try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=t;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+d);o.stop(audio.currentTime+d)}catch(e){}
}

const CLASSES={
  warden:{name:'Warden',color:'#78a8e8',hp:92,atk:10,def:7,res:'Rage',maxRes:10,range:1,
    s1:{name:'Shield Slam',cost:4},s2:{name:'Fortress',cost:7},
    desc:'Tank / bruiser. Protects the party and punishes enemies for attacking.'},
  berserker:{name:'Berserker',color:'#d96c62',hp:86,atk:13,def:4,res:'Fury',maxRes:12,range:1,
    s1:{name:'Cleave',cost:4},s2:{name:'Blood Frenzy',cost:8},
    desc:'Heavy melee damage. Stronger while wounded and capable of brutal cleaves.'},
  ranger:{name:'Ranger',color:'#79c995',hp:70,atk:12,def:3,res:'Focus',maxRes:12,range:5,
    s1:{name:'Twin Shot',cost:4},s2:{name:'Volley',cost:8},
    desc:'Ranged physical damage. Crits, poison, and safe positioning.'},
  arcanist:{name:'Arcanist',color:'#be8fe7',hp:62,atk:14,def:2,res:'Mana',maxRes:18,range:5,
    s1:{name:'Ember Lance',cost:6},s2:{name:'Starfall',cost:10},
    desc:'High magical damage. Armor piercing and area burning.'},
  templar:{name:'Templar',color:'#e1c774',hp:80,atk:10,def:5,res:'Faith',maxRes:14,range:1,
    s1:{name:'Smite',cost:4},s2:{name:'Radiant Hand',cost:8},
    desc:'Support fighter. Healing, emergency revives, and resilient solo play.'},
  shadow:{name:'Shadowblade',color:'#8d8da7',hp:68,atk:14,def:3,res:'Energy',maxRes:12,range:1,
    s1:{name:'Backstab',cost:4},s2:{name:'Fan of Knives',cost:8},
    desc:'Mobile melee assassin. Crits, dodges, bleeds, and burst damage.'}
};

const TALENTS={
  warden:[
    {id:'ironwall',name:'Ironwall',desc:'+12% max HP.'},
    {id:'retaliation',name:'Retaliation',desc:'Guard empowers your next attack by 35%.'},
    {id:'rally',name:'Rallying Guard',desc:'Fortress grants party +2 DEF for the next enemy phase.'}
  ],
  berserker:[
    {id:'bloodlust',name:'Bloodlust',desc:'Below 40% HP, gain 12% lifesteal.'},
    {id:'cleaver',name:'Deep Cleaver',desc:'Cleave deals +20% damage.'},
    {id:'undying',name:'Undying',desc:'You can be downed one extra time before dying.'}
  ],
  ranger:[
    {id:'eagle',name:'Eagle Eye',desc:'+8% critical chance.'},
    {id:'venom',name:'Venom Fletching',desc:'Twin Shot poisons for 2 rounds.'},
    {id:'ghost',name:'Ghost Step',desc:'+10% dodge chance.'}
  ],
  arcanist:[
    {id:'well',name:'Deep Well',desc:'+4 maximum Mana.'},
    {id:'wildfire',name:'Wildfire',desc:'Ember Lance applies burning.'},
    {id:'echo',name:'Arcane Echo',desc:'25% chance for a skill to refund half its Mana.'}
  ],
  templar:[
    {id:'grace',name:'Greater Grace',desc:'Radiant Hand heals 30% more.'},
    {id:'aegis',name:'Aegis',desc:'Guard gives all allies +1 DEF for the enemy phase.'},
    {id:'secondlight',name:'Second Light',desc:'First Radiant Hand revive each run costs no Faith.'}
  ],
  shadow:[
    {id:'precision',name:'Precision',desc:'+10% critical chance.'},
    {id:'hemo',name:'Hemorrhage',desc:'Backstab applies bleeding for 2 rounds.'},
    {id:'elusive',name:'Elusive',desc:'+12% dodge chance.'}
  ]
};


/* ===== v0.11 Hunter's Ascent runtime ===== */
const V11_TREE_DEFS={
warden:[['guardian','Guardian','⛨',[['Iron Bulwark','HP +8%',{hp:.08}],['Shield Discipline','Guard +12%',{guard:.12}],['Fortress Doctrine','Fortress +15%',{skill2:.15}],['Oathguard','+2 DEF',{def:2}],['Immovable','HP +8%, Guard +18%, +1 Rage on basic',{hp:.08,guard:.18,resourceGain:1}]]],['vanguard','Vanguard','⚔',[['Edge Training','Damage +4%',{damage:.04}],['Punishing Slam','Shield Slam +14%',{skill1:.14}],['Frontline Fury','Crit +4%',{crit:.04}],['Break the Line','Anatomy damage +35%',{partDamage:.35}],['Vanguard Oath','Boss +15%, Damage +6%',{bossDamage:.15,damage:.06}]]],['commander','Commander','♜',[['Battle Reserve','Max Rage +2',{maxRes:2}],['Battle Rhythm','+1 Rage on basic',{resourceGain:1}],['Commanding Presence','HP +4%, +1 DEF',{hp:.04,def:1}],['Shared Bastion','Fortress +22%',{skill2:.22}],['Hold the Line','HP +6%, Damage +5%',{hp:.06,damage:.05}]]]],
berserker:[['reaver','Reaver','🪓',[['Riven Edge','Damage +5%',{damage:.05}],['Wide Arc','Cleave +15%',{skill1:.15}],['Red Precision','Crit +5%',{crit:.05}],['Butcher Anatomy','Anatomy +30%',{partDamage:.30}],['Headsman','Boss +16%, execute +15%',{bossDamage:.16,lowTarget:.15}]]],['bloodbound','Bloodbound','♥',[['Taste of Iron','Lifesteal +4%',{leech:.04}],['Thick Blood','HP +6%',{hp:.06}],['Fury Engine','+1 Fury on basic',{resourceGain:1}],['Near Death','Damage +12% below 40% HP',{lowSelf:.12}],['Blood Without End','Lifesteal +6%, Damage +5%',{leech:.06,damage:.05}]]],['juggernaut','Juggernaut','◆',[['Warhide','HP +8%',{hp:.08}],['Iron Bone','+2 DEF',{def:2}],['Brace Through Pain','Guard +12%',{guard:.12}],['Crushing Weight','Anatomy +25%',{partDamage:.25}],['Unstoppable','HP +10%, Guard +15%',{hp:.10,guard:.15}]]]],
ranger:[['marksman','Marksman','➶',[['Long Sight','Range +1',{range:1}],['Steady Breath','Crit +4%',{crit:.04}],['Twin Fang','Twin Shot +15%',{skill1:.15}],['Quarry Focus','Boss +10%',{bossDamage:.10}],['Deadeye','Twin Shot +12%, Crit +5%',{skill1:.12,crit:.05}]]],['beaststalker','Beaststalker','◆',[['Apex Lore','Boss +8%',{bossDamage:.08}],['Part Hunter','Anatomy +30%',{partDamage:.30}],['Champion Hunter','Elite +10%',{eliteDamage:.10}],['Predator Rhythm','Damage +5%',{damage:.05}],['Monster Bane','Boss +12%, Anatomy +25%',{bossDamage:.12,partDamage:.25}]]],['trapper','Trapper','⌁',[['Soft Step','Dodge +4%',{dodge:.04}],['Deep Quiver','Max Focus +2',{maxRes:2}],['Rainmaker','Volley +15%',{skill2:.15}],['Field Tempo','+1 Focus on basic',{resourceGain:1}],['Untouchable','Dodge +6%, Damage +5%',{dodge:.06,damage:.05}]]]],
arcanist:[['pyromancer','Pyromancer','🔥',[['Kindled Lance','Ember Lance +12%',{skill1:.12}],['Mana Furnace','Max Mana +2',{maxRes:2}],['Cinder Theory','Damage +4%',{damage:.04}],['Flashpoint','Crit +4%',{crit:.04}],['Living Inferno','Ember Lance +15%, Boss +10%',{skill1:.15,bossDamage:.10}]]],['spellbreaker','Spellbreaker','◇',[['Arcane Pressure','Damage +6%',{damage:.06}],['Fracture Sigil','Anatomy +25%',{partDamage:.25}],['Runic Ward','+1 DEF',{def:1}],['Dual Thesis','Both skills +8%',{skill1:.08,skill2:.08}],['Spell Rupture','Boss +15%, Damage +5%',{bossDamage:.15,damage:.05}]]],['starcaller','Starcaller','☄',[['Falling Star','Starfall +15%',{skill2:.15}],['Astral Reservoir','Max Mana +3',{maxRes:3}],['Far Constellation','Range +1',{range:1}],['Stellar Alignment','Crit +4%',{crit:.04}],['Heavens Open','Starfall +18%, Damage +5%',{skill2:.18,damage:.05}]]]],
templar:[['dawnbringer','Dawnbringer','☀',[['Morning Star','Damage +4%',{damage:.04}],['Burning Judgment','Smite +15%',{skill1:.15}],['Golden Edge','Crit +3%',{crit:.03}],['Condemn the Great','Boss +10%',{bossDamage:.10}],['Noon Sun','Smite +15%, Damage +6%',{skill1:.15,damage:.06}]]],['lifebinder','Lifebinder','✚',[['Gentle Light','Healing +10%',{healing:.10}],['Deep Faith','Max Faith +2',{maxRes:2}],['Vital Grace','HP +5%',{hp:.05}],['Greater Mercy','Healing +15%',{healing:.15}],['Hands of Dawn','Healing +20%, +1 Faith on basic',{healing:.20,resourceGain:1}]]],['aegis','Aegis Knight','⛨',[['Consecrated Plate','HP +8%',{hp:.08}],['Sacred Armor','+2 DEF',{def:2}],['Prayerful Guard','Guard +15%',{guard:.15}],['Radiant Doctrine','Radiant Hand +12%',{healing:.12}],['Living Aegis','HP +8%, Guard +18%',{hp:.08,guard:.18}]]]],
shadow:[['assassin','Assassin','🗡',[['Killing Focus','Crit +4%',{crit:.04}],['Deep Backstab','Backstab +15%',{skill1:.15}],['Cold Intent','Damage +4%',{damage:.04}],['Apex Execution','Boss +10%',{bossDamage:.10}],['Perfect Murder','Backstab +15%, Crit +5%',{skill1:.15,crit:.05}]]],['hemomancer','Hemomancer','🩸',[['Red Sip','Lifesteal +3%',{leech:.03}],['Open the Vein','Anatomy +25%',{partDamage:.25}],['Deep Cut','Backstab +10%',{skill1:.10}],['Blood Scent','Execute +12%',{lowTarget:.12}],['Crimson Art','Lifesteal +5%, Boss +10%',{leech:.05,bossDamage:.10}]]],['ghost','Ghost','◈',[['Blur','Dodge +4%',{dodge:.04}],['Phantom Reach','Range +1',{range:1}],['Knife Mirage','Fan of Knives +15%',{skill2:.15}],['Flow State','+1 Energy on basic',{resourceGain:1}],['No Footprint','Dodge +6%, Damage +5%',{dodge:.06,damage:.05}]]]]};
const V11_COSTS=[1,1,2,2,3];
function v11Tree(cid){return(V11_TREE_DEFS[cid]||[]).map(p=>({id:p[0],name:p[1],glyph:p[2],nodes:p[3].map((n,i)=>({id:`${cid}_${p[0]}_${i+1}`,name:n[0],desc:n[1],effect:n[2],cost:V11_COSTS[i],tier:i+1,capstone:i===4,requires:i?`${cid}_${p[0]}_${i}`:null}))}))}
function v11Node(cid,id){return v11Tree(cid).flatMap(p=>p.nodes).find(n=>n.id===id)||null}
function ascentEffectsV11(p){const o={damage:0,basic:0,skill1:0,skill2:0,crit:0,dodge:0,hp:0,def:0,maxRes:0,resourceGain:0,healing:0,leech:0,range:0,bossDamage:0,eliteDamage:0,partDamage:0,guard:0,lowTarget:0,lowSelf:0};for(const id of(p?.ascentNodes||[])){const n=v11Node(p.classId,id);if(n)for(const[k,v]of Object.entries(n.effect||{}))o[k]=(o[k]||0)+v}return o}
function ascentEarnedV11(p){if(!p)return 0;const m=p.mastery||masteryLevel(p.classMastery?.[p.classId]||0);return Math.floor(((p.level||1)-1)/3)+(p.ascension||0)*4+Math.floor((m-1)/3)+Math.floor((p.lifetime?.bosses||0)/8)}
function ascentSpentV11(p){return(p?.ascentNodes||[]).reduce((s,id)=>s+(v11Node(p.classId,id)?.cost||0),0)}function ascentAvailableV11(p){return Math.max(0,ascentEarnedV11(p)-ascentSpentV11(p))}
function ascentDamageMultV11(p,e,skill=''){const a=ascentEffectsV11(p);let m=1+a.damage;if(skill==='attack')m*=1+a.basic;const s1={warden:['shield'],berserker:['cleave'],ranger:['twin'],arcanist:['lance'],templar:['smite'],shadow:['backstab']}[p?.classId]||[],s2={ranger:['volley'],arcanist:['starfall'],shadow:['knives']}[p?.classId]||[];if(s1.includes(skill))m*=1+a.skill1;if(s2.includes(skill))m*=1+a.skill2;if(e?.boss)m*=1+a.bossDamage;else if(e?.elite)m*=1+a.eliteDamage;if(e&&e.hp/e.maxHp<.35)m*=1+a.lowTarget;if(p&&p.hp/p.maxHp<.4)m*=1+a.lowSelf;return m}
function ascentGuardV11(p,base){return Math.max(.18,base*(1-(ascentEffectsV11(p).guard||0)))}
function buyAscentNodeV11(id){if(!profile)return;ensureProfileShape(profile);const n=v11Node(profile.classId,id);if(!n||profile.ascentNodes.includes(id))return;if(n.requires&&!profile.ascentNodes.includes(n.requires))return notifyV11('skill','PATH LOCKED','Unlock the previous node first.');const a=ascentAvailableV11(profile);if(a<n.cost)return notifyV11('skill','ASCENT POINTS REQUIRED',`${n.name} costs ${n.cost} AP. You have ${a}.`);profile.ascentNodes.push(id);persistProfile();renderProfile();renderAll();notifyV11('skill',n.capstone?'CAPSTONE UNLOCKED':'ASCENT NODE LEARNED',`${n.name} — ${n.desc}`,{life:n.capstone?6200:4400})}
function respecAscentV11(){if(!profile)return;const spent=ascentSpentV11(profile);if(!spent)return toast('No Ascent points invested');const gold=300+spent*35,rare=Math.max(1,Math.ceil(spent/7));if(profile.gold<gold||profile.materials.rare<rare)return notifyV11('skill','RESPEC COST',`Need ${gold}g and ${rare} rare materials.`);if(!confirm(`Respec all advanced nodes for ${gold}g and ${rare} rare materials?`))return;profile.gold-=gold;profile.materials.rare-=rare;profile.ascentNodes=[];persistProfile();renderProfile();renderAll();notifyV11('skill','ASCENT RESET','All advanced points refunded.')}
function ascentHTMLV11(p){const earned=ascentEarnedV11(p),spent=ascentSpentV11(p),avail=ascentAvailableV11(p);return `<div class="ascent-overview"><div><b>Hunter's Ascent</b><div class="tiny">90 advanced nodes across the six classes. Earn AP from levels, mastery, boss milestones and Ascension. Capstones define endgame builds.</div></div><div class="ascent-points">AVAILABLE<strong>${avail}</strong>${spent}/${earned} spent</div><button class="respec-v11" onclick="respecAscentV11()">Respec Tree</button></div><div class="ascent-tree">${v11Tree(p.classId).map(path=>{const owned=path.nodes.filter(n=>p.ascentNodes.includes(n.id)).length;return `<div class="ascent-path"><div class="ascent-path-head"><div><b>${path.glyph} ${path.name}</b><div class="ascent-progress"><i style="width:${owned*20}%"></i></div></div><span class="ascent-path-rank">${owned}/5</span></div>${path.nodes.map(n=>{const own=p.ascentNodes.includes(n.id),lock=n.requires&&!p.ascentNodes.includes(n.requires),can=avail>=n.cost&&!lock;return `<button class="ascent-node ${own?'owned':''} ${lock?'locked':''} ${n.capstone?'capstone':''}" ${own||!can?'disabled':''} onclick="buyAscentNodeV11('${n.id}')"><span class="ascent-glyph">${n.capstone?'★':n.tier}</span><span><span class="node-name">${n.name}</span><span class="node-desc">${n.desc}${lock?' • Requires prior node':''}</span></span><span class="node-cost">${own?'OWNED':`${n.cost} AP`}</span></button>`}).join('')}</div>`}).join('')}</div>`}
window.buyAscentNodeV11=buyAscentNodeV11;window.respecAscentV11=respecAscentV11;

const MISSIONS={
  frontier:{name:'Emberwood Frontier',level:'Lv 1–8',depths:3,open:true,diff:.85,minGear:0,
    desc:'Three-stage frontier hunt. Learn extraction, farm your first complete kit, then challenge Direfang Alpha.',
    enemies:['wolf','emberboar','thornling','spider'],boss:{name:'Direfang Alpha',kind:'direwolf',hp:105,atk:15,def:4,xp:90}},
  hollow:{name:'Ashfall Hollow',level:'Lv 5–12',depths:4,open:false,diff:1,minLevel:5,minGear:8,requiredTrophy:'Direfang Alpha',
    desc:'A four-stage crypt descent ruled by goblin scavengers and the dead. Gear becomes mandatory here.',
    enemies:['gutterling','bonearcher','gravehusk','skeleton'],boss:{name:'The Gutter King',kind:'bossgoblin',hp:145,atk:19,def:7,xp:145}},
  gloam:{name:'Gloamfen',level:'Lv 10–17',depths:5,open:true,diff:1.22,minLevel:10,minGear:16,requiredTrophy:'The Gutter King',
    desc:'Five marsh stages of poison, spores and ambush predators. Farm resistance through raw HP and defense.',
    enemies:['fenstalker','sporeling','bogwitch','slime'],boss:{name:'Mire Mother',kind:'mire',hp:190,atk:23,def:8,xp:190}},
  keep:{name:'Ruined Keep',level:'Lv 15–22',depths:6,open:false,diff:1.45,minLevel:15,minGear:24,requiredTrophy:'Mire Mother',
    desc:'Six-stage siege through Ashbound military remnants. Heavy armor and upgraded weapons matter.',
    enemies:['ashguard','cinderhound','banneret','knight'],boss:{name:'Sir Veyr, Ashbound',kind:'bossknight',hp:270,atk:29,def:12,xp:285}},
  frost:{name:'Frostvein Caverns',level:'Lv 20–27',depths:7,open:false,diff:1.58,minLevel:20,minGear:32,requiredTrophy:'Sir Veyr, Ashbound',
    desc:'Seven glacial stages. Frostseers drain resources while crystal beasts punish weak defenses.',
    enemies:['icecrawler','frostseer','crystalbeast','drake'],boss:{name:'Frostmaw, the Pale Drake',kind:'bossdrake',hp:340,atk:32,def:13,xp:340}},
  rift:{name:'The Rift Crucible',level:'Lv 25–30+',depths:8,open:false,diff:1.82,minLevel:25,minGear:40,requiredTrophy:'Frostmaw, the Pale Drake',
    desc:'Eight endgame stages where positioning, burst windows and refined gear are expected.',
    enemies:['voidling','chorister','riftreaver','wraith'],boss:{name:'The Nameless Choir',kind:'riftboss',hp:475,atk:38,def:15,xp:475}},
  worldeater:{name:'Grand Hunt: The World Eater',level:'Lv 30+',depths:6,open:false,diff:2.08,minLevel:30,minGear:48,requiredTrophy:'The Nameless Choir',
    desc:'Apocalypse-class Grand Hunt. Six stages culminate in a four-phase raid with fractures, add waves and anatomy burn windows.',
    enemies:['mawspawn','riftmauler','abyssseer','worldeater'],boss:{name:'The World Eater',kind:'worldeater',hp:720,atk:46,def:19,xp:850}}
};


const DIFFICULTIES={
  normal:{name:'Normal',enemy:1.12,reward:1,minLevel:1,desc:'The intended campaign difficulty. Enemies punish bad positioning and weak gear.'},
  veteran:{name:'Veteran',enemy:1.48,reward:1.32,minLevel:8,desc:'+48% enemy power • +32% rewards • stronger elite pressure.'},
  nightmare:{name:'Nightmare',enemy:1.95,reward:1.68,minLevel:18,desc:'+95% enemy power • +68% rewards • intended for refined builds and mastery hunts.'}
};
const MODIFIERS=[
  {id:'clear',name:'Clear Skies',desc:'No unusual conditions. Pure hunt.',enemy:1,reward:1,elite:0,extra:0,loot:0},
  {id:'bloodmoon',name:'Blood Moon',desc:'Enemies hit 18% harder, but rewards surge 35%.',enemy:1.18,reward:1.35,elite:.04,extra:0,loot:.04},
  {id:'treasure',name:'Treasure Vein',desc:'More gear and materials are found throughout the expedition.',enemy:1.05,reward:1.25,elite:0,extra:0,loot:.18},
  {id:'champions',name:'Champion Surge',desc:'Many more elite monsters. Dangerous, lucrative, purple.',enemy:1.08,reward:1.42,elite:.17,extra:1,loot:.08},
  {id:'swarm',name:'Infested',desc:'Additional enemies crowd every stage. XP and material income rise.',enemy:1.04,reward:1.3,elite:.03,extra:3,loot:.03}
];
const CONTRACTS=[
  {id:'slayer',name:'Cull the Wild',metric:'kills',base:20,step:20,rewardGold:90,rewardCommon:8,desc:'Defeat monsters across any expedition.'},
  {id:'hunter',name:'Boss Hunter',metric:'bosses',base:2,step:2,rewardGold:150,rewardRare:2,desc:'Bring down major hunt targets.'},
  {id:'extractor',name:'Bring Everyone Home',metric:'success',base:3,step:3,rewardGold:120,rewardCommon:6,rewardRare:1,desc:'Complete or safely extract from expeditions.'},
  {id:'deep',name:'Into the Dark',metric:'bestDepth',base:3,step:2,rewardGold:100,rewardRare:1,desc:'Push your personal best expedition depth.'}
];

const ENEMY={
  wolf:{name:'Road Wolf',hp:28,atk:8,def:1,xp:12,color:'#77756d'},
  emberboar:{name:'Emberback Boar',hp:40,atk:11,def:3,xp:19,color:'#8d6546'},
  thornling:{name:'Briar Thornling',hp:33,atk:11,def:2,xp:18,color:'#4f7d51'},
  spider:{name:'Gloam Spider',hp:31,atk:10,def:2,xp:16,color:'#5e4a73'},
  goblin:{name:'Ash Goblin',hp:34,atk:9,def:2,xp:15,color:'#8f4c42'},
  gutterling:{name:'Gutter Bombardier',hp:45,atk:13,def:4,xp:25,color:'#70834d'},
  bonearcher:{name:'Bone Archer',hp:40,atk:15,def:3,xp:26,color:'#c0b99e'},
  gravehusk:{name:'Grave Husk',hp:60,atk:14,def:7,xp:31,color:'#777269'},
  skeleton:{name:'Restless Dead',hp:42,atk:12,def:5,xp:22,color:'#b9b4a4'},
  fenstalker:{name:'Fen Stalker',hp:62,atk:17,def:5,xp:35,color:'#46725a'},
  sporeling:{name:'Sporeling',hp:50,atk:15,def:4,xp:31,color:'#746054'},
  bogwitch:{name:'Bog Witch',hp:55,atk:18,def:5,xp:38,color:'#647349'},
  slime:{name:'Bog Slime',hp:48,atk:12,def:3,xp:25,color:'#527c5e'},
  cultist:{name:'Cinder Cultist',hp:46,atk:14,def:4,xp:27,color:'#71405f'},
  ashguard:{name:'Ashbound Guard',hp:78,atk:20,def:11,xp:47,color:'#727b88'},
  cinderhound:{name:'Cinder Hound',hp:66,atk:22,def:7,xp:44,color:'#8b5042'},
  banneret:{name:'Ashbound Banneret',hp:70,atk:18,def:10,xp:49,color:'#706873'},
  knight:{name:'Hollow Knight',hp:58,atk:15,def:8,xp:34,color:'#657080'},
  icecrawler:{name:'Ice Crawler',hp:82,atk:23,def:11,xp:52,color:'#7397a5'},
  frostseer:{name:'Frostseer',hp:68,atk:25,def:8,xp:56,color:'#8cb9c8'},
  crystalbeast:{name:'Crystal Beast',hp:102,atk:25,def:15,xp:63,color:'#86b5c5'},
  golem:{name:'Runestone Golem',hp:72,atk:18,def:10,xp:42,color:'#66717a'},
  drake:{name:'Pale Drake',hp:64,atk:20,def:7,xp:45,color:'#8aa4ae'},
  voidling:{name:'Voidling',hp:88,atk:27,def:10,xp:66,color:'#7756a1'},
  chorister:{name:'Rift Chorister',hp:82,atk:29,def:9,xp:71,color:'#8d62b0'},
  riftreaver:{name:'Rift Reaver',hp:112,atk:31,def:14,xp:79,color:'#745379'},
  wraith:{name:'Bell Wraith',hp:43,atk:17,def:4,xp:32,color:'#6673a0'},
  mawspawn:{name:'Maw Spawn',hp:116,atk:34,def:13,xp:88,color:'#873f46'},
  riftmauler:{name:'Rift Mauler',hp:142,atk:36,def:17,xp:96,color:'#733d4a'},
  abyssseer:{name:'Abyss Seer',hp:102,atk:38,def:12,xp:99,color:'#8d4c83'},
  worldeater:{name:'World Eater Spawn',hp:110,atk:30,def:12,xp:72,color:'#9b5b51'}
};


const V09_ZONE_STAGES={
  frontier:['Old Hunter Road','Charred Thicket','Direfang Hunting Grounds'],
  hollow:['Collapsed Ossuary','Gutter Warrens','Bell Crypts','The Scrap Throne'],
  gloam:['Drowned Causeway','Sporewood','Witchfen','Rotwater Basin','Mother Mire'],
  keep:['Broken Gate','Barracks of Ash','Hound Court','Banner Hall','Cinder Ramparts','Veyr’s Summit'],
  frost:['Frozen Descent','Glass-Ice Gallery','Crawler Nest','Seer Vault','Crystal Chasm','Pale Roost','Frostmaw’s Crown'],
  rift:['Shattered Vestibule','Void Galleries','Discord Hall','Reaver Maze','Black Bell Crossing','Choir Nave','Starless Threshold','The Final Chorus'],
  worldeater:['Riftfall Approach','Carrion Fields','Maw Nursery','Herald’s Crossing','The Broken Horizon','Rift Crater']
};
const V09_ZONE_GEAR={
  frontier:{weapon:['Emberwood Spear','Wolfbone Cleaver','Ashwood Longbow','Hunter Wand'],armor:['Frontier Leathers','Cinderhide Coat','Roadwarden Mail'],charm:['Direfang Token','Emberwood Knot','Hunter Oathstone']},
  hollow:{weapon:['Gutterblade','Crypt Pike','Bonebow','Graveglass Rod'],armor:['Ossuary Mail','Gutterplate','Bell Crypt Vestment'],charm:['King’s Scrap','Grave Bell','Bone Sigil']},
  gloam:{weapon:['Fenknife','Bogwood Bow','Spore Scepter','Mirebreaker'],armor:['Fenstalker Hide','Sporewoven Robe','Bogscale Harness'],charm:['Mire Bloom','Witchfen Idol','Rotwater Pearl']},
  keep:{weapon:['Ashbound Greatsword','Cinder Mace','Keep Longbow','Veyr’s Focus'],armor:['Ashbound Plate','Banneret Mantle','Cinderhound Leathers'],charm:['Broken Crown','Keep Standard','Ash Oath']},
  frost:{weapon:['Frostglass Blade','Pale Drake Bow','Icebound Hammer','Seer Crystal'],armor:['Frostvein Plate','Whitehide Mantle','Crystalweave Robe'],charm:['Frostmaw Scale','Seer Prism','Glacial Heart']},
  rift:{weapon:['Rift Reaver Blade','Voidbow','Choir Scepter','Starless Axe'],armor:['Riftmail','Chorister Vestment','Voidstep Leathers'],charm:['Black Bell Shard','Choir Mask','Rift Eye']},
  worldeater:{weapon:['Worldbreaker','Abyssal Longbow','Mawcleaver','Hunger Focus'],armor:['Worldhide Plate','Abyssweave Robe','Rift-Crater Mantle'],charm:['World Horn Shard','Abyssal Heartstone','Last Horizon Sigil']}
};
const V09_LIEUTENANTS={
  frontier:['emberboar','Cinderback Matriarch'],hollow:['gravehusk','Keeper of the Ossuary'],gloam:['bogwitch','The Fen Hexer'],keep:['banneret','Captain of the Last Banner'],frost:['crystalbeast','Shardhide Ancient'],rift:['riftreaver','Bell-Reaver Exarch'],worldeater:['riftmauler','Herald of the Maw']
};
const V09_BOSS_SET_BY_KIND={direwolf:'direfang',bossgoblin:'gutter',mire:'mire',bossknight:'ashbound',bossdrake:'frost',riftboss:'choir',worldeater:'world'};

const V10_ITEM_TRAITS={
  boss_slayer:{name:'Apex Hunter',desc:'+18% damage to Elite and Boss enemies.'},
  partbreaker:{name:'Bonebreaker',desc:'+40% damage dealt to breakable anatomy.'},
  bloodletter:{name:'Bloodletter',desc:'Basic attacks have a 28% chance to inflict 2 rounds of Bleed.'},
  longreach:{name:'Long Reach',desc:'+1 basic attack range.'},
  skill_one:{name:'Focused Technique',desc:'+18% damage with Skill I.'},
  skill_two:{name:'Master Technique',desc:'+18% damage with Skill II.'},
  warding:{name:'Warded',desc:'+8% maximum HP in expeditions.'},
  iron_skin:{name:'Ironbound',desc:'+3 Defense in expeditions.'},
  swiftstep:{name:'Windstep',desc:'+5% Dodge.'},
  resource_well:{name:'Deep Reservoir',desc:'+3 maximum class resource.'},
  resonant_focus:{name:'Resonant Focus',desc:'+2 maximum class resource.'},
  battle_focus:{name:'Battle Focus',desc:'+5% Critical Chance.'},
  surefooted:{name:'Surefooted',desc:'+4% Dodge.'},
  shoulder_breaker:{name:'Breaker’s Mantle',desc:'+18% damage to breakable anatomy.'},
  bulwark_grip:{name:'Bulwark Grip',desc:'+2 Defense in expeditions.'},
  vital_guard:{name:'Vital Guard',desc:'+6% maximum HP in expeditions.'},
  scavenger:{name:'Fortune Hunter',desc:'+18% gold/material recovery during hunts.'},
  bastion_edge:{name:'Bastion Edge',desc:'Warden Shield Slam deals +32% damage.'},
  red_harvest:{name:'Red Harvest',desc:'Berserker Cleave deals +24% damage.'},
  storm_quiver:{name:'Storm Quiver',desc:'Ranger Volley deals +20% damage.'},
  piercing_lance:{name:'Piercing Ember',desc:'Arcanist Ember Lance deals +32% damage and gains +1 range.'},
  second_sun:{name:'Second Sun',desc:'Templar Smite deals +24% damage.'},
  ghoststeel:{name:'Ghoststeel',desc:'Shadowblade Backstab deals +28% damage and gains +1 range.'}
};
const V10_CLASS_TRAIT={warden:'bastion_edge',berserker:'red_harvest',ranger:'storm_quiver',arcanist:'piercing_lance',templar:'second_sun',shadow:'ghoststeel'};
const V10_SKILL1_TAGS=new Set(['shield','cleave','twin','lance','smite','backstab']);
const V10_SKILL2_TAGS=new Set(['volley','starfall','knives']);
const V10_FRONTIER_EVENTS=[
  {id:'apextrail',name:'Apex Trail',desc:'Fresh signs lead to a named apex predator. High-risk, guaranteed bonus gear.',reward:1.22,elite:.04,extra:0,loot:.14},
  {id:'woundedhunter',name:'Wounded Hunter',desc:'A stranded hunter shares supplies. The party recovers before the hunt continues.',reward:1.08,elite:0,extra:0,loot:.04},
  {id:'corruptedshrine',name:'Corrupted Shrine',desc:'Destroying the shrine empowers prey and improves the payout.',reward:1.3,elite:.08,extra:2,enemy:1.12,loot:.1},
  {id:'wolfmigration',name:'Dire Migration',desc:'Wolf packs flood the old road. More prey, more hides, more risk.',reward:1.18,elite:.03,extra:3,loot:.05}
];
const V10_FRONTIER_QUESTS=[
  {id:'trail_signs',name:'Read the Trail',desc:'Defeat 8 Emberwood beasts (wolves, boars, thornlings or spiders).',need:8,reward:'120 gold + 6 common'},
  {id:'breaker_lesson',name:'Break What Hunts You',desc:'Break 3 monster body parts across your hunts.',need:3,reward:'2 rare materials'},
  {id:'alpha_research',name:'The Alpha Pattern',desc:'Defeat Direfang Alpha and return its trophy to Emberwatch.',need:1,reward:'Fangcaller Epic weapon with a guaranteed build trait'}
];
const V10_MONSTER_LORE={
  wolf:'Road wolves test the edges of Emberwatch and become bolder under Direfang’s call.',emberboar:'Emberbacks root through old burn scars. Their charge is deadly in narrow lanes.',thornling:'Briar constructs animated by the Emberwood’s wounded root-network.',spider:'Gloam spiders nest beneath charred roots and punish hunters who ignore poison.',direwolf:'Direfang Alpha is the apex packlord of Emberwood. Break its anatomy to change the fight.',bossgoblin:'A scavenger king who weaponized the Hollow’s dead and its discarded iron.',mire:'An ancient fungal brood-mother whose body is equal parts root, corpse and bog.',bossknight:'Sir Veyr still commands the Keep long after duty should have ended.',bossdrake:'Frostmaw has turned the upper caverns into a kingdom of glass ice.',riftboss:'The Choir is not one body. The masks are merely where the sound chooses to look from.',worldeater:'A Rift-born extinction organism. Its anatomy functions like siege armor.'
};
function equippedGearTraitsV10(p){return Object.values(p?.equipment||{}).filter(Boolean).map(i=>i.trait).filter(Boolean)}
function hasGearTraitV10(p,id){return !!p?.gearTraits?.includes(id)}
function gearTraitDamageMultV10(p,e,skill=''){let m=1;if(hasGearTraitV10(p,'boss_slayer')&&(e?.boss||e?.elite))m*=1.18;if(hasGearTraitV10(p,'skill_one')&&V10_SKILL1_TAGS.has(skill))m*=1.18;if(hasGearTraitV10(p,'skill_two')&&V10_SKILL2_TAGS.has(skill))m*=1.18;if(hasGearTraitV10(p,'bastion_edge')&&skill==='shield')m*=1.32;if(hasGearTraitV10(p,'red_harvest')&&skill==='cleave')m*=1.24;if(hasGearTraitV10(p,'storm_quiver')&&skill==='volley')m*=1.20;if(hasGearTraitV10(p,'piercing_lance')&&skill==='lance')m*=1.32;if(hasGearTraitV10(p,'second_sun')&&skill==='smite')m*=1.24;if(hasGearTraitV10(p,'ghoststeel')&&skill==='backstab')m*=1.28;return m}
function gearTraitPartMultV10(p){let m=hasGearTraitV10(p,'partbreaker')?1.4:1;if(hasGearTraitV10(p,'shoulder_breaker'))m*=1.18;return m}
function traitPoolForItemV10(classId,type){type=canonicalItemTypeV132(type);if(type==='weapon')return ['boss_slayer','partbreaker','bloodletter','longreach','skill_one','skill_two',V10_CLASS_TRAIT[classId]].filter(Boolean);if(type==='head')return ['resource_well','resonant_focus','vital_guard','iron_skin'];if(type==='shoulders')return ['partbreaker','shoulder_breaker','iron_skin','warding'];if(type==='chest')return ['warding','iron_skin','vital_guard','partbreaker'];if(type==='gloves')return ['battle_focus','skill_one','skill_two','bloodletter'];if(type==='boots')return ['surefooted','swiftstep','warding'];if(type==='offhand')return ['bulwark_grip','resonant_focus','boss_slayer','skill_one','skill_two'];if(type==='ring')return ['battle_focus','surefooted','boss_slayer','scavenger'];return ['resource_well','resonant_focus','scavenger','boss_slayer','skill_one','skill_two']}
function maybeAssignTraitV10(item,p,force=false){if(!item||item.trait)return item;const rate={common:0,uncommon:.015,rare:.15,epic:.40,legendary:1,relic:1,mythic:1}[item.rarity]||0;if(force||chance(rate)){item.trait=pick(traitPoolForItemV10(p?.classId||profile?.classId||'warden',item.type));item.traitAwakened=!!force}return item}
function traitTextV10(i){const t=i?.trait&&V10_ITEM_TRAITS[i.trait];return t?`${t.name}: ${t.desc}`:''}
function huntHeatV10(run){return clamp(run?.huntHeat||1,1,2)}
function carriedLootValueV10(p){if(!p?.runLoot)return 0;const L=p.runLoot;return Math.round((L.gold||0)+(L.common||0)*7+(L.rare||0)*32+(L.items||[]).reduce((s,i)=>s+(i.value||i.ilvl*8||0),0)+(L.namedParts?Object.values(L.namedParts).reduce((a,b)=>a+b,0)*18:0))}
function campLevelV10(p){const t=p?.trophies?.length||0,c=p?.lifetime?.success||0;return Math.min(6,1+Math.floor(t/2)+Math.floor(c/15))}
function campProgressionHTMLV10(p){const lv=campLevelV10(p),pct=Math.min(100,((p.trophies?.length||0)/7)*100);return `<div class="legacycard"><b>Emberwatch Camp — <span class="camp-level-badge">Level ${lv}</span></b><div class="tiny">Boss trophies and successful hunts physically strengthen the camp.</div><div class="camp-progressbar"><i style="width:${pct}%"></i></div><div class="tiny" style="margin-top:5px">${p.trophies?.length||0}/7 major trophies secured.</div></div>`}
function frontierQuestProgressV10(p,id){if(id==='trail_signs')return ['wolf','emberboar','thornling','spider'].reduce((n,k)=>n+(p.monsterMastery?.[k]?.kills||0),0);if(id==='breaker_lesson')return p.lifetime?.partsBroken||0;if(id==='alpha_research')return p.trophies?.includes('Direfang Alpha')?1:0;return 0}
function livingHuntQuestHTMLV10(p){p.huntQuestClaims=p.huntQuestClaims||{};return `<div class="sectiontitle" style="margin-top:10px">Emberwood Research Chain</div>${V10_FRONTIER_QUESTS.map(q=>{const v=frontierQuestProgressV10(p,q.id),done=v>=q.need,claimed=!!p.huntQuestClaims[q.id];return `<div class="quest-card ${done?'done':''} ${claimed?'claimed':''}"><div class="quest-title"><b>${q.name}</b><span>${Math.min(v,q.need)}/${q.need}</span></div><div class="tiny">${q.desc}</div><div class="quest-reward">Reward: ${q.reward}</div><button ${done&&!claimed?'':'disabled'} onclick="claimFrontierQuestV10('${q.id}')">${claimed?'Claimed':done?'Claim Reward':'In Progress'}</button></div>`}).join('')}`}
function makeFangcallerV10(p){const ilvl=Math.max(8,p.level+5),base={warden:'Fangcaller Blade',berserker:'Fangcaller Cleaver',ranger:'Fangcaller Longbow',arcanist:'Fangcaller Wand',templar:'Fangcaller Mace',shadow:'Fangcaller Knives'}[p.classId]||'Fangcaller Weapon';const i={id:uid(),type:'weapon',ilvl,rarity:'epic',name:base,atk:Math.round((5+ilvl*.95)*1.78),def:0,hp:0,affixType:'crit',affixValue:.04,enhance:1,zoneId:'frontier',trait:V10_CLASS_TRAIT[p.classId],traitAwakened:true,value:ilvl*20};return i}
function claimFrontierQuestV10(id){if(!profile)return;ensureProfileShape(profile);const q=V10_FRONTIER_QUESTS.find(x=>x.id===id);if(!q||profile.huntQuestClaims[id]||frontierQuestProgressV10(profile,id)<q.need)return toast('Quest not complete');profile.huntQuestClaims[id]=true;if(id==='trail_signs'){profile.gold+=120;profile.materials.common+=6}else if(id==='breaker_lesson')profile.materials.rare+=2;else if(id==='alpha_research')profile.inventory.push(makeFangcallerV10(profile));persistProfile();renderProfile();notifyV11('quest','QUEST REWARD',`${q.name} — ${q.reward}`,{life:5600})}
function codexCardV10(k,p){const d=p.monsterMastery?.[k]||{kills:0,parts:0},kills=d.kills||0,tier=masteryTier(kills),name=ENEMY[k]?.name||({direwolf:'Direfang Alpha',bossgoblin:'The Gutter King',mire:'Mire Mother',bossknight:'Sir Veyr, Ashbound',bossdrake:'Frostmaw',riftboss:'The Nameless Choir',worldeater:'The World Eater'}[k]||k),ability=kills>=3?(V09_ENEMY_ABILITIES[k]||V09_BOSS_KITS[k]||'Observed behavior recorded.'):'Defeat 3 to reveal attacks.',parts=kills>=5?((PART_DEFS[k]||[]).map(x=>x[1]).join(' • ')||'No targetable anatomy recorded.'):'Defeat 5 to reveal breakable anatomy.',drop=kills>=10?(KILL_MATS[k]?.[1]||'Rare hunt materials and zone equipment.'):'Defeat 10 to reveal primary material.',lore=kills>=1?(V10_MONSTER_LORE[k]||'Field notes incomplete.'):'Undiscovered field notes.';return `<div class="codex-card"><div class="codex-head"><b>${name}</b><span class="codex-rank">Mastery ${tier} • ${kills} kills</span></div><div class="codex-line">${lore}</div><div class="codex-line"><b>Attack:</b> ${ability}</div><div class="codex-line"><b>Anatomy:</b> ${parts}</div><div class="codex-line"><b>Material:</b> ${drop}</div><div class="codex-progress"><i style="width:${Math.min(100,kills)}%"></i></div></div>`}
function livingCodexHTMLV10(p){const frontier=['wolf','emberboar','thornling','spider','direwolf'],seen=new Set(Object.keys(p.monsterMastery||{}));(p.trophies||[]).forEach(t=>{for(const m of Object.values(MISSIONS))if(m.boss.name===t)seen.add(m.boss.kind)});const keys=[...frontier,...[...seen].filter(k=>!frontier.includes(k))];return keys.map(k=>codexCardV10(k,p)).join('')}
function refineGearV10(slot){const i=profile?.equipment?.[slot];if(!i)return toast('Equip an item first');const costG=80+(i.ilvl||1)*6,costC=10+(i.enhance||0)*2;if(profile.gold<costG||profile.materials.common<costC)return toast(`Refine needs ${costG}g and ${costC} common`);profile.gold-=costG;profile.materials.common-=costC;let next=pick(AFFIXES);for(let n=0;n<6&&next[1]===i.affixType;n++)next=pick(AFFIXES);i.affixType=next[1];i.affixValue=next[2];i.refines=(i.refines||0)+1;persistProfile();renderProfile();toast(`${i.name} refined: ${next[0]}`)}
function awakenGearV10(slot){const i=profile?.equipment?.[slot];if(!i)return toast('Equip an item first');if(i.trait)return toast('This item already has a hunt trait');if(!['rare','epic','legendary','relic','mythic'].includes(i.rarity))return toast('Rare+ equipment is required to Awaken');const costG=180+(i.ilvl||1)*8,costR=3+(i.rarity==='legendary'?2:0);if(profile.gold<costG||profile.materials.rare<costR)return toast(`Awaken needs ${costG}g and ${costR} rare`);profile.gold-=costG;profile.materials.rare-=costR;maybeAssignTraitV10(i,profile,true);persistProfile();renderProfile();notifyV11('loot','GEAR AWAKENED',`${i.name} — ${V10_ITEM_TRAITS[i.trait]?.name}`,{life:6000})}
function drawCampProgressionV10(){if(!profile)return;const lv=campLevelV10(profile),t=profile.trophies?.length||0;ctx.save();for(let i=0;i<Math.min(6,lv);i++){const x=(4+i*4)*TILE+16,y=3*TILE+12;ctx.fillStyle='rgba(255,165,77,.14)';ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffb453';ctx.fillRect(x-1,y-4,2,5)}if(t){ctx.font='bold 13px serif';ctx.fillStyle='#d5b870';for(let i=0;i<Math.min(7,t);i++)ctx.fillText(i%2?'⚔':'♜',17*TILE+7+(i%4)*13,6*TILE+22+Math.floor(i/4)*14)}ctx.restore()}
function spawnFrontierApexV10(run,occupied){const choices=[['wolf','Redjaw the Scarred','redjaw'],['thornling','Thornheart Ancient','thornheart']],[kind,name,apexId]=pick(choices),base=ENEMY[kind],pos=randomWalkable(run.map,occupied,9);if(!pos)return;const ps=Object.keys(run.players).length,scale=1+.45*(ps-1),hp=Math.round(base.hp*4.2*scale),atk=Math.round(base.atk*1.38),def=Math.round(base.def*1.45);run.enemies.push(makeEnemyParts({id:uid(),kind,name,apexId,x:pos.x,y:pos.y,elite:true,trait:'APEX MINI-BOSS',boss:false,maxHp:hp,hp,atk,def,xp:Math.round(base.xp*6),status:{poison:0,burn:0,bleed:0},intent:null}));occupied.add(K(pos.x,pos.y));run.log.push(`✦ APEX QUARRY — ${name} has entered the hunt.`)}
function applyFrontierEventV10(run,event,occupied){if(run.missionId!=='frontier'||!event)return;if(event.id==='apextrail')spawnFrontierApexV10(run,occupied);if(event.id==='woundedhunter'){Object.values(run.players).filter(p=>!p.dead).forEach(p=>{const h=Math.round(p.maxHp*.18);p.hp=Math.min(p.maxHp,p.hp+h);p.potions=Math.min(4,(p.potions||0)+1)});run.log.push('A wounded hunter shares emberleaf and a spare potion. The party recovers.')}}

const V09_RARITY_GR={common:0,uncommon:1,rare:2,epic:4,legendary:6,relic:8,mythic:12};
function itemProgressionRating(i){return i?Math.max(0,Math.round((i.ilvl||0)+(i.enhance||0)*2+(V09_RARITY_GR[i.rarity]||0))):0}
function gearRating(p){ensureArmoryShapeV132(p);const items=armoryOccupiedItemsV132(p),vals=items.map(itemProgressionRating);if(!vals.length)return 0;return Math.max(0,Math.round(vals.reduce((a,b)=>a+b,0)/Math.max(3,vals.length)))}
function missionUnlockState(p,mid){const m=MISSIONS[mid],gr=gearRating(p),missing=[];if((p?.level||0)<(m.minLevel||1))missing.push(`Lv ${m.minLevel}`);if(gr<(m.minGear||0))missing.push(`Gear ${m.minGear}`);if(m.requiredTrophy&&!p?.trophies?.includes(m.requiredTrophy))missing.push(`Defeat ${m.requiredTrophy}`);return{locked:missing.length>0,missing,gr}}
function zoneStageName(run){if(run?.isDelve&&run?.delve)return `${run.delve.name} — Floor ${run.depth||1}`;const a=V09_ZONE_STAGES[run?.missionId]||[];return a[Math.min(a.length-1,Math.max(0,(run?.depth||1)-1))]||`Depth ${run?.depth||1}`}
function zoneRosterNames(mid){return (MISSIONS[mid]?.enemies||[]).map(k=>ENEMY[k]?.name||k).join(' • ')}

function campaignRoadmapHTML(p){const ids=Object.keys(MISSIONS);return `<div class="legacygrid">${ids.map((mid,i)=>{const m=MISSIONS[mid],s=missionUnlockState(p,mid),clear=p.trophies?.includes(m.boss.name);return `<div class="legacycard"><b>${i+1}. ${m.name}</b><div class="zone-tags"><span class="zone-tag gear">GR ${m.minGear||0}+</span><span class="zone-tag">Lv ${m.minLevel||1}+</span>${clear?'<span class="zone-tag clear">CLEARED</span>':s.locked?'<span class="zone-tag boss">LOCKED</span>':'<span class="zone-tag clear">AVAILABLE</span>'}</div><div class="tiny">${clear?`Trophy secured: ${m.boss.name}`:s.locked?s.missing.join(' • '):`Hunt target: ${m.boss.name}`}</div></div>`}).join('')}</div>`}
function nextCampaignObjective(p){for(const[mid,m]of Object.entries(MISSIONS)){if(!p.trophies?.includes(m.boss.name)){const s=missionUnlockState(p,mid);return s.locked?`${m.name}: ${s.missing.join(' • ')}`:`Clear ${m.name} and defeat ${m.boss.name}`} }return 'All current campaign hunts cleared — refine your build for Grand Hunt scores.'}
function bossRewardColorV09(kind){return{direwolf:'#ff845d',bossgoblin:'#e6bd5d',mire:'#82d676',bossknight:'#ed9d68',bossdrake:'#a8e8f6',riftboss:'#c68dff',worldeater:'#ff596b'}[kind]||'#ffd16e'}

const V09_ENEMY_ABILITIES={emberboar:'Ember Charge — rushes 2–3 tiles',thornling:'Thorn Shot — range 3, Bleed',gutterling:'Cinder Bomb — range 4, Burn',bonearcher:'Bone Arrow — range 4, Bleed',gravehusk:'Grave Slam — adjacent splash',fenstalker:'Venom Spit — range 3, Poison',sporeling:'Spore Burst — adjacent Poison cloud',bogwitch:'Fen Hex / Restorative Mire',ashguard:'Shield Crush — resource pressure',cinderhound:'Cinder Pounce — 2–3 tile leap',banneret:'Rally — heals and hardens allies',icecrawler:'Frost Clamp — drains resource',frostseer:'Ice Lance — range 4, drains resource',crystalbeast:'Crystal Charge — armored rush',voidling:'Void Step — teleports into melee',chorister:'Discordant Hymn — range 4 resource drain',riftreaver:'Rift Cleave — heavy Bleed',mawspawn:'Hunger Bite — lifesteal',riftmauler:'Mawquake — adjacent splash',abyssseer:'Rift Lance — range 5, Burn'};
const V09_BOSS_KITS={direwolf:'Bite • Rending Maul • Pounce • Blood Howl',bossgoblin:'King Cleave • Gutter Bomb • Royal Rush • Reinforcements',mire:'Mire Claw • Spore Bloom • Mire Surge • Brood Reinforcements',bossknight:'Sword Cleave • Ashbound Judgment • Ashen Charge • Last Banner Reinforcements',bossdrake:'Frost Bite • Frost Breath • Tail Sweep • Glacial Dive',riftboss:'Void Lash • Nameless Chorus • Void Notes • Rift Reinforcements',worldeater:'Abyssal Claws • Rift Eruption • Abyssal Gaze • Worldbreak'};
function enemyAbilityTextV09(e){return e?.boss?V09_BOSS_KITS[e.kind]:(V09_ENEMY_ABILITIES[e?.kind]||'Standard attack')}


function currentMissionGearBase(type){const mid=(room?.run||snapshot?.run)?.missionId||'frontier',t=canonicalItemTypeV132(type),z=V09_ZONE_GEAR[mid];if(t==='weapon'&&z?.weapon?.length)return pick(z.weapon);if(t==='chest'&&z?.armor?.length)return pick(z.armor);if(t==='necklace'&&z?.charm?.length)return pick(z.charm);return zoneBaseNameV132(t,mid,profile?.classId)}
function campaignBossKind(kind){return ['bossgoblin','mire','bossknight','bossdrake','riftboss'].includes(kind)}

function moveEnemyTowardV09(run,e,t,steps=1){let moved=0;for(let n=0;n<steps;n++){const step=enemyPathStepV132(run,e,t);if(!step)break;e.x=step.x;e.y=step.y;moved++}return moved}
function enemySpecialHitV09(run,e,p,mult,label,opt={}){if(!p||p.dead||p.downed)return 0;if(chance(dodgeChance(p)*.8)){pushCombatFloaterPlayer(p,'EVADE','#9bd7ff',10,700);run.log.push(`${p.name} evades ${e.name}'s ${label}.`);return 0}let dmg=Math.max(1,Math.round(e.atk*mult)-Math.floor((p.def+(p.status.partyDef||0)+runDefBonus(p))*.58));if(p.guarding)dmg=Math.max(1,Math.round(dmg*ascentGuardV11(p,.48)));if(p.status?.closingGuard)dmg=Math.max(1,Math.round(dmg*.88));p.hp-=dmg;p.hitFlash=Date.now();pulseStageV13('hurt');e.attackFlash=Date.now();e.attackDx=Math.sign(p.x-e.x);e.attackDy=Math.sign(p.y-e.y);const q=combatPointPlayer(p);emitWorldFx('spark',q.x,q.y,opt.color||'#ef8b8b',7,390);pushCombatFloaterPlayer(p,`-${dmg}`,opt.color||'#ef8b8b',11,800);pushCombatFeed('bad',e.name,dmg,label);if(opt.poison)p.status.poison=Math.max(p.status.poison||0,opt.poison);if(opt.burn)p.status.burn=Math.max(p.status.burn||0,opt.burn);if(opt.bleed)p.status.bleed=Math.max(p.status.bleed||0,opt.bleed);if(opt.resDrain)p.res=Math.max(0,p.res-opt.resDrain);if(p.hp<=0)downPlayer(run,p);return dmg}
function resolveZoneEnemySpecialV09(run,e,t){if(e.boss)return false;e.specialCd=Math.max(0,(e.specialCd||0)-1);if(e.specialCd>0)return false;const dist=Math.abs(e.x-t.x)+Math.abs(e.y-t.y),allies=run.enemies.filter(o=>o!==e&&o.hp>0&&!o.boss);if(e.apexId==='redjaw'&&dist>=2&&dist<=4){e.specialCd=2;moveEnemyTowardV09(run,e,t,3);if(Math.abs(e.x-t.x)+Math.abs(e.y-t.y)<=1)enemySpecialHitV09(run,e,t,1.34,'SCARLET LUNGE',{bleed:2,color:'#ff735d'});run.log.push(`${e.name} erupts into a Scarlet Lunge.`);return true}if(e.apexId==='thornheart'&&dist<=3&&enemyHasLineOfSightV132(run,e,t)){e.specialCd=2;Object.values(run.players).filter(p=>!p.dead&&!p.downed&&Math.abs(p.x-e.x)+Math.abs(p.y-e.y)<=3).slice(0,3).forEach(p=>enemySpecialHitV09(run,e,p,.82,'BRIAR VOLLEY',{bleed:1,color:'#8bd06f'}));run.log.push(`${e.name} lashes the clearing with a Briar Volley.`);return true}
  if(e.kind==='emberboar'&&dist>=2&&dist<=3){e.specialCd=2;moveEnemyTowardV09(run,e,t,2);if(Math.abs(e.x-t.x)+Math.abs(e.y-t.y)<=1)enemySpecialHitV09(run,e,t,1.18,'EMBER CHARGE',{bleed:1,color:'#e69a5d'});run.log.push(`${e.name} lowers its tusks and charges.`);return true}
  if(e.kind==='thornling'&&dist<=3&&enemyHasLineOfSightV132(run,e,t)){e.specialCd=2;enemySpecialHitV09(run,e,t,.86,'THORN SHOT',{bleed:1,color:'#82c878'});return true}
  if(e.kind==='gutterling'&&dist<=4&&enemyHasLineOfSightV132(run,e,t)){e.specialCd=3;enemySpecialHitV09(run,e,t,.9,'CINDER BOMB',{burn:1,color:'#ff9c52'});return true}
  if(e.kind==='bonearcher'&&dist<=4&&enemyHasLineOfSightV132(run,e,t)){e.specialCd=2;enemySpecialHitV09(run,e,t,.96,'BONE ARROW',{bleed:1,color:'#d8ccb1'});return true}
  if(e.kind==='gravehusk'&&dist<=1){e.specialCd=3;Object.values(run.players).filter(p=>!p.dead&&!p.downed&&Math.abs(p.x-e.x)+Math.abs(p.y-e.y)<=1).forEach(p=>enemySpecialHitV09(run,e,p,.82,'GRAVE SLAM',{color:'#b5ad9d'}));shakeScreen(2,90);return true}
  if(e.kind==='fenstalker'&&dist<=3&&enemyHasLineOfSightV132(run,e,t)){e.specialCd=2;enemySpecialHitV09(run,e,t,.88,'VENOM SPIT',{poison:2,color:'#72d782'});return true}
  if(e.kind==='sporeling'&&dist<=1){e.specialCd=2;Object.values(run.players).filter(p=>!p.dead&&!p.downed&&Math.abs(p.x-e.x)+Math.abs(p.y-e.y)<=1).forEach(p=>enemySpecialHitV09(run,e,p,.68,'SPORE BURST',{poison:1,color:'#99cf76'}));return true}
  if(e.kind==='bogwitch'&&dist<=4&&enemyHasLineOfSightV132(run,e,t)){e.specialCd=3;const wounded=allies.filter(a=>a.hp<a.maxHp*.65).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(wounded){const h=Math.max(5,Math.round(wounded.maxHp*.14));wounded.hp=Math.min(wounded.maxHp,wounded.hp+h);pushCombatFloaterEntity(wounded,`+${h}`,'#8fdfa0',9,700);run.log.push(`${e.name} restores ${wounded.name}.`)}else enemySpecialHitV09(run,e,t,.7,'FEN HEX',{resDrain:2,color:'#9bce72'});return true}
  if(e.kind==='ashguard'&&dist<=1){e.specialCd=2;enemySpecialHitV09(run,e,t,1.02,'SHIELD CRUSH',{resDrain:1,color:'#d4b47a'});return true}
  if(e.kind==='cinderhound'&&dist>=2&&dist<=3){e.specialCd=2;moveEnemyTowardV09(run,e,t,2);if(Math.abs(e.x-t.x)+Math.abs(e.y-t.y)<=1)enemySpecialHitV09(run,e,t,1.12,'CINDER POUNCE',{bleed:1,burn:1,color:'#f07a54'});return true}
  if(e.kind==='banneret'){const wounded=allies.filter(a=>Math.abs(a.x-e.x)+Math.abs(a.y-e.y)<=3&&a.hp<a.maxHp*.82).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(wounded){e.specialCd=3;const h=Math.max(6,Math.round(wounded.maxHp*.12));wounded.hp=Math.min(wounded.maxHp,wounded.hp+h);wounded.def+=1;pushCombatFloaterEntity(wounded,'RALLIED','#e3c36e',9,700);run.log.push(`${e.name} rallies ${wounded.name}.`);return true}}
  if(e.kind==='icecrawler'&&dist<=1){e.specialCd=2;enemySpecialHitV09(run,e,t,.96,'FROST CLAMP',{resDrain:2,color:'#9cddeb'});return true}
  if(e.kind==='frostseer'&&dist<=4&&enemyHasLineOfSightV132(run,e,t)){e.specialCd=2;enemySpecialHitV09(run,e,t,.92,'ICE LANCE',{resDrain:2,color:'#a7e6f1'});return true}
  if(e.kind==='crystalbeast'&&dist>=2&&dist<=3){e.specialCd=3;moveEnemyTowardV09(run,e,t,2);if(Math.abs(e.x-t.x)+Math.abs(e.y-t.y)<=1)enemySpecialHitV09(run,e,t,1.24,'CRYSTAL CHARGE',{resDrain:1,color:'#b8ebf5'});shakeScreen(2,90);return true}
  if(e.kind==='voidling'&&dist>=2&&dist<=4){e.specialCd=3;const spots=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:t.x+dx,y:t.y+dy})).filter(q=>isWalk(run.map,q.x,q.y)&&!run.enemies.some(o=>o!==e&&o.hp>0&&enemyOccupiesTile(o,q.x,q.y))&&!Object.values(run.players).some(p=>!p.dead&&p.x===q.x&&p.y===q.y));if(spots.length){const q=pick(spots);e.x=q.x;e.y=q.y;enemySpecialHitV09(run,e,t,.82,'VOID STEP',{resDrain:1,color:'#b27cff'});run.log.push(`${e.name} tears through the Rift beside ${t.name}.`);return true}}
  if(e.kind==='chorister'&&dist<=4&&enemyHasLineOfSightV132(run,e,t)){e.specialCd=2;enemySpecialHitV09(run,e,t,.78,'DISCORDANT HYMN',{resDrain:3,color:'#c48cff'});return true}
  if(e.kind==='riftreaver'&&dist<=1){e.specialCd=2;enemySpecialHitV09(run,e,t,1.28,'RIFT CLEAVE',{bleed:2,color:'#c079d5'});return true}
  if(e.kind==='mawspawn'&&dist<=1){e.specialCd=2;const d=enemySpecialHitV09(run,e,t,1.02,'HUNGER BITE',{bleed:1,color:'#e26b73'});if(d){const h=Math.max(1,Math.round(d*.35));e.hp=Math.min(e.maxHp,e.hp+h);pushCombatFloaterEntity(e,`+${h}`,'#d97c8c',9,650)}return true}
  if(e.kind==='riftmauler'&&dist<=1){e.specialCd=3;Object.values(run.players).filter(p=>!p.dead&&!p.downed&&Math.abs(p.x-e.x)+Math.abs(p.y-e.y)<=1).forEach(p=>enemySpecialHitV09(run,e,p,.94,'MAWQUAKE',{resDrain:1,color:'#e06b83'}));shakeScreen(3,120);return true}
  if(e.kind==='abyssseer'&&dist<=5&&enemyHasLineOfSightV132(run,e,t)){e.specialCd=2;enemySpecialHitV09(run,e,t,1.0,'RIFT LANCE',{burn:1,resDrain:2,color:'#df76c8'});return true}
  return false
}
function spawnBossAddsV09(run,e,kind,count){const base=ENEMY[kind];if(!base)return;const occ=new Set(run.enemies.filter(o=>o.hp>0).map(o=>K(o.x,o.y)));Object.values(run.players).filter(p=>!p.dead).forEach(p=>occ.add(K(p.x,p.y)));for(let i=0;i<count;i++){const pos=randomWalkable(run.map,occ,5);if(!pos)break;const hp=Math.round(base.hp*(1.1+.25*((e.partySize||1)-1))),atk=Math.round(base.atk*(1+.08*((e.partySize||1)-1)));run.enemies.push(makeEnemyParts({id:uid(),kind,name:base.name,x:pos.x,y:pos.y,elite:true,trait:'BOSS REINFORCEMENT',boss:false,maxHp:hp,hp,atk,def:base.def,xp:Math.round(base.xp*.8),status:{poison:0,burn:0,bleed:0},intent:null}));occ.add(K(pos.x,pos.y))}}
function onCampaignBossPhaseV09(run,e,phase){if(!campaignBossKind(e.kind))return;setBossAnim(e,'enrage',900);const q=combatPointEntity(e);emitWorldFx('spark',q.x,q.y,{bossgoblin:'#e0b351',mire:'#80d073',bossknight:'#ef9a60',bossdrake:'#a9e7f5',riftboss:'#c489ff'}[e.kind]||'#ff965c',32,850);const adds={bossgoblin:['gutterling','gravehusk'],mire:['sporeling','bogwitch'],bossknight:['cinderhound','banneret'],bossdrake:['icecrawler','frostseer'],riftboss:['voidling','riftreaver']}[e.kind];if(adds&&!e.noAdds)spawnBossAddsV09(run,e,adds[phase===2?0:1],Math.min(3,1+Math.floor((e.partySize||1)/2)));}
function bossIntentCellsV09(run,e,cells,intent,label,anim='special'){e.intent=intent;e.intentCells=cells.filter(c=>c.x>=0&&c.y>=0&&c.x<W&&c.y<H);e.intentLabel=label;run.bossTelegraph=`${e.name}: ${label} — move out of the marked tiles or Guard!`;setBossAnim(e,anim,900);run.log.push(`⚠ ${run.bossTelegraph}`)}
function bossDamageCellsV09(run,e,mult,label,opt={}){const keys=new Set((e.intentCells||[]).map(c=>K(c.x,c.y)));const victims=Object.values(run.players).filter(p=>!p.dead&&!p.downed&&keys.has(K(p.x,p.y)));setBossAnim(e,'attack',650);if(!victims.length)run.log.push(`${e.name}'s ${label} misses every hunter.`);victims.forEach(p=>enemySpecialHitV09(run,e,p,mult,label,opt));e.intentCells=[];e.intentLabel=null;run.bossTelegraph=null}
function lineCellsTowardV09(e,t,len=4){const dx=Math.sign(t.x-e.x),dy=Math.sign(t.y-e.y),useX=Math.abs(t.x-e.x)>=Math.abs(t.y-e.y),cells=[];for(let i=1;i<=len;i++)cells.push({x:e.x+(useX?dx*i:0),y:e.y+(useX?0:dy*i)});return cells}
function squareCellsV09(cx,cy,r=1){const a=[];for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)a.push({x,y});return a}
function crossCellsV09(cx,cy,r=2){const a=[{x:cx,y:cy}];for(let i=1;i<=r;i++)a.push({x:cx+i,y:cy},{x:cx-i,y:cy},{x:cx,y:cy+i},{x:cx,y:cy-i});return a}
function ringCellsV09(e,minR,maxR){const a=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=distancePointToEnemy(x,y,e);if(d>=minR&&d<=maxR)a.push({x,y})}return a}
function initCampaignBossCdV09(e){e.v09cd=e.v09cd||{a:1,b:2,c:0};return e.v09cd}
function tickCampaignBossCdV09(e){const c=initCampaignBossCdV09(e);Object.keys(c).forEach(k=>c[k]=Math.max(0,c[k]-1));return c}
function resolveCampaignBossActionV09(run,e,targets,t){const cd=tickCampaignBossCdV09(e);if(e.intent){const intent=e.intent;e.intent=null;if(intent==='gutter_bomb')bossDamageCellsV09(run,e,1.05,'GUTTER BOMB',{burn:1,color:'#f0ad56'});else if(intent==='royal_rush'){bossDamageCellsV09(run,e,1.18,'ROYAL RUSH',{bleed:1,color:'#e4bd66'});bossMoveTowardTarget(run,e,t,2)}else if(intent==='spore_bloom')bossDamageCellsV09(run,e,.94,'SPORE BLOOM',{poison:2,color:'#8fd477'});else if(intent==='mire_surge')bossDamageCellsV09(run,e,1.02,'MIRE SURGE',{poison:1,color:'#72ca77'});else if(intent==='judgment')bossDamageCellsV09(run,e,1.18,'ASHBOUND JUDGMENT',{burn:1,color:'#ef9a62'});else if(intent==='ash_charge'){bossDamageCellsV09(run,e,1.2,'ASHEN CHARGE',{bleed:1,color:'#e8a766'});bossMoveTowardTarget(run,e,t,2)}else if(intent==='frost_breath')bossDamageCellsV09(run,e,1.05,'FROST BREATH',{resDrain:3,color:'#a8e5f4'});else if(intent==='glacial_dive'){bossDamageCellsV09(run,e,1.22,'GLACIAL DIVE',{resDrain:2,color:'#b9edf5'});placeBossNearTile(run,e,t.x,t.y)}else if(intent==='chorus')bossDamageCellsV09(run,e,1.03,'NAMELESS CHORUS',{resDrain:3,color:'#c68cff'});else if(intent==='void_notes')bossDamageCellsV09(run,e,1.13,'VOID NOTES',{burn:1,resDrain:2,color:'#c37ee8'});return true}
  const dist=distanceToEnemy(t,e),phase=e.bossPhase||1;
  if(e.kind==='bossgoblin'){if(cd.a<=0&&dist<=5&&dist>=2&&chance(.38)){cd.a=3;bossIntentCellsV09(run,e,squareCellsV09(t.x,t.y,1),'gutter_bomb','GUTTER BOMB');return true}if(cd.b<=0&&dist>=2&&dist<=4&&chance(.3)){cd.b=3;bossIntentCellsV09(run,e,lineCellsTowardV09(e,t,4),'royal_rush','ROYAL RUSH');return true}}
  if(e.kind==='mire'){if(cd.a<=0&&chance(.38)){cd.a=3;bossIntentCellsV09(run,e,ringCellsV09(e,1,2),'spore_bloom','SPORE BLOOM');return true}if(cd.b<=0&&dist<=4&&chance(.32)){cd.b=3;bossIntentCellsV09(run,e,squareCellsV09(t.x,t.y,1),'mire_surge','MIRE SURGE');return true}}
  if(e.kind==='bossknight'){if(cd.a<=0&&dist<=5&&chance(.38)){cd.a=3;bossIntentCellsV09(run,e,crossCellsV09(t.x,t.y,2),'judgment','ASHBOUND JUDGMENT');return true}if(cd.b<=0&&dist>=2&&dist<=4&&chance(.3)){cd.b=3;bossIntentCellsV09(run,e,lineCellsTowardV09(e,t,4),'ash_charge','ASHEN CHARGE');return true}}
  if(e.kind==='bossdrake'){if(cd.a<=0&&dist<=5&&chance(.4)){cd.a=3;bossIntentCellsV09(run,e,lineCellsTowardV09(e,t,5),'frost_breath','FROSTMAW BREATH');return true}if(cd.b<=0&&dist>=2&&dist<=5&&chance(.3)){cd.b=4;bossIntentCellsV09(run,e,squareCellsV09(t.x,t.y,1),'glacial_dive','GLACIAL DIVE');return true}if(dist<=2&&cd.c<=0&&chance(.32)){cd.c=3;setBossAnim(e,'attack',620);Object.values(run.players).filter(p=>!p.dead&&!p.downed&&distanceToEnemy(p,e)<=2).forEach(p=>enemySpecialHitV09(run,e,p,.86,'TAIL SWEEP',{resDrain:1,color:'#a9e7f5'}));return true}}
  if(e.kind==='riftboss'){if(cd.a<=0&&chance(.38)){cd.a=3;bossIntentCellsV09(run,e,ringCellsV09(e,2,3),'chorus','NAMELESS CHORUS');return true}if(cd.b<=0&&chance(.34)){cd.b=3;const cells=[];targets.slice(0,Math.min(targets.length,3)).forEach(p=>cells.push(...squareCellsV09(p.x,p.y,0)));bossIntentCellsV09(run,e,cells,'void_notes','VOID NOTES');return true}}
  if(dist<=1){setBossAnim(e,'attack',560);enemyAttack(run,e,t);return true}
  const moved=bossMoveTowardTarget(run,e,t,dist>5?2:1);if(moved){setBossAnim(e,'move',470);run.log.push(`${e.name} advances into striking range.`)}return true
}
function spawnZoneLieutenantV09(run,mission,occupied){if(run.bossStage||run.depth!==Math.ceil(mission.depths/2))return;const spec=V09_LIEUTENANTS[run.missionId];if(!spec)return;const[kind,name]=spec,base=ENEMY[kind],pos=randomWalkable(run.map,occupied,9);if(!base||!pos)return;const ps=Object.keys(run.players).length,scale=mission.diff*(1+.25*(run.depth-1));const hp=Math.round(base.hp*scale*(2.6+.55*(ps-1))),atk=Math.round(base.atk*scale*1.16),def=Math.round(base.def*1.35);run.enemies.push(makeEnemyParts({id:uid(),kind,name,x:pos.x,y:pos.y,elite:true,trait:'ZONE LIEUTENANT',boss:false,maxHp:hp,hp,atk,def,xp:Math.round(base.xp*4),status:{poison:0,burn:0,bleed:0},intent:null}));occupied.add(K(pos.x,pos.y));run.log.push(`⚔ ZONE LIEUTENANT — ${name} controls this stage.`)}
function generateBossSetDropV09(p,e){const setId=V09_BOSS_SET_BY_KIND[e.kind],s=MONSTER_SETS[setId];if(!s)return null;const type=randomDropTypeV132(),run=room?.run||snapshot?.run,mid=run?.missionId||'frontier',tier={frontier:5,hollow:10,gloam:15,keep:20,frost:25,rift:30,worldeater:35}[mid]||5,ilvl=Math.max(6,Math.round(tier+p.level*.30+(run?.difficulty==='nightmare'?2:run?.difficulty==='veteran'?1:0))),legendary=chance(run?.difficulty==='nightmare'?.12:run?.difficulty==='veteran'?.07:.035),mult=legendary?2.15:1.78,i={id:uid(),type,ilvl,rarity:legendary?'legendary':'epic',name:`${s.name} ${slotDisplayTypeV132({type})}`,atk:0,def:0,hp:0,affixType:null,affixValue:0,enhance:legendary?1:0,setId,setName:s.name,value:ilvl*18};fillItemStatsV132(i,mult);maybeAssignTraitV10(i,p,true);return i}
function drawZoneAtmosphereV09(run){if(!run||run.missionId==='frontier')return;const sec=performance.now()/1000,mid=run.missionId,colors={hollow:[100,105,125],gloam:[80,135,92],keep:[132,95,76],frost:[126,190,215],rift:[151,83,205],worldeater:[161,52,72]},c=colors[mid]||[120,120,130];ctx.save();ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},.045)`;ctx.fillRect(0,0,canvas.width,canvas.height);const count=mid==='rift'||mid==='worldeater'?24:16;for(let i=0;i<count;i++){const x=(tileSeed(i+5,i*11,mid.length*29)%canvas.width+sec*(mid==='frost'?8:14))%canvas.width,y=(tileSeed(i+17,i*7,mid.length*41)%canvas.height+Math.sin(sec+i)*8)%canvas.height;ctx.fillStyle=`rgba(${c[0]+40>255?255:c[0]+40},${c[1]+40>255?255:c[1]+40},${c[2]+40>255?255:c[2]+40},${mid==='rift'?'.14':'.08'})`;ctx.fillRect(Math.round(x),Math.round(y),mid==='frost'?2:1,mid==='frost'?2:2)}if(mid==='hollow'){ctx.fillStyle='rgba(170,180,190,.045)';for(let i=0;i<3;i++)ctx.fillRect(0,80+i*160+Math.sin(sec+i)*12,canvas.width,28)}if(mid==='rift'){ctx.strokeStyle='rgba(187,103,245,.09)';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(180+i*180,160+Math.sin(sec+i)*35,42+Math.sin(sec*2+i)*9,0,Math.PI*2);ctx.stroke()}}ctx.restore()}
function drawZoneDecorV09(run){if(!run||run.missionId==='frontier')return;const mid=run.missionId;ctx.save();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(!isWalk(run.map,x,y))continue;const h=tileSeed(x,y,mid.length*71+run.depth*13);if(h%19!==0)continue;const px=x*TILE,py=y*TILE;if(mid==='hollow'){ctx.fillStyle='#c8bfa5';ctx.fillRect(px+11,py+22,9,2);ctx.fillRect(px+14,py+19,2,7);ctx.fillStyle='rgba(255,166,82,.4)';ctx.fillRect(px+22,py+15,2,5)}else if(mid==='gloam'){ctx.fillStyle='#6f8b57';ctx.fillRect(px+14,py+18,2,8);ctx.fillStyle=h%2?'#9b6d87':'#bd9768';ctx.fillRect(px+10,py+16,6,4);ctx.fillRect(px+18,py+19,5,3)}else if(mid==='keep'){ctx.fillStyle='#6b6259';ctx.fillRect(px+7,py+22,9,4);ctx.fillRect(px+18,py+17,7,7);if(h%3===0){ctx.fillStyle='#8a3e3f';ctx.fillRect(px+15,py+8,2,14);ctx.fillRect(px+17,py+9,8,6)}}else if(mid==='frost'){ctx.fillStyle='rgba(184,230,242,.62)';ctx.beginPath();ctx.moveTo(px+10,py+26);ctx.lineTo(px+15,py+10);ctx.lineTo(px+19,py+26);ctx.fill();ctx.fillStyle='rgba(221,249,255,.7)';ctx.fillRect(px+14,py+14,2,8)}else if(mid==='rift'){ctx.strokeStyle='rgba(185,95,232,.55)';ctx.beginPath();ctx.moveTo(px+7,py+25);ctx.lineTo(px+14,py+17);ctx.lineTo(px+12,py+10);ctx.lineTo(px+23,py+6);ctx.stroke();ctx.fillStyle='rgba(195,103,250,.35)';ctx.fillRect(px+13,py+16,3,3)}else if(mid==='worldeater'){ctx.strokeStyle='rgba(211,65,79,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+5,py+25);ctx.lineTo(px+13,py+18);ctx.lineTo(px+10,py+9);ctx.moveTo(px+13,py+18);ctx.lineTo(px+25,py+12);ctx.stroke();ctx.lineWidth=1}}ctx.restore()}
function drawZoneMonsterSpriteV09(e,now=performance.now()){const k=e.kind;if(!['emberboar','thornling','gutterling','bonearcher','gravehusk','fenstalker','sporeling','bogwitch','ashguard','cinderhound','banneret','icecrawler','frostseer','crystalbeast','voidling','chorister','riftreaver','mawspawn','riftmauler','abyssseer'].includes(k))return false;const x=e.x*TILE,y=e.y*TILE,bob=Math.round(Math.sin(now/350+e.x)*.7),xx=x,yy=y+bob;ctx.save();ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+16,y+27,11,3,0,0,Math.PI*2);ctx.fill();const c=ENEMY[k].color;
  if(['emberboar','cinderhound','fenstalker'].includes(k)){ctx.fillStyle=c;ctx.fillRect(xx+6,yy+15,19,9);ctx.fillRect(xx+20,yy+10,8,9);ctx.fillStyle=k==='fenstalker'?'#9fe79f':'#f2bd72';ctx.fillRect(xx+24,yy+13,2,2);ctx.fillStyle=c;ctx.fillRect(xx+8,yy+22,4,6);ctx.fillRect(xx+20,yy+22,4,6);if(k==='emberboar'){ctx.fillStyle='#e1d1a6';ctx.fillRect(xx+27,yy+16,4,2);ctx.fillRect(xx+27,yy+19,4,2)}if(k==='cinderhound'){ctx.fillStyle='#ef6e4c';ctx.fillRect(xx+8,yy+12,3,2);ctx.fillRect(xx+13,yy+10,3,2)}}
  else if(['thornling','sporeling','voidling'].includes(k)){ctx.fillStyle=c;ctx.beginPath();ctx.arc(xx+16,yy+17,8,0,Math.PI*2);ctx.fill();for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.strokeStyle=c;ctx.beginPath();ctx.moveTo(xx+16+Math.cos(a)*5,yy+17+Math.sin(a)*5);ctx.lineTo(xx+16+Math.cos(a)*13,yy+17+Math.sin(a)*13);ctx.stroke()}ctx.fillStyle=k==='voidling'?'#d09cff':'#cbe07e';ctx.fillRect(xx+13,yy+15,2,2);ctx.fillRect(xx+18,yy+15,2,2)}
  else if(['gutterling','bogwitch','frostseer','chorister','abyssseer'].includes(k)){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(xx+16,yy+5);ctx.lineTo(xx+8,yy+15);ctx.lineTo(xx+10,yy+28);ctx.lineTo(xx+23,yy+28);ctx.lineTo(xx+24,yy+15);ctx.closePath();ctx.fill();ctx.fillStyle='#1a1d24';ctx.fillRect(xx+12,yy+10,9,7);const glow=k==='frostseer'?'#c5f4ff':k==='chorister'?'#d5a1ff':k==='abyssseer'?'#f08bd0':k==='bogwitch'?'#a7e17c':'#f0bd62';ctx.fillStyle=glow;ctx.fillRect(xx+14,yy+12,2,2);ctx.fillRect(xx+18,yy+12,2,2);ctx.fillStyle=glow;ctx.beginPath();ctx.arc(xx+26,yy+17,3,0,Math.PI*2);ctx.fill()}
  else if(['bonearcher'].includes(k)){ctx.strokeStyle='#c9c1a8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xx+16,yy+8);ctx.lineTo(xx+16,yy+26);ctx.moveTo(xx+10,yy+15);ctx.lineTo(xx+22,yy+15);ctx.stroke();ctx.strokeStyle='#8d6b45';ctx.beginPath();ctx.arc(xx+24,yy+17,7,-1.4,1.4);ctx.stroke();ctx.lineWidth=1;ctx.fillStyle='#d2c7aa';ctx.fillRect(xx+12,yy+5,8,7)}
  else if(['gravehusk','ashguard','banneret','crystalbeast','riftreaver','riftmauler'].includes(k)){ctx.fillStyle=c;ctx.fillRect(xx+8,yy+11,17,15);ctx.fillRect(xx+11,yy+6,11,7);ctx.fillStyle='rgba(230,230,230,.22)';ctx.fillRect(xx+10,yy+13,13,3);ctx.fillStyle=c;ctx.fillRect(xx+7,yy+24,7,5);ctx.fillRect(xx+19,yy+24,7,5);if(k==='banneret'){ctx.fillStyle='#9a4c48';ctx.fillRect(xx+25,yy+5,2,20);ctx.fillRect(xx+27,yy+6,6,7)}if(k==='crystalbeast'){ctx.fillStyle='#c9f4ff';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(xx+10+i*6,yy+12);ctx.lineTo(xx+13+i*6,yy+3);ctx.lineTo(xx+16+i*6,yy+13);ctx.fill()}}if(k==='riftmauler'){ctx.fillStyle='#d56e8a';ctx.fillRect(xx+13,yy+15,7,5)}}
  else if(k==='icecrawler'){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(xx+16,yy+18,10,7,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#bdebf5';for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(xx+9+i*3,yy+14);ctx.lineTo(xx+7+i*4,yy+6);ctx.stroke()}}
  else if(k==='mawspawn'){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(xx+16,yy+18,11,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1f171b';ctx.fillRect(xx+15,yy+13,11,8);ctx.fillStyle='#e6d3b1';for(let i=0;i<3;i++)ctx.fillRect(xx+17+i*3,yy+13,1,3);ctx.fillStyle='#d55268';ctx.fillRect(xx+10,yy+17,4,4)}
  if(e.elite){ctx.strokeStyle=e.trait==='ZONE LIEUTENANT'?'#f0c768':'#b87ef0';ctx.lineWidth=2;ctx.strokeRect(x+2,y+2,28,28);ctx.lineWidth=1}if(e.id===selectedTargetId){ctx.strokeStyle='#7fe3ef';ctx.strokeRect(x+1,y+1,30,30)}ctx.fillStyle='#151922';ctx.fillRect(x+4,y+1,24,4);ctx.fillStyle=e.elite?'#c16ce4':'#d85d68';ctx.fillRect(x+4,y+1,24*clamp(e.hp/e.maxHp,0,1),4);ctx.restore();return true}

const AFFIXES=[
  ['of Precision','crit',.04],['of the Fox','dodge',.04],['of Hunger','leech',.05],
  ['of Might','atk',3],['of Warding','def',2],['of Vigor','hp',12]
];
const BASES={
  weapon:['Iron Longsword','Hunter Spear','Ashen Axe','Moonsteel Saber','Rift Knife'],
  armor:['Chain Cuirass','Hunter Mantle','Ash Plate','Runic Vestment','Riftmail'],
  charm:['Copper Sigil','Wolf Fang','Old Oathstone','Ember Talisman','Rift Shard']
};

const ARMORY_SLOT_ORDER_V132=['head','shoulders','chest','gloves','boots','weapon','offhand','ring1','ring2','necklace'];
const ARMORY_LEFT_V132=['head','shoulders','chest','gloves','boots'];
const ARMORY_RIGHT_V132=['weapon','offhand','ring1','ring2','necklace'];
const ARMORY_SLOT_LABEL_V132={head:'Head',shoulders:'Shoulders',chest:'Chest',gloves:'Gloves',boots:'Boots',weapon:'Weapon',offhand:'Shield / Offhand',ring1:'Ring I',ring2:'Ring II',necklace:'Necklace'};
const ARMORY_SLOT_GLYPH_V132={head:'♜',shoulders:'◆',chest:'▣',gloves:'✦',boots:'⌁',weapon:'⚔',offhand:'◈',ring1:'○',ring2:'○',necklace:'◇'};
const V132_DROP_TYPES=['weapon','weapon','chest','chest','head','shoulders','gloves','gloves','boots','boots','offhand','ring','ring','ring','necklace'];
const V132_SLOT_BASES={
 head:['Iron Visor','Hunter Hood','Runed Helm','Ashen Cowl','Warden Crown'],
 shoulders:['Iron Pauldrons','Hunter Mantle','Ash Spaulders','Runed Shoulders','Boneguard Mantle'],
 chest:['Chain Cuirass','Hunter Leathers','Ash Plate','Runic Vestment','Riftmail'],
 gloves:['Iron Grips','Hunter Gloves','Ash Gauntlets','Runed Wraps','Riftweave Gloves'],
 boots:['Trail Boots','Iron Sabatons','Ashwalkers','Runed Greaves','Riftstep Boots'],
 weapon:BASES.weapon,
 offhand:['Bulwark Shield','Hunter Quiver','Arcane Focus','War Totem','Reliquary','Offhand Blade'],
 ring:['Iron Band','Hunter Signet','Ash Ring','Runed Loop','Rift Band'],
 necklace:['Copper Sigil','Wolf Fang Necklace','Old Oathstone','Ember Talisman','Rift Pendant']
};
const V132_CLASS_OFFHAND={warden:['Tower Shield','Oath Shield'],berserker:['War Totem','Trophy Fetish'],ranger:['Hunter Quiver','Tracker Quiver'],arcanist:['Arcane Focus','Spell Tome'],templar:['Reliquary Shield','Sun Reliquary'],shadow:['Offhand Blade','Poison Vial']};
const V132_ZONE_PREFIX={frontier:'Emberwood',hollow:'Ossuary',gloam:'Gloamfen',keep:'Ashbound',frost:'Frostvein',rift:'Rift',worldeater:'World-Eater',crafted:'Huntsmith'};

function canonicalItemTypeV132(type){return type==='armor'?'chest':type==='charm'?'necklace':type}
function normalizeItemV132(i,slot=null){
  if(!i)return i;
  i.type=canonicalItemTypeV132(i.type||slot||'chest');
  if(slot&&ARMORY_SLOT_ORDER_V132.includes(slot))i.equipSlot=slot;
  if(i.type==='ring1'||i.type==='ring2'){i.equipSlot=i.type;i.type='ring'}
  if(i.type==='armor'){i.type='chest'}if(i.type==='charm'){i.type='necklace'}
  return i
}
function ensureArmoryShapeV132(p){
  if(!p)return;
  const old=p.equipment||{};p.inventory=p.inventory||[];
  const eq={};ARMORY_SLOT_ORDER_V132.forEach(s=>eq[s]=null);
  if(old.weapon)eq.weapon=normalizeItemV132(old.weapon,'weapon');
  if(old.chest||old.armor)eq.chest=normalizeItemV132(old.chest||old.armor,'chest');
  if(old.necklace||old.charm)eq.necklace=normalizeItemV132(old.necklace||old.charm,'necklace');
  for(const s of ARMORY_SLOT_ORDER_V132)if(old[s]&&!eq[s])eq[s]=normalizeItemV132(old[s],s);
  const equippedIds=new Set(Object.values(eq).filter(Boolean).map(i=>i.id));
  [['armor','chest'],['charm','necklace']].forEach(([legacy,canonical])=>{const displaced=old[legacy];if(displaced&&displaced!==old[canonical]&&displaced.id&&!equippedIds.has(displaced.id)&&!p.inventory.some(i=>i?.id===displaced.id)){normalizeItemV132(displaced);displaced.equipSlot=null;p.inventory.push(displaced)}});
  Object.entries(old).forEach(([k,v])=>{if(!ARMORY_SLOT_ORDER_V132.includes(k)&&k!=='armor'&&k!=='charm')eq[k]=v});
  // Keep legacy keys null so older rendering/service code cannot accidentally duplicate the migrated items.
  eq.armor=null;eq.charm=null;
  p.equipment=eq;
  (p.inventory||[]).forEach(i=>normalizeItemV132(i));
  Object.values(p.loadouts||{}).forEach(l=>{
    if(!l)return;
    if(l.armor&&!l.chest){l.chest=l.armor;delete l.armor}
    if(l.charm&&!l.necklace){l.necklace=l.charm;delete l.charm}
  })
}
function itemCompatibleSlotsV132(i){
  if(!i)return[];const t=canonicalItemTypeV132(i.type);
  if(t==='ring')return['ring1','ring2'];if(ARMORY_SLOT_ORDER_V132.includes(t))return[t];return[]
}
function resolveEquipSlotV132(i,p=profile,preferred=null){
  const slots=itemCompatibleSlotsV132(i);if(!slots.length)return null;
  if(preferred&&slots.includes(preferred))return preferred;
  if(slots.length===1)return slots[0];
  const empty=slots.find(s=>!p?.equipment?.[s]);if(empty)return empty;
  return slots.sort((a,b)=>gearScore(p.equipment?.[a])-gearScore(p.equipment?.[b]))[0]
}
function comparisonItemForV132(p,i){const s=resolveEquipSlotV132(i,p);return s?p?.equipment?.[s]:null}
function slotFamilyV132(slot){return slot==='ring1'||slot==='ring2'?'ring':slot}
function offhandBaseV132(classId){return pick(V132_CLASS_OFFHAND[classId]||V132_SLOT_BASES.offhand)}
function baseForItemTypeV132(type,classId=profile?.classId||'warden'){
  type=canonicalItemTypeV132(type);if(type==='offhand')return offhandBaseV132(classId);return pick(V132_SLOT_BASES[type]||V132_SLOT_BASES.chest)
}
function zoneBaseNameV132(type,mid,classId){return `${V132_ZONE_PREFIX[mid]||'Hunt'} ${baseForItemTypeV132(type,classId)}`}
function fillItemStatsV132(i,mult=1){
  const t=canonicalItemTypeV132(i.type),L=i.ilvl||1;
  i.atk=0;i.def=0;i.hp=0;
  if(t==='weapon')i.atk=Math.max(2,Math.round((3+L*.9)*mult));
  else if(t==='chest'){i.def=Math.max(1,Math.round((2+L*.48)*mult));i.hp=Math.round((4+L*1.3)*mult)}
  else if(t==='head'){i.def=Math.max(1,Math.round((1+L*.26)*mult));i.hp=Math.round((2+L*.58)*mult)}
  else if(t==='shoulders'){i.def=Math.max(1,Math.round((1+L*.31)*mult));i.hp=Math.round((3+L*.66)*mult)}
  else if(t==='gloves'){i.atk=Math.max(1,Math.round((1+L*.27)*mult));i.def=Math.max(0,Math.round(L*.12*mult))}
  else if(t==='boots'){i.def=Math.max(0,Math.round((1+L*.16)*mult));i.hp=Math.round((2+L*.38)*mult)}
  else if(t==='offhand'){i.atk=Math.max(0,Math.round((1+L*.23)*mult));i.def=Math.max(1,Math.round((1+L*.28)*mult));i.hp=Math.round((2+L*.28)*mult)}
  else if(t==='ring'){i.atk=Math.max(0,Math.round((1+L*.17)*mult));i.def=Math.max(0,Math.round(L*.1*mult));i.hp=Math.round((1+L*.2)*mult)}
  else if(t==='necklace'){i.atk=Math.max(0,Math.round((1+L*.21)*mult));i.def=Math.max(0,Math.round((1+L*.15)*mult));i.hp=Math.round((2+L*.34)*mult)}
  return i
}
function randomDropTypeV132(){return pick(V132_DROP_TYPES)}
function armoryOccupiedItemsV132(p){return ARMORY_SLOT_ORDER_V132.map(s=>p?.equipment?.[s]).filter(Boolean)}
function slotDisplayTypeV132(i){const t=canonicalItemTypeV132(i?.type);return t==='ring'?'Ring':ARMORY_SLOT_LABEL_V132[t]||t||'Gear'}
function itemEffectTagsHTMLV132(i){
  if(!i)return'';const tags=[];
  if(i.trait&&V10_ITEM_TRAITS[i.trait])tags.push(`<span class="effect-pill-v132 effect-hover-v132" data-effect-kind="trait" data-effect-id="${i.trait}">✦ ${V10_ITEM_TRAITS[i.trait].name}</span>`);
  if(i.setName)tags.push(`<span class="effect-pill-v132 set effect-hover-v132" data-effect-kind="set" data-effect-id="${i.setId||''}">${i.setName}</span>`);
  if((i.rarity==='relic'||i.rarity==='mythic')&&i.relicPowerName)tags.push(`<span class="effect-pill-v132 ${i.rarity} effect-hover-v132" data-effect-kind="relic" data-effect-name="${String(i.relicPowerName).replaceAll('"','&quot;')}" data-effect-desc="${String(i.relicPowerDesc||'').replaceAll('"','&quot;')}">${i.rarity==='mythic'?'✦✦':'✦'} ${i.relicPowerName}</span>`);
  return tags.length?`<div class="item-effect-row-v132">${tags.join('')}</div>`:''
}

const CAMP_OBJECTS=[{id:'board',name:'Hunt Board',x:12,y:6,type:'board'},{id:'smith',name:'Huntsmith Orik',x:5,y:7,type:'smith'},{id:'crafter',name:'Relic Crafter Nessa',x:25,y:6,type:'crafter'},{id:'healer',name:'Healer Amara',x:25,y:14,type:'healer'},{id:'bonfire',name:'Ember Bonfire',x:15,y:10,type:'bonfire'},{id:'dummy1',name:'Training Dummy',x:5,y:15,type:'dummy'},{id:'dummy2',name:'Armored Dummy',x:7,y:15,type:'dummy'},{id:'stash',name:'Hunter Stash',x:10,y:3,type:'stash'},{id:'war',name:'War Table',x:20,y:3,type:'war'},{id:'trophy',name:'Trophy Wall',x:20,y:7,type:'trophy'},{id:'wager',name:'Cinder’s Wager',x:18,y:15,type:'wager'},{id:'worldgate',name:'North Gate — Emberwood Lowlands',x:15,y:2,type:'worldgate'}];

/* ===== v0.14.0 OPEN WORLD FOUNDATION ===== */
const V14_WORLD_REGIONS={
  emberwood:{id:'emberwood',name:'Emberwood Lowlands',level:'Lv 1–8',desc:'The safer frontier beyond Emberwatch. Roads are forgiving; deeper woods hold elites, resources, and dungeon entrances.'}
};
function ensureWorldProfileV14(p){if(!p)return;p.worldV14=p.worldV14||{discoveredRegions:['emberwood'],contracts:{wolves:0,resources:0,elites:0},contractsClaimed:{},waypoints:['emberwatch'],enteredLowlands:false,surfaceClears:0};if(p.worldV14.enteredLowlands==null)p.worldV14.enteredLowlands=false;if(p.worldV14.surfaceClears==null)p.worldV14.surfaceClears=0;return p.worldV14}
function worldMapV14(seed=17){
  const m=Array.from({length:H},()=>Array(W).fill('grass'));
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(x===0||y===0||x===W-1||y===H-1)m[y][x]='tree'}
  // Main east-west frontier road and the Emberwatch approach.
  for(let x=1;x<W-1;x++)for(let y=8;y<=10;y++)m[y][x]='path';
  for(let y=1;y<=10;y++)for(let x=2;x<=4;x++)m[y][x]='path';
  // North-south hunter trail and eastern Delve trail.
  for(let y=2;y<H-2;y++)for(let x=14;x<=16;x++)m[y][x]='path';
  for(let x=16;x<=27;x++)m[6][x]='path';
  for(let y=6;y<=9;y++)m[y][27]='path';
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    if(m[y][x]==='path')continue;const h=tileSeed(x,y,seed);if(h%14===0)m[y][x]='tree';else if(h%41===0)m[y][x]='rock';
  }
  [[2,9],[8,5],[12,14],[21,5],[25,13],[27,9],[15,3]].forEach(([cx,cy])=>{for(let yy=cy-1;yy<=cy+1;yy++)for(let xx=cx-1;xx<=cx+1;xx++)if(xx>0&&yy>0&&xx<W-1&&yy<H-1&&m[yy][xx]!=='path')m[yy][xx]='grass'});
  return m
}
function buildWorldStateV14(region='emberwood'){
  const encounters=[
    {id:'wolfpack1',x:8,y:5,name:'Road Wolf Pack',kind:'wolf',count:2,elite:false,done:false,respawnAt:0},
    {id:'boars1',x:12,y:14,name:'Emberback Sounder',kind:'emberboar',count:3,elite:false,done:false,respawnAt:0},
    {id:'wolfpack2',x:21,y:5,name:'Briar Wolf Pack',kind:'wolf',count:3,elite:false,done:false,respawnAt:0},
    {id:'elite1',x:25,y:13,name:'Redjaw Scout',kind:'wolf',count:2,elite:true,done:false,respawnAt:0}
  ];
  const resources=[{id:'herb1',x:6,y:13,name:'Emberleaf Patch',kind:'herb',done:false},{id:'ore1',x:19,y:14,name:'Frontier Ore',kind:'ore',done:false},{id:'cache1',x:23,y:3,name:'Abandoned Hunter Cache',kind:'cache',done:false}];
  const entrances=[{id:'embercellar',x:27,y:9,name:'Emberroot Cellar',delveId:'embercellar'}];
  return{active:true,region,map:worldMapV14(17),encounters,resources,entrances,startedAt:Date.now()}
}
function refreshWorldStateV14(w=worldStateV14()){
  if(!w)return;const now=Date.now();(w.encounters||[]).forEach(e=>{if(e.done&&e.respawnAt&&now>=e.respawnAt){e.done=false;e.respawnAt=0}})
}
function worldEncounterAvailableV14(e){return !!e&&(!e.done||((e.respawnAt||0)>0&&Date.now()>=(e.respawnAt||0)))}
function worldStateV14(){return (room||snapshot)?.worldV14||null}
const EMBERWATCH_RETURN_SPAWNS_V142=WORLD_CONTRACTS.EMBERWATCH_RETURN_SPAWNS;
let returnToCampPendingV142=false;
function stagePartyAtBonfireV142(){
  if(!room)return;WORLD_CONTRACTS.stagePartyAtBonfire(room.players)
}
function resetToEmberwatchV142(){if(!room)return;WORLD_CONTRACTS.resetRoomToEmberwatch(room);selectedTargetId=null;selectedPartId=null;clearHeldMovement()}
function returnPartyToEmberwatchV142(reason='Returned to the Emberwatch bonfire.',opts={}){
  if(!isHost||!room||room.run)return false;resetToEmberwatchV142();hide('lobbyOverlay');if(opts.broadcast!==false)broadcastSnapshot();if(opts.render!==false){renderLobby();renderAll()}if(opts.notice!==false){flowBannerV13('EMBERWATCH',reason,'route','BONFIRE RETURN');notifyV11('info','EMBERWATCH BONFIRE',reason)}return true
}
function returnToCampFromSummaryV142(){
  if(!room&&!snapshot){hide('summaryOverlay');return}
  if(isHost){hide('summaryOverlay');returnPartyToEmberwatchV142(lastSummary?.wiped?'The hunt ended in defeat. You awaken beside the bonfire.':'The party returned safely from the hunt.');return}
  returnToCampPendingV142=true;send({type:'returnToCampV142',peerId});toast('Returning the party to Emberwatch…')
}
function enterWorldV14(requestPid=peerId){
  if(!room&&!snapshot)return toast('Create or join a room first');
  if(!isHost)return send({type:'enterWorldV14',peerId});
  const requester=room.players?.[requestPid],gate=CAMP_OBJECTS.find(o=>o.type==='worldgate');
  if(!requester||room.run||room.worldV14)return;
  if(!WORLD_CONTRACTS.isWithinManhattan(requester.campX??14,requester.campY??15,gate,1))return send({type:'worldNoticeV141',peerId:requestPid,kind:'warn',title:'NORTH GATE',detail:'Walk closer to the gate before entering Emberwood.'});
  room.worldV14=buildWorldStateV14('emberwood');const wp=ensureWorldProfileV14(profile);wp.enteredLowlands=true;persistProfile();WORLD_CONTRACTS.stagePartyInEmberwood(room.players);broadcastSnapshot();renderAll();flowBannerV13('EMBERWOOD LOWLANDS','Surface threats are easier than Deep Hunts. Farm, gather, complete contracts, or enter a Delve.','route','REGION DISCOVERED');notifyV11('quest','EMBERWOOD LOWLANDS','Surface exploration unlocked. Farm, quest, discover Delves, or return to Emberwatch.',{life:6500})
}
function leaveWorldV14(requestPid=peerId){if(!isHost)return send({type:'leaveWorldV14',peerId});if(!room?.worldV14||room.run)return;const p=room.players?.[requestPid],gate=WORLD_CONTRACTS.EMBERWATCH_SURFACE_GATE;if(!p||!WORLD_CONTRACTS.isWithinManhattan(p.worldX??5,p.worldY??9,gate,1))return send({type:'worldNoticeV141',peerId:requestPid,kind:'warn',title:'EMBERWATCH GATE',detail:'Walk closer to the gate before returning to camp.'});returnPartyToEmberwatchV142('The party passed through the North Gate and regrouped at the bonfire.')}
function worldOccupiedV14(x,y,pid){return Object.values((room||snapshot)?.players||{}).some(p=>p.peerId!==pid&&p.worldX===x&&p.worldY===y)}
function hostWorldMoveV14(pid,dx,dy){if(!isHost||room?.run||!room?.worldV14||Math.abs(dx)+Math.abs(dy)!==1)return;refreshWorldStateV14(room.worldV14);const p=room.players?.[pid];if(!p)return;const facing=rangerFacingFromDelta(dx,dy,p.facing||'south'),nx=(p.worldX??5)+dx,ny=(p.worldY??9)+dy;if(!isWalk(room.worldV14.map,nx,ny)||worldOccupiedV14(nx,ny,pid)){p.facing=facing;broadcastSnapshot();return}p.facing=facing;p.worldX=nx;p.worldY=ny;broadcastSnapshot()}
function moveWorldV14(dx,dy){if((room||snapshot)?.run||!worldStateV14())return;if(isHost)hostWorldMoveV14(peerId,dx,dy);else send({type:'worldMoveV14',peerId,dx,dy})}
function worldObjectsV141(w=worldStateV14()){if(!w)return[];return[...(w.encounters||[]).filter(worldEncounterAvailableV14).map(x=>({...x,objType:'encounter'})),...(w.resources||[]).filter(x=>!x.done).map(x=>({...x,objType:'resource'})),...(w.entrances||[]).map(x=>({...x,objType:'entrance'})),{id:'campgate',x:2,y:9,name:'Emberwatch Gate',objType:'gate'}]}
function worldObjectByIdV141(id,w=worldStateV14()){return worldObjectsV141(w).find(o=>o.id===id)||null}
function nearestWorldObjectV14(){const w=worldStateV14(),p=(room||snapshot)?.players?.[peerId];if(!w||!p)return null;return worldObjectsV141(w).map(o=>({...o,d:Math.abs(o.x-(p.worldX??5))+Math.abs(o.y-(p.worldY??9))})).filter(o=>o.d<=1).sort((a,b)=>a.d-b.d)[0]||null}
function surfaceEnemySpawnCellsV142(map,enc,count,occupied,reserved){
  const out=[];for(let radius=0;radius<Math.max(W,H)&&out.length<count;radius++)for(let y=Math.max(1,enc.y-radius);y<=Math.min(H-2,enc.y+radius)&&out.length<count;y++)for(let x=Math.max(1,enc.x-radius);x<=Math.min(W-2,enc.x+radius)&&out.length<count;x++){if(Math.abs(x-enc.x)+Math.abs(y-enc.y)!==radius||!isWalk(map,x,y)||occupied.has(K(x,y))||reserved.has(K(x,y)))continue;out.push({x,y});occupied.add(K(x,y))}return out
}
function generateSurfaceSkirmishV142(run,mission){
  const w=room?.worldV14,enc=run?.worldEncounter;if(!w||!enc)return false;
  run.map=structuredCloneSafe(w.map);run.stageWeather='clear';run.mapProps=[];run.lootables=[];run.raidHazards=[];run.zoneStageName=enc.name;run.enemies=[];run.votes={};run.cleared=false;run.bossTelegraph=null;run.bossStage=false;run.bossIntroRound=0;run.stageEvent=null;run.surfaceCombatV142=true;
  const occupied=new Set();Object.values(run.players).forEach(p=>{const wp=room.players?.[p.peerId];p.x=wp?.worldX??5;p.y=wp?.worldY??9;if(!isWalk(run.map,p.x,p.y)){p.x=5;p.y=9}occupied.add(K(p.x,p.y))});
  const reserved=new Set(worldObjectsV141(w).filter(o=>o.id!==enc.id).map(o=>K(o.x,o.y))),partySize=Object.keys(run.players).length,diff=DIFFICULTIES[run.difficulty||'normal'],mod=run.modifier||MODIFIERS[0],base=ENEMY[enc.kind],count=enc.count||3,spots=surfaceEnemySpawnCellsV142(run.map,enc,count,occupied,reserved);if(!base||!spots.length)return false;
  spots.forEach((pos,i)=>{const elite=(enc.elite&&i===0),trait=elite?'Frenzied':null,scale=mission.diff*diff.enemy*mod.enemy*1.12;let hp=Math.round(base.hp*scale*1.20*(1+.62*(partySize-1))*(elite?1.82:1)),atk=Math.round(base.atk*scale*1.12*(1+.11*(partySize-1))*(elite?1.18:1)),def=Math.round(base.def*scale*1.06*(elite?1.28:1));if(trait==='Frenzied')atk=Math.round(atk*1.10);run.enemies.push(makeEnemyParts({id:uid(),kind:enc.kind,name:elite?`Frenzied ${base.name}`:base.name,x:pos.x,y:pos.y,elite,trait,boss:false,maxHp:hp,hp,atk,def,xp:Math.round(base.xp*scale*diff.reward*mod.reward*.55*({1:1,2:.80,3:.65,4:.55}[partySize]||.55)),status:{poison:0,burn:0,bleed:0},intent:null,alerted:true}))});
  run.phase='player';run.round=run.round||1;Object.values(run.players).forEach(p=>{p.submitted=false;p.pending=null;p.guarding=false;p.quickUsed=false;p.status.partyDef=0;p.status.closingGuard=0});run.log.push(`SURFACE CONTACT — ${enc.name}. Combat begins exactly where the party found the threat.`);return true
}
function launchWorldSkirmishV14(enc,requestPid=peerId,autoAttack=false){
  if(!isHost||!room||!enc)return;const mission=MISSIONS.frontier,modifier=structuredCloneSafe(MODIFIERS[0]);room.run={runId:uid(),runSchemaVersion:1,missionId:'frontier',isWorldSkirmish:true,worldEncounter:structuredCloneSafe(enc),difficulty:'normal',modifier,dailyBoost:1,depth:1,round:1,totalRounds:0,phase:'player',map:[],enemies:[],players:{},votes:{},log:[],cleared:false,startedAt:Date.now(),currentPath:null,pathChoices:null,stageEvent:null,deathCaches:[],huntHeat:1,campaignVersion:'v0.14.0'};Object.values(room.players).forEach(p=>room.run.players[p.peerId]=createRunPlayer(p));if(!generateSurfaceSkirmishV142(room.run,mission)){room.run=null;return send({type:'worldNoticeV141',peerId:requestPid,kind:'warn',title:'SURFACE CONTACT LOST',detail:'The threat slipped into the brush. Try approaching again.'})}const attacker=room.run.players[requestPid],target=attacker&&room.run.enemies.slice().sort((a,b)=>distanceToEnemy(attacker,a)-distanceToEnemy(attacker,b))[0];if(requestPid===peerId&&target){selectedTargetId=target.id;selectedPartId=target.parts?.find(p=>partTargetable(target,p))?.id||null}if(autoAttack&&attacker&&target){hostCommand({type:'command',peerId:requestPid,action:{type:'attack',targetId:target.id,targetPartId:target.parts?.find(p=>partTargetable(target,p))?.id||null}})}else broadcastSnapshot();renderAll()
}
const PROFILE_RECEIPT_LIMIT_V145=96;
function profileReceiptSeenV145(key,id){return !!id&&Array.isArray(profile?.[key])&&profile[key].includes(id)}
function rememberProfileReceiptV145(key,id){if(!profile||!id)return;profile[key]=Array.isArray(profile[key])?profile[key]:[];if(!profile[key].includes(id))profile[key].push(id);if(profile[key].length>PROFILE_RECEIPT_LIMIT_V145)profile[key].splice(0,profile[key].length-PROFILE_RECEIPT_LIMIT_V145)}
function worldResourceRewardV141(obj,pid=peerId){const receiptId=`world:${room?.worldV14?.startedAt||0}:${obj.id}:${pid}`;if(obj.kind==='herb')return{receiptId,kind:'herb',gold:20,common:2,rare:0,title:'EMBERLEAF GATHERED',detail:'+2 common materials • +20 gold'};if(obj.kind==='ore')return{receiptId,kind:'ore',gold:0,common:4,rare:1,title:'FRONTIER ORE',detail:'+4 common • +1 rare material'};return{receiptId,kind:'cache',gold:90,common:2,rare:0,title:'HUNTER CACHE',detail:'+90 gold • +2 common materials'}}
function applyWorldResourceRewardV141(reward){if(!profile||!reward||profileReceiptSeenV145('worldRewardReceiptsV145',reward.receiptId))return false;const profileBeforeReward=structuredCloneSafe(profile);ensureWorldProfileV14(profile);profile.worldV14.contracts.resources++;profile.gold+=(reward.gold||0);profile.materials.common+=(reward.common||0);profile.materials.rare+=(reward.rare||0);rememberProfileReceiptV145('worldRewardReceiptsV145',reward.receiptId);checkWorldContractsV14();if(!persistProfile()){profile=profileBeforeReward;renderAll();return false}notifyV11('loot',reward.title,reward.detail);renderAll();return true}
function applyWorldDelveDiscoveryV141(delveId){if(!profile)return;const d=delveByIdV132(delveId);if(!d)return;profile.discoveredDelvesV132=profile.discoveredDelvesV132||[];if(profile.discoveredDelvesV132.includes(d.id))return;profile.discoveredDelvesV132.push(d.id);persistProfile();notifyV11('quest','DELVE DISCOVERED',`${d.name} added to your Hunt Board.`)}
function deliverWorldRewardV141(pid,reward){if(pid===peerId)return applyWorldResourceRewardV141(reward);send({type:'worldRewardV141',peerId:pid,reward});return true}
function hostWorldInteractV141(pid,objectId,autoAttack=false){
  if(!isHost||!room?.worldV14||room.run)return;refreshWorldStateV14(room.worldV14);const p=room.players?.[pid],o=worldObjectByIdV141(objectId,room.worldV14);if(!p||!o)return;
  if(Math.abs(o.x-(p.worldX??5))+Math.abs(o.y-(p.worldY??9))>1)return send({type:'worldNoticeV141',peerId:pid,kind:'warn',title:'OUT OF RANGE',detail:`Walk closer to ${o.name}.`});
  if(o.objType==='gate')return leaveWorldV14(pid);
  if(o.objType==='resource'){const real=room.worldV14.resources.find(x=>x.id===o.id);if(!real||real.done)return;const reward=worldResourceRewardV141(real,pid);if(!deliverWorldRewardV141(pid,reward))return;real.done=true;broadcastSnapshot();return}
  if(o.objType==='encounter')return launchWorldSkirmishV14(o,pid,autoAttack);
  if(o.objType==='entrance'){
    const d=delveByIdV132(o.delveId);if(!d)return send({type:'worldNoticeV141',peerId:pid,kind:'warn',title:'SEALED ENTRANCE',detail:'Dungeon data is unavailable.'});
    if(pid===peerId)applyWorldDelveDiscoveryV141(d.id);else send({type:'worldDelveDiscoveredV141',peerId:pid,delveId:d.id});
    room.delveId=d.id;room.missionId=d.source;room.worldSelectionV141={kind:'delve',delveId:d.id,selectedBy:pid};Object.values(room.players).forEach(q=>q.ready=false);
    if(Object.values(room.players).filter(q=>q.connected!==false).length===1){room.players[pid].ready=true;launchExpedition()}else{broadcastSnapshot();renderLobby();show('lobbyOverlay');toast(`${d.name} selected — party must ready up.`)}
  }
}
function interactWorldV14(o=nearestWorldObjectV14(),opts={}){if(!o)return toast('Nothing nearby');if(isHost)return hostWorldInteractV141(peerId,o.id,!!opts.autoAttack);send({type:'worldInteractV141',peerId,objectId:o.id,autoAttack:!!opts.autoAttack})}
const V14_WORLD_CONTRACTS=[{id:'wolves',name:'Thin the Packs',need:6,rewardGold:180,rewardCommon:4,desc:'Defeat 6 surface wolves.'},{id:'resources',name:'Frontier Provisioning',need:3,rewardGold:120,rewardCommon:6,desc:'Gather 3 overworld resources.'},{id:'elites',name:'Prove the Road',need:1,rewardGold:260,rewardRare:2,desc:'Defeat 1 surface elite.'}];
function checkWorldContractsV14(){if(!profile)return;const w=ensureWorldProfileV14(profile);V14_WORLD_CONTRACTS.forEach(c=>{if(w.contractsClaimed[c.id]||(w.contracts[c.id]||0)<c.need)return;w.contractsClaimed[c.id]=true;profile.gold+=c.rewardGold||0;profile.materials.common+=c.rewardCommon||0;profile.materials.rare+=c.rewardRare||0;notifyV11('quest','CONTRACT COMPLETE',`${c.name} • +${c.rewardGold||0} gold${c.rewardCommon?` • +${c.rewardCommon} common`:''}${c.rewardRare?` • +${c.rewardRare} rare`:''}`,{life:6500})})}
function worldContractsHTMLV14(){if(!profile)return'';const w=ensureWorldProfileV14(profile);return V14_WORLD_CONTRACTS.map(c=>`<div class="legacycard"><b>${w.contractsClaimed[c.id]?'✓ ':''}${c.name}</b><div class="tiny">${c.desc}</div><div>${Math.min(c.need,w.contracts[c.id]||0)}/${c.need}</div></div>`).join('')}
function drawWorldV14(){
  const w=worldStateV14();if(!w)return;refreshWorldStateV14(w);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)drawTile(w.map[y][x],x,y);
  drawAmbientMapFx({missionId:'frontier',map:w.map});
  ctx.save();ctx.strokeStyle='rgba(30,24,16,.22)';ctx.lineWidth=1;for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(w.map[y][x]==='path'){
    const px=x*TILE,py=y*TILE;if(w.map[y-1][x]!=='path'){ctx.beginPath();ctx.moveTo(px,py+.5);ctx.lineTo(px+TILE,py+.5);ctx.stroke()}if(w.map[y+1][x]!=='path'){ctx.beginPath();ctx.moveTo(px,py+TILE-.5);ctx.lineTo(px+TILE,py+TILE-.5);ctx.stroke()}if(w.map[y][x-1]!=='path'){ctx.beginPath();ctx.moveTo(px+.5,py);ctx.lineTo(px+.5,py+TILE);ctx.stroke()}if(w.map[y][x+1]!=='path'){ctx.beginPath();ctx.moveTo(px+TILE-.5,py);ctx.lineTo(px+TILE-.5,py+TILE);ctx.stroke()}
  }ctx.restore();
  drawZoneAtmosphereV09({missionId:'frontier',depth:1});
  ctx.save();ctx.fillStyle='rgba(24,52,30,.075)';ctx.fillRect(0,0,canvas.width,canvas.height);
  // Emberwatch return gate.
  ctx.fillStyle='#352a20';ctx.fillRect(1*TILE,8*TILE,5*TILE,3);ctx.fillRect(1*TILE,10*TILE,5*TILE,3);ctx.fillStyle='#6b5338';ctx.fillRect(1*TILE+8,8*TILE-4,5,3*TILE+8);ctx.fillRect(4*TILE+18,8*TILE-4,5,3*TILE+8);ctx.strokeStyle='#9f7a4c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(1*TILE+10,8*TILE+2);ctx.lineTo(4*TILE+21,8*TILE+2);ctx.stroke();ctx.lineWidth=1;ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillStyle='#e7ca88';ctx.fillText('EMBERWATCH',3*TILE,8*TILE-7);
  w.resources.filter(x=>!x.done).forEach(o=>{const x=o.x*TILE+16,y=o.y*TILE+16;if(o.kind==='ore'){ctx.fillStyle='#6f8d98';ctx.beginPath();ctx.moveTo(x-8,y+7);ctx.lineTo(x-2,y-8);ctx.lineTo(x+4,y-1);ctx.lineTo(x+9,y+8);ctx.fill();ctx.fillStyle='#b5dae4';ctx.fillRect(x-2,y-5,2,7)}else if(o.kind==='cache'){ctx.fillStyle='#7c5734';ctx.fillRect(x-9,y-6,18,12);ctx.fillStyle='#bf9658';ctx.fillRect(x-9,y-2,18,3);ctx.fillRect(x-1,y-4,3,7)}else{ctx.fillStyle='#4e7e49';for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(x+(i-2)*3,y+(i%2)*3,4,8,(i-2)*.25,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#c46c46';ctx.fillRect(x-1,y-2,3,3)}ctx.font='bold 7px monospace';ctx.fillStyle='#e8eadb';ctx.fillText(o.kind==='cache'?'HUNTER CACHE':o.kind==='ore'?'FRONTIER ORE':'EMBERLEAF',x,y-12)});
  w.entrances.forEach(o=>{const x=o.x*TILE+16,y=o.y*TILE+16;ctx.fillStyle='#161219';ctx.beginPath();ctx.ellipse(x,y+3,14,11,0,Math.PI,Math.PI*2);ctx.fill();ctx.strokeStyle='#836c58';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y+3,14,Math.PI,Math.PI*2);ctx.stroke();ctx.lineWidth=1;ctx.fillStyle='rgba(164,100,55,.28)';ctx.fillRect(x-8,y+2,16,10);ctx.font='bold 8px monospace';ctx.fillStyle='#e8c476';ctx.fillText('EMBERROOT CELLAR',x,y-14)});
  w.encounters.filter(worldEncounterAvailableV14).forEach(o=>{const pseudo={id:`surface_${o.id}`,kind:o.kind,x:o.x,y:o.y,elite:o.elite,hp:1,maxHp:1,status:{poison:0,burn:0,bleed:0},trait:o.elite?'SURFACE ELITE':null};drawRegularMonsterPolished(pseudo);ctx.font='bold 7px monospace';ctx.fillStyle=o.elite?'#ffbf86':'#e5e0d6';ctx.fillText(o.name,o.x*TILE+16,o.y*TILE-4)});
  Object.values((room||snapshot)?.players||{}).forEach(p=>{const faux={...p,campX:p.worldX??5,campY:p.worldY??9};drawCampPlayer(faux)});
  const near=nearestWorldObjectV14();if(near){const x=near.x*TILE+16,y=near.y*TILE+16,r=15+Math.sin(performance.now()/180)*2;ctx.strokeStyle='rgba(116,211,160,.8)';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.font='bold 8px monospace';ctx.fillStyle='#d5f4dd';ctx.fillText('E',x,y+3)}
  ctx.textAlign='left';ctx.restore()
}

const RELIC_EPITHETS=['of the Last Watch','of Emberfall','of the Hollow Moon','of the Red Hunt','of Broken Crowns','of the First Flame','of Silent Thunder','of the Black Bell','of Ash and Oath','of Starless Roads','of the Ninth Gate','of the Pale Dawn','of Kings Unburied','of the Endless Hunt','of Wolfsong','of the Drowned Sun','of Iron Memory','of the Rift Beyond','of the Final Stand','of Cinderborn'];
const CLASS_RELIC_BASES={
warden:[['Aegis of Emberwatch','armor'],['Lastwall Greatshield','charm'],['Oathkeeper Blade','weapon'],['Bastion Plate','armor'],['Sentinel Brand','weapon'],['Liongate Sigil','charm'],['Iron Saint Cuirass','armor'],['Watchfire Sword','weapon'],['Bulwark Talisman','charm'],['Crownward Mail','armor']],
berserker:[['Redmaw Greataxe','weapon'],['Bloodwake Cleaver','weapon'],['Ragebound Harness','armor'],['Skullfire Charm','charm'],['Reaver Fang','weapon'],['Warborn Hide','armor'],['Devourer Chain','charm'],['Stormblood Axe','weapon'],['Last Roar Plate','armor'],['Goremarch Totem','charm']],
ranger:[['Blackfeather Longbow','weapon'],['Longwatch Mantle','armor'],['Predator Sigil','charm'],['Ashwood Recurve','weapon'],['Ghostpine Leathers','armor'],['Hawkeye Token','charm'],['Wolfsong Bow','weapon'],['Farstrider Coat','armor'],['Serpent Quiver','charm'],['Last Arrow','weapon']],
arcanist:[['Sunshard Staff','weapon'],['Bellfire Grimoire','charm'],['Starweaver Robe','armor'],['Emberglass Rod','weapon'],['Rift Scholar Vestment','armor'],['Pyreheart Orb','charm'],['Comet Scepter','weapon'],['Voidthread Mantle','armor'],['Deep Well Focus','charm'],['Ashen Constellation','weapon']],
templar:[['Dawnward Mace','weapon'],['Saintfall Plate','armor'],['Mercy Sigil','charm'],['Oathlight Hammer','weapon'],['Pilgrim Aegis','armor'],['Second Sun Reliquary','charm'],['Judgment Brand','weapon'],['Golden Vigil','armor'],['Martyr Stone','charm'],['Radiant Oath','weapon']],
shadow:[['Nightglass Daggers','weapon'],['Shadeweave Coat','armor'],['Executioner Coin','charm'],['Whisperfang Blades','weapon'],['Moonless Leathers','armor'],['Phantom Mark','charm'],['Kingslayer Knives','weapon'],['Blackstep Mantle','armor'],['Hemlock Token','charm'],['Final Silence','weapon']]};
const RELIC_POWERS={
warden:[['greater_bastion','Greater Bastion','Fortress grants +1 additional party DEF.'],['oathstrike','Oathstrike','Shield Slam deals 20% more damage.'],['hearthguard','Hearthguard','Gain 10% maximum HP in expeditions.'],['guardian_range','Guardian Reach','Basic attack range becomes 2 tiles.']],
berserker:[['redstorm','Red Storm','Cleave deals 20% more damage.'],['ragechain','Rage Unending','Blood Frenzy gains 3 charges instead of 2.'],['devourer','Devourer','Gain 8% additional lifesteal.'],['deathless','Deathless','Gain 8% maximum HP.']],
ranger:[['longwatch','Longwatch','Basic attack and Twin Shot range increase by 1 tile.'],['savior','Guardian Arrow','Deal 25% more damage to enemies adjacent to an ally.'],['serpent_king','Serpent King','Twin Shot poison lasts 3 rounds.'],['falcon','Falcon Eye','Gain 8% additional critical chance.']],
arcanist:[['sunlance','Sunlance','Ember Lance deals 20% more damage.'],['cometfall','Cometfall','Starfall deals 18% more damage.'],['everburn','Everburn','Burn effects last 1 additional round.'],['manaheart','Manaheart','Gain +4 maximum Mana.']],
templar:[['saint_hand','Sainted Hand','Radiant Hand heals 20% more.'],['martyr_light','Martyr Light','Radiant Hand revives at 50% HP.'],['judgment','Judgment','Smite deals 20% more damage.'],['holy_vigor','Holy Vigor','Gain 10% maximum HP.']],
shadow:[['phantom_step','Phantom Step','Backstab range increases to 2 tiles.'],['execution','Execution','Backstab deals 30% more damage to enemies below 35% HP.'],['knife_storm','Knife Storm','Fan of Knives deals 20% more damage.'],['night_eye','Night Eye','Gain 8% additional critical chance.']]};
const MERCHANT_UNIQUES={
warden:[['Gatekeeper’s Due','weapon','guardian_range'],['The Last Toll','armor','greater_bastion'],['Bronze Oath of Veyla','charm','hearthguard'],['Roadwarden','weapon','oathstrike']],
berserker:[['Red Ledger','weapon','ragechain'],['Gilded Devourer','charm','devourer'],['Caravan Breaker','weapon','redstorm'],['Debt of Blood','armor','deathless']],
ranger:[['Sable Horizon','weapon','longwatch'],['Veyla’s Rescue','charm','savior'],['Serpent Road','weapon','serpent_king'],['Far-Eye Mantle','armor','falcon']],
arcanist:[['Atlas of Broken Roads','charm','manaheart'],['Sun on the Long Road','weapon','sunlance'],['Caravan Comet','weapon','cometfall'],['Ever-Burning Map','armor','everburn']],
templar:[['Pilgrim’s Due','charm','saint_hand'],['Mercy at Mile Nine','armor','martyr_light'],['Golden Judgment','weapon','judgment'],['Wayfarer’s Halo','armor','holy_vigor']],
shadow:[['Black Ledger Knives','weapon','execution'],['No-Footprint Boots','armor','phantom_step'],['The Quiet Toll','charm','night_eye'],['Veyla’s Last Argument','weapon','knife_storm']]
};
const CINDER_SUITS=[['Ember','🔥'],['Fang','◆'],['Crown','♛'],['Shade','☾']];
const MERCHANT_MOODS=['laughing about a profitable war','complaining about mountain tolls','offering tea from a silver kettle','arguing with a raven perched on the wagon','counting coins with alarming speed'];
const TOTAL_RELIC_VARIANTS=Object.values(CLASS_RELIC_BASES).reduce((n,a)=>n+a.length*RELIC_EPITHETS.length*4,0);

const SPECIALIZATIONS={
  warden:[['guardian','Guardian','+5% DEF; Fortress gains another +1 party DEF.'],['vanguard','Vanguard','+6% damage.'],['commander','Commander','+8% max HP and stronger party protection.']],
  berserker:[['reaver','Reaver','Cleave +10% damage.'],['bloodbound','Bloodbound','+6% lifesteal.'],['juggernaut','Juggernaut','+10% max HP.']],
  ranger:[['marksman','Marksman','+1 attack/Twin Shot range.'],['beaststalker','Beaststalker','+10% damage to Elite/Boss targets.'],['trapper','Trapper','+7% dodge.']],
  arcanist:[['pyromancer','Pyromancer','Burn damage +50%.'],['spellbreaker','Spellbreaker','+7% direct spell damage.'],['starcaller','Starcaller','Starfall +12% damage.']],
  templar:[['dawnbringer','Dawnbringer','Smite +12% damage.'],['lifebinder','Lifebinder','Healing +18%.'],['aegis','Aegis Knight','+10% max HP.']],
  shadow:[['assassin','Assassin','Backstab +12% damage.'],['hemomancer','Hemomancer','Bleed lasts +1 round.'],['ghost','Ghost','+9% dodge.']]
};
const RUN_BOONS=[
  {id:'keen_edge',name:'Keen Edge',desc:'+8% all damage.',damage:1.08},{id:'quickblood',name:'Quickblood',desc:'+6% critical chance.',crit:.06},
  {id:'ironhide',name:'Ironhide',desc:'+2 defense for this expedition.',def:2},{id:'field_medic',name:'Field Medic',desc:'+18% healing.',heal:1.18},
  {id:'leeching',name:'Leeching Sigil',desc:'+5% lifesteal.',leech:.05},{id:'deep_focus',name:'Deep Focus',desc:'Basic attacks restore +1 extra class resource.',resource:1},
  {id:'scavenger',name:'Scavenger’s Luck',desc:'+15% gold and material recovery.',loot:1.15}
];
const PATH_CHOICES=[
  {id:'armory',name:'Abandoned Armory',desc:'More gear. Enemy armor is reinforced.',enemy:1.08,elite:.02,loot:.16,reward:1.12,boon:'keen_edge'},
  {id:'sanctum',name:'Forgotten Sanctum',desc:'Party heals 25% before descending.',enemy:1,elite:0,loot:.02,reward:1.05,boon:'field_medic',heal:.25},
  {id:'bloodtrail',name:'Blood Trail',desc:'More champions and danger. Better score and parts.',enemy:1.12,elite:.13,loot:.08,reward:1.22,boon:'quickblood'},
  {id:'smuggler',name:'Smuggler’s Passage',desc:'Fewer monsters, higher treasure odds.',enemy:.98,elite:-.03,loot:.22,reward:1.08,boon:'scavenger'},
  {id:'deepforge',name:'Deep Forge',desc:'Harder enemies; powerful permanent-run boon.',enemy:1.16,elite:.07,loot:.1,reward:1.28,boon:'ironhide'},
  {id:'bloodwell',name:'Bloodwell',desc:'Predatory magic grants lifesteal.',enemy:1.1,elite:.05,loot:.05,reward:1.18,boon:'leeching'}
];

/* === V0.12.0 DEEP HUNTS === */
const DEEP_NODE_POOLS={
  frontier:[
    {type:'tracks',name:'Wolf Trail',desc:'Fresh spoor through wet fern. Hunt the ecosystem and force the alpha to reveal itself.',track:1,enemy:1.04,reward:1.06,elite:.02},
    {type:'cache',name:'Ruined Watchtower',desc:'An abandoned ranger post. Extra materials and a stable extraction route.',loot:.14,reward:1.08,canExtract:true,cacheGold:35,cacheCommon:2},
    {type:'rescue',name:'Wounded Camp',desc:'A mauled hunter still lives. Stabilize them and earn field support.',heal:.18,canExtract:true,potions:1,reward:1.05},
    {type:'shrine',name:'Ember Shrine',desc:'Old ash-wards still answer. Claim a boon, then continue the pursuit.',reward:1.08,boon:'keen_edge'},
    {type:'campsite',name:'Hunter\'s Rest',desc:'A recoverable campsite with warm coals and room to breathe.',heal:.22,canExtract:true,campsite:true,reward:1.04},
    {type:'apex',name:'Redjaw Territory',desc:'An Apex predator controls this route. Greater danger, greater prize.',enemy:1.14,elite:.18,reward:1.28,loot:.08,track:1},
    {type:'hunt',name:'Bloodroot Grove',desc:'Dense roots and constricted movement favor the pack. Clear the grove.',enemy:1.08,reward:1.1},
    {type:'cache',name:'Lost Caravan',desc:'Broken crates and scattered coin. Recovery is slow but profitable.',loot:.18,reward:1.1,cacheGold:60,cacheCommon:3},
    {type:'tracks',name:'Direfang Tracks',desc:'Massive claw marks rip the bark apart. The beast is close.',track:2,enemy:1.06,reward:1.08},
    {type:'rescue',name:'Scout Signal',desc:'A hidden ember flare reveals a scout cache and fresh pathing.',heal:.12,reward:1.06,track:1,potions:1},
    {type:'shrine',name:'Old Waystone',desc:'An old trail marker grants focus and steadier hands.',reward:1.06,boon:'deep_focus'}
  ],
  generic:[
    {type:'tracks',name:'Hunt Sign',desc:'Signs of movement lead deeper. Gather intelligence on the target.',track:1,enemy:1.04,reward:1.06},
    {type:'cache',name:'Supply Cache',desc:'Recovered provisions improve the take from this route.',loot:.14,reward:1.08,canExtract:true,cacheGold:35,cacheCommon:2},
    {type:'campsite',name:'Forward Camp',desc:'A brief safe halt. Recover before moving on.',heal:.2,canExtract:true,campsite:true,reward:1.04},
    {type:'shrine',name:'Ancient Shrine',desc:'A warded site offers a temporary expedition boon.',reward:1.08,boon:'ironhide'},
    {type:'apex',name:'Champion Territory',desc:'An elite route patrolled by a stronger local threat.',enemy:1.12,elite:.14,reward:1.24,track:1},
    {type:'hunt',name:'Kill Zone',desc:'Hostiles dominate this route. Clear them and continue.',enemy:1.08,reward:1.1},
    {type:'rescue',name:'Survivor Signal',desc:'A survivor rewards the party with aid and information.',heal:.14,reward:1.05,potions:1,track:1},
    {type:'cache',name:'Treasure Vein',desc:'A profitable detour with heavier resistance.',enemy:1.05,loot:.18,reward:1.12,cacheGold:55,cacheCommon:3}
  ]
};
const DEEP_BOSS_APPROACH={
  frontier:{name:'Direfang\'s Hunting Grounds',desc:'The alpha circles nearby. One final clash stands between you and the den.',enemy:1.12,reward:1.18,track:1},
  hollow:{name:'The Maw Corridor',desc:'Bone-littered stone leads to the hunt target.',enemy:1.1,reward:1.16,track:1},
  gloam:{name:'Rotweb Approach',desc:'Fungal spoor and silk mark the final approach.',enemy:1.1,reward:1.16,track:1},
  keep:{name:'Broken Courtyard',desc:'The keep proper lies ahead.',enemy:1.1,reward:1.16,track:1},
  frost:{name:'Icefall Approach',desc:'The air stills as the pale drake watches.',enemy:1.1,reward:1.16,track:1},
  rift:{name:'Choir Threshold',desc:'Reality thins and the chant grows louder.',enemy:1.12,reward:1.18,track:1}
};

Object.assign(DEEP_NODE_POOLS,{
  hollow:[
    {type:'ambush',name:'Gutter Tunnel',desc:'Goblin scavengers use the ossuary passages as a kill box.',encounter:'ambush',extra:2,enemy:1.07,reward:1.1},
    {type:'ritual',name:'Bell Chamber',desc:'A death-bell ritual is nearly complete. Break the ritualists quickly.',encounter:'ritual',roundLimit:4,extra:1,elite:.09,reward:1.18,rewardRare:1,track:1},
    {type:'cache',name:'Smuggler Shaft',desc:'A hidden shaft bypasses the main crypt and contains old contraband.',canExtract:true,loot:.18,reward:1.1,cacheGold:55,cacheCommon:3},
    {type:'rescue',name:'Prisoner Cages',desc:'Cut surviving hunters free before the dead close in.',encounter:'escort',roundLimit:5,heal:.14,potions:1,reward:1.08,track:1},
    {type:'defense',name:'Graveyard Breach',desc:'Hold a shattered gate against a surge from the lower ossuary.',encounter:'defense',extra:3,roundLimit:5,enemy:1.08,reward:1.2,rewardCommon:3},
    {type:'apex',name:'Bone Collector Lair',desc:'A named grave champion stalks the bone piles.',encounter:'apex',enemy:1.15,elite:.2,reward:1.3,loot:.1,track:1},
    {type:'shrine',name:'Lantern Crypt',desc:'Consecrated lanterns still burn beneath the ash.',boon:'ironhide',reward:1.07},
    {type:'tracks',name:'Royal Scraps',desc:'Gutter banners and butchered offerings mark the King\'s route.',track:2,enemy:1.05,reward:1.08}
  ],
  gloam:[
    {type:'nest',name:'Spore Orchard',desc:'Burst fungal nests before they overrun the path.',encounter:'nest',extra:3,enemy:1.08,reward:1.16,rewardCommon:3},
    {type:'ritual',name:'Witchlight Marsh',desc:'Bog witches feed a corruption bloom. Interrupt the channel.',encounter:'ritual',roundLimit:4,elite:.08,reward:1.2,rewardRare:1,track:1},
    {type:'quarry',name:'Fen Stalker Trail',desc:'A rare predator is fleeing deeper into the fen. Kill it before it escapes.',encounter:'quarry',escapeRounds:3,enemy:1.05,reward:1.24,track:1},
    {type:'rescue',name:'Drowned Hunter',desc:'A hunter is trapped in waist-deep mire. Clear the route fast.',encounter:'escort',roundLimit:5,heal:.15,potions:1,reward:1.08},
    {type:'cache',name:'Rotcap Cache',desc:'A dry rise hides alchemical reagents and a safe extraction marker.',canExtract:true,loot:.2,reward:1.12,cacheGold:45,cacheCommon:3},
    {type:'apex',name:'Thornheart Grove',desc:'The oldest growth in the fen has begun hunting trespassers.',encounter:'apex',enemy:1.15,elite:.18,reward:1.3,track:1},
    {type:'shrine',name:'Mire Waystone',desc:'A drowned waystone grants predatory resilience.',boon:'leeching',reward:1.07},
    {type:'hazard',name:'Poison Fog Basin',desc:'Toxic fog pulses across the basin while monsters close in.',encounter:'hazard',hazard:'poisonfog',enemy:1.06,reward:1.16,track:1}
  ],
  keep:[
    {type:'defense',name:'Gatehouse Stand',desc:'Ashbound soldiers pour through the breach. Hold the gate.',encounter:'defense',extra:3,roundLimit:5,enemy:1.1,reward:1.22,rewardCommon:3},
    {type:'escort',name:'Prisoner Passage',desc:'Escort a captured scout across the ruined barracks.',encounter:'escort',roundLimit:5,extra:1,reward:1.15,track:1},
    {type:'ambush',name:'Ashbound Patrol',desc:'A disciplined patrol attacks from both sides of the courtyard.',encounter:'ambush',extra:2,elite:.08,enemy:1.08,reward:1.16},
    {type:'ritual',name:'Banner Hall',desc:'Destroy the command rite before it empowers the keep.',encounter:'ritual',roundLimit:4,elite:.12,reward:1.22,rewardRare:1,track:1},
    {type:'cache',name:'Quartermaster Vault',desc:'Military stores remain behind a collapsed wall.',canExtract:true,loot:.2,reward:1.12,cacheGold:65,cacheCommon:3},
    {type:'apex',name:'Castellan Quarters',desc:'The keep\'s old castellan refuses to die.',encounter:'apex',enemy:1.16,elite:.2,reward:1.32,track:1},
    {type:'shrine',name:'Ruined Chapel',desc:'A cracked altar grants focus before the next engagement.',boon:'deep_focus',reward:1.07},
    {type:'tracks',name:'Ashbound Orders',desc:'Scorched orders reveal Veyr\'s movement through the keep.',track:2,reward:1.08}
  ],
  frost:[
    {type:'hazard',name:'Avalanche Run',desc:'Icefall slams the route in timed waves while predators attack.',encounter:'hazard',hazard:'icefall',enemy:1.08,reward:1.2,track:1},
    {type:'ritual',name:'Frostseer Circle',desc:'Frostseers are building a whiteout. Break the circle.',encounter:'ritual',roundLimit:4,elite:.12,reward:1.22,rewardRare:1,track:1},
    {type:'nest',name:'Crystal Nest',desc:'Ice crawlers swarm a clutch of living crystal.',encounter:'nest',extra:3,enemy:1.08,reward:1.18,rewardCommon:3},
    {type:'rescue',name:'Lost Climber',desc:'A stranded climber carries map fragments and emergency tonics.',encounter:'escort',roundLimit:5,heal:.14,potions:1,reward:1.1,track:1},
    {type:'cache',name:'Icebound Cache',desc:'A frozen expedition chest sits beside an extraction flare.',canExtract:true,loot:.2,reward:1.12,cacheGold:65,cacheCommon:3},
    {type:'quarry',name:'Glass Drake Trail',desc:'A rare drake bolts through the cavern. Bring it down before it escapes.',encounter:'quarry',escapeRounds:3,enemy:1.08,reward:1.28,track:1},
    {type:'campsite',name:'Whiteout Camp',desc:'A windbreak and dying brazier offer a moment of recovery.',heal:.2,canExtract:true,campsite:true,reward:1.05},
    {type:'apex',name:'Frostfang Shelf',desc:'An apex beast dominates the high shelf.',encounter:'apex',enemy:1.16,elite:.2,reward:1.32,track:1}
  ],
  rift:[
    {type:'ritual',name:'Chorister Circle',desc:'Silence the ritual before the chorus stabilizes a breach.',encounter:'ritual',roundLimit:4,elite:.14,reward:1.24,rewardRare:1,track:1},
    {type:'defense',name:'Void Tear',desc:'Survive a violent reinforcement surge around a tearing portal.',encounter:'defense',extra:3,roundLimit:5,enemy:1.12,reward:1.24,rewardCommon:3},
    {type:'ambush',name:'Rift Reaver Fold',desc:'Reavers blink into the party formation from unstable space.',encounter:'ambush',extra:2,elite:.1,enemy:1.1,reward:1.2},
    {type:'rescue',name:'Phase-Lost Hunter',desc:'A hunter flickers between realities. Clear the area before they vanish.',encounter:'escort',roundLimit:4,heal:.14,potions:1,reward:1.12,track:1},
    {type:'cache',name:'Anchor Cache',desc:'A stable anchor chamber holds valuable rift salvage.',canExtract:true,loot:.22,reward:1.14,cacheGold:75,cacheCommon:3},
    {type:'quarry',name:'Paradox Quarry',desc:'A rare void creature attempts to phase out of the hunt.',encounter:'quarry',escapeRounds:3,enemy:1.1,reward:1.3,track:1},
    {type:'shrine',name:'Broken Observatory',desc:'An old lens focuses impossible light into a temporary boon.',boon:'quickblood',reward:1.08},
    {type:'hazard',name:'Rift Pulse Chamber',desc:'Reality pulses every few rounds, damaging exposed hunters.',encounter:'hazard',hazard:'riftpulse',enemy:1.08,reward:1.22,track:1}
  ]
});
function deepEncounterLabel(type){return({ambush:'AMBUSH',ritual:'INTERRUPT THE RITUAL',escort:'PROTECT THE SURVIVOR',defense:'HOLD THE LINE',quarry:'FLEEING QUARRY',nest:'DESTROY THE NEST',hazard:'ENVIRONMENTAL HAZARD',apex:'APEX TERRITORY'})[type]||'DEEP HUNT'}
function spawnDeepReinforcements(run,occupied,count=2,tag='AMBUSHER'){
  const mission=MISSIONS[run.missionId],partySize=Object.keys(run.players).length;
  for(let i=0;i<count;i++){
    const pos=randomWalkable(run.map,occupied,5);if(!pos)continue;const kind=pick(mission.enemies),base=ENEMY[kind];if(!base)continue;
    const scale=mission.diff*(1+(run.depth-1)*.1),hp=Math.round(base.hp*scale*(1+.4*(partySize-1))*1.25),atk=Math.round(base.atk*scale*1.08),def=Math.round(base.def*1.08);
    run.enemies.push(makeEnemyParts({id:uid(),kind,name:`${tag} ${base.name}`,x:pos.x,y:pos.y,elite:true,trait:tag,boss:false,maxHp:hp,hp,atk,def,xp:Math.round(base.xp*scale*1.4),status:{poison:0,burn:0,bleed:0},intent:null}));occupied.add(K(pos.x,pos.y));
  }
}
function setupDeepEncounter(run,node,occupied){
  if(!run?.deepHunt?.active||!node?.encounter||node.type==='boss')return;
  const timed=['ritual','escort','defense'].includes(node.encounter);
  run.deepChallenge={type:node.encounter,label:deepEncounterLabel(node.encounter),startedRound:run.round,deadline:timed?run.round+(node.roundLimit||5):null,rewardRare:node.rewardRare||0,rewardCommon:node.rewardCommon||0,rewardGold:node.rewardGold||35,complete:false,failed:false};
  if(node.encounter==='ambush'){spawnDeepReinforcements(run,occupied,2,'AMBUSHER');run.log.push('⚠ AMBUSH — enemies close from concealed positions.')}
  if(node.encounter==='defense'){spawnDeepReinforcements(run,occupied,3,'BREACH');run.log.push(`⚠ HOLD THE LINE — clear the wave by round ${run.deepChallenge.deadline} for bonus rewards.`)}
  if(node.encounter==='nest'){spawnDeepReinforcements(run,occupied,3,'BROOD');run.deepChallenge.complete=true;run.log.push('☠ NEST SURGE — a brood wave erupts into the route.')}
  if(node.encounter==='ritual'){const ritualists=run.enemies.filter(e=>!e.boss).slice(0,Math.min(2,run.enemies.length));ritualists.forEach(e=>{e.trait='RITUAL ANCHOR';e.name=`Ritual ${e.name}`;e.maxHp=Math.round(e.maxHp*1.22);e.hp=e.maxHp});run.log.push(`⚠ INTERRUPT THE RITUAL — clear the stage by round ${run.deepChallenge.deadline}.`)}
  if(node.encounter==='escort')run.log.push(`✚ PROTECT THE SURVIVOR — clear the route by round ${run.deepChallenge.deadline} to secure the rescue reward.`);
  if(node.encounter==='apex'){const apex=run.enemies.find(e=>!e.boss);if(apex){apex.elite=true;apex.trait='APEX MINI-BOSS';apex.name=`Apex ${apex.name}`;apex.maxHp=Math.round(apex.maxHp*2.2);apex.hp=apex.maxHp;apex.atk=Math.round(apex.atk*1.10);apex.def=Math.round(apex.def*1.15)}run.deepChallenge.complete=true;run.log.push('⚔ APEX TERRITORY — a named-caliber predator controls the route.')}
  if(node.encounter==='quarry'){const q=run.enemies.find(e=>!e.boss);if(q){q.elite=true;q.fleeingQuarry=true;q.trait='FLEEING QUARRY';q.name=`Fleeing ${q.name}`;q.maxHp=Math.round(q.maxHp*1.7);q.hp=q.maxHp;q.escapeRound=run.round+(node.escapeRounds||3);run.deepChallenge.quarryId=q.id;run.log.push(`⚠ FLEEING QUARRY — ${q.name} escapes after round ${q.escapeRound-1} if not killed.`)}}
  if(node.encounter==='hazard'){run.deepHazard={type:node.hazard||'riftpulse',cadence:2};run.deepChallenge.complete=true;run.log.push(`⚠ ${deepEncounterLabel('hazard')} — ${node.desc}`)}
}
function resolveDeepChallengeOnClear(run,node){
  const c=run?.deepChallenge;if(!c||c._resolved)return;c._resolved=true;
  if(c.deadline&&!c.failed)c.complete=run.round<=c.deadline;
  if(c.type==='quarry'&&!c.complete)c.failed=true;
  if(c.complete&&!c.failed){Object.values(run.players).filter(p=>!p.dead).forEach(p=>{p.runLoot.gold+=(c.rewardGold||35);p.runLoot.common+=(c.rewardCommon||0);p.runLoot.rare+=(c.rewardRare||0)});run.log.push(`✦ ${c.label} COMPLETE — bonus expedition rewards secured.`)}else if(c.deadline||c.type==='quarry')run.log.push(`✕ ${c.label} FAILED — the optional bonus was lost.`);
  run.deepHazard=null;
}
function tickDeepStageHazard(run){
  const h=run?.deepHazard;if(!h||run.round%Math.max(1,h.cadence||2)!==0)return;
  const targets=Object.values(run.players).filter(p=>!p.dead&&!p.downed);if(!targets.length)return;
  const label=h.type==='icefall'?'ICEFALL':h.type==='poisonfog'?'POISON FOG':'RIFT PULSE';
  run.log.push(`⚠ ${label} sweeps the encounter.`);targets.forEach(p=>{let dmg=Math.max(1,Math.round(p.maxHp*(h.type==='riftpulse'?.055:.04)));if(p.guarding)dmg=Math.max(1,Math.round(dmg*.55));p.hp-=dmg;pushCombatFloaterPlayer(p,`-${dmg}`,h.type==='riftpulse'?'#c486ff':h.type==='icefall'?'#bceeff':'#83d884',10,700);if(h.type==='poisonfog')p.status.poison=Math.max(p.status.poison||0,1);if(p.hp<=0)downPlayer(run,p)})
}

function deepMissionConfig(mid){
  const cfg={
    frontier:{hardCap:6,minBossDepth:5,spoorRequired:3},
    hollow:{hardCap:6,minBossDepth:5,spoorRequired:3},
    gloam:{hardCap:7,minBossDepth:6,spoorRequired:4},
    keep:{hardCap:8,minBossDepth:6,spoorRequired:4},
    frost:{hardCap:9,minBossDepth:7,spoorRequired:5},
    rift:{hardCap:10,minBossDepth:8,spoorRequired:5}
  }[mid];
  return cfg?{active:true,...cfg}:{active:false,hardCap:0,minBossDepth:0,spoorRequired:0}
}
function deepNodeIcon(type){return({start:'◆',tracks:'✣',cache:'⛁',rescue:'✚',shrine:'✦',campsite:'⌂',apex:'⚔',hunt:'☠',boss:'♛',ambush:'⚠',ritual:'◉',escort:'➜',defense:'⛨',quarry:'➶',nest:'✹',hazard:'☄'})[type]||'•'}
function deepNodeTypeName(type){return({start:'Trailhead',tracks:'Tracking',cache:'Cache',rescue:'Rescue',shrine:'Shrine',campsite:'Campsite',apex:'Apex',hunt:'Hunt',boss:'Boss',ambush:'Ambush',ritual:'Ritual',escort:'Escort',defense:'Defense',quarry:'Quarry',nest:'Nest',hazard:'Hazard'})[type]||'Route'}
function deepPoolForMission(mid){return structuredCloneSafe(DEEP_NODE_POOLS[mid]||DEEP_NODE_POOLS.generic)}
function buildDeepHuntPlan(mid){
  const cfg=deepMissionConfig(mid);if(!cfg.active)return null;
  const pool=deepPoolForMission(mid), tiers={};
  const start={id:'deep_start',depth:1,type:'start',name:mid==='frontier'?'Emberwood Trailhead':'Forward Entry',desc:'The expedition begins. Explore, track, and decide how greedy to become.',enemy:1,reward:1,loot:0,canExtract:false};
  for(let d=2; d<=cfg.hardCap; d++){
    tiers[d]=[];
    for(let i=0;i<2;i++){
      if(!pool.length)pool.push(...deepPoolForMission(mid));
      const idx=Math.floor(Math.random()*pool.length),node=pool.splice(idx,1)[0];
      node.id=`deep_${d}_${i}_${Math.floor(Math.random()*9999)}`;node.depth=d;
      tiers[d].push(node);
    }
  }
  const approach=structuredCloneSafe(DEEP_BOSS_APPROACH[mid]||{name:'Boss Approach',desc:'The trail tightens around your quarry.',enemy:1.1,reward:1.16,track:1});
  approach.id='deep_approach';approach.depth=cfg.hardCap;approach.type='tracks';
  tiers[cfg.hardCap][0]=approach;
  const bossNode={id:'deep_boss',depth:cfg.hardCap+1,type:'boss',name:'Target Den',desc:'The hunt target is cornered. Finish the expedition.',enemy:1.18,elite:.1,reward:1.35,loot:.1};
  return {active:true,cfg,start,tiers,bossNode,spoor:0,bossRevealed:false,history:[start],revealedDepth:2};
}
function deepCurrentNode(run){return run?.deepHunt?.currentNode||null}

const V132_DELVES={
  embercellar:{id:'embercellar',name:'Emberroot Cellar',source:'frontier',depths:3,minLevel:1,minGear:0,focus:'Gold + enhancement materials',desc:'A collapsed frontier cellar network now occupied by wolves, scavengers, and things driven underground by Direfang.',gold:180,common:9,rare:0,rewardGear:false,bossName:'Rootmaw Alpha'},
  ossuary:{id:'ossuary',name:'Forgotten Ossuary',source:'hollow',depths:4,minLevel:6,minGear:9,focus:'Enhancement + refinement materials',desc:'A sealed bone crypt beneath Ashfall Hollow. Clear its chambers for dense forge-material rewards.',gold:130,common:16,rare:2,rewardGear:false,bossName:'The Bone Collector'},
  smugglermine:{id:'smugglermine',name:'Blackvein Smuggler Mine',source:'gloam',depths:4,minLevel:11,minGear:17,focus:'Gold + rare refinement materials',desc:'A flooded contraband mine where Gloamfen predators have nested among abandoned lockboxes.',gold:360,common:8,rare:3,rewardGear:false,bossName:'Fenlock Butcher'},
  ashvault:{id:'ashvault',name:'Ashbound Reliquary',source:'keep',depths:5,minLevel:16,minGear:25,focus:'Guaranteed equipment cache',desc:'A forgotten armory beneath the Keep. Its wardens still protect a sealed equipment cache.',gold:220,common:12,rare:2,rewardGear:true,bossName:'Reliquary Castellan'},
  frostglass:{id:'frostglass',name:'Frostglass Vault',source:'frost',depths:5,minLevel:21,minGear:33,focus:'Rare materials + equipment',desc:'A crystal vault opened by shifting ice. The deeper chambers amplify both danger and reward.',gold:260,common:12,rare:4,rewardGear:true,bossName:'Glassmaw Sentinel'},
  riftreliquary:{id:'riftreliquary',name:'Paradox Reliquary',source:'rift',depths:6,minLevel:26,minGear:41,focus:'High-end refinement + gear cache',desc:'A dungeon that should not exist twice in the same place. Survive its repeating halls and secure the reliquary.',gold:420,common:14,rare:6,rewardGear:true,bossName:'Paradox Warden'}
};
function delveByIdV132(id){return V132_DELVES[id]||null}
function delveUnlockStateV132(p,d){const missing=[],gr=gearRating(p);if((p?.level||1)<d.minLevel)missing.push(`Lv ${d.minLevel}`);if(gr<d.minGear)missing.push(`Gear ${d.minGear}`);return{locked:missing.length>0,missing,gr}}
function maybeDiscoverDelveV132(p,mid,majorClear=false){if(!p||!mid)return null;p.discoveredDelvesV132=p.discoveredDelvesV132||['embercellar'];const candidates=Object.values(V132_DELVES).filter(d=>d.source===mid&&!p.discoveredDelvesV132.includes(d.id));if(!candidates.length)return null;if(!majorClear&&!chance(.28))return null;const d=pick(candidates);p.discoveredDelvesV132.push(d.id);notifyV11('quest','DELVE DISCOVERED',`${d.name} is now posted on the Hunt Board.`,{life:6500});return d}
function delveMissionNameV132(run){return run?.isDelve&&run?.delve?.name?run.delve.name:MISSIONS[run?.missionId]?.name||'Expedition'}
function runDepthLimit(run){if(run?.isWorldSkirmish)return 1;if(run?.isDelve&&run?.delve)return run.delve.depths;return run?.deepHunt?.active?(run.deepHunt.cfg.hardCap+1):MISSIONS[run.missionId].depths}

function deepHuntProgress(run){return run?.deepHunt?.spoor||0}
function applyDeepNodeEntry(run,node){
  if(!node)return;
  run.currentPath=structuredCloneSafe({...node,enemy:node.enemy||1,elite:node.elite||0,loot:node.loot||0,reward:node.reward||1,boon:node.boon||null,heal:node.heal||0});
  run.zoneStageName=node.name;
  if(node.boon){Object.values(run.players).filter(p=>!p.dead).forEach(p=>{p.boons=p.boons||[];if(!p.boons.includes(node.boon))p.boons.push(node.boon)});run.log.push(`✦ Expedition boon secured: ${boonById(node.boon)?.name||node.boon}.`)}
  if(node.type==='campsite' || node.type==='rescue'){
    const healFrac=node.heal||0.12;Object.values(run.players).filter(p=>p.connected!==false).forEach(p=>{if(p.dead){p.dead=false;p.downed=false;p.deadAt=null;p.downedAt=null;p.hp=Math.max(1,Math.round(p.maxHp*.35));run.log.push(`${p.name} is dragged back into the hunt at ${p.hp} HP.`)}const amt=Math.round(p.maxHp*healFrac);p.hp=Math.min(p.maxHp,p.hp+amt);if(node.potions)p.potions=Math.min(5,(p.potions||0)+node.potions)});
    if(node.type==='campsite'&&chance(.28)){run.currentPath.enemy=(run.currentPath.enemy||1)*1.08;run.currentPath.elite=(run.currentPath.elite||0)+.03;run.log.push('⚠ Campsite ambush — the rest was interrupted by prowling monsters.')}else run.log.push(`${node.name}: the party regains momentum before moving on.`);
  }
  if(node.cacheGold||node.cacheCommon){Object.values(run.players).forEach(p=>{p.runLoot.gold+=(node.cacheGold||0);p.runLoot.common+=(node.cacheCommon||0)});run.log.push(`${node.name}: supplies recovered for the whole party.`)}
}
function deepChoicesForNextDepth(run){
  if(!run?.deepHunt?.active)return null;
  const d=run.depth+1,deep=run.deepHunt; let out=[];
  if(d<=deep.cfg.hardCap) out=(deep.tiers[d]||[]).map(n=>structuredCloneSafe(n));
  if((deep.bossRevealed||d>deep.cfg.hardCap) && d>=deep.cfg.minBossDepth){
    out.push(structuredCloneSafe(deep.bossNode));
  }
  return out;
}
function renderDeepHuntPanel(run){
  const panel=$('expeditionPanel'); if(!panel) return;
  if(!run?.deepHunt?.active){panel.classList.remove('show');panel.style.display='none';panel.innerHTML='';return}
  panel.classList.add('show');panel.style.display='block';
  const deep=run.deepHunt,cur=deep.currentNode||deep.start,historyIds=new Set((deep.history||[]).map(n=>n.id)),choiceIds=new Set((run.pathChoices||[]).map(n=>n.id));
  let route=(deep.history||[]).map(n=>n.name).join(' → ');
  let tiers=[];
  tiers.push(`<div class="exptier"><b>START</b><div class="tiny">${deep.start.name}</div><div class="expnodes"><div class="expnode ${historyIds.has(deep.start.id)?'complete':''} ${cur.id===deep.start.id?'current':''}"><b>${deepNodeIcon(deep.start.type)} ${deep.start.name}</b><div class="tiny">${deep.start.desc}</div></div></div></div>`);
  for(let d=2; d<=deep.cfg.hardCap; d++){
    const shown=d<=Math.max(deep.revealedDepth||2,run.depth+1); const nodes=deep.tiers[d]||[];
    tiers.push(`<div class="exptier"><b>DEPTH ${d}</b><div class="tiny">${d<deep.cfg.minBossDepth?'Search the ecosystem':'The target could be near'}</div><div class="expnodes">${nodes.map(n=>shown?`<div class="expnode ${historyIds.has(n.id)?'complete':''} ${cur.id===n.id?'current':''} ${choiceIds.has(n.id)?'choice':''} ${n.canExtract?'canextract':''}"><b>${deepNodeIcon(n.type)} ${n.name}</b><div class="tiny">${deepNodeTypeName(n.type)}${n.track?` • +${n.track} spoor`:''}${n.canExtract?' • extraction route':''}</div></div>`:`<div class="expnode hidden"><b>? Unknown Route</b><div class="tiny">Fog of war</div></div>`).join('')}</div></div>`)
  }
  tiers.push(`<div class="exptier"><b>QUARRY</b><div class="tiny">${deep.bossRevealed?'The den is revealed':'Still concealed'}</div><div class="expnodes"><div class="expnode boss ${deep.bossRevealed?'':'hidden'} ${cur.id===deep.bossNode.id?'current':''} ${historyIds.has(deep.bossNode.id)?'complete':''}"><b>${deepNodeIcon('boss')} ${deep.bossNode.name}</b><div class="tiny">${deep.bossRevealed?'Boss node is now selectable':'Need more spoor to reveal the den'}</div></div></div></div>`)
  panel.innerHTML=`<div class="expedition-head"><span class="expchip track">DEEP HUNT</span><span class="expchip spoor">SPOOR ${deep.spoor}/${deep.cfg.spoorRequired}</span><span class="expchip heat">HEAT +${Math.round((huntHeatV10(run)-1)*100)}%</span>${(deep.currentNode?.canExtract)?'<span class="expchip extract">SAFE EXTRACTION AVAILABLE</span>':''}${deep.bossRevealed?'<span class="expchip boss">BOSS DEN REVEALED</span>':''}</div><div class="expedition-route"><span class="expedition-kicker">Route</span><br>${route}</div><div class="expedition-grid">${tiers.join('')}</div>`;
}

const RARE_EVENTS=[
  {id:'golden',name:'Golden Quarry',desc:'A golden champion stalks this depth. Exceptional payout.',reward:1.35,elite:.08,extra:1},
  {id:'migration',name:'Monster Migration',desc:'The zone is overcrowded with prey.',reward:1.18,elite:.02,extra:4},
  {id:'riftstorm',name:'Rift Storm',desc:'Reality is unstable. Monsters and rewards surge.',reward:1.42,elite:.1,extra:2,enemy:1.15},
  {id:'lostcaravan',name:'Lost Caravan',desc:'Scattered valuables increase gear and material yields.',reward:1.2,elite:0,extra:0,loot:.22}
];
const PART_DEFS={
  wolf:[['fang','Fangs','wolf_fang','Fang',.22,'atk'],['hide','Alpha Hide','wolf_pelt','Pelt',.28,'def']],direwolf:[['fang','Direfang Fangs','direfang_fang','Direfang Fang',.2,'atk'],['foreleg','Scarred Foreleg','direfang_sinew','Direfang Sinew',.18,'slow'],['hide','Direfang Pelt','direfang_pelt','Alpha Pelt',.25,'def']],
  goblin:[['weapon','Weapon Arm','goblin_iron','Goblin Iron',.22,'atk'],['mask','War Mask','goblin_mask','War Mask',.2,'def']],bossgoblin:[['crown','Iron Crown','gutter_crown','Crown Shard',.18,'def'],['arm','King’s Blade Arm','gutter_iron','King’s Iron',.22,'atk']],
  spider:[['fang','Venom Fangs','spider_fang','Venom Fang',.2,'atk'],['sac','Silk Sac','spider_silk','Gloam Silk',.25,'def']],skeleton:[['arm','Sword Arm','grave_bone','Grave Bone',.22,'atk'],['skull','Skull','grave_skull','Runed Skull',.2,'def']],
  cultist:[['focus','Ritual Focus','cinder_focus','Cinder Focus',.2,'atk'],['mask','Ash Mask','cinder_mask','Ash Mask',.22,'def']],knight:[['shield','Shield Arm','ashbound_steel','Ashbound Steel',.24,'def'],['helm','Helm','ashbound_crest','Ashbound Crest',.2,'atk']],
  bossknight:[['blade','Veyr’s Blade','veyr_blade','Veyr Blade Shard',.2,'atk'],['helm','Ashbound Helm','veyr_crest','Veyr Crest',.18,'def']],slime:[['core','Bog Core','bog_core','Bog Core',.3,'def']],
  wraith:[['bell','Bell Core','wraith_bell','Wraith Bell',.25,'atk']],golem:[['rune','Runestone Core','rune_core','Runestone Core',.22,'def'],['arm','Stone Arm','golem_stone','Living Stone',.24,'atk']],
  drake:[['horn','Pale Horn','drake_horn','Pale Horn',.2,'atk'],['wing','Wing','drake_wing','Pale Wing',.26,'slow']],bossdrake:[['horn','Frostmaw Horn','frost_horn','Frostmaw Horn',.18,'atk'],['wing','Frost Wing','frost_wing','Frost Wing',.22,'slow']],
  mire:[['heart','Mire Heart','mire_heart','Mire Heart',.2,'def'],['tendril','Venom Tendril','mire_tendril','Mire Tendril',.22,'atk']],riftboss:[['mask','Choir Mask','choir_mask','Choir Mask',.18,'def'],['core','Choir Core','choir_core','Choir Core',.22,'atk']],worldeater:[['horn','World Horn','world_horn','World-Eater Horn',.16,'atk'],['heart','Abyssal Heart','world_heart','Abyssal Heart',.2,'def']]
};
const KILL_MATS={wolf:['wolf_pelt','Wolf Pelt'],direwolf:['direfang_heart','Direfang Heart'],goblin:['goblin_scrap','Goblin Scrap'],bossgoblin:['gutter_heart','Gutter King Heart'],spider:['spider_silk','Gloam Silk'],skeleton:['grave_bone','Grave Bone'],cultist:['cinder_ash','Cinder Ash'],knight:['ashbound_steel','Ashbound Steel'],bossknight:['veyr_ember','Veyr Ember'],slime:['bog_core','Bog Core'],wraith:['wraith_essence','Wraith Essence'],golem:['golem_stone','Living Stone'],drake:['drake_scale','Pale Scale'],bossdrake:['frost_heart','Frostmaw Heart'],mire:['mire_bloom','Mire Bloom'],riftboss:['choir_echo','Choir Echo'],worldeater:['world_blood','World-Eater Blood']};
const MONSTER_SETS={
  direfang:{name:'Direfang Huntset',source:'direwolf',bonus2:'+5% Crit',bonus3:'+5% Dodge',req:{direfang_fang:2,direfang_pelt:3,direfang_heart:1}},
  gutter:{name:'Gutter King Regalia',source:'bossgoblin',bonus2:'+4 ATK',bonus3:'+5% Lifesteal',req:{gutter_crown:1,gutter_iron:2,gutter_heart:1}},
  mire:{name:'Mireborn Vestments',source:'mire',bonus2:'+20 HP',bonus3:'+3 DEF',req:{mire_heart:1,mire_tendril:2,mire_bloom:2}},
  ashbound:{name:'Ashbound Warplate',source:'bossknight',bonus2:'+4 DEF',bonus3:'+3 ATK',req:{veyr_blade:1,veyr_crest:1,veyr_ember:2}},
  frost:{name:'Frostmaw Harness',source:'bossdrake',bonus2:'+25 HP',bonus3:'+4% Crit',req:{frost_horn:1,frost_wing:1,frost_heart:2}},
  choir:{name:'Choirbreaker Array',source:'riftboss',bonus2:'+5% Crit / Dodge',bonus3:'+6 ATK / +4 DEF',req:{choir_mask:1,choir_core:1,choir_echo:2}},world:{name:'World-Eater Carapace',source:'worldeater',bonus2:'+30 HP / +4 ATK',bonus3:'+6 DEF / +5% Crit',req:{world_horn:1,world_heart:1,world_blood:2}}
};
const MYTHICS={
  warden:[['The Wall That Walks','armor','greater_bastion'],['First Oath','weapon','oathstrike'],['Unbroken Gate','charm','hearthguard']],
  berserker:[['Worldsplitter','weapon','redstorm'],['Heart of the Devourer','charm','devourer'],['The Last Rage','armor','ragechain']],
  ranger:[['Godsight','weapon','longwatch'],['The Last Arrow','charm','savior'],['Falcon King Mantle','armor','falcon']],
  arcanist:[['Atlas of Falling Stars','weapon','cometfall'],['The First Ember','charm','sunlance'],['Mantle Beyond Night','armor','everburn']],
  templar:[['Mercy Without End','charm','saint_hand'],['Hammer of First Light','weapon','judgment'],['The Martyr’s Promise','armor','martyr_light']],
  shadow:[['Final Silence','weapon','execution'],['No Shadow Cast','armor','phantom_step'],['The Black Coin','charm','night_eye']]
};
const NEMESIS_NAMES_A=['Grath','Mord','Skarn','Vexa','Korr','Thren','Malg','Dreg','Sable','Rusk'],NEMESIS_NAMES_B=['Bone-Chewer','Oathbreaker','the Returned','Party-Slayer','Red-Eye','the Unburied','Ash-Tooth','the Cruel','Graveborn','the Patient'];



let profileStorageStateV144=null,pendingProfileImportV144=null;
function readProfileStorageV144(){profileStorageStateV144=SAVE_SYSTEM.readProfiles(localStorage);return profileStorageStateV144}
function loadProfiles(){const state=readProfileStorageV144();return state.ok?state.profiles:{}}
function reportSaveFailureV144(result){profileStorageStateV144=result?.current||readProfileStorageV144();updateSaveTransferUiV144(profileStorageStateV144);toast(result?.message||'Local save failed. No data was changed.');return false}
function saveProfiles(p,opts={}){const result=SAVE_SYSTEM.writeProfiles(localStorage,p,opts);return result.ok?true:reportSaveFailureV144(result)}
function persistProfile(opts={}){
  if(!profile)return false;const state=readProfileStorageV144();if(!state.ok)return reportSaveFailureV144({current:state,message:'Local save data is unreadable. Export the raw recovery file before making changes.'});const ps=state.profiles;ps[profile.id]=profile;const result=SAVE_SYSTEM.writeProfiles(localStorage,ps,{...opts,expectedRaw:state.raw});if(!result.ok)return reportSaveFailureV144(result);profileStorageStateV144=result;renderSavedCharacters();flashSavedV131();setTimeout(syncRoomProfile,0);return true
}

const V131_RARITY_RANK={common:0,uncommon:1,rare:2,epic:3,legendary:4,relic:5,mythic:6};
const V131_SET_MISSION={direfang:'frontier',gutter:'hollow',mire:'gloam',ashbound:'keep',frost:'frost',choir:'rift',world:'worldeater'};
const V131_SET_TROPHY={direfang:'Direfang Alpha',gutter:'The Gutter King',mire:'Mire Mother',ashbound:'Sir Veyr, Ashbound',frost:'Frostmaw, the Pale Drake',choir:'The Nameless Choir',world:'The World Eater'};
const V131_SLOT_REQ={
 direfang:{weapon:{direfang_fang:2,direfang_heart:1},armor:{direfang_pelt:2,direfang_sinew:1},charm:{direfang_heart:1,direfang_fang:1}},
 gutter:{weapon:{gutter_iron:2,gutter_heart:1},armor:{gutter_crown:1,gutter_iron:1},charm:{gutter_heart:1,gutter_crown:1}},
 mire:{weapon:{mire_tendril:2,mire_bloom:1},armor:{mire_heart:1,mire_bloom:2},charm:{mire_heart:1,mire_tendril:1}},
 ashbound:{weapon:{veyr_blade:1,veyr_ember:2},armor:{veyr_crest:1,veyr_ember:2},charm:{veyr_blade:1,veyr_crest:1}},
 frost:{weapon:{frost_horn:1,frost_heart:2},armor:{frost_wing:1,frost_heart:2},charm:{frost_horn:1,frost_wing:1}},
 choir:{weapon:{choir_core:1,choir_echo:3},armor:{choir_mask:1,choir_echo:3},charm:{choir_mask:1,choir_core:1}},
 world:{weapon:{world_horn:1,world_blood:4},armor:{world_heart:1,world_blood:4},charm:{world_horn:1,world_heart:1}}
};
const V131_RECIPE_NAMES={
 direfang:{weapon:'Fangcaller Armament',armor:'Alpha Pelt Harness',charm:'Direfang Hunt Sigil'},
 gutter:{weapon:'Scrap-King Cleaver',armor:'Gutter King Warplate',charm:'Crowned Scrap Idol'},
 mire:{weapon:'Rotbloom Implement',armor:'Mireborn Carapace',charm:'Heart of the Fen'},
 ashbound:{weapon:'Veyrforged Armament',armor:'Ashbound Warplate',charm:'Cinder-Oath Emblem'},
 frost:{weapon:'Frostmaw Armament',armor:'Pale Wing Harness',charm:'Glacial Heart Sigil'},
 choir:{weapon:'Choirbreaker Armament',armor:'Black Bell Vestment',charm:'Echo-Core Focus'},
 world:{weapon:'Worldbreaker Armament',armor:'World-Eater Carapace',charm:'Last Horizon Sigil'}
};

const V132_HUNTFORGED_TYPES=['weapon','chest','head','gloves','boots','offhand','ring','necklace'];
function huntforgedReqFamilyV132(type){return type==='weapon'?'weapon':['chest','head','gloves','boots'].includes(type)?'armor':'charm'}
function huntforgedNameV132(setId,type){
  const existing=V131_RECIPE_NAMES[setId]||{},fam=huntforgedReqFamilyV132(type);if((type==='weapon'&&existing.weapon)||(type==='chest'&&existing.armor)||(type==='necklace'&&existing.charm))return type==='weapon'?existing.weapon:type==='chest'?existing.armor:existing.charm;
  const prefix={direfang:'Direfang',gutter:'Gutter-King',mire:'Mireborn',ashbound:'Veyrforged',frost:'Frostmaw',choir:'Choirbreaker',world:'World-Eater'}[setId]||'Huntforged';
  const noun={head:'Helm',gloves:'Grips',boots:'Greaves',offhand:'Offhand',ring:'Band',necklace:'Sigil',chest:'Harness'}[type]||'Armament';
  return `${prefix} ${noun}`
}
function huntCraftRecipesV131(){const out=[];Object.keys(V131_SET_MISSION).forEach((setId,tier)=>{V132_HUNTFORGED_TYPES.forEach(type=>{const late=tier>=5,world=setId==='world',rarity=world?'legendary':late?'legendary':'epic',fam=huntforgedReqFamilyV132(type),baseReq=V131_SLOT_REQ[setId][fam]||{};const req={};Object.entries(baseReq).forEach(([k,v])=>req[k]=type==='ring'||type==='head'||type==='gloves'||type==='boots'?Math.max(1,Math.ceil(v*.72)):v);out.push({id:`${setId}_${type}`,setId,type,missionId:V131_SET_MISSION[setId],boss:V131_SET_TROPHY[setId],name:huntforgedNameV132(setId,type),req,common:8+tier*3+(world?7:0),rare:2+Math.floor(tier/2)+(world?3:0),gold:125+tier*70+(world?230:0),rarity,tier:tier+1})})});return out}
const HUNT_CRAFT_RECIPES_V131=huntCraftRecipesV131();
function huntRecipeV131(id){return HUNT_CRAFT_RECIPES_V131.find(r=>r.id===id)}
function recipeUnlockedV131(p,r){return !r?.boss||p?.trophies?.includes(r.boss)}
function recipeMaterialStateV131(p,r){const rows=Object.entries(r.req||{}).map(([k,v])=>({key:k,need:v,have:p.monsterParts?.[k]||0,name:namedPartName(k)}));return {rows,canParts:rows.every(x=>x.have>=x.need),canGeneric:(p.materials.common||0)>=r.common&&(p.materials.rare||0)>=r.rare&&(p.gold||0)>=r.gold}}
function recipeMaterialsHTMLV131(p,r){const s=recipeMaterialStateV131(p,r);return `<div class="recipe-mats-v131">${s.rows.map(x=>`<span class="recipe-mat-v131 ${x.have>=x.need?'ok':'miss'}">${x.name} ${x.have}/${x.need}</span>`).join('')}<span class="recipe-mat-v131 ${(p.materials.common||0)>=r.common?'ok':'miss'}">Common ${p.materials.common||0}/${r.common}</span><span class="recipe-mat-v131 ${(p.materials.rare||0)>=r.rare?'ok':'miss'}">Rare ${p.materials.rare||0}/${r.rare}</span><span class="recipe-mat-v131 ${(p.gold||0)>=r.gold?'ok':'miss'}">Gold ${p.gold||0}/${r.gold}</span></div>`}
function trackedRecipeHTMLV131(p){const r=huntRecipeV131(p?.trackedRecipeV131);if(!r)return '<div class="tiny">No recipe tracked. Track Huntforged gear in the Forge and the Hunt Board will point you at its source.</div>';return `<div class="tracked-recipe-v131"><b>TRACKED: ${r.name}</b><div class="recipe-source-v131">Hunt ${MISSIONS[r.missionId]?.name||r.missionId} • defeat ${r.boss}</div>${recipeMaterialsHTMLV131(p,r)}</div>`}
function craftHuntRecipeV131(id){
  ensureProfileShape(profile);const r=huntRecipeV131(id);if(!r)return false;if(!recipeUnlockedV131(profile,r)){toast(`Defeat ${r.boss} to unlock this recipe`);return false}const st=recipeMaterialStateV131(profile,r);if(!st.canParts||!st.canGeneric){toast('Missing Huntforged crafting materials');return false}const profileBeforeCraft=structuredCloneSafe(profile);st.rows.forEach(x=>profile.monsterParts[x.key]-=x.need);profile.materials.common-=r.common;profile.materials.rare-=r.rare;profile.gold-=r.gold;const ilvl=Math.max(profile.level+4+r.tier*3,8+r.tier*6),mult=r.rarity==='legendary'?2.08:1.78,i={id:uid(),type:r.type,ilvl,rarity:r.rarity,name:r.name,atk:0,def:0,hp:0,affixType:null,affixValue:0,enhance:0,setId:r.setId,setName:MONSTER_SETS[r.setId]?.name,zoneId:r.missionId,craftedFrom:r.id,huntforged:true,identityBase:r.name,identityTier:'Huntforged',identityPath:['Huntforged','Tempered','Masterworked','Awakened'],value:ilvl*22};fillItemStatsV132(i,mult);const aff=pick(AFFIXES);i.affixType=aff[1];i.affixValue=aff[2];const fam=huntforgedReqFamilyV132(r.type);i.trait=r.type==='weapon'?V10_CLASS_TRAIT[profile.classId]:fam==='armor'?(r.type==='gloves'?'battle_focus':r.type==='boots'?'surefooted':r.type==='head'?'resonant_focus':r.type==='chest'?'partbreaker':'shoulder_breaker'):(r.type==='offhand'?'bulwark_grip':r.type==='ring'?'boss_slayer':'resource_well');profile.inventory.push(i);if(!persistProfile()){profile=profileBeforeCraft;renderProfile();return false}renderProfile();notifyV11('loot','HUNTFORGED COMPLETE',`${i.name} — ${V10_ITEM_TRAITS[i.trait]?.name}`,{life:6500});return i
}
function toggleTrackedRecipeV131(id){ensureProfileShape(profile);profile.trackedRecipeV131=profile.trackedRecipeV131===id?null:id;persistProfile();renderProfile();toast(profile.trackedRecipeV131?'Recipe tracked':'Recipe untracked')}

function identityRankV14(i){return({Huntforged:0,Tempered:1,Masterworked:2,Awakened:3})[i?.identityTier]??0}
function identityUpgradeCostV14(i){const r=identityRankV14(i);return r===0?{gold:260,common:14,rare:2}:r===1?{gold:620,common:22,rare:5}:r===2?{gold:1350,common:0,rare:9}:null}
function evolveIdentityV14(itemId){if(!profile)return;const i=[...Object.values(profile.equipment||{}),...(profile.inventory||[])].find(x=>x?.id===itemId);if(!i?.huntforged)return toast('Only Huntforged equipment can follow an identity path');const rank=identityRankV14(i),cost=identityUpgradeCostV14(i);if(!cost)return toast('This equipment identity is fully Awakened');if(rank===1&&(i.enhance||0)<3)return toast('Masterworking requires +3 enhancement');if(rank===2&&(i.enhance||0)<5)return toast('Awakening the identity requires +5 Masterwork');if(profile.gold<cost.gold||profile.materials.common<cost.common||profile.materials.rare<cost.rare)return toast(`Need ${cost.gold}g • ${cost.common} common • ${cost.rare} rare`);profile.gold-=cost.gold;profile.materials.common-=cost.common;profile.materials.rare-=cost.rare;const next=['Tempered','Masterworked','Awakened'][rank],mult=[1.08,1.10,1.12][rank];i.atk=Math.round((i.atk||0)*mult);i.def=Math.round((i.def||0)*mult);i.hp=Math.round((i.hp||0)*mult);i.identityTier=next;i.identityRank=rank+1;i.name=rank===0?`Tempered ${i.identityBase||i.name}`:rank===1?`${i.identityBase||i.name}, Masterworked`:`${i.identityBase||i.name}, Awakened`;persistProfile();renderProfile();notifyV11('loot',`${next.toUpperCase()} IDENTITY`,`${i.name} grows with your hunt instead of being discarded.`,{life:6500})}
function identityButtonHTMLV14(i){if(!i?.huntforged)return'';const cost=identityUpgradeCostV14(i);if(!cost)return`<button disabled>IDENTITY AWAKENED</button>`;const next=['Tempered','Masterworked','Awakened'][identityRankV14(i)];return`<button onclick="evolveIdentityV14('${i.id}')">${next} • ${cost.gold}g</button>`}

function huntforgeRecipeCardsV131(p){return HUNT_CRAFT_RECIPES_V131.map(r=>{const unlocked=recipeUnlockedV131(p,r),tracked=p.trackedRecipeV131===r.id,st=recipeMaterialStateV131(p,r),can=unlocked&&st.canParts&&st.canGeneric;return `<div class="forgecard huntforge-recipe-v131 ${tracked?'tracked':''}"><b class="rarity-${r.rarity}">${r.name}</b><div class="recipe-source-v131">${MISSIONS[r.missionId]?.name||r.missionId} • ${r.boss}</div><div class="tiny">Guaranteed ${r.rarity.toUpperCase()} Huntset ${slotDisplayTypeV132({type:r.type})}. ${huntforgedReqFamilyV132(r.type)==='weapon'?'Class-defining offensive trait.':huntforgedReqFamilyV132(r.type)==='armor'?'Defensive / anatomy specialization.':'Boss-hunting utility trait.'}</div>${recipeMaterialsHTMLV131(p,r)}${recipePreviewHTMLV131(p,r)}<div class="forge-actions"><button ${can?'':'disabled'} onclick="craftHuntRecipeV131('${r.id}')">${unlocked?'Craft':'Recipe Locked'}</button><button class="recipe-track-v131" onclick="toggleTrackedRecipeV131('${r.id}')">${tracked?'Untrack':'Track'}</button></div></div>`}).join('')}
function recipeSourceHintV131(mid){const r=huntRecipeV131(profile?.trackedRecipeV131);return r?.missionId===mid?`<div class="progression-callout">★ TRACKED CRAFT: ${r.name}</div>`:''}
function recipePreviewItemV131(p,r){const ilvl=Math.max(p.level+4+r.tier*3,8+r.tier*6),mult=r.rarity==='legendary'?2.08:1.78,i={type:r.type,ilvl,rarity:r.rarity,atk:0,def:0,hp:0,affixType:null,affixValue:0,enhance:0};fillItemStatsV132(i,mult);return i}
function recipeProjectedGRV131(p,r){ensureArmoryShapeV132(p);const q=recipePreviewItemV131(p,r),slot=resolveEquipSlotV132(q,p),vals=ARMORY_SLOT_ORDER_V132.map(s=>itemProgressionRating(s===slot?q:p.equipment?.[s])).filter(v=>v>0);return Math.max(0,Math.round(vals.reduce((a,b)=>a+b,0)/Math.max(3,vals.length)))}
function recipePreviewHTMLV131(p,r){const q=recipePreviewItemV131(p,r),eq=comparisonItemForV132(p,q),delta=Math.round(gearScore(q)-gearScore(eq)),gr=gearRating(p),next=recipeProjectedGRV131(p,r);return `<div class="forge-preview-v131"><b>PROJECTED:</b> ${itemStats(q)} • ${delta>=0?'+':''}${delta} power • Gear Rating ${gr} → ${next}</div>`}
function zoneCraftProgressV131(p,mid){const rs=HUNT_CRAFT_RECIPES_V131.filter(r=>r.missionId===mid&&recipeUnlockedV131(p,r));if(!rs.length)return null;let best=null;for(const r of rs){const st=recipeMaterialStateV131(p,r),parts=st.rows.reduce((n,x)=>n+Math.min(x.have,x.need),0),need=st.rows.reduce((n,x)=>n+x.need,0),score=need?parts/need:0;if(!best||score>best.score)best={r,score,parts,need,can:st.canParts&&st.canGeneric}}return best}
function huntRecommendationV131(p,mid){const m=MISSIONS[mid],st=missionUnlockState(p,mid),gr=gearRating(p),out=[];const tracked=huntRecipeV131(p.trackedRecipeV131);if(tracked?.missionId===mid)out.push(['best','★ TRACKED CRAFT SOURCE']);if(!st.locked&&!p.trophies.includes(m.boss.name))out.push(['progress','CAMPAIGN TARGET']);const prog=zoneCraftProgressV131(p,mid);if(prog){if(prog.can)out.push(['best','CRAFT READY AFTER HUNT']);else if(prog.score>=.45)out.push(['farm',`HUNTSET PARTS ${prog.parts}/${prog.need}`]);else out.push(['farm','HUNTFORGED MATERIALS']);}const d=gr-(m.minGear||0);if(st.locked&&gr<(m.minGear||0))out.push(['danger',`UNDERGEARED ${Math.abs(d)} GR`]);else if(!st.locked&&d<=4)out.push(['progress','GOOD POWER MATCH']);return out}
function huntRecommendationHTMLV131(p,mid){const a=huntRecommendationV131(p,mid);return a.length?`<div class="hunt-rec-v131">${a.map(([c,t])=>`<span class="${c}">${t}</span>`).join('')}</div>`:''}
function bossCounterHintV131(e){if(!e)return'';if(e.kind==='direwolf')return e.intent==='pounce'?'Pounce: move away from the marked landing area or Guard.':e.intent==='howl'?'Blood Howl: stay beyond 3 tiles or Guard.':'Break the Scarred Foreleg to weaken Pounce; break Fangs to reduce Maul pressure.';const h={bossgoblin:'Break the Crown to disrupt reinforcements. Spread out when bombs are telegraphed.',mire:'Prioritize Tendrils to cut attack pressure; avoid clustered positions during Spore Bloom.',bossknight:'Break Veyr’s Blade to reduce melee pressure. Guard Judgment telegraphs.',bossdrake:'Break a Wing to weaken mobility. Avoid Frost Breath lanes and Glacial Dive marks.',riftboss:'Break the Choir Core to reduce offensive pressure. Preserve resource for telegraphed chorus turns.',worldeater:'Break siege anatomy to create vulnerability windows. Move out of Rift Eruption / Worldbreak telegraphs.'};return h[e.kind]||''}
function toggleAutoPotionV131(){ensureProfileShape(profile);profile.autoPotionV131=!profile.autoPotionV131;persistProfile();renderProfile();toast(profile.autoPotionV131?'Auto field kit enabled':'Auto field kit disabled')}
function flashSavedV131(){const e=$('saveIndicatorV131');if(!e)return;e.classList.add('show');clearTimeout(flashSavedV131.t);flashSavedV131.t=setTimeout(()=>e.classList.remove('show'),900)}
let inventoryFilterV131={search:'',type:'all',rarity:'all',sort:'power',fav:false};
function itemSearchTextV131(i){return [i.name,i.type,i.rarity,i.setName,i.trait&&V10_ITEM_TRAITS[i.trait]?.name,i.affixType].filter(Boolean).join(' ').toLowerCase()}
function filteredInventoryV131(){const min=inventoryFilterV131.rarity==='all'?-1:V131_RARITY_RANK[inventoryFilterV131.rarity],q=(inventoryFilterV131.search||'').toLowerCase().trim();let a=(profile.inventory||[]).filter(i=>{normalizeItemV132(i);const typeOk=inventoryFilterV131.type==='all'||canonicalItemTypeV132(i.type)===inventoryFilterV131.type;return typeOk&&(min<0||V131_RARITY_RANK[i.rarity]>=min)&&(!inventoryFilterV131.fav||i.favoriteV131)&&(!q||itemSearchTextV131(i).includes(q))});const sort=inventoryFilterV131.sort;if(sort==='ilvl')a.sort((a,b)=>b.ilvl-a.ilvl);else if(sort==='rarity')a.sort((a,b)=>V131_RARITY_RANK[b.rarity]-V131_RARITY_RANK[a.rarity]||b.ilvl-a.ilvl);else if(sort==='name')a.sort((a,b)=>a.name.localeCompare(b.name));else a.sort((a,b)=>gearScore(b)-gearScore(a));return a}
function toggleFavoriteV131(id){const i=profile.inventory.find(x=>x.id===id)||Object.values(profile.equipment).find(x=>x?.id===id);if(!i)return;i.favoriteV131=!i.favoriteV131;persistProfile();renderProfile()}
function toggleLockV131(id){const i=profile.inventory.find(x=>x.id===id)||Object.values(profile.equipment).find(x=>x?.id===id);if(!i)return;i.lockedV131=!i.lockedV131;persistProfile();renderProfile()}
function bulkSalvageJunkV131(){const doomed=profile.inventory.filter(i=>V131_RARITY_RANK[i.rarity]<V131_RARITY_RANK.rare&&!i.lockedV131&&!i.favoriteV131);if(!doomed.length)return toast('No unlocked junk below Rare');let c=0,r=0;doomed.forEach(i=>{c+=Math.max(2,Math.floor(i.ilvl/2))+({common:0,uncommon:2}[i.rarity]||0)});profile.inventory=profile.inventory.filter(i=>!doomed.some(d=>d.id===i.id));profile.materials.common+=c;profile.materials.rare+=r;persistProfile();renderProfile();notifyV11('loot','INVENTORY CLEANED',`${doomed.length} items salvaged • +${c} common`)}
function renderInventoryV131(inv){if(!inv)return;inv.innerHTML='';const list=filteredInventoryV131();if(!list.length){inv.innerHTML='<div class="tiny">No equipment matches these filters.</div>';return}list.forEach(i=>{normalizeItemV132(i);const equipped=comparisonItemForV132(profile,i),slot=resolveEquipSlotV132(i,profile),cmp=gearScore(i)-gearScore(equipped),cls=cmp>1?'compareup':cmp<-1?'comparedown':'compareflat',d=document.createElement('div');d.className=`invrow ${i.favoriteV131?'v131-favorite':''} ${i.lockedV131?'v131-locked':''}`;d.innerHTML=`<div><span class="rarity-${i.rarity}">${i.favoriteV131?'★ ':''}${i.lockedV131?'🔒 ':''}${i.name}</span><div class="tiny">${slotDisplayTypeV132(i)} • iLvl ${i.ilvl} • ${itemStats(i)} • <span class="${cls}">${cmp>1?'▲ upgrade':cmp<-1?'▼ weaker':'≈ sidegrade'}</span></div>${itemEffectTagsHTMLV132(i)}</div><div class="inv-actions-v131"><button onclick="equipRecovered('${i.id}')">Equip${slot?` → ${ARMORY_SLOT_LABEL_V132[slot]}`:''}</button><button onclick="toggleFavoriteV131('${i.id}')">${i.favoriteV131?'★':'☆'}</button><button onclick="toggleLockV131('${i.id}')">${i.lockedV131?'Unlock':'Lock'}</button><button ${i.lockedV131?'disabled':''} onclick="salvageItem('${i.id}')">Salvage</button></div>`;inv.appendChild(d)})}
function wireInventoryToolsV131(){const bind=(id,key,event='change')=>{const e=$(id);if(!e||e._v131)return;e._v131=true;e.addEventListener(event,()=>{inventoryFilterV131[key]=key==='fav'?e.checked:e.value;renderInventoryV131($('profileInventory'))})};bind('inventorySearchV131','search','input');bind('inventoryTypeV131','type');bind('inventoryRarityV131','rarity');bind('inventorySortV131','sort');bind('inventoryFavOnlyV131','fav');const b=$('salvageJunkV131');if(b&&!b._v131){b._v131=true;b.onclick=bulkSalvageJunkV131}}
function fastCampServiceV131(type){if((room||snapshot)?.run)return toast('Camp services are unavailable during a hunt');const o=activeCampObjects().find(x=>x.type===type);if(o)interactCampObject(o)}
function renderCampQuickbarV131(r){const q=$('campQuickbarV131');if(!q)return;q.style.display=profile&&!r?.run&&!worldStateV14()&&!movementOverlayOpen()?'flex':'none'}
function cancelSubmittedActionV131(){const r=room||snapshot,p=r?.run?.players?.[peerId];if(!r?.run||r.run.phase!=='player'||!p?.submitted)return;if(isHost)hostCancelActionV131(peerId);else send({type:'cancelActionV131',peerId})}
function hostCancelActionV131(pid){const run=room?.run,p=run?.players?.[pid];if(!run||run.phase!=='player'||!p?.submitted)return;p.submitted=false;p.pending=null;run.log.push(`${p.name} changed their locked action.`);broadcastSnapshot()}
function cycleTargetV131(dir=1){const run=(room||snapshot)?.run,me=run?.players?.[peerId];if(!run||!me)return;const a=run.enemies.filter(e=>e.hp>0).sort((x,y)=>distanceToEnemy(me,x)-distanceToEnemy(me,y));if(!a.length)return;let idx=a.findIndex(e=>e.id===selectedTargetId);idx=(idx+dir+a.length)%a.length;selectedTargetId=a[idx].id;selectedPartId=a[idx].parts?.find(p=>partTargetable(a[idx],p))?.id||null;toast(`Target: ${a[idx].name}`);renderAll()}
function cyclePartV131(dir=1){const run=(room||snapshot)?.run,e=run?.enemies?.find(x=>x.id===selectedTargetId&&x.hp>0);if(!e?.parts?.length)return toast('Target has no breakable anatomy');const a=e.parts.filter(p=>partTargetable(e,p));if(!a.length)return;let idx=a.findIndex(p=>p.id===selectedPartId);idx=(idx+dir+a.length)%a.length;selectedPartId=a[idx].id;toast(`Aim: ${a[idx].name}`);renderAll()}
function summaryItemActionV131(id,action){const i=profile.inventory.find(x=>x.id===id);if(!i)return toast('Item is no longer in inventory');if(action==='equip')equipRecovered(id);if(action==='favorite')toggleFavoriteV131(id);if(action==='lock')toggleLockV131(id);if(action==='salvage')salvageItem(id);showSummary(lastSummary)}
function repeatHuntV131(){if(!lastSummary)return;if(lastSummary.isWorldSkirmish){if(!lastSummary.success){returnToCampFromSummaryV142();toast('Defeated hunters recover at the Emberwatch bonfire.');return}hide('summaryOverlay');renderAll();toast('Surface secured — exploration resumed in Emberwood.');return}hide('summaryOverlay');if(isHost&&room){room.missionId=lastSummary.missionId;room.delveId=lastSummary.isDelve?(lastSummary.delveId||null):null;room.difficulty=lastSummary.difficulty||'normal';Object.values(room.players).forEach(p=>p.ready=false);renderLobby();show('lobbyOverlay');if(Object.keys(room.players).length===1){room.players[peerId].ready=true;launchExpedition()}else toast('Same hunt selected — ready up for the rematch')}else if(room||snapshot){show('lobbyOverlay');toast('Party leader must relaunch the hunt')}}
function continueCampaignV131(){if(!profile)return;hide('summaryOverlay');const next=Object.entries(MISSIONS).find(([mid,m])=>!profile.trophies.includes(m.boss.name)&&!missionUnlockState(profile,mid).locked);if(isHost&&room&&next){resetToEmberwatchV142();room.missionId=next[0];Object.values(room.players).forEach(p=>p.ready=false);broadcastSnapshot();show('lobbyOverlay');toast(`Next hunt: ${next[1].name}`)}else{if(!isHost&&(room||snapshot)?.worldV14){returnToCampPendingV142=true;send({type:'returnToCampV142',peerId})}show('lobbyOverlay');toast(next?`Next objective: ${next[1].name}`:nextCampaignObjective(profile))}}

function newProfile(name,classId){
  const starterNames={warden:'Militia Broadsword',berserker:'Woodcutter Greataxe',ranger:'Ashwood Bow',arcanist:'Apprentice Emberstaff',templar:'Temple Mace',shadow:'Twin Iron Knives'};
  const weapon={id:uid(),type:'weapon',ilvl:1,rarity:'common',name:`Worn ${starterNames[classId]}`,atk:3,def:0,hp:0,affixType:null,affixValue:0,enhance:0,value:8};
  const armor={id:uid(),type:'chest',ilvl:1,rarity:'common',name:'Worn Camp Leathers',atk:0,def:1,hp:5,affixType:null,affixValue:0,enhance:0,value:8};
  return {
    id:uid(),name,classId,level:1,xp:0,gold:50,materials:{common:0,rare:0},
    classMastery:{[classId]:0},skillXp:{[classId]:{s1:0,s2:0}},talents:[],ascentNodes:[],
    inventory:[],equipment:{head:null,shoulders:null,chest:armor,gloves:null,boots:null,weapon,offhand:null,ring1:null,ring2:null,necklace:null,armor:null,charm:null},discoveredDelvesV132:['embercellar'],contractTiers:{},relicsFound:[],mythicsFound:[],monsterMastery:{},monsterParts:{},nemeses:{},trophies:[],bestScores:{},bestTimes:{},loadouts:{},selectedSpec:null,ascension:0,ashMarks:0,deathCache:null,dropPity:{relic:0,mythic:0},companyName:null,companyClaims:{},titles:['Hunter'],selectedTitle:'Hunter',wagerStats:{hands:0,wins:0,losses:0,net:0,bestWin:0,perfects:0},merchantStocks:{},settlementReceiptsV145:[],worldRewardReceiptsV145:[],
    lifetime:{runs:0,success:0,wipes:0,bosses:0,kills:0,elites:0,bestDepth:0,totalDepths:0}
  };
}
function xpNext(level){return Math.round(100+level*35+level*level*18)}
function masteryLevel(xp){return 1+Math.floor(Math.sqrt((xp||0)/120))}
function masteryNext(lvl){return Math.pow(lvl,2)*120}
function skillLevel(xp){return 1+Math.floor(Math.sqrt((xp||0)/70))}
function talentPoints(p){return Math.floor((masteryLevel(p.classMastery[p.classId]||0)-1)/2)}
function availableTalentPoints(p){return Math.max(0,talentPoints(p)-(p.talents||[]).length)}
function hasTalent(id){return !!profile?.talents?.includes(id)}

function hunterScore(p){
  const l=p.lifetime||{};return (p.level||1)*6+(l.success||0)*14+(l.bosses||0)*22+(l.kills||0)+masteryLevel(p.classMastery?.[p.classId]||0)*8;
}
function hunterRank(p){
  const n=hunterScore(p);
  if(n>=650)return['Rift Hunter','V'];
  if(n>=400)return['Ash Warden','IV'];
  if(n>=240)return['Monster Slayer','III'];
  if(n>=120)return['Tracker','II'];
  return['Initiate','I'];
}
function ensureProfileShape(p){
  SAVE_SYSTEM.normalizeProfileV014(p,{clone:false});
  p.materials=p.materials||{common:0,rare:0};p.materials.common=p.materials.common||0;p.materials.rare=p.materials.rare||0;
  p.classMastery=p.classMastery||{[p.classId]:0};p.skillXp=p.skillXp||{[p.classId]:{s1:0,s2:0}};
  p.skillXp[p.classId]=p.skillXp[p.classId]||{s1:0,s2:0};p.talents=p.talents||[];p.ascentNodes=p.ascentNodes||[];p.inventory=p.inventory||[];p.trackedRecipeV131=p.trackedRecipeV131||null;p.loadoutNamesV131=p.loadoutNamesV131||{};p.autoPotionV131=!!p.autoPotionV131;
  p.equipment=p.equipment||{weapon:null,armor:null,charm:null};p.discoveredDelvesV132=p.discoveredDelvesV132||['embercellar'];p.huntQuestClaims=p.huntQuestClaims||{};p.contractTiers=p.contractTiers||{};p.relicsFound=p.relicsFound||[];p.mythicsFound=p.mythicsFound||[];p.monsterMastery=p.monsterMastery||{};p.monsterParts=p.monsterParts||{};p.nemeses=p.nemeses||{};p.trophies=p.trophies||[];p.bestScores=p.bestScores||{};p.bestTimes=p.bestTimes||{};p.loadouts=p.loadouts||{};p.selectedSpec=p.selectedSpec||null;p.ascension=p.ascension||0;p.ashMarks=p.ashMarks||0;p.deathCache=p.deathCache||null;p.dropPity=p.dropPity||{relic:0,mythic:0};p.companyName=p.companyName||null;p.companyClaims=p.companyClaims||{};p.titles=p.titles||['Hunter'];p.selectedTitle=p.selectedTitle||'Hunter';p.wagerStats=p.wagerStats||{hands:0,wins:0,losses:0,net:0,bestWin:0,perfects:0};p.merchantStocks=p.merchantStocks||{};
  p.lifetime=p.lifetime||{};Object.assign(p.lifetime,{runs:p.lifetime.runs||0,success:p.lifetime.success||0,wipes:p.lifetime.wipes||0,bosses:p.lifetime.bosses||0,kills:p.lifetime.kills||0,elites:p.lifetime.elites||0,bestDepth:p.lifetime.bestDepth||0,totalDepths:p.lifetime.totalDepths||0,huntStreak:p.lifetime.huntStreak||0,bestStreak:p.lifetime.bestStreak||0,flawless:p.lifetime.flawless||0,nemesisKills:p.lifetime.nemesisKills||0,partsBroken:p.lifetime.partsBroken||0});
  ensureArmoryShapeV132(p);
}
function contractMetric(p,c){return p.lifetime?.[c.metric]||0}
function contractTarget(p,c){const tier=p.contractTiers?.[c.id]||0;return c.base+tier*c.step}
function claimContract(cid){
  const c=CONTRACTS.find(x=>x.id===cid);if(!c||!profile)return;
  const target=contractTarget(profile,c),metric=contractMetric(profile,c);if(metric<target)return toast('Contract not complete yet');
  profile.contractTiers[c.id]=(profile.contractTiers[c.id]||0)+1;
  profile.gold+=(c.rewardGold||0)+Math.floor((profile.contractTiers[c.id]-1)*20);
  profile.materials.common+=c.rewardCommon||0;profile.materials.rare+=c.rewardRare||0;
  persistProfile();renderProfile();toast(`${c.name} claimed — next tier unlocked`)
}
function enhanceGear(slot){
  const i=profile?.equipment?.[slot];if(!i)return toast('Equip an item first');
  i.enhance=i.enhance||0;if(i.enhance>=5)return toast('That item is already Masterwork +5');
  const n=i.enhance+1,gold=35+i.ilvl*4+i.enhance*30,common=4+i.enhance*3,rare=n>=4?1:0;
  if(profile.gold<gold||profile.materials.common<common||profile.materials.rare<rare)return toast(`Need ${gold}g, ${common} common${rare?`, ${rare} rare`:''}`);
  profile.gold-=gold;profile.materials.common-=common;profile.materials.rare-=rare;i.enhance=n;
  if(i.atk)i.atk+=Math.max(1,Math.ceil(i.ilvl*.035));
  if(i.def)i.def+=Math.max(1,Math.ceil(i.ilvl*.018));
  if(i.hp)i.hp+=Math.max(1,Math.ceil(i.ilvl*.08));
  persistProfile();renderProfile();if(n===5)notifyV11('loot','MASTERWORK COMPLETE',`${i.name} reached +5.`,{life:6000});else toast(`${i.name} enhanced to +${n}`)
}
function salvageItem(iid){
  const idx=profile.inventory.findIndex(i=>i.id===iid);if(idx<0)return;
  const i=profile.inventory[idx];if(i.lockedV131)return toast('Unlock this item before salvaging');const common=Math.max(2,Math.floor(i.ilvl/2))+({common:0,uncommon:2,rare:4,epic:7,legendary:11,relic:18}[i.rarity]||0),rare=({common:0,uncommon:0,rare:1,epic:2,legendary:4,relic:7}[i.rarity]||0);
  profile.inventory.splice(idx,1);profile.materials.common+=common;profile.materials.rare+=rare;persistProfile();renderProfile();toast(`Salvaged: +${common} common${rare?`, +${rare} rare`:''}`)
}
function craftGear(type){
  if(!profile)return;type=canonicalItemTypeV132(type);const costG=95+profile.level*7,costC=16,costR=1;
  if(profile.gold<costG||profile.materials.common<costC||profile.materials.rare<costR)return toast(`Crafting needs ${costG}g, ${costC} common, ${costR} rare`);
  const profileBeforeCraft=structuredCloneSafe(profile);profile.gold-=costG;profile.materials.common-=costC;profile.materials.rare-=costR;
  const ilvl=Math.max(2,Math.round(profile.level*.72+3)),rarity=chance(.20)?'rare':'uncommon',mult=rarity==='rare'?1.34:1.14,base=baseForItemTypeV132(type,profile.classId),aff=pick(AFFIXES);
  const i={id:uid(),type,ilvl,rarity,name:`${rarity==='rare'?'Runed':'Huntsmith'} ${base} ${aff[0]}`,atk:0,def:0,hp:0,affixType:aff[1],affixValue:aff[2],enhance:0,zoneId:'crafted'};
  fillItemStatsV132(i,mult);i.value=Math.round(ilvl*7*mult);profile.inventory.push(i);if(!persistProfile()){profile=profileBeforeCraft;renderProfile();return false}renderProfile();toast(`${i.name} crafted — reliable slot filler; Huntforged boss gear is the main power path.`);return i
}


function setBonuses(p){const counts={};Object.values(p.equipment||{}).filter(Boolean).forEach(i=>{if(i.setId)counts[i.setId]=(counts[i.setId]||0)+1});const b={atk:0,def:0,hp:0,crit:0,dodge:0,leech:0};Object.entries(counts).forEach(([id,n])=>{if(id==='direfang'){if(n>=2)b.crit+=.05;if(n>=3)b.dodge+=.05}if(id==='gutter'){if(n>=2)b.atk+=4;if(n>=3)b.leech+=.05}if(id==='mire'){if(n>=2)b.hp+=20;if(n>=3)b.def+=3}if(id==='ashbound'){if(n>=2)b.def+=4;if(n>=3)b.atk+=3}if(id==='frost'){if(n>=2)b.hp+=25;if(n>=3)b.crit+=.04}if(id==='choir'){if(n>=2){b.crit+=.05;b.dodge+=.05}if(n>=3){b.atk+=6;b.def+=4}}if(id==='world'){if(n>=2){b.hp+=30;b.atk+=4}if(n>=3){b.def+=6;b.crit+=.05}}});return b}
function masteryTier(k){const n=k||0;return n>=100?6:n>=50?5:n>=25?4:n>=10?3:n>=5?2:n>=1?1:0}
function masteryDamageMult(p,e){return 1+masteryTier(p.monsterMastery?.[e.kind]?.kills||0)*.01}
function boonById(id){return RUN_BOONS.find(b=>b.id===id)}
function boonValue(p,key,base=(key==='damage'||key==='heal')?1:0){return(p.boons||[]).reduce((v,id)=>{const b=boonById(id);if(!b)return v;if(key==='damage'&&b.damage)v*=b.damage;else if(key==='heal'&&b.heal)v*=b.heal;else if(b[key])v+=b[key];return v},base)}
function specDamageMult(p,e,skill=''){const s=p.selectedSpec;if(s==='vanguard')return 1.06;if(s==='reaver'&&skill==='cleave')return 1.10;if(s==='beaststalker'&&(e.elite||e.boss))return 1.10;if(s==='spellbreaker')return 1.07;if(s==='starcaller'&&skill==='starfall')return 1.12;if(s==='dawnbringer'&&skill==='smite')return 1.12;if(s==='assassin'&&skill==='backstab')return 1.12;return 1}
function specDodge(p){return p.selectedSpec==='trapper'?.07:p.selectedSpec==='ghost'?.09:0}
function specHeal(p){return (p.selectedSpec==='lifebinder'?1.18:1)*(1+(ascentEffectsV11(p).healing||0))}
function specHpMult(p){return['commander','juggernaut','aegis'].includes(p.selectedSpec)?1.10:1}
function specDefBonus(p){return p.selectedSpec==='guardian'?Math.max(1,Math.round((p.def||0)*.05)):0}
function equippedRelicOrMythicPowers(p){return Object.values(p?.equipment||{}).filter(i=>(i?.rarity==='relic'||i?.rarity==='mythic')&&i.relicPower).map(i=>i.relicPower)}
function mythicDropChance(e,run){let r=e?.boss?.0015:e?.elite?.00008:.000005;if(run?.difficulty==='nightmare')r*=1.5;if(run?.modifier?.id==='treasure')r*=1.4;return r}
function generateMythic(p,e){const spec=pick(MYTHICS[p.classId]),pow=RELIC_POWERS[p.classId].find(x=>x[0]===spec[2])||RELIC_POWERS[p.classId][0],run=room?.run||snapshot?.run,depth=run?.depth||1,ilvl=Math.max(18,p.level+depth*4+(e?.boss?10:5));const i={id:uid(),type:spec[1],ilvl,rarity:'mythic',name:spec[0],atk:0,def:0,hp:0,affixType:null,affixValue:0,enhance:3,classLock:p.classId,relicPower:pow[0],relicPowerName:pow[1],relicPowerDesc:pow[2],mythicKey:`${p.classId}:${spec[0]}`};if(i.type==='weapon')i.atk=Math.round((10+ilvl*1.3)*2.55);if(i.type==='armor'){i.def=Math.round((6+ilvl*.72)*2.35);i.hp=Math.round((18+ilvl*2.1)*2.2)}if(i.type==='charm'){i.atk=Math.round((4+ilvl*.5)*2.25);i.def=Math.round((3+ilvl*.4)*2.25);i.hp=Math.round((12+ilvl*1.2)*2.15)}i.value=ilvl*55;return normalizeItemV132(i)}
function makeEnemyParts(e){const defs=(e.kind==='worldeater'&&!e.boss)?[]:(PART_DEFS[e.kind]||[]);e.parts=defs.map(([id,name,key,label,ratio,effect])=>({id,name,key,label,maxHp:Math.max(6,Math.round(e.maxHp*ratio)),hp:Math.max(6,Math.round(e.maxHp*ratio)),broken:false,effect}));return e}
function partTargetable(e,part){return !!part&&!part.broken&&!(e?.kind==='worldeater'&&part.id==='heart'&&!e.heartExposed)}
function namedPartName(key){for(const defs of Object.values(PART_DEFS))for(const d of defs)if(d[2]===key)return d[3];for(const v of Object.values(KILL_MATS))if(v[0]===key)return v[1];return key.replaceAll('_',' ')}
function grantNamedPart(run,key,qty=1){Object.values(run.players).filter(p=>!p.dead).forEach(p=>{p.runLoot.namedParts[key]=(p.runLoot.namedParts[key]||0)+qty})}
function damagePart(run,p,e,dmg,preferred=null){if(!e.parts?.length)return;let part=preferred&&e.parts.find(x=>x.id===preferred&&partTargetable(e,x));if(!part)part=e.parts.find(x=>partTargetable(e,x));if(!part)return;part.hp-=Math.max(1,Math.round(dmg*.62*(1+(ascentEffectsV11(p).partDamage||0))));if(part.hp<=0&&!part.broken){part.broken=true;part.hp=0;p.combat.parts++;p.runLoot.partsByKind[e.kind]=(p.runLoot.partsByKind[e.kind]||0)+1;grantNamedPart(run,part.key,1);if(part.effect==='atk')e.atk=Math.max(1,Math.round(e.atk*.88));if(part.effect==='def')e.def=Math.max(0,e.def-2);if(part.effect==='slow')e.slowed=true;if(e.kind==='worldeater'&&part.id==='horn'){e.status.stagger=1;e.raidVulnerability=Math.max(e.raidVulnerability||0,2);run.log.push('⚡ HORN SHATTERED — The 75% carapace lock is broken. The World Eater is staggered and vulnerable!')}if(e.kind==='worldeater'&&part.id==='heart'){e.heartBroken=true;e.raidVulnerability=Math.max(e.raidVulnerability||0,4);e.def=Math.max(0,e.def-4);run.log.push('✦ ABYSSAL HEART BROKEN — the 25% final-phase lock collapses and a massive damage window opens!')}if(e.kind==='direwolf'&&part.id==='foreleg'){e.slowed=true;e.cooldowns=e.cooldowns||{};e.cooldowns.pounce=Math.max(e.cooldowns.pounce||0,2);run.log.push('⚡ FORELEG BROKEN — Direfang’s pounce range is reduced and its recovery slows.')}if(e.kind==='direwolf'&&part.id==='fang'){e.cooldowns=e.cooldowns||{};e.cooldowns.rend=Math.max(e.cooldowns.rend||0,3);run.log.push('⚡ FANGS BROKEN — Rending Maul becomes less frequent.')}if(e.kind==='bossgoblin'&&part.id==='crown'){e.noAdds=true;run.log.push('⚡ CROWN SHATTERED — the Gutter King can no longer call organized reinforcements.')}pushCombatFloaterEntity(e,'BREAK!','#ffd16e',15,1150);pushCombatFeed('crit',p.name,null,`BROKE ${part.name.toUpperCase()}`);const q=combatPointEntity(e);emitWorldFx('spark',q.x,q.y,'#ffd16e',18,520);shakeScreen(e.boss?5:3,150);run.log.push(`✦ ${p.name} BREAKS ${e.name}'s ${part.name}! +${part.label}`);if(e.boss)notifyV11('break','ANATOMY BROKEN',`${e.name} — ${part.name}`,{life:4200})}}
function applyPlayerDamage(run,p,e,dmg,partId=null,skill=''){
  awakenEnemyV132(run,e,`${p.name} struck it`);
  let final=Math.max(1,Math.round(dmg*boonValue(p,'damage',1)*specDamageMult(p,e,skill)*masteryDamageMult(p,e)*gearTraitDamageMultV10(p,e,skill)*ascentDamageMultV11(p,e,skill))),partDamage=0,gateLabel=null;
  if(e.kind==='worldeater'&&e.boss){
    const horn=e.parts?.find(x=>x.id==='horn'),heart=e.parts?.find(x=>x.id==='heart');
    if(horn&&!horn.broken)final=Math.max(1,Math.round(final*.82));
    if(e.heartExposed&&heart&&!heart.broken&&partId!=='heart')final=Math.max(1,Math.round(final*.72));
    if(e.raidVulnerability>0)final=Math.round(final*1.28);if(partId==='heart'&&e.heartExposed&&!e.heartBroken)final=Math.round(final*1.22);
    partDamage=final;
    const gateRatio=horn&&!horn.broken?.75:(e.heartExposed&&heart&&!heart.broken?.25:0);
    if(gateRatio){const floor=Math.ceil(e.maxHp*gateRatio),allowed=Math.max(0,e.hp-floor);if(final>allowed){final=allowed;gateLabel=gateRatio===.75?'CARAPACE LOCK':'HEART WARD'}}
  }else partDamage=final;
  partDamage=Math.round(partDamage*gearTraitPartMultV10(p));e.lastDamagerPeer=p.peerId;e.hp-=final;e.hitFlash=Date.now();p.combat.damage+=final;damagePart(run,p,e,partDamage,partId);if(skill==='attack'&&hasGearTraitV10(p,'bloodletter')&&chance(.28))e.status.bleed=Math.max(e.status.bleed||0,2);
  const color=CLASS_FX_COLOR[p.classId]||'#eaf2ff';if(final>0){pushCombatFloaterEntity(e,final,color,12,820);pushCombatFeed('hit',p.name,final,skill&&skill!=='attack'?skill.toUpperCase():'')}else if(gateLabel){pushCombatFloaterEntity(e,gateLabel,'#ffd16e',12,900);pushCombatFeed('crit',e.name,null,gateLabel)}
  const pt=combatPointEntity(e);emitWorldFx('spark',pt.x,pt.y,color,Math.min(12,4+Math.round(Math.max(1,final)/20)),400);if(final>=Math.max(20,p.atk*1.7)){shakeScreen(2.5,100);addRingFx(pt.x,pt.y,color,18,320,2);pulseStageV13('crit')}
  return final
}
function trackHealing(p,n){const v=Math.max(0,n);p.combat.healing+=v;if(v>0)pushCombatFeed('heal',p.name,v,'HEAL')}
function runCritBonus(p){return boonValue(p,'crit',0)}
function runLeechBonus(p){return boonValue(p,'leech',0)}
function runDefBonus(p){return boonValue(p,'def',0)+specDefBonus(p)}
function buildNemesisName(){return `${pick(NEMESIS_NAMES_A)} ${pick(NEMESIS_NAMES_B)}`}
function topNemesis(p){ensureProfileShape(p);return Object.values(p.nemeses||{}).sort((a,b)=>b.rank-a.rank)[0]||null}
function updateTitles(p){const add=t=>{if(!p.titles.includes(t))p.titles.push(t)};add('Hunter');if((p.monsterMastery.wolf?.kills||0)>=50)add('Wolfbane');if(p.lifetime.flawless>=5)add('The Unbroken');if(p.relicsFound.length>=5)add('Relic Seeker');if(p.mythicsFound.length)add('Myth-Bearer');if(p.lifetime.nemesisKills>=5)add('Nemesis');if(p.lifetime.bestStreak>=10)add('Unstoppable');if(p.ascension>=1)add('Ascended');if((p.trophies||[]).includes('The World Eater'))add('Worldbreaker');if(!p.titles.includes(p.selectedTitle))p.selectedTitle='Hunter'}
function seasonScore(p){return hunterScore(p)+(p.lifetime.bestStreak||0)*18+(p.lifetime.flawless||0)*25+Object.values(p.bestScores||{}).reduce((m,n)=>Math.max(m,n||0),0)/100}
function dailyHunt(){const d=new Date(),key=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;let h=0;for(const c of key)h=(h*31+c.charCodeAt(0))>>>0;const ids=Object.keys(MISSIONS);return{key,missionId:ids[h%ids.length],bonus:1.25}}
function craftMonsterSet(setId,type){type=canonicalItemTypeV132(type);const r=HUNT_CRAFT_RECIPES_V131.find(x=>x.setId===setId&&x.type===type);if(r)return craftHuntRecipeV131(r.id);toast('No Huntforged recipe found for that set')}
function ascendHunter(){if(profile.level<30)return toast('Reach Level 30 to Ascend');if(!confirm('Ascend to Level 1? Gear, mastery, Relics, materials and records remain.'))return;profile.level=1;profile.xp=0;profile.ascension++;profile.ashMarks++;updateTitles(profile);persistProfile();renderProfile();toast(`ASCENSION ${profile.ascension} — Ash Mark earned`)}
function saveLoadout(slot){ensureProfileShape(profile);const gear={};ARMORY_SLOT_ORDER_V132.forEach(s=>gear[s]=profile.equipment?.[s]?.id||null);profile.loadouts[slot]={gear,spec:profile.selectedSpec,talents:[...(profile.talents||[])],ascentNodes:[...(profile.ascentNodes||[])]};persistProfile();renderProfile();toast(`${profile.loadoutNamesV131?.[slot]||`Loadout ${slot}`} saved`)}
function renameLoadoutV131(slot){ensureProfileShape(profile);const n=prompt('Name this loadout:',profile.loadoutNamesV131[slot]||`Loadout ${slot}`);if(!n?.trim())return;profile.loadoutNamesV131[slot]=n.trim().slice(0,20);persistProfile();renderProfile()}
function loadLoadout(slot){const l=profile.loadouts[slot];if(!l)return toast('That loadout is empty');ensureProfileShape(profile);const all=[...profile.inventory,...armoryOccupiedItemsV132(profile)],by=new Map(all.map(i=>[i.id,i]));const legacyGear=l.gear||{weapon:l.weapon||null,chest:l.chest||l.armor||null,necklace:l.necklace||l.charm||null};const desired={};ARMORY_SLOT_ORDER_V132.forEach(s=>desired[s]=legacyGear[s]?by.get(legacyGear[s]):null);const missing=ARMORY_SLOT_ORDER_V132.some(s=>legacyGear[s]&&!desired[s]);if(missing)return toast('A saved item is no longer owned');const treeDiff=JSON.stringify([...(l.ascentNodes||[])].sort())!==JSON.stringify([...(profile.ascentNodes||[])].sort())||JSON.stringify([...(l.talents||[])].sort())!==JSON.stringify([...(profile.talents||[])].sort());if(treeDiff){const g=120+profile.level*6,r=1;if(profile.gold<g||profile.materials.rare<r)return toast(`Build swap requires ${g}g and ${r} rare for retraining`);if(!confirm(`This preset changes your skill tree. Retrain for ${g}g and ${r} rare material?`))return;profile.gold-=g;profile.materials.rare-=r;profile.talents=[...(l.talents||profile.talents)];profile.ascentNodes=[...(l.ascentNodes||profile.ascentNodes)]}const used=new Set(Object.values(desired).filter(Boolean).map(i=>i.id));profile.equipment={...desired,armor:null,charm:null};Object.entries(desired).forEach(([s,i])=>{if(i)normalizeItemV132(i,s)});profile.inventory=all.filter(i=>!used.has(i.id));profile.selectedSpec=l.spec||profile.selectedSpec;persistProfile();renderProfile();notifyV11('skill','LOADOUT EQUIPPED',profile.loadoutNamesV131?.[slot]||`Loadout ${slot}`)}
function copyBuildCode(){const data={name:profile.name,class:profile.classId,spec:profile.selectedSpec,talents:profile.talents,ascent:profile.ascentNodes||[],equipment:Object.fromEntries(Object.entries(profile.equipment).map(([k,i])=>[k,i?{name:i.name,ilvl:i.ilvl,rarity:i.rarity}:null]))};const code=btoa(unescape(encodeURIComponent(JSON.stringify(data))));navigator.clipboard?.writeText(`ASHFALL-${code}`).then(()=>toast('Build code copied')).catch(()=>toast('Build code generated'))}

function profilePower(p){
  let atk=0,def=0,hp=0,crit=0,dodge=0,leech=0;
  Object.values(p.equipment||{}).filter(Boolean).forEach(i=>{
    atk+=i.atk||0;def+=i.def||0;hp+=i.hp||0;
    if(i.affixType==='atk')atk+=i.affixValue;if(i.affixType==='def')def+=i.affixValue;if(i.affixType==='hp')hp+=i.affixValue;
    if(i.affixType==='crit')crit+=i.affixValue;if(i.affixType==='dodge')dodge+=i.affixValue;if(i.affixType==='leech')leech+=i.affixValue;
  });const traits=equippedGearTraitsV10(p);if(traits.includes('iron_skin'))def+=3;if(traits.includes('bulwark_grip'))def+=2;if(traits.includes('swiftstep'))dodge+=.05;if(traits.includes('surefooted'))dodge+=.04;if(traits.includes('battle_focus'))crit+=.05;const sb=setBonuses(p);atk+=sb.atk;def+=sb.def;hp+=sb.hp;crit+=sb.crit;dodge+=sb.dodge;leech+=sb.leech;
  return{atk,def,hp,crit,dodge,leech};
}

function equippedRelicPowers(p){return equippedRelicOrMythicPowers(p)}
function hasRelic(p,id){return !!p?.relicPowers?.includes(id)}
function effectiveRange(p){let r=CLASSES[p.classId].range;if(p.classId==='ranger'&&(hasRelic(p,'longwatch')||p.selectedSpec==='marksman'))r+=1;if(p.classId==='warden'&&hasRelic(p,'guardian_range'))r=Math.max(r,2);if(hasGearTraitV10(p,'longreach')&&['ranger','arcanist'].includes(p.classId))r+=1;if(p.classId==='arcanist'&&hasGearTraitV10(p,'piercing_lance'))r+=1;r+=ascentEffectsV11(p).range||0;return r}
function relicDropChance(e,run){let rate=e?.boss?.02:e?.elite?.0015:.0001;if(run?.difficulty==='nightmare')rate*=1.75;if(run?.modifier?.id==='treasure')rate*=1.6;return Math.min(.08,rate)}
function generateRelic(p,e){const cls=p.classId,base=pick(CLASS_RELIC_BASES[cls]),epi=pick(RELIC_EPITHETS),pow=pick(RELIC_POWERS[cls]),run=room?.run||snapshot?.run,mid=run?.missionId||'frontier',tier={frontier:4,hollow:9,gloam:14,keep:19,frost:24,rift:29,worldeater:34}[mid]||4;const ilvl=Math.max(6,Math.round(tier+p.level*.35+(e?.boss?2:e?.elite?1:0)+(run?.difficulty==='nightmare'?2:run?.difficulty==='veteran'?1:0)));const i={id:uid(),type:base[1],ilvl,rarity:'relic',name:`${base[0]} ${epi}`,atk:0,def:0,hp:0,affixType:null,affixValue:0,enhance:0,classLock:cls,relicPower:pow[0],relicPowerName:pow[1],relicPowerDesc:pow[2],relicKey:`${cls}:${base[0]}:${epi}:${pow[0]}`};if(i.type==='weapon')i.atk=Math.round((7+ilvl*1.18)*2.25);if(i.type==='armor'){i.def=Math.round((4+ilvl*.62)*2.05);i.hp=Math.round((12+ilvl*1.8)*2)}if(i.type==='charm'){i.atk=Math.round((2+ilvl*.44)*2);i.def=Math.round((2+ilvl*.34)*2);i.hp=Math.round((8+ilvl*1.05)*2)}i.value=Math.round(ilvl*22);return normalizeItemV132(i)}
function syncRoomProfile(){if(!profile||!roomCode||room?.run||snapshot?.run)return;const payload=playerJoinPayload();if(isHost&&room?.players?.[peerId]){const old=room.players[peerId],campX=old.campX,campY=old.campY,worldX=old.worldX,worldY=old.worldY,facing=old.facing,ready=old.ready,prep=old.prep||{},connected=old.connected;room.players[peerId]={...payload,campX,campY,worldX,worldY,facing,ready,prep,connected};broadcastSnapshot()}else if(bc)send({type:'profileSync',player:payload})}

function createRunPlayer(join){
  const c=CLASSES[join.classId],pow=join.power||{},mastery=join.mastery||1,asc=ascentEffectsV11(join);
  let maxHp=Math.round((c.hp+(join.level-1)*7+(pow.hp||0))*(1+(mastery-1)*.01));
  let maxRes=c.maxRes;
  if(join.classId==='warden'&&join.talents?.includes('ironwall'))maxHp=Math.round(maxHp*1.12);
  if(join.classId==='arcanist'&&join.talents?.includes('well'))maxRes+=4;if((join.gearTraits||[]).includes('resource_well'))maxRes+=3;if((join.gearTraits||[]).includes('resonant_focus'))maxRes+=2;if((join.gearTraits||[]).includes('warding'))maxHp=Math.round(maxHp*1.08);if((join.gearTraits||[]).includes('vital_guard'))maxHp=Math.round(maxHp*1.06);
  if(join.relicPowers?.includes('hearthguard')||join.relicPowers?.includes('holy_vigor'))maxHp=Math.round(maxHp*1.10);if(join.relicPowers?.includes('deathless'))maxHp=Math.round(maxHp*1.08);if(join.relicPowers?.includes('manaheart'))maxRes+=4;maxRes+=asc.maxRes||0;maxHp=Math.round(maxHp*specHpMult(join)*(1+(join.ascension||0)*.01)*(1+(asc.hp||0)));
  return {
    peerId:join.peerId,name:join.name,classId:join.classId,level:join.level,mastery,gearRating:join.gearRating||0,gearTraits:join.gearTraits||[],
    talents:join.talents||[],ascentNodes:join.ascentNodes||[],skillLevels:join.skillLevels||{s1:1,s2:1},power:pow,relicPowers:join.relicPowers||[],monsterMastery:join.monsterMastery||{},selectedSpec:join.selectedSpec,ascension:join.ascension||0,nemesisSeed:join.nemesisSeed||null,deathCache:join.deathCache||null,dropPity:structuredCloneSafe(join.dropPity||{relic:0,mythic:0}),boons:[],
    x:2,y:2,facing:join.facing||'south',maxHp,hp:maxHp,atk:Math.round((c.atk+(join.level-1)*2+(pow.atk||0))*(1+(join.ascension||0)*.01)),def:Math.round((c.def+Math.floor((join.level-1)/2)+(pow.def||0))*(1+(join.ascension||0)*.01)+(asc.def||0)),
    res:maxRes,maxRes,downs:0,downed:false,dead:false,downedAt:null,deadAt:null,guarding:false,retaliation:false,
    status:{poison:0,burn:0,bleed:0,partyDef:0,closingGuard:0},potions:3+(join.prep?.healer?1:0)+(join.prep?.merchantPotions||0)+(join.autoPotionV131?1:0),xpMult:join.prep?.feast?1.08:1,submitted:false,
    runLoot:{xp:0,mastery:0,skill1:0,skill2:0,gold:0,common:0,rare:0,kills:0,bosses:0,elites:0,items:[],secureId:null,namedParts:{},killsByKind:{},partsByKind:{},nemesisDefeated:[]},combat:{damage:0,healing:0,revives:0,parts:0},
    secondLightUsed:false,frenzyCharges:0,quickUsed:false,visualAction:null
  };
}


function saveMutationBlockedV144(){return !!(roomCode||room||snapshot)}
function saveFileStampV144(){return new Date().toISOString().replace(/[:.]/g,'-')}
function downloadLocalSaveV144(filename,text,type='application/json'){
  const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0)
}
function setSaveTransferStatusV144(message,tone=''){
  const status=$('saveTransferStatusV144');if(!status)return;status.textContent=message;status.classList.toggle('warn',tone==='warn');status.classList.toggle('bad',tone==='bad')
}
function clearPendingSaveImportV144(resetStatus=false){
  pendingProfileImportV144=null;const actions=$('saveImportCommitV144'),input=$('saveImportInputV144');if(actions)actions.hidden=true;if(input)input.value='';if(resetStatus)updateSaveTransferUiV144()
}
function updateSaveTransferUiV144(state=profileStorageStateV144||readProfileStorageV144()){
  const recovery=SAVE_SYSTEM.readRecovery(localStorage),blocked=saveMutationBlockedV144(),restore=$('saveRestoreV144'),importBtn=$('saveImportV144'),createBtn=$('createCharacterBtn');
  if(restore){restore.disabled=!recovery.ok||blocked;restore.title=blocked?'Leave the active room before restoring local saves.':recovery.ok?`${recovery.count} hunter snapshot from ${recovery.envelope.savedAt}`:'No automatic recovery snapshot exists yet.'}
  if(importBtn){importBtn.disabled=blocked;importBtn.title=blocked?'Leave the active room before importing local saves.':'Preview a local ASHFALL JSON backup.'}
  if(createBtn)createBtn.disabled=!state.ok;
  if(!state.ok){setSaveTransferStatusV144(`${state.message} Export preserves the unreadable bytes; normal writes are blocked.`, 'bad');return}
  const count=Object.keys(state.profiles||{}).length,snapshot=recovery.ok?` Recovery snapshot: ${recovery.count} hunter${recovery.count===1?'':'s'}.`:'';setSaveTransferStatusV144(`${count} hunter${count===1?'':'s'} stored locally.${snapshot}${blocked?' Leave the active room before import or restore.':''}`,blocked?'warn':'')
}
function exportHuntersV144(){
  const state=readProfileStorageV144();if(!state.ok){if(typeof state.raw==='string'){downloadLocalSaveV144(`ASHFALL-unreadable-save-${saveFileStampV144()}.txt`,state.raw,'text/plain');setSaveTransferStatusV144('Unreadable local save bytes exported exactly. Recovery and normal writes remain blocked until you restore a valid snapshot.','warn')}else setSaveTransferStatusV144(state.message,'bad');return}
  const exported=SAVE_SYSTEM.stringifyExport(state.profiles);if(!exported.ok){setSaveTransferStatusV144(exported.message,'bad');return}downloadLocalSaveV144(`ASHFALL-Huntbound-save-${saveFileStampV144()}.json`,exported.text);setSaveTransferStatusV144(`Exported ${Object.keys(state.profiles).length} local hunter${Object.keys(state.profiles).length===1?'':'s'}.`)
}
function previewProfileImportV144(profiles,source='backup',kind='import'){
  if(saveMutationBlockedV144()){setSaveTransferStatusV144('Leave the active room before importing or restoring local saves.','warn');return}
  const state=readProfileStorageV144();if(!state.ok&&kind!=='recovery'){setSaveTransferStatusV144('Import is blocked because the current save is unreadable. Export its raw bytes, then restore a valid automatic snapshot if available.','bad');return}
  const existing=state.ok?SAVE_SYSTEM.normalizeCollectionV014(state.profiles):{},plan=SAVE_SYSTEM.planProfileMerge(existing,profiles);pendingProfileImportV144={profiles,source,kind,expectedRaw:state.raw,plan};const actions=$('saveImportCommitV144'),apply=$('saveImportApplyV144');if(actions)actions.hidden=false;if(apply){apply.disabled=state.ok&&plan.added+plan.conflicts===0;apply.textContent=kind==='recovery'?'Restore Snapshot':`Import ${plan.added+plan.conflicts} Hunter${plan.added+plan.conflicts===1?'':'s'}`}
  const pieces=[`${plan.added} new`,`${plan.duplicates} unchanged`,`${plan.conflicts} ID conflict${plan.conflicts===1?'':'s'}`],conflictNote=plan.conflicts?' Conflicts will be imported as separate “Recovered” hunters; existing hunters will not be replaced.':'';setSaveTransferStatusV144(`${kind==='recovery'?'Recovery':'Import'} preview (${source}): ${pieces.join(' • ')}.${conflictNote}${!state.ok?' The unreadable current bytes will be quarantined before the snapshot is restored.':''}`,plan.conflicts||!state.ok?'warn':'')
}
async function handleSaveImportFileV144(file){
  if(!file)return;if(file.size>SAVE_SYSTEM.MAX_IMPORT_BYTES){setSaveTransferStatusV144('The selected backup exceeds the 4 MB safety limit.','bad');return}let text;try{text=await file.text()}catch(e){setSaveTransferStatusV144('The selected backup could not be read.','bad');return}const parsed=SAVE_SYSTEM.parseImportText(text);if(!parsed.ok){setSaveTransferStatusV144(parsed.message,'bad');return}previewProfileImportV144(parsed.profiles,file.name||parsed.source,'import')
}
function previewRecoveryV144(){
  const recovery=SAVE_SYSTEM.readRecovery(localStorage);if(!recovery.ok){setSaveTransferStatusV144(recovery.message,'warn');return}previewProfileImportV144(recovery.profiles,`automatic snapshot from ${recovery.envelope.savedAt}`,'recovery')
}
function applyPendingSaveImportV144(){
  const pending=pendingProfileImportV144;if(!pending)return;if(saveMutationBlockedV144()){setSaveTransferStatusV144('Leave the active room before changing local saves.','warn');return}const options={expectedRaw:pending.expectedRaw,makeId:uid,reason:pending.kind==='recovery'?'before-recovery-merge':'before-import'},result=pending.kind==='recovery'?SAVE_SYSTEM.restoreRecovery(localStorage,options):SAVE_SYSTEM.importProfiles(localStorage,pending.profiles,options);if(!result.ok){setSaveTransferStatusV144(result.message,result.code==='stale_preview'?'warn':'bad');clearPendingSaveImportV144(false);return}const changed=(result.added?.length||0)+(result.conflicts?.length||0),wasRecovery=pending.kind==='recovery';clearPendingSaveImportV144(false);if(profile){profile=result.profiles?.[profile.id]||null;if(profile)ensureProfileShape(profile)}renderSavedCharacters();setSaveTransferStatusV144(result.restoredCorrupt?`Recovery restored ${Object.keys(result.profiles).length} hunter${Object.keys(result.profiles).length===1?'':'s'}; unreadable bytes were preserved in local quarantine.`:`${wasRecovery?'Recovery':'Import'} complete: ${changed} hunter${changed===1?'':'s'} added without replacing the existing roster.`)
}


function mobileCharacterSelectInit(){
  if(!window.matchMedia?.('(max-width: 720px)').matches)return;
  requestAnimationFrame(()=>{
    const overlay=$('titleOverlay'),section=$('characterCreateSection');
    if(overlay?.classList.contains('show')&&section){
      const profiles=Object.values(loadProfiles());
      if(!profiles.length)section.scrollIntoView({block:'start',behavior:'auto'});
    }
  });
}

function renderSavedCharacters(){
  const g=$('savedCharacters');g.innerHTML='';const state=readProfileStorageV144();updateSaveTransferUiV144(state);if(!state.ok){const warning=document.createElement('div');warning.className='tiny';warning.textContent='Saved hunters are hidden to prevent accidental overwrite. Use Local backup & recovery below.';g.appendChild(warning);return}const ps=Object.values(state.profiles);
  if(!ps.length){const empty=document.createElement('div');empty.className='tiny';empty.textContent='No saved hunters yet.';g.appendChild(empty);return}
  ps.forEach(stored=>{
    const p=SAVE_SYSTEM.normalizeProfileV014(stored),c=CLASSES[p.classId],d=document.createElement('div'),name=document.createElement('b'),meta=document.createElement('div'),stats=document.createElement('div');d.className='classcard';name.textContent=p.name;meta.textContent=`${c.name} • Level ${p.level} • Mastery ${masteryLevel(p.classMastery[p.classId]||0)}`;stats.className='tiny';stats.textContent=`GR ${gearRating(p)} • ${p.gold}g • ${p.lifetime?.success||0} clears • ${p.lifetime?.wipes||0} wipes`;d.append(name,meta,stats);
    d.onclick=()=>selectProfile(p.id);g.appendChild(d);
  })
}
let creatingClass='warden';
function renderClassGrid(){
  const g=$('classGrid');g.innerHTML='';
  Object.entries(CLASSES).forEach(([cid,c])=>{
    const d=document.createElement('button');d.type='button';d.className='classcard'+(creatingClass===cid?' selected':'');d.dataset.classId=cid;
    d.setAttribute('aria-pressed',creatingClass===cid?'true':'false');
    d.innerHTML=`<b>${c.name}</b><div>${c.desc}</div><div class="tiny" style="margin-top:4px">${c.res} ${c.maxRes} • Range ${c.range}</div>`;
    d.onclick=()=>{creatingClass=cid;renderClassGrid();const chosen=document.querySelector('#classGrid .classcard.selected');chosen?.scrollIntoView?.({block:'nearest',inline:'nearest'})};g.appendChild(d);
  })
}
function selectProfile(id){
  const state=readProfileStorageV144();if(!state.ok)return reportSaveFailureV144({current:state,message:state.message});profile=state.profiles[id];if(!profile)return;
  const before=JSON.stringify(profile);ensureProfileShape(profile);const migrated=before!==JSON.stringify(profile);if(!persistProfile(migrated?{backupCurrent:true,reason:'before-profile-migration'}:{})){profile=null;return}
  hide('titleOverlay');show('lobbyOverlay');$('lobbyCharacterText').textContent=`${profile.name} • ${CLASSES[profile.classId].name} • Level ${profile.level} • Mastery ${masteryLevel(profile.classMastery[profile.classId]||0)}`;
  renderProfile();prefillHashRoom();
}
function createCharacter(){
  const state=readProfileStorageV144();if(!state.ok)return reportSaveFailureV144({current:state,message:'Character creation is blocked until the unreadable local save is recovered.'});const name=$('newName').value.trim()||'Hunter';const p=newProfile(name,creatingClass),ps=state.profiles;ps[p.id]=p;if(saveProfiles(ps,{expectedRaw:state.raw}))selectProfile(p.id)
}

const ROOM_CODE_ALPHABET_V143='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function roomCodeGen(){const bytes=crypto.getRandomValues(new Uint8Array(6));return Array.from(bytes,b=>ROOM_CODE_ALPHABET_V143[b%ROOM_CODE_ALPHABET_V143.length]).join('')}
function playerJoinPayload(){
  const m=masteryLevel(profile.classMastery[profile.classId]||0),sx=profile.skillXp[profile.classId]||{s1:0,s2:0};
  return{peerId,name:profile.name,classId:profile.classId,level:profile.level,mastery:m,gearRating:gearRating(profile),gearTraits:equippedGearTraitsV10(profile),talents:profile.talents||[],ascentNodes:profile.ascentNodes||[],power:profilePower(profile),relicPowers:equippedRelicPowers(profile),skillLevels:{s1:skillLevel(sx.s1),s2:skillLevel(sx.s2)},monsterMastery:profile.monsterMastery||{},selectedSpec:profile.selectedSpec,ascension:profile.ascension||0,nemesisSeed:topNemesis(profile),deathCache:profile.deathCache,dropPity:profile.dropPity||{relic:0,mythic:0},trophies:profile.trophies||[],title:profile.selectedTitle||'Hunter',autoPotionV131:!!profile.autoPotionV131,ready:false,campX:14,campY:15,facing:'south',prep:{}}
}
function setupChannel(code){
  if(bc)bc.close();roomCode=code.toUpperCase();lastAcceptedSnapshotVersionV146=0;acceptedSnapshotHostV146=null;acceptedVersionedSnapshotV146=false;lastProfileSyncedSettlementV146=null;bc=new BroadcastChannel('ashfall-mp-'+roomCode);
  bc.onmessage=e=>receiveTransportEventV141(e.data);startRemoteTransportV141(roomCode);
  $('roomChoice').style.display='none';$('roomPanel').style.display='block';$('roomCodeText').textContent=roomCode;$('roomBadge').textContent=`Room ${roomCode}`;
}

function rollMerchantState(previousMisses=0){
  const odds=Math.min(.82,.42+previousMisses*.14),active=chance(odds);return{active,visitId:uid(),mood:pick(MERCHANT_MOODS),misses:active?0:previousMisses+1,arrivedAt:Date.now()}
}
function merchantObject(){const m=(room||snapshot)?.merchant;return m?.active?{id:'merchant',name:'Veyla’s Gilded Caravan',x:27,y:10,type:'merchant'}:null}
function activeCampObjects(){const m=merchantObject();return m?[...CAMP_OBJECTS,m]:CAMP_OBJECTS}
function merchantPowerTuple(classId,powerId){return RELIC_POWERS[classId].find(x=>x[0]===powerId)||RELIC_POWERS[classId][0]}
function makeMerchantUnique(classId,level,extravagant=false){
  const spec=pick(MERCHANT_UNIQUES[classId]),pow=merchantPowerTuple(classId,spec[2]),ilvl=Math.max(10,level+rand(extravagant?8:3,extravagant?16:8));
  const i={id:uid(),type:spec[1],ilvl,rarity:'relic',name:spec[0],atk:0,def:0,hp:0,affixType:null,affixValue:0,enhance:extravagant?2:0,classLock:classId,relicPower:pow[0],relicPowerName:pow[1],relicPowerDesc:pow[2],relicKey:`merchant:${classId}:${spec[0]}:${pow[0]}`,merchantUnique:true};
  const mult=extravagant?2.55:2.15;if(i.type==='weapon')i.atk=Math.round((7+ilvl*1.12)*mult);if(i.type==='armor'){i.def=Math.round((4+ilvl*.58)*mult);i.hp=Math.round((10+ilvl*1.6)*mult)}if(i.type==='charm'){i.atk=Math.round((2+ilvl*.42)*mult);i.def=Math.round((2+ilvl*.3)*mult);i.hp=Math.round((8+ilvl*.95)*mult)}i.value=Math.round(ilvl*(extravagant?32:23));return normalizeItemV132(i)
}
function merchantGear(rarity='rare'){
  const type=randomDropTypeV132(),base=baseForItemTypeV132(type,profile.classId),aff=pick(AFFIXES),ilvl=Math.max(3,profile.level+rand(1,6)),mult=rarity==='epic'?1.75:rarity==='rare'?1.4:1.18;
  const i={id:uid(),type,ilvl,rarity,name:`${rarity==='epic'?'Caravan-Etched':'Gilded'} ${base} ${aff[0]}`,atk:0,def:0,hp:0,affixType:aff[1],affixValue:aff[2],enhance:0};
  fillItemStatsV132(i,mult);maybeAssignTraitV10(i,profile,rarity==='epic');i.value=Math.round(ilvl*9*mult);return normalizeItemV132(i)
}
function merchantStock(){
  ensureProfileShape(profile);const visit=(room||snapshot)?.merchant?.visitId;if(!visit)return[];if(profile.merchantStocks[visit])return profile.merchantStocks[visit];
  const affordable=merchantGear('rare'),premium=merchantGear('epic'),named=makeMerchantUnique(profile.classId,profile.level,false),insane=makeMerchantUnique(profile.classId,profile.level,true);
  const stock=[
    {id:uid(),kind:'common',name:'Bundle of Salvaged Monster Parts',desc:'8 common crafting materials.',price:45,qty:8},
    {id:uid(),kind:'rareMat',name:'Sealed Monster Core',desc:'1 rare crafting material.',price:140,qty:1},
    {id:uid(),kind:'prep',name:'Caravan Field Kit',desc:'+2 potions for your next expedition.',price:95,qty:2},
    {id:uid(),kind:'gear',name:affordable.name,desc:itemStats(affordable),price:Math.max(180,affordable.value*2),item:affordable},
    {id:uid(),kind:'gear',name:premium.name,desc:itemStats(premium),price:Math.max(520,premium.value*3),item:premium},
    {id:uid(),kind:'gear',name:named.name,desc:`Named Caravan Relic • ${itemStats(named)}`,price:rand(1800,4200)+profile.level*90,item:named,named:true},
    {id:uid(),kind:'gear',name:insane.name,desc:`Veyla’s Masterpiece • ${itemStats(insane)}`,price:rand(6500,12500)+profile.level*180,item:insane,named:true,expensive:true}
  ];profile.merchantStocks[visit]=stock;persistProfile();return stock
}
function buyMerchantOffer(offerId){
  ensureProfileShape(profile);const stock=merchantStock(),o=stock.find(x=>x.id===offerId);if(!o||o.sold)return;if(profile.gold<o.price)return toast('Veyla smiles: “Come back when your purse weighs more.”');
  if(o.kind==='gear'&&profile.inventory.length>=60)return toast('Your stash is too full');profile.gold-=o.price;
  if(o.kind==='common')profile.materials.common+=o.qty;if(o.kind==='rareMat')profile.materials.rare+=o.qty;
  if(o.kind==='prep'){const cp=campPlayer();if(cp){cp.prep=cp.prep||{};cp.prep.merchantPotions=(cp.prep.merchantPotions||0)+o.qty;if(!isHost)send({type:'campMerchantPrep',peerId,qty:o.qty})}}
  if(o.kind==='gear'){profile.inventory.push(o.item);if(o.item.rarity==='relic'&&o.item.relicKey&&!profile.relicsFound.includes(o.item.relicKey))profile.relicsFound.push(o.item.relicKey)}o.sold=true;persistProfile();renderMerchant();toast(`Purchased ${o.name}`);beep(690,.05,'triangle')
}
function renderMerchant(){
  ensureProfileShape(profile);$('serviceTitle').textContent='Veyla’s Gilded Caravan';$('serviceSub').textContent=`Veyla is ${((room||snapshot)?.merchant?.mood||'counting coins')}. Her inventory changes whenever the caravan returns.`;
  const body=$('serviceBody');body.innerHTML=`<div class="merchant-banner"><b>TRAVELING MERCHANT</b><br>Some goods are deliberately affordable. Her named artifacts are not. Stock is personalized to your hunter and persists for this caravan visit.<div class="camp-status"><span class="camp-chip">${profile.gold.toLocaleString()} gold</span><span class="camp-chip">Visit ${(room||snapshot)?.merchant?.visitId?.slice(0,6)||'—'}</span></div></div><div class="merchant-grid" id="merchantGrid"></div>`;
  merchantStock().forEach(o=>{const d=document.createElement('div');d.className='merchant-item'+(o.expensive?' merchant-expensive':'');const cls=o.item?`rarity-${o.item.rarity}`:'';d.innerHTML=`<b class="${cls}">${o.name}</b><div>${o.desc}</div><div class="merchant-price" style="margin-top:5px">${o.price.toLocaleString()}g</div><button ${o.sold?'disabled':''}>${o.sold?'SOLD':profile.gold<o.price?'Cannot Afford':'Buy'}</button>`;d.querySelector('button').onclick=()=>buyMerchantOffer(o.id);$('merchantGrid').appendChild(d)});show('campServiceOverlay')
}
function rollMerchantAfterHunt(){if(!isHost||!room)return;const misses=room.merchant?.active?0:(room.merchant?.misses||0);room.merchant=rollMerchantState(misses);if(room.merchant.active)room.log.push('A bell rings outside camp — Veyla’s Gilded Caravan has arrived.');else room.log.push('The caravan road is empty tonight.')}

function createRoom(){
  isHost=true;const code=roomCodeGen();setupChannel(code);
  room={code,hostPeerId:peerId,players:{},missionId:selectedMission,delveId:null,difficulty:'normal',run:null,log:[],merchant:rollMerchantState(1)};
  room.players[peerId]=playerJoinPayload();room.players[peerId].campX=14;room.players[peerId].campY=15;room.players[peerId].prep={};broadcastSnapshot();renderLobby();enterSharedCamp();const first=!ensureWorldProfileV14(profile).enteredLowlands;flowBannerV13('HUNTER CAMP',first?'Follow the central road north to the gate. Surface exploration begins beyond the walls.':'Forge, rest, take contracts, or leave through the North Gate.','route','EMBERWATCH');toast('Entered Emberwatch');
}
function joinRoom(){
  const code=$('joinCode').value.trim().toUpperCase();if(!code)return toast('Enter a room code');
  isHost=false;setupChannel(code);send({type:'join',player:playerJoinPayload()});$('hostLabel').textContent='Joining...';toast('Join request sent');
}
function send(msg){const event={...msg,_transportId:`${peerId}:${Date.now()}:${Math.random().toString(36).slice(2,8)}`,_senderPeerId:peerId};rememberTransportEventV141(event._transportId);if(bc)bc.postMessage(event);remotePostV141(event)}
function broadcastSnapshot(){if(isHost&&room){room.stateVersionV146=(Number.isSafeInteger(room.stateVersionV146)?room.stateVersionV146:0)+1;send({type:'snapshot',stateVersion:room.stateVersionV146,room})}snapshot=structuredCloneSafe(room);renderAll()}
function structuredCloneSafe(o){return JSON.parse(JSON.stringify(o))}
function onNetwork(msg){
  if(!msg)return;
  if(isHost){
    if(msg.type==='join'){
      if(room.run||room.worldV14)return send({type:'reject',peerId:msg.player.peerId,reason:'The party is already in the field. Join when they return to Emberwatch.'});
      if(Object.keys(room.players).length>=4)return send({type:'reject',peerId:msg.player.peerId,reason:'Party is full.'});
      const slot=Object.keys(room.players).length;msg.player.campX=13+(slot%4)*2;msg.player.campY=15;msg.player.prep=msg.player.prep||{};room.players[msg.player.peerId]=msg.player;room.log.push(`${msg.player.name} joined the party.`);broadcastSnapshot();return
    }
    if(msg.type==='profileSync'){const old=room.players[msg.player.peerId];if(old&&!room.run){room.players[msg.player.peerId]={...msg.player,campX:old.campX,campY:old.campY,worldX:old.worldX,worldY:old.worldY,facing:old.facing,ready:old.ready,prep:old.prep||{},connected:old.connected};broadcastSnapshot()}return}
    if(msg.type==='campMove'){hostCampMove(msg.peerId,msg.dx,msg.dy);return}if(msg.type==='worldMoveV14'){hostWorldMoveV14(msg.peerId,msg.dx,msg.dy);return}if(msg.type==='worldInteractV141'){hostWorldInteractV141(msg.peerId,msg.objectId,!!msg.autoAttack);return}if(msg.type==='enterWorldV14'){enterWorldV14(msg.peerId);return}if(msg.type==='leaveWorldV14'){leaveWorldV14(msg.peerId);return}if(msg.type==='returnToCampV142'&&room.players?.[msg.peerId]){returnPartyToEmberwatchV142('The party regrouped at the Emberwatch bonfire.');return}
    if(msg.type==='campPrep'){hostCampPrep(msg.peerId,msg.prep);return}
    if(msg.type==='campMerchantPrep'){const p=room.players[msg.peerId];if(p&&!room.run){p.prep=p.prep||{};p.prep.merchantPotions=(p.prep.merchantPotions||0)+(msg.qty||0);broadcastSnapshot()}return}
    if(msg.type==='leave'){delete room.players[msg.peerId];const activeRun=room.run,rp=activeRun?.players?.[msg.peerId];if(rp){rp.connected=false;rp.dead=true;rp.downed=false;rp.deadAt=Date.now();rp.hp=0;rp.submitted=true;rp.pending=null;activeRun.log.push(`${rp.name} disconnected and left the hunt.`)}if(!reevaluateRunAfterDepartureV146(activeRun))broadcastSnapshot();return}
    if(msg.type==='command'){hostCommand(msg);return}
    if(msg.type==='quickActionV132'){hostQuickActionV132(msg.peerId,msg.quickType);return}
    if(msg.type==='cancelActionV131'){hostCancelActionV131(msg.peerId);return}
    if(msg.type==='selectMission'&&msg.peerId===room.hostPeerId){room.missionId=msg.missionId;Object.values(room.players).forEach(p=>p.ready=false);broadcastSnapshot();return}
    if(msg.type==='difficulty'&&msg.peerId===room.hostPeerId){room.difficulty=msg.difficulty;Object.values(room.players).forEach(p=>p.ready=false);broadcastSnapshot();return}
    if(msg.type==='ready'&&room.players[msg.peerId]){room.players[msg.peerId].ready=!!msg.ready;broadcastSnapshot();return}
    if(msg.type==='vote'){hostVote(msg.peerId,msg.vote);return}
  }else{
    if(msg.type==='snapshot'){
      if(!msg.room?.players?.[peerId])return;
      const incomingHost=msg.room.hostPeerId||null,incomingVersion=Number.isSafeInteger(msg.stateVersion)?msg.stateVersion:(Number.isSafeInteger(msg.room.stateVersionV146)?msg.room.stateVersionV146:null);
      if(acceptedSnapshotHostV146&&incomingHost!==acceptedSnapshotHostV146){lastAcceptedSnapshotVersionV146=0;acceptedVersionedSnapshotV146=false}
      if(incomingVersion!=null){if(acceptedVersionedSnapshotV146&&incomingHost===acceptedSnapshotHostV146&&incomingVersion<=lastAcceptedSnapshotVersionV146)return;lastAcceptedSnapshotVersionV146=incomingVersion;acceptedVersionedSnapshotV146=true}else if(acceptedVersionedSnapshotV146&&incomingHost===acceptedSnapshotHostV146)return;
      acceptedSnapshotHostV146=incomingHost;
      snapshot=msg.room;room=msg.room;$('hostLabel').textContent=`Host: ${room.players[room.hostPeerId]?.name||'Hunter'}`;
      const completedSettlement=room.completedSettlementsV145?.[peerId];if(completedSettlement)applySettlement(completedSettlement);
      if(returnToCampPendingV142&&!room.run&&!room.worldV14){returnToCampPendingV142=false;hide('summaryOverlay');notifyV11('info','EMBERWATCH BONFIRE','The party returned safely to camp.')}
      if(room.worldV14&&profile&&!ensureWorldProfileV14(profile).enteredLowlands){profile.worldV14.enteredLowlands=true;persistProfile()}
      const completedSettlementId=completedSettlement?.settlementId||null,completedSettlementPersisted=completedSettlementId&&profileReceiptSeenV145('settlementReceiptsV145',completedSettlementId);if(!room.run&&completedSettlementPersisted&&completedSettlementId!==lastProfileSyncedSettlementV146){lastProfileSyncedSettlementV146=completedSettlementId;setTimeout(syncRoomProfile,0)}
      if(room.run)hide('lobbyOverlay');
      renderLobby();if(!room.run){if(room.worldSelectionV141)show('lobbyOverlay');else enterSharedCamp()}renderAll();return
    }
    if(msg.type==='reject'&&msg.peerId===peerId){toast(msg.reason);leaveRoom(true);return}
    if(msg.type==='worldRewardV141'&&msg.peerId===peerId){applyWorldResourceRewardV141(msg.reward);return}
    if(msg.type==='worldDelveDiscoveredV141'&&msg.peerId===peerId){applyWorldDelveDiscoveryV141(msg.delveId);return}
    if(msg.type==='worldNoticeV141'&&msg.peerId===peerId){notifyV11(msg.kind||'info',msg.title||'FIELD UPDATE',msg.detail||'');return}
    if(msg.type==='leave'&&msg.peerId===room?.hostPeerId){leaveRoom(false);toast('The party leader left the room.');return}
    if(msg.type==='settlement'&&msg.peerId===peerId){applySettlement(msg.settlement);return}
  }
}

function enterSharedCamp(){hide('lobbyOverlay');$('lobbyTitle').textContent='Emberwatch Expedition Desk';renderAll()}
function campPlayer(){return (room||snapshot)?.players?.[peerId]}
function campOccupied(x,y,pid){return Object.values((room||snapshot)?.players||{}).some(p=>p.peerId!==pid&&p.campX===x&&p.campY===y)}
const CAMP_BLOCK_RECTS_V132=[
  [2,4,8,6],      // forge back wall
  [23,3,28,5],    // crafter tent
  [23,11,28,13],  // healer tent
  [8,1,12,2],     // stash
  [10,4,13,6],    // relocated Hunt Board footprint
  [18,1,23,2],    // war table edge
  [18,5,23,6],    // trophy display
  [16,13,21,14]   // wager table
];
function campBlocked(x,y){if(x<1||y<2||x>=W-1||y>=H-1)return true;const service=activeCampObjects().some(o=>o.x===x&&o.y===y);if(service)return true;return CAMP_BLOCK_RECTS_V132.some(([x0,y0,x1,y1])=>x>=x0&&x<=x1&&y>=y0&&y<=y1)}
function hostCampMove(pid,dx,dy){if(!isHost||room?.run)return;const p=room?.players?.[pid];if(!p)return;const facing=rangerFacingFromDelta(dx,dy,p.facing||'south'),nx=(p.campX??14)+dx,ny=(p.campY??15)+dy;if(campBlocked(nx,ny)||campOccupied(nx,ny,pid)){if(p.facing!==facing){p.facing=facing;broadcastSnapshot()}return}p.facing=facing;p.campX=nx;p.campY=ny;broadcastSnapshot()}
function moveCamp(dx,dy){if((room||snapshot)?.run)return;if(isHost)hostCampMove(peerId,dx,dy);else send({type:'campMove',peerId,dx,dy})}
function nearestCampObject(){const p=campPlayer();if(!p)return null;return activeCampObjects().map(o=>({...o,d:Math.abs(o.x-(p.campX??14))+Math.abs(o.y-(p.campY??15))})).filter(o=>o.d<=1).sort((a,b)=>a.d-b.d||((a.type==='worldgate')?-1:(b.type==='worldgate'?1:0)))[0]||null}
function interactCampObject(o=nearestCampObject()){if(!o)return toast('Nothing nearby to interact with');if(o.type==='board')return openHuntBoard();if(o.type==='smith')return openSmith();if(o.type==='crafter')return openCrafter();if(o.type==='healer')return openHealer();if(o.type==='bonfire')return openBonfire();if(o.type==='dummy')return openTraining();if(o.type==='wager')return openCindersWager();if(o.type==='war')return openWarTable();if(o.type==='trophy')return openTrophyWall();if(o.type==='merchant')return renderMerchant();if(o.type==='worldgate')return enterWorldV14();if(o.type==='stash'){renderProfile();switchProfileTabV132('equipment');show('profileOverlay')}}
function openHuntBoard(){$('lobbyTitle').textContent='Hunt Board — Choose the Party Expedition';renderLobby();show('lobbyOverlay')}
function hostCampPrep(pid,prep){if(!isHost||room?.run)return;const p=room?.players?.[pid];if(!p)return;p.prep=p.prep||{};p.prep[prep]=true;room.log.push(`${p.name} prepared at camp: ${prep==='feast'?'Ember Feast':'Healer blessing'}.`);broadcastSnapshot()}
function setCampPrep(prep){if(isHost)hostCampPrep(peerId,prep);else send({type:'campPrep',peerId,prep});toast(prep==='feast'?'Ember Feast: +8% XP & mastery next hunt.':'Healer blessing: +1 potion next hunt.')}
function openSmith(){renderProfile();switchProfileTabV132('equipment');show('profileOverlay');toast('Huntsmith Orik — Armory & Forge')}

function monsterSetCraftHTML(){
  let out='<div class="sectiontitle" style="margin-top:10px">Monster Huntsets</div><div class="servicegrid">';
  Object.entries(MONSTER_SETS).forEach(([id,s])=>{
    const req=Object.entries(s.req).map(([k,v])=>`${v}× ${namedPartName(k)} (${profile.monsterParts[k]||0})`).join(' • ');
    const recipes=HUNT_CRAFT_RECIPES_V131.filter(r=>r.setId===id);
    out+=`<div class="setcard"><b>${s.name}</b><div class="tiny">${req}</div><div class="setbonus">2pc ${s.bonus2}<br>3pc ${s.bonus3}</div><div class="tiny" style="margin-top:5px">${recipes.length} targeted Huntforged recipes available below.</div></div>`
  });
  return out+'</div>'
}

function openCrafter(){ensureProfileShape(profile);$('serviceTitle').textContent='Relic Crafter Nessa';$('serviceSub').textContent=`Nessa has cataloged ${TOTAL_RELIC_VARIANTS.toLocaleString()} possible class-relic name/power combinations.`;$('serviceBody').innerHTML=`<div class="notice"><b>Relic Drop Research</b><br>Ordinary monster: ~0.01% • Elite: ~0.15% • Major boss: ~2.0%. Nightmare and Treasure Vein improve those odds.<div class="camp-status"><span class="camp-chip">Discovered ${profile.relicsFound.length}</span><span class="camp-chip">${profile.materials.common} common</span><span class="camp-chip">${profile.materials.rare} rare</span></div></div><div class="servicegrid" id="craftCards"></div><div class="sectiontitle" style="margin-top:10px">Relic Archive</div><div class="codex" id="relicCodex"></div>`;['weapon','offhand','head','shoulders','chest','gloves','boots','ring','necklace'].forEach(type=>{const d=document.createElement('div');d.className='servicecard';d.innerHTML=`<b>Craft ${slotDisplayTypeV132({type})}</b><div>Target a Rare+ ${slotDisplayTypeV132({type})} using recovered monster materials.</div><button>Craft ${slotDisplayTypeV132({type})}</button>`;d.querySelector('button').onclick=()=>{craftGear(type);openCrafter()};$('craftCards').appendChild(d)});if(!profile.relicsFound.length)$('relicCodex').innerHTML='<div class="tiny">No relics discovered yet.</div>';profile.relicsFound.slice().reverse().forEach(k=>{const d=document.createElement('div');d.className='codexrow';d.textContent=k.split(':').slice(1).join(' • ');$('relicCodex').appendChild(d)});$('serviceBody').insertAdjacentHTML('beforeend',monsterSetCraftHTML()+`<div class="sectiontitle" style="margin-top:10px">Huntforged Boss Recipes</div><div class="servicegrid">${huntforgeRecipeCardsV131(profile)}</div>`);show('campServiceOverlay')}
function openHealer(){const has=campPlayer()?.prep?.healer;$('serviceTitle').textContent='Healer Amara';$('serviceSub').textContent='Field medicine before the hunt.';$('serviceBody').innerHTML=`<div class="servicecard"><b>Field Blessing</b><div>Begin the next expedition with <strong>+1 healing potion</strong>.</div><button ${has?'disabled':''}>${has?'Prepared':'Prepare Blessing'}</button></div>`;const b=$('serviceBody').querySelector('button');if(!has)b.onclick=()=>{setCampPrep('healer');setTimeout(openHealer,80)};show('campServiceOverlay')}
function openBonfire(){const has=campPlayer()?.prep?.feast;$('serviceTitle').textContent='Ember Bonfire';$('serviceSub').textContent='Hunters gather here before marching out.';$('serviceBody').innerHTML=`<div class="servicecard"><b>Hunter’s Feast</b><div>Gain <strong>+8% Character XP and Class Mastery</strong> from the next expedition.</div><button ${has?'disabled':''}>${has?'Feast Prepared':'Share the Feast'}</button></div><div class="notice" style="margin-top:8px">Preparation buffs are consumed when the expedition launches.</div>`;const b=$('serviceBody').querySelector('button');if(!has)b.onclick=()=>{setCampPrep('feast');setTimeout(openBonfire,80)};show('campServiceOverlay')}
let trainingLog=[];
function trainingPlayer(){const c=CLASSES[profile.classId],pow=profilePower(profile),m=masteryLevel(profile.classMastery[profile.classId]||0),sx=profile.skillXp[profile.classId]||{s1:0,s2:0},relicPowers=equippedRelicPowers(profile),asc=ascentEffectsV11(profile);let maxHp=(c.hp+(profile.level-1)*7+(pow.hp||0))*(1+(asc.hp||0)),maxRes=c.maxRes+(asc.maxRes||0);if(profile.classId==='warden'&&profile.talents.includes('ironwall'))maxHp=Math.round(maxHp*1.12);if(relicPowers.includes('hearthguard')||relicPowers.includes('holy_vigor'))maxHp=Math.round(maxHp*1.10);if(relicPowers.includes('deathless'))maxHp=Math.round(maxHp*1.08);if((profile.classId==='arcanist'&&profile.talents.includes('well'))||relicPowers.includes('manaheart'))maxRes+=4;return{peerId:'training',classId:profile.classId,level:profile.level,mastery:m,talents:profile.talents||[],ascentNodes:profile.ascentNodes||[],power:pow,relicPowers,selectedSpec:profile.selectedSpec,monsterMastery:profile.monsterMastery||{},boons:[],skillLevels:{s1:skillLevel(sx.s1),s2:skillLevel(sx.s2)},atk:c.atk+(profile.level-1)*2+(pow.atk||0),def:c.def+Math.floor((profile.level-1)/2)+(pow.def||0)+(asc.def||0),maxHp,hp:maxHp,res:maxRes,maxRes,frenzyCharges:0,status:{partyDef:0},runLoot:{skill1:0,skill2:0}}}
let trainingState=null;
function openTraining(){trainingLog=[];trainingState=trainingPlayer();renderTrainingStats();renderTrainingLog();wireSkillTooltips();show('trainingOverlay')}
function renderTrainingStats(){
  const p=trainingState||trainingPlayer(),c=CLASSES[p.classId],def=Number($('dummyDef')?.value||10),
    frenzy=p.classId==='berserker'&&p.frenzyCharges>0?` • <span class="bad"><b>BLOOD FRENZY ×${p.frenzyCharges}</b> (+30% damage)</span>`:'';
  $('trainAttack').innerHTML=abilityIconHTML('attack','Attack','Training');
  $('trainSkill1').innerHTML=abilityIconHTML(`${p.classId}1`,c.s1.name,`${c.s1.cost} ${c.res}`);
  $('trainSkill2').innerHTML=abilityIconHTML(`${p.classId}2`,c.s2.name,`${c.s2.cost} ${c.res}`);
  $('trainingStats').innerHTML=`<b>${profile.name} — ${c.name}</b><br>ATK ${p.atk} • DEF ${p.def} • HP ${p.hp}/${p.maxHp} • ${c.res} ${p.res}/${p.maxRes}${frenzy}<br>Basic range: ${effectiveRange(p)} tiles • Dummy DEF: ${def}<br><span class="tiny">Hover Attack, ${c.s1.name}, or ${c.s2.name} for exact formulas, range, costs, effects, talents, and Relic modifiers. Training state persists between actions.</span>`;
}
function renderTrainingLog(){$('trainingLog').innerHTML=trainingLog.slice().reverse().map(x=>`<div>${x}</div>`).join('')||'<div class="tiny">Hit the dummy to begin testing.</div>'}
function trainTest(kind){
  const p=trainingState||trainingPlayer(),def=Number($('dummyDef').value||10);trainingState=p;let out='';
  if(kind==='attack'){
    const wasFrenzied=p.classId==='berserker'&&p.frenzyCharges>0,baseRoll=p.atk+rand(-2,4),crit=chance(critChance(p));
    let baselineRaw=baseRoll,empoweredRaw=Math.round(baseRoll*frenzyMult(p));if(crit){baselineRaw=Math.round(baselineRaw*1.65);empoweredRaw=Math.round(empoweredRaw*1.65)}
    const baseline=Math.max(1,baselineRaw-Math.floor(def*.6)),dmg=Math.max(1,empoweredRaw-Math.floor(def*.6));if(wasFrenzied)consumeFrenzy(p);
    out=`Attack → ${dmg} damage${crit?' CRITICAL':''}${wasFrenzied?` • BLOOD FRENZY: same roll ${baseline} → ${dmg} (+${dmg-baseline})`:''}${wasFrenzied?` • ${p.frenzyCharges} charge${p.frenzyCharges===1?'':'s'} left`:''}`;
  }
  if(kind==='skill1'){
    const b=1+(p.skillLevels.s1-1)*.035;
    if(p.classId==='warden')out=`Shield Slam → ${Math.max(2,Math.round(p.atk*1.45*b*(hasRelic(p,'oathstrike')?1.2:1))-Math.floor(def*.3))} damage`;
    if(p.classId==='berserker'){
      const wasFrenzied=p.frenzyCharges>0,baseMult=(p.talents.includes('cleaver')?1.6:1.35)*(hasRelic(p,'redstorm')?1.2:1),mult=baseMult*frenzyMult(p);
      const baseline=Math.max(2,Math.round(p.atk*baseMult*b)-Math.floor(def*.45)),dmg=Math.max(2,Math.round(p.atk*mult*b)-Math.floor(def*.45));if(wasFrenzied)consumeFrenzy(p);
      out=`Cleave → ${dmg} damage${wasFrenzied?` • BLOOD FRENZY: baseline ${baseline} → ${dmg} (+${dmg-baseline})`:''}${wasFrenzied?` • ${p.frenzyCharges} charge${p.frenzyCharges===1?'':'s'} left`:''}`;
    }
    if(p.classId==='ranger'){let total=0;for(let i=0;i<2;i++)total+=Math.max(1,Math.round(p.atk*.82*b)+rand(0,3)-Math.floor(def*.35));out=`Twin Shot → ${total} total damage`}
    if(p.classId==='arcanist')out=`Ember Lance → ${Math.max(3,Math.round(p.atk*1.75*b*(hasRelic(p,'sunlance')?1.2:1))+rand(1,5)-Math.floor(def*.12))} damage`;
    if(p.classId==='templar'){const d=Math.max(2,Math.round(p.atk*1.4*b*(hasRelic(p,'judgment')?1.2:1))-Math.floor(def*.3));out=`Smite → ${d} damage • heals ≈${Math.round(d*.25)} HP`}
    if(p.classId==='shadow')out=`Backstab → ${Math.max(3,Math.round(p.atk*1.9*b)-Math.floor(def*.35))} base damage`;
  }
  if(kind==='skill2'){
    const b=1+(p.skillLevels.s2-1)*.035;
    if(p.classId==='warden')out=`Fortress → Party DEF +${1+(p.talents.includes('rally')?1:0)+(hasRelic(p,'greater_bastion')?1:0)}`;
    if(p.classId==='berserker'){
      const hpCost=Math.round(p.maxHp*.12);p.hp=Math.max(1,p.hp-hpCost);p.frenzyCharges=hasRelic(p,'ragechain')?3:2;
      out=`Blood Frenzy ACTIVATED → -${hpCost} HP • +30% damage • ${p.frenzyCharges} offensive charges`;
    }
    if(p.classId==='ranger')out=`Volley → ≈${Math.max(2,Math.round(p.atk*.9*b)-Math.floor(def*.25))} damage per target`;
    if(p.classId==='arcanist')out=`Starfall → ≈${Math.max(3,Math.round(p.atk*1.35*b*(hasRelic(p,'cometfall')?1.18:1))-Math.floor(def*.08))} damage per target + Burn`;
    if(p.classId==='templar'){let h=Math.round(p.maxHp*.28*b*(p.talents.includes('grace')?1.3:1)*(hasRelic(p,'saint_hand')?1.2:1));out=`Radiant Hand → heals ≈${h} HP • revive ${hasRelic(p,'martyr_light')?50:38}% HP`}
    if(p.classId==='shadow')out=`Fan of Knives → ≈${Math.max(2,Math.round(p.atk*1.05*b*(hasRelic(p,'knife_storm')?1.2:1))-Math.floor(def*.3))} damage per target`;
  }
  trainingLog.push(out);renderTrainingStats();renderTrainingLog();beep(420+rand(0,180),.03,'square');
}


let wagerHand=null;
function cinderDeck(){const d=[];CINDER_SUITS.forEach(([s,g])=>{for(let v=1;v<=6;v++)d.push({suit:s,glyph:g,value:v,id:uid()})});for(let i=d.length-1;i>0;i--){const j=rand(0,i);[d[i],d[j]]=[d[j],d[i]]}return d}
function cardHTML(c,omen=false){return `<div class="playing-card${omen?' omen':''}"><span class="rank">${c.value}</span><span class="sigil">${c.glyph}</span><span style="font-size:8px">${c.suit}</span></div>`}
function cinderScore(cards){const base=cards.reduce((s,c)=>s+c.value,0),suits=cards.map(c=>c.suit),vals=cards.map(c=>c.value).sort((a,b)=>a-b);let bonus=0,names=[];if(cards.length===3){if(new Set(suits).size===1){bonus+=6;names.push('Oathbound +6')}else if(new Set(suits).size===3){bonus+=2;names.push('Wayfarer +2')}const counts={};vals.forEach(v=>counts[v]=(counts[v]||0)+1);const mx=Math.max(...Object.values(counts));if(mx===3){bonus+=8;names.push('Trinity +8')}else if(mx===2){bonus+=3;names.push('Twin Marks +3')}if(vals[1]===vals[0]+1&&vals[2]===vals[1]+1){bonus+=4;names.push('Trail +4')}}return{score:base+bonus,base,bonus,names}}
function cinderQuality(score,bounty){return score<=bounty?bounty-score:100+(score-bounty)}
function dealerChoice(hand){const options=[{name:'Hold Two',cards:hand.dealer.slice()},{name:'Bind Omen',cards:[...hand.dealer,hand.omen]}],blind=hand.deck[0];options.push({name:'Draw Blind',cards:[...hand.dealer,blind]});options.forEach(o=>o.s=cinderScore(o.cards));options.sort((a,b)=>cinderQuality(a.s.score,hand.bounty)-cinderQuality(b.s.score,hand.bounty));return options[0]}


function weekKey(){const d=new Date(),start=new Date(d.getFullYear(),0,1),week=Math.ceil((((d-start)/86400000)+start.getDay()+1)/7);return`${d.getFullYear()}-W${week}`}
function foundCompany(){const n=prompt('Name your Hunting Company:');if(!n?.trim())return;profile.companyName=n.trim().slice(0,24);persistProfile();openWarTable()}
function companyProgress(){if(!profile.companyName)return{kills:0,members:0};const ps=Object.values(loadProfiles()).map(p=>{ensureProfileShape(p);return p}).filter(p=>p.companyName===profile.companyName);return{kills:ps.reduce((n,p)=>n+(p.lifetime.kills||0),0),members:ps.length}}
function claimCompanyWeekly(){const wk=weekKey(),key=`${profile.companyName}:${wk}`;if(profile.companyClaims[key])return toast('Weekly Company cache already claimed');const c=companyProgress();if(c.kills<250)return toast(`Company needs ${250-c.kills} more lifetime hunt kills in this local prototype`);profile.companyClaims[key]=true;profile.gold+=500;profile.materials.common+=25;profile.materials.rare+=5;persistProfile();openWarTable();toast('Company War Cache claimed')}
function openWarTable(){
  ensureProfileShape(profile);$('serviceTitle').textContent='Emberwatch War Table';$('serviceSub').textContent='Competitive records, ghost times, Hunting Company goals, and Grand Hunt intelligence.';
  const party=Object.values(loadPartyRecords()).sort((a,b)=>b.bestScore-a.bestScore).slice(0,6),leaders=Object.values(loadProfiles()).map(p=>{ensureProfileShape(p);return p}).sort((a,b)=>seasonScore(b)-seasonScore(a)).slice(0,6),daily=dailyHunt(),comp=companyProgress();
  $('serviceBody').innerHTML=`<div class="legacygrid"><div class="legacycard"><b>Daily Hunt</b><div>${MISSIONS[daily.missionId].name}</div><div class="tiny">+25% rewards today. Missing a day costs nothing.</div></div>
  <div class="legacycard"><b>Hunting Company</b><div>${profile.companyName||'Unaffiliated'}</div><div class="tiny">${profile.companyName?`${comp.members} local hunters • ${comp.kills}/250 weekly prototype goal`:'Found a company to unlock a shared weekly cache.'}</div>${profile.companyName?`<button onclick="claimCompanyWeekly()">Claim Weekly Cache</button>`:`<button onclick="foundCompany()">Found Company</button>`}</div>
  <div class="legacycard"><b>Ghost Records</b>${Object.entries(profile.bestTimes).length?Object.entries(profile.bestTimes).slice(0,6).map(([k,t])=>`<div class="leaderrow"><span>${MISSIONS[k.split(':')[0]]?.name||k}</span><b>${t}s</b></div>`).join(''):'<div class="tiny">Clear hunts to establish ghost pace records.</div>'}</div>
  <div class="legacycard"><b>Seasonal Local Top Hunters</b>${leaders.map((p,i)=>`<div class="leaderrow"><span>${i+1}. ${p.name}</span><b>${Math.round(seasonScore(p))}</b></div>`).join('')}</div></div>
  <div class="sectiontitle" style="margin-top:10px">Huntbound Campaign</div><div class="notice"><b>Gear Rating ${gearRating(profile)}</b> • Next objective: ${nextCampaignObjective(profile)}</div>${campaignRoadmapHTML(profile)}<div class="sectiontitle" style="margin-top:10px">Party records</div><div class="legacycard">${party.length?party.map(r=>`<div class="leaderrow"><span>${r.names.join(' + ')}<br><span class="tiny">${r.clears} clears • ${r.wipes} wipes • PB ${r.bestTime??'—'}s</span></span><b>${r.bestScore}</b></div>`).join(''):'No party records yet.'}</div>
  <div class="notice" style="margin-top:8px"><b>Grand Hunt:</b> The World Eater is a fully playable four-phase 1–4 hunter raid at Level 28+ and Gear Rating 46+. Expect telegraphed arena mechanics, Rift Spawn waves, anatomy stagger windows, permanent final-phase fractures, and raid-tier rewards.</div>`;
  show('campServiceOverlay')
}

function openTrophyWall(){ensureProfileShape(profile);$('serviceTitle').textContent='Emberwatch Trophy Wall';$('serviceSub').textContent='Every trophy is a permanent record of a major hunt you completed.';const icons=['♛','🐺','☠','❄','◈','⚔'];$('serviceBody').innerHTML=profile.trophies.length?`<div class="trophywall">${profile.trophies.map((t,i)=>`<div class="trophy"><div class="icon">${icons[i%icons.length]}</div><b>${t}</b></div>`).join('')}</div>`:'<div class="notice">The wall is empty. Major bosses you fully clear will appear here.</div>';show('campServiceOverlay')}

function openCindersWager(){ensureProfileShape(profile);wagerHand=null;$('wagerStatus').innerHTML=`Veyla’s absence never stops the card table. <b>Current gold: ${profile.gold.toLocaleString()}g</b><br>Pattern bonuses: Oathbound +6 • Trinity +8 • Trail +4 • Twin Marks +3 • Wayfarer +2.`;$('playerCards').innerHTML='';$('dealerCards').innerHTML='';$('omenCard').innerHTML='';$('playerScore').textContent='';$('dealerScore').textContent='';$('wagerGold').textContent=`${profile.gold.toLocaleString()}g`;['bindOmen','drawBlind','holdTwo'].forEach(id=>$(id).disabled=true);show('wagerOverlay')}
function dealCinder(){ensureProfileShape(profile);const wager=Number($('wagerAmount').value);if(profile.gold<wager)return toast('Not enough gold for that table');profile.gold-=wager;profile.wagerStats.hands++;profile.wagerStats.net-=wager;const deck=cinderDeck(),player=[deck.pop(),deck.pop()],dealer=[deck.pop(),deck.pop()],omen=deck.pop(),bounty=rand(13,21);wagerHand={wager,deck,player,dealer,omen,bounty,resolved:false};persistProfile();renderCinder();['bindOmen','drawBlind','holdTwo'].forEach(id=>$(id).disabled=false);beep(390,.05,'triangle')}
function renderCinder(){ensureProfileShape(profile);$('wagerGold').textContent=`${profile.gold.toLocaleString()}g`;if(!wagerHand)return;const h=wagerHand;$('playerCards').innerHTML=h.player.map(c=>cardHTML(c)).join('');$('dealerCards').innerHTML=h.dealer.map(c=>cardHTML(c)).join('');$('omenCard').innerHTML=cardHTML(h.omen,true);const ps=cinderScore(h.player),ds=cinderScore(h.dealer);$('playerScore').innerHTML=`Current Glory <b>${ps.score}</b>${ps.names.length?' • '+ps.names.join(', '):''}`;$('dealerScore').innerHTML=`Visible Glory <b>${ds.score}</b>`;$('wagerStatus').innerHTML=`<b>Bounty: <span class="wager-score">${h.bounty}</span></b> • Wager ${h.wager}g<br>Choose how to finish your Hunt.`}
function finishCinder(choice){if(!wagerHand||wagerHand.resolved)return;const h=wagerHand;h.resolved=true;let cards=h.player.slice();if(choice==='omen')cards.push(h.omen);if(choice==='blind')cards.push(h.deck.pop());const dealer=dealerChoice(h);if(dealer.name==='Draw Blind')h.deck.shift();const ps=cinderScore(cards),ds=dealer.s;const pq=cinderQuality(ps.score,h.bounty),dq=cinderQuality(ds.score,h.bounty);let win=false,perfect=ps.score===h.bounty;if(pq<dq)win=true;else if(pq===dq)win=false;let payout=0;if(win){payout=h.wager*(perfect?3:2);profile.gold+=payout;profile.wagerStats.wins++;profile.wagerStats.net+=payout;profile.wagerStats.bestWin=Math.max(profile.wagerStats.bestWin,payout-h.wager);if(perfect)profile.wagerStats.perfects++}else profile.wagerStats.losses++;persistProfile();h.player=cards;h.dealer=dealer.cards;$('playerCards').innerHTML=cards.map(c=>cardHTML(c)).join('');$('dealerCards').innerHTML=dealer.cards.map(c=>cardHTML(c)).join('');$('playerScore').innerHTML=`Glory <b>${ps.score}</b> • ${ps.names.join(', ')||'No pattern'}`;$('dealerScore').innerHTML=`Glory <b>${ds.score}</b> • ${ds.names.join(', ')||'No pattern'}`;$('wagerGold').textContent=`${profile.gold.toLocaleString()}g`;const result=win?(perfect?`PERFECT HUNT — won ${payout-h.wager}g profit!`:`You win ${payout-h.wager}g profit.`):`The House takes the hand. Lost ${h.wager}g.`;$('wagerStatus').innerHTML=`<b>Bounty ${h.bounty}</b><br>You chose ${choice==='omen'?'Bind Omen':choice==='blind'?'Draw Blind':'Hold Two'}. House chose ${dealer.name}.<br><span class="${win?'good':'bad'}">${result}</span>`;['bindOmen','drawBlind','holdTwo'].forEach(id=>$(id).disabled=true);beep(win?760:120,.08,win?'triangle':'sawtooth')}

function renderLobby(){
  const r=room||snapshot;if(!r)return;
  $('roomChoice').style.display='none';$('roomPanel').style.display='block';$('roomCodeText').textContent=r.code;
  $('hostLabel').textContent=isHost?'You are party leader':`Host: ${r.players[r.hostPeerId]?.name||'—'}`;
  const lp=$('lobbyPlayers');lp.innerHTML='';
  Object.values(r.players).forEach(p=>{
    const d=document.createElement('div');d.className='lobbyplayer';
    d.innerHTML=`<span><span class="readydot ${p.ready?'on':''}"></span> <b>${p.name}</b> • ${CLASSES[p.classId].name}</span><span>${p.ready?'<span class="ready">READY</span>':'<span class="waiting">NOT READY</span>'} • Lv ${p.level} • M${p.mastery}</span>`;lp.appendChild(d)
  });
  selectedMission=r.missionId||selectedMission;renderMissions();renderDifficulties();
  const mine=r.players[peerId];$('readyBtn').textContent=mine?.ready?'Unready':'Ready Up';$('readyBtn').disabled=!!r.run;
  const allReady=Object.values(r.players).length>0&&Object.values(r.players).every(p=>p.ready);if($('modifierPreview'))$('modifierPreview').innerHTML=r.run?`<b>${r.run.modifier.name}</b><br>${r.run.modifier.desc}`:'<b>Unknown Conditions</b><br>The expedition modifier is revealed when the hunt begins.';
  $('launchBtn').disabled=!isHost||!!r.run||!allReady;
  $('launchHint').textContent=isHost?(allReady?'Party ready. Launch when you are.':'Everyone must Ready Up before launch.'):'Ready up, then wait for the party leader.';
}
function renderMissions(){
  const r=room||snapshot,g=$('missionGrid');g.innerHTML='';const currentGR=profile?gearRating(profile):0;
  Object.entries(MISSIONS).forEach(([mid,m])=>{
    const state=profile?missionUnlockState(profile,mid):{locked:false,missing:[],gr:0},daily=dailyHunt(),dailyMark=daily.missionId===mid,cleared=profile?.trophies?.includes(m.boss.name);
    const d=document.createElement('div');d.className='mission'+(((r?.missionId||selectedMission)===mid&&!r?.delveId)?' selected':'')+(state.locked?' locked':'');
    const roster=zoneRosterNames(mid),reqT=m.requiredTrophy?` • Trophy: ${m.requiredTrophy}`:'';
    d.innerHTML=`<div class="zone-head"><b>${m.name}${mid==='worldeater'?' • GRAND HUNT':''}</b>${dailyMark?'<span class="zone-tag clear">DAILY +25%</span>':''}${cleared?'<span class="zone-tag clear">CLEARED</span>':''}</div><div class="zone-tags"><span class="zone-tag">${m.level}</span><span class="zone-tag">${deepMissionConfig(mid).active?`${deepMissionConfig(mid).minBossDepth}+ DEPTHS`:`${m.depths} STAGES`}</span><span class="zone-tag gear">GEAR ${m.minGear||0}+</span><span class="zone-tag boss">${m.boss.name}</span></div><div class="tiny">${m.desc}</div><div class="zone-roster"><b>QUARRY:</b> ${roster}</div>${state.locked?`<div class="zone-lock">LOCKED — ${state.missing.join(' • ')}</div>`:`<div class="progression-callout">Your Gear Rating: <span class="gear-rating">${currentGR}</span>${reqT}</div>`}${recipeSourceHintV131(mid)}${profile?huntRecommendationHTMLV131(profile,mid):''}`;if(huntRecipeV131(profile?.trackedRecipeV131)?.missionId===mid)d.classList.add('tracked-hunt-v131');
    d.onclick=()=>{if(state.locked)return toast(`Locked: ${state.missing.join(' • ')}`);if(!isHost)return toast('Only the host chooses the hunt');selectedMission=mid;room.missionId=mid;room.delveId=null;Object.values(room.players).forEach(p=>p.ready=false);broadcastSnapshot()};g.appendChild(d)
  });
  if(profile){const div=document.createElement('div');div.className='delves-divider-v132';div.textContent='DISCOVERED DELVES — OPTIONAL DUNGEON CONTRACTS';g.appendChild(div);const discovered=profile.discoveredDelvesV132||['embercellar'];discovered.map(delveByIdV132).filter(Boolean).forEach(dv=>{const st=delveUnlockStateV132(profile,dv),card=document.createElement('div');card.className='mission delve-v132'+(r?.delveId===dv.id?' selected':'')+(st.locked?' locked':'');card.innerHTML=`<div class="zone-head"><b>⌂ ${dv.name}</b><span class="zone-tag">DELVE</span></div><div class="zone-tags"><span class="zone-tag">${dv.depths} FLOORS</span><span class="zone-tag gear">GEAR ${dv.minGear}+</span><span class="zone-tag">Lv ${dv.minLevel}+</span></div><div class="tiny">${dv.desc}</div><div class="delve-reward-v132"><b>BOARD CONTRACT:</b> ${dv.focus}<br>Final warden: ${dv.bossName}</div>${st.locked?`<div class="zone-lock">LOCKED — ${st.missing.join(' • ')}</div>`:''}`;card.onclick=()=>{if(st.locked)return toast(`Locked: ${st.missing.join(' • ')}`);if(!isHost)return toast('Only the host chooses the delve');room.delveId=dv.id;room.missionId=dv.source;selectedMission=dv.source;Object.values(room.players).forEach(p=>p.ready=false);broadcastSnapshot()};g.appendChild(card)})}
}

function renderDifficulties(){
  const r=room||snapshot,g=$('difficultyGrid');if(!g||!r)return;g.innerHTML='';
  Object.entries(DIFFICULTIES).forEach(([did,d])=>{
    const locked=profile&&profile.level<d.minLevel,el=document.createElement('div');el.className='diffcard'+((r.difficulty||'normal')===did?' selected':'')+(locked?' locked':'');
    el.innerHTML=`<b>${d.name}</b><div>${d.desc}</div>${locked?`<div class="bad" style="margin-top:3px">Lv ${d.minLevel} recommended</div>`:''}`;
    el.onclick=()=>{if(!isHost)return toast('Only the host sets difficulty');room.difficulty=did;Object.values(room.players).forEach(p=>p.ready=false);broadcastSnapshot()};g.appendChild(el)
  })
}
function toggleReady(){
  const r=room||snapshot,p=r?.players?.[peerId];if(!p)return;
  if(isHost){room.players[peerId].ready=!room.players[peerId].ready;broadcastSnapshot()}
  else send({type:'ready',peerId,ready:!p.ready})
}

function launchExpedition(){
  if(!isHost||!room)return;
  combatFloaters=[];combatFeed=[];worldFx=[];
  const mission=MISSIONS[room.missionId],delve=delveByIdV132(room.delveId),party=Object.values(room.players).filter(p=>p.connected!==false);if(!party.length)return;
  if(!party.every(p=>p.ready))return toast('Everyone must Ready Up first');
  const diff=DIFFICULTIES[room.difficulty||'normal'];const blocked=party.filter(p=>{if(delve)return p.level<Math.max(diff.minLevel,delve.minLevel)||(p.gearRating||0)<delve.minGear;return p.level<Math.max(diff.minLevel,mission.minLevel||1)||(p.gearRating||0)<(mission.minGear||0)||(mission.requiredTrophy&&!p.trophies?.includes(mission.requiredTrophy))});if(blocked.length)return toast(`Cannot launch: ${blocked.map(p=>delve?`${p.name} needs Lv ${Math.max(diff.minLevel,delve.minLevel)} / Gear ${delve.minGear}`:`${p.name} needs Lv ${Math.max(diff.minLevel,mission.minLevel||1)} / Gear ${mission.minGear||0}${mission.requiredTrophy?` / ${mission.requiredTrophy}`:''}`).join(' • ')}`);
  const modifier=structuredCloneSafe(pick(MODIFIERS));
  const daily=dailyHunt(),scoreKey=delve?`delve:${delve.id}:${room.difficulty||'normal'}`:`${room.missionId}:${room.difficulty||'normal'}`;room.run={runId:uid(),runSchemaVersion:1,missionId:room.missionId,isDelve:!!delve,delveId:delve?.id||null,delve:delve?structuredCloneSafe(delve):null,difficulty:room.difficulty||'normal',modifier,dailyBoost:delve?1:(daily.missionId===room.missionId?daily.bonus:1),ghostTarget:profile?.bestTimes?.[scoreKey]||null,depth:1,round:1,totalRounds:0,phase:'player',map:[],enemies:[],players:{},votes:{},log:[],cleared:false,startedAt:Date.now(),currentPath:null,pathChoices:null,stageEvent:null,deathCaches:[],huntHeat:1,campaignVersion:'v0.14.0'};
  room.run.deepHunt=delve?null:buildDeepHuntPlan(room.missionId);if(room.run.deepHunt?.active){room.run.deepHunt.currentNode=structuredCloneSafe(room.run.deepHunt.start);room.run.maxDepth=runDepthLimit(room.run);applyDeepNodeEntry(room.run,room.run.deepHunt.currentNode)}
  party.forEach(p=>room.run.players[p.peerId]=createRunPlayer(p));
  party.forEach(p=>p.prep={});
  generateStage(room.run,mission);
  room.log.push(`${delve?'Delve':'Expedition'} launched: ${delve?.name||mission.name} — ${diff.name}.`);room.run.log.push(`Condition: ${modifier.name} — ${modifier.desc}`);if(delve)room.run.log.push(`DELVE CONTRACT — ${delve.focus}. Clear ${delve.depths} dungeon floors and defeat ${delve.bossName}.`);if(room.run.dailyBoost>1)room.run.log.push(`DAILY HUNT: +25% reward value for ${mission.name}.`);if(room.run.ghostTarget)room.run.log.push(`Ghost pace: your best clear is ${room.run.ghostTarget}s.`);if(room.run.deepHunt?.active){room.run.log.push(`DEEP HUNT ACTIVE — track the target, choose branching routes, secure extraction sites, or press onward for greater rewards.`);room.run.log.push(`Spoor required to reveal the quarry: ${room.run.deepHunt.cfg.spoorRequired}.`)}room.run.log.push(`Depth 1. Every hunter gets one action per round.`);
  Object.values(room.players).forEach(p=>p.ready=false);room.worldSelectionV141=null;selectedTargetId=null;hide('lobbyOverlay');broadcastSnapshot();
}


function walkableNeighbors(m,x,y){
  return [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>isWalk(m,x+dx,y+dy)).length
}
function connectedWalkableCells(m,start){
  if(!start||!isWalk(m,start.x,start.y))return[];
  const q=[start],seen=new Set([K(start.x,start.y)]),out=[];
  while(q.length){
    const cur=q.shift();out.push(cur);
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=cur.x+dx,ny=cur.y+dy,k=K(nx,ny);
      if(seen.has(k)||!isWalk(m,nx,ny))continue;
      seen.add(k);q.push({x:nx,y:ny});
    }
  }
  return out
}
function chooseStageSpawnCells(m,count){
  const all=[];
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    if(isWalk(m,x,y)&&walkableNeighbors(m,x,y)>=2)all.push({x,y});
  }
  if(!all.length)return[];

  // Prefer a safe room near the upper-left, but require a large connected area.
  all.sort((a,b)=>(a.x+a.y)-(b.x+b.y)||b.y-a.y);
  let anchor=null,component=null;
  for(const candidate of all){
    const comp=connectedWalkableCells(m,candidate);
    if(comp.length>=Math.max(12,count*4)){anchor=candidate;component=comp;break}
  }
  if(!anchor){anchor=all[0];component=connectedWalkableCells(m,anchor)}

  const componentSet=new Set(component.map(c=>K(c.x,c.y)));
  const candidates=component
    .filter(c=>walkableNeighbors(m,c.x,c.y)>=2)
    .sort((a,b)=>{
      const da=Math.abs(a.x-anchor.x)+Math.abs(a.y-anchor.y);
      const db=Math.abs(b.x-anchor.x)+Math.abs(b.y-anchor.y);
      return da-db||walkableNeighbors(m,b.x,b.y)-walkableNeighbors(m,a.x,a.y);
    });

  const chosen=[];
  for(const c of candidates){
    // Keep the party close together while avoiding duplicate cells.
    if(chosen.every(s=>s.x!==c.x||s.y!==c.y)){
      chosen.push(c);
      if(chosen.length>=count)break;
    }
  }
  return chosen;
}
function placePlayersForStage(run){
  const players=Object.values(run.players||{});
  if(!players.length)return true;

  let cells=chooseStageSpawnCells(run.map,players.length);

  // Absolute fallback: find any connected walkable cells, carving a small safety room
  // only if a future generator somehow produces too few valid tiles.
  if(cells.length<players.length){
    for(let y=1;y<Math.min(H-1,6);y++)for(let x=1;x<Math.min(W-1,7);x++)run.map[y][x]='floor';
    cells=chooseStageSpawnCells(run.map,players.length);
  }

  players.forEach((p,i)=>{
    const s=cells[i]||cells[0]||{x:2,y:2};
    p.x=s.x;p.y=s.y;
  });

  const valid=players.every(p=>isWalk(run.map,p.x,p.y)&&walkableNeighbors(run.map,p.x,p.y)>=1);
  if(!valid)run.log?.push('Spawn safety repair was required on this depth.');
  return valid;
}
function repairInvalidStageSpawns(run){
  if(!run?.map||!run?.players)return false;
  const players=Object.values(run.players);
  const invalid=players.some(p=>!isWalk(run.map,p.x,p.y)||walkableNeighbors(run.map,p.x,p.y)===0);
  if(!invalid)return false;

  const before=players.map(p=>`${p.name}@${p.x},${p.y}`).join(', ');
  placePlayersForStage(run);
  const after=players.map(p=>`${p.name}@${p.x},${p.y}`).join(', ');
  run.log?.push(`Spawn repair: ${before} → ${after}`);
  return true;
}


function bossPartyScaling(partySize){
  const table={
    1:{hp:1.00,atk:1.00,def:1.00,pressure:1.00},
    2:{hp:2.15,atk:1.08,def:1.06,pressure:1.08},
    3:{hp:3.55,atk:1.15,def:1.10,pressure:1.16},
    4:{hp:5.15,atk:1.22,def:1.14,pressure:1.24}
  };
  return table[clamp(partySize,1,4)]||table[4]
}
function bossVisualSize(kind){
  if(['worldeater','riftboss','bossdrake','bossknight','mire'].includes(kind))return 5;
  return 3
}

function emberwoodTileOpen(x,y,m){return y>=0&&x>=0&&y<H&&x<W&&m[y][x]!=='tree'&&m[y][x]!=='rock'&&m[y][x]!=='wall'}
function generateEmberwoodFrontierMap(depth){
  const m=Array.from({length:H},()=>Array(W).fill('grass'));
  for(let x=0;x<W;x++){m[0][x]='tree';m[1][x]=(x%2===0?'tree':'grass');m[H-1][x]='tree'}
  for(let y=0;y<H;y++){m[y][0]='tree';m[y][W-1]='tree'}
  for(let x=1;x<W-1;x++){m[9][x]='path';if(x>5&&x<25)m[10][x]='path'}
  for(let y=7;y<14;y++)m[y][2]='path';for(let y=7;y<12;y++)m[y][3]='path';
  for(let x=10;x<15;x++)m[6][x]='path';for(let y=6;y<10;y++)m[y][14]='path';
  const groves=6+depth;
  for(let i=0;i<groves;i++){
    const cx=rand(4,W-5),cy=rand(3,H-4),rx=rand(1,3),ry=rand(1,2);
    for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){
      if(x<2||y<2||x>W-3||y>H-3)continue;
      if(Math.abs(x-2)+Math.abs(y-2)<4)continue;
      if(m[y][x]==='path')continue;
      if(((x-cx)*(x-cx))/(rx*rx+0.3)+((y-cy)*(y-cy))/(ry*ry+0.3)<=1.1 && Math.random()<0.8)m[y][x]='tree';
    }
  }
  const fallen=3+depth;
  for(let i=0;i<fallen;i++){const x=rand(4,W-5),y=rand(3,H-4);if(m[y][x]==='grass')m[y][x]='rock'}
  for(let i=0;i<10;i++){const x=rand(3,W-4),y=rand(3,H-4);if(m[y][x]==='grass'&&Math.abs(x-2)+Math.abs(y-2)>4)m[y][x]=chance(.55)?'rock':'tree'}
  // keep a safe start lane
  [[1,1],[2,1],[1,2],[2,2],[3,2],[2,3]].forEach(([x,y])=>{if(m[y]&&m[y][x])m[y][x]='grass'});
  return m
}
function generateEmberwoodFrontierProps(m,depth){
  const props=[];
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    const t=m[y][x],h=tileSeed(x,y,depth+401);
    if(t==='grass'){
      const nearPath=['path'].includes(m[y][x-1])||['path'].includes(m[y][x+1])||['path'].includes(m[y-1][x])||['path'].includes(m[y+1][x]);
      const nearTree=['tree'].includes(m[y][x-1])||['tree'].includes(m[y][x+1])||['tree'].includes(m[y-1][x])||['tree'].includes(m[y+1][x]);
      if(nearPath&&h%11===0)props.push({kind:'fern',x,y,layer:'under',v:h%3});
      else if(nearPath&&h%19===0)props.push({kind:'flowers',x,y,layer:'under',v:h%3});
      else if(nearTree&&h%17===0)props.push({kind:'stump',x,y,layer:'under',v:h%2});
      else if(nearTree&&h%23===0)props.push({kind:'mushrooms',x,y,layer:'under',v:h%2});
      else if(h%29===0)props.push({kind:'roots',x,y,layer:'under',v:h%2});
    }
    if(t==='path'&&h%13===0)props.push({kind:'pebbles',x,y,layer:'under',v:h%3});
    if(t==='rock'&&h%2===0)props.push({kind:'bones',x,y,layer:'under',v:h%2});
  }
  // handcrafted landmarks
  props.push({kind:'log',x:7,y:5,layer:'under',v:0});
  props.push({kind:'log',x:23,y:12,layer:'under',v:1});
  props.push({kind:'hunterCache',x:11,y:12,layer:'under',v:0});
  props.push({kind:'campRuin',x:18,y:6,layer:'under',v:0});
  props.push({kind:'shrine',x:26,y:8,layer:'under',v:0});
  return props.filter(p=>emberwoodTileOpen(p.x,p.y,m) && Math.abs(p.x-2)+Math.abs(p.y-2)>2)
}
function generateEmberwoodBossProps(){
  return [
    {kind:'totem',x:5,y:5,layer:'under',v:0},{kind:'totem',x:5,y:13,layer:'under',v:1},
    {kind:'totem',x:27,y:5,layer:'under',v:0},{kind:'totem',x:27,y:13,layer:'under',v:1},
    {kind:'log',x:8,y:9,layer:'under',v:0},{kind:'log',x:23,y:9,layer:'under',v:1},
    {kind:'bones',x:12,y:6,layer:'under',v:0},{kind:'bones',x:20,y:12,layer:'under',v:1},
    {kind:'bloodflowers',x:15,y:4,layer:'under',v:0},{kind:'bloodflowers',x:17,y:14,layer:'under',v:1},
    {kind:'lantern',x:10,y:4,layer:'under',v:0},{kind:'lantern',x:22,y:14,layer:'under',v:1},
    {kind:'denmouth',x:28,y:9,layer:'over',v:0},{kind:'clawmarks',x:14,y:9,layer:'under',v:0},{kind:'clawmarks',x:18,y:9,layer:'under',v:1},
    {kind:'skullpile',x:16,y:9,layer:'over',v:0}
  ]
}
function drawEmberwoodProp(p){
  const x=p.x*TILE,y=p.y*TILE,sec=performance.now()*0.001;ctx.save();
  const sh=(w,h,a=.18)=>{ctx.fillStyle=`rgba(0,0,0,${a})`;ctx.beginPath();ctx.ellipse(x+16,y+26,w,h,0,0,Math.PI*2);ctx.fill()};
  if(p.kind==='fern'){
    sh(8,3,.14);ctx.strokeStyle='#2d6b43';ctx.lineWidth=2;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(x+16,y+24);ctx.lineTo(x+10+i*3,y+17-(i%2));ctx.stroke()}ctx.lineWidth=1;
  }else if(p.kind==='flowers'){
    ctx.fillStyle='#2e7042';ctx.fillRect(x+14,y+19,1,5);ctx.fillRect(x+18,y+20,1,4);ctx.fillStyle=p.v===0?'#d6c26b':p.v===1?'#d78372':'#8dc4ff';ctx.fillRect(x+12,y+17,2,2);ctx.fillRect(x+16,y+18,2,2);ctx.fillRect(x+18,y+16,2,2)
  }else if(p.kind==='stump'){
    sh(7,3,.16);ctx.fillStyle='#6f5236';ctx.fillRect(x+11,y+16,10,9);ctx.fillStyle='#8b6a44';ctx.fillRect(x+12,y+14,8,4);ctx.fillStyle='#3f2d1d';ctx.fillRect(x+15,y+15,1,2)
  }else if(p.kind==='mushrooms'){
    ctx.fillStyle='#cbbca0';ctx.fillRect(x+13,y+20,1,4);ctx.fillRect(x+18,y+21,1,3);ctx.fillStyle=p.v===0?'#c95b51':'#e2d5af';ctx.fillRect(x+12,y+18,3,2);ctx.fillRect(x+17,y+19,3,2)
  }else if(p.kind==='roots'){
    ctx.strokeStyle='rgba(89,69,45,.5)';ctx.beginPath();ctx.moveTo(x+6,y+22);ctx.lineTo(x+14,y+18);ctx.lineTo(x+25,y+20);ctx.stroke();
  }else if(p.kind==='pebbles'){
    ctx.fillStyle='rgba(166,149,124,.42)';ctx.fillRect(x+8,y+18,2,2);ctx.fillRect(x+17,y+20,3,2);ctx.fillRect(x+22,y+14,2,2)
  }else if(p.kind==='bones'){
    ctx.fillStyle='#cdc4a6';ctx.fillRect(x+11,y+19,8,2);ctx.fillRect(x+13,y+17,2,6);ctx.fillRect(x+20,y+21,6,2);ctx.fillRect(x+22,y+19,2,6)
  }else if(p.kind==='log'){
    sh(11,3,.18);const flip=p.v===1?-1:1;ctx.fillStyle='#6c4e31';ctx.fillRect(x+6,y+16,20,7);ctx.fillStyle='#4e3623';ctx.fillRect(x+8,y+18,16,3);ctx.fillStyle='#8a6845';ctx.fillRect(x+5+(flip<0?15:0),y+17,4,5);ctx.fillRect(x+23-(flip<0?15:0),y+17,4,5)
  }else if(p.kind==='hunterCache'){
    sh(10,3,.2);ctx.fillStyle='#5d4030';ctx.fillRect(x+8,y+16,16,10);ctx.strokeStyle='#b7935b';ctx.strokeRect(x+8.5,y+16.5,15,9);ctx.fillStyle='#d1b15c';ctx.fillRect(x+14,y+20,4,2);ctx.fillStyle='#834';ctx.fillRect(x+10,y+13,11,3)
  }else if(p.kind==='campRuin'){
    sh(10,3,.18);ctx.fillStyle='#7f6d59';ctx.fillRect(x+8,y+18,6,6);ctx.fillRect(x+17,y+15,8,9);ctx.fillStyle='#5a4a39';ctx.fillRect(x+9,y+20,4,2);ctx.fillRect(x+18,y+18,5,2)
  }else if(p.kind==='shrine'){
    sh(10,3,.18);ctx.fillStyle='#6f7d70';ctx.fillRect(x+13,y+13,6,12);ctx.fillStyle='#b38e55';ctx.fillRect(x+10,y+11,12,3);ctx.fillStyle='rgba(245,194,102,.24)';ctx.beginPath();ctx.arc(x+16,y+10,4+Math.sin(sec*2)*.6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0c974';ctx.fillRect(x+15,y+8,2,2)
  }else if(p.kind==='lantern'){
    sh(7,2,.15);ctx.fillStyle='#5d412d';ctx.fillRect(x+15,y+12,2,13);ctx.fillStyle='#8e6a45';ctx.fillRect(x+12,y+12,8,8);ctx.fillStyle='rgba(255,188,92,.26)';ctx.beginPath();ctx.arc(x+16,y+16,6+Math.sin(sec*4)*.6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffd58b';ctx.fillRect(x+14,y+14,4,4)
  }else if(p.kind==='denmouth'){
    sh(14,4,.25);ctx.fillStyle='#2d2217';ctx.beginPath();ctx.ellipse(x+18,y+19,12,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4e3b28';ctx.fillRect(x+6,y+18,5,5);ctx.fillRect(x+22,y+17,4,4);ctx.fillStyle='#6f5235';ctx.fillRect(x+25,y+13,4,10)
  }else if(p.kind==='clawmarks'){
    ctx.strokeStyle='rgba(68,42,32,.55)';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x+10+i*4,y+12+(p.v?i:0));ctx.lineTo(x+9+i*4,y+22+(p.v?1:0));ctx.stroke()}ctx.lineWidth=1
  }else if(p.kind==='totem'){
    sh(8,3,.18);ctx.fillStyle='#5d412d';ctx.fillRect(x+14,y+11,4,14);ctx.fillStyle='#d0be99';ctx.fillRect(x+11,y+8,10,7);ctx.fillStyle='#44342a';ctx.fillRect(x+13,y+10,2,2);ctx.fillRect(x+17,y+10,2,2);ctx.fillRect(x+14,y+13,4,1);ctx.strokeStyle='#8c3338';ctx.beginPath();ctx.moveTo(x+16,y+15);ctx.lineTo(x+9,y+22);ctx.moveTo(x+16,y+15);ctx.lineTo(x+23,y+22);ctx.stroke();
  }else if(p.kind==='bloodflowers'){
    ctx.fillStyle='#2c6f3a';ctx.fillRect(x+14,y+18,1,6);ctx.fillRect(x+18,y+18,1,6);ctx.fillStyle='#a83540';ctx.fillRect(x+12,y+16,3,3);ctx.fillRect(x+17,y+15,3,3);ctx.fillStyle='rgba(255,90,90,.2)';ctx.fillRect(x+11,y+15,10,6)
  }else if(p.kind==='skullpile'){
    sh(12,4,.24);ctx.fillStyle='#cfc1a4';ctx.fillRect(x+11,y+18,5,4);ctx.fillRect(x+16,y+19,5,4);ctx.fillRect(x+14,y+15,4,4);ctx.fillStyle='#3a2c25';ctx.fillRect(x+12,y+19,1,1);ctx.fillRect(x+18,y+20,1,1);ctx.fillStyle='#814444';ctx.fillRect(x+13,y+22,6,2)
  }
  ctx.restore();
}
function drawEmberwoodProps(run,layer='under'){
  if(run?.missionId!=='frontier')return;
  (run.mapProps||[]).filter(p=>(p.layer||'under')===layer).forEach(drawEmberwoodProp)
}
function drawEmberwoodAtmosphere(run){
  if(run?.missionId!=='frontier')return;
  const sec=performance.now()*0.001,w=run.stageWeather||'clear';ctx.save();
  const particleCount=w==='ashfall'?34:w==='mist'?10:20;
  for(let i=0;i<particleCount;i++){
    const bx=(i*61)%canvas.width, by=(i*37)%canvas.height;
    const speed=w==='ashfall'?30:22, fall=w==='ashfall'?9:6;
    const dx=((sec*speed+i*13)% (canvas.width+36))-18, dy=(by+Math.sin(sec*0.9+i)*9+sec*fall*i)%canvas.height;
    ctx.fillStyle=w==='bloodmoon'?(i%2===0?'rgba(255,106,82,.11)':'rgba(167,77,72,.08)'):(i%3===0?'rgba(238,176,96,.11)':i%2===0?'rgba(215,131,84,.08)':'rgba(124,189,104,.07)');
    ctx.fillRect(Math.round((bx+dx)%canvas.width),Math.round(dy),w==='ashfall'?2:2,w==='ashfall'?3:2)
  }
  const g1=ctx.createLinearGradient(0,0,0,80);g1.addColorStop(0,'rgba(9,18,12,.30)');g1.addColorStop(1,'rgba(9,18,12,0)');ctx.fillStyle=g1;ctx.fillRect(0,0,canvas.width,92);
  const g2=ctx.createLinearGradient(0,0,80,0);g2.addColorStop(0,'rgba(9,18,12,.20)');g2.addColorStop(1,'rgba(9,18,12,0)');ctx.fillStyle=g2;ctx.fillRect(0,0,90,canvas.height);ctx.fillRect(canvas.width-90,0,90,canvas.height);
  if(w==='sunshafts'||w==='clear'){ctx.globalCompositeOperation='screen';ctx.globalAlpha=w==='sunshafts'?0.16:0.10;ctx.fillStyle='#f2c981';ctx.beginPath();ctx.moveTo(110,0);ctx.lineTo(180,0);ctx.lineTo(260,canvas.height);ctx.lineTo(190,canvas.height);ctx.closePath();ctx.fill();ctx.globalAlpha=.07;ctx.beginPath();ctx.moveTo(330,0);ctx.lineTo(390,0);ctx.lineTo(470,canvas.height);ctx.lineTo(420,canvas.height);ctx.closePath();ctx.fill()}
  if(w==='mist'){ctx.fillStyle='rgba(214,226,218,.08)';for(let i=0;i<4;i++){const yy=40+i*120+Math.sin(sec*0.7+i)*8;ctx.fillRect(0,yy,canvas.width,34)}}
  if(w==='bloodmoon'){ctx.fillStyle='rgba(104,28,26,.10)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(198,82,70,.08)';ctx.beginPath();ctx.arc(canvas.width-110,80,58,0,Math.PI*2);ctx.fill()}
  ctx.restore();
}


function generateEmberwoodWeather(depth,bossStage=false){
  if(bossStage)return 'bloodmoon';
  const table=['clear','sunshafts','mist','ashfall'];
  return table[(depth-1)%table.length]
}
function generateEmberwoodBossArenaMap(){
  const m=Array.from({length:H},()=>Array(W).fill('grass'));
  for(let x=0;x<W;x++){m[0][x]='tree';m[1][x]=(x%3===0?'tree':'grass');m[H-1][x]='tree';m[H-2][x]=(x%2===0?'tree':'grass')}
  for(let y=0;y<H;y++){m[y][0]='tree';m[y][1]=(y%2===0?'tree':'grass');m[y][W-1]='tree';m[y][W-2]=(y%2===1?'tree':'grass')}
  for(let y=5;y<=13;y++)for(let x=7;x<=24;x++)if((Math.abs(x-16)+Math.abs(y-9))<12)m[y][x]='path';
  for(let y=6;y<=12;y++)for(let x=10;x<=22;x++)if((Math.abs(x-16)+Math.abs(y-9))<8)m[y][x]='bossmark';
  [[6,4],[25,4],[5,14],[26,14],[8,3],[23,15]].forEach(([x,y])=>m[y][x]='rock');
  // hunter approach lane
  for(let y=7;y<=11;y++)for(let x=1;x<=5;x++)m[y][x]='path';
  return m
}
function generateEmberwoodLootables(m,depth,bossStage=false){
  const spots=[];
  const add=(kind,x,y,v=0)=>{if(emberwoodTileOpen(x,y,m)&&Math.abs(x-2)+Math.abs(y-2)>3)spots.push({kind,x,y,v,collected:false})};
  if(bossStage){add('relic',4,9,0);add('cache',27,9,1);add('herb',16,3,0);return spots}
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){
    const t=m[y][x],h=tileSeed(x,y,depth+991);
    if(t==='path'&&h%41===0)add('cache',x,y,h%2);
    else if(t==='grass'&&h%47===0)add('herb',x,y,h%2);
    else if(t==='grass'&&h%79===0)add('relic',x,y,h%2);
  }
  return spots.slice(0,4)
}
function drawEmberwoodLootable(l){
  if(l.collected)return;
  const x=l.x*TILE,y=l.y*TILE,sec=performance.now()*0.001;ctx.save();
  const glow=(c,r,a=.24)=>{const g=ctx.createRadialGradient(x+16,y+16,2,x+16,y+16,r);g.addColorStop(0,c.replace('ALPHA',a));g.addColorStop(1,c.replace('ALPHA','0'));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2+32,r*2+32)};
  if(l.kind==='cache'){
    glow('rgba(255,188,92,ALPHA)',18,.22);ctx.fillStyle='#5f4330';ctx.fillRect(x+8,y+15,16,11);ctx.strokeStyle='#c7a360';ctx.strokeRect(x+8.5,y+15.5,15,10);ctx.fillStyle='#d7b35a';ctx.fillRect(x+14,y+19,4,2);ctx.fillStyle='#833f33';ctx.fillRect(x+10,y+12,12,3)
  }else if(l.kind==='herb'){
    glow('rgba(120,232,146,ALPHA)',16,.18);ctx.strokeStyle='#2f7b45';ctx.lineWidth=2;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(x+16,y+24);ctx.lineTo(x+10+i*2,y+16-(i%2));ctx.stroke()}ctx.lineWidth=1;ctx.fillStyle='#9ce0a2';ctx.fillRect(x+14,y+14,2,2)
  }else if(l.kind==='relic'){
    glow('rgba(255,129,92,ALPHA)',20,.22);ctx.fillStyle='#6d7367';ctx.fillRect(x+12,y+13,8,12);ctx.fillStyle='#b8915f';ctx.fillRect(x+10,y+11,12,3);ctx.fillStyle='rgba(255,211,130,.4)';ctx.beginPath();ctx.arc(x+16,y+9,4+Math.sin(sec*3)*.9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffd879';ctx.fillRect(x+15,y+7,2,2)
  }
  ctx.restore();
}
function drawEmberwoodLootables(run){
  if(run?.missionId!=='frontier')return;
  (run.lootables||[]).forEach(drawEmberwoodLootable)
}
function collectEmberwoodLootable(run,p,x,y){
  if(run?.missionId!=='frontier')return;
  const l=(run.lootables||[]).find(o=>!o.collected&&o.x===x&&o.y===y);if(!l)return;
  l.collected=true;
  if(l.kind==='cache'){
    const gold=12+run.depth*6,mat=1+Math.floor(run.depth/2);p.runLoot.gold+=gold;p.runLoot.common+=mat;pushCombatFloaterPlayer(p,`CACHE +${gold}g`,'#e6c36a',11,900);run.log.push(`${p.name} loots a hunter cache (+${gold} gold, +${mat} common).`)
  }else if(l.kind==='herb'){
    const heal=Math.min(p.maxHp-p.hp,Math.round(p.maxHp*.12));p.hp+=heal;p.runLoot.common+=1;trackHealing(p,heal);pushCombatFloaterPlayer(p,`HERBS +${heal}`,'#8fe0a0',11,900);run.log.push(`${p.name} gathers emberleaf herbs and recovers ${heal} HP.`)
  }else if(l.kind==='relic'){
    const rare=chance(.35)?1:0,gold=8+run.depth*4;p.runLoot.gold+=gold;p.runLoot.common+=1;p.runLoot.rare+=rare;p.res=Math.min(p.maxRes,p.res+2);pushCombatFloaterPlayer(p,rare?`RELIC +1 rare`:`RELIC +${gold}g`,'#ffb07a',11,950);run.log.push(`${p.name} claims a frontier relic cache${rare?' (+1 rare material)':''}.`)
  }
}


function generateWorldEaterArenaMap(){
  const m=Array.from({length:H},()=>Array(W).fill('wall'));
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++)m[y][x]='floor';
  for(let y=6;y<=12;y++)for(let x=1;x<=8;x++)m[y][x]='floor';
  for(let y=4;y<=14;y++)for(let x=9;x<=26;x++)if(Math.abs(x-18)+Math.abs(y-9)<15)m[y][x]='bossmark';
  [[7,4],[7,14],[12,3],[12,15],[17,3],[17,15],[27,5],[27,13],[24,3],[24,15]].forEach(([x,y])=>m[y][x]='wall');
  for(let y=2;y<=6;y++)for(let x=1;x<=6;x++)m[y][x]='floor';
  return m
}
function worldEaterStageName(depth){return({1:'I — RIFTFALL APPROACH',2:'II — CARRION FIELDS',3:'III — MAW NURSERY',4:'IV — HERALD’S CROSSING',5:'V — THE BROKEN HORIZON',6:'VI — RIFT CRATER'})[depth]||'GRAND HUNT'}
function worldEaterPhaseName(e){return({1:'CARAPACE OF HUNGER',2:'THE WORLD FRACTURES',3:'HEART OF THE ABYSS',4:'END OF THE WORLD'})[e?.bossPhase||1]||'APOCALYPSE'}
function worldEaterIntentName(e){return({rift_burst:'RIFT ERUPTION — MOVE',abyssal_gaze:'ABYSSAL GAZE — LEAVE THE LINE',worldbreak:'WORLDBREAK — LEAVE THE RUPTURE LANES'})[e?.intent]||'Break anatomy for stagger windows.'}
function worldEaterCooldowns(e){e.raidCooldowns=e.raidCooldowns||{rift:1,gaze:2,worldbreak:3,claw:0};return e.raidCooldowns}
function tickWorldEaterCooldowns(e){const c=worldEaterCooldowns(e);Object.keys(c).forEach(k=>c[k]=Math.max(0,(c[k]||0)-1));if(e.raidVulnerability>0)e.raidVulnerability--;return c}
function worldEaterPlayerDamage(run,e,p,mult,label,guardFactor=.48){
  if(chance(dodgeChance(p)*.72)){pushCombatFloaterPlayer(p,'EVADE','#9bd7ff',11,760);run.log.push(`${p.name} evades ${label}.`);return 0}
  let dmg=Math.max(2,Math.round(e.atk*mult)-Math.floor((p.def+(p.status.partyDef||0)+runDefBonus(p))*.55));if(p.guarding)dmg=Math.max(1,Math.round(dmg*ascentGuardV11(p,guardFactor)));
  p.hp-=dmg;p.hitFlash=Date.now();pushCombatFloaterPlayer(p,`-${dmg}`,'#ff736b',13,900);pushCombatFeed('bad',e.name,dmg,label);const q=combatPointPlayer(p);emitWorldFx('spark',q.x,q.y,'#ff4e58',10,470);if(dmg>Math.max(15,p.maxHp*.22))shakeScreen(4,150);if(p.hp<=0)downPlayer(run,p);return dmg
}
function raidCellKey(x,y){return `${x},${y}`}
function worldEaterBurstCells(cx,cy){const out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=cx+dx,y=cy+dy;if(x>=1&&y>=1&&x<W-1&&y<H-1)out.push({x,y})}return out}
function worldEaterLineCells(e,t,maxLen=7){const out=[],dx=t.x-e.x,dy=t.y-e.y,steps=Math.max(1,Math.max(Math.abs(dx),Math.abs(dy))),sx=dx/steps,sy=dy/steps;for(let i=1;i<=Math.min(maxLen,steps+2);i++){const x=Math.round(e.x+sx*i),y=Math.round(e.y+sy*i);if(x>0&&y>0&&x<W-1&&y<H-1)out.push({x,y})}return out}
function worldEaterWorldbreakCells(t){const cols=[clamp(t.x,3,W-4),clamp(t.x-5,3,W-4),clamp(t.x+5,3,W-4)],out=[];cols.forEach(x=>{for(let y=2;y<H-2;y++)out.push({x,y})});return out}
function worldEaterSetIntent(run,e,intent,cells,targetName='the arena'){
  e.intent=intent;e.intentCells=cells;e.intentTargetName=targetName;e.intentSetAt=Date.now();setBossAnim(e,intent==='worldbreak'?'enrage':'special',intent==='worldbreak'?1100:900);
  run.bossTelegraph=intent==='rift_burst'?`${e.name} marks ${targetName} for RIFT ERUPTION — move out of the red ground!`:intent==='abyssal_gaze'?`${e.name} fixes an ABYSSAL GAZE on ${targetName} — leave the line!`:`${e.name} begins WORLDBREAK — step out of the rupture lanes!`;
  pushCombatFloaterEntity(e,'TELEGRAPH','#ff9a73',13,950);run.log.push(`⚠ ${run.bossTelegraph}`)
}
function worldEaterResolveIntent(run,e){
  const cells=e.intentCells||[],keys=new Set(cells.map(c=>raidCellKey(c.x,c.y))),intent=e.intent;const victims=Object.values(run.players).filter(p=>!p.dead&&!p.downed&&keys.has(raidCellKey(p.x,p.y)));setBossAnim(e,'attack',intent==='worldbreak'?900:700);
  const c=combatPointEntity(e),color=intent==='worldbreak'?'#ff414a':intent==='abyssal_gaze'?'#c75cff':'#ff674e';emitWorldFx('spark',c.x,c.y,color,intent==='worldbreak'?36:24,760);shakeScreen(intent==='worldbreak'?7:5,220);
  if(!victims.length)run.log.push(`The party clears ${intent==='worldbreak'?'the Worldbreak lanes':'the marked danger zone'} in time.`);
  victims.forEach(p=>{const mult=intent==='worldbreak'?(e.bossPhase>=4?1.28:1.12):intent==='abyssal_gaze'?1.05:.9;worldEaterPlayerDamage(run,e,p,mult,intent.toUpperCase().replace('_',' '),intent==='worldbreak'?.36:.45)});
  if(intent==='rift_burst'){run.raidHazards=run.raidHazards||[];cells.filter((_,i)=>i%2===0).forEach(cel=>run.raidHazards.push({x:cel.x,y:cel.y,untilRound:run.round+2,kind:'rift'}))}
  e.intent=null;e.intentCells=null;e.intentTargetName=null;run.bossTelegraph=null
}
function tickWorldEaterHazards(run,e){
  if(!run.raidHazards?.length)return;const hits=new Set();run.raidHazards=run.raidHazards.filter(h=>h.untilRound>=run.round);
  Object.values(run.players).filter(p=>!p.dead&&!p.downed).forEach(p=>{if(run.raidHazards.some(h=>h.x===p.x&&h.y===p.y)&&!hits.has(p.peerId)){hits.add(p.peerId);const dmg=worldEaterPlayerDamage(run,e,p,.34,'LINGERING RIFT',.55);if(dmg)p.status.burn=Math.max(p.status.burn||0,1)}})
}
function spawnWorldEaterAdds(run,e,count){
  const spots=[[12,5],[12,13],[8,5],[8,13],[16,4],[16,14]],base=ENEMY.worldeater,party=e.partySize||1;let made=0;
  for(const [x,y] of spots){if(made>=count)break;if(!isWalk(run.map,x,y)||run.enemies.some(o=>o.hp>0&&enemyOccupiesTile(o,x,y))||Object.values(run.players).some(p=>!p.dead&&!p.downed&&p.x===x&&p.y===y))continue;const hp=Math.round(base.hp*(1.2+.35*(party-1))),atk=Math.round(base.atk*(.9+.07*(party-1))),def=base.def;run.enemies.push(makeEnemyParts({id:uid(),kind:'worldeater',name:'World-Eater Spawn',x,y,elite:true,trait:'RIFT SPAWN',boss:false,raidAdd:true,maxHp:hp,hp,atk,def,xp:Math.round(base.xp*.65),status:{poison:0,burn:0,bleed:0},intent:null}));made++}
  if(made){run.log.push(`☠ ${made} World-Eater Spawn tear through the fractures.`);const q=combatPointEntity(e);addRingFx(q.x,q.y,'#b747ef',70,800,4)}
}
function worldEaterTransition(run,e,newPhase){
  e.bossPhase=newPhase;e.raidPhaseAt=Date.now();setBossAnim(e,'enrage',1250);const q=combatPointEntity(e),color=newPhase===2?'#b95aff':newPhase===3?'#ff4f74':'#ff3b3b';addRingFx(q.x,q.y,color,86,1100,5);emitWorldFx('spark',q.x,q.y,color,42,900);shakeScreen(8,340);pushCombatFloaterEntity(e,`PHASE ${newPhase}`,'#ffd0a0',19,1400);
  if(newPhase===2){e.atk=Math.round(e.atk*1.07);spawnWorldEaterAdds(run,e,Math.min(4,1+(e.partySize||1)));run.log.push('THE WORLD FRACTURES — carapace breached. Destroy the spawn and watch the marked ground.')}
  if(newPhase===3){e.heartExposed=true;e.def=Math.max(0,e.def-2);run.log.push('THE ABYSSAL HEART IS EXPOSED — break it before the 25% health lock to open the final phase.')}
  if(newPhase===4){e.atk=Math.round(e.atk*1.10);e.def=Math.max(0,e.def-1);run.raidHazards=run.raidHazards||[];[[10,5],[10,13],[16,5],[16,13],[22,5],[22,13]].forEach(([x,y])=>run.raidHazards.push({x,y,untilRound:run.round+99,kind:'collapse'}));run.log.push('END OF THE WORLD — permanent fractures consume the arena. Finish the hunt.')}
  run.bossTelegraph=null
}
function updateWorldEaterPhases(run,e){const r=e.hp/e.maxHp,horn=e.parts?.find(p=>p.id==='horn'),heart=e.parts?.find(p=>p.id==='heart');if(e.bossPhase===1&&r<=.75&&horn?.broken)worldEaterTransition(run,e,2);else if(e.bossPhase===2&&r<=.50)worldEaterTransition(run,e,3);else if(e.bossPhase===3&&r<=.25&&heart?.broken)worldEaterTransition(run,e,4)}
function worldEaterClaw(run,e){const victims=Object.values(run.players).filter(p=>!p.dead&&!p.downed&&distanceToEnemy(p,e)<=1);setBossAnim(e,'attack',640);e.raidCooldowns.claw=1;run.log.push(`${e.name} rakes the hunters at its feet with ABYSSAL CLAWS.`);victims.forEach(p=>worldEaterPlayerDamage(run,e,p,e.bossPhase>=4?1.08:.92,'ABYSSAL CLAW',.5))}
function resolveWorldEaterBossAction(run,e,targets,t){
  tickWorldEaterCooldowns(e);tickWorldEaterHazards(run,e);if(e.intent){worldEaterResolveIntent(run,e);return true}const c=worldEaterCooldowns(e),dist=distanceToEnemy(t,e),phase=e.bossPhase||1;
  if(phase>=4&&c.worldbreak<=0){c.worldbreak=2;worldEaterSetIntent(run,e,'worldbreak',worldEaterWorldbreakCells(t),t.name);return true}
  if(phase>=3&&c.gaze<=0&&dist>=2&&dist<=7&&chance(.42)){c.gaze=3;worldEaterSetIntent(run,e,'abyssal_gaze',worldEaterLineCells(e,t,7),t.name);return true}
  if(c.rift<=0&&dist<=8&&chance(phase>=2?.48:.34)){c.rift=phase>=4?1:2;worldEaterSetIntent(run,e,'rift_burst',worldEaterBurstCells(t.x,t.y),t.name);return true}
  if(dist<=1){worldEaterClaw(run,e);return true}const moved=bossMoveTowardTarget(run,e,t,dist>6?2:1);if(moved){setBossAnim(e,'move',520);run.log.push(`${e.name} grinds across the shattered arena.`)}return true
}
function drawGrandHuntHazards(run){
  if(run?.missionId!=='worldeater'||!run.bossStage)return;const boss=run.enemies?.find(e=>e.boss&&e.kind==='worldeater'&&e.hp>0),sec=performance.now()/1000;ctx.save();ctx.globalCompositeOperation='lighter';
  (run.raidHazards||[]).forEach(h=>{const x=h.x*TILE,y=h.y*TILE,p=.12+.08*Math.sin(sec*5+h.x),collapse=h.kind==='collapse';ctx.fillStyle=collapse?`rgba(255,64,57,${p+.04})`:`rgba(173,52,236,${p})`;ctx.fillRect(x+2,y+2,TILE-4,TILE-4);ctx.strokeStyle=collapse?'rgba(255,145,93,.62)':'rgba(217,91,255,.38)';ctx.strokeRect(x+5.5,y+5.5,TILE-11,TILE-11)});
  if(boss?.intentCells?.length){const color=boss.intent==='abyssal_gaze'?'rgba(202,77,255,':'rgba(255,73,65,';boss.intentCells.forEach(c=>{const x=c.x*TILE,y=c.y*TILE,a=.16+.12*Math.sin(sec*8+c.x);ctx.fillStyle=`${color}${a})`;ctx.fillRect(x+1,y+1,TILE-2,TILE-2);ctx.strokeStyle=boss.intent==='worldbreak'?'rgba(255,187,125,.7)':'rgba(255,121,101,.65)';ctx.lineWidth=2;ctx.strokeRect(x+3,y+3,TILE-6,TILE-6);ctx.lineWidth=1})}ctx.restore()
}
function renderGrandHuntHud(run){
  const hud=$('grandHuntHud'),cin=$('grandHuntCinematic');if(!hud||!cin)return;const boss=run?.enemies?.find(e=>e.boss&&e.kind==='worldeater'&&e.hp>0);if(!boss){hud.classList.remove('show');cin.classList.remove('show');return}hud.classList.add('show');
  const horn=boss.parts?.find(p=>p.id==='horn'),heart=boss.parts?.find(p=>p.id==='heart');$('grandPhase').innerHTML=`<b>PHASE ${boss.bossPhase||1} / 4</b>${worldEaterPhaseName(boss)}`;const mechanic=boss.intent?worldEaterIntentName(boss):!horn?.broken?'CARAPACE LOCK — break the World Horn to breach the 75% health gate':boss.heartExposed&&!heart?.broken?'HEART EXPOSED — break the Abyssal Heart before the 25% health gate':boss.bossPhase===2?'CARAPACE BREACHED — survive the fractures; the heart opens at 50%':boss.bossPhase>=4?'HEART BROKEN — burn the World Eater before the arena collapses':'Anatomy broken — press the damage window';$('grandMechanic').innerHTML=`<b>MECHANIC</b>${mechanic}`;
  const adds=run.enemies.filter(e=>e.raidAdd&&e.hp>0).length,heartText=!boss.heartExposed&&!heart?.broken?'SEALED':heart?.broken?'BROKEN':Math.max(0,heart?.hp||0);$('grandParts').innerHTML=`<b>ANATOMY</b>Horn ${horn?.broken?'BROKEN':Math.max(0,horn?.hp||0)} • Heart ${heartText}${adds?` • Adds ${adds}`:''}`;const age=Date.now()-(run.grandIntroAt||0);cin.classList.toggle('show',age>=0&&age<3400)
}

function generateBossArenaMap(kind){
  const m=Array.from({length:H},()=>Array(W).fill('wall'));
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++)m[y][x]='floor';
  for(let y=7;y<=11;y++)for(let x=1;x<=5;x++)m[y][x]='floor';
  const pillars=[[8,4],[8,14],[14,4],[14,14],[20,4],[20,14],[26,5],[26,13]];
  pillars.forEach(([x,y])=>{if(!(kind==='worldeater'&&x>=20))m[y][x]='wall'});
  for(let x=6;x<W-4;x+=3){m[3][x]='bossmark';m[H-4][x]='bossmark'}
  return m
}
function bossFootprintCells(e,x=e.x,y=e.y){
  if(!e?.boss)return[{x,y}];
  const size=e.size||3,half=Math.floor(size/2),cells=[];
  for(let dy=-half;dy<=half;dy++)for(let dx=-half;dx<=half;dx++)cells.push({x:x+dx,y:y+dy});
  return cells
}
function enemyOccupiesTile(e,x,y){
  return !!e&&e.hp>0&&bossFootprintCells(e).some(c=>c.x===x&&c.y===y)
}
function enemyAtTile(run,x,y){
  return run?.enemies?.find(e=>enemyOccupiesTile(e,x,y))||null
}
function distancePointToEnemy(x,y,e){
  return Math.min(...bossFootprintCells(e).map(c=>Math.abs(x-c.x)+Math.abs(y-c.y)))
}
function distanceToEnemy(p,e){return distancePointToEnemy(p.x,p.y,e)}
function bossFootprintIsClear(run,e,nx,ny){
  const cells=bossFootprintCells(e,nx,ny);
  if(cells.some(c=>!isWalk(run.map,c.x,c.y)))return false;
  if(cells.some(c=>Object.values(run.players).some(p=>!p.dead&&p.x===c.x&&p.y===c.y)))return false;
  if(cells.some(c=>run.enemies.some(o=>o!==e&&o.hp>0&&enemyOccupiesTile(o,c.x,c.y))))return false;
  return true
}
function createColossalBoss(run,mission,partySize,diff,mod,path){
  const b=mission.boss,party=bossPartyScaling(partySize);
  const difficultyScale=mission.diff*diff.enemy*mod.enemy*(path.enemy||1)*1.12;
  const size=bossVisualSize(b.kind),x=b.kind==='worldeater'?21:22,y=Math.floor(H/2);
  const tuning={direwolf:{hp:8.0,atk:1.02,def:1.16},bossgoblin:{hp:6.2,atk:1.00,def:1.12},mire:{hp:6.8,atk:1.00,def:1.14},bossknight:{hp:7.4,atk:1.02,def:1.16},bossdrake:{hp:7.8,atk:1.02,def:1.14},riftboss:{hp:8.4,atk:1.04,def:1.16},worldeater:{hp:6.8,atk:1.04,def:1.16},default:{hp:5.8,atk:1.05,def:1.12}}[b.kind]||{hp:5.8,atk:1.05,def:1.12};
  const groupDurability=({1:1.00,2:1.18,3:1.42,4:1.68}[clamp(partySize,1,4)]||1);
  const direfangExtra=b.kind==='direwolf'?({1:1.00,2:1.18,3:1.28,4:1.36}[clamp(partySize,1,4)]||1):1;
  const maxHp=Math.round(b.hp*difficultyScale*tuning.hp*party.hp*groupDurability*direfangExtra*1.22);
  const boss=makeEnemyParts({
    id:uid(),kind:b.kind,name:b.name,x,y,size,elite:true,trait:b.kind==='direwolf'?'APEX PACKLORD':b.kind==='bossgoblin'?'SCRAP-CROWN TYRANT':b.kind==='mire'?'FUNGAL MATRIARCH':b.kind==='bossknight'?'ASHBOUND LORD':b.kind==='bossdrake'?'GLACIAL APEX':b.kind==='riftboss'?'RIFT CHORUS':b.kind==='worldeater'?'GRAND HUNT — APOCALYPSE CLASS':'COLOSSAL HUNT TARGET',
    boss:true,bossPhase:1,partySize,partyScale:party,gearTarget:mission.minGear||0,
    maxHp,hp:maxHp,
    atk:Math.round(b.atk*difficultyScale*tuning.atk*party.atk*1.15),
    def:Math.round(b.def*difficultyScale*tuning.def*party.def),
    xp:Math.round(b.xp*(b.kind==='direwolf'?1.35:1)*diff.reward*mod.reward*(path.reward||1)*(run.dailyBoost||1)*.65),
    status:{poison:0,burn:0,bleed:0},intent:null
  });
  if(b.kind==='direwolf'){boss.cooldowns={pounce:1,howl:2,rend:0};boss.packFury=0}if(campaignBossKind(b.kind))boss.v09cd={a:1,b:2,c:0};
  if(b.kind==='worldeater'){boss.raidCooldowns={rift:1,gaze:2,worldbreak:3,claw:0};boss.raidVulnerability=0;boss.heartExposed=false;boss.heartBroken=false;boss.trait='GRAND HUNT — APOCALYPSE CLASS'}
  (boss.parts||[]).forEach(part=>{
    part.maxHp=Math.max(part.maxHp,Math.round(maxHp*(b.kind==='direwolf'?.18:.16)));
    part.hp=part.maxHp
  });
  return boss
}
function updateBossPhases(run,e){
  if(!e?.boss||e.hp<=0)return;
  if(e.kind==='worldeater'){updateWorldEaterPhases(run,e);return}
  const ratio=e.hp/e.maxHp;
  if(e.bossPhase===1&&ratio<=.66){
    e.bossPhase=2;e.atk=Math.round(e.atk*1.14);e.def+=1;onCampaignBossPhaseV09(run,e,2);
    const q=combatPointEntity(e);addRingFx(q.x,q.y,'#ff874f',60,900,4);emitWorldFx('spark',q.x,q.y,'#ff6f43',26,720);shakeScreen(5,220);pushCombatFloaterEntity(e,'PHASE II','#ff9b5b',17,1250);run.log.push(`🔥 ${e.name} ENRAGES — PHASE II!`);
    run.bossTelegraph=`${e.name} — PHASE II: ENRAGED`;flowBannerV13('PHASE II',`${e.name} enrages. Its attack pattern intensifies.`,'boss','BOSS ESCALATION')
  }else if(e.bossPhase===2&&ratio<=.32){
    e.bossPhase=3;e.atk=Math.round(e.atk*1.18);e.def+=2;onCampaignBossPhaseV09(run,e,3);
    const q=combatPointEntity(e);addRingFx(q.x,q.y,'#ff404e',74,1050,5);emitWorldFx('spark',q.x,q.y,'#ff3b4a',36,820);shakeScreen(7,300);pushCombatFloaterEntity(e,'FINAL PHASE','#ff6570',18,1400);run.log.push(`☠ ${e.name} enters its FINAL PHASE!`);
    run.bossTelegraph=`${e.name} — FINAL PHASE`;flowBannerV13('FINAL PHASE',`${e.name} is desperate. Finish the hunt.`,'boss','NO MISTAKES')
  }
}
function bossDevastationChance(e){
  if(e.kind==='direwolf'||e.kind==='worldeater')return 0;
  const base=e.bossPhase>=3?.62:e.bossPhase===2?.48:.34;
  return Math.min(.78,base*(e.partyScale?.pressure||1))
}
function bossSignatureAttack(e){
  const names={
    direwolf:e.bossPhase>=3?'BLOODMOON REND':'HOWLING POUNCE',
    bossgoblin:e.bossPhase>=3?'THE KING’S LAST DECREE':'GUTTERQUAKE',
    mire:e.bossPhase>=3?'DROWN THE HUNT':'MIREFLOOD',
    bossknight:e.bossPhase>=3?'FINAL ASHBOUND JUDGMENT':'ASHBOUND JUDGMENT',
    bossdrake:e.bossPhase>=3?'ABSOLUTE WHITEOUT':'FROSTMAW WHITEOUT',
    riftboss:e.bossPhase>=3?'FINAL CHORUS':'CHORUS OF RUIN',
    worldeater:e.bossPhase>=3?'END OF THE WORLD':'WORLDBREAK'
  };
  return names[e.kind]||'DEVASTATION'
}
function drawBossHealthBar(run){
  const boss=run?.enemies?.find(e=>e.boss&&e.hp>0);if(!boss)return;
  const w=canvas.width*.62,h=16,x=(canvas.width-w)/2,y=43;
  ctx.fillStyle='rgba(6,8,12,.92)';ctx.fillRect(x-7,y-19,w+14,43);
  ctx.strokeStyle='#a88a58';ctx.lineWidth=2;ctx.strokeRect(x-7,y-19,w+14,43);ctx.lineWidth=1;
  ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillStyle='#f0d184';
  ctx.fillText(`${boss.name} — PHASE ${boss.bossPhase||1} — GEAR ${boss.gearTarget||0}+`,canvas.width/2,y-6);
  ctx.fillStyle='#261b20';ctx.fillRect(x,y,w,h);
  ctx.fillStyle=boss.bossPhase>=3?'#e54c54':boss.bossPhase===2?'#df784c':'#c65359';
  ctx.fillRect(x,y,w*clamp(boss.hp/boss.maxHp,0,1),h);
  ctx.strokeStyle='#e6c77b';ctx.strokeRect(x,y,w,h);
  if(boss.kind==='worldeater'){ctx.strokeStyle='rgba(255,226,186,.42)';[.25,.5,.75].forEach(v=>{ctx.beginPath();ctx.moveTo(x+w*v,y);ctx.lineTo(x+w*v,y+h);ctx.stroke()});ctx.font='bold 8px monospace';ctx.fillStyle='#d7a4a0';ctx.fillText(worldEaterPhaseName(boss),canvas.width/2,y+28)}
  ctx.font='bold 10px monospace';ctx.fillStyle='#fff0cf';
  ctx.fillText(`${Math.max(0,boss.hp).toLocaleString()} / ${boss.maxHp.toLocaleString()} HP`,canvas.width/2,y+12);
  ctx.textAlign='left'
}

function generateStage(run,mission){
  const bossStage=run?.isWorldSkirmish?false:(run?.isDelve?run.depth===run.delve.depths:(run?.deepHunt?.active?deepCurrentNode(run)?.type==='boss':run.depth===mission.depths));
  if(run.isDelve)run.map=generateDungeonMap(run.depth*17+(run.delve?.depths||3));
  else if(run.missionId==='worldeater'&&bossStage)run.map=generateWorldEaterArenaMap();
  else if(run.missionId==='frontier'&&bossStage)run.map=generateEmberwoodBossArenaMap();
  else if(run.missionId==='frontier'&&!bossStage)run.map=generateEmberwoodFrontierMap(run.depth);
  else run.map=bossStage?generateBossArenaMap(mission.boss.kind):(mission.open?generateOpenMap(run.depth):generateDungeonMap(run.depth));
  if(run.missionId==='worldeater'&&!bossStage){for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(run.map[y][x]==='floor'&&((x*17+y*29+run.depth*7)%23===0))run.map[y][x]='bossmark'}
  run.grandStageName=run.missionId==='worldeater'?worldEaterStageName(run.depth):null;
  run.stageWeather=!run.isDelve&&run.missionId==='frontier'?generateEmberwoodWeather(run.depth,bossStage):null;
  run.mapProps=!run.isDelve&&run.missionId==='frontier'?(bossStage?generateEmberwoodBossProps():generateEmberwoodFrontierProps(run.map,run.depth)):[];
  run.lootables=!run.isDelve&&run.missionId==='frontier'?generateEmberwoodLootables(run.map,run.depth,bossStage):[];
  run.raidHazards=[];if(run.missionId==='worldeater'&&bossStage)run.grandIntroAt=Date.now();
  run.zoneStageName=zoneStageName(run);
  run.enemies=[];run.votes={};run.cleared=false;run.bossTelegraph=null;run.bossStage=bossStage;run.bossIntroRound=bossStage?run.round:0;
  placePlayersForStage(run);
  const partySize=Object.keys(run.players).length,diff=DIFFICULTIES[run.difficulty||'normal'],mod=run.modifier||MODIFIERS[0],path=run.currentPath||{enemy:1,elite:0,loot:0,reward:1},event=(bossStage||run?.isWorldSkirmish)?null:(chance(run.missionId==='frontier'?.28:.10)?pick(run.missionId==='frontier'?[...V10_FRONTIER_EVENTS,...RARE_EVENTS]:RARE_EVENTS):null);run.stageEvent=event;
  const baseCount=run?.isWorldSkirmish?(run.worldEncounter?.count||3):(bossStage?0:(mission.open?5:6)),depthPressure=Math.min(4,Math.floor(run.depth/2)),count=bossStage?0:(baseCount+depthPressure+(partySize-1)*2+(mod.extra||0)+(event?.extra||0)+(path.extra||0)+(path.id==='smuggler'?-2:0));
  const occupied=new Set(Object.values(run.players).map(p=>K(p.x,p.y)));
  for(let i=0;i<count;i++){
    const pos=randomWalkable(run.map,occupied,8);if(!pos)continue;
    const kind=run?.isWorldSkirmish?(run.worldEncounter?.kind||pick(mission.enemies)):pick(mission.enemies),base=ENEMY[kind],elite=run?.isWorldSkirmish?((run.worldEncounter?.elite&&i===0)||chance(.04)):chance(.12+run.depth*.03+(run.difficulty==='nightmare'?.08:0)+(mod.elite||0)+(path.elite||0)+(event?.elite||0));
    const trait=elite?pick(['Frenzied','Armored','Vampiric']):null;
    const scale=mission.diff*(1+(run.depth-1)*.13)*diff.enemy*mod.enemy*(path.enemy||1)*(event?.enemy||1)*1.12;
    let hp=Math.round(base.hp*scale*1.20*(1+.62*(partySize-1))*(elite?1.82:1)),atk=Math.round(base.atk*scale*1.12*(1+.11*(partySize-1))*(elite?1.18:1)),def=Math.round(base.def*scale*1.06*(elite?1.28:1));
    if(trait==='Frenzied')atk=Math.round(atk*1.10);if(trait==='Armored')def=Math.round(def*1.35);if(trait==='Vampiric')hp=Math.round(hp*1.12);
    run.enemies.push(makeEnemyParts({id:uid(),kind,name:elite?`${trait} ${base.name}`:base.name,x:pos.x,y:pos.y,elite,trait,boss:false,maxHp:hp,hp,atk,def,xp:Math.round(base.xp*scale*diff.reward*mod.reward*(path.reward||1)*(event?.reward||1)*(run.dailyBoost||1)*0.55*({1:1,2:.80,3:.65,4:.55}[partySize]||.55)),status:{poison:0,burn:0,bleed:0},intent:null}));
    occupied.add(K(pos.x,pos.y))
  }
  spawnZoneLieutenantV09(run,mission,occupied);applyFrontierEventV10(run,event,occupied);setupDeepEncounter(run,deepCurrentNode(run),occupied);
  if(run.missionId==='worldeater'&&!bossStage&&run.depth===3){
    const base=ENEMY.worldeater;for(let n=0;n<Math.min(3,1+partySize);n++){const pos=randomWalkable(run.map,occupied,8);if(!pos)break;const hp=Math.round(base.hp*mission.diff*(1+.45*(partySize-1))*1.6),atk=Math.round(base.atk*mission.diff*1.05);run.enemies.push(makeEnemyParts({id:uid(),kind:'worldeater',name:'World-Eater Spawn',x:pos.x,y:pos.y,elite:true,trait:'CARRION BROOD',boss:false,maxHp:hp,hp,atk,def:base.def,xp:Math.round(base.xp*1.5),status:{poison:0,burn:0,bleed:0},intent:null}));occupied.add(K(pos.x,pos.y))}run.log.push('☠ The Carrion Nursery ruptures. World-Eater Spawn join the hunt.')}
  if(run.missionId==='worldeater'&&!bossStage&&run.depth===4){
    const base=ENEMY.worldeater,pos=randomWalkable(run.map,occupied,10);if(pos){const hp=Math.round(base.hp*mission.diff*(1+.55*(partySize-1))*4.4),atk=Math.round(base.atk*mission.diff*1.22);run.enemies.push(makeEnemyParts({id:uid(),kind:'worldeater',name:'Herald of the Maw',x:pos.x,y:pos.y,elite:true,trait:'GRAND HUNT LIEUTENANT',boss:false,nemesis:false,maxHp:hp,hp,atk,def:Math.round(base.def*1.35),xp:Math.round(base.xp*4),status:{poison:0,burn:0,bleed:0},intent:null}));occupied.add(K(pos.x,pos.y));run.log.push('⚠ GRAND HUNT LIEUTENANT — The Herald of the Maw blocks the final approach.')}}
  if(bossStage&&run.isDelve){const kind=pick(mission.enemies),base=ENEMY[kind],pos=randomWalkable(run.map,occupied,10);if(pos){const scale=mission.diff*(1+(run.depth-1)*.12)*diff.enemy*mod.enemy,champ=makeEnemyParts({id:uid(),kind,name:run.delve.bossName,x:pos.x,y:pos.y,elite:true,delveBoss:true,trait:'DELVE WARDEN',boss:false,maxHp:Math.round(base.hp*scale*(3.2+.50*(partySize-1))),hp:1,atk:Math.round(base.atk*scale*1.18),def:Math.round(base.def*scale*1.35),xp:Math.round(base.xp*scale*4*diff.reward),status:{poison:0,burn:0,bleed:0},intent:null});champ.hp=champ.maxHp;champ.alerted=true;run.enemies.push(champ);occupied.add(K(pos.x,pos.y));run.log.push(`⚔ DELVE WARDEN — ${champ.name} guards the final cache.`)}}
  else if(bossStage){
    const boss=createColossalBoss(run,mission,partySize,diff,mod,path);
    run.enemies.push(boss);run.bossTelegraph=`COLOSSAL TARGET: ${boss.name}`;
    run.log.push(`════════════════════════════════════`);
    run.log.push(`⚔ HUNT TARGET FOUND: ${boss.name}`);
    run.log.push(`COLOSSAL SIZE ${boss.size}×${boss.size} • ${partySize} hunter${partySize===1?'':'s'} • ${boss.maxHp.toLocaleString()} HP`);
    run.log.push(`Break its anatomy. Survive its phases. Bring it down.`);
    run.log.push(`════════════════════════════════════`)
  }
  if(event?.id==='golden'){const g=run.enemies.find(e=>!e.boss);if(g){g.golden=true;g.name=`Golden ${g.name}`;g.maxHp=Math.round(g.maxHp*1.55);g.hp=g.maxHp;g.atk=Math.round(g.atk*1.25);g.xp=Math.round(g.xp*2.2);g.trait='Golden Quarry';run.log.push(`✦ A GOLDEN QUARRY has appeared: ${g.name}.`)}}
  if(!run?.isWorldSkirmish&&run.depth===1&&!run.nemesisSpawned&&chance(.38)){
    const owner=pick(Object.values(run.players).filter(p=>p.nemesisSeed));if(owner){const n=owner.nemesisSeed,pos=randomWalkable(run.map,occupied,10);if(pos){const base=ENEMY[n.kind]||ENEMY.knight,rank=Math.max(1,n.rank||1),scale=(1.25+rank*.22)*diff.enemy;
      run.enemies.push(makeEnemyParts({id:uid(),kind:n.kind,name:n.name||buildNemesisName(),x:pos.x,y:pos.y,elite:true,trait:`Nemesis Rank ${rank}`,boss:false,nemesis:true,nemesisOwner:owner.peerId,nemesisKind:n.kind,rank,maxHp:Math.round(base.hp*scale*(1+.45*(partySize-1))),hp:Math.round(base.hp*scale*(1+.45*(partySize-1))),atk:Math.round(base.atk*scale),def:Math.round(base.def*(1+rank*.15)),xp:Math.round(base.xp*(2+rank*.4)),status:{poison:0,burn:0,bleed:0},intent:null}));run.nemesisSpawned=true;run.log.push(`☠ NEMESIS: ${n.name} has found the party again.`)}}}
  run.deathCaches=[];if(run.depth===1)Object.values(run.players).filter(p=>p.deathCache).forEach(p=>{const pos=randomWalkable(run.map,occupied,4);if(pos){run.deathCaches.push({peerId:p.peerId,x:pos.x,y:pos.y,cache:p.deathCache,collected:false});occupied.add(K(pos.x,pos.y))}});
  if(event)run.log.push(`★ RARE EVENT — ${event.name}: ${event.desc}`);
  if(run.missionId==='frontier'&&run.stageWeather)run.log.push(`Emberwood conditions: ${run.stageWeather.toUpperCase()}.`);run.log.push(`◆ STAGE ${run.depth}/${runDepthLimit(run)} — ${run.zoneStageName}`);if(run.missionId==='worldeater')run.log.push(`☠ GRAND HUNT — ${run.grandStageName||run.zoneStageName}`);
  run.log.push(`Party deployed safely: ${Object.values(run.players).map(p=>`${p.name} (${p.x},${p.y})`).join(' • ')}`);
  run.phase='player';run.round=run.round||1;
  Object.values(run.players).forEach(p=>{p.submitted=false;p.guarding=false;p.quickUsed=false;p.status.partyDef=0;p.status.closingGuard=0});
}
function generateOpenMap(seed){
  const m=Array.from({length:H},()=>Array(W).fill('grass'));
  for(let x=0;x<W;x++){m[0][x]='tree';m[H-1][x]='tree'}for(let y=0;y<H;y++){m[y][0]='tree';m[y][W-1]='tree'}
  for(let x=1;x<W-1;x++){m[9][x]='path';if(x>7&&x<23)m[10][x]='path'}
  const trees=35+seed*3;for(let i=0;i<trees;i++){const x=rand(2,W-3),y=rand(2,H-3);if((y===9||y===10)||Math.abs(x-2)+Math.abs(y-2)<5)continue;m[y][x]='tree'}
  for(let i=0;i<8;i++){const x=rand(5,W-5),y=rand(3,H-4);if(m[y][x]==='grass')m[y][x]='rock'}
  return m
}
function generateDungeonMap(seed){
  const m=Array.from({length:H},()=>Array(W).fill('wall'));
  const start={x:1,y:1,w:6,h:5,cx:3,cy:3},rooms=[start];
  for(let y=start.y;y<start.y+start.h;y++)for(let x=start.x;x<start.x+start.w;x++)m[y][x]='floor';
  let tries=0;
  while(rooms.length<9&&tries++<300){
    const rw=rand(4,7),rh=rand(3,5),rx=rand(1,W-rw-2),ry=rand(1,H-rh-2),r={x:rx,y:ry,w:rw,h:rh,cx:rx+Math.floor(rw/2),cy:ry+Math.floor(rh/2)};
    if(rooms.some(q=>rx<q.x+q.w+1&&rx+rw+1>q.x&&ry<q.y+q.h+1&&ry+rh+1>q.y))continue;
    for(let y=ry;y<ry+rh;y++)for(let x=rx;x<rx+rw;x++)m[y][x]='floor';
    const a=rooms[rooms.length-1];
    if(chance(.5)){for(let x=Math.min(a.cx,r.cx);x<=Math.max(a.cx,r.cx);x++)m[a.cy][x]='floor';for(let y=Math.min(a.cy,r.cy);y<=Math.max(a.cy,r.cy);y++)m[y][r.cx]='floor'}
    else{for(let y=Math.min(a.cy,r.cy);y<=Math.max(a.cy,r.cy);y++)m[y][a.cx]='floor';for(let x=Math.min(a.cx,r.cx);x<=Math.max(a.cx,r.cx);x++)m[r.cy][x]='floor'}
    rooms.push(r)
  }
  return m
}
function isWalk(m,x,y){return y>=0&&x>=0&&y<H&&x<W&&!['wall','tree','rock'].includes(m[y][x])}
function randomWalkable(m,occ,minDist=0){
  for(let i=0;i<600;i++){const x=rand(1,W-2),y=rand(1,H-2);if(!isWalk(m,x,y)||occ.has(K(x,y))||Math.abs(x-2)+Math.abs(y-2)<minDist)continue;return{x,y}}return null
}

function myRunPlayer(){return snapshot?.run?.players?.[peerId]||room?.run?.players?.[peerId]}
function actionRangeFor(p,type){if(type==='attack')return basicActionRangeV132(p);if(type==='skill1'){if(p.classId==='warden'||p.classId==='berserker')return 1;if(p.classId==='ranger')return effectiveRange(p);if(p.classId==='arcanist')return 5+(hasGearTraitV10(p,'piercing_lance')?1:0);if(p.classId==='templar')return 3;if(p.classId==='shadow')return (hasRelic(p,'phantom_step')?2:1)+(hasGearTraitV10(p,'ghoststeel')?1:0)}return null}

function submitQuickActionV132(type){const r=room||snapshot,p=r?.run?.players?.[peerId];if(!r?.run||r.run.phase!=='player'||!p||p.dead||p.downed||p.submitted||p.quickUsed)return;if(!(p.classId==='berserker'&&type==='skill2'))return;const c=CLASSES[p.classId];if(p.res<c.s2.cost)return toast(`Need ${c.s2.cost-p.res} more ${c.res}`);if(isHost)hostQuickActionV132(peerId,type);else send({type:'quickActionV132',peerId,quickType:type})}
function hostQuickActionV132(pid,type){const run=room?.run,p=run?.players?.[pid];if(!run||run.phase!=='player'||!p||p.dead||p.downed||p.submitted||p.quickUsed)return;if(p.classId==='berserker'&&type==='skill2'){const c=CLASSES[p.classId];if(p.res<c.s2.cost)return;p.quickUsed=true;useClassSkill(run,p,2);run.log.push(`${p.name} used Blood Frenzy as a QUICK ACTION and may still act.`);broadcastSnapshot()}}
function submitAction(action){
  const r=room||snapshot,me=r?.run?.players?.[peerId];if(!r?.run||r.run.phase!=='player'||!me||me.dead||me.downed||me.submitted)return;
  if(action.type==='move'){me.facing=rangerFacingFromDelta(action.dx,action.dy,me.facing||'south')}else if(action.targetId){const faceTarget=r.run.enemies.find(e=>e.id===action.targetId&&e.hp>0);if(faceTarget)me.facing=rangerFacingToward(me,faceTarget)}
  if(action.targetId&&(action.type==='attack'||action.type==='skill1')){const t=r.run.enemies.find(e=>e.id===action.targetId&&e.hp>0),range=actionRangeFor(me,action.type);if(t&&range!=null&&distanceToEnemy(me,t)>range){toast(`${t.name} is out of range (${range} tiles). Your action was not spent.`);return}}
  if(isHost)hostCommand({peerId,type:'command',action});else send({type:'command',peerId,action});
}
function hostCommand(msg){
  const run=room.run;if(run&&repairInvalidStageSpawns(run))broadcastSnapshot();
  const p=run?.players?.[msg.peerId];if(!run||run.phase!=='player'||!p||p.dead||p.downed||p.submitted)return;
  const a=msg.action;
  if(a.type==='move'){
    const nx=p.x+a.dx,ny=p.y+a.dy;if(!isWalk(run.map,nx,ny))return;
    if(Object.values(run.players).some(q=>q.peerId!==p.peerId&&!q.dead&&q.x===nx&&q.y===ny))return;
    if(run.enemies.some(e=>enemyOccupiesTile(e,nx,ny)))return;
  }
  if(a.type==='potion'&&p.potions<=0)return;
  if(a.type==='revive'&&!findAdjacentDowned(run,p))return;
  p.pending=a;p.submitted=true;run.log.push(`${p.name} locked an action.`);
  if(allActionsIn(run))resolveRound(run);broadcastSnapshot()
}
function allActionsIn(run){
  return Object.values(run.players).filter(p=>p.connected!==false&&!p.dead&&!p.downed).every(p=>p.submitted)
}
function resolveRound(run){
  run.phase='resolve';
  const order=Object.values(run.players).filter(p=>p.connected!==false&&!p.dead&&!p.downed).sort((a,b)=>b.level-a.level);
  order.forEach(p=>resolvePlayerAction(run,p,p.pending||{type:'guard'}));
  run.enemies=run.enemies.filter(e=>e.hp>0);
  if(!run.enemies.length){return onStageClear(run)}
  resolveEnemyPhase(run);
  if(checkWipe(run))return;
  run.round++;run.totalRounds=(run.totalRounds||0)+1;run.phase='player';
  Object.values(run.players).forEach(p=>{p.submitted=false;p.pending=null;p.guarding=false;p.quickUsed=false;p.status.partyDef=0;p.status.closingGuard=0});
  run.log.push(`Round ${run.round}. Choose your action.`);
}
function resolvePlayerAction(run,p,a){
  if(p.dead||p.downed)return;
  tickPlayerStatus(run,p);
  if(p.dead||p.downed)return;
  if(a.type==='move'){const nx=p.x+a.dx,ny=p.y+a.dy;if(isWalk(run.map,nx,ny)&&!run.enemies.some(e=>enemyOccupiesTile(e,nx,ny))&&!Object.values(run.players).some(q=>q.peerId!==p.peerId&&!q.dead&&q.x===nx&&q.y===ny)){p.facing=rangerFacingFromDelta(a.dx,a.dy,p.facing||'south');p.x=nx;p.y=ny;const dc=run.deathCaches?.find(c=>!c.collected&&c.peerId===p.peerId&&c.x===nx&&c.y===ny);if(dc){dc.collected=true;p.deathCacheCollected=true;p.runLoot.gold+=(dc.cache.gold||0);if(dc.cache.item)p.runLoot.items.push(dc.cache.item);run.log.push(`${p.name} recovers a Fallen Expedition cache.`)}collectEmberwoodLootable(run,p,nx,ny)}return}
  if(a.type==='guard'){p.guarding=true;p.res=clamp(p.res+3,0,p.maxRes);if(p.classId==='warden'&&p.talents.includes('retaliation'))p.retaliation=true;if(p.classId==='templar'&&p.talents.includes('aegis'))Object.values(run.players).forEach(q=>q.status.partyDef=1);pushCombatFloaterPlayer(p,'GUARD','#9bcfff',10,650);run.log.push(`${p.name} braces.`);return}
  if(a.type==='potion'){if(p.potions>0){p.potions--;const heal=Math.round(p.maxHp*.42*boonValue(p,'heal',1)*specHeal(p)),actual=Math.min(heal,p.maxHp-p.hp);p.hp+=actual;trackHealing(p,actual);pushCombatFloaterPlayer(p,`+${actual}`,'#83dfa0',12,900);const hppt=combatPointPlayer(p);addRingFx(hppt.x,hppt.y+10,'#68d890',20,480,2);run.log.push(`${p.name} drinks a potion for ${actual} HP.`)}return}
  if(a.type==='revive'){const q=findAdjacentDowned(run,p);if(q){q.downed=false;q.downedAt=null;q.deadAt=null;q.hp=Math.round(q.maxHp*.36);p.combat.revives++;run.log.push(`${p.name} revives ${q.name}.`)}return}
  if(a.type==='attack'){let e=a.targetId&&run.enemies.find(x=>x.id===a.targetId&&x.hp>0);if(!e)e=findTarget(run,p,basicActionRangeV132(p),a.targetId);if(e&&distanceToEnemy(p,e)===2&&isMeleeHunterV132(p)){if(!engageStepV132(run,p,e)){run.log.push(`${p.name} cannot find a clear Engage Step.`);return}}if(e&&distanceToEnemy(p,e)<=effectiveRange(p)){p.facing=rangerFacingToward(p,e);dealBasic(run,p,e,a.targetPartId)}else run.log.push(`${p.name} has no target in range.`);return}
  if(a.type==='skill1'||a.type==='skill2'){const aimed=a.targetId&&run.enemies.find(e=>e.id===a.targetId&&e.hp>0);if(aimed)p.facing=rangerFacingToward(p,aimed);useClassSkill(run,p,a.type==='skill1'?1:2,a.targetId,a.targetPartId);return}
}
function tickPlayerStatus(run,p){
  const dmg=(p.status.poison?3:0)+(p.status.burn?4:0)+(p.status.bleed?3:0);
  if(dmg){p.hp-=dmg;p.hitFlash=Date.now();pushCombatFloaterPlayer(p,`-${dmg}`,'#ef8b8b',11,800);pushCombatFeed('bad',p.name,dmg,'STATUS');run.log.push(`${p.name} suffers ${dmg} status damage.`);if(p.status.poison)p.status.poison--;if(p.status.burn)p.status.burn--;if(p.status.bleed)p.status.bleed--;if(p.hp<=0)downPlayer(run,p)}
}
function tickEnemyStatus(run,e){
  let dmg=0;if(e.status.poison){dmg+=4;e.status.poison--}if(e.status.burn){dmg+=Math.round(5*(e.status.burnPower||1));e.status.burn--}if(e.status.bleed){dmg+=4;e.status.bleed--}
  if(dmg){e.hp-=dmg;e.hitFlash=Date.now();pushCombatFloaterEntity(e,dmg,'#d68cf5',10,720);run.log.push(`${e.name} suffers ${dmg} status damage.`);if(e.hp<=0&&!e.rewarded){const p=run.players[e.lastDamagerPeer]||Object.values(run.players).find(x=>!x.dead);if(p)rewardKill(run,p,e)}}
}
function findTarget(run,p,range,preferredId=null){
  const candidates=run.enemies.filter(e=>e.hp>0&&distanceToEnemy(p,e)<=range);
  if(preferredId)return candidates.find(e=>e.id===preferredId)||null;
  candidates.sort((a,b)=>(a.boss?-1:0)-(b.boss?-1:0)||distanceToEnemy(p,a)-distanceToEnemy(p,b));return candidates[0]
}
function findAdjacentDowned(run,p){
  return Object.values(run.players).find(q=>q.peerId!==p.peerId&&q.downed&&!q.dead&&Math.abs(q.x-p.x)+Math.abs(q.y-p.y)<=1)
}
function critChance(p){let c=.08+(p.power.crit||0)+runCritBonus(p)+(ascentEffectsV11(p).crit||0);if(p.classId==='ranger'&&p.talents.includes('eagle'))c+=.08;if(p.classId==='shadow'&&p.talents.includes('precision'))c+=.10;if(hasRelic(p,'falcon')||hasRelic(p,'night_eye'))c+=.08;return c}
function dodgeChance(p){let c=(p.power.dodge||0)+specDodge(p)+(ascentEffectsV11(p).dodge||0);if(p.classId==='ranger'&&p.talents.includes('ghost'))c+=.10;if(p.classId==='shadow'&&p.talents.includes('elusive'))c+=.12;return c}
function frenzyMult(p){return p?.frenzyCharges>0?1.30:1}
function consumeFrenzy(p){if(p?.frenzyCharges>0)p.frenzyCharges--}

function targetThreatensAlly(run,p,e){return Object.values(run.players).some(q=>q.peerId!==p.peerId&&!q.dead&&!q.downed&&distanceToEnemy(q,e)<=1)}
function dealBasic(run,p,e,targetPartId=null){
  if(['ranger','warden','berserker','arcanist','templar','shadow'].includes(p.classId))p.facing=rangerFacingToward(p,e);
  const wasFrenzied=p.classId==='berserker'&&p.frenzyCharges>0,crit=chance(critChance(p));let raw=p.atk+rand(-2,4);if(isMeleeHunterV132(p))raw=Math.round(raw*1.14);if(p.retaliation){raw=Math.round(raw*1.35);p.retaliation=false}
  raw=Math.round(raw*frenzyMult(p));if(p.classId==='ranger'&&hasRelic(p,'savior')&&targetThreatensAlly(run,p,e))raw=Math.round(raw*1.25);if(crit)raw=Math.round(raw*1.65);let dmg=Math.max(1,raw-Math.floor(e.def*.6));triggerClassVisualAction(p,'attack',[e]);dmg=applyPlayerDamage(run,p,e,dmg,targetPartId,'attack');p.res=clamp(p.res+2+boonValue(p,'resource',0)+(ascentEffectsV11(p).resourceGain||0),0,p.maxRes);
  consumeFrenzy(p);run.log.push(`${p.name} hits ${e.name} for ${dmg}${crit?' CRIT':''}${wasFrenzied?' [BLOOD FRENZY +30%]':''}.${wasFrenzied?` ${p.frenzyCharges} Frenzy charge${p.frenzyCharges===1?'':'s'} remain.`:''}`);if(crit){pushCombatFloaterEntity(e,`CRIT ${dmg}!`,'#ffd16e',15,1050);pushCombatFeed('crit',p.name,dmg,'CRIT')}applyLeech(p,dmg);if(e.hp<=0)rewardKill(run,p,e)
}
function applyLeech(p,dmg){
  let l=p.power.leech||0;if(p.classId==='berserker'&&p.talents.includes('bloodlust')&&p.hp/p.maxHp<.4)l+=.12;if(hasRelic(p,'devourer'))l+=.08;if(p.selectedSpec==='bloodbound')l+=.06;l+=runLeechBonus(p)+(ascentEffectsV11(p).leech||0);
  if(l)p.hp=Math.min(p.maxHp,p.hp+Math.max(1,Math.round(dmg*l)))
}
function useClassSkill(run,p,n,targetId=null,targetPartId=null){
  const c=CLASSES[p.classId],skill=n===1?c.s1:c.s2;
  if(p.res<skill.cost){run.log.push(`${p.name} lacks ${c.res}.`);return}
  p.res-=skill.cost;const sl=p.skillLevels[n===1?'s1':'s2']||1,bonus=1+(sl-1)*.035;
  p.runLoot[n===1?'skill1':'skill2']+=10;
  if(p.classId==='warden'){
    if(n===1){const e=findTarget(run,p,1,targetId);if(!e)return;p.facing=rangerFacingToward(p,e);triggerClassVisualAction(p,'shieldslam',[e]);p.res=Math.max(0,p.res);let dmg=Math.max(2,Math.round(p.atk*1.45*bonus*(hasRelic(p,'oathstrike')?1.2:1))-Math.floor(e.def*.3));dmg=applyPlayerDamage(run,p,e,dmg,targetPartId,'shield');run.log.push(`${p.name} Shield Slams for ${dmg}.`);if(chance(.25))e.status.stagger=1;e.tauntPeerId=p.peerId;if(e.hp<=0)rewardKill(run,p,e)}
    else{triggerClassVisualAction(p,'fortress',[]);p.guarding=true;Object.values(run.players).filter(q=>!q.dead).forEach(q=>q.status.partyDef=(p.talents.includes('rally')?2:1)+(hasRelic(p,'greater_bastion')?1:0)+(['guardian','commander'].includes(p.selectedSpec)?1:0)+Math.round((ascentEffectsV11(p).skill2||0)*4));run.log.push(`${p.name} raises Fortress for the party.`)}
  }else if(p.classId==='berserker'){
    if(n===1){const wasFrenzied=p.frenzyCharges>0,near=run.enemies.filter(e=>e.hp>0&&Math.abs(e.x-p.x)+Math.abs(e.y-p.y)<=1).slice(0,3);if(near.length){p.facing=rangerFacingToward(p,near[0]);triggerClassVisualAction(p,'cleave',near)}near.forEach(e=>{const mult=(p.talents.includes('cleaver')?1.6:1.35)*frenzyMult(p)*(hasRelic(p,'redstorm')?1.2:1);let dmg=Math.max(2,Math.round(p.atk*mult*bonus)-Math.floor(e.def*.45));dmg=applyPlayerDamage(run,p,e,dmg,e.id===targetId?targetPartId:null,'cleave');run.log.push(`${p.name} Cleaves ${e.name} for ${dmg}${wasFrenzied?' [BLOOD FRENZY +30%]':''}.`);if(e.hp<=0)rewardKill(run,p,e)});consumeFrenzy(p);if(wasFrenzied)run.log.push(`${p.name} has ${p.frenzyCharges} Frenzy charge${p.frenzyCharges===1?'':'s'} remaining.`)}
    else{triggerClassVisualAction(p,'frenzy',[]);const cost=Math.round(p.maxHp*.12);p.hp=Math.max(1,p.hp-cost);pushCombatFloaterPlayer(p,'BLOOD FRENZY','#ff704f',12,900);p.frenzyCharges=hasRelic(p,'ragechain')?3:2;run.log.push(`${p.name} enters Blood Frenzy: +30% damage for the next ${p.frenzyCharges} offensive actions.`)}
  }else if(p.classId==='ranger'){
    if(n===1){const e=findTarget(run,p,effectiveRange(p),targetId);if(!e)return;p.facing=rangerFacingToward(p,e);triggerClassVisualAction(p,'twin',[e]);let total=0;for(let i=0;i<2;i++){let d=Math.max(1,Math.round(p.atk*.82*bonus*(hasRelic(p,'savior')&&targetThreatensAlly(run,p,e)?1.25:1))+rand(0,3)-Math.floor(e.def*.35));if(chance(critChance(p)+.08))d=Math.round(d*1.55);total+=d}total=applyPlayerDamage(run,p,e,total,targetPartId,'twin');if(p.talents.includes('venom'))e.status.poison=hasRelic(p,'serpent_king')?3:2;run.log.push(`${p.name} Twin Shots ${e.name} for ${total}.`);if(e.hp<=0)rewardKill(run,p,e)}
    else{const volleyTargets=run.enemies.filter(e=>e.hp>0&&Math.abs(e.x-p.x)+Math.abs(e.y-p.y)<=5).slice(0,4);if(volleyTargets.length){p.facing=rangerFacingToward(p,volleyTargets[0]);triggerClassVisualAction(p,'volley',volleyTargets)}volleyTargets.forEach(e=>{let d=Math.max(2,Math.round(p.atk*.9*bonus)-Math.floor(e.def*.25));d=applyPlayerDamage(run,p,e,d,null,'volley');run.log.push(`${p.name}'s Volley hits ${e.name} for ${d}.`);if(e.hp<=0)rewardKill(run,p,e)})}
  }else if(p.classId==='arcanist'){
    if(n===1){const e=findTarget(run,p,5,targetId);if(!e)return;p.facing=rangerFacingToward(p,e);triggerClassVisualAction(p,'lance',[e]);let d=Math.max(3,Math.round(p.atk*1.75*bonus*(hasRelic(p,'sunlance')?1.2:1))+rand(1,5)-Math.floor(e.def*.12));d=applyPlayerDamage(run,p,e,d,targetPartId,'lance');if(p.talents.includes('wildfire')){e.status.burn=hasRelic(p,'everburn')?3:2;e.status.burnPower=p.selectedSpec==='pyromancer'?1.5:1}run.log.push(`${p.name} Ember Lances ${e.name} for ${d}.`);if(e.hp<=0)rewardKill(run,p,e)}
    else{const starTargets=run.enemies.filter(e=>e.hp>0&&Math.abs(e.x-p.x)+Math.abs(e.y-p.y)<=5).slice(0,5);if(starTargets.length){p.facing=rangerFacingToward(p,starTargets[0]);triggerClassVisualAction(p,'starfall',starTargets)}starTargets.forEach(e=>{let d=Math.max(3,Math.round(p.atk*1.35*bonus*(hasRelic(p,'cometfall')?1.18:1))-Math.floor(e.def*.08));d=applyPlayerDamage(run,p,e,d,null,'starfall');e.status.burn=Math.max(e.status.burn,hasRelic(p,'everburn')?3:2);e.status.burnPower=p.selectedSpec==='pyromancer'?1.5:1;run.log.push(`Starfall hits ${e.name} for ${d}.`);if(e.hp<=0)rewardKill(run,p,e)})}
    if(p.talents.includes('echo')&&chance(.25))p.res=Math.min(p.maxRes,p.res+Math.ceil(skill.cost/2))
  }else if(p.classId==='templar'){
    if(n===1){const e=findTarget(run,p,3,targetId);if(!e)return;p.facing=rangerFacingToward(p,e);triggerClassVisualAction(p,'smite',[e]);let d=Math.max(2,Math.round(p.atk*1.4*bonus*(hasRelic(p,'judgment')?1.2:1))-Math.floor(e.def*.3));d=applyPlayerDamage(run,p,e,d,targetPartId,'smite');const selfHeal=Math.round(d*.25*boonValue(p,'heal',1)*specHeal(p));p.hp=Math.min(p.maxHp,p.hp+selfHeal);trackHealing(p,selfHeal);pushCombatFloaterPlayer(p,`+${selfHeal}`,'#83dfa0',11,800);run.log.push(`${p.name} Smites for ${d}.`);if(e.hp<=0)rewardKill(run,p,e)}
    else{let q=Object.values(run.players).filter(x=>!x.dead).sort((a,b)=>(a.downed?-1:0)-(b.downed?-1:0)||a.hp/a.maxHp-b.hp/b.maxHp)[0];if(!q)return;triggerClassVisualAction(p,'radiant',[q]);
      if(q.downed){q.downed=false;q.downedAt=null;q.deadAt=null;q.hp=Math.round(q.maxHp*(hasRelic(p,'martyr_light')?.50:.38));p.combat.revives++;pushCombatFloaterPlayer(q,'REVIVED!','#f1cf72',14,1100);if(p.talents.includes('secondlight')&&!p.secondLightUsed){p.res=Math.min(p.maxRes,p.res+skill.cost);p.secondLightUsed=true}run.log.push(`${p.name} raises ${q.name} with Radiant Hand.`)}
      else{let heal=Math.round(p.maxHp*.28*bonus);if(p.talents.includes('grace'))heal=Math.round(heal*1.3);if(hasRelic(p,'saint_hand'))heal=Math.round(heal*1.2);heal=Math.round(heal*boonValue(p,'heal',1)*specHeal(p));const actual=Math.min(heal,q.maxHp-q.hp);q.hp+=actual;trackHealing(p,actual);pushCombatFloaterPlayer(q,`+${actual}`,'#83dfa0',12,900);run.log.push(`${p.name} heals ${q.name} for ${actual}.`)}
    }
  }else if(p.classId==='shadow'){
    if(n===1){const e=findTarget(run,p,hasRelic(p,'phantom_step')?2:1,targetId);if(!e)return;triggerClassVisualAction(p,'backstab',[e]);let d=Math.max(3,Math.round(p.atk*1.9*bonus*(hasRelic(p,'execution')&&e.hp/e.maxHp<.35?1.3:1))-Math.floor(e.def*.35));if(chance(critChance(p)+.18))d=Math.round(d*1.55);d=applyPlayerDamage(run,p,e,d,targetPartId,'backstab');if(p.talents.includes('hemo'))e.status.bleed=p.selectedSpec==='hemomancer'?3:2;run.log.push(`${p.name} Backstabs ${e.name} for ${d}.`);if(e.hp<=0)rewardKill(run,p,e)}
    else{const knifeTargets=run.enemies.filter(e=>e.hp>0&&Math.abs(e.x-p.x)+Math.abs(e.y-p.y)<=2).slice(0,5);if(knifeTargets.length)triggerClassVisualAction(p,'fan',knifeTargets);knifeTargets.forEach(e=>{let d=Math.max(2,Math.round(p.atk*1.05*bonus*(hasRelic(p,'knife_storm')?1.2:1))-Math.floor(e.def*.3));d=applyPlayerDamage(run,p,e,d,null,'knives');run.log.push(`Knife fan hits ${e.name} for ${d}.`);if(e.hp<=0)rewardKill(run,p,e)})}
  }
}
function rewardKill(run,killer,e){
  if(e.rewarded)return;e.rewarded=true;
  const diff=DIFFICULTIES[run.difficulty||'normal'],mod=run.modifier||MODIFIERS[0],path=run.currentPath||{},event=run.stageEvent||{},heat=huntHeatV10(run),lootBoost=(diff.reward-1)*.08+(mod.loot||0)+(path.loot||0)+(event.loot||0)+(heat-1)*.38;
  Object.values(run.players).filter(p=>!p.dead).forEach(p=>{
    p.runLoot.kills=(p.runLoot.kills||0)+1;p.runLoot.killsByKind[e.kind]=(p.runLoot.killsByKind[e.kind]||0)+1;if(e.elite)p.runLoot.elites=(p.runLoot.elites||0)+1;if(e.boss)p.runLoot.bosses=(p.runLoot.bosses||0)+1;if(e.nemesis)p.runLoot.nemesisDefeated.push(e.nemesisKind||e.kind);
    const xpBoost=p.xpMult||1;p.runLoot.xp+=Math.round(e.xp*xpBoost);p.runLoot.mastery+=Math.round(e.xp*.45*xpBoost);const traitLoot=hasGearTraitV10(p,'scavenger')?1.18:1;p.runLoot.gold+=Math.round(rand(e.boss?25:3,e.boss?48:9)*diff.reward*mod.reward*(path.reward||1)*(event.reward||1)*(run.dailyBoost||1)*boonValue(p,'loot',1)*heat*traitLoot);
    p.runLoot.common+=rand(0,e.boss?5:2)+(mod.id==='treasure'?1:0);if(e.elite&&chance(.45+lootBoost))p.runLoot.rare++;if(e.boss)p.runLoot.rare+=rand(2,4);const km=KILL_MATS[e.kind];if(km&&(e.boss||chance(.35)))p.runLoot.namedParts[km[0]]=(p.runLoot.namedParts[km[0]]||0)+(e.boss?1:1);if(e.boss&&e.kind==='direwolf'){p.runLoot.gold+=90;p.runLoot.common+=4;p.runLoot.rare+=2;p.runLoot.namedParts.direfang_fang=(p.runLoot.namedParts.direfang_fang||0)+1;p.runLoot.namedParts.direfang_pelt=(p.runLoot.namedParts.direfang_pelt||0)+1;p.runLoot.namedParts.direfang_heart=(p.runLoot.namedParts.direfang_heart||0)+1;if(chance(.15))p.runLoot.items.push(generateItem(p,e))}if(e.boss&&campaignBossKind(e.kind)){const tier={bossgoblin:1,mire:2,bossknight:3,bossdrake:4,riftboss:5}[e.kind]||1;p.runLoot.gold+=60+tier*35;p.runLoot.common+=2+tier;p.runLoot.rare+=1+Math.floor(tier/2);if(chance(.10+tier*.025))p.runLoot.items.push(generateItem(p,e));}if(e.boss&&e.kind==='worldeater'){p.runLoot.gold+=420;p.runLoot.common+=12;p.runLoot.rare+=6;p.runLoot.namedParts.world_horn=(p.runLoot.namedParts.world_horn||0)+1;p.runLoot.namedParts.world_heart=(p.runLoot.namedParts.world_heart||0)+1;p.runLoot.namedParts.world_blood=(p.runLoot.namedParts.world_blood||0)+2;const raidGear=generateItem(p,e);if(['common','uncommon'].includes(raidGear.rarity))raidGear.rarity='rare';p.runLoot.items.push(raidGear);if(chance(.12)){const second=generateItem(p,e);if(['common','uncommon'].includes(second.rarity))second.rarity='rare';p.runLoot.items.push(second)}}if(e.nemesis){p.runLoot.rare+=2;p.runLoot.gold+=120*(e.rank||1)}if(e.golden){p.runLoot.rare+=2;p.runLoot.gold+=250;const bonus=generateItem(p,e);bonus.rarity=bonus.rarity==='common'||bonus.rarity==='uncommon'?'rare':bonus.rarity;p.runLoot.items.push(bonus)}
    if(e.trait==='ZONE LIEUTENANT'||e.trait==='APEX MINI-BOSS'){p.runLoot.gold+=Math.round(70*heat);p.runLoot.rare+=2;p.runLoot.common+=3;p.runLoot.namedParts.emberwood_apex_mark=(p.runLoot.namedParts.emberwood_apex_mark||0)+1;const apexGear=generateItem(p,{...e,elite:true});maybeAssignTraitV10(apexGear,p,true);p.runLoot.items.push(apexGear);run.log.push(`✦ APEX REWARD for ${p.name}: ${apexGear.name}`)}
    const mythRate=mythicDropChance(e,run)*(1+Math.min(4,(p.dropPity.mythic||0)*.025)),relicRate=relicDropChance(e,run)*(1+Math.min(4,(p.dropPity.relic||0)*.02));
    if(chance(mythRate)){const mythic=generateMythic(p,e);p.runLoot.items.push(mythic);p.dropPity.mythic=0;run.log.push(`✦✦ MYTHIC DROP for ${p.name}: ${mythic.name}! ✦✦`)}
    else{p.dropPity.mythic=(p.dropPity.mythic||0)+1;if(chance(relicRate)){const relic=generateRelic(p,e);p.runLoot.items.push(relic);p.dropPity.relic=0;run.log.push(`✦ RELIC DROP for ${p.name}: ${relic.name}!`)}else p.dropPity.relic=(p.dropPity.relic||0)+1}
    const gearChance=Math.min(.78,(e.boss?.55:e.elite?.20:.07)+lootBoost*.25);if(chance(gearChance))p.runLoot.items.push(generateItem(p,e));if(e.boss&&chance(run.difficulty==='nightmare'?.25:run.difficulty==='veteran'?.15:.08)){const setDrop=generateBossSetDropV09(p,e);if(setDrop){p.runLoot.items.push(setDrop);run.log.push(`✦ HUNTSET DROP for ${p.name}: ${setDrop.name}`)}}
  });
  if(e.boss&&e.kind==='worldeater'){run.enemies.filter(o=>o.raidAdd).forEach(o=>o.hp=0);run.grandHuntVictoryAt=Date.now();const q=combatPointEntity(e);for(let i=0;i<4;i++)addRingFx(q.x,q.y,['#ff5454','#b95cff','#ffd16e','#ffffff'][i],55+i*24,950+i*130,5-i*.7);emitWorldFx('spark',q.x,q.y,'#ff8a68',80,1300);shakeScreen(10,500);pushCombatFloaterEntity(e,'GRAND HUNT COMPLETE','#ffd16e',22,1800)}
  const deathPt=combatPointEntity(e);if(e.boss){const bc=bossRewardColorV09(e.kind);emitWorldFx('spark',deathPt.x,deathPt.y,bc,42,950);addRingFx(deathPt.x,deathPt.y,bc,58,820,4);run.log.push(`✦ HUNT COMPLETE — ${e.name} rewards the party with boss materials and hunt-tier gear.`)}emitWorldFx('spark',deathPt.x,deathPt.y,e.boss?'#ff7253':'#d7e3ef',e.boss?32:14,e.boss?800:500);addRingFx(deathPt.x,deathPt.y,e.boss?'#ef8658':'#9fb8cf',e.boss?42:22,e.boss?650:420,e.boss?4:2);if(e.boss){pushCombatFloaterEntity(e,'BOSS DOWN','#ffd16e',18,1400);shakeScreen(7,260);if(e.kind==='direwolf'){['#ffd66e','#ff8658','#b46cff','#79d9ff'].forEach((c,i)=>setTimeout(()=>{const q=combatPointEntity(e);emitWorldFx('spark',q.x+(i-1.5)*10,q.y,c,18,900);addRingFx(q.x,q.y,c,36+i*10,900,3)},i*80));run.log.push('✦ DIREfang trophy cache secured: bonus parts, materials, gold, and gear.')}}else pushCombatFloaterEntity(e,'DOWN','#dbe8f7',10,600);
  if(e.fleeingQuarry&&run.deepChallenge){run.deepChallenge.complete=true;run.deepChallenge.failed=false;Object.values(run.players).filter(p=>!p.dead).forEach(p=>{p.runLoot.gold+=70;p.runLoot.rare+=1});run.log.push('✦ FLEEING QUARRY CAPTURED — bonus rare material secured.')}run.log.push(`${e.name} is defeated${e.boss?' — BOSS DOWN':''}.`);if(e.boss)notifyV11('boss','HUNT TARGET SLAIN',e.name,{life:6500});else if(e.apexId||e.trait==='APEX MINI-BOSS'||e.trait==='ZONE LIEUTENANT')notifyV11('boss','APEX QUARRY SLAIN',e.name,{life:5200})
}
/* v0.13.2 QA3 — tactical monster awareness */

const V132_MELEE_CLASSES=new Set(['warden','berserker','templar','shadow']);
const V132_RANGED_ENEMY_RANGE={thornling:3,gutterling:4,bonearcher:4,fenstalker:3,bogwitch:4,frostseer:4,chorister:4,abyssseer:5};
function isMeleeHunterV132(p){return !!p&&V132_MELEE_CLASSES.has(p.classId)}
function basicActionRangeV132(p){return isMeleeHunterV132(p)?2:effectiveRange(p)}
function engageStepV132(run,p,e){if(!run||!p||!e||!isMeleeHunterV132(p)||distanceToEnemy(p,e)!==2)return false;const dirs=[[1,0],[-1,0],[0,1],[0,-1]];for(const[dx,dy]of dirs){const nx=p.x+dx,ny=p.y+dy;if(!isWalk(run.map,nx,ny))continue;if(run.enemies.some(o=>o.hp>0&&enemyOccupiesTile(o,nx,ny)))continue;if(Object.values(run.players).some(q=>q.peerId!==p.peerId&&!q.dead&&q.x===nx&&q.y===ny))continue;const probe={...p,x:nx,y:ny};if(distanceToEnemy(probe,e)>1)continue;p.x=nx;p.y=ny;p.facing=rangerFacingToward(p,e);p.status.closingGuard=1;pushCombatFloaterPlayer(p,'ENGAGE','#e7c47b',10,650);run.log.push(`${p.name} closes the gap and engages ${e.name}.`);return true}return false}
function tileLineOfSightV132(map,x0,y0,x1,y1){let x=x0,y=y0,dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,err=dx-dy;while(!(x===x1&&y===y1)){const e2=2*err;if(e2>-dy){err-=dy;x+=sx}if(e2<dx){err+=dx;y+=sy}if(x===x1&&y===y1)break;if(!isWalk(map,x,y))return false}return true}
function enemyHasLineOfSightV132(run,e,t){return !!run&&!!e&&!!t&&tileLineOfSightV132(run.map,e.x,e.y,t.x,t.y)}
function enemyDirOrderV132(e){const dirs=[[1,0],[-1,0],[0,1],[0,-1]],seed=String(e?.id||e?.name||'x').split('').reduce((a,c)=>a+c.charCodeAt(0),0)%4;return dirs.slice(seed).concat(dirs.slice(0,seed))}
function enemyTileFreeV132(run,e,x,y,t){if(!isWalk(run.map,x,y))return false;if(run.enemies.some(o=>o!==e&&o.hp>0&&enemyOccupiesTile(o,x,y)))return false;if(Object.values(run.players).some(p=>!p.dead&&p.peerId!==t?.peerId&&p.x===x&&p.y===y))return false;if(t&&x===t.x&&y===t.y)return false;return true}
function enemyPathStepV132(run,e,t){if(!run||!e||!t)return null;const range=V132_RANGED_ENEMY_RANGE[e.kind]||0,dirs=enemyDirOrderV132(e),start=K(e.x,e.y),q=[{x:e.x,y:e.y}],seen=new Set([start]),prev=new Map();const goal=(x,y)=>{const d=Math.abs(x-t.x)+Math.abs(y-t.y);if(range)return d>=2&&d<=range&&tileLineOfSightV132(run.map,x,y,t.x,t.y);return d<=1};let found=null;while(q.length){const cur=q.shift();if(!(cur.x===e.x&&cur.y===e.y)&&goal(cur.x,cur.y)){found=cur;break}for(const[dx,dy]of dirs){const nx=cur.x+dx,ny=cur.y+dy,k=K(nx,ny);if(seen.has(k)||!enemyTileFreeV132(run,e,nx,ny,t))continue;seen.add(k);prev.set(k,K(cur.x,cur.y));q.push({x:nx,y:ny})}}if(!found)return null;let fk=K(found.x,found.y),pk=prev.get(fk);while(pk&&pk!==start){fk=pk;pk=prev.get(fk)}const[x,y]=fk.split(',').map(Number);return{x,y}}
function isEnemyRangedV132(e){return !!V132_RANGED_ENEMY_RANGE[e?.kind]}
function enemyAggroRangeV132(e){return e?.boss?99:6}

function enemyForcedAggroV132(run,e){
  if(e?.boss||e?.fleeingQuarry)return true;
  const t=run?.deepChallenge?.type;
  return ['ambush','defense','ritual','nest'].includes(t)||e?.trait==='RITUAL ANCHOR'||e?.trait==='BREACH'||e?.trait==='AMBUSHER';
}
function awakenEnemyV132(run,e,reason=''){if(!e||e.boss||e.alerted)return;e.alerted=true;if(e.elite||e.trait==='APEX MINI-BOSS'||e.trait==='ZONE LIEUTENANT')run?.log?.push(`⚠ ${e.name} is alerted${reason?` — ${reason}`:''}.`)}
function resolveEnemyPhase(run){
  run.phase='enemy';tickDeepStageHazard(run);
  run.enemies.forEach(e=>{
    if(e.hp<=0)return;tickEnemyStatus(run,e);if(e.hp<=0)return;
    if(e.status.stagger){e.status.stagger=0;run.log.push(`${e.name} is staggered.`);return}if(e.slowed&&chance(.25)){run.log.push(`${e.name} falters from a broken limb.`);return}
    const targets=Object.values(run.players).filter(p=>!p.dead&&!p.downed);if(!targets.length)return;
    if(e.fleeingQuarry){if(run.round>=e.escapeRound){e.hp=0;e.rewarded=true;if(run.deepChallenge)run.deepChallenge.failed=true;run.log.push(`✕ ${e.name} escapes into the deep hunt.`);return}targets.sort((a,b)=>distanceToEnemy(a,e)-distanceToEnemy(b,e));const t=targets[0],dirs=[[1,0],[-1,0],[0,1],[0,-1]].sort((a,b)=>Math.abs(e.x+b[0]-t.x)+Math.abs(e.y+b[1]-t.y)-Math.abs(e.x+a[0]-t.x)-Math.abs(e.y+a[1]-t.y));for(const[dX,dY]of dirs){const nx=e.x+dX,ny=e.y+dY;if(!isWalk(run.map,nx,ny))continue;if(run.enemies.some(o=>o!==e&&o.hp>0&&o.x===nx&&o.y===ny))continue;if(Object.values(run.players).some(p=>!p.dead&&p.x===nx&&p.y===ny))continue;e.x=nx;e.y=ny;break}run.log.push(`${e.name} flees toward an escape route.`);return}
    if(e.boss){updateBossPhases(run,e);if(e.kind==='direwolf')tickBossCooldowns(e)}
    if(e.boss&&e.kind==='worldeater'){let t=e.tauntPeerId&&targets.find(p=>p.peerId===e.tauntPeerId);e.tauntPeerId=null;if(!t){targets.sort((a,b)=>distanceToEnemy(a,e)-distanceToEnemy(b,e));t=targets[0]}resolveWorldEaterBossAction(run,e,targets,t);return}
    if(e.boss&&e.kind==='direwolf'){
      let t=e.tauntPeerId&&targets.find(p=>p.peerId===e.tauntPeerId);e.tauntPeerId=null;
      if(!t){targets.sort((a,b)=>distanceToEnemy(a,e)-distanceToEnemy(b,e));t=targets[0]}
      resolveDirefangBossAction(run,e,targets,t);return
    }
    if(e.boss&&campaignBossKind(e.kind)){let t=e.tauntPeerId&&targets.find(p=>p.peerId===e.tauntPeerId);e.tauntPeerId=null;if(!t){targets.sort((a,b)=>distanceToEnemy(a,e)-distanceToEnemy(b,e));t=targets[0]}resolveCampaignBossActionV09(run,e,targets,t);return}
    if(e.boss&&e.intent==='devastate'){e.intent=null;run.bossTelegraph=null;bossDevastate(run,e,targets);return}
    if(e.boss&&!e.intent&&run.round>1&&chance(bossDevastationChance(e))){e.intent='devastate';run.bossTelegraph=`${e.name} is charging ${bossSignatureAttack(e)} — Guard or protect the party!`;run.log.push(`⚠ ${run.bossTelegraph}`);return}
    const wasTaunted=!!e.tauntPeerId;let t=e.tauntPeerId&&targets.find(p=>p.peerId===e.tauntPeerId);e.tauntPeerId=null;
    if(!t){targets.sort((a,b)=>distanceToEnemy(a,e)-distanceToEnemy(b,e));t=targets[0]}
    const dist=distanceToEnemy(t,e);
    if(!e.boss){
      const forced=enemyForcedAggroV132(run,e),aggro=enemyAggroRangeV132(e);
      if(wasTaunted)awakenEnemyV132(run,e,'taunted');
      if(!e.alerted&&!forced&&dist>aggro)return;
      if(!e.alerted&&(forced||dist<=aggro))awakenEnemyV132(run,e,forced?'scripted encounter':`hunter entered ${aggro}-tile awareness`);
    }
    if(!e.boss&&resolveZoneEnemySpecialV09(run,e,t))return;
    if(dist<=1){enemyAttack(run,e,t)}
    else if(e.boss){
      const dx=Math.sign(t.x-e.x),dy=Math.sign(t.y-e.y);
      const options=Math.abs(t.x-e.x)>Math.abs(t.y-e.y)?[[dx,0],[0,dy]]:[[0,dy],[dx,0]];
      for(const[ox,oy]of options){if((ox||oy)&&bossFootprintIsClear(run,e,e.x+ox,e.y+oy)){e.x+=ox;e.y+=oy;run.log.push(`${e.name} thunders across the arena.`);break}}
    }else{
      const preferred=V132_RANGED_ENEMY_RANGE[e.kind]||0;
      if(preferred&&dist<=preferred&&enemyHasLineOfSightV132(run,e,t)){run.log.push(`${e.name} holds a firing lane on ${t.name}.`)}
      else{const step=enemyPathStepV132(run,e,t);if(step){e.x=step.x;e.y=step.y}else run.log.push(`${e.name} searches for a route to ${t.name}.`)}
    }
  })
}
function bossDevastate(run,e,targets){
  if(e.kind==='direwolf'||e.kind==='worldeater'||campaignBossKind(e.kind)){run.log.push(`${e.name} uses dedicated location-based raid mechanics instead of a global-range devastation attack.`);e.intent=null;run.bossTelegraph=null;return}
  e.attackFlash=Date.now();const bp=combatPointEntity(e),bc={direwolf:'#ff714b',bossgoblin:'#e4ad55',mire:'#74c86e',bossknight:'#e1c17b',bossdrake:'#9cdfff',riftboss:'#ba78ff',worldeater:'#ff4651'}[e.kind]||'#ff7b55';addRingFx(bp.x,bp.y,bc,75,780,5);emitWorldFx('spark',bp.x,bp.y,bc,30,720);shakeScreen(6,240);run.log.push(`⚠ ${e.name} unleashes ${bossSignatureAttack(e)} across the party!`);
  targets.forEach(p=>{
    if(chance(dodgeChance(p)*.45)){pushCombatFloaterPlayer(p,'EVADE','#9bd7ff',11,750);run.log.push(`${p.name} narrowly evades the blast.`);return}
    const phaseMult=e.bossPhase>=3?1.26:e.bossPhase===2?1.12:1;let dmg=Math.max(2,Math.round(e.atk*1.32*phaseMult)-Math.floor((p.def+(p.status.partyDef||0)+runDefBonus(p))*.45));if(p.guarding)dmg=Math.max(1,Math.round(dmg*ascentGuardV11(p,.34)));
    p.hp-=dmg;p.hitFlash=Date.now();pushCombatFloaterPlayer(p,`-${dmg}`,'#ff6b61',13,900);pushCombatFeed('bad',e.name,dmg,'DEVASTATION');shakeScreen(5,180);run.log.push(`${p.name} takes ${dmg} devastation damage.`);if(p.hp<=0)downPlayer(run,p)
  })
}
function enemyAttack(run,e,p){
  if(e.boss&&distanceToEnemy(p,e)>1){run.log.push(`${e.name} is out of melee range of ${p.name}.`);return}
  if(chance(dodgeChance(p))){pushCombatFloaterPlayer(p,'DODGE','#9bd7ff',11,750);pushCombatFeed('hit',p.name,null,'DODGE');run.log.push(`${p.name} dodges ${e.name}.`);return}
  let dmg=Math.max(1,e.atk+rand(-2,3)-Math.floor((p.def+(p.status.partyDef||0)+runDefBonus(p))*.65));if(p.guarding)dmg=Math.max(1,Math.round(dmg*ascentGuardV11(p,.42)));if(p.status?.closingGuard)dmg=Math.max(1,Math.round(dmg*.88));
  p.hp-=dmg;p.hitFlash=Date.now();e.attackFlash=Date.now();e.attackDx=Math.sign(p.x-e.x);e.attackDy=Math.sign(p.y-e.y);emitEnemyAttackFx(e,p);pushCombatFloaterPlayer(p,`-${dmg}`,'#ef8b8b',11,800);pushCombatFeed('bad',e.name,dmg,`→ ${p.name}`);const hitp=combatPointPlayer(p);let hitColor='#ef8b8b';if(e.kind==='spider')hitColor='#65dd79';if(e.kind==='wraith')hitColor='#8aa4ff';if(e.kind==='drake')hitColor='#a8e5f4';if(e.kind==='cultist')hitColor='#ff8a55';emitWorldFx('spark',hitp.x,hitp.y,hitColor,6,340);if(['golem','knight'].includes(e.kind))shakeScreen(2,80);run.log.push(`${e.name} hits ${p.name} for ${dmg}.`);if(e.trait==='Vampiric'){const heal=Math.max(1,Math.round(dmg*.22));e.hp=Math.min(e.maxHp,e.hp+heal);pushCombatFloaterEntity(e,`+${heal}`,'#83dfa0',9,700);run.log.push(`${e.name} siphons ${heal} HP.`)}
  if(e.kind==='spider'&&chance(.25))p.status.poison=2;if(e.kind==='wraith'&&chance(.22))p.status.burn=2;
  if(p.hp<=0)downPlayer(run,p)
}
function downPlayer(run,p){
  const maxDowns=(p.classId==='berserker'&&p.talents.includes('undying'))?3:2;
  p.visualAction=null;p.guarding=false;p.pending=null;
  if(p.downs>=maxDowns){p.dead=true;p.downed=false;p.deadAt=Date.now();p.downedAt=null;p.hp=0;p.submitted=true;run.log.push(`${p.name} is DEAD and spectating.`);if(p.peerId===peerId)flowBannerV13('HUNTER FALLEN','Spectate the party until the hunt ends.','boss','NO REVIVES REMAIN')}
  else{p.downs++;p.downed=true;p.downedAt=Date.now();p.deadAt=null;p.hp=0;p.submitted=true;run.log.push(`${p.name} is DOWNED (${p.downs}/${maxDowns}).`);if(p.peerId===peerId)flowBannerV13('YOU ARE DOWNED','An adjacent ally can revive you.','boss',`${maxDowns-p.downs} DOWN${maxDowns-p.downs===1?'':'S'} REMAIN`);else notifyV11('boss',`${p.name.toUpperCase()} DOWNED`,'Get adjacent and use Revive.',{life:5000,sound:false})}
}
function checkWipe(run){
  const alive=Object.values(run.players).filter(p=>p.connected!==false&&!p.dead&&!p.downed);
  if(alive.length)return false;
  run.phase='ended';run.result='wipe';settleRun(false,'Party wiped.');return true
}
function resolveChoiceVotesV146(run){
  if(!run||run.phase!=='choice')return false;const voters=Object.values(run.players).filter(p=>p.connected!==false&&!p.dead),votes=Object.entries(run.votes||{}).filter(([id])=>run.players[id]?.connected!==false&&!run.players[id]?.dead).map(([,vote])=>vote);
  if(!voters.length||votes.length<voters.length)return false;
  if(votes.filter(v=>v==='extract').length>=Math.ceil(voters.length/2)){
    if(run.deepHunt?.active&&!deepCurrentNode(run)?.canExtract){Object.values(run.players).forEach(p=>{p.runLoot.gold=Math.round((p.runLoot.gold||0)*.85);p.runLoot.common=Math.round((p.runLoot.common||0)*.85);p.runLoot.rare=Math.round((p.runLoot.rare||0)*.85)});run.log.push('Field extraction called away from a secure route. Some supplies are abandoned in the retreat.');run.phase='ended';run.result='extract';settleRun(true,'Party executed a field extraction.')}
    else{run.phase='ended';run.result='extract';settleRun(true,'Party extracted safely.')}
  }else{preparePathChoice(run);broadcastSnapshot()}
  return true
}
function reevaluateRunAfterDepartureV146(run){
  if(!run||!['player','choice'].includes(run.phase))return false;if(checkWipe(run))return true;
  if(run.phase==='player'&&allActionsIn(run)){resolveRound(run);if(room?.run===run)broadcastSnapshot();return true}
  if(run.phase==='choice')return resolveChoiceVotesV146(run);
  return false
}

function preparePathChoice(run){run.phase='path';run.pathChoices=[];if(run?.deepHunt?.active){run.pathChoices=deepChoicesForNextDepth(run)||[];run.deepHunt.revealedDepth=Math.max(run.deepHunt.revealedDepth||2,run.depth+1);run.log.push(run.deepHunt.bossRevealed?'The quarry is near. Choose whether to challenge it now or continue the hunt.':'The expedition branches. Choose the next route.')}else{const pool=[...PATH_CHOICES];while(run.pathChoices.length<2&&pool.length){run.pathChoices.push(pool.splice(rand(0,pool.length-1),1)[0])}run.log.push('The expedition forks. Party leader must choose the next route.')}}
function choosePathChoice(i){
  if(!isHost||!room?.run||room.run.phase!=='path')return;const run=room.run,path=run.pathChoices?.[i];if(!path)return;
  if(run.deepHunt?.active){
    run.deepHunt.currentNode=structuredCloneSafe(path);run.deepHunt.history.push(structuredCloneSafe(path));applyDeepNodeEntry(run,path);run.depth=path.type==='boss'?runDepthLimit(run):run.depth+1;
  }else{
    run.currentPath=structuredCloneSafe(path);run.huntHeat=Math.min(2,(run.huntHeat||1)+.12);Object.values(run.players).filter(p=>p.connected!==false&&!p.dead).forEach(p=>{if(path.boon){p.boons=p.boons||[];if(!p.boons.includes(path.boon))p.boons.push(path.boon)}if(path.heal){const h=Math.round(p.maxHp*path.heal);p.hp=Math.min(p.maxHp,p.hp+h)}});run.depth++;
  }
  run.round++;run.log.push(`Route chosen: ${path.name}.${path.boon?` Boon gained: ${boonById(path.boon)?.name}.`:''} Hunt Heat rises to +${Math.round((huntHeatV10(run)-1)*100)}% reward pressure.`);generateStage(run,MISSIONS[run.missionId]);broadcastSnapshot()
}

function onStageClear(run){
  const mission=MISSIONS[run.missionId],node=deepCurrentNode(run);
  if(run?.isWorldSkirmish){run.phase='ended';run.result='clear';return settleRun(true,`${run.worldEncounter?.name||'Surface skirmish'} cleared!`)}
  if(run?.isDelve){if(run.depth>=runDepthLimit(run)){run.phase='ended';run.result='clear';return settleRun(true,`${run.delve.name} cleared!`)}run.depth++;run.round++;run.log.push(`⌂ Delve floor cleared. Descending to floor ${run.depth}/${runDepthLimit(run)}.`);generateStage(run,mission);broadcastSnapshot();return}
  if(run?.deepHunt?.active&&node){resolveDeepChallengeOnClear(run,node);if(!node._resolved){node._resolved=true;if(node.track){run.deepHunt.spoor=Math.min(9,(run.deepHunt.spoor||0)+node.track);run.log.push(`Spoor gathered: +${node.track} (${run.deepHunt.spoor}/${run.deepHunt.cfg.spoorRequired}).`)}if(!run.deepHunt.bossRevealed&&run.deepHunt.spoor>=run.deepHunt.cfg.spoorRequired&&run.depth>=run.deepHunt.cfg.minBossDepth-1){run.deepHunt.bossRevealed=true;run.log.push(`✦ THE DEN IS REVEALED — the hunt target can now be pursued.`)}}if(node.type==='boss'){run.phase='ended';run.result='clear';return settleRun(true,`${mission.name} cleared!`)}}
  if(!run?.deepHunt?.active&&run.depth>=mission.depths){run.phase='ended';run.result='clear';return settleRun(true,`${mission.name} cleared!`)}
  if(run?.deepHunt?.active&&run.depth>=runDepthLimit(run)&&!run.deepHunt.bossRevealed){run.deepHunt.bossRevealed=true;run.log.push('The trail can no longer be ignored. The target den is finally revealed.')}
  run.phase='choice';run.cleared=true;run.votes={};run.log.push(`Depth ${run.depth} cleared. Extract safely or push deeper for stronger loot.`)
}
function hostVote(pid,vote){
  const run=room.run;if(!run||run.phase!=='choice'||!run.players[pid]||run.players[pid].dead)return;
  run.votes[pid]=vote;
  if(!resolveChoiceVotesV146(run))broadcastSnapshot()
}

function computeHuntScore(run,p,success,fullClear,elapsed){
  const diff={normal:1,veteran:1.3,nightmare:1.75}[run.difficulty||'normal']||1;
  const speed=Math.max(0,2600-elapsed*8),base=500+(p.runLoot.kills||0)*110+(p.runLoot.elites||0)*320+(p.runLoot.bosses||0)*1800+(p.combat.parts||0)*260+Math.round((p.combat.damage||0)*.35)+(p.combat.revives||0)*400;
  const penalties=(p.downs||0)*450+(p.dead?900:0);return Math.max(0,Math.round((base+speed+(fullClear?1700:success?600:0)-penalties)*diff))
}
function computeMVP(run){
  const ps=Object.values(run.players),pickTop=(field)=>ps.slice().sort((a,b)=>(b.combat?.[field]||0)-(a.combat?.[field]||0))[0];
  const out=[],d=pickTop('damage'),h=pickTop('healing'),r=pickTop('revives'),b=pickTop('parts');
  if(d&&(d.combat.damage||0)>0)out.push({title:'Executioner',name:d.name,value:`${d.combat.damage} damage`});
  if(h&&(h.combat.healing||0)>0)out.push({title:'Savior',name:h.name,value:`${h.combat.healing} healing`});
  if(r&&(r.combat.revives||0)>0)out.push({title:'Last Light',name:r.name,value:`${r.combat.revives} revives`});
  if(b&&(b.combat.parts||0)>0)out.push({title:'Partbreaker',name:b.name,value:`${b.combat.parts} breaks`});
  return out
}
function strongestSurvivor(run){return run.enemies.filter(e=>e.hp>0).sort((a,b)=>(b.boss?5:b.nemesis?4:b.elite?3:1)-(a.boss?5:a.nemesis?4:a.elite?3:1)||b.hp-a.hp)[0]||null}
function loadPartyRecords(){try{return JSON.parse(localStorage.getItem(PARTY_RECORD_KEY)||'{}')}catch(e){return{}}}
function updatePartyRecord(run,success,partyScore,elapsed){
  const names=Object.values(run.players).map(p=>p.name).sort(),key=names.join('|'),all=loadPartyRecords(),r=all[key]||{names,clears:0,wipes:0,bestScore:0,bestTime:null,bestDepth:0};
  success?r.clears++:r.wipes++;r.bestScore=Math.max(r.bestScore,partyScore);r.bestDepth=Math.max(r.bestDepth,run.depth);if(success)r.bestTime=r.bestTime==null?elapsed:Math.min(r.bestTime,elapsed);all[key]=r;try{localStorage.setItem(PARTY_RECORD_KEY,JSON.stringify(all))}catch(error){r.persistenceError=true}return r
}
function chooseSpec(id){if(!SPECIALIZATIONS[profile.classId]?.some(x=>x[0]===id))return;profile.selectedSpec=id;persistProfile();renderProfile();toast(`Specialization: ${SPECIALIZATIONS[profile.classId].find(x=>x[0]===id)[1]}`)}

function settleRun(success,label){
  if(!isHost)return;
  const run=room.run,runId=run.runId||(run.runId=uid()),mission=MISSIONS[run.missionId],fullClear=success&&run.depth>=runDepthLimit(run),elapsed=Math.max(1,Math.floor((Date.now()-(run.startedAt||Date.now()))/1000)),awards=computeMVP(run),survivor=!success?strongestSurvivor(run):null;
  const scores=Object.values(run.players).map(p=>computeHuntScore(run,p,success,fullClear,elapsed)),partyScore=scores.reduce((a,b)=>a+b,0);
  updatePartyRecord(run,success,partyScore,elapsed);
  const settlementRows=[];
  if(run.isWorldSkirmish&&success&&room.worldV14){const e=room.worldV14.encounters.find(x=>x.id===run.worldEncounter?.id);if(e){e.done=true;e.respawnAt=Date.now()+90000}}
  Object.values(run.players).forEach((p,pi)=>{
    const L=p.runLoot,grade=!success?'D':fullClear?(p.downs===0?'S':p.downs===1?'A':'B'):(p.downs===0?'A':'B'),delveBonus=fullClear&&run.isDelve?run.delve:null,clearBonus=fullClear?Math.round((run.isDelve?(run.delve.gold||0):45)*DIFFICULTIES[run.difficulty||'normal'].reward):0;
    const settle={settlementId:`settlement:${runId}:${p.peerId}`,settlementVersion:1,outcome:run.result||(success?'clear':'wipe'),success,label,mission:run.isWorldSkirmish?(run.worldEncounter?.name||'Surface Skirmish'):(run.isDelve?run.delve.name:mission.name),missionId:run.missionId,isDelve:!!run.isDelve,isWorldSkirmish:!!run.isWorldSkirmish,surfaceClear:!!(run.isWorldSkirmish&&success),worldEncounter:run.worldEncounter||null,delveId:run.delveId||null,depth:run.depth,difficulty:run.difficulty||'normal',modifier:run.modifier?.name||'Clear Skies',stageEvent:run.stageEvent?.name||null,grade,elapsed,score:scores[pi],partyScore,mvpAwards:awards,
      xp:L.xp,mastery:L.mastery,skill1:L.skill1,skill2:L.skill2,kills:L.kills||0,bosses:L.bosses||0,elites:L.elites||0,downs:p.downs,partsBroken:p.combat.parts||0,damage:p.combat.damage||0,healing:p.combat.healing||0,revives:p.combat.revives||0,
      gold:(success?L.gold:Math.floor(L.gold*.25))+clearBonus,common:(success?L.common:Math.floor(L.common*.5))+(delveBonus?.common||0),rare:(success?L.rare:Math.floor(L.rare*.15))+(delveBonus?.rare||0),namedParts:{},killsByKind:L.killsByKind||{},partsByKind:L.partsByKind||{},nemesisDefeated:L.nemesisDefeated||[],deathCacheCollected:!!p.deathCacheCollected,dropPity:p.dropPity||{relic:0,mythic:0},
      items:[],wiped:!success,bossTrophy:fullClear&&!run.isDelve&&!run.isWorldSkirmish?mission.boss.name:null,nemesisSurvivor:survivor?{kind:survivor.kind,name:survivor.nemesis?survivor.name:buildNemesisName(),rank:(survivor.rank||0)+1}:null,deathCache:null,
      routeNames:(run.deepHunt?.history||[]).map(n=>n.name),huntHeat:huntHeatV10(run),spoor:run.deepHunt?.spoor||0,bossRevealed:!!run.deepHunt?.bossRevealed,safeExtract:!!deepCurrentNode(run)?.canExtract
    };
    Object.entries(L.namedParts||{}).forEach(([k,v])=>settle.namedParts[k]=success?v:Math.floor(v*.3));
    if(success){settle.items=structuredCloneSafe(L.items);if(fullClear&&run.isDelve&&run.delve.rewardGear){const cache=generateItem(p,{elite:true,boss:false,trait:'DELVE CACHE'});if(cache.rarity==='common')cache.rarity='uncommon';settle.items.push(cache)}}
    else{
      const preserveOld=p.deathCache&&!p.deathCacheCollected,cacheCandidate=preserveOld?null:(L.items.find(i=>i.id!==L.secureId)||null);
      settle.deathCache=preserveOld?p.deathCache:(cacheCandidate?{gold:Math.min(120,Math.floor(L.gold*.12)),item:cacheCandidate}:null);
      L.items.forEach(item=>{if(cacheCandidate&&item.id===cacheCandidate.id)return;if(item.id===L.secureId){settle.items.push(item);return}const recover={common:.35,uncommon:.22,rare:.10,epic:.04,legendary:.01,relic:.002,mythic:.0005}[item.rarity]||.1;if(chance(recover))settle.items.push(item)})
    }
    settlementRows.push({peerId:p.peerId,settlement:settle})
  });
  run.pendingSettlementV145={success,label,settlementRows};return commitPendingSettlementV145()
}

function commitPendingSettlementV145(){
  if(!isHost||!room?.run?.pendingSettlementV145)return false;const run=room.run,pending=run.pendingSettlementV145,localRow=pending.settlementRows.find(row=>row.peerId===peerId),alreadyApplied=localRow&&profileReceiptSeenV145('settlementReceiptsV145',localRow.settlement.settlementId);
  if(localRow&&!alreadyApplied&&!applySettlement(localRow.settlement)){run.phase='settlement_failed';run.result='pending';broadcastSnapshot();notifyV11('warn','SETTLEMENT NOT SAVED','Local storage rejected the hunt result. Free browser storage or restore a valid save, then press Retry Settlement.',{life:8000});return false}
  room.completedSettlementsV145=Object.fromEntries(pending.settlementRows.map(row=>[row.peerId,row.settlement]));pending.settlementRows.filter(row=>row.peerId!==peerId).forEach(row=>send({type:'settlement',peerId:row.peerId,settlement:row.settlement}));
  if(run.isWorldSkirmish&&pending.success&&room.worldV14)Object.values(run.players).forEach(p=>{const wp=room.players?.[p.peerId];if(!wp||p.dead)return;wp.worldX=p.x;wp.worldY=p.y;wp.facing=p.facing||wp.facing});
  room.log.push(pending.label);room.run=null;selectedTargetId=null;selectedPartId=null;if(!pending.success)resetToEmberwatchV142();rollMerchantAfterHunt();broadcastSnapshot();hide('lobbyOverlay');renderLobby();renderAll();return true
}

function applySettlement(s){
  if(!profile||!s)return false;ensureProfileShape(profile);if(profileReceiptSeenV145('settlementReceiptsV145',s.settlementId))return false;const profileBeforeSettlement=structuredCloneSafe(profile);
  profile.lifetime.runs++;if(s.success){profile.lifetime.success++;profile.lifetime.huntStreak++;profile.lifetime.bestStreak=Math.max(profile.lifetime.bestStreak,profile.lifetime.huntStreak);if(s.downs===0){profile.lifetime.flawless++;}}else{profile.lifetime.wipes++;profile.lifetime.huntStreak=0}
  if(s.isWorldSkirmish){const w=ensureWorldProfileV14(profile),kb=s.killsByKind||{};w.contracts.wolves+=(kb.wolf||0);if(s.worldEncounter?.elite)w.contracts.elites+=1;if(s.surfaceClear)w.surfaceClears=(w.surfaceClears||0)+1;checkWorldContractsV14()}profile.lifetime.bestDepth=Math.max(profile.lifetime.bestDepth||0,s.depth);profile.lifetime.totalDepths=(profile.lifetime.totalDepths||0)+s.depth;profile.lifetime.kills+=(s.kills||0);profile.lifetime.bosses+=(s.bosses||0);profile.lifetime.elites+=(s.elites||0);profile.lifetime.partsBroken+=(s.partsBroken||0);
  const scoreKey=s.isWorldSkirmish?`surface:${s.worldEncounter?.id||s.missionId}:${s.difficulty||'normal'}`:s.isDelve?`delve:${s.delveId}:${s.difficulty||'normal'}`:`${s.missionId}:${s.difficulty||'normal'}`;profile.bestScores[scoreKey]=Math.max(profile.bestScores[scoreKey]||0,s.score||0);if(s.success)profile.bestTimes[scoreKey]=profile.bestTimes[scoreKey]==null?s.elapsed:Math.min(profile.bestTimes[scoreKey],s.elapsed);
  profile.xp+=s.xp;while(profile.xp>=xpNext(profile.level)){profile.xp-=xpNext(profile.level);profile.level++;celebrateLevelUpV11(profile.level)}
  const omV11=masteryLevel(profile.classMastery[profile.classId]||0);profile.classMastery[profile.classId]=(profile.classMastery[profile.classId]||0)+s.mastery;const nmV11=masteryLevel(profile.classMastery[profile.classId]||0);if(nmV11>omV11)notifyV11('skill',`CLASS MASTERY ${nmV11}`,nmV11%2===1?"A new Hunter's Ascent point is available.":'Permanent class power increased.',{life:5600});const sx=profile.skillXp[profile.classId]||{s1:0,s2:0},os1V11=skillLevel(sx.s1),os2V11=skillLevel(sx.s2);sx.s1+=s.skill1;sx.s2+=s.skill2;profile.skillXp[profile.classId]=sx;const ns1V11=skillLevel(sx.s1),ns2V11=skillLevel(sx.s2);if(ns1V11>os1V11)notifyV11('skill',`${CLASSES[profile.classId].s1.name.toUpperCase()} — SKILL ${ns1V11}`,'Skill proficiency increased.');if(ns2V11>os2V11)notifyV11('skill',`${CLASSES[profile.classId].s2.name.toUpperCase()} — SKILL ${ns2V11}`,'Skill proficiency increased.');
  profile.gold+=s.gold;profile.materials.common+=s.common;profile.materials.rare+=s.rare;if(s.bossTrophy==='The World Eater'){profile.ashMarks=(profile.ashMarks||0)+1;toast('GRAND HUNT CLEAR — +1 ASH MARK')}Object.entries(s.namedParts||{}).forEach(([k,v])=>profile.monsterParts[k]=(profile.monsterParts[k]||0)+v);
  Object.entries(s.killsByKind||{}).forEach(([k,v])=>{profile.monsterMastery[k]=profile.monsterMastery[k]||{kills:0,parts:0};profile.monsterMastery[k].kills+=v});Object.entries(s.partsByKind||{}).forEach(([k,v])=>{profile.monsterMastery[k]=profile.monsterMastery[k]||{kills:0,parts:0};profile.monsterMastery[k].parts+=v});
  (s.nemesisDefeated||[]).forEach(k=>{if(profile.nemeses[k])delete profile.nemeses[k];profile.lifetime.nemesisKills++});
  if(!s.success&&s.nemesisSurvivor){const n=s.nemesisSurvivor,old=profile.nemeses[n.kind];profile.nemeses[n.kind]={kind:n.kind,name:old?.name||n.name,rank:Math.min(10,(old?.rank||0)+1),encounters:(old?.encounters||0)+1}}
  if(s.deathCacheCollected)profile.deathCache=null;if(s.deathCache)profile.deathCache=s.deathCache;profile.dropPity=s.dropPity||profile.dropPity;
  if(s.bossTrophy&&!profile.trophies.includes(s.bossTrophy))profile.trophies.push(s.bossTrophy);if(s.success&&!s.isDelve)maybeDiscoverDelveV132(profile,s.missionId,!!s.bossTrophy);
  s.items.filter(i=>i.rarity==='relic'&&i.relicKey).forEach(i=>{if(!profile.relicsFound.includes(i.relicKey))profile.relicsFound.push(i.relicKey)});s.items.filter(i=>i.rarity==='mythic'&&i.mythicKey).forEach(i=>{if(!profile.mythicsFound.includes(i.mythicKey))profile.mythicsFound.push(i.mythicKey)});profile.inventory.push(...s.items);
  rememberProfileReceiptV145('settlementReceiptsV145',s.settlementId);updateTitles(profile);if(!persistProfile()){profile=profileBeforeSettlement;renderProfile();return false}lastSummary=s;renderProfile();showSummary(s);beep(s.success?760:120,.1,s.success?'triangle':'sawtooth');return true
}

function generateItem(p,e){
  const run=room?.run||snapshot?.run,mid=run?.missionId||'frontier',depth=(run?.depth||1),mission=MISSIONS[mid];
  const zoneTier={frontier:0,hollow:4,gloam:8,keep:12,frost:16,rift:20,worldeater:24}[mid]||0;
  const ilvl=Math.max(1,Math.round(p.level*.70+zoneTier+Math.min(4,depth*.60)+(e.elite?1:0)+(e.boss?2:0)));
  const diff=DIFFICULTIES[run?.difficulty||'normal'],mod=run?.modifier||MODIFIERS[0],r=Math.random(),q=Math.min(.05,(diff.reward-1)*.025+(mod.loot||0)*.03);
  const epicCut=(e.boss?.970:e.elite?.992:.998)-q*.25,rareCut=(e.boss?.70:e.elite?.86:.94)-q,uncommonCut=(e.boss?.25:e.elite?.42:.60)-q;
  let rarity='common',mult=1;if(r>.9995){rarity='legendary';mult=2.08}else if(r>epicCut){rarity='epic';mult=1.66}else if(r>rareCut){rarity='rare';mult=1.34}else if(r>uncommonCut){rarity='uncommon';mult=1.14}
  const type=randomDropTypeV132(),base=currentMissionGearBase(type),aff=pick(AFFIXES);
  const item={id:uid(),type,ilvl,rarity,name:`${rarity==='common'?'Worn':rarity==='uncommon'?'Sturdy':rarity==='rare'?'Runed':rarity==='epic'?'Voidforged':'Starfallen'} ${base} ${aff[0]}`,
    atk:0,def:0,hp:0,affixType:aff[1],affixValue:aff[2],enhance:0,zoneId:mid};
  fillItemStatsV132(item,mult);item.value=Math.round(ilvl*7*mult);maybeAssignTraitV10(item,p,e?.trait==='APEX MINI-BOSS');return item
}
function itemStats(i){
  if(!i)return'—';normalizeItemV132(i);const a=[];if(i.atk)a.push(`+${i.atk} ATK`);if(i.def)a.push(`+${i.def} DEF`);if(i.hp)a.push(`+${i.hp} HP`);
  if(i.affixType==='crit')a.push(`+${Math.round(i.affixValue*100)}% Crit`);if(i.affixType==='dodge')a.push(`+${Math.round(i.affixValue*100)}% Dodge`);if(i.affixType==='leech')a.push(`+${Math.round(i.affixValue*100)}% Leech`);
  if(i.identityTier)a.push(`${i.identityTier} Identity${i.identityPath?' • evolves with Huntsmith':''}`);if(i.affixType==='atk')a.push(`+${i.affixValue} Bonus ATK`);if(i.affixType==='def')a.push(`+${i.affixValue} Bonus DEF`);if(i.affixType==='hp')a.push(`+${i.affixValue} Bonus HP`);
  if(i.enhance)a.push(`+${i.enhance} Enhanced`);if(i.refines)a.push(`Refined ×${i.refines}`);a.push(`GR ${itemProgressionRating(i)}`);if(i.setName)a.push(`SET: ${i.setName}`);if(i.merchantUnique)a.push('Caravan Unique');return a.join(' • ')
}
function secureItem(itemId){
  const me=myRunPlayer();if(!me)return;const cmd={type:'secure',itemId};
  if(isHost)hostSecure(peerId,itemId);else send({type:'command',peerId,action:cmd})
}
function hostSecure(pid,itemId){
  const p=room.run?.players?.[pid];if(!p||!p.runLoot.items.some(i=>i.id===itemId))return;p.runLoot.secureId=itemId;room.run.log.push(`${p.name} secures one item in the Recovery Pouch.`);broadcastSnapshot()
}
// intercept secure command
const originalHostCommand=hostCommand;
hostCommand=function(msg){
  if(msg.action?.type==='secure'){hostSecure(msg.peerId,msg.action.itemId);return}
  return originalHostCommand(msg)
}


function renderMinimap(r){
  if(!mctx||!minimapCanvas)return;mctx.clearRect(0,0,minimapCanvas.width,minimapCanvas.height);
  const sx=minimapCanvas.width/W,sy=minimapCanvas.height/H,run=r?.run,world=r?.worldV14;
  if(run?.map){
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=run.map[y][x];mctx.fillStyle=t==='wall'?'#27303d':t==='tree'?'#234634':t==='rock'?'#4a565b':t==='bossmark'?'#914836':t==='path'?'#7a6648':t==='grass'?'#33563b':'#3c4657';mctx.fillRect(x*sx,y*sy,Math.ceil(sx),Math.ceil(sy))}
    run.enemies?.filter(e=>e.hp>0).forEach(e=>{mctx.fillStyle=e.boss?'#ff5a50':e.id===selectedTargetId?'#77e4ef':'#d46b65';const sz=e.boss?Math.max(4,(e.size||3)*2):3;mctx.fillRect(e.x*sx-sz/2,e.y*sy-sz/2,sz,sz)});
    Object.values(run.players||{}).forEach(q=>{if(q.dead||q.connected===false)return;mctx.fillStyle=q.downed?'#ef5f61':q.peerId===peerId?'#8be9ff':CLASS_FX_COLOR[q.classId]||'#8fd39e';mctx.fillRect(q.x*sx-2,q.y*sy-2,5,5)});
    const me=run.players?.[peerId],boss=run.enemies?.find(e=>e.boss&&e.hp>0);$('objectiveLines').innerHTML=`<b>${MISSIONS[run.missionId].name}</b> • <span class="zone-stage">${run.zoneStageName||zoneStageName(run)}</span> • ${run.depth}/${runDepthLimit(run)}<br>${boss?`Target: ${boss.name} • Phase ${boss.bossPhase||1}${boss.kind==='worldeater'?` — ${worldEaterPhaseName(boss)}`:''} • ${Math.max(0,boss.hp).toLocaleString()} HP`:`Enemies remaining: ${run.enemies.filter(e=>e.hp>0).length}`}<br>${run.bossTelegraph?`<span class="bosswarn">⚠ ${run.bossTelegraph}</span>`:`Round ${run.round} • ${run.phase.toUpperCase()}`}<div class="living-strip"><span class="living-chip heat">HUNT HEAT +${Math.round((huntHeatV10(run)-1)*100)}%</span><span class="living-chip loot">CARRIED VALUE ~${carriedLootValueV10(me).toLocaleString()}</span>${run.deepHunt?.active?`<span class="living-chip apex">SPOOR ${run.deepHunt.spoor}/${run.deepHunt.cfg.spoorRequired}</span>`:''}${run.enemies.some(e=>e.trait==='APEX MINI-BOSS'||e.trait==='ZONE LIEUTENANT')?'<span class="living-chip apex">APEX ACTIVE</span>':''}${deepCurrentNode(run)?.canExtract?'<span class="living-chip clear">EXTRACTION SITE</span>':''}</div>${run.deepChallenge&&!run.deepChallenge._resolved?`<div class="eventwarn">${run.deepChallenge.label}${run.deepChallenge.deadline?` • BONUS DEADLINE R${run.deepChallenge.deadline}`:''}</div>`:''}`;
  }else if(world?.map){
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=world.map[y][x];mctx.fillStyle=t==='tree'?'#183c2a':t==='rock'?'#4e5658':t==='path'?'#806845':'#2f5839';mctx.fillRect(x*sx,y*sy,Math.ceil(sx),Math.ceil(sy))}
    world.resources?.filter(o=>!o.done).forEach(o=>{mctx.fillStyle=o.kind==='cache'?'#e8bc62':'#72c779';mctx.fillRect(o.x*sx-2,o.y*sy-2,4,4)});world.entrances?.forEach(o=>{mctx.fillStyle='#ba83e7';mctx.fillRect(o.x*sx-2.5,o.y*sy-2.5,5,5)});world.encounters?.filter(worldEncounterAvailableV14).forEach(o=>{mctx.fillStyle=o.elite?'#ff7c56':'#d76761';mctx.fillRect(o.x*sx-2,o.y*sy-2,4,4)});mctx.fillStyle='#e6c477';mctx.fillRect(2*sx-2,9*sy-3,5,6);
    Object.values(r?.players||{}).forEach(q=>{if(q.connected===false)return;mctx.fillStyle=q.peerId===peerId?'#8be9ff':CLASS_FX_COLOR[q.classId]||'#8fd39e';mctx.fillRect((q.worldX??5)*sx-2,(q.worldY??9)*sy-2,5,5)});
    $('objectiveLines').innerHTML=`<b>Emberwood Lowlands</b><br>Surface RPG • farm easier mobs • gather resources • discover Delves<span class="surface-chip-v14">E near a landmark to interact</span><div class="tiny" style="margin-top:4px">${worldContractsHTMLV14()}</div>`;
  }else{
    mctx.fillStyle='#17251c';mctx.fillRect(0,0,minimapCanvas.width,minimapCanvas.height);activeCampObjects().forEach(o=>{mctx.fillStyle=o.type==='bonfire'?'#ff9b4e':o.type==='board'?'#e8c266':o.type==='worldgate'?'#8bc7dd':'#71849c';mctx.fillRect(o.x*sx-2,o.y*sy-2,5,5)});Object.values(r?.players||{}).forEach(q=>{mctx.fillStyle=q.peerId===peerId?'#8be9ff':'#8fd39e';mctx.fillRect((q.campX??14)*sx-2,(q.campY??15)*sy-2,5,5)});const first=profile&&!ensureWorldProfileV14(profile).enteredLowlands;$('objectiveLines').innerHTML=first?'<b>EMBERWATCH</b><br><span class="first-step-v14">FIRST STEPS: Follow the central road north and leave through the North Gate.</span><br><span class="tiny">The Hunt Board remains available for Deep Hunts and Delves.</span>':'<b>Emberwatch</b><br>Open-world hub • contracts • crafting • Deep Hunts • Delves';
  }
}



const V13_UI_STATE={phase:null,nodeId:null,bossRevealed:false,bossId:null,hp:null,res:null,lootCount:null,flowTimer:null};
function pulseStageV13(kind='crit'){
  const st=$('stageShell'),fl=$('impactFlashV13');if(st){st.classList.remove('v13-hurt','v13-heal','v13-crit');void st.offsetWidth;st.classList.add(`v13-${kind}`);setTimeout(()=>st.classList.remove(`v13-${kind}`),360)}
  if(fl){fl.className=`impact-flash-v13 ${kind}`;void fl.offsetWidth;fl.className=`impact-flash-v13 ${kind}`;setTimeout(()=>fl.className='impact-flash-v13',380)}
}
function flowBannerV13(title,detail='',kind='route',kicker='HUNT UPDATE'){
  const el=$('flowBannerV13');if(!el)return;$('flowKickerV13').textContent=kicker;$('flowTitleV13').textContent=title;$('flowDetailV13').textContent=detail;el.className=`flow-banner-v13 ${kind}`;void el.offsetWidth;el.classList.add('show');clearTimeout(V13_UI_STATE.flowTimer);V13_UI_STATE.flowTimer=setTimeout(()=>el.classList.remove('show'),2450)
}
function syncHudSignalsV13(r){
  const run=r?.run,p=run?.players?.[peerId];
  if(!run||!p){V13_UI_STATE.phase=null;V13_UI_STATE.nodeId=null;V13_UI_STATE.bossRevealed=false;V13_UI_STATE.bossId=null;V13_UI_STATE.hp=null;V13_UI_STATE.res=null;V13_UI_STATE.lootCount=null;return}
  if(V13_UI_STATE.hp!=null&&p.hp<V13_UI_STATE.hp)pulseStageV13('hurt');else if(V13_UI_STATE.hp!=null&&p.hp>V13_UI_STATE.hp)pulseStageV13('heal');V13_UI_STATE.hp=p.hp;V13_UI_STATE.res=p.res;
  const lootCount=p.runLoot?.items?.length||0;if(V13_UI_STATE.lootCount!=null&&lootCount>V13_UI_STATE.lootCount){const last=p.runLoot.items[lootCount-1];if(last)notifyV11('loot',`${(last.rarity||'GEAR').toUpperCase()} DROP`,last.name,{life:5000})}V13_UI_STATE.lootCount=lootCount;
  const node=deepCurrentNode(run);if(node?.id&&V13_UI_STATE.nodeId!==node.id){if(V13_UI_STATE.nodeId!==null)flowBannerV13(node.name,node.desc||deepNodeTypeName(node.type),'route','NEW LOCATION');V13_UI_STATE.nodeId=node.id}
  if(run.deepHunt?.bossRevealed&&!V13_UI_STATE.bossRevealed){V13_UI_STATE.bossRevealed=true;flowBannerV13('QUARRY LOCATED','The boss den is now selectable.','boss','TRACKING COMPLETE');notifyV11('boss','QUARRY LOCATED',MISSIONS[run.missionId].boss.name,{life:6200})}
  const boss=run.enemies?.find(e=>e.boss&&e.hp>0);if(boss&&V13_UI_STATE.bossId!==boss.id){V13_UI_STATE.bossId=boss.id;flowBannerV13(boss.name,'Break its anatomy. Read the telegraphs. Survive.','boss','HUNT TARGET')}
  if(V13_UI_STATE.phase!==run.phase){if(V13_UI_STATE.phase!==null){if(run.phase==='path')flowBannerV13('CHOOSE YOUR PATH',run.deepHunt?.bossRevealed?'Challenge the quarry or keep hunting for value.':'Read the risks before committing.','route','EXPEDITION FORK');if(run.phase==='choice')flowBannerV13(deepCurrentNode(run)?.canExtract?'SAFE EXTRACTION':'EXTRACTION WINDOW',deepCurrentNode(run)?.canExtract?'Everything carried can be secured here.':'Field extraction saves less value.','extract','DECISION POINT')}V13_UI_STATE.phase=run.phase}
}
function actionPolishV13(run,me,c){
  const pairs=[['attackBtn',true],['guardBtn',true],['potionBtn',(me?.potions||0)>0&&me.hp<me.maxHp],['reviveBtn',!!findAdjacentDownedClient(run,me)]];
  pairs.forEach(([id,ok])=>{const b=$(id);if(!b)return;b.classList.toggle('ready-v13',!!ok&&!b.disabled);b.classList.toggle('unavailable-v13',!ok)});
  if(c&&me){[['skill1Btn',c.s1.cost],['skill2Btn',c.s2.cost]].forEach(([id,cost])=>{const b=$(id);if(!b)return;const starved=me.res<cost;b.classList.toggle('starved-v13',starved);b.classList.toggle('ready-v13',!starved&&!b.disabled);b.setAttribute('aria-label',`${b.textContent.trim()}${starved?' — insufficient '+c.res:''}`)})}
  const atk=$('attackBtn');if(atk)atk.classList.toggle('primary-v13',!!run&&run.phase==='player'&&!atk.disabled)
}

const V11_CLASS_GLYPH={warden:'⛨',berserker:'✹',ranger:'➶',arcanist:'✦',templar:'✚',shadow:'◈'};
function notifyV11(kind='info',title='FIELD UPDATE',detail='',opts={}){const stack=$('notificationStackV11');if(!stack)return;const life=opts.life||4200,el=document.createElement('div');el.className=`hunt-note-v11 ${kind}`;el.style.setProperty('--note-life',`${life}ms`);el.innerHTML=`<div class="n-title">${title}</div><div class="n-detail">${detail}</div>`;stack.prepend(el);while(stack.children.length>4)stack.lastElementChild?.remove();setTimeout(()=>{el.classList.add('leave');setTimeout(()=>el.remove(),240)},life);if(['level','boss','skill','loot'].includes(kind)&&opts.sound!==false)beep(kind==='level'?720:kind==='boss'?180:kind==='loot'?620:520,.05,kind==='boss'?'sawtooth':'triangle',.018)}
function celebrateLevelUpV11(level){const b=$('levelUpBannerV11');if(b){$('levelUpNumberV11').textContent=level;$('levelUpSubV11').textContent=`Level ${level}${(level>1&&(level-1)%3===0)?' • NEW ASCENT POINT':' • POWER INCREASED'}`;b.classList.remove('show');void b.offsetWidth;b.classList.add('show');setTimeout(()=>b.classList.remove('show'),2300)}notifyV11('level',`LEVEL ${level}`,(level>1&&(level-1)%3===0)?"A new Hunter's Ascent point is available.":'Your base combat power increased.',{life:5800,sound:false});beep(520,.08,'triangle',.03);setTimeout(()=>beep(780,.11,'triangle',.025),90);if(level%5===0&&profile){const gold=50+level*5;profile.gold+=gold;profile.materials.rare+=1;notifyV11('loot','LEVEL MILESTONE',`+${gold} gold • +1 rare material`,{life:6000})}}
function challengeStateV11(run){if(!run||!profile)return{label:'EMBERWATCH — SAFE',cls:'safe'};const m=MISSIONS[run.missionId],gr=gearRating(profile),rec=(m.minGear||0)+(run.depth-1)*2+(run.difficulty==='nightmare'?8:run.difficulty==='veteran'?4:0),d=gr-rec;if(d>=8)return{label:`OVERGEARED • GR ${rec} TARGET`,cls:'safe'};if(d>=0)return{label:`FAIR HUNT • GR ${rec} TARGET`,cls:'fair'};if(d>=-6)return{label:`DANGEROUS • ${-d} GR UNDER`,cls:'danger'};return{label:`LETHAL • ${-d} GR UNDER`,cls:'lethal'}}
function renderCombatHudV11(r){const el=$('combatHudV11');if(!el)return;if(!profile){el.style.display='none';return}el.style.display='block';const run=r?.run,p=run?.players?.[peerId],c=CLASSES[profile.classId],camp=!run;el.classList.toggle('camp',camp);$('v11Avatar').textContent=V11_CLASS_GLYPH[profile.classId]||'◆';$('v11HudName').textContent=profile.name;$('v11HudMeta').textContent=`${c.name}${profile.selectedSpec?` • ${SPECIALIZATIONS[profile.classId]?.find(s=>s[0]===profile.selectedSpec)?.[1]||''}`:''} • Lv ${profile.level} • M${masteryLevel(profile.classMastery[profile.classId]||0)}`;$('v11HudGR').textContent=gearRating(profile);$('v11ResLabel').textContent=c.res.toUpperCase().slice(0,4);const hp=p?Math.max(0,p.hp):1,mhp=p?.maxHp||1,res=p?.res??c.maxRes,mres=p?.maxRes||c.maxRes;$('v11HpFill').style.width=`${camp?100:clamp(hp/mhp*100,0,100)}%`;$('v11HpText').textContent=camp?'CAMP':`${hp}/${mhp}`;$('v11ResFill').style.width=`${clamp(res/mres*100,0,100)}%`;$('v11ResText').textContent=camp?'READY':`${res}/${mres}`;const xn=xpNext(profile.level);$('v11XpFill').style.width=`${clamp(profile.xp/xn*100,0,100)}%`;$('v11XpText').textContent=`${profile.xp}/${xn}`;const tags=[],ap=ascentAvailableV11(profile);if(ap)tags.push(`<span class="v11-chip arcane">✦ ${ap} ASCENT POINT${ap===1?'':'S'}</span>`);if(p){if(p.guarding)tags.push('<span class="v11-chip good" title="Guarding reduces incoming damage this round.">GUARD</span>');if(p.frenzyCharges>0)tags.push(`<span class="v11-chip bad" title="Blood Frenzy empowers your next offensive actions.">FRENZY ×${p.frenzyCharges}</span>`);if(p.status?.poison)tags.push(`<span class="v11-chip bad" title="Poison deals damage at the start of your turn. ${p.status.poison} rounds remain.">POISON ${p.status.poison}</span>`);if(p.status?.burn)tags.push(`<span class="v11-chip warn" title="Burn deals damage over time. ${p.status.burn} rounds remain.">BURN ${p.status.burn}</span>`);if(p.status?.bleed)tags.push(`<span class="v11-chip bad" title="Bleed deals damage over time. ${p.status.bleed} rounds remain.">BLEED ${p.status.bleed}</span>`);if(run.bossTelegraph)tags.push('<span class="v11-chip warn">⚠ TELEGRAPH</span>');if(huntHeatV10(run)>1)tags.push(`<span class="v11-chip warn">HEAT +${Math.round((huntHeatV10(run)-1)*100)}%</span>`)}else tags.push(worldStateV14()?'<span class="v11-chip good">SURFACE EXPLORATION</span>':`<span class="v11-chip good">CAMP LV ${campLevelV10(profile)}</span>`);$('v11Status').innerHTML=tags.join('');const cs=challengeStateV11(run),th=$('v11Threat');th.className=`v11-threat ${cs.cls}`;th.textContent=worldStateV14()?'EMBERWOOD LOWLANDS — FRONTIER':cs.label}
function renderAscentProfileV11(){if(!profile)return;ensureProfileShape(profile);const mp=$('masteryPanel');if(mp&&!mp.querySelector('.ascent-mini'))mp.insertAdjacentHTML('beforeend',`<div class="ascent-mini"><b>${ascentAvailableV11(profile)} Ascent Point${ascentAvailableV11(profile)===1?'':'s'} available</b><br>${ascentSpentV11(profile)}/${ascentEarnedV11(profile)} invested • ${availableTalentPoints(profile)} core talent point${availableTalentPoints(profile)===1?'':'s'}</div><div class="profile-progress-v11"><div class="progress-tile-v11">GEAR<b>${gearRating(profile)}</b></div><div class="progress-tile-v11">ASCENSION<b>${profile.ascension}</b></div><div class="progress-tile-v11">BOSSES<b>${profile.lifetime.bosses||0}</b></div><div class="progress-tile-v11">STREAK<b>${profile.lifetime.huntStreak||0}</b></div></div>`);const tg=$('talentGrid');if(tg){const coreHTML=tg.innerHTML;tg.className='ascent-tree-host';tg.innerHTML=`<div class="core-talent-wrap"><div class="sectiontitle">Core Talents</div><div class="tiny">Permanent fundamentals earned through class mastery.</div><div class="grid3">${coreHTML}</div></div>${ascentHTMLV11(profile)}`;[...tg.querySelectorAll('.core-talent-wrap .talent')].forEach((el,i)=>{const t=TALENTS[profile.classId][i];if(t)el.onclick=()=>buyTalent(t.id)})}}

function renderAll(){
  const r=room||snapshot;updateHudModeV141(r);draw(r?.run);renderParty(r);renderPlayer(r);renderRunLoot(r);renderLog(r);renderActions(r);renderCombatMeters(r);renderMinimap(r);renderGrandHuntHud(r?.run);renderCombatHudV11(r);syncHudSignalsV13(r);const wb=$('worldRegionBannerV14');if(wb)wb.classList.toggle('show',!!worldStateV14()&&!r?.run);renderLobby()
}
function renderPlayer(r){
  const p=r?.run?.players?.[peerId];
  $('classLabel').textContent=profile?(`${CLASSES[profile.classId].name} • GR ${gearRating(profile)}`+(p?.classId==='berserker'&&p.frenzyCharges>0?` • FRENZY ×${p.frenzyCharges}`:'')):'—';
  if(!profile){return}
  $('levelText').textContent=profile.level;$('masteryText').textContent=masteryLevel(profile.classMastery[profile.classId]||0);if($('ascentTextV11'))$('ascentTextV11').textContent=ascentAvailableV11(profile);
  $('xpText').textContent=`${profile.xp}/${xpNext(profile.level)}`;$('xpFill').style.width=`${profile.xp/xpNext(profile.level)*100}%`;
  const c=CLASSES[profile.classId];$('resLabel').textContent=c.res;
  if(p){$('hpText').textContent=`${Math.max(0,p.hp)}/${p.maxHp}`;$('hpFill').style.width=`${clamp(p.hp/p.maxHp*100,0,100)}%`;$('resText').textContent=`${p.res}/${p.maxRes}`;$('resFill').style.width=`${p.res/p.maxRes*100}%`;$('downsText').textContent=p.downs}
  else{$('hpText').textContent='Camp';$('hpFill').style.width='100%';$('resText').textContent='—';$('resFill').style.width='100%';$('downsText').textContent='—'}
}
function renderParty(r){
  const g=$('partyList');g.innerHTML='';const ps=Object.values(r?.run?.players||r?.players||{});$('partyCount').textContent=`${ps.length}/4`;
  ps.forEach(p=>{
    const d=document.createElement('div');d.className='partyrow';
    let st='';if(p.dead)st='<span class="dead">DEAD</span>';else if(p.downed)st='<span class="downed">DOWNED</span>';else if(p.submitted)st='<span class="ready">ACTION LOCKED</span>';else if(r?.run)st='<span class="waiting">CHOOSING</span>';else if(p.ready)st='<span class="ready">READY</span>';else st='<span class="waiting">PREPARING</span>';
    d.innerHTML=`<div class="partyhead"><b>${p.name}${p.peerId===peerId?' (You)':''}</b><span>${st}</span></div><div>${CLASSES[p.classId].name}${p.selectedSpec?` / ${SPECIALIZATIONS[p.classId]?.find(s=>s[0]===p.selectedSpec)?.[1]||''}`:''} • Lv ${p.level} • GR ${p.gearRating||0} • M${p.mastery||1}${p.boons?.length?`<br>${p.boons.map(id=>`<span class='boontag'>${boonById(id)?.name}</span>`).join('')}`:''}</div>${r?.run?`<div class="bar" style="margin-top:4px"><div class="fill hpfill" style="width:${clamp((p.hp||0)/(p.maxHp||1)*100,0,100)}%"></div></div>`:''}`;g.appendChild(d)
  })
}
function renderRunLoot(r){
  const p=r?.run?.players?.[peerId],g=$('runLoot');g.innerHTML='';
  $('runGold').textContent=p?.runLoot?.gold||0;$('runCommon').textContent=p?.runLoot?.common||0;$('runRare').textContent=p?.runLoot?.rare||0;
  if(!p?.runLoot?.items?.length){g.innerHTML='<div class="tiny">No gear found this run yet.</div>';return}
  p.runLoot.items.forEach(i=>{
    const d=document.createElement('div');d.className='lootrow';const secured=p.runLoot.secureId===i.id;
    d.innerHTML=`<div><span class="rarity-${i.rarity}">${i.name}</span><div class="tiny">iLvl ${i.ilvl} • ${itemStats(i)}</div></div><button>${secured?'SECURED':'Secure'}</button>`;
    d.querySelector('button').disabled=secured;d.querySelector('button').onclick=()=>secureItem(i.id);g.appendChild(d)
  })
}
function renderLog(r){
  const l=$('log');l.innerHTML='';const lines=[...(r?.log||[]),...(r?.run?.log||[])].slice(-50).reverse();lines.forEach(t=>{const d=document.createElement('div');d.textContent=t;l.appendChild(d)})
}

function fmtPct(v){return `${Math.round(v*100)}%`}
function currentTooltipContext(){
  const r=room||snapshot,run=r?.run;
  const inTraining=$('trainingOverlay')?.classList.contains('show');
  const me=inTraining?(trainingState||trainingPlayer()):run?.players?.[peerId];
  const target=inTraining?{id:'training-dummy',name:'Training Dummy',def:Number($('dummyDef')?.value||10),hp:9999,maxHp:9999,x:0,y:0}:run?.enemies?.find(e=>e.id===selectedTargetId&&e.hp>0)||null;
  return{r,run,me,target,c:profile?CLASSES[profile.classId]:null}
}
function dmgRange(minRaw,maxRaw,def,mit=.6,minFloor=1){
  return[
    Math.max(minFloor,Math.round(minRaw)-Math.floor((def||0)*mit)),
    Math.max(minFloor,Math.round(maxRaw)-Math.floor((def||0)*mit))
  ]
}
function skillTooltipHTML(action){
  const {run,me,target,c}=currentTooltipContext();
  if(!profile||!c)return `<div class="tt-name">No hunter selected</div>`;
  const p=me||{
    atk:c.atk+(profile.level-1)*2+(profilePower(profile).atk||0),
    def:c.def+Math.floor((profile.level-1)/2)+(profilePower(profile).def||0),
    maxHp:c.hp+(profile.level-1)*7+(profilePower(profile).hp||0),
    maxRes:c.maxRes,res:c.maxRes,power:profilePower(profile),talents:profile.talents||[],
    classId:profile.classId,skillLevels:{s1:skillLevel((profile.skillXp?.[profile.classId]?.s1)||0),s2:skillLevel((profile.skillXp?.[profile.classId]?.s2)||0)}
  };
  const def=target?.def||0,targetName=target?.name||'No selected target',frenzy=frenzyMult(p),inTraining=$('trainingOverlay')?.classList.contains('show'),targetDist=target&&run?distanceToEnemy(p,target):null;
  const talent=id=>p.talents?.includes(id);
  const sl1=p.skillLevels?.s1||1,sl2=p.skillLevels?.s2||1,b1=1+(sl1-1)*.035,b2=1+(sl2-1)*.035;
  const head=(name,cost='Free')=>`<div class="tt-head"><div class="tt-name">${name}</div><div class="tt-cost">${cost}</div></div>`;
  const grid=rows=>`<div class="tt-grid">${rows.map(([a,b])=>`<div class="tt-label">${a}</div><div class="tt-value">${b}</div>`).join('')}</div>`;
  const effect=s=>`<div class="tt-effect">${s}</div>`;
  const targetLine=target?(inTraining?`<span class="tt-target">Training estimate against ${targetName} (DEF ${def}).</span>`:`<span class="tt-target">Locked target: ${targetName} (DEF ${def}, ${targetDist} tiles away).</span>`):`Damage shown before enemy armor. Click an enemy to lock that exact target.`;
  let html='';

  if(action==='attack'){
    let mult=frenzy;if(isMeleeHunterV132(p))mult*=1.14;if(p.retaliation)mult*=1.35;
    const r=dmgRange((p.atk-2)*mult,(p.atk+4)*mult,def,.6,1),melee=isMeleeHunterV132(p);
    html=head('Basic Attack','Generates +2 '+c.res)+
      `<div class="tt-desc">Your reliable weapon attack. ${melee?'Melee attacks hit 14% harder to compensate for positional risk.':'Uses your class attack range and can critically strike.'}</div>`+
      grid([['Damage',`${r[0]}–${r[1]}`],['Range',melee?'1 tile • Engage from 2':`${effectiveRange(p)} tile${effectiveRange(p)===1?'':'s'}`],['Crit chance',fmtPct(critChance(p))],['Crit multiplier','165%']])+
      effect(`${targetLine}${melee?'<br><span class="tt-talent">Engage Step:</span> from exactly 2 tiles, Basic Attack steps adjacent before striking and grants 12% damage reduction for the enemy phase.':''}${p.retaliation?'<br><span class="tt-talent">Retaliation active: +35% damage.</span>':''}${p.frenzyCharges>0?`<br><span class="tt-talent">Blood Frenzy: +30% damage (${p.frenzyCharges} charge${p.frenzyCharges===1?'':'s'} left).</span>`:''}${(p.power?.leech||0)>0?`<br>Lifesteal: ${fmtPct(p.power.leech)} of damage.`:''}`);
  }

  if(action==='guard'){
    let party='None';
    if(p.classId==='templar'&&talent('aegis'))party='+1 DEF to all allies for enemy phase';
    html=head('Guard','Generates +3 '+c.res)+
      `<div class="tt-desc">Brace for the enemy phase. Excellent against boss telegraphs and emergency survival.</div>`+
      grid([['Incoming damage','≈58% reduced'],['Resource','+3 '+c.res],['Party effect',party],['Action cost','1 turn']])+
      effect(`${p.classId==='warden'&&talent('retaliation')?'<span class="tt-talent">Retaliation: your next basic attack gains +35% damage.</span>':'Guarding reduces normal incoming attacks to 42% damage and Devastation to about 34%.'}`);
  }

  if(action==='potion'){
    const heal=Math.round(p.maxHp*.42);
    html=head('Healing Potion',`${p.potions??3} remaining`)+
      `<div class="tt-desc">Consume one expedition potion to restore yourself. Potions reset each hunt.</div>`+
      grid([['Healing',`${heal} HP`],['Scaling','42% max HP'],['Target','Self'],['Action cost','1 turn']])+
      effect(`Current HP: ${Math.max(0,p.hp??p.maxHp)}/${p.maxHp}.`);
  }

  if(action==='revive'){
    const q=run?Object.values(run.players||{}).find(x=>x.peerId!==p.peerId&&x.downed&&!x.dead&&Math.abs(x.x-p.x)+Math.abs(x.y-p.y)<=1):null;
    html=head('Revive','Free resource cost')+
      `<div class="tt-desc">Spend your turn reviving an adjacent downed teammate before they are permanently lost.</div>`+
      grid([['Revive HP',q?`${Math.round(q.maxHp*.36)} HP`:'36% ally max HP'],['Range','Adjacent (1 tile)'],['Target',q?q.name:'Downed ally'],['Action cost','1 turn']])+
      effect(q?`<span class="tt-talent">${q.name} can be revived right now.</span>`:'No adjacent downed ally is currently available.');
  }

  if(action==='skill1'||action==='skill2'){
    const n=action==='skill1'?1:2,skill=n===1?c.s1:c.s2,sl=n===1?sl1:sl2,bonus=n===1?b1:b2;
    const cost=`${skill.cost} ${c.res}`;
    if(p.classId==='warden'&&n===1){
      const r=dmgRange(p.atk*1.45*bonus,p.atk*1.45*bonus,def,.3,2);
      html=head('Shield Slam',cost)+`<div class="tt-desc">Smash a nearby enemy with your shield, forcing its attention onto you.</div>`+
        grid([['Damage',`${r[0]}`],['Range','1 tile'],['Skill level',`${sl}`],['Armor ignored','70% effective armor bypass']])+
        effect(`${targetLine}<br>25% chance to <b>Stagger</b> the target for one enemy phase. <b>Taunts</b> the target to attack the Warden.`);
    } else if(p.classId==='warden'){
      html=head('Fortress',cost)+`<div class="tt-desc">Become the party anchor for the coming enemy phase.</div>`+
        grid([['Self','Guarding'],['Party DEF',talent('rally')?'+2 DEF':'+1 DEF'],['Duration','Enemy phase'],['Skill level',`${sl}`]])+
        effect(`${talent('rally')?'<span class="tt-talent">Rallying Guard is active: party bonus increased to +2 DEF.</span>':'All living allies receive bonus defense. Especially strong into Devastation.'}`);
    } else if(p.classId==='berserker'&&n===1){
      const mult=(talent('cleaver')?1.6:1.35)*frenzy;
      const r=dmgRange(p.atk*mult*bonus,p.atk*mult*bonus,def,.45,2);
      html=head('Cleave',cost)+`<div class="tt-desc">Sweep through nearby enemies in one brutal arc.</div>`+
        grid([['Damage / target',`${r[0]}`],['Targets','Up to 3'],['Range','Adjacent'],['Skill level',`${sl}`]])+
        effect(`${targetLine}${talent('cleaver')?'<br><span class="tt-talent">Deep Cleaver: damage multiplier increased from 135% to 160% ATK.</span>':''}${p.frenzyCharges>0?`<br><span class="tt-talent">Blood Frenzy adds +30% damage.</span>`:''}`);
    } else if(p.classId==='berserker'){
      const hpCost=Math.round(p.maxHp*.12);
      html=head('Blood Frenzy',`QUICK ACTION • ${cost}`)+`<div class="tt-desc">Trade blood for a short burst of extreme offense without ending your turn.</div>`+
        grid([['HP cost',`${hpCost} HP`],['Damage bonus','+30%'],['Charges',`Next ${hasRelic(p,'ragechain')?3:2} offensive actions`],['Action economy','1 Quick Action / round']])+
        effect(`<span class="tt-talent">Quick Action:</span> Blood Frenzy does not consume your normal move/attack/skill action. Cannot reduce you below 1 HP. Each Basic Attack or Cleave consumes one charge.`);
    } else if(p.classId==='ranger'&&n===1){
      const per=dmgRange(p.atk*.82*bonus,p.atk*.82*bonus+3,def,.35,1);
      html=head('Twin Shot',cost)+`<div class="tt-desc">Fire two fast arrows into a focused target.</div>`+
        grid([['Damage / arrow',`${per[0]}–${per[1]}`],['Total base',`${per[0]*2}–${per[1]*2}`],['Range',`${effectiveRange(p)} tiles`],['Crit / arrow',fmtPct(critChance(p)+.08)]])+
        effect(`${targetLine}${talent('venom')?'<br><span class="tt-talent">Venom Fletching: applies Poison for 2 rounds (4 damage each enemy status tick).</span>':''}<br>Skill Lv ${sl}: +${Math.round((bonus-1)*100)}% skill scaling.`);
    } else if(p.classId==='ranger'){
      const per=dmgRange(p.atk*.9*bonus,p.atk*.9*bonus,def,.25,2);
      html=head('Volley',cost)+`<div class="tt-desc">Rain arrows over several enemies around you.</div>`+
        grid([['Damage / target',`${per[0]}`],['Targets','Up to 4'],['Range','5 tiles'],['Skill level',`${sl}`]])+
        effect(`Hits up to four enemies in range. Uses only 25% of target DEF when estimating mitigation.`);
    } else if(p.classId==='arcanist'&&n===1){
      const r=dmgRange(p.atk*1.75*bonus+1,p.atk*1.75*bonus+5,def,.12,3);
      html=head('Ember Lance',cost)+`<div class="tt-desc">Piercing fire magic built to punish heavily armored prey.</div>`+
        grid([['Damage',`${r[0]}–${r[1]}`],['Range','5 tiles'],['Armor mitigation','Only 12% DEF'],['Skill level',`${sl}`]])+
        effect(`${targetLine}${talent('wildfire')?'<br><span class="tt-talent">Wildfire: applies Burn for 2 rounds (5 damage each enemy status tick).</span>':''}${talent('echo')?'<br><span class="tt-talent">Arcane Echo: 25% chance to refund half the Mana cost.</span>':''}`);
    } else if(p.classId==='arcanist'){
      const r=dmgRange(p.atk*1.35*bonus,p.atk*1.35*bonus,def,.08,3);
      html=head('Starfall',cost)+`<div class="tt-desc">Call down burning fragments across a cluster of enemies.</div>`+
        grid([['Damage / target',`${r[0]}`],['Targets','Up to 5'],['Range','5 tiles'],['Burn','2 rounds']])+
        effect(`Every struck enemy is Burned for 2 rounds. Armor is nearly ignored (8% DEF mitigation).${talent('echo')?'<br><span class="tt-talent">Arcane Echo: 25% chance to refund half the Mana cost.</span>':''}`);
    } else if(p.classId==='templar'&&n===1){
      const r=dmgRange(p.atk*1.4*bonus,p.atk*1.4*bonus,def,.3,2),selfHeal=Math.round(r[0]*.25);
      html=head('Smite',cost)+`<div class="tt-desc">Strike at range with radiant force and convert part of the damage into self-healing.</div>`+
        grid([['Damage',`${r[0]}`],['Range','3 tiles'],['Self heal',`≈${selfHeal}+ HP`],['Skill level',`${sl}`]])+
        effect(`${targetLine}<br>Heals the Templar for 25% of actual damage dealt.`);
    } else if(p.classId==='templar'){
      let heal=Math.round(p.maxHp*.28*bonus);if(talent('grace'))heal=Math.round(heal*1.3);
      html=head('Radiant Hand',cost)+`<div class="tt-desc">Automatically saves the ally in greatest danger.</div>`+
        grid([['Healing',`${heal} HP`],['Revive','38% target max HP'],['Target','Lowest-health / downed ally'],['Skill level',`${sl}`]])+
        effect(`${talent('grace')?'<span class="tt-talent">Greater Grace: healing increased by 30%.</span><br>':''}${talent('secondlight')?'<span class="tt-talent">Second Light: first Radiant Hand revive each run refunds the full Faith cost.</span>':'Can revive a downed ally from anywhere in the party selection logic.'}`);
    } else if(p.classId==='shadow'&&n===1){
      const base=dmgRange(p.atk*1.9*bonus,p.atk*1.9*bonus,def,.35,3);
      html=head('Backstab',cost)+`<div class="tt-desc">A vicious single-target melee strike with a greatly elevated critical chance.</div>`+
        grid([['Base damage',`${base[0]}`],['Range','1 tile'],['Crit chance',fmtPct(critChance(p)+.18)],['Crit multiplier','155%']])+
        effect(`${targetLine}${talent('hemo')?'<br><span class="tt-talent">Hemorrhage: applies Bleed for 2 rounds (4 damage each enemy status tick).</span>':''}`);
    } else if(p.classId==='shadow'){
      const r=dmgRange(p.atk*1.05*bonus,p.atk*1.05*bonus,def,.3,2);
      html=head('Fan of Knives',cost)+`<div class="tt-desc">Explode outward with blades, punishing enemies that surround you.</div>`+
        grid([['Damage / target',`${r[0]}`],['Targets','Up to 5'],['Radius','2 tiles'],['Skill level',`${sl}`]])+
        effect(`Hits nearby enemies without requiring a focused target.`);
    }
  }
  return html||head('Unknown Action');
}
function positionSkillTooltip(ev){
  const tip=$('skillTooltip');if(!tip.classList.contains('show'))return;
  const pad=12,w=tip.offsetWidth||330,h=tip.offsetHeight||180;
  let x=ev.clientX+14,y=ev.clientY+14;
  if(x+w>window.innerWidth-pad)x=ev.clientX-w-14;
  if(y+h>window.innerHeight-pad)y=ev.clientY-h-14;
  tip.style.left=`${Math.max(pad,x)}px`;tip.style.top=`${Math.max(pad,y)}px`;
}
function showSkillTooltip(action,ev){
  const tip=$('skillTooltip');tip.innerHTML=skillTooltipHTML(action);tip.classList.add('show');
  positionSkillTooltip(ev);
}
function hideSkillTooltip(){$('skillTooltip').classList.remove('show')}
function wireSkillTooltips(){
  const map={
    attackBtn:'attack',skill1Btn:'skill1',skill2Btn:'skill2',guardBtn:'guard',potionBtn:'potion',reviveBtn:'revive',
    trainAttack:'attack',trainSkill1:'skill1',trainSkill2:'skill2'
  };
  Object.entries(map).forEach(([id,action])=>{
    const el=$(id);if(!el||el.dataset.tooltipWired)return;el.dataset.tooltipWired='1';
    el.addEventListener('mouseenter',e=>showSkillTooltip(action,e));
    el.addEventListener('mousemove',positionSkillTooltip);
    el.addEventListener('mouseleave',hideSkillTooltip);
    el.addEventListener('focus',e=>{const r=el.getBoundingClientRect();showSkillTooltip(action,{clientX:r.left+r.width/2,clientY:r.top})});
    el.addEventListener('blur',hideSkillTooltip);
  })
}

function renderActions(r){
  const run=r?.run,me=run?.players?.[peerId],c=profile?CLASSES[profile.classId]:null;
  const can=!!run&&run.phase==='player'&&me&&!me.dead&&!me.downed&&!me.submitted;
  const target=run?.enemies?.find(e=>e.id===selectedTargetId&&e.hp>0);if(selectedTargetId&&!target)selectedTargetId=null;
  ['attackBtn','skill1Btn','skill2Btn','guardBtn','potionBtn','reviveBtn'].forEach(id=>$(id).disabled=!can);
  if(c){const key1=`${profile.classId}1`,key2=`${profile.classId}2`,need1=me?Math.max(0,c.s1.cost-me.res):0,need2=me?Math.max(0,c.s2.cost-me.res):0,quick2=me?.classId==='berserker';$('skill1Btn').innerHTML=abilityIconHTML(key1,c.s1.name,need1?`Need +${need1} ${c.res}`:`${c.s1.cost} ${c.res}`)+`<span class="hotkey">2</span>`;$('skill2Btn').innerHTML=abilityIconHTML(key2,c.s2.name,need2?`Need +${need2} ${c.res}`:quick2?`QUICK • ${c.s2.cost} ${c.res}`:`${c.s2.cost} ${c.res}`)+`<span class="hotkey">3</span>`;$('skill2Btn').classList.toggle('quick-action-v132',!!quick2);if(can&&me){$('skill1Btn').disabled=me.res<c.s1.cost;$('skill2Btn').disabled=me.res<c.s2.cost||(quick2&&me.quickUsed)}}
  $('attackBtn').innerHTML=abilityIconHTML('attack','Attack','+2 resource')+`<span class="hotkey">1</span>`;$('guardBtn').innerHTML=abilityIconHTML('guard','Guard','+3 resource')+`<span class="hotkey">4</span>`;$('potionBtn').innerHTML=abilityIconHTML('potion',`Potion ×${me?.potions??3}`,'42% HP')+`<span class="hotkey">5</span>`;$('reviveBtn').innerHTML=abilityIconHTML('revive','Revive','Adjacent ally')+`<span class="hotkey">6</span>`;
  $('attackBtn').title='Hover for live combat details';$('skill1Btn').title='Hover for live combat details';$('skill2Btn').title='Hover for live combat details';$('guardBtn').title='Hover for live combat details';$('potionBtn').title='Hover for live combat details';$('reviveBtn').title='Hover for live combat details';
  $('reviveBtn').disabled=!can||!findAdjacentDownedClient(run,me);if(can&&me&&((me.potions||0)<=0||me.hp>=me.maxHp))$('potionBtn').disabled=true;const cancelB=$('cancelActionV131');if(cancelB)cancelB.style.display=run?.phase==='player'&&me?.submitted?'block':'none';
  const retrySettlement=$('retrySettlementV145');if(retrySettlement){retrySettlement.style.display=run?.phase==='settlement_failed'&&isHost?'block':'none';retrySettlement.disabled=!isHost||run?.phase!=='settlement_failed'}
  $('votePanel').style.display=run?.phase==='choice'?'grid':'none';$('extractBtn').disabled=!run||!!run.votes?.[peerId];$('descendBtn').disabled=!run||!!run.votes?.[peerId];if(run){const carried=carriedLootValueV10(me),safe=deepCurrentNode(run)?.canExtract; $('extractBtn').textContent=safe?`Extract Here — Secure ~${carried.toLocaleString()} value`:`Field Extract — Save ~${Math.round(carried*.85).toLocaleString()} value`; $('descendBtn').textContent=run.deepHunt?.active?`Choose Route — Heat +12%`:`Push Deeper — Heat +12%`;}
  if(!run){if(worldStateV14()){const o=nearestWorldObjectV14();$('actionHint').textContent=o?(o.objType==='encounter'?`Nearby: ${o.name}. Click the animal to attack in place, or press E to engage.`:`Nearby: ${o.name}. Press E or click the exact object to interact.`):'Explore the Emberwood surface. Roads are safer; hunt packs, gather resources, or find a Delve entrance.';}else{const o=nearestCampObject(),first=profile&&!ensureWorldProfileV14(profile).enteredLowlands;$('actionHint').textContent=o?`Nearby: ${o.name}. Press E or click it to interact.`:(first?'Follow the central road NORTH to the glowing gate. Emberwood is your safe farming frontier.':`Explore Emberwatch. Walk out the North Gate for the surface world, or use the Hunt Board for Deep Hunts and Delves.`);}}
  else if(me?.dead)$('actionHint').textContent='You are dead. Spectate until the expedition ends.';
  else if(me?.downed)$('actionHint').textContent='You are downed. An adjacent ally can revive you.';
  else if(me?.submitted)$('actionHint').textContent='Action locked. Waiting for teammates.';
  else if(run.phase==='player'){const tr=target&&me?distanceToEnemy(me,target):null,range=me?effectiveRange(me):0,dormant=target&&!target.boss&&!target.alerted&&!enemyForcedAggroV132(run,target),engage=me&&isMeleeHunterV132(me)&&tr===2;$('actionHint').textContent=run.bossTelegraph||(target?(dormant&&tr>enemyAggroRangeV132(target)?`Locked: ${target.name} • dormant at ${tr} tiles • wakes within ${enemyAggroRangeV132(target)}`:(tr<=range?`Locked: ${target.name} • ${tr} tiles away • in basic range`:engage?`Locked: ${target.name} • ENGAGE STEP available from 2 tiles`:`Locked: ${target.name} • ${tr} tiles away • basic range ${range}`)):'Click an enemy to lock that exact target, then choose an action.');}
  else if(run.phase==='choice')$('actionHint').textContent='Depth cleared. Vote to extract or push deeper.';else if(run.phase==='path')$('actionHint').textContent=isHost?'Choose the next route for the party.':'Party leader is choosing the next route.';else if(run.phase==='settlement_failed')$('actionHint').textContent=isHost?'The result is intact, but the local save failed. Resolve browser storage, then retry the settlement.':'The party leader must retry the protected settlement.';else $('actionHint').textContent='Resolving the round...';
  $('phaseBox').innerHTML=run?`ROUND ${run.round}<br>${run.bossTelegraph?`<span class="bosswarn">⚠ BOSS TELEGRAPH</span>`:run.phase.toUpperCase()}${run.ghostTarget?`<br><span class="tiny">Ghost PB ${run.ghostTarget}s • Now ${Math.floor((Date.now()-run.startedAt)/1000)}s</span>`:''}`:'EXPEDITION CAMP';
  $('missionBadge').textContent=run?`${MISSIONS[run.missionId].name} • ${run.zoneStageName||zoneStageName(run)} • ${DIFFICULTIES[run.difficulty||'normal'].name}`:(worldStateV14()?'Emberwood Lowlands':'Emberwatch');$('depthBadge').textContent=run?`Depth ${run.depth}/${runDepthLimit(run)}`:(worldStateV14()?'SURFACE':'HUB');
  const liveBoss=run?.enemies?.find(e=>e.boss&&e.hp>0),bossBanner=$('bossBanner');
  if(liveBoss&&run.round===(run.bossIntroRound||1)){
    bossBanner.classList.add('show');$('bossBannerTitle').textContent=liveBoss.name.toUpperCase();
    $('bossBanner').querySelector('.boss-kicker').textContent=liveBoss.kind==='worldeater'?'GRAND HUNT — APOCALYPSE CLASS':'HUNT TARGET — UNIQUE BOSS';
    $('bossBannerScale').textContent=`${liveBoss.kind==='worldeater'?'FOUR-PHASE RAID • ':''}COLOSSAL ${liveBoss.size}×${liveBoss.size} TILES • ${liveBoss.partySize} HUNTER${liveBoss.partySize===1?'':'S'} • ${liveBoss.maxHp.toLocaleString()} HP`;
  }else bossBanner.classList.remove('show');
  $('targetBadge').textContent=target?`Target: ${target.name}`:'Target: Auto';
  $('targetInfo').innerHTML=target?`<b class="${target.boss?'gold':''}">${target.name}</b> • HP ${Math.max(0,target.hp)}/${target.maxHp} • DEF ${target.def}${target.boss?` • COLOSSAL ${target.size}×${target.size} • PHASE ${target.bossPhase||1} • ${target.partySize}P SCALE`:''}${target.trait?` • ${target.trait}`:''}${!target.boss?` • <span class="${target.alerted||enemyForcedAggroV132(run,target)?'bosswarn':'tiny'}">${target.alerted||enemyForcedAggroV132(run,target)?'ALERTED':`DORMANT • AGGRO ${enemyAggroRangeV132(target)}`}</span>`:''}<div class="tiny" style="margin-top:4px"><b>${target.boss?'BOSS KIT':'ABILITY'}:</b> ${enemyAbilityTextV09(target)}</div>${target.boss&&bossCounterHintV131(target)?`<div class="counter-hint-v131"><b>COUNTERPLAY:</b> ${bossCounterHintV131(target)}</div>`:''}${target.intent?`<div class="bosswarn">⚠ <span class="boss-ability">${target.intentLabel||target.intent.replaceAll('_',' ').toUpperCase()}</span> CHARGING</div>`:''}${run.stageEvent?`<div class="eventwarn">${run.stageEvent.name}: ${run.stageEvent.desc}</div>`:''}`:'Target: automatic nearest enemy. <b>Click an enemy</b> to focus attacks and single-target skills.<div class="target-shortcuts-v131"><kbd>Tab</kbd> cycle enemy • <kbd>Q</kbd> cycle body part</div>';
  const pp=$('partPanel');pp.innerHTML='';if(target?.parts?.length){if(!target.parts.some(x=>x.id===selectedPartId&&partTargetable(target,x)))selectedPartId=target.parts.find(x=>partTargetable(target,x))?.id||null;target.parts.forEach(part=>{const b=document.createElement('button'),sealed=target.kind==='worldeater'&&part.id==='heart'&&!target.heartExposed;b.className=`partbtn ${part.id===selectedPartId?'selected':''} ${part.broken?'broken':''}`;b.disabled=!partTargetable(target,part);b.textContent=`${part.name} ${sealed?'SEALED':part.broken?'BROKEN':`${Math.max(0,part.hp)}/${part.maxHp}`}`;b.onclick=()=>{selectedPartId=part.id;renderAll()};pp.appendChild(b)})}else selectedPartId=null;
  const pathPanel=$('pathPanel');pathPanel.style.display=run?.phase==='path'?'grid':'none';pathPanel.innerHTML='';if(run?.phase==='path'){(run.pathChoices||[]).forEach((path,i)=>{const b=document.createElement('button');b.className='pathcard';b.disabled=!isHost;b.innerHTML=`<b>${deepNodeIcon(path.type||'hunt')} ${path.name}</b>${path.desc}<div class="tagline"><span class="expchip">${deepNodeTypeName(path.type||'hunt')}</span>${path.track?`<span class="expchip spoor">+${path.track} spoor</span>`:''}${path.canExtract?'<span class="expchip extract">safe extract</span>':''}${path.boon?`<span class="expchip">boon: ${boonById(path.boon)?.name||path.boon}</span>`:''}</div>`;b.onclick=()=>choosePathChoice(i);pathPanel.appendChild(b)})}renderDeepHuntPanel(run);
  actionPolishV13(run,me,c);
  if(!run){if(worldStateV14()){const o=nearestWorldObjectV14();$('prompt').textContent=o?(o.objType==='encounter'?`CLICK — ATTACK ${o.name.toUpperCase()} • E — ENGAGE`:`E — ${o.name}`):'EMBERWOOD LOWLANDS — Explore • Hunt • Gather • Delve';}else{const o=nearestCampObject();$('prompt').textContent=o?`E — ${o.name}`:(profile&&!ensureWorldProfileV14(profile).enteredLowlands?'NORTH GATE → EMBERWOOD LOWLANDS':'Explore Emberwatch');}renderDeepHuntPanel(null);}else $('prompt').textContent=run?.phase==='player'?(me?.submitted?'Waiting on party...':run.bossTelegraph||'One action per hunter. Click enemy, then body part.'):run?.phase==='choice'?'Safe extraction or greed?':run?.phase==='path'?'Choose the road ahead':'Prepare your hunt.';renderCampQuickbarV131(r);
}
function findAdjacentDownedClient(run,p){return !!Object.values(run?.players||{}).find(q=>q.peerId!==p.peerId&&q.downed&&!q.dead&&Math.abs(q.x-p.x)+Math.abs(q.y-p.y)<=1)}



function drawWardenCombatEffects(run,now=performance.now()){
  Object.values(run?.players||{}).forEach(p=>{
    if(p.classId!=='warden')return;const fx=v7VisualAction(p,Date.now());if(!fx||!['attack','shieldslam','fortress'].includes(fx.type))return;const t=clamp01((Date.now()-fx.startedAt)/fx.duration),src=combatPointPlayer(p),target=fx.targets?.[0],dest=target?rangerEnemyCenter(target):null;
    if(fx.type==='fortress'){
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55*(1-t*.5);ctx.strokeStyle='#74b8ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(src.x,src.y+10,15+7*Math.sin(t*Math.PI),0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#e6bd66';ctx.lineWidth=1;ctx.beginPath();ctx.arc(src.x,src.y+10,20+5*Math.sin(t*Math.PI),0,Math.PI*2);ctx.stroke();ctx.restore()
    }else if(fx.type==='shieldslam'&&dest){
      ctx.save();ctx.globalAlpha=Math.max(.2,1-t);ctx.strokeStyle='#8dc6ff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(src.x,src.y+8);ctx.lineTo(dest.x,dest.y);ctx.stroke();ctx.strokeStyle='#f2c86d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(dest.x,dest.y,6+12*t,0,Math.PI*2);ctx.stroke();ctx.restore()
    }else if(dest){
      ctx.save();ctx.globalAlpha=1-t;ctx.strokeStyle='#d7dde8';ctx.lineWidth=3;ctx.beginPath();ctx.arc(dest.x,dest.y,9,-2.4,.4);ctx.stroke();ctx.restore()
    }
  })
}

function drawExtraClassCombatEffects(run,now=performance.now()){
  Object.values(run?.players||{}).forEach(p=>{
    if(!['berserker','arcanist','templar'].includes(p.classId))return;
    const fx=v7VisualAction(p,Date.now());if(!fx)return;const t=clamp01((Date.now()-fx.startedAt)/fx.duration),src=combatPointPlayer(p),color=CLASS_FX_COLOR[p.classId];
    const first=fx.targets?.[0],dest=first?rangerEnemyCenter(first):null;
    if(p.classId==='berserker'){
      if(fx.type==='frenzy'){
        addRingFx(src.x,src.y+8,'#ff4d36',22+Math.sin(t*Math.PI)*8,180,2);
        ctx.save();ctx.globalAlpha=.25*(1-t);ctx.fillStyle='#ff3c2e';ctx.beginPath();ctx.arc(src.x,src.y+8,17+8*Math.sin(t*Math.PI),0,Math.PI*2);ctx.fill();ctx.restore()
      }else if(fx.type==='cleave'){
        ctx.save();ctx.strokeStyle='#ff7a39';ctx.globalAlpha=Math.max(0,1-t);ctx.lineWidth=4;ctx.beginPath();ctx.arc(src.x,src.y+8,18,-2.6+t*.8,.5+t*.8);ctx.stroke();ctx.strokeStyle='#c9342c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(src.x,src.y+8,23,-2.4+t*.9,.75+t*.9);ctx.stroke();ctx.restore()
      }else if(dest){
        ctx.save();ctx.strokeStyle='#ff744d';ctx.globalAlpha=1-t;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(src.x-5,src.y+7);ctx.lineTo(dest.x,dest.y);ctx.stroke();ctx.restore()
      }
    }else if(p.classId==='arcanist'){
      if(fx.type==='starfall'){
        (fx.targets||[]).slice(0,5).forEach((q,i)=>{const d=rangerEnemyCenter(q),delay=.12+i*.06,u=clamp01((t-delay)/.55);if(u<=0)return;const sx=d.x+12-(i%3)*9,sy=d.y-90,ex=d.x,ey=d.y;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=i%2?'#9c6cff':'#ff7b49';ctx.globalAlpha=Math.max(.2,1-u*.45);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(ex-sx)*u,sy+(ey-sy)*u);ctx.stroke();if(u>.75){ctx.fillStyle='#ffb061';ctx.beginPath();ctx.arc(ex,ey,5*(u-.75)*4,0,Math.PI*2);ctx.fill()}ctx.restore()})
      }else if(fx.type==='lance'&&dest){
        const u=clamp01((t-.22)/.48);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(.18,1-t*.55);ctx.strokeStyle='#ff9356';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(src.x,src.y+6);ctx.lineTo(src.x+(dest.x-src.x)*u,src.y+6+(dest.y-src.y-6)*u);ctx.stroke();ctx.strokeStyle='#c785ff';ctx.lineWidth=2;ctx.stroke();ctx.restore()
      }else if(dest){
        const u=clamp01((t-.25)/.5),x=src.x+(dest.x-src.x)*u,y=src.y+(dest.y-src.y)*u;ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='#b47cff';ctx.globalAlpha=1-t*.5;ctx.beginPath();ctx.arc(x,y,3+2*Math.sin(t*Math.PI),0,Math.PI*2);ctx.fill();ctx.restore()
      }
    }else if(p.classId==='templar'){
      if(fx.type==='radiant'){
        const q=fx.targets?.[0];const d=q?rangerEnemyCenter(q):src;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#f5d978';ctx.globalAlpha=Math.max(.2,1-t*.55);ctx.lineWidth=2;ctx.beginPath();ctx.arc(d.x,d.y+7,10+22*t,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(d.x,d.y-25);ctx.lineTo(d.x,d.y+16);ctx.stroke();ctx.fillStyle='rgba(255,239,160,.2)';ctx.beginPath();ctx.arc(d.x,d.y+5,18*(1-t*.35),0,Math.PI*2);ctx.fill();ctx.restore()
      }else if(fx.type==='smite'&&dest){
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(.2,1-t*.5);ctx.strokeStyle='#ffd76a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(dest.x,dest.y-45);ctx.lineTo(dest.x,dest.y+8);ctx.stroke();ctx.strokeStyle='#fff4c0';ctx.lineWidth=1;ctx.stroke();ctx.restore()
      }else if(dest){
        ctx.save();ctx.strokeStyle='#f0cf72';ctx.globalAlpha=1-t;ctx.lineWidth=3;ctx.beginPath();ctx.arc(dest.x,dest.y,9,-2.2,.6);ctx.stroke();ctx.restore()
      }
    }
  })
}
function drawStatusFx(run,now=performance.now()){
  const sec=now/1000;
  run?.enemies?.filter(e=>e.hp>0).forEach(e=>{const q=combatPointEntity(e);
    if(e.status?.poison){ctx.save();ctx.globalAlpha=.65;ctx.fillStyle='#65dd79';for(let i=0;i<3;i++){const a=sec*2+i*2.1;ctx.fillRect(Math.round(q.x+Math.sin(a)*7),Math.round(q.y+10-Math.cos(a*1.3)*8),2,2)}ctx.restore()}
    if(e.status?.burn){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ff743c';for(let i=0;i<3;i++){const a=sec*3+i*2;ctx.fillRect(Math.round(q.x-5+i*5+Math.sin(a)*2),Math.round(q.y+8-Math.abs(Math.sin(a))*9),2,4)}ctx.restore()}
    if(e.status?.bleed){ctx.save();ctx.fillStyle='#d8424c';ctx.globalAlpha=.7;for(let i=0;i<2;i++)ctx.fillRect(q.x-5+i*9,q.y+13+((i+Math.floor(sec*4))%3),2,3);ctx.restore()}
  });
  Object.values(run?.players||{}).filter(p=>p.connected!==false&&!p.dead&&!p.downed).forEach(p=>{const q=combatPointPlayer(p);
    if(Date.now()-(p.hitFlash||0)<150){ctx.save();ctx.globalAlpha=.35;ctx.fillStyle='#ff5d55';ctx.fillRect(q.x-10,q.y-4,20,24);ctx.restore()}
    if(p.guarding){ctx.save();ctx.strokeStyle='rgba(125,190,255,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y+11,15+Math.sin(sec*5)*1.5,0,Math.PI*2);ctx.stroke();ctx.restore()}
    if(p.classId==='berserker'&&p.frenzyCharges>0){ctx.save();ctx.strokeStyle='rgba(255,75,55,.6)';ctx.beginPath();ctx.arc(q.x,q.y+10,14+Math.sin(sec*7)*2,0,Math.PI*2);ctx.stroke();ctx.restore()}
  })
}

function draw(run){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();const shakeNow=performance.now()<screenShakeUntil;if(shakeNow){const pwr=screenShakePower*Math.max(.15,(screenShakeUntil-performance.now())/260);ctx.translate((Math.random()-.5)*pwr*2,(Math.random()-.5)*pwr*2)}else screenShakePower=0;
  if(!run){if(worldStateV14())drawWorldV14();else drawCamp();ctx.restore();return}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)drawTile(run.map[y][x],x,y);
  drawAmbientMapFx(run);
  drawZoneDecorV09(run);
  drawZoneAtmosphereV09(run);
  drawGrandHuntHazards(run);
  drawEmberwoodProps(run,'under');
  drawEmberwoodLootables(run);
  drawEmberwoodAtmosphere(run);
  drawBossTelegraphZones(run);
  const me=run.players?.[peerId];if(me&&!me.dead){const rr=effectiveRange(me);ctx.fillStyle='rgba(88,177,225,.07)';for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(Math.abs(x-me.x)+Math.abs(y-me.y)<=rr&&isWalk(run.map,x,y))ctx.fillRect(x*TILE+1,y*TILE+1,TILE-2,TILE-2)}
  Object.values(run.players).filter(p=>p.dead).forEach(drawRunPlayer);
  run.enemies.filter(e=>e.hp>0).forEach(drawEnemy);
  (run.deathCaches||[]).filter(c=>!c.collected).forEach(c=>{const x=c.x*TILE,y=c.y*TILE;ctx.fillStyle='#43272b';ctx.fillRect(x+6,y+9,20,17);ctx.strokeStyle='#df7474';ctx.strokeRect(x+5.5,y+8.5,21,18);ctx.fillStyle='#f1c06b';ctx.font='bold 11px monospace';ctx.fillText('✦',x+12,y+21)});
  Object.values(run.players).filter(p=>!p.dead).forEach(drawRunPlayer);
  drawEmberwoodProps(run,'over');
  drawRangerCombatEffects(run);
  drawShadowCombatEffects(run);
  drawWardenCombatEffects(run);
  drawExtraClassCombatEffects(run);
  drawStatusFx(run);
  drawWorldFx();
  drawCombatFloaters();
  drawBossHealthBar(run);
  ctx.fillStyle='rgba(0,0,0,.08)';for(let x=0;x<canvas.width;x+=64)ctx.fillRect(x,0,1,canvas.height);
  ctx.restore()
}
function drawCampFocusV13(){
  const o=nearestCampObject();if(!o)return;const sec=performance.now()/1000,x=o.x*TILE+16,y=o.y*TILE+16,r=15+Math.sin(sec*5)*2;ctx.save();ctx.strokeStyle='rgba(132,205,255,.72)';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(120,195,255,.08)';ctx.beginPath();ctx.arc(x,y,r-3,0,Math.PI*2);ctx.fill();ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillStyle='#cce8ff';ctx.fillText('E',x,y+3);ctx.restore()
}
function drawNorthGateV14(){
  const cx=15*TILE,top=2;
  ctx.save();
  // Timber palisade with a central open arch.
  ctx.fillStyle='#4a3828';for(let x=0;x<W;x++){if(x>=13&&x<=17)continue;ctx.fillRect(x*TILE,0,5,31);ctx.fillStyle='#604832';ctx.fillRect(x*TILE+5,0,3,26);ctx.fillStyle='#4a3828'}
  ctx.fillStyle='#5f472f';ctx.fillRect(cx-58,0,12,62);ctx.fillRect(cx+46,0,12,62);ctx.fillRect(cx-58,3,116,11);
  ctx.fillStyle='#8b6942';ctx.fillRect(cx-50,12,100,18);ctx.strokeStyle='#c49b5b';ctx.strokeRect(cx-49.5,12.5,99,17);
  ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillStyle='#f1d28c';ctx.fillText('NORTH GATE',cx,24);ctx.font='bold 7px monospace';ctx.fillStyle='#c3d3bd';ctx.fillText('EMBERWOOD LOWLANDS',cx,39);
  // Gate torches.
  [cx-66,cx+66].forEach((x,i)=>{ctx.fillStyle='#4d3424';ctx.fillRect(x-2,30,4,25);ctx.fillStyle=`rgba(255,${150+i*18},55,.9)`;ctx.beginPath();ctx.arc(x,29,4+Math.sin(performance.now()/140+i)*1.2,0,Math.PI*2);ctx.fill()});
  if(profile&&!ensureWorldProfileV14(profile).enteredLowlands){const p=.5+.5*Math.sin(performance.now()/240);ctx.strokeStyle=`rgba(241,210,132,${.45+.45*p})`;ctx.lineWidth=3;ctx.strokeRect(cx-62,0,124,65);ctx.lineWidth=1;ctx.font='bold 8px monospace';ctx.fillStyle='#ffe39a';ctx.fillText('FIRST STEPS →',cx,59)}
  ctx.restore()
}
function drawCamp(){
  drawCampGround();
  drawNorthGateV14();
  // Distinct districts with breathing room and cleaned production sprites.
  drawCampSprite('tent',.5,1.2,5.0,3.9,.96);
  drawCampSprite('forge',2.25,4.0,5.6,4.6,1);
  drawCampSprite('crafter_tent',22.7,2.8,5.0,4.4,1);
  drawCampSprite('healer_tent',22.7,10.5,5.0,4.4,1);
  drawCampSprite('hunt_board',10.2,3.85,3.8,3.35,1);
  drawCampSprite('stash',8.5,1.45,3.0,2.55,1);
  drawCampSprite('war_table',18.0,1.25,4.3,2.85,.98);
  drawCampSprite('trophy_wall',18.25,4.7,3.7,3.3,1);
  drawCampSprite('bonfire',13.1,8.0,3.8,3.45,1);
  drawCampSprite('wager_table',16.0,12.5,4.6,3.2,1);
  drawCampSprite('training_dummy',3.7,12.6,2.2,3.0,1);
  drawCampSprite('training_dummy',5.8,12.6,2.2,3.0,.94);
  drawCampSprite('storage',8.5,13.3,4.4,3.0,.94);
  // Service NPC staging.
  drawCampSprite('npc_smith',4.0,5.3,2.0,2.75,1);
  drawCampSprite('npc_crafter',24.0,4.0,2.0,2.75,1);
  drawCampSprite('npc_healer',24.2,11.9,2.0,2.75,1);
  drawCampSprite('npc_gambler',17.2,13.2,2.0,2.75,1);
  if((room||snapshot)?.merchant?.active){drawCampSprite('merchant_stall',23.1,6.7,5.9,4.1,1);drawCampSprite('npc_merchant',26.1,8.2,2.0,2.75,1)}
  // Localized light instead of a single wash.
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.23;
  let g=ctx.createRadialGradient(15*TILE,10*TILE,5,15*TILE,10*TILE,78);g.addColorStop(0,'rgba(255,150,66,.95)');g.addColorStop(1,'rgba(255,90,35,0)');ctx.fillStyle=g;ctx.fillRect(11*TILE,6*TILE,8*TILE,8*TILE);
  g=ctx.createRadialGradient(5*TILE,7*TILE,3,5*TILE,7*TILE,62);g.addColorStop(0,'rgba(255,116,48,.78)');g.addColorStop(1,'rgba(255,70,25,0)');ctx.fillStyle=g;ctx.fillRect(2*TILE,4*TILE,7*TILE,7*TILE);ctx.restore();
  drawCampProgressionV10();
  ctx.save();for(let i=0;i<16;i++){const a=performance.now()*.001*(.72+i*.023)+i;ctx.fillStyle=`rgba(255,${145+i*4},70,${.10+.06*Math.sin(a)})`;ctx.fillRect(15*TILE-15+(i*5%30),10*TILE-Math.abs(Math.sin(a))*24,2,2)}ctx.restore();
  drawCampFocusV13();
  const label=(t,tx,ty)=>{ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillStyle='rgba(235,240,247,.92)';ctx.shadowColor='#000';ctx.shadowBlur=3;ctx.fillText(t,tx*TILE+16,ty*TILE);ctx.shadowBlur=0};
  label('HUNT BOARD',12,4.05);label('FORGE QUARTER',5,5);label('RELIC CRAFTER',25,4);label('HEALER',25,12);label('TRAINING YARD',5,13);label('STASH',10,2);label('WAR TABLE',20,2);label('TROPHY WALL',20,5);label('BONFIRE',15,8);label('CINDER’S WAGER',18,13);if((room||snapshot)?.merchant?.active)label('GILDED CARAVAN',27,8);ctx.textAlign='left';
  Object.values((room||snapshot)?.players||{}).forEach(drawCampPlayer)
}
function drawCampPlayer(p){
  const x=(p.campX??14)*TILE,y=(p.campY??15)*TILE,c=CLASSES[p.classId];
  if(drawClassSpriteV7(p,true))return;
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x+7,y+25,18,4);ctx.fillStyle=c.color;ctx.fillRect(x+9,y+13,14,14);ctx.fillStyle='#dfbfa1';ctx.fillRect(x+11,y+6,10,9);ctx.fillStyle='#20242c';ctx.fillRect(x+10,y+5,12,4);
  if(p.peerId===peerId){ctx.strokeStyle='#80def0';ctx.lineWidth=2;ctx.strokeRect(x+6,y+3,20,26);ctx.lineWidth=1}
  ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle='#eef4fb';ctx.fillText(`${p.name}${p.title&&p.title!=='Hunter'?`, ${p.title}`:''}`,x+16,y+36);ctx.textAlign='left'
}


function tileSeed(x,y,o=0){return ((x*73856093)^(y*19349663)^(o*83492791))>>>0}
function tileRand01(x,y,o=0){return (tileSeed(x,y,o)%1000)/1000}
function drawCampGround(){
  ctx.fillStyle='#142219';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const northRoad=(y>=2&&y<=3&&x>=6&&x<=23),mainRoad=(x>=14&&x<=16&&y>=1&&y<=16),crossRoad=(y>=9&&y<=11&&x>=7&&x<=27),boardSpur=(x>=11&&x<=14&&y>=5&&y<=6);
    const forgePad=(x>=2&&x<=8&&y>=4&&y<=9),eastPad=(x>=22&&x<=28&&y>=3&&y<=16),northPad=(x>=8&&x<=22&&y>=1&&y<=5);
    if(northRoad||mainRoad||crossRoad||boardSpur)drawCampTexture('dirt_tex',x,y,.9);else if(forgePad||eastPad||northPad)drawCampTexture('stone_tex',x,y,.72);else if(!drawCampTexture('grass_tex',x,y,.84))drawTile('grass',x,y)
  }
  for(let y=12;y<=17;y++)for(let x=8;x<=12;x++)drawCampTexture('wood_tex',x,y,.52);
  for(let y=12;y<=17;y++)for(let x=15;x<=21;x++)if((x+y)%3===0)drawCampTexture('wood_tex',x,y,.32);
  ctx.save();ctx.fillStyle='rgba(91,62,36,.16)';ctx.fillRect(14*TILE,1*TILE,3*TILE,16*TILE);ctx.fillRect(7*TILE,9*TILE,21*TILE,3*TILE);ctx.fillRect(6*TILE,2*TILE,17*TILE,2*TILE);ctx.fillRect(11*TILE,5*TILE,4*TILE,2*TILE);ctx.strokeStyle='rgba(31,24,17,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14*TILE,1*TILE);ctx.lineTo(14*TILE,17*TILE);ctx.moveTo(17*TILE,1*TILE);ctx.lineTo(17*TILE,17*TILE);ctx.moveTo(7*TILE,9*TILE);ctx.lineTo(28*TILE,9*TILE);ctx.moveTo(7*TILE,12*TILE);ctx.lineTo(28*TILE,12*TILE);ctx.stroke();ctx.setLineDash([9,13]);ctx.strokeStyle='rgba(206,172,112,.12)';ctx.beginPath();ctx.moveTo(15.5*TILE,1*TILE);ctx.lineTo(15.5*TILE,17*TILE);ctx.moveTo(7*TILE,10.5*TILE);ctx.lineTo(28*TILE,10.5*TILE);ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=1;for(let i=0;i<24;i++){const x=(tileSeed(i,7,141)%W)*TILE+8,y=(tileSeed(i,11,142)%H)*TILE+10;if(x>13*TILE&&x<18*TILE)continue;ctx.fillStyle=i%3?'rgba(111,137,89,.22)':'rgba(190,160,105,.18)';ctx.fillRect(x,y,2,2)}ctx.restore();ctx.fillStyle='rgba(28,43,31,.13)';ctx.fillRect(0,0,canvas.width,canvas.height)
}

function drawAmbientMapFx(run){
  const sec=performance.now()*0.001;
  if(!run)return;
  const outdoor=(run.missionId==='frontier'||run.map?.[1]?.includes('grass')||run.map?.flat?.().includes?.('tree'));
  ctx.save();
  if(outdoor){
    for(let i=0;i<18;i++){
      const x=(tileSeed(i+3,i*7,99)%canvas.width), y=(tileSeed(i+11,i*13,101)%canvas.height);
      const driftX=Math.sin(sec*0.7+i)*9, driftY=Math.cos(sec*0.9+i*1.7)*6;
      const alpha=.08+.05*Math.sin(sec*2+i*0.6);
      ctx.fillStyle=`rgba(142,255,188,${alpha.toFixed(3)})`;
      ctx.fillRect(Math.round(x+driftX),Math.round(y+driftY),2,2);
    }
  }else{
    for(let i=0;i<16;i++){
      const x=(tileSeed(i+5,i*9,77)%canvas.width), y=(tileSeed(i+19,i*5,33)%canvas.height);
      const alpha=.03+.03*Math.sin(sec*1.3+i);
      ctx.fillStyle=`rgba(205,220,240,${alpha.toFixed(3)})`;
      ctx.fillRect(Math.round(x+Math.sin(sec+i)*4),Math.round(y+Math.cos(sec*0.8+i)*3),1,1);
    }
  }
  // subtle boss-mark pulse
  let glow=0.14+.08*Math.sin(sec*4);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(run.map[y][x]==='bossmark'){
    const px=x*TILE,py=y*TILE;const g=ctx.createRadialGradient(px+16,py+16,2,px+16,py+16,22);
    g.addColorStop(0,`rgba(255,108,64,${glow})`);g.addColorStop(1,'rgba(255,108,64,0)');ctx.fillStyle=g;ctx.fillRect(px-6,py-6,44,44)
  }
  ctx.restore();
}

function drawTile(t,x,y){
  const px=x*TILE,py=y*TILE,h=tileSeed(x,y),sec=performance.now()*0.001;
  if(t==='grass'){
    const baseA=(h&1)?'#25432f':'#2c4a35',baseB=(h&2)?'#213a2a':'#284131';
    ctx.fillStyle=baseA;ctx.fillRect(px,py,TILE,TILE);ctx.fillStyle=baseB;ctx.fillRect(px,py+14,TILE,18);
    ctx.fillStyle='rgba(17,28,20,.18)';ctx.fillRect(px,py+24,TILE,8);
    for(let i=0;i<4;i++){const gx=px+3+((h>>(i*3))%24), gy=py+8+((h>>(i*5))%18), ht=3+((h>>(i*7))%4); ctx.fillStyle=i%2?'#335b3d':'#3c6a47'; ctx.fillRect(gx,gy,1,ht); ctx.fillRect(gx+1,gy+1,1,Math.max(1,ht-1));}
    if((h%7)===0){ctx.fillStyle='#71915a';ctx.fillRect(px+20,py+10,2,2);ctx.fillRect(px+22,py+12,1,1)}
    if((h%11)===0){ctx.fillStyle='#c2b16d';ctx.fillRect(px+8,py+18,2,2)}
    if((h%13)===0){ctx.strokeStyle='rgba(90,72,49,.35)';ctx.beginPath();ctx.moveTo(px+4,py+22);ctx.lineTo(px+9,py+24);ctx.lineTo(px+14,py+23);ctx.stroke()}
  }
  if(t==='path'){
    ctx.fillStyle='#5f523d';ctx.fillRect(px,py,TILE,TILE);ctx.fillStyle='rgba(111,93,68,.35)';ctx.fillRect(px,py+18,TILE,14);
    for(let i=0;i<5;i++){const sx=px+2+((h>>(i*4))%25), sy=py+5+((h>>(i*5))%20), sw=3+((h>>(i*2))%5), sh=2+((h>>(i*3))%3); ctx.fillStyle=i%2?'#897257':'#756246'; ctx.fillRect(sx,sy,sw,sh);}
    ctx.strokeStyle='rgba(38,28,19,.18)';ctx.beginPath();ctx.moveTo(px+2,py+25);ctx.lineTo(px+30,py+22);ctx.stroke();
    if((h%4)===0){ctx.fillStyle='rgba(196,174,121,.22)';ctx.fillRect(px+18,py+20,6,2)}
  }
  if(t==='tree'){
    ctx.fillStyle='#1d3427';ctx.fillRect(px,py,TILE,TILE);
    ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(px+16,py+25,11,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4c3726';ctx.fillRect(px+13,py+16,6,14);ctx.fillStyle='#6a4c34';ctx.fillRect(px+15,py+17,2,12);
    ctx.fillStyle='#173b28';ctx.beginPath();ctx.arc(px+12,py+12,9,0,Math.PI*2);ctx.arc(px+19,py+13,8,0,Math.PI*2);ctx.arc(px+16,py+8,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#275337';ctx.beginPath();ctx.arc(px+10,py+11,6,0,Math.PI*2);ctx.arc(px+21,py+11,6,0,Math.PI*2);ctx.arc(px+16,py+6,7,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(89,61,37,.35)';ctx.beginPath();ctx.moveTo(px+14,py+28);ctx.lineTo(px+10,py+31);ctx.moveTo(px+18,py+28);ctx.lineTo(px+21,py+31);ctx.stroke();
  }
  if(t==='rock'){
    ctx.fillStyle='#2a3e30';ctx.fillRect(px,py,TILE,TILE);
    ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(px+16,py+23,11,4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#51585d';ctx.beginPath();ctx.moveTo(px+7,py+23);ctx.lineTo(px+10,py+11);ctx.lineTo(px+21,py+8);ctx.lineTo(px+26,py+15);ctx.lineTo(px+23,py+24);ctx.lineTo(px+12,py+25);ctx.closePath();ctx.fill();
    ctx.fillStyle='#6c757c';ctx.beginPath();ctx.moveTo(px+11,py+12);ctx.lineTo(px+20,py+10);ctx.lineTo(px+22,py+15);ctx.lineTo(px+15,py+18);ctx.closePath();ctx.fill();
    ctx.fillStyle='#425147';ctx.fillRect(px+9,py+23,4,2);ctx.fillRect(px+20,py+22,3,2);
  }
  if(t==='floor'){
    const base=(h&1)?'#343b47':'#2b313d';ctx.fillStyle=base;ctx.fillRect(px,py,TILE,TILE);
    ctx.strokeStyle='rgba(255,255,255,.028)';ctx.strokeRect(px+.5,py+.5,TILE-1,TILE-1);
    ctx.strokeStyle='rgba(15,18,22,.22)';ctx.strokeRect(px+5.5,py+5.5,10,10);ctx.strokeRect(px+16.5,py+16.5,11,10);
    ctx.beginPath();ctx.moveTo(px+16.5,py+0);ctx.lineTo(px+16.5,py+32);ctx.moveTo(px+0,py+16.5);ctx.lineTo(px+32,py+16.5);ctx.stroke();
    if((h%5)===0){ctx.strokeStyle='rgba(152,161,173,.13)';ctx.beginPath();ctx.moveTo(px+21,py+7);ctx.lineTo(px+24,py+12);ctx.lineTo(px+19,py+16);ctx.stroke()}
    if((h%9)===0){ctx.fillStyle='rgba(97,123,94,.10)';ctx.fillRect(px+3,py+25,4,2)}
  }
  if(t==='bossmark'){
    ctx.fillStyle='#342b30';ctx.fillRect(px,py,TILE,TILE);
    ctx.strokeStyle='rgba(202,85,55,.18)';ctx.strokeRect(px+1.5,py+1.5,TILE-3,TILE-3);
    ctx.strokeStyle='rgba(255,140,73,.36)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+8,py+16);ctx.lineTo(px+24,py+16);ctx.moveTo(px+16,py+8);ctx.lineTo(px+16,py+24);ctx.stroke();ctx.lineWidth=1;
    ctx.strokeStyle='rgba(255,109,58,.22)';ctx.beginPath();ctx.arc(px+16,py+16,9+Math.sin(sec*3+(h%5))*0.6,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='rgba(240,102,49,.18)';ctx.fillRect(px+14,py+14,4,4);
  }
  if(t==='wall'){
    ctx.fillStyle='#232934';ctx.fillRect(px,py,TILE,TILE);ctx.fillStyle='#313846';ctx.fillRect(px,py,TILE,5);
    ctx.strokeStyle='rgba(14,16,22,.46)';ctx.strokeRect(px+.5,py+.5,TILE-1,TILE-1);
    ctx.fillStyle='#28303b';ctx.fillRect(px+1,py+6,14,8);ctx.fillRect(px+16,py+6,15,8);ctx.fillRect(px+5,py+15,14,8);ctx.fillRect(px+20,py+15,11,8);ctx.fillRect(px+2,py+24,13,7);ctx.fillRect(px+16,py+24,14,7);
    ctx.strokeStyle='rgba(255,255,255,.035)';ctx.beginPath();ctx.moveTo(px,py+15.5);ctx.lineTo(px+32,py+15.5);ctx.moveTo(px+15.5,py+6);ctx.lineTo(px+15.5,py+14);ctx.moveTo(px+19.5,py+24);ctx.lineTo(px+19.5,py+31);ctx.stroke();
    if((h%4)===0){ctx.fillStyle='rgba(80,110,82,.18)';ctx.fillRect(px+3,py+26,4,2)}
  }
}
function drawRunPlayer(p){
  const x=p.x*TILE,y=p.y*TILE,c=CLASSES[p.classId];
  if(drawClassSpriteV7(p,false))return;
  if(p.dead||p.downed){ctx.save();ctx.translate(x+16,y+26);ctx.rotate((p.facing==='west'||p.facing==='north'?-1:1)*Math.PI*.48);ctx.globalAlpha=p.dead?.38:.78;ctx.fillStyle=c.color;ctx.fillRect(-7,-13,14,14);ctx.fillStyle='#dfbfa1';ctx.fillRect(-5,-20,10,9);ctx.restore();ctx.globalAlpha=1;return}
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x+7,y+25,18,4);
  ctx.fillStyle=c.color;ctx.fillRect(x+9,y+13,14,14);ctx.fillStyle='#dfbfa1';ctx.fillRect(x+11,y+6,10,9);ctx.fillStyle='#20242c';ctx.fillRect(x+10,y+5,12,4);
  if(p.peerId===peerId){ctx.strokeStyle='#8dd9ff';ctx.lineWidth=2;ctx.strokeRect(x+6,y+3,20,26);ctx.lineWidth=1}
  ctx.globalAlpha=1
}

function drawRegularMonsterPolished(e,now=performance.now()){
  if(drawZoneMonsterSpriteV09(e,now))return;
  const x=e.x*TILE,y=e.y*TILE,sec=now/1000,bob=Math.round(Math.sin(sec*3+(e.x+e.y))*.8),flash=Date.now()-(e.hitFlash||0)<125,attackAge=Date.now()-(e.attackFlash||0),attack=attackAge<180,lunge=attack?Math.sin(clamp(attackAge/180,0,1)*Math.PI)*5:0;
  const xx=x+(e.attackDx||0)*lunge,yy=y+bob+(e.attackDy||0)*lunge;
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(flash){ctx.shadowColor='#fff';ctx.shadowBlur=9}
  ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(xx+16,y+27,11,3,0,0,Math.PI*2);ctx.fill();
  const k=e.kind;
  if(k==='wolf'){
    ctx.fillStyle='#5e5c59';ctx.fillRect(xx+6,yy+14,18,9);ctx.fillStyle='#77736c';ctx.fillRect(xx+18,yy+9,9,9);ctx.fillStyle='#444441';ctx.fillRect(xx+7,yy+21,4,6);ctx.fillRect(xx+19,yy+21,4,6);
    ctx.fillStyle='#54514d';ctx.beginPath();ctx.moveTo(xx+20,yy+10);ctx.lineTo(xx+22,yy+5);ctx.lineTo(xx+24,yy+11);ctx.fill();ctx.beginPath();ctx.moveTo(xx+24,yy+10);ctx.lineTo(xx+27,yy+6);ctx.lineTo(xx+27,yy+13);ctx.fill();
    ctx.fillStyle='#f0ca62';ctx.fillRect(xx+23,yy+12,2,2);ctx.fillStyle='#d6d3cb';ctx.fillRect(xx+27,yy+16,3,1);
    ctx.strokeStyle='#65605b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xx+7,yy+16);ctx.quadraticCurveTo(xx+1,yy+9,xx+4,yy+6);ctx.stroke();ctx.lineWidth=1
  }else if(k==='goblin'){
    ctx.fillStyle='#5e7650';ctx.fillRect(xx+10,yy+8,11,9);ctx.fillRect(xx+11,yy+16,10,10);ctx.fillStyle='#3c5233';ctx.beginPath();ctx.moveTo(xx+10,yy+10);ctx.lineTo(xx+5,yy+12);ctx.lineTo(xx+10,yy+14);ctx.fill();ctx.beginPath();ctx.moveTo(xx+21,yy+10);ctx.lineTo(xx+27,yy+12);ctx.lineTo(xx+21,yy+14);ctx.fill();
    ctx.fillStyle='#e0c45d';ctx.fillRect(xx+13,yy+11,2,2);ctx.fillRect(xx+18,yy+11,2,2);ctx.fillStyle='#624a33';ctx.fillRect(xx+8,yy+17,4,8);ctx.fillRect(xx+20,yy+17,4,8);ctx.fillStyle='#7c6040';ctx.fillRect(xx+9,yy+24,5,3);ctx.fillRect(xx+18,yy+24,5,3);
    ctx.strokeStyle='#b7bac0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xx+22,yy+18);ctx.lineTo(xx+28,yy+24);ctx.stroke();ctx.lineWidth=1
  }else if(k==='spider'){
    ctx.fillStyle='#51405f';ctx.beginPath();ctx.ellipse(xx+17,yy+17,8,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#342b41';ctx.beginPath();ctx.ellipse(xx+11,yy+17,5,5,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#6d5a7f';ctx.lineWidth=2;
    [[8,13,2,8],[8,16,1,16],[8,19,2,25],[24,13,30,8],[24,16,31,16],[24,19,30,25],[12,21,8,28],[20,21,24,28]].forEach(a=>{ctx.beginPath();ctx.moveTo(xx+a[0],yy+a[1]);ctx.lineTo(xx+a[2],yy+a[3]);ctx.stroke()});ctx.lineWidth=1;
    ctx.fillStyle='#db755f';ctx.fillRect(xx+8,yy+15,2,2);ctx.fillRect(xx+11,yy+14,2,2)
  }else if(k==='skeleton'){
    ctx.fillStyle='#c3bda9';ctx.fillRect(xx+12,yy+5,9,8);ctx.fillStyle='#20242b';ctx.fillRect(xx+14,yy+8,2,2);ctx.fillRect(xx+18,yy+8,2,2);ctx.strokeStyle='#b9b39f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xx+16,yy+13);ctx.lineTo(xx+16,yy+25);ctx.moveTo(xx+10,yy+16);ctx.lineTo(xx+22,yy+16);ctx.moveTo(xx+10,yy+19);ctx.lineTo(xx+22,yy+19);ctx.moveTo(xx+13,yy+24);ctx.lineTo(xx+11,yy+29);ctx.moveTo(xx+19,yy+24);ctx.lineTo(xx+21,yy+29);ctx.stroke();ctx.strokeStyle='#d0d2d7';ctx.beginPath();ctx.moveTo(xx+22,yy+13);ctx.lineTo(xx+29,yy+25);ctx.stroke();ctx.lineWidth=1
  }else if(k==='cultist'){
    ctx.fillStyle='#4f304c';ctx.beginPath();ctx.moveTo(xx+16,yy+4);ctx.lineTo(xx+8,yy+14);ctx.lineTo(xx+10,yy+27);ctx.lineTo(xx+23,yy+27);ctx.lineTo(xx+24,yy+14);ctx.closePath();ctx.fill();ctx.fillStyle='#281d2a';ctx.fillRect(xx+12,yy+10,9,7);ctx.fillStyle='#e3785b';ctx.fillRect(xx+14,yy+12,2,2);ctx.fillRect(xx+18,yy+12,2,2);
    ctx.fillStyle='#ff7b46';ctx.beginPath();ctx.arc(xx+25,yy+16,3+Math.sin(sec*5)*.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b84d37';ctx.fillRect(xx+15,yy+19,3,8)
  }else if(k==='knight'){
    ctx.fillStyle='#657080';ctx.fillRect(xx+10,yy+8,12,8);ctx.fillRect(xx+9,yy+15,14,11);ctx.fillStyle='#303843';ctx.fillRect(xx+11,yy+11,10,2);ctx.fillStyle='#8895a5';ctx.fillRect(xx+10,yy+7,12,2);ctx.fillStyle='#4b5562';ctx.fillRect(xx+7,yy+17,5,8);ctx.fillStyle='#84909c';ctx.fillRect(xx+10,yy+24,5,4);ctx.fillRect(xx+18,yy+24,5,4);
    ctx.fillStyle='#37414d';ctx.fillRect(xx+23,yy+14,6,10);ctx.strokeStyle='#d2d5db';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xx+8,yy+15);ctx.lineTo(xx+4,yy+27);ctx.stroke();ctx.lineWidth=1
  }else if(k==='slime'){
    ctx.fillStyle='rgba(76,127,88,.92)';ctx.beginPath();ctx.moveTo(xx+5,yy+25);ctx.quadraticCurveTo(xx+4,yy+12,xx+12,yy+10);ctx.quadraticCurveTo(xx+19,yy+4,xx+26,yy+14);ctx.quadraticCurveTo(xx+30,yy+21,xx+26,yy+25);ctx.closePath();ctx.fill();ctx.fillStyle='#89c596';ctx.fillRect(xx+11,yy+15,3,3);ctx.fillRect(xx+20,yy+15,3,3);ctx.fillStyle='rgba(198,241,204,.22)';ctx.fillRect(xx+10,yy+11,8,3)
  }else if(k==='wraith'){
    ctx.save();ctx.globalAlpha=.78;ctx.fillStyle='#6775a8';ctx.beginPath();ctx.moveTo(xx+16,yy+4);ctx.lineTo(xx+8,yy+13);ctx.lineTo(xx+9,yy+25);ctx.lineTo(xx+13,yy+21);ctx.lineTo(xx+16,yy+28);ctx.lineTo(xx+19,yy+21);ctx.lineTo(xx+24,yy+25);ctx.lineTo(xx+23,yy+13);ctx.closePath();ctx.fill();ctx.fillStyle='#b5c6ff';ctx.fillRect(xx+13,yy+10,2,2);ctx.fillRect(xx+18,yy+10,2,2);ctx.restore();ctx.strokeStyle='rgba(126,154,233,.35)';ctx.beginPath();ctx.arc(xx+16,yy+17,10+Math.sin(sec*3)*2,0,Math.PI*2);ctx.stroke()
  }else if(k==='golem'){
    ctx.fillStyle='#5f6970';ctx.fillRect(xx+10,yy+9,12,8);ctx.fillRect(xx+8,yy+16,16,10);ctx.fillStyle='#79858b';ctx.fillRect(xx+4,yy+15,6,9);ctx.fillRect(xx+24,yy+15,6,9);ctx.fillRect(xx+9,yy+24,6,5);ctx.fillRect(xx+19,yy+24,6,5);ctx.fillStyle='#74c6d9';ctx.fillRect(xx+14,yy+17,5,5);ctx.fillStyle='rgba(116,198,217,.28)';ctx.fillRect(xx+12,yy+15,9,9)
  }else if(k==='drake'){
    ctx.fillStyle='#819ca6';ctx.fillRect(xx+9,yy+14,15,9);ctx.fillRect(xx+20,yy+10,8,8);ctx.beginPath();ctx.moveTo(xx+11,yy+15);ctx.lineTo(xx+3,yy+7);ctx.lineTo(xx+7,yy+20);ctx.fill();ctx.beginPath();ctx.moveTo(xx+17,yy+15);ctx.lineTo(xx+24,yy+5);ctx.lineTo(xx+23,yy+20);ctx.fill();ctx.strokeStyle='#657c84';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xx+10,yy+20);ctx.lineTo(xx+3,yy+27);ctx.stroke();ctx.lineWidth=1;ctx.fillStyle='#d4ecf1';ctx.fillRect(xx+24,yy+13,2,2)
  }else if(k==='worldeater'){
    ctx.fillStyle='#713732';ctx.beginPath();ctx.arc(xx+16,yy+17,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1a1316';ctx.beginPath();ctx.arc(xx+16,yy+17,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff6b58';for(let i=0;i<5;i++){const a=i*Math.PI*2/5+sec*.3;ctx.fillRect(Math.round(xx+15+Math.cos(a)*7),Math.round(yy+16+Math.sin(a)*7),2,2)}ctx.strokeStyle='#8e4038';for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.moveTo(xx+16+Math.cos(a)*7,yy+17+Math.sin(a)*7);ctx.lineTo(xx+16+Math.cos(a)*14,yy+17+Math.sin(a)*14);ctx.stroke()}
  }else{
    ctx.fillStyle=ENEMY[k]?.color||'#944d44';ctx.fillRect(xx+9,yy+10,14,17)
  }
  if(attack){ctx.strokeStyle='rgba(255,118,88,.85)';ctx.lineWidth=2;ctx.strokeRect(xx+5,yy+5,22,22);ctx.lineWidth=1}
  if(e.elite){ctx.strokeStyle=e.golden?'#ffd85b':e.nemesis?'#ef5656':'#b87ef0';ctx.lineWidth=2;ctx.strokeRect(xx+3,yy+3,26,27);ctx.lineWidth=1}
  if(e.id===selectedTargetId){ctx.strokeStyle='#7fe3ef';ctx.lineWidth=2;ctx.strokeRect(xx+1,yy+1,30,30);ctx.lineWidth=1}
  ctx.shadowBlur=0;
  ctx.fillStyle='#151922';ctx.fillRect(xx+4,y+1,24,4);ctx.fillStyle=e.elite?'#c16ce4':'#d85d68';ctx.fillRect(xx+4,y+1,24*clamp(e.hp/e.maxHp,0,1),4);ctx.strokeStyle='rgba(255,255,255,.12)';ctx.strokeRect(xx+4.5,y+1.5,23,3);
  ctx.restore()
}
function drawBossDetailOverlay(e,px,py,w,h,now=performance.now()){
  const sec=now/1000,pulse=(Math.sin(sec*3)+1)/2;
  ctx.save();
  if(Date.now()-(e.hitFlash||0)<140){ctx.globalAlpha=.24;ctx.fillStyle='#fff';ctx.fillRect(px,py,w,h)}
  if(e.kind==='direwolf'){ctx.fillStyle='rgba(34,35,38,.8)';for(let i=0;i<7;i++){const sx=px+w*(.20+i*.08);ctx.beginPath();ctx.moveTo(sx,py+h*.37);ctx.lineTo(sx+w*.035,py+h*(.22-(i%2)*.04));ctx.lineTo(sx+w*.06,py+h*.39);ctx.fill()}ctx.strokeStyle='rgba(255,74,52,.28)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px+w*.71,py+h*.43,w*.17,0,Math.PI*2);ctx.stroke()}
  if(e.kind==='bossgoblin'){ctx.fillStyle='#d6ad55';for(let i=0;i<5;i++){const sx=px+w*(.35+i*.075);ctx.beginPath();ctx.moveTo(sx,py+h*.1);ctx.lineTo(sx+w*.025,py+h*(.02+(i%2)*.03));ctx.lineTo(sx+w*.05,py+h*.1);ctx.fill()}ctx.strokeStyle='#d9bd83';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(px+w*.25,py+h*.5);ctx.lineTo(px+w*.78,py+h*.73);ctx.stroke()}
  if(e.kind==='mire'){ctx.strokeStyle='rgba(92,170,94,.65)';ctx.lineWidth=5;for(let i=0;i<5;i++){const a=-1+i*.55;ctx.beginPath();ctx.moveTo(px+w*.5,py+h*.58);ctx.quadraticCurveTo(px+w*(.5+Math.sin(sec+i)*.15),py+h*.8,px+w*(.15+i*.18),py+h*.96);ctx.stroke()}ctx.fillStyle='rgba(118,218,102,.32)';ctx.beginPath();ctx.arc(px+w*.5,py+h*.46,w*(.10+pulse*.02),0,Math.PI*2);ctx.fill()}
  if(e.kind==='bossknight'){ctx.strokeStyle='rgba(217,174,99,.7)';ctx.lineWidth=2;ctx.strokeRect(px+w*.39,py+h*.3,w*.22,h*.25);ctx.beginPath();ctx.moveTo(px+w*.5,py+h*.32);ctx.lineTo(px+w*.5,py+h*.52);ctx.moveTo(px+w*.42,py+h*.41);ctx.lineTo(px+w*.58,py+h*.41);ctx.stroke()}
  if(e.kind==='bossdrake'){ctx.strokeStyle='rgba(173,227,244,.42)';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(px+w*.55,py+h*.4,w*(.3+i*.05+pulse*.01),-1.3,.4);ctx.stroke()}ctx.fillStyle='rgba(194,238,252,.65)';for(let i=0;i<6;i++)ctx.fillRect(px+w*(.2+i*.11),py+h*(.16+(i%2)*.08),3,3)}
  if(e.kind==='riftboss'){ctx.strokeStyle=`rgba(198,128,255,${.35+.2*pulse})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(px+w*.5,py+h*.42,w*(.23+pulse*.04),0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(px+w*.5,py+h*.42,w*(.32-pulse*.03),0,Math.PI*2);ctx.stroke()}
  if(e.intent==='devastate'){ctx.strokeStyle=`rgba(255,104,72,${.35+.35*pulse})`;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(px+w*.5,py+h*.76,w*.48,h*.18,0,0,Math.PI*2);ctx.stroke()}
  if(e.kind==='worldeater'){ctx.strokeStyle=`rgba(255,72,58,${.4+.35*pulse})`;ctx.lineWidth=3;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(px+w*.34+i*w*.05,py+h*.28);ctx.lineTo(px+w*(.30+i*.07),py+h*.76);ctx.stroke()}ctx.fillStyle='rgba(255,74,53,.6)';ctx.beginPath();ctx.arc(px+w*.65,py+h*.22,w*.035*(1+pulse),0,Math.PI*2);ctx.fill();if(e.heartExposed){ctx.fillStyle=`rgba(255,53,94,${.28+.34*pulse})`;ctx.beginPath();ctx.arc(px+w*.50,py+h*.50,w*(e.heartBroken?.055:.085),0,Math.PI*2);ctx.fill();ctx.strokeStyle=e.heartBroken?'rgba(255,215,140,.75)':'rgba(255,93,126,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px+w*.50,py+h*.50,w*.115,0,Math.PI*2);ctx.stroke()}if((e.bossPhase||1)>=4){ctx.strokeStyle=`rgba(255,45,53,${.24+.25*pulse})`;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(px+w*.5,py+h*.70,w*.46,h*.19,0,0,Math.PI*2);ctx.stroke()}}
  ctx.restore()
}

function drawEnemy(e){
  const boss=e.boss,cBase=ENEMY[e.kind]?.color||'#944d44';
  if(!boss){drawRegularMonsterPolished(e);return}
  if(boss){
    const size=e.size||3,bAge=Date.now()-(e.attackFlash||0),bKick=bAge<200?Math.sin(clamp(bAge/200,0,1)*Math.PI)*6:0,bvp=bossVisualPos(e),px=(bvp.x-Math.floor(size/2))*TILE+(e.attackDx||0)*bKick,py=(bvp.y-Math.floor(size/2))*TILE+(e.attackDy||0)*bKick,w=size*TILE,h=size*TILE;
    let c=cBase;if(e.kind==='direwolf')c='#8e887c';if(e.kind==='bossgoblin')c='#873d35';if(e.kind==='mire')c='#557748';if(e.kind==='bossknight')c='#707c8c';if(e.kind==='bossdrake')c='#91becd';if(e.kind==='riftboss')c='#926bc0';if(e.kind==='worldeater')c='#b34742';
    ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(px+w/2,py+h*.82,w*.43,h*.14,0,0,Math.PI*2);ctx.fill();

    if(drawBossSprite(e,px,py,w,h)){
      ctx.fillStyle='rgba(255,120,78,.18)';ctx.beginPath();ctx.ellipse(px+w*.52,py+h*.80,w*.30,h*.09,0,0,Math.PI*2);ctx.fill();
    }else if(e.kind==='direwolf'){
      ctx.fillStyle=c;ctx.fillRect(px+w*.17,py+h*.38,w*.61,h*.34);ctx.fillRect(px+w*.62,py+h*.24,w*.28,h*.31);
      ctx.fillStyle='#69675f';ctx.beginPath();ctx.moveTo(px+w*.66,py+h*.27);ctx.lineTo(px+w*.70,py+h*.06);ctx.lineTo(px+w*.77,py+h*.29);ctx.fill();ctx.beginPath();ctx.moveTo(px+w*.78,py+h*.27);ctx.lineTo(px+w*.87,py+h*.07);ctx.lineTo(px+w*.88,py+h*.34);ctx.fill();
      ctx.fillStyle='#e5c451';ctx.fillRect(px+w*.77,py+h*.36,5,5);ctx.fillStyle=c;ctx.fillRect(px+w*.23,py+h*.66,w*.10,h*.24);ctx.fillRect(px+w*.60,py+h*.66,w*.10,h*.24);
      ctx.strokeStyle=c;ctx.lineWidth=Math.max(7,size*3);ctx.beginPath();ctx.moveTo(px+w*.18,py+h*.48);ctx.quadraticCurveTo(px-w*.02,py+h*.25,px+w*.10,py+h*.18);ctx.stroke();ctx.lineWidth=1
    }else if(e.kind==='bossdrake'||e.kind==='worldeater'){
      ctx.fillStyle=c;ctx.fillRect(px+w*.32,py+h*.27,w*.38,h*.53);ctx.fillRect(px+w*.55,py+h*.13,w*.24,h*.25);
      ctx.beginPath();ctx.moveTo(px+w*.34,py+h*.36);ctx.lineTo(px+w*.02,py+h*.10);ctx.lineTo(px+w*.19,py+h*.59);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(px+w*.67,py+h*.36);ctx.lineTo(px+w*.98,py+h*.08);ctx.lineTo(px+w*.82,py+h*.61);ctx.closePath();ctx.fill();
      ctx.fillStyle=e.kind==='worldeater'?'#ff765c':'#d4ecf1';ctx.fillRect(px+w*.65,py+h*.21,6,6);
      ctx.strokeStyle=e.kind==='worldeater'?'#dd6552':'#c0dce8';ctx.lineWidth=4;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(px+w*(.42+i*.09),py+h*.27);ctx.lineTo(px+w*(.40+i*.10),py+h*.05);ctx.stroke()}ctx.lineWidth=1
    }else if(e.kind==='bossknight'){
      ctx.fillStyle=c;ctx.fillRect(px+w*.31,py+h*.25,w*.39,h*.55);ctx.fillRect(px+w*.36,py+h*.10,w*.29,h*.24);ctx.fillStyle='#9f5d49';ctx.fillRect(px+w*.24,py+h*.09,w*.52,8);ctx.fillStyle='#323943';ctx.fillRect(px+w*.23,py+h*.44,w*.13,h*.33);ctx.strokeStyle='#d6c1a0';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(px+w*.71,py+h*.16);ctx.lineTo(px+w*.86,py+h*.82);ctx.stroke();ctx.lineWidth=1
    }else{
      ctx.fillStyle=c;ctx.fillRect(px+w*.26,py+h*.27,w*.49,h*.51);ctx.fillRect(px+w*.35,py+h*.09,w*.30,h*.25);ctx.fillStyle='#17191e';ctx.fillRect(px+w*.43,py+h*.18,6,6);ctx.fillRect(px+w*.57,py+h*.18,6,6);if(e.kind==='bossgoblin'){ctx.fillStyle='#d1a742';ctx.fillRect(px+w*.31,py+h*.05,w*.40,8)}if(e.kind==='riftboss'){ctx.strokeStyle='#c89cf2';ctx.lineWidth=4;ctx.beginPath();ctx.arc(px+w*.50,py+h*.34,w*.29,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1}
    }

    if((e.bossPhase||1)>=2){ctx.strokeStyle=e.bossPhase>=3?'rgba(255,64,70,.95)':'rgba(255,146,74,.85)';ctx.lineWidth=e.bossPhase>=3?5:3;ctx.strokeRect(px+3,py+3,w-6,h-6);ctx.lineWidth=1}
    if(e.id===selectedTargetId){ctx.strokeStyle='#79e4ef';ctx.lineWidth=3;ctx.strokeRect(px-3,py-3,w+6,h+6);ctx.lineWidth=1}
    if(e.intent==='devastate'){ctx.fillStyle='#ffb76d';ctx.font=`bold ${20+size*3}px monospace`;ctx.fillText('!',px+w*.48,py+h*.14)}
    drawBossDetailOverlay(e,px,py,w,h);
    return
  }
  const x=e.x*TILE,y=e.y*TILE;let c=cBase;ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x+6,y+25,20,4);
  if(e.kind.includes('wolf')){ctx.fillStyle=c;ctx.fillRect(x+6,y+14,20,10);ctx.fillRect(x+20,y+9,8,9);ctx.fillStyle='#e1c35a';ctx.fillRect(x+24,y+12,2,2)}
  else{ctx.fillStyle=c;ctx.fillRect(x+8,y+13,16,14);ctx.fillRect(x+11,y+6,10,9);ctx.fillStyle='#151820';ctx.fillRect(x+13,y+9,2,2);ctx.fillRect(x+18,y+9,2,2)}
  if(e.elite){ctx.strokeStyle=e.golden?'#ffd85b':e.nemesis?'#ef5656':'#b87ef0';ctx.lineWidth=2;ctx.strokeRect(x+3,y+3,26,27);ctx.lineWidth=1}
  if(e.id===selectedTargetId){ctx.strokeStyle='#7fe3ef';ctx.lineWidth=2;ctx.strokeRect(x+1,y+1,30,30);ctx.lineWidth=1}
  ctx.fillStyle='#171b22';ctx.fillRect(x+4,y+1,24,3);ctx.fillStyle='#d85d68';ctx.fillRect(x+4,y+1,24*clamp(e.hp/e.maxHp,0,1),3)
}

function renderProfile(){
  if(!profile)return;ensureProfileShape(profile);const c=CLASSES[profile.classId],m=masteryLevel(profile.classMastery[profile.classId]||0),sx=profile.skillXp[profile.classId]||{s1:0,s2:0},rank=hunterRank(profile);
  $('profileName').textContent=`${profile.name}, ${profile.selectedTitle||'Hunter'}`;$('profileSub').innerHTML=`${c.name}${profile.selectedSpec?` / ${SPECIALIZATIONS[profile.classId].find(x=>x[0]===profile.selectedSpec)?.[1]||''}`:''} • Level ${profile.level} • <span class="gear-rating">Gear Rating ${gearRating(profile)}</span> • Ascension ${profile.ascension} • Class Mastery ${m} • ${profile.gold} gold`;
  $('profileSummary').innerHTML=`<div class="summarybox">GEAR RATING<b>${gearRating(profile)}</b></div><div class="summarybox">RUNS<b>${profile.lifetime.runs}</b></div><div class="summarybox">CLEARS<b>${profile.lifetime.success}</b></div><div class="summarybox">WIPES<b>${profile.lifetime.wipes}</b></div><div class="summarybox">KILLS<b>${profile.lifetime.kills}</b></div><div class="summarybox">BOSSES<b>${profile.lifetime.bosses}</b></div><div class="summarybox">WAGER W/L<b>${profile.wagerStats.wins}/${profile.wagerStats.losses}</b></div><div class="summarybox">STREAK<b>${profile.lifetime.huntStreak}</b></div><div class="summarybox">NEMESIS KILLS<b>${profile.lifetime.nemesisKills}</b></div>`;
  $('rankPlate').innerHTML=`HUNTER RANK ${rank[1]}<b>${rank[0]}</b><div class="tiny">Hunter Score ${hunterScore(profile)} • Gear Rating ${gearRating(profile)} • ${profile.materials.common} common mats • ${profile.materials.rare} rare mats • ${profile.relicsFound.length} relic discoveries</div>`;
  const gg=$('profileGear');gg.innerHTML='';['weapon','armor','charm'].forEach(slot=>{const i=profile.equipment[slot],d=document.createElement('div');d.className='gearrow';d.innerHTML=`<span class="tiny">${slot}</span><span class="${i?`rarity-${i.rarity}`:'tiny'}">${i?i.name:'— empty —'}${i?`<div class="tiny">iLvl ${i.ilvl} • ${itemStats(i)}</div>`:''}</span><span>${i?`+${i.enhance||0}`:''}</span>`;gg.appendChild(d)});
  $('masteryPanel').innerHTML=`<div class="small">${c.res}: ${c.maxRes}</div><div class="small">Mastery XP: ${profile.classMastery[profile.classId]||0}</div><div class="small">${c.s1.name}: Skill Lv ${skillLevel(sx.s1)}</div><div class="small">${c.s2.name}: Skill Lv ${skillLevel(sx.s2)}</div><div class="small gold" style="margin-top:5px">Talent points available: ${availableTalentPoints(profile)}</div>`;
  const cl=$('contractList');cl.innerHTML='';CONTRACTS.forEach(cn=>{const metric=contractMetric(profile,cn),target=contractTarget(profile,cn),done=metric>=target,d=document.createElement('div');d.className='contractrow';d.innerHTML=`<div class="contracthead"><b>${cn.name}</b><span>${Math.min(metric,target)}/${target}</span></div><div class="tiny">${cn.desc}</div><div class="contractbar"><i style="width:${Math.min(100,metric/target*100)}%"></i></div><div class="row"><span class="tiny">${cn.rewardGold}g${cn.rewardCommon?` • ${cn.rewardCommon} common`:''}${cn.rewardRare?` • ${cn.rewardRare} rare`:''}</span><span class="spacer"></span><button ${done?'':'disabled'}>${done?'Claim':'In progress'}</button></div>`;d.querySelector('button').onclick=()=>claimContract(cn.id);cl.appendChild(d)});
  const fg=$('forgePanel');fg.innerHTML='';['weapon','armor','charm'].forEach(slot=>{const i=profile.equipment[slot],d=document.createElement('div');d.className='forgecard';d.innerHTML=i?`<b class="rarity-${i.rarity}">${i.name}</b><div class="tiny">+${i.enhance||0}/5 • ${itemStats(i)}</div>${i.trait?`<div class="trait-pill">✦ ${V10_ITEM_TRAITS[i.trait]?.name||i.trait}</div>`:''}<div class="forge-actions"><button class="enh effect-hover-v132" data-effect-kind="forge" data-effect-id="enhance" ${(i.enhance||0)>=5?'disabled':''}>${(i.enhance||0)>=5?'MASTERWORK':'Enhance'}</button><button class="ref effect-hover-v132" data-effect-kind="forge" data-effect-id="refine">Refine</button><button class="awk effect-hover-v132" data-effect-kind="forge" data-effect-id="awaken" ${i.trait?'disabled':''}>${i.trait?'Awakened':'Awaken'}</button></div>`:`<b>${slot}</b><div class="tiny">Nothing equipped.</div><button disabled>Enhance</button>`;if(i){d.querySelector('.enh').onclick=()=>enhanceGear(slot);d.querySelector('.ref').onclick=()=>refineGearV10(slot);d.querySelector('.awk').onclick=()=>awakenGearV10(slot)}fg.appendChild(d)});
  ['weapon','armor','charm'].forEach(type=>{const d=document.createElement('div');d.className='forgecard';d.innerHTML=`<b>Craft ${type}</b><div class="tiny">Targeted Rare+ piece near your level.<br>120+g • 18 common • 2 rare</div><button>Craft</button>`;d.querySelector('button').onclick=()=>craftGear(type);fg.appendChild(d)});fg.insertAdjacentHTML('beforeend',`<div class="huntforge-intro-v131"><b>HUNTFORGED PROGRESSION</b><div>Most strong progression gear is deliberately craftable from hunt materials. Boss kills unlock recipes; repeated hunts complete the set.</div><div class="tiny" style="margin-top:4px">DROP-ONLY CHASE: Mythics, Relics, Caravan uniques, Golden Quarry named pieces, and exceptional perfect-roll gear.</div>${trackedRecipeHTMLV131(profile)}</div>${huntforgeRecipeCardsV131(profile)}`);
  const tg=$('talentGrid');tg.innerHTML='';TALENTS[profile.classId].forEach(t=>{const owned=profile.talents.includes(t.id),d=document.createElement('div');d.className='talent'+(owned?' owned':'');d.innerHTML=`<b>${t.name}</b><div>${t.desc}</div><div class="tiny" style="margin-top:4px">${owned?'OWNED':'Costs 1 talent point'}</div>`;d.onclick=()=>buyTalent(t.id);tg.appendChild(d)});

  updateTitles(profile);const spec=profile.selectedSpec&&SPECIALIZATIONS[profile.classId].find(x=>x[0]===profile.selectedSpec),nem=topNemesis(profile),daily=dailyHunt();
  $('legacyPanel').innerHTML=`<div class="legacycard"><b>Ascension ${profile.ascension}</b><div>Ash Marks: ${profile.ashMarks}</div><div class="tiny">Level 30 can Ascend while keeping gear/mastery.</div><button ${profile.level>=30?'':'disabled'} onclick="ascendHunter()">Ascend</button></div>
  <div class="legacycard"><b>Hunt Streak ${profile.lifetime.huntStreak}</b><div>Best: ${profile.lifetime.bestStreak} • Flawless: ${profile.lifetime.flawless}</div><div class="tiny">Current title: ${profile.selectedTitle}</div><select id="titleSelect" onchange="setHunterTitle(this.value)">${profile.titles.map(t=>`<option ${t===profile.selectedTitle?'selected':''}>${t}</option>`).join('')}</select></div>
  <div class="legacycard"><b>Specialization</b><div>${spec?spec[1]:'Unchosen'}</div><div class="tiny">${spec?spec[2]:'Choose a playstyle below.'}</div><div class="partstock">${SPECIALIZATIONS[profile.classId].map(s=>`<button class="partbtn ${profile.selectedSpec===s[0]?'selected':''}" onclick="chooseSpec('${s[0]}')">${s[1]}</button>`).join('')}</div></div>
  <div class="legacycard"><b>Nemesis</b><div>${nem?`${nem.name} — Rank ${nem.rank}`:'No active Nemesis'}</div><div class="tiny">${profile.lifetime.nemesisKills} Nemesis kills • ${profile.deathCache?'Fallen cache waiting in your next hunt':'No lost cache'}</div></div>
  <div class="legacycard"><b>Collections</b><div>${profile.relicsFound.length} Relics • ${profile.mythicsFound.length} Mythics</div><div>${profile.trophies.length} boss trophies</div><div class="tiny">Bad-luck protection: Relic ${profile.dropPity.relic} • Mythic ${profile.dropPity.mythic}</div></div>
  <div class="legacycard"><b>Daily Hunt</b><div>${MISSIONS[daily.missionId].name}</div><div class="tiny">+25% reward value today. No login streak required.</div></div>`;
  $('legacyPanel').insertAdjacentHTML('beforeend',campProgressionHTMLV10(profile)+livingHuntQuestHTMLV10(profile));
  const mb=$('masteryBestiary');mb.innerHTML=`<div class="sectiontitle">Monster Codex — Field Research</div><div class="tiny">1 kill reveals lore • 3 attacks • 5 anatomy • 10 primary material. Mastery still grants permanent species damage.</div>${livingCodexHTMLV10(profile)}`;
  const partEntries=Object.entries(profile.monsterParts).filter(([,v])=>v>0);if(partEntries.length)mb.insertAdjacentHTML('beforeend',`<div class="partstock">${partEntries.map(([k,v])=>`<span class="partchip">${namedPartName(k)} ×${v}</span>`).join('')}</div>`);
  $('loadoutPanel').innerHTML=[1,2,3].map(n=>`<div class="legacycard"><b>${profile.loadoutNamesV131?.[n]||`Loadout ${n}`}</b><div class="tiny">${profile.loadouts[n]?"Gear + specialization + skill tree preset. Tree changes pay normal retraining cost.":'Empty'}</div><button onclick="saveLoadout(${n})">Save</button> <button ${profile.loadouts[n]?'':'disabled'} onclick="loadLoadout(${n})">Load</button> <button onclick="renameLoadoutV131(${n})">Rename</button></div>`).join('')+`<div class="legacycard"><b>Field Comfort</b><div class="tiny">Automatically pack one extra potion into every expedition. This does not consume persistent materials.</div><div class="comfort-toggle-v131"><button onclick="toggleAutoPotionV131()">${profile.autoPotionV131?'Disable':'Enable'} Auto Field Kit</button><span class="tiny">${profile.autoPotionV131?'ON • +1 potion':'OFF'}</span></div></div><div class="legacycard"><b>Share Build</b><div class="tiny">Copies class, specialization, talents and item names — never duplicates gear.</div><button onclick="copyBuildCode()">Copy Build Code</button></div>`;
  const leaders=Object.values(loadProfiles()).map(p=>{ensureProfileShape(p);return p}).sort((a,b)=>seasonScore(b)-seasonScore(a)).slice(0,8);$('leaderboardPanel').innerHTML=`<b>Season of the Black Bell — Local Ladder</b><div class="tiny">Prototype ladder across hunters saved in this browser.</div>${leaders.map((p,i)=>`<div class="leaderrow"><span>${i+1}. ${p.name} — ${CLASSES[p.classId].name}</span><b>${Math.round(seasonScore(p))}</b></div>`).join('')}`;

  const inv=$('profileInventory');renderInventoryV131(inv);wireInventoryToolsV131();
}
const renderProfileBaseV11=renderProfile;renderProfile=function(){renderProfileBaseV11();renderAscentProfileV11()};

let activeProfileTabV132='overview';
function switchProfileTabV132(id){
  activeProfileTabV132=id||'overview';
  document.querySelectorAll('#profileTabsV132 [data-profile-tab]').forEach(b=>b.classList.toggle('active',b.dataset.profileTab===activeProfileTabV132));
  document.querySelectorAll('#profileOverlay [data-profile-panel]').forEach(p=>p.classList.toggle('active',p.dataset.profilePanel===activeProfileTabV132));
  if(activeProfileTabV132==='equipment'){renderArmoryV132();drawPaperDollV132(performance.now())}
}
function wireProfileTabsV132(){
  document.querySelectorAll('#profileTabsV132 [data-profile-tab]').forEach(b=>{if(b._v132)return;b._v132=true;b.onclick=()=>switchProfileTabV132(b.dataset.profileTab)});
  switchProfileTabV132(activeProfileTabV132)
}
function armorySlotHTMLV132(slot){
  const i=profile?.equipment?.[slot],label=ARMORY_SLOT_LABEL_V132[slot],glyph=ARMORY_SLOT_GLYPH_V132[slot];
  return `<div class="armory-slot-v132 ${i?'':'empty'}" data-armory-slot="${slot}"><div class="slot-glyph">${glyph}</div><div><span class="slot-label">${label}</span><span class="slot-name ${i?`rarity-${i.rarity}`:''}">${i?i.name:'Empty'}</span><div class="slot-mini">${i?`iLvl ${i.ilvl} • GR ${itemProgressionRating(i)}${i.enhance?` • +${i.enhance}`:''}`:'Click to browse compatible gear'}</div>${i?itemEffectTagsHTMLV132(i):''}</div></div>`
}
function renderArmoryV132(){
  if(!profile)return;ensureArmoryShapeV132(profile);
  const l=$('armoryLeftV132'),r=$('armoryRightV132');if(!l||!r)return;
  l.innerHTML=ARMORY_LEFT_V132.map(armorySlotHTMLV132).join('');r.innerHTML=ARMORY_RIGHT_V132.map(armorySlotHTMLV132).join('');
  [...document.querySelectorAll('[data-armory-slot]')].forEach(el=>{el.onclick=e=>{if(e.target.closest('.effect-hover-v132'))return;const fam=slotFamilyV132(el.dataset.armorySlot);inventoryFilterV131.type=fam;const sel=$('inventoryTypeV131');if(sel)sel.value=fam;renderInventoryV131($('profileInventory'));$('profileInventory')?.scrollIntoView({block:'nearest',behavior:'smooth'})}});
  const cap=$('paperDollCaptionV132');if(cap)cap.innerHTML=`${CLASSES[profile.classId].name} • ${armoryOccupiedItemsV132(profile).length}/10 slots equipped • <span class="gear-rating">GR ${gearRating(profile)}</span>`;
  if($('profileQuickGRV132'))$('profileQuickGRV132').textContent=`GEAR ${gearRating(profile)}`;
}
function drawPaperDollV132(now=performance.now()){
  const c=$('paperDollV132');if(!c||!profile||activeProfileTabV132!=='equipment'||!$('profileOverlay')?.classList.contains('show'))return;
  const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.imageSmoothingEnabled=false;
  const g=x.createRadialGradient(c.width/2,c.height*.56,10,c.width/2,c.height*.58,125);g.addColorStop(0,'rgba(91,112,143,.18)');g.addColorStop(1,'rgba(10,14,20,0)');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);
  x.strokeStyle='rgba(222,185,101,.16)';x.lineWidth=2;x.beginPath();x.ellipse(c.width/2,c.height*.77,82,18,0,0,Math.PI*2);x.stroke();
  const imgs=V7_CLASS_IMAGES[profile.classId],im=imgs?.idle;
  if(im&&im.complete&&im.naturalWidth){
    const cols=Math.max(1,Math.floor(im.naturalWidth/48)),rows=Math.max(1,Math.floor(im.naturalHeight/48)),frame=Math.floor(now/430)%Math.min(cols,6),row=0;
    const scale=4,sw=48,sh=48,dw=sw*scale,dh=sh*scale,dx=Math.round((c.width-dw)/2),dy=Math.round(c.height*.52-dh*.5+(Math.floor(now/520)%4===1?-3:0));
    x.drawImage(im,frame*48,Math.min(row,rows-1)*48,48,48,dx,dy,dw,dh)
  }else{
    x.fillStyle=CLASSES[profile.classId]?.color||'#8294aa';x.fillRect(c.width/2-30,c.height/2-55,60,110);x.fillStyle='#d8b594';x.fillRect(c.width/2-20,c.height/2-85,40,35)
  }
  x.font='bold 14px monospace';x.textAlign='center';x.fillStyle='#efe2ba';x.fillText(profile.name,c.width/2,c.height-24);x.font='10px monospace';x.fillStyle='#8fa1b8';x.fillText(`${profile.selectedTitle||'Hunter'} • Lv ${profile.level}`,c.width/2,c.height-9)
}
function renderForgeV132(){
  const fg=$('forgePanel');if(!fg||!profile)return;ensureArmoryShapeV132(profile);fg.innerHTML='';
  ARMORY_SLOT_ORDER_V132.forEach(slot=>{const i=profile.equipment[slot];if(!i)return;const d=document.createElement('div');d.className='forgecard';d.innerHTML=`<div class="slot-kicker-v132">${ARMORY_SLOT_LABEL_V132[slot]}</div><b class="rarity-${i.rarity}">${i.name}</b><div class="tiny">+${i.enhance||0}/5 • ${itemStats(i)}</div>${itemEffectTagsHTMLV132(i)}<div class="forge-actions"><button class="enh effect-hover-v132" data-effect-kind="forge" data-effect-id="enhance" ${(i.enhance||0)>=5?'disabled':''}>${(i.enhance||0)>=5?'MASTERWORK':'Enhance'}</button><button class="ref effect-hover-v132" data-effect-kind="forge" data-effect-id="refine">Refine</button><button class="awk effect-hover-v132" data-effect-kind="forge" data-effect-id="awaken" ${i.trait?'disabled':''}>${i.trait?'Awakened':'Awaken'}</button>${identityButtonHTMLV14(i)}</div>`;d.querySelector('.enh').onclick=()=>enhanceGear(slot);d.querySelector('.ref').onclick=()=>refineGearV10(slot);d.querySelector('.awk').onclick=()=>awakenGearV10(slot);fg.appendChild(d)});
  const generic=document.createElement('div');generic.className='forgecard generic-craft-v132';generic.innerHTML=`<div><div class="slot-kicker-v132">Targeted Huntsmith Craft</div><b>Craft a dependable equipment piece</b><div class="tiny">Creates an Uncommon/Rare slot-filler. Huntforged boss recipes are the intended path to Epic/Legendary progression.</div></div><select id="genericCraftSlotV132">${['head','shoulders','chest','gloves','boots','weapon','offhand','ring','necklace'].map(s=>`<option value="${s}">${s==='ring'?'Ring':ARMORY_SLOT_LABEL_V132[s]||s}</option>`).join('')}</select><button id="genericCraftBtnV132">Craft</button>`;generic.querySelector('button').onclick=()=>craftGear(generic.querySelector('select').value);fg.appendChild(generic);
  fg.insertAdjacentHTML('beforeend',`<div class="huntforge-intro-v131"><b>HUNTFORGED PROGRESSION — 8/10 SLOTS CRAFTABLE</b><div>Targeted boss crafting now covers Weapon, Chest, Head, Gloves, Boots, Offhand, Rings and Necklace. Shoulders remain a stronger drop/challenge chase slot.</div><div class="tiny" style="margin-top:4px">DROP-ONLY CHASE: Mythics, Relics, named uniques, Golden Quarry pieces, perfect-roll gear and special shoulders.</div>${trackedRecipeHTMLV131(profile)}</div>${huntforgeRecipeCardsV131(profile)}`)
}
function renderAttributesV132(){
  if(!profile)return;const p=trainingPlayer(),pow=profilePower(profile),asc=ascentEffectsV11(profile),bossPct=Math.round(((hasGearTraitV10(p,'boss_slayer')?1.18:1)*(1+(asc.bossDamage||0))-1)*100),partPct=Math.round((gearTraitPartMultV10(p)*(1+(asc.partDamage||0))-1)*100),cards=[
    ['Attack',p.atk,'Class + gear + enhancement'],['Defense',p.def,'Reduces incoming physical pressure'],['Maximum HP',p.maxHp,'Base vitality + equipment'],[CLASSES[p.classId].res,p.maxRes,'Maximum class resource'],['Critical',`${Math.round(critChance(p)*100)}%`,'Critical-hit chance'],['Dodge',`${Math.round(dodgeChance(p)*100)}%`,'Avoid incoming attacks'],['Lifesteal',`${Math.round(((pow.leech||0)+runLeechBonus(p))*100)}%`,'Healing from damage dealt'],['Basic Range',`${effectiveRange(p)} tiles`,'Normal attack reach'],['Boss Damage',`+${bossPct}%`,'Bonuses applied against bosses'],['Anatomy Damage',`+${partPct}%`,'Bonus damage to breakable body parts'],['Healing',`${Math.round(specHeal(p)*100)}%`,'Healing multiplier'],['Gear Rating',gearRating(profile),`${armoryOccupiedItemsV132(profile).length}/10 slots equipped`]
  ];const host=$('attributesPanelV132');if(host)host.innerHTML=cards.map(c=>`<div class="attr-card-v132 effect-hover-v132" data-effect-kind="stat" data-effect-name="${String(c[0]).replaceAll('"','&quot;')}" data-effect-desc="${String(c[2]).replaceAll('"','&quot;')}"><span>${c[0]}</span><b>${c[1]}</b><small>${c[2]}</small></div>`).join('');
  const eff=$('effectsPanelV132');if(eff){const traits=[...new Set(equippedGearTraitsV10(profile))];eff.innerHTML=traits.length?traits.map(id=>{const t=V10_ITEM_TRAITS[id];return `<div class="legacycard effect-hover-v132" data-effect-kind="trait" data-effect-id="${id}"><b>✦ ${t?.name||id}</b><div>${t?.desc||''}</div></div>`}).join(''):'<div class="tiny">Equip Rare+ gear with Hunt Traits to build derived effects.</div>'}
}
function renderQuestExtrasV132(){const q=$('questSpecialV132');if(q&&profile)q.innerHTML=`${trackedRecipeHTMLV131(profile)}${livingHuntQuestHTMLV10(profile)}`}
function renderProfileExtrasV132(){if(!profile)return;renderArmoryV132();renderForgeV132();renderAttributesV132();renderQuestExtrasV132();wireProfileTabsV132();wireInventoryToolsV131();wireEffectTooltipsV132()}
function effectTooltipHTMLV132(el){
  const kind=el.dataset.effectKind;if(kind==='trait'){const t=V10_ITEM_TRAITS[el.dataset.effectId];if(!t)return'';return `<div class="tt-head"><div class="tt-name">${t.name}</div><div class="tt-cost">HUNT TRAIT</div></div><div class="tt-desc">${t.desc}</div><div class="tt-effect"><b>What it does:</b> ${t.desc}<br><span class="tiny">This effect is active while the item is equipped. Hunt Traits stack only where the underlying mechanic allows it.</span></div>`}
  if(kind==='relic')return `<div class="tt-head"><div class="tt-name">${el.dataset.effectName||'Relic Power'}</div><div class="tt-cost">UNIQUE EFFECT</div></div><div class="tt-effect">${el.dataset.effectDesc||'Unique item effect.'}</div>`;
  if(kind==='set'){const s=MONSTER_SETS[el.dataset.effectId];return s?`<div class="tt-head"><div class="tt-name">${s.name}</div><div class="tt-cost">HUNTSET</div></div><div class="tt-effect"><b>2 pieces:</b> ${s.bonus2}<br><b>3 pieces:</b> ${s.bonus3}</div>`:''}
  if(kind==='stat')return `<div class="tt-head"><div class="tt-name">${el.dataset.effectName||'Attribute'}</div><div class="tt-cost">ATTRIBUTE</div></div><div class="tt-effect">${el.dataset.effectDesc||'Derived from your hunter build.'}<br><span class="tiny">Equipment, class progression, talents, traits and Huntset bonuses can contribute to this value.</span></div>`;
  if(kind==='forge'){const id=el.dataset.effectId;if(id==='enhance')return `<div class="tt-head"><div class="tt-name">Enhance</div><div class="tt-cost">+1 POWER</div></div><div class="tt-desc">Permanently improve the equipped item's base stats. Enhancement runs from +0 to +5.</div><div class="tt-effect"><b>Result:</b> ATK / DEF / HP increase based on iLvl. Higher enhancement ranks cost more materials. +5 becomes Masterwork.<br><span class="tiny">Enhancing never rerolls or removes the item's affix, Hunt Trait, rarity, or set.</span></div>`;if(id==='refine')return `<div class="tt-head"><div class="tt-name">Refine</div><div class="tt-cost">REROLL AFFIX</div></div><div class="tt-desc">Replace the item's normal affix with a different random affix.</div><div class="tt-effect"><b>Changes:</b> bonuses such as Crit, Dodge, ATK, DEF, HP or Leech.<br><b>Does not change:</b> rarity, Hunt Trait, Huntset, enhancement, or base item identity.<br><span class="tiny">The previous affix is lost when the refine is confirmed.</span></div>`;if(id==='awaken')return `<div class="tt-head"><div class="tt-name">Awaken</div><div class="tt-cost">ADD HUNT TRAIT</div></div><div class="tt-desc">Spend rare materials to permanently add a build-changing Hunt Trait to eligible Rare+ equipment.</div><div class="tt-effect"><b>Requirement:</b> Rare, Epic, Legendary, Relic or Mythic gear without an existing Hunt Trait.<br><span class="tiny">Examples include Deep Reservoir, boss damage, anatomy bonuses and class-specific effects. The resulting trait is permanent.</span></div>`}return''
}
function placeEffectTooltipV132(el){
  const tt=$('skillTooltip');if(!tt)return;const r=el.getBoundingClientRect(),w=330,left=Math.min(innerWidth-w-10,Math.max(10,r.left+r.width/2-w/2)),top=(r.bottom+10+180<innerHeight)?r.bottom+8:Math.max(10,r.top-190);tt.style.left=`${left}px`;tt.style.top=`${top}px`
}
function wireEffectTooltipsV132(){
  if(document._effectTipV132)return;document._effectTipV132=true;
  document.addEventListener('mouseover',e=>{const el=e.target.closest?.('.effect-hover-v132');if(!el||el.contains(e.relatedTarget))return;const tt=$('skillTooltip'),body=effectTooltipHTMLV132(el);if(!tt||!body)return;tt.innerHTML=body;tt.classList.add('show','effect-v132');placeEffectTooltipV132(el)});
  document.addEventListener('mouseout',e=>{const el=e.target.closest?.('.effect-hover-v132');if(!el||el.contains(e.relatedTarget))return;const tt=$('skillTooltip');tt?.classList.remove('show','effect-v132')})
}
const HUD_RIGHT_GROUP_V141=new Set(['party','meters','loot','log']);
function setHudPanelV141(id,force){
  const panel=document.querySelector(`[data-hud-panel="${id}"]`),button=document.querySelector(`[data-hud-toggle="${id}"]`);if(!panel)return;const next=force==null?!panel.classList.contains('is-open'):!!force;
  if(next&&HUD_RIGHT_GROUP_V141.has(id))HUD_RIGHT_GROUP_V141.forEach(other=>{if(other===id)return;document.querySelector(`[data-hud-panel="${other}"]`)?.classList.remove('is-open');document.querySelector(`[data-hud-toggle="${other}"]`)?.setAttribute('aria-pressed','false')});
  panel.classList.toggle('is-open',next);button?.setAttribute('aria-pressed',String(next))
}
function updateHudModeV141(r){const activeHunter=!!profile&&!!r?.players?.[peerId];document.body.classList.toggle('has-profile-v141',activeHunter);document.body.classList.toggle('mode-run-v141',!!r?.run);document.body.classList.toggle('mode-world-v141',!!r?.worldV14&&!r?.run);document.body.classList.toggle('mode-camp-v141',activeHunter&&!r?.run&&!r?.worldV14)}
function initHudV141(){document.querySelectorAll('[data-hud-toggle]').forEach(button=>button.addEventListener('click',()=>setHudPanelV141(button.dataset.hudToggle)));setHudPanelV141('party',true);setHudPanelV141('intel',true)}
function initInterfaceV132(){const dock=$('hudDockV132'),hud=$('combatHudV11');if(dock&&hud&&hud.parentElement!==dock)dock.appendChild(hud);wireProfileTabsV132();wireEffectTooltipsV132();initHudV141()}

const renderProfileBaseV132=renderProfile;renderProfile=function(){ensureProfileShape(profile);renderProfileBaseV132();renderProfileExtrasV132()};
function gearScore(i){if(!i)return 0;let n=(i.atk||0)*1.7+(i.def||0)*2+(i.hp||0)*.16+(i.rarity==='mythic'?40:i.rarity==='relic'?25:0);if(i.affixType==='crit'||i.affixType==='dodge'||i.affixType==='leech')n+=(i.affixValue||0)*100*1.3;else n+=(i.affixValue||0);return n}
function buyTalent(tid){
  if(profile.talents.includes(tid))return;if(availableTalentPoints(profile)<=0)return toast('Earn more class mastery for another talent point');
  profile.talents.push(tid);persistProfile();renderProfile();notifyV11('skill','CORE TALENT LEARNED',TALENTS[profile.classId].find(t=>t.id===tid)?.name||'New talent')
}
function equipRecovered(iid,preferredSlot=null){
  const idx=profile.inventory.findIndex(i=>i.id===iid);if(idx<0)return;const i=normalizeItemV132(profile.inventory[idx]),slot=resolveEquipSlotV132(i,profile,preferredSlot);if(!slot)return toast('This item has no compatible equipment slot');const old=profile.equipment[slot];profile.equipment[slot]=i;i.equipSlot=slot;profile.inventory.splice(idx,1);if(old){old.equipSlot=null;profile.inventory.push(old)}persistProfile();renderProfile();renderPlayer(room||snapshot);toast(`${i.name} equipped: ${ARMORY_SLOT_LABEL_V132[slot]}`)
}
function showSummary(s){
  const grand=s.bossTrophy==='The World Eater';$('summaryTitle').textContent=grand?'GRAND HUNT COMPLETE':s.success?'EXTRACTION SUCCESS':'PARTY WIPED';$('summaryOverlay').querySelector('.card')?.classList.toggle('grand-summary',grand);
  $('summaryClose').textContent='Return to Emberwatch Bonfire';$('summaryRepeatV131').textContent=s.isWorldSkirmish&&s.success?'Resume Emberwood':'Hunt Again';
  $('summaryText').innerHTML=`${grand?'THE WORLD EATER HAS FALLEN. Emberwatch will remember this hunt. +1 Ash Mark earned.':s.success?(s.outcome==='extract'&&!s.safeExtract?'Most carried supplies were secured, but the hurried field extraction abandoned 15% of loose currency and materials.':'Everything recovered. The hunt made you stronger.'):'XP, mastery, and skill proficiency were kept, but most physical rewards were lost.'}<br><span class="tiny">${s.mission} • ${DIFFICULTIES[s.difficulty||'normal'].name} • ${s.modifier} • ${Math.floor((s.elapsed||0)/60)}m ${(s.elapsed||0)%60}s</span>${s.routeNames?.length?`<div class="v13-route-summary"><b>EXPEDITION ROUTE</b><div class="route-line">${s.routeNames.join(' → ')}</div><div style="margin-top:5px">Hunt Heat +${Math.round(((s.huntHeat||1)-1)*100)}% • Spoor ${s.spoor||0}${s.safeExtract?' • Secured at a safe extraction site':''}</div></div>`:''}`;
  $('summaryStats').innerHTML=`<div class="summarybox">GRADE<b class="grade">${s.grade||'—'}</b></div><div class="summarybox">HUNT SCORE<b>${(s.score||0).toLocaleString()}</b></div><div class="summarybox">PARTY SCORE<b>${(s.partyScore||0).toLocaleString()}</b></div><div class="summarybox">XP KEPT<b>${s.xp}</b></div><div class="summarybox">MASTERY<b>${s.mastery}</b></div><div class="summarybox">GOLD<b>${s.gold}</b></div><div class="summarybox">MATERIALS<b>${s.common}/${s.rare}</b></div><div class="summarybox">PARTS BROKEN<b>${s.partsBroken||0}</b></div><div class="summarybox">KILLS / BOSSES<b>${s.kills||0}/${s.bosses||0}</b></div><div class="summarybox">MAX HEAT<b>+${Math.round(((s.huntHeat||1)-1)*100)}%</b></div>`;
  $('summaryMvp').innerHTML=(s.mvpAwards||[]).length?s.mvpAwards.map(a=>`<div class="mvp"><b>${a.title}</b><div>${a.name}</div><div class="tiny">${a.value}</div></div>`).join(''):'<div class="tiny">No MVP awards this run.</div>';const g=$('summaryGear');g.innerHTML='';if(!s.items.length)g.innerHTML='<div class="tiny">No equipment recovered.</div>';s.items.forEach(i=>{const owned=profile.inventory.find(x=>x.id===i.id);const d=document.createElement('div');d.className=`loot-reveal-card ${i.rarity}`;d.innerHTML=`<b class="rarity-${i.rarity}">${owned?.favoriteV131?'★ ':''}${owned?.lockedV131?'🔒 ':''}${i.name}</b><div class="tiny">iLvl ${i.ilvl} • ${itemStats(i)}</div>${itemEffectTagsHTMLV132(i)}${owned?`<div class="summary-actions-v131"><button onclick="summaryItemActionV131('${i.id}','equip')">Equip</button><button onclick="summaryItemActionV131('${i.id}','favorite')">${owned.favoriteV131?'★ Favorite':'☆ Favorite'}</button><button onclick="summaryItemActionV131('${i.id}','lock')">${owned.lockedV131?'Unlock':'Lock'}</button><button ${owned.lockedV131?'disabled':''} onclick="summaryItemActionV131('${i.id}','salvage')">Salvage</button></div>`:''}`;g.appendChild(d)});
  show('summaryOverlay')
}

function setHunterTitle(t){if(profile.titles.includes(t)){profile.selectedTitle=t;persistProfile();renderProfile()}}window.toggleAutoPotionV131=toggleAutoPotionV131;window.craftHuntRecipeV131=craftHuntRecipeV131;window.toggleTrackedRecipeV131=toggleTrackedRecipeV131;window.toggleFavoriteV131=toggleFavoriteV131;window.toggleLockV131=toggleLockV131;window.summaryItemActionV131=summaryItemActionV131;window.renameLoadoutV131=renameLoadoutV131;window.equipRecovered=equipRecovered;window.salvageItem=salvageItem;window.claimFrontierQuestV10=claimFrontierQuestV10;window.foundCompany=foundCompany;window.claimCompanyWeekly=claimCompanyWeekly;window.setHunterTitle=setHunterTitle;window.craftMonsterSet=craftMonsterSet;window.ascendHunter=ascendHunter;window.chooseSpec=chooseSpec;window.saveLoadout=saveLoadout;window.loadLoadout=loadLoadout;window.copyBuildCode=copyBuildCode;function show(id){const e=$(id);if(!e)return;e.classList.add('show');e.setAttribute('aria-hidden','false')}function hide(id){const e=$(id);if(!e)return;e.classList.remove('show');e.setAttribute('aria-hidden','true')}
function toast(t){const e=$('toast');e.textContent=t;e.classList.remove('show');void e.offsetWidth;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1900)}
function leaveRoom(silent=false){
  if(bc){send({type:'leave',peerId});bc.close()}bc=null;stopRemoteTransportV141();room=null;snapshot=null;v7ClassMotion.clear();clearHeldMovement();combatFloaters=[];combatFeed=[];worldFx=[];isHost=false;roomCode=null;$('roomChoice').style.display='block';$('roomPanel').style.display='none';$('roomBadge').textContent='No room';hide('lobbyOverlay');hide('campServiceOverlay');hide('trainingOverlay');hide('wagerOverlay');if(!silent)show('titleOverlay');updateSaveTransferUiV144();renderAll()
}
function prefillHashRoom(){
  const m=location.hash.match(/room=([A-Z0-9]+)/i);if(m){$('joinCode').value=m[1].toUpperCase();toast('Invite room code loaded')}
}
function copyInvite(){
  const url=location.href.split('#')[0]+`#room=${roomCode}`;navigator.clipboard?.writeText(url).then(()=>toast('Invite link copied')).catch(()=>toast(`Room code: ${roomCode}`))
}
function vote(v){if(!snapshot?.run&&!room?.run)return;if(isHost)hostVote(peerId,v);else send({type:'vote',peerId,vote:v})}

$('createCharacterBtn').onclick=createCharacter;$('createRoomBtn').onclick=createRoom;$('readyBtn').onclick=toggleReady;$('joinRoomBtn').onclick=joinRoom;$('copyInviteBtn').onclick=copyInvite;$('launchBtn').onclick=launchExpedition;
$('retrySettlementV145').onclick=commitPendingSettlementV145;
$('saveExportV144').onclick=exportHuntersV144;$('saveImportV144').onclick=()=>$('saveImportInputV144').click();$('saveRestoreV144').onclick=previewRecoveryV144;$('saveImportApplyV144').onclick=applyPendingSaveImportV144;$('saveImportCancelV144').onclick=()=>clearPendingSaveImportV144(true);$('saveImportInputV144').onchange=e=>handleSaveImportFileV144(e.target.files?.[0]);
$('profileBtn').onclick=()=>{if(profile){renderProfile();show('profileOverlay')}};$('cancelActionV131').onclick=cancelSubmittedActionV131;$('summaryRepeatV131').onclick=repeatHuntV131;$('summaryContinueV131').onclick=continueCampaignV131;document.querySelectorAll('#campQuickbarV131 [data-service]').forEach(b=>b.onclick=()=>fastCampServiceV131(b.dataset.service));$('profileClose').onclick=()=>hide('profileOverlay');$('summaryClose').onclick=returnToCampFromSummaryV142;
$('serviceClose').onclick=()=>hide('campServiceOverlay');$('trainingClose').onclick=()=>hide('trainingOverlay');$('dummyDef').onchange=renderTrainingStats;$('trainAttack').onclick=()=>trainTest('attack');$('trainSkill1').onclick=()=>trainTest('skill1');$('trainSkill2').onclick=()=>trainTest('skill2');
$('wagerClose').onclick=()=>hide('wagerOverlay');$('wagerDeal').onclick=dealCinder;$('bindOmen').onclick=()=>finishCinder('omen');$('drawBlind').onclick=()=>finishCinder('blind');$('holdTwo').onclick=()=>finishCinder('hold');
$('titleBtn').onclick=()=>leaveRoom(false);$('soundBtn').onclick=()=>{soundOn=!soundOn;$('soundBtn').textContent=`Sound: ${soundOn?'On':'Off'}`;if(soundOn)beep(440,.03,'sine')};
$('attackBtn').onclick=()=>submitAction({type:'attack',targetId:selectedTargetId,targetPartId:selectedPartId});$('skill1Btn').onclick=()=>submitAction({type:'skill1',targetId:selectedTargetId,targetPartId:selectedPartId});$('skill2Btn').onclick=()=>{const p=(room||snapshot)?.run?.players?.[peerId];if(p?.classId==='berserker')submitQuickActionV132('skill2');else submitAction({type:'skill2',targetId:selectedTargetId,targetPartId:selectedPartId})};$('guardBtn').onclick=()=>submitAction({type:'guard'});$('potionBtn').onclick=()=>submitAction({type:'potion'});$('reviveBtn').onclick=()=>submitAction({type:'revive'});
$('extractBtn').onclick=()=>vote('extract');$('descendBtn').onclick=()=>vote('descend');
$('meterDamageBtn').onclick=()=>{combatMeterMode='damage';renderCombatMeters(room||snapshot)};$('meterHealBtn').onclick=()=>{combatMeterMode='heal';renderCombatMeters(room||snapshot)};

function canvasTileFromPointerV141(e){const rect=canvas.getBoundingClientRect(),scale=Math.min(rect.width/canvas.width,rect.height/canvas.height),drawW=canvas.width*scale,drawH=canvas.height*scale,offsetX=(rect.width-drawW)/2,offsetY=(rect.height-drawH)/2,cx=e.clientX-rect.left-offsetX,cy=e.clientY-rect.top-offsetY;if(cx<0||cy<0||cx>=drawW||cy>=drawH)return null;return{x:Math.floor(cx/scale/TILE),y:Math.floor(cy/scale/TILE)}}
canvas.addEventListener('click',e=>{const r=room||snapshot,run=r?.run,tile=canvasTileFromPointerV141(e);if(!tile)return;const{x,y}=tile;if(!run){if(worldStateV14()){const o=WORLD_CONTRACTS.exactObjectAtTile(worldObjectsV141(),x,y);if(o){const p=campPlayer(),dist=p?Math.abs(o.x-(p.worldX??5))+Math.abs(o.y-(p.worldY??9)):99;if(dist<=1)interactWorldV14(o,{autoAttack:o.objType==='encounter'});else toast(`Walk closer to ${o.name}`)}return}const o=activeCampObjects().map(q=>({...q,clickDist:Math.abs(q.x-x)+Math.abs(q.y-y)})).filter(q=>q.clickDist<=1).sort((a,b)=>a.clickDist-b.clickDist)[0];if(o){const p=campPlayer(),dist=p?Math.abs(o.x-(p.campX??14))+Math.abs(o.y-(p.campY??15)):99;if(dist<=2)interactCampObject(o);else toast(`Walk closer to ${o.name}`)}return}const enemy=enemyAtTile(run,x,y);if(enemy){selectedTargetId=enemy.id;selectedPartId=enemy.parts?.find(p=>partTargetable(enemy,p))?.id||null;const me=run.players?.[peerId],dist=me?distanceToEnemy(me,enemy):0;toast(`Target locked: ${enemy.name} • ${dist} tiles${selectedPartId?` • aiming ${enemy.parts.find(p=>p.id===selectedPartId)?.name}`:''}`);renderAll()}});

const MOVE_KEYS={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};
let heldCampMoveKeys=[],activeCampMoveKey=null,lastCampMoveAt=0;
function movementOverlayOpen(){return $('titleOverlay').classList.contains('show')||$('profileOverlay').classList.contains('show')||$('summaryOverlay').classList.contains('show')||$('campServiceOverlay').classList.contains('show')||$('trainingOverlay').classList.contains('show')||$('wagerOverlay').classList.contains('show')||$('lobbyOverlay').classList.contains('show')}
function clearHeldMovement(){heldCampMoveKeys=[];activeCampMoveKey=null}
function processHeldCampMovement(ts){
  if(!profile||movementOverlayOpen()||(room||snapshot)?.run||!activeCampMoveKey)return;
  const d=MOVE_KEYS[activeCampMoveKey];if(!d)return;
  if(ts-lastCampMoveAt>=118){worldStateV14()?moveWorldV14(d[0],d[1]):moveCamp(d[0],d[1]);lastCampMoveAt=ts}
}
window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  if(e.key==='Escape'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)){const order=['wagerOverlay','trainingOverlay','campServiceOverlay','summaryOverlay','profileOverlay'];for(const id of order){if($(id)?.classList.contains('show')){hide(id);clearHeldMovement();renderAll();e.preventDefault();return}}}
  if(!profile||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
  if($('titleOverlay').classList.contains('show')||$('profileOverlay').classList.contains('show')||$('summaryOverlay').classList.contains('show')||$('campServiceOverlay').classList.contains('show')||$('trainingOverlay').classList.contains('show')||$('wagerOverlay').classList.contains('show'))return;
  if($('lobbyOverlay').classList.contains('show')){if(e.key==='Escape'){hide('lobbyOverlay');renderAll()}return}
  const run=(room||snapshot)?.run;
  if(run&&e.key==='Tab'){e.preventDefault();cycleTargetV131(e.shiftKey?-1:1);return}
  if(run&&key==='q'){e.preventDefault();cyclePartV131(1);return}
  if(!run){
    if(key==='e'){e.preventDefault();clearHeldMovement();return worldStateV14()?interactWorldV14():interactCampObject()}
    const d=MOVE_KEYS[key];if(d){e.preventDefault();if(!heldCampMoveKeys.includes(key))heldCampMoveKeys.push(key);activeCampMoveKey=key;if(!e.repeat){worldStateV14()?moveWorldV14(d[0],d[1]):moveCamp(d[0],d[1]);lastCampMoveAt=performance.now()}return}
    return
  }
  clearHeldMovement();
  if(e.repeat&&MOVE_KEYS[key]){e.preventDefault();return}
  if(e.key==='1')return submitAction({type:'attack',targetId:selectedTargetId,targetPartId:selectedPartId});
  if(e.key==='2')return submitAction({type:'skill1',targetId:selectedTargetId,targetPartId:selectedPartId});
  if(e.key==='3'){const p=run?.players?.[peerId];return p?.classId==='berserker'?submitQuickActionV132('skill2'):submitAction({type:'skill2',targetId:selectedTargetId,targetPartId:selectedPartId})}
  if(e.key==='4')return submitAction({type:'guard'});
  if(e.key==='5')return submitAction({type:'potion'});
  if(e.key==='6')return submitAction({type:'revive'});
  const d=MOVE_KEYS[key];if(d){e.preventDefault();submitAction({type:'move',dx:d[0],dy:d[1]})}
});
window.addEventListener('keyup',e=>{const key=e.key.toLowerCase();if(!MOVE_KEYS[key])return;heldCampMoveKeys=heldCampMoveKeys.filter(k=>k!==key);if(activeCampMoveKey===key)activeCampMoveKey=heldCampMoveKeys[heldCampMoveKeys.length-1]||null});
window.addEventListener('blur',clearHeldMovement);
window.addEventListener('beforeunload',()=>{try{if(bc)send({type:'leave',peerId})}catch(e){}});

let lastSpritePaint=0,lastMeterPaint=0;
function spriteAnimationLoop(ts){
  processHeldCampMovement(ts);
  if(ts-lastSpritePaint>=16){draw((room||snapshot)?.run);drawPaperDollV132(ts);lastSpritePaint=ts}
  if(ts-lastMeterPaint>=180){renderCombatMeters(room||snapshot);renderMinimap(room||snapshot);lastMeterPaint=ts}
  requestAnimationFrame(spriteAnimationLoop)
}
initInterfaceV132();wireSkillTooltips();renderSavedCharacters();renderClassGrid();mobileCharacterSelectInit();drawCamp();renderAll();requestAnimationFrame(spriteAnimationLoop);
})();
