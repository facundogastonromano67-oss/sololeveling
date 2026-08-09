(()=>{
'use strict';
if(typeof state==='undefined') return;
const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
const KEY=typeof storeKey!=='undefined'?storeKey:'vidaRpgStateV8';
const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clampN=(n,a,b)=>Math.max(a,Math.min(b,n));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn('Arena save',e)}};
const today=()=>typeof todayKey==='function'?todayKey():new Date().toISOString().slice(0,10);
const uid=()=>state.player?.createdAt||state.player?.name||'gladiador';

const RARITY={
 normal:{label:'Normal',rank:1,className:'normal'},
 rare:{label:'Rara',rank:2,className:'rare'},
 legendary:{label:'Legendaria',rank:3,className:'legendary'},
 mythic:{label:'Mítica',rank:4,className:'mythic'}
};
const TYPE_COUNTER={Ataque:'Táctica',Táctica:'Control',Control:'Defensa',Defensa:'Ataque'};
const ABILITIES=[
 {id:'embestida',name:'Embestida',rarity:'normal',type:'Ataque',power:38,min:1,effect:'first',desc:'+5 de potencia en las primeras 2 rondas.'},
 {id:'guardia',name:'Guardia de hierro',rarity:'normal',type:'Defensa',power:37,min:1,effect:'guard',desc:'Si pierde el choque, reduce 4 de daño.'},
 {id:'pulso',name:'Pulso firme',rarity:'normal',type:'Control',power:36,min:1,effect:'counter',desc:'+4 extra cuando tiene ventaja de categoría.'},
 {id:'calculo',name:'Cálculo frío',rarity:'normal',type:'Táctica',power:39,min:1,effect:'steady',desc:'Ignora penalizaciones por desventaja de categoría.'},
 {id:'presion',name:'Presión constante',rarity:'normal',type:'Ataque',power:41,min:2,effect:'fury',desc:'+5 de potencia cuando estás debajo de 50 HP.'},
 {id:'temple',name:'Temple',rarity:'normal',type:'Defensa',power:40,min:2,effect:'heal',desc:'Si gana, recupera 3 HP.'},
 {id:'distraccion',name:'Distracción',rarity:'normal',type:'Control',power:40,min:3,effect:'drain',desc:'Si gana, quita 1 punto de boost rival.'},
 {id:'finta',name:'Finta corta',rarity:'normal',type:'Táctica',power:42,min:3,effect:'first',desc:'+5 de potencia en las primeras 2 rondas.'},

 {id:'ruptura',name:'Ruptura de guardia',rarity:'rare',type:'Ataque',power:53,min:4,effect:'pierce',desc:'+7 contra habilidades de Defensa.'},
 {id:'bastion',name:'Bastión',rarity:'rare',type:'Defensa',power:52,min:4,effect:'guard',desc:'Si pierde, reduce 6 de daño.'},
 {id:'jaque',name:'Jaque mental',rarity:'rare',type:'Control',power:51,min:5,effect:'counter',desc:'+7 extra con ventaja de categoría.'},
 {id:'precision',name:'Precisión táctica',rarity:'rare',type:'Táctica',power:55,min:5,effect:'steady',desc:'No sufre penalización por desventaja.'},
 {id:'contraataque',name:'Contraataque',rarity:'rare',type:'Defensa',power:56,min:6,effect:'reflect',desc:'Si gana contra Ataque, hace +5 de daño.'},
 {id:'lectura',name:'Lectura del rival',rarity:'rare',type:'Táctica',power:54,min:7,effect:'scout',desc:'+4 si el rival ya usó esa categoría antes.'},
 {id:'asedio',name:'Asedio',rarity:'rare',type:'Ataque',power:58,min:8,effect:'fury',desc:'+7 de potencia debajo de 50 HP.'},
 {id:'silencio',name:'Silencio del foro',rarity:'rare',type:'Control',power:57,min:9,effect:'drain',desc:'Si gana, quita 1 boost rival.'},

 {id:'martillo',name:'Martillo de Marte',rarity:'legendary',type:'Ataque',power:70,min:10,effect:'pierce',desc:'+9 contra Defensa.'},
 {id:'muro',name:'Muro de Roma',rarity:'legendary',type:'Defensa',power:72,min:11,effect:'guard',desc:'Si pierde, reduce 9 de daño.'},
 {id:'dominus',name:'Dominus',rarity:'legendary',type:'Control',power:69,min:12,effect:'counter',desc:'+10 con ventaja de categoría.'},
 {id:'finta-imperial',name:'Finta imperial',rarity:'legendary',type:'Táctica',power:73,min:13,effect:'steady',desc:'No sufre penalización de categoría.'},
 {id:'sentencia',name:'Sentencia',rarity:'legendary',type:'Ataque',power:75,min:15,effect:'execute',desc:'+10 si el rival está debajo de 35 HP.'},
 {id:'corona-hierro',name:'Corona de hierro',rarity:'legendary',type:'Defensa',power:74,min:16,effect:'heal',desc:'Si gana, recupera 7 HP.'},
 {id:'estratega',name:'Estratega del Coliseo',rarity:'legendary',type:'Táctica',power:76,min:18,effect:'scout',desc:'+8 si el rival repite categoría.'},

 {id:'invictus',name:'Invictus',rarity:'mythic',type:'Defensa',power:88,min:20,effect:'guard',desc:'Si pierde, reduce 12 de daño.'},
 {id:'juicio',name:'Juicio del Coliseo',rarity:'mythic',type:'Ataque',power:91,min:21,effect:'execute',desc:'+14 si el rival está debajo de 35 HP.'},
 {id:'minerva',name:'Ojo de Minerva',rarity:'mythic',type:'Táctica',power:89,min:22,effect:'steady',desc:'Ignora desventaja y gana +4 si el rival repite categoría.'},
 {id:'decreto',name:'Decreto del César',rarity:'mythic',type:'Control',power:90,min:24,effect:'drain2',desc:'Si gana, roba hasta 2 boosts del rival.'},
 {id:'sangre-marte',name:'Sangre de Marte',rarity:'mythic',type:'Ataque',power:94,min:26,effect:'fury2',desc:'+15 debajo de 50 HP.'}
];
const abilityById=id=>ABILITIES.find(a=>a.id===id);

