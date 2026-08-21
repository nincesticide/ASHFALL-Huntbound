/* ===== v0.14.1 BATTLEFIELD HUD ===== */
let hudDrawerStateV141=null;
function hudPanelByChildV141(childId,name,drawerBody,map){
  const child=$(childId),panel=child?.closest?.('.panel');
  if(!panel)return;
  panel.classList.add('drawer-panel-v141');panel.dataset.hudPanel=name;drawerBody.appendChild(panel);map[name]=panel;
}
function toggleHudDrawerV141(name=null){
  const drawer=$('hudDrawerV141');if(!drawer)return;
  if(!name||hudDrawerStateV141===name){hudDrawerStateV141=null;drawer.classList.remove('show');document.querySelectorAll('.hud-tools-v141 [data-drawer]').forEach(b=>b.classList.remove('active'));return}
  hudDrawerStateV141=name;drawer.classList.add('show');$('hudDrawerTitleV141').textContent=({party:'PARTY',meters:'COMBAT METERS',loot:'RUN LOOT',log:'EXPEDITION LOG'})[name]||'FIELD INTEL';
  Object.entries(document._hudPanelsV141||{}).forEach(([key,p])=>p.classList.toggle('active',key===name));
  document.querySelectorAll('.hud-tools-v141 [data-drawer]').forEach(b=>b.classList.toggle('active',b.dataset.drawer===name));
}
function toggleHuntMapV141(force){
  const o=$('huntMapOverlayV141');if(!o)return;const next=force===undefined?!o.classList.contains('show'):!!force;o.classList.toggle('show',next);$('mapBtnV141')?.classList.toggle('active',next);
  if(next){const run=(room||snapshot)?.run,ph=$('huntMapPlaceholderV141'),ep=$('expeditionPanel');if(run?.deepHunt?.active){renderDeepHuntPanel(run);if(ph)ph.style.display='none';if(ep)ep.style.display='block'}else{if(ep)ep.style.display='none';if(ph){ph.style.display='grid';ph.innerHTML=worldStateV14()?'<div><b>EMBERWOOD LOWLANDS</b><br>The surface map is represented by the minimap.<br><span class="tiny">Deep Hunt routes appear here after launching an expedition.</span></div>':'<div><b>NO ACTIVE HUNT</b><br>Launch a Deep Hunt or Delve from the Hunt Board to view its route map.</div>'}}}
}
function renderBattleHudV141(r){
  if(!$('battleHudV141'))return;const run=r?.run,me=run?.players?.[peerId],target=run?.enemies?.find(e=>e.id===selectedTargetId&&e.hp>0)||null,root=$('battleHudV141'),dock=$('bottomDockV141');
  root.classList.toggle('in-combat',!!run);root.classList.toggle('no-run',!run);dock?.classList.toggle('no-run',!run);
  const tf=$('targetFrameV141');if(run&&target){tf.classList.add('show');tf.classList.toggle('boss',!!target.boss);$('targetKindV141').textContent=target.boss?'HUNT TARGET':target.elite?'ELITE':'TARGET';$('targetNameV141').textContent=target.name;$('targetMetaV141').textContent=`${Math.max(0,target.hp).toLocaleString()} / ${target.maxHp.toLocaleString()} HP`;$('targetHpFillV141').style.width=`${clamp(target.hp/target.maxHp*100,0,100)}%`;$('targetHpTextV141').textContent=`${Math.round(clamp(target.hp/target.maxHp*100,0,100))}%`;const part=target.parts?.find(p=>p.id===selectedPartId);$('targetIntentV141').textContent=target.intent?`⚠ ${(target.intentLabel||target.intent).replaceAll('_',' ').toUpperCase()}`:part?`AIMING: ${part.name}${part.broken?' — BROKEN':''}`:target.trait||(!target.boss&&(target.alerted||enemyForcedAggroV132(run,target)?'ALERTED':`DORMANT • AGGRO ${enemyAggroRangeV132(target)}`))||''}else{tf.classList.remove('show','boss','details')}
  const route=$('routeBarV141');route?.classList.toggle('show',!!run&&['path','choice'].includes(run.phase));
  const meta=$('huntMetaTextV141');if(meta){if(run){const heat=Math.round((huntHeatV10(run)-1)*100),spoor=run.deepHunt?.active?`${run.deepHunt.spoor}/${run.deepHunt.cfg.spoorRequired}`:'—';meta.innerHTML=`<div class="hunt-chip-v141">DEPTH<b>${run.depth}/${runDepthLimit(run)}</b></div><div class="hunt-chip-v141">ROUND<b>${run.round}</b></div><div class="hunt-chip-v141">HEAT<b>+${heat}%</b></div><div class="hunt-chip-v141">SPOOR<b>${spoor}</b></div>`}else meta.innerHTML=`<div class="hunt-chip-v141">REGION<b>${worldStateV14()?'LOWLANDS':'EMBERWATCH'}</b></div><div class="hunt-chip-v141">STATE<b>SAFE</b></div>`}
  const hint=$('actionHint'),prompt=$('prompt');if(hint)hint.style.display=run?'block':'none';if(prompt)prompt.style.display=run?'none':'block';
  const mapBtn=$('mapBtnV141');if(mapBtn)mapBtn.title=run?.deepHunt?.active?'Open Hunt Map (M)':'Open Map / Hunt Intel (M)';
}
function initBattleHudV141(){
  if($('battleHudV141'))return;const stage=$('stageShell');if(!stage)return;stage.classList.add('stage-v141');
  const root=document.createElement('div');root.id='battleHudV141';root.className='battle-hud-v141';root.innerHTML=`
    <section class="objective-frame-v141" id="objectiveFrameV141"><div class="objective-head-v141"><span>FIELD OBJECTIVES</span><button id="objectiveToggleV141" title="Collapse objectives">−</button></div><div id="objectiveHudHostV141"></div></section>
    <section class="target-frame-v141" id="targetFrameV141"><div class="target-top-v141"><span class="target-kind-v141" id="targetKindV141">TARGET</span><div class="target-name-v141" id="targetNameV141">No target</div><div class="target-meta-v141" id="targetMetaV141">—</div></div><div class="target-hp-v141"><div class="target-hp-fill-v141" id="targetHpFillV141"></div><div class="target-hp-text-v141" id="targetHpTextV141">—</div></div><div class="target-lower-v141"><div class="target-parts-v141" id="targetPartsV141"></div><div class="target-intent-v141" id="targetIntentV141"></div></div><button class="target-details-button-v141" id="targetDetailsButtonV141" title="Target details">i</button><div class="target-detail-pop-v141" id="targetDetailPopV141"></div></section>
    <section class="map-stack-v141"><div id="minimapHostV141"></div><div class="hud-tools-v141"><button id="mapBtnV141" title="Hunt Map (M)">⌖<span>Map</span></button><button data-drawer="party" title="Party">♟<span>Party</span></button><button data-drawer="meters" title="Combat meters">⌁<span>Meters</span></button><button data-drawer="loot" title="Run loot">◆<span>Loot</span></button><button data-drawer="log" title="Expedition log">≡<span>Log</span></button></div></section>
    <section class="route-bar-v141" id="routeBarV141"><div id="routeChoiceHostV141"></div></section>
    <section class="bottom-dock-v141" id="bottomDockV141"><div class="status-rail-v141" id="statusRailV141"></div><div class="player-frame-v141" id="playerFrameV141"></div><div class="hotbar-v141"><div class="hotbar-hint-v141" id="hotbarHintV141"></div><div id="hotbarHostV141"></div></div><div class="hunt-meta-v141" id="huntMetaV141"><div class="hunt-meta-text-v141" id="huntMetaTextV141"></div></div></section>
    <section class="hunt-map-overlay-v141" id="huntMapOverlayV141"><div class="hunt-map-card-v141"><div class="hunt-map-head-v141"><b>HUNT MAP</b><span>ROUTE • SPOOR • HEAT • EXTRACTION</span><button id="huntMapCloseV141">×</button></div><div class="hunt-map-content-v141" id="huntMapContentV141"><div class="hunt-map-placeholder-v141" id="huntMapPlaceholderV141"></div></div></div></section>
    <aside class="hud-drawer-v141" id="hudDrawerV141"><div class="hud-drawer-head-v141"><b id="hudDrawerTitleV141">FIELD INTEL</b><button id="hudDrawerCloseV141">×</button></div><div class="hud-drawer-body-v141" id="hudDrawerBodyV141"></div></aside>`;stage.appendChild(root);
  const objectiveHost=$('objectiveHudHostV141'),hud=stage.querySelector('.hud'),objectives=$('objectiveLines');if(hud)objectiveHost.appendChild(hud);if(objectives)objectiveHost.appendChild(objectives);
  const mapHost=$('minimapHostV141'),minimapWrap=minimapCanvas?.closest?.('.minimap-wrap');if(minimapWrap){minimapWrap.style.display='block';mapHost.appendChild(minimapWrap)}
  const playerFrame=$('playerFrameV141'),combatHud=$('combatHudV11');if(combatHud)playerFrame.appendChild(combatHud);
  const status=$('v11Status');if(status)$('statusRailV141').appendChild(status);const threat=$('v11Threat');if(threat)$('huntMetaV141').appendChild(threat);const phase=$('phaseBox');if(phase)$('huntMetaV141').appendChild(phase);
  const actions=document.querySelector('.side .actions')||document.querySelector('.actions');if(actions)$('hotbarHostV141').appendChild(actions);const hint=$('actionHint'),prompt=$('prompt');if(hint)$('hotbarHintV141').appendChild(hint);if(prompt)$('hotbarHintV141').appendChild(prompt);
  const path=$('pathPanel'),vote=$('votePanel');if(path)$('routeChoiceHostV141').appendChild(path);if(vote)$('routeChoiceHostV141').appendChild(vote);
  const expedition=$('expeditionPanel');if(expedition)$('huntMapContentV141').appendChild(expedition);
  const targetInfo=$('targetInfo'),parts=$('partPanel');if(targetInfo)$('targetDetailPopV141').appendChild(targetInfo);if(parts)$('targetPartsV141').appendChild(parts);
  const drawerBody=$('hudDrawerBodyV141'),panels={};hudPanelByChildV141('partyList','party',drawerBody,panels);hudPanelByChildV141('damageMeterRows','meters',drawerBody,panels);hudPanelByChildV141('runLoot','loot',drawerBody,panels);hudPanelByChildV141('log','log',drawerBody,panels);document._hudPanelsV141=panels;
  $('objectiveToggleV141').onclick=()=>{$('objectiveFrameV141').classList.toggle('collapsed');$('objectiveToggleV141').textContent=$('objectiveFrameV141').classList.contains('collapsed')?'+':'−'};
  $('targetDetailsButtonV141').onclick=e=>{e.stopPropagation();$('targetFrameV141').classList.toggle('details')};
  $('mapBtnV141').onclick=()=>toggleHuntMapV141();$('huntMapCloseV141').onclick=()=>toggleHuntMapV141(false);$('hudDrawerCloseV141').onclick=()=>toggleHudDrawerV141();document.querySelectorAll('.hud-tools-v141 [data-drawer]').forEach(b=>b.onclick=()=>toggleHudDrawerV141(b.dataset.drawer));
  const movementBase=movementOverlayOpen;movementOverlayOpen=function(){return movementBase()||$('huntMapOverlayV141')?.classList.contains('show')||$('hudDrawerV141')?.classList.contains('show')};
  window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;const k=e.key.toLowerCase();if(k==='m'){e.preventDefault();toggleHuntMapV141();return}if(e.key==='Escape'){if($('huntMapOverlayV141')?.classList.contains('show')){toggleHuntMapV141(false);e.preventDefault();return}if($('hudDrawerV141')?.classList.contains('show')){toggleHudDrawerV141();e.preventDefault();return}if($('targetFrameV141')?.classList.contains('details')){$('targetFrameV141').classList.remove('details');e.preventDefault();return}}},true);
  const baseRenderAll=renderAll;renderAll=function(){baseRenderAll();renderBattleHudV141(room||snapshot)};
}

/* Initialize after the canonical v0.14 game has booted. */
initBattleHudV141();
renderAll();
