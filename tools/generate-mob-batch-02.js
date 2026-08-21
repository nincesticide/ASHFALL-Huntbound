#!/usr/bin/env node
'use strict';
// Art-only deterministic generator. It never reads or writes authoritative gameplay/session code.

const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const OUT=path.join(ROOT,'assets','monsters');
const PLAN=JSON.parse(fs.readFileSync(path.join(OUT,'batches','batch-02.plan.json'),'utf8'));
const FRAME=64,COLS=6,ANIMS=['idle','walk','attack','special','hit','death'],DIRS=['south','side','north'];
const mkdir=p=>fs.mkdirSync(p,{recursive:true});
const write=(p,s)=>{mkdir(path.dirname(p));fs.writeFileSync(p,s)};
const rect=(x,y,w,h,f,o='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${o}/>`;
const ell=(cx,cy,rx,ry,f,o='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"${o}/>`;
const cir=(cx,cy,r,f,o='')=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${o}/>`;
const line=(x1,y1,x2,y2,c,w=1,o='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"${o}/>`;
const poly=(pts,f,o='')=>`<polygon points="${pts}" fill="${f}"${o}/>`;
const pathEl=(d,c,w=1,o='')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${o}/>`;
const opacity=n=>` opacity="${n}"`;

function skeleton(dir,archer){
  const b='#c8c1a8',b2='#958f7d',dark='#332f2a',cloth=archer?'#5d3f43':'#4b4a50';
  let s=ell(32,54,15,4,'#000',opacity(.28));
  if(dir==='side'){
    s+=rect(27,18,11,11,b)+rect(35,22,3,3,dark)+rect(31,26,4,2,dark);
    s+=line(31,29,31,43,b,4)+line(25,33,39,33,b,3)+line(27,36,21,46,b,3)+line(35,36,42,45,b,3);
    s+=line(29,42,24,53,b,3)+line(34,42,39,53,b,3)+rect(26,31,10,11,cloth)+rect(25,40,12,4,dark);
    if(archer)s+=pathEl('M45 24 Q55 33 45 48','#8f6a43',3)+line(45,24,45,48,'#d8c7a0');
    else s+=line(41,29,51,47,'#aeb9c5',3)+rect(49,27,3,21,'#e4e9ef');
  }else{
    const bb=dir==='north'?b2:b;
    s+=rect(26,18,12,11,bb)+(dir==='north'?rect(27,18,10,4,dark):rect(28,21,3,3,dark)+rect(34,21,3,3,dark)+rect(31,26,3,2,dark));
    s+=line(32,29,32,43,bb,4)+line(24,32,40,32,bb,3)+line(26,35,21,46,bb,3)+line(38,35,43,46,bb,3);
    s+=line(29,42,25,53,bb,3)+line(35,42,39,53,bb,3)+rect(27,31,10,10,cloth)+rect(26,40,12,4,dark);
    if(archer)s+=pathEl('M18 25 Q8 33 18 47','#8f6a43',3)+line(18,25,18,47,'#d8c7a0');
    else s+=line(43,29,49,49,'#aeb9c5',3)+rect(47,27,3,22,'#e4e9ef');
  }
  return s;
}
function husk(dir){
  const flesh='#777065',flesh2='#938a78',rot='#4d5143',cloth='#4b3934';
  let s=ell(32,55,19,5,'#000',opacity(.3));
  if(dir==='side'){
    s+=ell(32,37,19,16,flesh)+rect(19,31,25,17,flesh)+rect(34,19,16,14,flesh2);
    s+=rect(43,22,4,4,'#211e1a')+rect(47,27,5,3,'#3e2b2b')+rect(16,32,8,18,flesh)+rect(40,33,10,16,flesh);
    s+=rect(21,45,9,10,cloth)+rect(35,45,9,10,cloth)+cir(25,35,4,rot)+cir(41,40,3,rot)+rect(28,32,8,11,'#5d574e');
  }else{
    s+=ell(32,36,18,17,flesh)+rect(20,31,24,16,flesh)+rect(23,18,18,15,dir==='north'?cloth:flesh2);
    if(dir!=='north')s+=rect(26,20,4,4,'#211e1a')+rect(35,20,4,4,'#211e1a')+rect(30,27,7,3,'#3e2b2b');
    s+=rect(15,31,8,18,flesh)+rect(41,31,8,18,flesh)+rect(21,44,9,11,cloth)+rect(34,44,9,11,cloth);
    s+=cir(20,35,4,rot)+cir(45,39,3,rot)+rect(29,32,7,10,'#5d574e');
  }
  return s;
}
const BODY={
  bone_archer:{south:skeleton('south',true),side:skeleton('side',true),north:skeleton('north',true)},
  grave_husk:{south:husk('south'),side:husk('side'),north:husk('north')},
  restless_dead:{south:skeleton('south',false),side:skeleton('side',false),north:skeleton('north',false)}
};
function overlay(id,anim,dir,i){
  const c={bone_archer:'#a6d8ff',grave_husk:'#9dc56e',restless_dead:'#cfd4e6'}[id];let s='';
  if(anim==='attack'){
    if(id==='bone_archer'){
      if(dir==='side'){s+=line(45,24,45,48,'#e6d6a9')+line(45,36,35-[0,2,4,7,4,1][i],36,'#d8d1bf',2);if(i>=3)s+=line(49+i*4,36,58+i*4,36,'#f0f4ff',2)+poly(`${58+i*4},33 ${64+i*4},36 ${58+i*4},39`,'#f0f4ff');}
      else{s+=line(18,25,18,47,'#e6d6a9')+line(18,36,32,36,'#d8d1bf',2);if(i>=3)s+=line(32,36-i,32,22-i*2,'#f0f4ff',2)+poly(`29,${22-i*2} 32,${16-i*2} 35,${22-i*2}`,'#f0f4ff');}
    }else if(id==='grave_husk'&&i>=2){
      s+=ell(32,53,8+i*5,2+i*.8,'none',` stroke="#c7a66e" stroke-width="2"${opacity(.25+.12*i)}`);
      [-12,0,12].forEach(dx=>s+=poly(`${32+dx},${51-i} ${35+dx},${43-i*2} ${38+dx},${52-i}`,'#b8aa8b',opacity(.8)));
    }else if(id==='restless_dead'){
      if(dir==='side'){s+=line(38+i*2,30-i,51+i*2,47-i*2,'#e5e9f0',3);if(i>=2)s+=pathEl(`M38 18 Q${48+i*3} 30 ${43+i*3} 49`,c,2,opacity(.65));}
      else{s+=line(42,28-i,50+i*2,48-i*2,'#e5e9f0',3);if(i>=2)s+=pathEl(`M19 24 Q32 ${14-i*2} 50 35`,c,2,opacity(.65));}
    }
  }else if(anim==='special'){
    if(id==='bone_archer'){
      if(i>=1)s+=cir(32,30,6+i*2,'none',` stroke="${c}" stroke-width="2"${opacity(.25+.1*i)}`);
      if(i>=3){if(dir==='side')[-7,0,7].forEach(oy=>s+=line(43+i*3,35+oy,58+i*3,35+oy,c,2)+poly(`${58+i*3},${32+oy} ${64+i*3},${35+oy} ${58+i*3},${38+oy}`,c));else[-7,0,7].forEach(ox=>s+=line(32+ox,32-i,32+ox,13-i*2,c,2)+poly(`${29+ox},${13-i*2} ${32+ox},${7-i*2} ${35+ox},${13-i*2}`,c));}
    }else if(id==='grave_husk'){
      if(i>=1)s+=cir(32,39,5+i*5,'none',` stroke="#9dcc6f" stroke-width="2"${opacity(.25+.09*i)}`);
      if(i>=2)for(let a=0;a<360;a+=60){const q=a*Math.PI/180,x1=32+Math.cos(q)*(5+i*3),y1=39+Math.sin(q)*(4+i*2),x2=32+Math.cos(q)*(11+i*5),y2=39+Math.sin(q)*(7+i*3);s+=line(x1.toFixed(1),y1.toFixed(1),x2.toFixed(1),y2.toFixed(1),'#c2d67b',2,opacity(.7));}
    }else{
      if(i>=1)s+=cir(32,33,5+i*3,'none',` stroke="#b6bdf3" stroke-width="2"${opacity(.22+.1*i)}`);
      if(i>=3)s+=pathEl(`M10 43 Q32 ${8-i} 56 43`,'#b6bdf3',3,opacity(.65))+poly('48,18 56,23 49,28','#e9edff',opacity(.85));
    }
  }else if(anim==='hit'&&(i===2||i===3))s+=rect(16,14,34,39,'#fff',opacity(.18))+line(20,18,45,49,'#ff8f7a',2);
  else if(anim==='death'&&i>=3)s+=cir(32,48,4+i*3,'none',` stroke="#8f7b68" stroke-width="2"${opacity(Math.max(.1,.65-i*.08))}`);
  return s;
}
function atlas(id){
  const defs=`<defs>${DIRS.map(d=>`<g id="${id}_${d}">${BODY[id][d]}</g>`).join('')}</defs>`,parts=[];
  const idleY=[0,0,-1,-1,0,0],walkX=[0,1,2,1,0,-1],walkY=[0,1,0,-1,0,1],attackX=[0,0,1,4,6,2],specialY=[0,-1,-2,-3,-1,0],hitX=[0,-2,-4,-3,-1,0],fall=[0,0,12,28,52,78];
  ANIMS.forEach((anim,ai)=>DIRS.forEach((dir,di)=>{const row=ai*3+di;for(let i=0;i<6;i++){
    let x=0,y=0;if(anim==='idle')y=idleY[i];if(anim==='walk'){x=dir==='side'?walkX[i]:0;y=walkY[i];}if(anim==='attack'){x=dir==='side'?attackX[i]:Math.floor(attackX[i]/2);y=-Math.max(0,i-2);}if(anim==='special')y=specialY[i];if(anim==='hit')x=dir==='side'?hitX[i]:0;if(anim==='death')y=[0,1,4,8,12,16][i];
    const body=anim==='death'&&i>=2?`<g transform="translate(32 44) rotate(${fall[i]}) translate(-32 -44)"><use href="#${id}_${dir}"/></g>`:`<use href="#${id}_${dir}"/>`;
    parts.push(`<g transform="translate(${i*64},${row*64})"><g transform="translate(${x} ${y})">${body}${overlay(id,anim,dir,i)}</g></g>`);
  }}));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="384" height="1152" viewBox="0 0 384 1152" shape-rendering="crispEdges">${defs}${parts.join('')}</svg>`;
}
function metadata(entry){
  const rows={idle:{south:0,side:1,north:2},walk:{south:3,side:4,north:5},attack:{south:6,side:7,north:8},special:{south:9,side:10,north:11},hit:{south:12,side:13,north:14},death:{south:15,side:16,north:17}};
  return {id:entry.spriteId,enemyKind:entry.enemyKind,name:entry.name,format:'svg-atlas-v1',frameWidth:64,frameHeight:64,columns:6,rows:18,directions:DIRS,mirrorSideForWest:true,rowOrder:ANIMS.flatMap(a=>DIRS.map(d=>`${a}_${d}`)),animations:{idle:{frames:6,fps:5,loop:true,rows:rows.idle},walk:{frames:6,fps:10,loop:true,rows:rows.walk},attack:{frames:6,fps:12,loop:false,damageFrame:4,rows:rows.attack},special:{frames:6,fps:10,loop:false,eventFrame:4,event:entry.special,rows:rows.special},hit:{frames:6,fps:12,loop:false,rows:rows.hit},death:{frames:6,fps:8,loop:false,rows:rows.death}},anchor:{x:32,y:entry.spriteId==='grave_husk'?56:55},footprint:{width:1,height:1},source:`${entry.spriteId}.atlas.svg`,status:'batch-02-production-rig'};
}
for(const entry of PLAN.assets){
  const dir=path.join(OUT,'common',entry.spriteId);mkdir(dir);
  write(path.join(dir,`${entry.spriteId}.atlas.svg`),atlas(entry.spriteId));
  write(path.join(dir,`${entry.spriteId}.sprite.json`),JSON.stringify(metadata(entry),null,2)+'\n');
}
const batch={schemaVersion:1,batch:'02',zone:'hollow',assets:PLAN.assets};
write(path.join(OUT,'batches','batch-02.manifest.json'),JSON.stringify(batch,null,2)+'\n');
const masterPath=path.join(OUT,'manifest.v1.json'),master=JSON.parse(fs.readFileSync(masterPath,'utf8'));
for(const entry of PLAN.assets){const e=master.enemies[entry.enemyKind];if(!e)throw new Error(`Missing master enemy: ${entry.enemyKind}`);Object.assign(e,{spriteId:entry.spriteId,status:'batch-02-ready',atlas:entry.atlas,metadata:entry.metadata});}
write(masterPath,JSON.stringify(master,null,2)+'\n');
console.log(`Generated Batch 02: ${PLAN.assets.map(x=>x.name).join(', ')}`);