function characterXp(){
 let xp=0;
 Object.values(state.days||{}).forEach(d=>{
  (d.tasks||[]).forEach(t=>{if(t.done)xp+=Number(t.xp)||0});
  (d.events||[]).forEach(e=>{xp+=Number(e.xp)||0});
 });
 return xp;
}
function level(){return Math.floor(Math.sqrt(Math.max(0,characterXp())/25))+1}
function hash(str){let h=2166136261>>>0;for(const c of String(str)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let x=hash(seed)||123456789;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)%1000000)/1000000}}
function seededShuffle(arr,seed){const r=rng(seed),a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function ensureArena(){
 state.arena=state.arena||{rating:1000,wins:0,losses:0,streak:0};
 state.arena2=state.arena2||{};
 const a=state.arena2;
 a.owned=Array.isArray(a.owned)?a.owned:[];
 a.deck=Array.isArray(a.deck)?a.deck:[];
 a.levelClaims=a.levelClaims||{};
 a.weeklyChests=a.weeklyChests||{};
 a.missionChestTokens=Number(a.missionChestTokens)||0;
 a.missionChestHistory=Array.isArray(a.missionChestHistory)?a.missionChestHistory:[];
 a.battleHistory=Array.isArray(a.battleHistory)?a.battleHistory:[];
 a.version=2;
 syncLevelUnlocks();
 if(a.deck.length<5){a.deck=a.owned.slice(0,Math.min(6,a.owned.length))}
 a.deck=a.deck.filter(id=>a.owned.includes(id)).slice(0,7);
 while(a.deck.length<5){const next=a.owned.find(id=>!a.deck.includes(id));if(!next)break;a.deck.push(next)}
 save();
}
function eligibleAt(lvl,rarityCap=4){return ABILITIES.filter(a=>a.min<=lvl&&RARITY[a.rarity].rank<=rarityCap)}
function grantDeterministic(seed,lvl,rarityCap){
 const pool=seededShuffle(eligibleAt(lvl,rarityCap).filter(a=>!state.arena2.owned.includes(a.id)),seed);
 if(!pool.length)return null;state.arena2.owned.push(pool[0].id);return pool[0];
}
function syncLevelUnlocks(){
 const a=state.arena2,lvl=level();
 if(a.owned.length<5){
   const starters=seededShuffle(ABILITIES.filter(x=>x.rarity==='normal'&&x.min<=3),uid()+'starter');
   for(const ab of starters){if(a.owned.length>=5)break;if(!a.owned.includes(ab.id))a.owned.push(ab.id)}
 }
 const milestones=[2,3,4,5,7,9,12,15,18,22,26,30];
 milestones.filter(m=>m<=lvl).forEach(m=>{
   if(a.levelClaims[m])return;
   const cap=m>=20?4:m>=10?3:m>=4?2:1;
   const got=grantDeterministic(uid()+':level:'+m,m,cap);
   a.levelClaims[m]=got?.id||'none';
 });
}

function weekStart(d=new Date()){
 const x=new Date(d);const day=(x.getDay()+6)%7;x.setHours(12,0,0,0);x.setDate(x.getDate()-day);return x;
}
function dateKeyLocal(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function weekKey(){return dateKeyLocal(weekStart())}
function weeklyScore(){
 const start=weekStart(),details=[];let score=0,activeStreak=0,maxStreak=0;
 for(let i=0;i<7;i++){
  const d=new Date(start);d.setDate(start.getDate()+i);const k=dateKeyLocal(d);
  if(k>today())continue;
  const sys=state.missions?.daily?.[k]?.items||[];
  const sysDone=sys.filter(x=>x.done).length;
  const tasks=state.days?.[k]?.tasks||[];
  const personal=tasks.filter(t=>t.custom&&t.done).length;
  const plan=tasks.filter(t=>!t.custom&&t.done).length;
  let dayScore=sysDone*20+personal*10+plan*6;
  if(sys.length&&sysDone===sys.length)dayScore+=25;
  const active=sysDone+personal+plan>0;
  if(active){activeStreak++;maxStreak=Math.max(maxStreak,activeStreak);dayScore+=15}else activeStreak=0;
  score+=dayScore;details.push({k,sysDone,personal,plan,dayScore,active});
 }
 score+=Math.max(0,maxStreak-1)*8;
 return{score,maxStreak,details};
}
const CHESTS=[
 {id:'bronze',name:'Cofre de Bronce',need:180,odds:{normal:72,rare:26,legendary:2,mythic:0},coins:12},
 {id:'gold',name:'Cofre de Oro',need:400,odds:{normal:18,rare:57,legendary:23,mythic:2},coins:25},
 {id:'master',name:'Cofre del Maestro',need:650,odds:{normal:4,rare:29,legendary:52,mythic:15},coins:45}
];
function rollRarity(odds,seed){const r=rng(seed)()*100;let acc=0;for(const k of ['normal','rare','legendary','mythic']){acc+=odds[k]||0;if(r<acc)return k}return'normal'}
function openWeeklyChest(id){
 const chest=CHESTS.find(c=>c.id===id);if(!chest)return;
 const wk=weekKey(),ws=weeklyScore();state.arena2.weeklyChests[wk]=state.arena2.weeklyChests[wk]||{};
 if(ws.score<chest.need||state.arena2.weeklyChests[wk][id])return;
 let rarity=rollRarity(chest.odds,uid()+wk+id+Date.now());
 const maxRank=level()<10?2:level()<20?3:4;if(RARITY[rarity].rank>maxRank)rarity=maxRank===2?'rare':maxRank===3?'legendary':'mythic';
 let pool=ABILITIES.filter(a=>a.rarity===rarity&&a.min<=Math.max(level()+3,8)&&!state.arena2.owned.includes(a.id));
 if(!pool.length)pool=ABILITIES.filter(a=>a.min<=level()+3&&!state.arena2.owned.includes(a.id));
 const picked=pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
 state.economy=state.economy||{coins:0};
 state.economy.coins=(state.economy.coins||0)+chest.coins;
 if(picked)state.arena2.owned.push(picked.id);
 state.arena2.weeklyChests[wk][id]={at:new Date().toISOString(),ability:picked?.id||null,coins:chest.coins};
 save();renderAll();showReward(picked,chest.coins,chest.name);
}

function openMissionChest(){
 if((state.arena2.missionChestTokens||0)<=0)return;
 const odds={normal:38,rare:42,legendary:17,mythic:3};let rarity=rollRarity(odds,uid()+':mission:'+Date.now());
 const maxRank=level()<8?2:level()<18?3:4;if(RARITY[rarity].rank>maxRank)rarity=maxRank===2?'rare':maxRank===3?'legendary':'mythic';
 let pool=ABILITIES.filter(a=>a.rarity===rarity&&a.min<=Math.max(level()+4,8)&&!state.arena2.owned.includes(a.id));
 if(!pool.length)pool=ABILITIES.filter(a=>a.min<=level()+4&&!state.arena2.owned.includes(a.id));
 const picked=pool.length?pool[Math.floor(Math.random()*pool.length)]:null;state.arena2.missionChestTokens--;state.economy=state.economy||{coins:0};state.economy.coins=(state.economy.coins||0)+10;if(picked)state.arena2.owned.push(picked.id);
 state.arena2.missionChestHistory.unshift({at:new Date().toISOString(),ability:picked?.id||null,coins:10});state.arena2.missionChestHistory=state.arena2.missionChestHistory.slice(0,20);save();renderAll();showReward(picked,10,'Cofre del camino');
}

function rarityBadge(a){const r=RARITY[a.rarity];return `<span class="arena-rarity ${r.className}">${r.label}</span>`}
function renderHeader(){
 const lvl=level(),ws=weeklyScore();
 $('#arenaRating').textContent=state.arena.rating||1000;
 $('#arenaRecord').textContent=`${state.arena.wins||0}V · ${state.arena.losses||0}D`;
 $('#arenaLevel').textContent=lvl;
 $('#arenaOwned').textContent=`${state.arena2.owned.length}/${ABILITIES.length}`;
 $('#weeklyScore').textContent=ws.score;
 $('#weeklyStreak').textContent=`${ws.maxStreak} días`;
}
function renderWeekly(){
 const box=$('#weeklyChests'),wk=weekKey(),ws=weeklyScore(),claims=state.arena2.weeklyChests[wk]||{};
 $('#weeklyProgressBar').style.width=`${Math.min(100,ws.score/650*100)}%`;
 $('#weeklyProgressText').textContent=`${ws.score} puntos esta semana · mejor racha ${ws.maxStreak} días`;
 const missionTokens=state.arena2.missionChestTokens||0;
 box.innerHTML=(missionTokens?`<article class="weekly-chest ready mission-track-chest"><div><strong>Cofre del camino</strong><small>${missionTokens} disponible${missionTokens===1?'':'s'} · ganado en Misiones</small></div><button class="primary" id="openMissionChest">Abrir</button></article>`:'')+CHESTS.map(c=>{
  const claimed=claims[c.id],ready=ws.score>=c.need;
  return `<article class="weekly-chest ${ready?'ready':''} ${claimed?'claimed':''}"><div><strong>${esc(c.name)}</strong><small>${c.need} pts · puede otorgar habilidades</small></div><button class="${ready&&!claimed?'primary':'ghost'}" data-chest="${c.id}" ${!ready||claimed?'disabled':''}>${claimed?'Abierto':ready?'Abrir':'Bloqueado'}</button></article>`
 }).join('');
 $('#openMissionChest')?.addEventListener('click',openMissionChest);
 $$('[data-chest]').forEach(b=>b.onclick=()=>openWeeklyChest(b.dataset.chest));
}
function renderArsenal(){
 const owned=state.arena2.owned.map(abilityById).filter(Boolean).sort((a,b)=>RARITY[b.rarity].rank-RARITY[a.rarity].rank||b.power-a.power);
 const deck=state.arena2.deck;
 $('#deckCount').textContent=`${deck.length}/7`;
 $('#deckHint').textContent=deck.length<5?'Elegí al menos 5 habilidades para combatir.':'Tu selección queda guardada para el próximo combate.';
 $('#combatAbilityList').innerHTML=owned.map(a=>`<article class="arsenal-card ${deck.includes(a.id)?'selected':''}" data-arsenal="${a.id}">
   <header>${rarityBadge(a)}<span class="arena-type">${a.type}</span></header>
   <h3>${esc(a.name)}</h3><div class="ability-power">${a.power}<small>POTENCIA</small></div>
   <p>${esc(a.desc)}</p><button class="${deck.includes(a.id)?'primary':'ghost'} small-btn">${deck.includes(a.id)?'En combate':'Agregar'}</button>
  </article>`).join('');
 $$('[data-arsenal]').forEach(card=>card.onclick=()=>toggleDeck(card.dataset.arsenal));
}
function toggleDeck(id){
 const d=state.arena2.deck,idx=d.indexOf(id);
 if(idx>=0){if(d.length<=5){toastArena('Necesitás al menos 5 habilidades.');return}d.splice(idx,1)}
 else{if(d.length>=7){toastArena('El máximo es 7 habilidades por combate.');return}d.push(id)}
 save();renderArsenal();
}
function renderAll(){renderHeader();renderWeekly();renderArsenal()}

function toastArena(msg){const s=$('#toastStack');if(!s)return;const e=document.createElement('div');e.className='toast show';e.textContent=msg;s.appendChild(e);setTimeout(()=>e.remove(),2400)}
function showReward(ab,coins,title){
 const ov=$('#arenaRewardOverlay');ov.classList.remove('hidden');
 $('#arenaRewardTitle').textContent=title;
 $('#arenaRewardBody').innerHTML=ab?`${rarityBadge(ab)}<h2>${esc(ab.name)}</h2><p>${esc(ab.desc)}</p><strong>+${coins} monedas</strong>`:`<h2>Recompensa económica</h2><p>Tu arsenal ya tenía todas las habilidades elegibles de este cofre.</p><strong>+${coins} monedas</strong>`;
}

// ---------- PREBATALLA: 10 pruebas ----------
let fight=null, timers=[];
const clearTimers=()=>{timers.forEach(x=>{clearTimeout(x);clearInterval(x)});timers=[]};
const later=(fn,ms)=>{const id=setTimeout(fn,ms);timers.push(id);return id};
function seededInt(seed,min,max){const r=rng(seed)();return Math.floor(r*(max-min+1))+min}
const MINI=[
 {id:'memory',name:'Memotest',desc:'Encontrá todas las parejas con la menor cantidad de movimientos.',run:gameMemory},
 {id:'ttt',name:'Tres en raya',desc:'Ganale al guardián del Coliseo.',run:gameTicTacToe},
 {id:'reaction',name:'Reflejos',desc:'Tocá apenas aparezca la señal.',run:gameReaction},
 {id:'number',name:'Memoria numérica',desc:'Memorizá el número y escribilo sin mirar.',run:gameNumber},
 {id:'lights',name:'Secuencia de brasas',desc:'Repetí la secuencia en el orden correcto.',run:gameLights},
 {id:'math',name:'Cálculo relámpago',desc:'Resolvé cinco operaciones lo más rápido posible.',run:gameMath},
 {id:'stroop',name:'Interferencia',desc:'Elegí el color real de la palabra, no lo que dice.',run:gameStroop},
 {id:'odd',name:'El intruso',desc:'Encontrá el símbolo diferente.',run:gameOdd},
 {id:'order',name:'Orden de combate',desc:'Tocá los valores de menor a mayor.',run:gameOrder},
 {id:'logic',name:'Secuencia lógica',desc:'Completá patrones numéricos.',run:gameLogic}
];
function startBattle(mode){
 if(state.arena2.deck.length<5){toastArena('Elegí entre 5 y 7 habilidades antes de entrar.');return}
 clearTimers();
 const tests=seededShuffle(MINI,uid()+Date.now()).slice(0,3);
 fight={mode,phase:'pre',tests,testIndex:0,boost1:0,boost2:0,p1Score:null,p2Score:null,round:0,maxRounds:10,
  p1:{name:state.player?.name||'Gladiador',hp:100,deck:[...state.arena2.deck],uses:{} ,history:[]},
  p2:{name:mode==='bot'?'Sistema':'Jugador 2',hp:100,deck:buildOpponentDeck(mode),uses:{},history:[]},
  choice1:null,choice2:null,localPlayer:1};
 $('#arenaCombatOverlay').classList.remove('hidden');$('#battleResultPanel').classList.add('hidden');
 showPreIntro();
}
function buildOpponentDeck(mode){
 if(mode==='local')return [...state.arena2.deck];
 const pDeck=state.arena2.deck.map(abilityById).filter(Boolean),avg=pDeck.reduce((s,a)=>s+a.power,0)/Math.max(1,pDeck.length);
 const pool=ABILITIES.filter(a=>a.min<=Math.max(level()+3,6));
 return seededShuffle(pool,uid()+':bot:'+Date.now()).sort((a,b)=>Math.abs(a.power-avg)-Math.abs(b.power-avg)).slice(0,state.arena2.deck.length).map(a=>a.id);
}
function showPreIntro(){
 $('#arenaPhase').textContent='PRUEBAS PREVIAS';
 $('#arenaStage').innerHTML=`<section class="prebattle-intro"><div class="eyebrow">ANTES DEL DUELO</div><h1>3 pruebas. 3 boosts en juego.</h1><p>El ganador de cada prueba obtiene +4 de potencia efectiva durante todo el combate.</p><div class="pretest-list">${fight.tests.map((g,i)=>`<div><b>0${i+1}</b><span>${g.name}</span><small>${g.desc}</small></div>`).join('')}</div><button class="primary big" id="beginTrialsBtn">Comenzar pruebas</button></section>`;
 $('#beginTrialsBtn').onclick=()=>runCurrentTrial();updateFightHud();
}
function runCurrentTrial(){
 clearTimers();const g=fight.tests[fight.testIndex];if(!g)return beginDuel();fight.p1Score=null;fight.p2Score=null;fight.localPlayer=1;
 runGameForCurrent(g);
}
function runGameForCurrent(g){
 const who=fight.mode==='local'?`Jugador ${fight.localPlayer}`:fight.p1.name;
 $('#arenaPhase').textContent=`PRUEBA ${fight.testIndex+1}/3 · ${g.name}`;
 $('#arenaStage').innerHTML=`<section class="mini-shell"><div class="eyebrow">${esc(who)}</div><h2>${esc(g.name)}</h2><p>${esc(g.desc)}</p><div id="miniGameArea"></div></section>`;
 const seed=`${uid()}:${fight.testIndex}:${g.id}:shared`;
 g.run($('#miniGameArea'),seed,score=>finishMiniScore(g,clampN(Math.round(score),0,100)));
}
function finishMiniScore(g,score){
 clearTimers();
 if(fight.mode==='local'&&fight.localPlayer===1){
  fight.p1Score=score;fight.localPlayer=2;
  $('#arenaStage').innerHTML=`<section class="pass-screen"><div class="eyebrow">PUNTAJE GUARDADO</div><h2>Pasale el dispositivo al Jugador 2</h2><p>La misma prueba se repetirá para comparar habilidad contra habilidad.</p><button class="primary big" id="nextLocalMini">Jugador 2 listo</button></section>`;
  $('#nextLocalMini').onclick=()=>runGameForCurrent(g);return;
 }
 if(fight.mode==='local')fight.p2Score=score;else{fight.p1Score=score;fight.p2Score=simulateBotScore(g)}
 const winner=fight.p1Score===fight.p2Score?0:(fight.p1Score>fight.p2Score?1:2);
 if(winner===1)fight.boost1++;if(winner===2)fight.boost2++;
 $('#arenaStage').innerHTML=`<section class="trial-result"><div class="eyebrow">RESULTADO DE LA PRUEBA</div><h2>${winner===0?'Empate':winner===1?`${esc(fight.p1.name)} gana el boost`:`${esc(fight.p2.name)} gana el boost`}</h2><div class="score-duel"><div><strong>${fight.p1Score}</strong><span>${esc(fight.p1.name)}</span></div><b>VS</b><div><strong>${fight.p2Score}</strong><span>${esc(fight.p2.name)}</span></div></div><p>${winner?'+4 de potencia efectiva para el ganador durante el combate.':'Nadie obtiene boost.'}</p><button class="primary big" id="nextTrialBtn">${fight.testIndex<2?'Siguiente prueba':'Entrar al combate'}</button></section>`;
 $('#nextTrialBtn').onclick=()=>{fight.testIndex++;runCurrentTrial()};updateFightHud();
}
function simulateBotScore(g){const base=50+Math.round(((state.arena.rating||1000)-1000)/40);return clampN(base+seededInt(g.id+Date.now(),-18,18),28,92)}

function gameReaction(el,seed,done){let ready=false,start=0,finished=false;el.innerHTML='<button class="reaction-pad" id="reactionPad">Esperá la señal…</button>';const b=$('#reactionPad');const delay=seededInt(seed,1100,2600);const t=later(()=>{ready=true;start=performance.now();b.classList.add('go');b.textContent='¡AHORA!'},delay);b.onclick=()=>{if(finished)return;if(!ready){finished=true;done(0);return}finished=true;const ms=performance.now()-start;done(clampN(110-ms/8,10,100))}}
function gameNumber(el,seed,done){const n=String(seededInt(seed,100000,999999));el.innerHTML=`<div class="number-memory" id="memoryNumber">${n}</div><div id="numberInputBox" class="hidden"><input inputmode="numeric" id="numberAnswer" maxlength="6" placeholder="Escribí los 6 dígitos"><button class="primary" id="numberSubmit">Confirmar</button></div>`;later(()=>{$('#memoryNumber').classList.add('hidden');$('#numberInputBox').classList.remove('hidden');$('#numberAnswer').focus()},1900);$('#numberSubmit').onclick=()=>{const a=$('#numberAnswer').value.trim();let ok=0;for(let i=0;i<6;i++)if(a[i]===n[i])ok++;done(ok/6*100)}}
function gameOdd(el,seed,done){const pos=seededInt(seed,0,19);el.innerHTML=`<div class="odd-grid">${Array.from({length:20},(_,i)=>`<button data-odd="${i}">${i===pos?'◆':'◇'}</button>`).join('')}</div>`;const start=performance.now();$$('[data-odd]').forEach(b=>b.onclick=()=>{const good=+b.dataset.odd===pos,ms=performance.now()-start;done(good?clampN(105-ms/70,35,100):5)})}
function gameOrder(el,seed,done){const r=rng(seed),nums=Array.from({length:7},()=>Math.floor(r()*80)+10);const target=[...nums].sort((a,b)=>a-b);let idx=0,errors=0;el.innerHTML=`<div class="order-grid">${seededShuffle(nums,seed+'shuffle').map(n=>`<button data-num="${n}">${n}</button>`).join('')}</div><p class="mini-status">Tocá de menor a mayor</p>`;const start=performance.now();$$('[data-num]').forEach(b=>b.onclick=()=>{if(+b.dataset.num===target[idx]){b.disabled=true;idx++;if(idx===target.length){const ms=performance.now()-start;done(clampN(110-errors*15-ms/250,20,100))}}else{errors++;b.classList.add('wrong');later(()=>b.classList.remove('wrong'),250)}})}
function gameLogic(el,seed,done){const sets=[{q:'2 · 4 · 8 · 16 · ?',o:[24,32,36,40],a:32},{q:'3 · 6 · 9 · 12 · ?',o:[14,15,16,18],a:15},{q:'1 · 1 · 2 · 3 · 5 · ?',o:[6,7,8,10],a:8},{q:'20 · 17 · 14 · 11 · ?',o:[7,8,9,10],a:8},{q:'5 · 10 · 20 · 40 · ?',o:[60,70,80,100],a:80}];const picks=seededShuffle(sets,seed).slice(0,3);let i=0,correct=0;const draw=()=>{const q=picks[i];el.innerHTML=`<div class="logic-q"><h3>${q.q}</h3>${q.o.map(x=>`<button data-logic="${x}">${x}</button>`).join('')}</div>`;$$('[data-logic]').forEach(b=>b.onclick=()=>{if(+b.dataset.logic===q.a)correct++;i++;if(i>=picks.length)done(correct/picks.length*100);else draw()})};draw()}
function gameMath(el,seed,done){const r=rng(seed);let i=0,correct=0,start=performance.now();const qs=Array.from({length:5},()=>{const a=Math.floor(r()*18)+3,b=Math.floor(r()*12)+2,op=r()>.45?'+':'×';return{q:`${a} ${op} ${b}`,a:op==='+'?a+b:a*b}});const draw=()=>{const q=qs[i],wrong=[q.a+2,q.a-1,q.a+5].filter((x,j,a)=>x>0&&a.indexOf(x)===j&&x!==q.a),opts=seededShuffle([q.a,...wrong].slice(0,4),seed+i);el.innerHTML=`<div class="math-q"><b>${i+1}/5</b><h2>${q.q}</h2>${opts.map(x=>`<button data-math="${x}">${x}</button>`).join('')}</div>`;$$('[data-math]').forEach(b=>b.onclick=()=>{if(+b.dataset.math===q.a)correct++;i++;if(i>=5){const ms=performance.now()-start;done(clampN(correct*20-(ms/1000)*1.5+15,0,100))}else draw()})};draw()}
function gameStroop(el,seed,done){const colors=[['ORO','#D4AF37'],['ROJO','#A83232'],['OLIVA','#7A7F3A'],['MARFIL','#F5E9D0']];const r=rng(seed);let i=0,correct=0;const draw=()=>{const word=colors[Math.floor(r()*colors.length)],ink=colors[Math.floor(r()*colors.length)];el.innerHTML=`<div class="stroop"><p>¿De qué color está escrita?</p><strong style="color:${ink[1]}">${word[0]}</strong><div>${colors.map(c=>`<button data-color="${c[0]}">${c[0]}</button>`).join('')}</div></div>`;$$('[data-color]').forEach(b=>b.onclick=()=>{if(b.dataset.color===ink[0])correct++;i++;if(i>=5)done(correct*20);else draw()})};draw()}
function gameLights(el,seed,done){const seq=Array.from({length:5},(_,i)=>seededInt(seed+i,0,3)),colors=['oro','rojo','oliva','marfil'];let input=[],showing=true;el.innerHTML=`<div class="lights-grid">${colors.map((c,i)=>`<button class="light ${c}" data-light="${i}"></button>`).join('')}</div><p class="mini-status">Memorizá la secuencia…</p>`;seq.forEach((x,i)=>later(()=>{const b=$(`[data-light="${x}"]`);b.classList.add('flash');later(()=>b.classList.remove('flash'),320)},500+i*560));later(()=>{$('.mini-status').textContent='Repetila';showing=false},500+seq.length*560);$$('[data-light]').forEach(b=>b.onclick=()=>{if(showing)return;input.push(+b.dataset.light);const idx=input.length-1;if(input[idx]!==seq[idx])return done(Math.max(0,idx/seq.length*100));if(input.length===seq.length)done(100)})}
function gameMemory(el,seed,done){const vals=seededShuffle(['✦','◆','▲','●','■','✚'],seed).slice(0,6),cards=seededShuffle([...vals,...vals],seed+'cards');let open=[],matched=0,moves=0,start=performance.now(),lock=false;el.innerHTML=`<div class="memo-grid">${cards.map((v,i)=>`<button data-card="${i}" data-val="${v}">?</button>`).join('')}</div>`;$$('[data-card]').forEach(b=>b.onclick=()=>{if(lock||b.disabled||open.includes(b))return;b.textContent=b.dataset.val;open.push(b);if(open.length===2){moves++;if(open[0].dataset.val===open[1].dataset.val){open.forEach(x=>x.disabled=true);matched+=2;open=[];if(matched===cards.length){const sec=(performance.now()-start)/1000;done(clampN(120-moves*6-sec*2,20,100))}}else{lock=true;later(()=>{open.forEach(x=>x.textContent='?');open=[];lock=false},550)}}})}
function gameTicTacToe(el,seed,done){let board=Array(9).fill(''),over=false,moves=0;const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];const win=p=>wins.some(w=>w.every(i=>board[i]===p));const draw=()=>{el.innerHTML=`<div class="ttt-grid">${board.map((v,i)=>`<button data-ttt="${i}" ${v?'disabled':''}>${v}</button>`).join('')}</div><p class="mini-status">Vos sos X</p>`;$$('[data-ttt]').forEach(b=>b.onclick=()=>player(+b.dataset.ttt))};const player=i=>{if(over||board[i])return;board[i]='X';moves++;if(win('X')){over=true;draw();return done(clampN(105-moves*5,60,100))}if(board.every(Boolean)){over=true;draw();return done(60)}bot()};const bot=()=>{let free=board.map((v,i)=>v?'':i).filter(x=>x!==''),pick=-1;for(const i of free){board[i]='O';if(win('O')){pick=i;board[i]='';break}board[i]=''}if(pick<0)for(const i of free){board[i]='X';if(win('X')){pick=i;board[i]='';break}board[i]=''}if(pick<0&&free.includes(4))pick=4;if(pick<0)pick=free[seededInt(seed+moves,0,free.length-1)];board[pick]='O';if(win('O')){over=true;draw();return done(20)}if(board.every(Boolean)){over=true;draw();return done(60)}draw()};draw()}

// ---------- DUELO DE HABILIDADES ----------
function beginDuel(){clearTimers();fight.phase='duel';fight.round=1;prepareRound()}
function maxUses(a){return RARITY[a.rarity].rank>=3?2:3}
function remainingUses(actor,id){const a=abilityById(id);return maxUses(a)-(actor.uses[id]||0)}
function chooseBotAbility(){const usable=fight.p2.deck.map(abilityById).filter(a=>a&&remainingUses(fight.p2,a.id)>0);if(!usable.length)return abilityById(fight.p2.deck[0]);const sorted=[...usable].sort((a,b)=>effectivePower(b,fight.p2,null)-effectivePower(a,fight.p2,null));const skill=clampN(((state.arena.rating||1000)-700)/2300,.1,.9);return Math.random()<skill?sorted[0]:usable[Math.floor(Math.random()*usable.length)]}
function prepareRound(){
 if(endCheck())return;fight.choice1=null;fight.choice2=null;if(fight.mode==='bot'){fight.choice2=chooseBotAbility();if(fight.choice2){fight.p2.uses[fight.choice2.id]=(fight.p2.uses[fight.choice2.id]||0)+1;fight.p2.history.push(fight.choice2.type)}}fight.localPlayer=1;renderRoundPicker(1);updateFightHud();
}
function renderRoundPicker(player){
 const actor=player===1?fight.p1:fight.p2;$('#arenaPhase').textContent=`RONDA ${fight.round}/${fight.maxRounds}`;
 const boost=player===1?fight.boost1:fight.boost2;
 $('#arenaStage').innerHTML=`<section class="duel-picker"><div class="eyebrow">ELECCIÓN SECRETA · ${esc(actor.name)}</div><h2>Elegí una habilidad</h2><p>Boost actual: <strong>+${boost*4}</strong> de potencia. Cada habilidad tiene cargas limitadas.</p><div class="battle-deck">${actor.deck.map(abilityById).filter(Boolean).map(a=>{const left=remainingUses(actor,a.id);return `<button class="battle-card ${a.rarity}" data-pick="${a.id}" ${left<=0?'disabled':''}>${rarityBadge(a)}<b>${esc(a.name)}</b><span>${a.type} · ${a.power} potencia</span><small>${left} carga${left===1?'':'s'}</small></button>`}).join('')}</div></section>`;
 $$('[data-pick]').forEach(b=>b.onclick=()=>selectAbility(player,b.dataset.pick));
}
function selectAbility(player,id){const actor=player===1?fight.p1:fight.p2;if(remainingUses(actor,id)<=0)return;if(player===1)fight.choice1=abilityById(id);else fight.choice2=abilityById(id);actor.uses[id]=(actor.uses[id]||0)+1;actor.history.push(abilityById(id).type);
 if(fight.mode==='local'&&player===1){
   $('#arenaStage').innerHTML=`<section class="pass-screen"><div class="eyebrow">ELECCIÓN GUARDADA</div><h2>Pasale el dispositivo al Jugador 2</h2><p>Tu habilidad queda oculta hasta que ambos hayan elegido.</p><button class="primary big" id="localPick2">Jugador 2 listo</button></section>`;$('#localPick2').onclick=()=>renderRoundPicker(2);
 }else resolveRound();
}
function categoryMod(a,b){if(TYPE_COUNTER[a.type]===b.type)return 10;if(TYPE_COUNTER[b.type]===a.type)return -8;return 0}
function effectivePower(a,actor,opponent){if(!a)return 0;let p=a.power;const boosts=actor===fight?.p1?fight.boost1:fight.boost2;p+=boosts*4;
 if(opponent){const cm=categoryMod(a,opponent);p+=a.effect==='steady'?Math.max(0,cm):cm;}
 if(a.effect==='first'&&fight.round<=2)p+=5;
 if(a.effect==='fury'&&actor.hp<50)p+=7;
 if(a.effect==='fury2'&&actor.hp<50)p+=15;
 if(a.effect==='pierce'&&opponent?.type==='Defensa')p+=RARITY[a.rarity].rank>=3?9:7;
 if(a.effect==='counter'&&opponent&&TYPE_COUNTER[a.type]===opponent.type)p+=RARITY[a.rarity].rank>=3?10:RARITY[a.rarity].rank===2?7:4;
 if(a.effect==='execute'&&((actor===fight.p1?fight.p2:fight.p1).hp<35))p+=RARITY[a.rarity].rank===4?14:10;
 if(a.effect==='scout'&&opponent){const enemy=actor===fight.p1?fight.p2:fight.p1;if(enemy.history.slice(0,-1).includes(opponent.type))p+=RARITY[a.rarity].rank>=3?8:4}
 return p}
function resolveRound(){
 const a=fight.choice1,b=fight.choice2,p1=effectivePower(a,fight.p1,b),p2=effectivePower(b,fight.p2,a);let text='',dmg=0,winner=0;
 if(p1===p2){fight.p1.hp=Math.max(0,fight.p1.hp-4);fight.p2.hp=Math.max(0,fight.p2.hp-4);text='Choque perfecto: ambos reciben 4 de daño.'}
 else{
  winner=p1>p2?1:2;const winA=winner===1?a:b,winActor=winner===1?fight.p1:fight.p2,loseActor=winner===1?fight.p2:fight.p1;
  dmg=clampN(8+Math.floor(Math.abs(p1-p2)/4),8,28);
  const loserAbility=winner===1?b:a;
  if(loserAbility?.effect==='guard')dmg=Math.max(3,dmg-(RARITY[loserAbility.rarity].rank>=3?9:loserAbility.rarity==='rare'?6:4));
  if(winA.effect==='reflect'&&loserAbility?.type==='Ataque')dmg+=5;
  loseActor.hp=Math.max(0,loseActor.hp-dmg);
  if(winA.effect==='heal')winActor.hp=Math.min(100,winActor.hp+(RARITY[winA.rarity].rank>=3?7:3));
  if(winA.effect==='drain'){if(winner===1&&fight.boost2>0){fight.boost2--;fight.boost1++}if(winner===2&&fight.boost1>0){fight.boost1--;fight.boost2++}}
  if(winA.effect==='drain2'){const n=winner===1?Math.min(2,fight.boost2):Math.min(2,fight.boost1);if(winner===1){fight.boost2-=n;fight.boost1+=n}else{fight.boost1-=n;fight.boost2+=n}}
  text=`${winActor.name} gana el choque e inflige ${dmg} de daño.`;
 }
 updateFightHud();
 $('#arenaStage').innerHTML=`<section class="clash-result"><div class="eyebrow">RONDA ${fight.round}</div><div class="clash-cards"><article>${rarityBadge(a)}<h3>${esc(a.name)}</h3><strong>${p1}</strong><small>${esc(fight.p1.name)}</small></article><b>VS</b><article>${rarityBadge(b)}<h3>${esc(b.name)}</h3><strong>${p2}</strong><small>${esc(fight.p2.name)}</small></article></div><h2>${esc(text)}</h2><p>${a.type} ${TYPE_COUNTER[a.type]===b.type?'tenía ventaja sobre':''} ${b.type}</p><button class="primary big" id="nextRoundBattle">${endCheck(true)?'Ver resultado':'Siguiente ronda'}</button></section>`;
 $('#nextRoundBattle').onclick=()=>{if(endCheck())return;fight.round++;prepareRound()};
}
function updateFightHud(){if(!fight)return;$('#fightP1Name').textContent=fight.p1.name;$('#fightP2Name').textContent=fight.p2.name;$('#fightP1Hp').style.width=`${fight.p1.hp}%`;$('#fightP2Hp').style.width=`${fight.p2.hp}%`;$('#fightP1HpText').textContent=fight.p1.hp;$('#fightP2HpText').textContent=fight.p2.hp;$('#fightP1Boost').textContent=`+${fight.boost1*4}`;$('#fightP2Boost').textContent=`+${fight.boost2*4}`}
function endCheck(peek=false){if(!fight)return true;const ended=fight.p1.hp<=0||fight.p2.hp<=0||fight.round>fight.maxRounds||(fight.round===fight.maxRounds&&fight.choice1&&fight.choice2);if(!ended)return false;if(peek)return true;finishBattle();return true}
function finishBattle(){
 if(fight.finished)return;fight.finished=true;let winner=fight.p1.hp===fight.p2.hp?0:(fight.p1.hp>fight.p2.hp?1:2);const p1Won=winner===1;
 state.economy=state.economy||{coins:0};const coins=winner===0?4:p1Won?10:2;state.economy.coins=(state.economy.coins||0)+coins;
 state.arena=state.arena||{rating:1000,wins:0,losses:0,streak:0};
 if(winner===1){state.arena.wins=(state.arena.wins||0)+1;state.arena.streak=(state.arena.streak||0)+1;state.arena.rating=Math.min(3000,(state.arena.rating||1000)+(fight.mode==='bot'?18:10))}
 else if(winner===2){state.arena.losses=(state.arena.losses||0)+1;state.arena.streak=0;state.arena.rating=Math.max(700,(state.arena.rating||1000)-12)}
 state.arena2.battleHistory.unshift({at:new Date().toISOString(),mode:fight.mode,winner,hp1:fight.p1.hp,hp2:fight.p2.hp,boost1:fight.boost1,boost2:fight.boost2,coins});state.arena2.battleHistory=state.arena2.battleHistory.slice(0,30);save();
 $('#battleResultPanel').classList.remove('hidden');$('#battleResultPanel').innerHTML=`<div class="eyebrow">COMBATE FINALIZADO</div><h1>${winner===0?'EMPATE':p1Won?'VICTORIA EN EL COLISEO':'DERROTA'}</h1><p>${esc(fight.p1.name)} ${fight.p1.hp} HP · ${esc(fight.p2.name)} ${fight.p2.hp} HP</p><strong>+${coins} monedas</strong><button class="primary big" id="closeResultBtn">Volver a Arena</button>`;$('#closeResultBtn').onclick=closeCombat;renderAll();
}
function closeCombat(){clearTimers();fight=null;$('#arenaCombatOverlay').classList.add('hidden')}

function bind(){
 $('#startBotBattleBtn').onclick=()=>startBattle('bot');
 $('#startLocalBattleBtn').onclick=()=>startBattle('local');
 $('#onlineBattleBtn').onclick=()=>{$('#onlineBattleMessage').textContent='El duelo entre dos dispositivos necesita cuentas, servidor y sincronización en tiempo real. La interfaz está preparada, pero no se simulan rivales online.';$('#onlineBattleMessage').className='quiz-feedback system-important-alert'};
 $('#closeArenaCombat').onclick=closeCombat;$('#closeRewardBtn').onclick=()=>$('#arenaRewardOverlay').classList.add('hidden');
}
function init(){ensureArena();renderAll();bind();document.body.classList.add('arena-v2-ready')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
