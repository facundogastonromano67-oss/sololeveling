const $=(s)=>document.querySelector(s);
const storeKey='vidaRpgStateV2';
const legacyKey='vidaRpgStateV1';
const todayKey=()=>new Date().toISOString().slice(0,10);
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const rank=(n)=>n>=91?'Trascendente':n>=81?'Mítico':n>=71?'Legendario':n>=61?'Maestro':n>=51?'Diamante':n>=41?'Platino':n>=31?'Oro':n>=21?'Plata':n>=11?'Bronce':'Novato';

const skillMap={
  Intelecto:['Inteligencia aplicada','Conocimiento','Aprendizaje','Resolución de problemas','Creatividad'],
  Carisma:['Comunicación','Habilidades sociales','Liderazgo','Control emocional','Integridad / valores'],
  Rendimiento:['Disciplina','Constancia','Organización','Productividad','Finanzas personales'],
  Físico:['Fuerza','Resistencia','Velocidad / Potencia','Movilidad','Salud física']
};

const icons={Intelecto:'🧠',Carisma:'✨',Rendimiento:'⚡',Físico:'💪'};

const facuSkillSeed={
  'Inteligencia aplicada':55,'Conocimiento':60,'Aprendizaje':65,'Resolución de problemas':65,'Creatividad':65,
  'Comunicación':60,'Habilidades sociales':40,'Liderazgo':40,'Control emocional':45,'Integridad / valores':70,
  'Disciplina':80,'Constancia':50,'Organización':85,'Productividad':70,'Finanzas personales':70,
  'Fuerza':31,'Resistencia':43,'Velocidad / Potencia':70,'Movilidad':80,'Salud física':80
};

const freshDefaults={
  version:2,
  onboardingComplete:false,
  player:{name:'Jugador',age:null,height:null,weight:null,createdAt:null},
  avatar:'',
  baseSkills:Object.fromEntries(Object.values(skillMap).flat().map(k=>[k,50])),
  strengthAssessment:50,
  useMeasuredStrength:false,
  strength:[
    {name:'Ejercicio de fuerza 1',current:0,max:100},
    {name:'Ejercicio de fuerza 2',current:0,max:100},
    {name:'Ejercicio de fuerza 3',current:0,max:100},
    {name:'Ejercicio de fuerza 4',current:0,max:100},
    {name:'Ejercicio de fuerza 5',current:0,max:100},
    {name:'Ejercicio de fuerza 6',current:0,max:100}
  ],
  reminderTime:'21:00',
  reminderText:'Completá tu registro de Vida RPG',
  days:{},
  bestStreak:0
};

function clone(x){return structuredClone(x)}

function migrateLegacy(old){
  const s=clone(freshDefaults);
  s.onboardingComplete=true;
  s.player.name=old.playerName||'Facu';
  s.avatar=old.avatar||'';
  s.reminderTime=old.reminderTime||'21:00';
  s.reminderText=old.reminderText||freshDefaults.reminderText;
  s.days=old.days||{};
  s.bestStreak=old.bestStreak||0;

  const attrs=old.baseAttributes||old.attributes||{Intelecto:58,Carisma:55,Rendimiento:71,Físico:62};
  Object.entries(skillMap).forEach(([attr,skills])=>{
    const base=Number(attrs[attr]??50);
    skills.forEach(skill=>s.baseSkills[skill]=base);
  });

  if((old.playerName||'Facu').toLowerCase().includes('facu')) Object.assign(s.baseSkills,facuSkillSeed);

  if(Array.isArray(old.strength)&&old.strength.length){
    s.strength=old.strength;
    s.useMeasuredStrength=true;
  }

  if(old.physicalSkills){
    s.baseSkills['Resistencia']=Number(old.physicalSkills.Resistencia??s.baseSkills['Resistencia']);
    s.baseSkills['Velocidad / Potencia']=Number(old.physicalSkills.Potencia??s.baseSkills['Velocidad / Potencia']);
    s.baseSkills['Movilidad']=Number(old.physicalSkills.Movilidad??s.baseSkills['Movilidad']);
    s.baseSkills['Salud física']=Number(old.physicalSkills.Salud??s.baseSkills['Salud física']);
  }
  return s;
}

function load(){
  try{
    const v2=localStorage.getItem(storeKey);
    if(v2){
      const saved=JSON.parse(v2);
      return {
        ...clone(freshDefaults),
        ...saved,
        player:{...freshDefaults.player,...(saved.player||{})},
        baseSkills:{...freshDefaults.baseSkills,...(saved.baseSkills||{})},
        days:saved.days||{}
      };
    }
    const legacy=localStorage.getItem(legacyKey);
    if(legacy){
      const migrated=migrateLegacy(JSON.parse(legacy));
      localStorage.setItem(storeKey,JSON.stringify(migrated));
      return migrated;
    }
  }catch(e){console.warn('No se pudo cargar el estado',e)}
  return clone(freshDefaults);
}

let state=load();

function save(){
  localStorage.setItem(storeKey,JSON.stringify(state));
  render();
}

function inferSkill(t){
  if(t.skill && Object.values(skillMap).flat().includes(t.skill)) return t.skill;
  const text=(t.text||'').toLowerCase();
  if(t.category==='Rendimiento'){
    if(text.includes('finanz')) return 'Finanzas personales';
    if(text.includes('lista')||text.includes('organ')) return 'Organización';
    return 'Disciplina';
  }
  if(t.category==='Intelecto'){
    if(text.includes('problema')||text.includes('resolver')) return 'Resolución de problemas';
    if(text.includes('aprend')) return 'Aprendizaje';
    return 'Conocimiento';
  }
  if(t.category==='Carisma'){
    if(text.includes('deleg')||text.includes('lider')) return 'Liderazgo';
    if(text.includes('comunic')) return 'Comunicación';
    return 'Habilidades sociales';
  }
  if(t.category==='Físico'){
    if(text.includes('entren')||text.includes('gym')||text.includes('gimnas')) return 'Salud física';
    return 'Resistencia';
  }
  return 'Disciplina';
}

function seedTasks(){return[
  {id:crypto.randomUUID(),text:'Hacer lista diaria',category:'Rendimiento',skill:'Organización',xp:2,done:false,custom:false},
  {id:crypto.randomUUID(),text:'Registrar finanzas',category:'Rendimiento',skill:'Finanzas personales',xp:2,done:false,custom:false},
  {id:crypto.randomUUID(),text:'Cumplir entrenamiento planificado',category:'Físico',skill:'Salud física',xp:3,done:false,custom:false},
  {id:crypto.randomUUID(),text:'Resolver un problema importante',category:'Intelecto',skill:'Resolución de problemas',xp:5,done:false,custom:false},
  {id:crypto.randomUUID(),text:'Delegar o dar seguimiento a una tarea',category:'Carisma',skill:'Liderazgo',xp:3,done:false,custom:false}
]}

function getDay(){
  const k=todayKey();
  if(!state.days[k]) state.days[k]={tasks:seedTasks(),checkin:{}};
  state.days[k].tasks=(state.days[k].tasks||[]).map(t=>({...t,skill:inferSkill(t)}));
  state.days[k].checkin=state.days[k].checkin||{};
  return state.days[k];
}

function allDoneTasks(){
  const out=[];
  Object.entries(state.days).forEach(([date,day])=>{
    (day.tasks||[]).forEach(t=>{if(t.done) out.push({...t,date,skill:inferSkill(t)})});
  });
  return out;
}

function xpBySkill(){
  const totals=Object.fromEntries(Object.values(skillMap).flat().map(k=>[k,0]));
  allDoneTasks().forEach(t=>{if(totals[t.skill]!==undefined) totals[t.skill]+=Number(t.xp)||0});
  return totals;
}

function xpNeeded(score){
  if(score<40) return 8;
  if(score<60) return 10;
  if(score<75) return 14;
  if(score<90) return 20;
  return 30;
}

function skillProgress(base,xp){
  let score=clamp(Math.round(Number(base)||0));
  let remaining=Math.max(0,Number(xp)||0);
  let guard=0;
  while(score<100 && remaining>=xpNeeded(score) && guard<100){
    remaining-=xpNeeded(score);
    score++;
    guard++;
  }
  return {score,currentXp:remaining,needed:score>=100?0:xpNeeded(score)};
}

function measuredStrengthRows(){
  return (state.strength||[]).filter(x=>Number(x.max)>0 && Number(x.current)>0);
}

function rawForceScore(){
  const valid=measuredStrengthRows();
  if(!valid.length) return 0;
  const scores=valid.map(x=>clamp((Number(x.current)||0)/Number(x.max)*100));
  return Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
}

function baseSkillScore(skill){
  if(skill==='Fuerza') return state.useMeasuredStrength && measuredStrengthRows().length ? rawForceScore() : clamp(Number(state.strengthAssessment)||50);
  return clamp(Number(state.baseSkills[skill])||50);
}

function effectiveSkillData(){
  const xp=xpBySkill();
  const out={};
  Object.values(skillMap).flat().forEach(skill=>{
    out[skill]={...skillProgress(baseSkillScore(skill),xp[skill]),totalXp:xp[skill],base:baseSkillScore(skill)};
  });
  return out;
}

function effectiveAttributes(){
  const skills=effectiveSkillData();
  const out={};
  Object.entries(skillMap).forEach(([attr,names])=>{
    out[attr]=Math.round(names.reduce((s,n)=>s+skills[n].score,0)/names.length);
  });
  return out;
}

function generalLevel(){
  const a=Object.values(effectiveAttributes());
  return Math.round(a.reduce((x,y)=>x+y,0)/a.length);
}

function categoryXpForDay(day){
  const out={Intelecto:0,Carisma:0,Rendimiento:0,Físico:0};
  (day.tasks||[]).forEach(t=>{if(t.done && out[t.category]!==undefined) out[t.category]+=Number(t.xp)||0});
  return out;
}

function dayXp(day){return (day.tasks||[]).filter(t=>t.done).reduce((s,t)=>s+(Number(t.xp)||0),0)}

function render(){
  renderProfile();
  renderAttributes();
  renderTasks();
  renderSkills();
  renderCheckin();
  renderStrength();
  renderHistory();
  renderAchievements();
  updateSkillSelect();
  if(!state.onboardingComplete) openOnboarding(false);
}

function renderProfile(){
  $('#playerName').value=state.player.name||'Jugador';
  const gl=generalLevel();
  $('#generalLevel').textContent=gl;
  $('#generalBar').style.width=gl+'%';
  $('#rankPill').textContent=rank(gl);
  $('#todayLabel').textContent=new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  const meta=[];
  if(state.player.age) meta.push(`${state.player.age} años`);
  if(state.player.height) meta.push(`${state.player.height} cm`);
  if(state.player.weight) meta.push(`${state.player.weight} kg`);
  $('#profileMeta').textContent=meta.join(' · ');
  if(state.avatar) $('#avatar').src=state.avatar; else $('#avatar').removeAttribute('src');
}

function renderAttributes(){
  const attrs=effectiveAttributes();
  const skillXp=xpBySkill();
  $('#attributesGrid').innerHTML=Object.entries(attrs).map(([k,v])=>{
    const xp=skillMap[k].reduce((s,n)=>s+skillXp[n],0);
    return `<div class="attribute-card"><div class="small">${icons[k]} ${k}</div><div class="score">${v}</div><div class="progress"><span style="width:${v}%"></span></div><div class="small">${rank(v)} · ${xp} XP total</div></div>`;
  }).join('');
}

function renderTasks(){
  const day=getDay();
  $('#dailyTasks').innerHTML=day.tasks.map(t=>`
    <div class="task ${t.done?'done':''}">
      <input type="checkbox" data-id="${t.id}" ${t.done?'checked':''}>
      <div><div class="task-title">${escapeHtml(t.text)}</div><div class="task-meta">${escapeHtml(t.skill||inferSkill(t))}</div></div>
      <span class="tag">${t.category}</span>
      <span class="task-xp">+${t.xp} XP</span>
      ${t.custom?`<button class="delete-task" data-del="${t.id}" aria-label="Eliminar">×</button>`:''}
    </div>`).join('');
  $('#todayXp').textContent=dayXp(day);
}

function renderSkills(){
  const data=effectiveSkillData();
  $('#skillsGrid').innerHTML=Object.entries(skillMap).map(([attr,names])=>`
    <section class="skill-group"><h3>${icons[attr]} ${attr}</h3>${names.map(name=>{
      const d=data[name];
      const pct=d.needed?clamp(d.currentXp/d.needed*100):100;
      return `<div class="skill-row"><div class="skill-top"><span>${escapeHtml(name)}</span><strong>${d.score}</strong></div><div class="skill-xp">${d.score>=100?'Nivel máximo':`${d.currentXp}/${d.needed} XP para subir · ${d.totalXp} XP histórico`}</div><div class="progress"><span style="width:${pct}%"></span></div></div>`;
    }).join('')}</section>`).join('');
}

function renderCheckin(){
  const d=getDay();
  $('#sleepHours').value=d.checkin.sleepHours??'';
  $('#energy').value=d.checkin.energy??'';
  $('#mood').value=d.checkin.mood??'';
  $('#dayNote').value=d.checkin.note??'';
  $('#reminderTime').value=state.reminderTime||'21:00';
  $('#reminderText').value=state.reminderText||freshDefaults.reminderText;
}

function renderStrength(){
  const scores=(state.strength||[]).map(x=>Number(x.max)>0?clamp((Number(x.current)||0)/Number(x.max)*100):0);
  $('#forceScore').textContent=Math.round(baseSkillScore('Fuerza'));
  $('#strengthModeNote').textContent=state.useMeasuredStrength && measuredStrengthRows().length
    ?'La Fuerza se calcula con los ejercicios que tengan peso actual cargado. Podés editar nombre y referencia para adaptarlos a cada usuario.'
    :'Todavía se usa tu autoevaluación inicial de Fuerza. Al cargar pesos, la app empieza a usar esas métricas.';
  $('#strengthTable').innerHTML=(state.strength||[]).map((x,i)=>`
    <tr>
      <td><input class="exercise-name" type="text" data-strength-name="${i}" value="${escapeHtml(x.name)}"></td>
      <td><input type="number" min="0" step="2.5" data-strength="${i}" value="${x.current}"> kg</td>
      <td><input type="number" min="1" step="2.5" data-strength-max="${i}" value="${x.max}"> kg</td>
      <td>${Math.round(scores[i])}</td>
    </tr>`).join('');
}

function datesWithin(days){
  const cutoff=new Date();
  cutoff.setHours(0,0,0,0);
  cutoff.setDate(cutoff.getDate()-(days-1));
  return Object.entries(state.days).filter(([k])=>new Date(k+'T12:00:00')>=cutoff);
}

function summaryFor(days){
  const entries=datesWithin(days);
  return {xp:entries.reduce((s,[,d])=>s+dayXp(d),0),tasks:entries.reduce((s,[,d])=>s+(d.tasks||[]).filter(t=>t.done).length,0)};
}

function completedDayKeys(){return Object.keys(state.days).filter(k=>state.days[k].tasks?.some(t=>t.done)).sort()}

function streaks(){
  const keys=completedDayKeys();
  if(!keys.length) return {current:0,best:state.bestStreak||0};
  let best=0,run=0,prev=null;
  keys.forEach(k=>{
    const d=new Date(k+'T12:00:00');
    if(prev && (d-prev)/86400000===1) run++; else run=1;
    best=Math.max(best,run); prev=d;
  });
  const set=new Set(keys);
  let cur=0,d=new Date();
  for(;;){
    const k=d.toISOString().slice(0,10);
    if(set.has(k)){cur++;d.setDate(d.getDate()-1)} else break;
  }
  state.bestStreak=Math.max(state.bestStreak||0,best);
  return {current:cur,best:state.bestStreak};
}

function formatDate(k){return new Intl.DateTimeFormat('es-AR',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date(k+'T12:00:00'))}

function renderHistory(){
  const week=summaryFor(7),month=summaryFor(30),st=streaks();
  $('#weekXp').textContent=`${week.xp} XP`;
  $('#weekTasks').textContent=`${week.tasks} tareas`;
  $('#monthXp').textContent=`${month.xp} XP`;
  $('#monthTasks').textContent=`${month.tasks} tareas`;
  $('#streak').textContent=`${st.current} días`;
  $('#bestStreak').textContent=`${st.best} días`;
  $('#tasksCompleted').textContent=`${allDoneTasks().length} tareas totales`;

  const entries=Object.entries(state.days).sort(([a],[b])=>b.localeCompare(a));
  $('#historyList').innerHTML=entries.length?entries.map(([date,day])=>{
    const done=(day.tasks||[]).filter(t=>t.done);
    const xp=dayXp(day);
    const cats=categoryXpForDay(day);
    const catText=Object.entries(cats).filter(([,v])=>v>0).map(([k,v])=>`${k} +${v}`).join(' · ');
    const c=day.checkin||{};
    const check=[c.sleepHours?`Sueño ${c.sleepHours}h`:null,c.energy?`Energía ${c.energy}/10`:null,c.mood?`Ánimo ${c.mood}/10`:null].filter(Boolean).join(' · ');
    return `<article class="history-day"><div class="history-head"><div><strong>${formatDate(date)}</strong><small>${done.length}/${(day.tasks||[]).length} tareas · ${catText||'Sin XP'}</small></div><span class="xp-badge">${xp} XP</span></div><div class="history-body">${done.length?`<div class="history-tasks">${done.map(t=>`<div class="history-task"><span>✓ ${escapeHtml(t.text)} <small>· ${escapeHtml(inferSkill(t))}</small></span><strong>+${t.xp}</strong></div>`).join('')}</div>`:'<div class="history-empty">No hubo tareas completadas.</div>'}${(check||c.note)?`<div class="history-checkin">${check}${c.note?`${check?' · ':''}${escapeHtml(c.note)}`:''}</div>`:''}</div></article>`;
  }).join(''):'<div class="history-empty">Todavía no hay días registrados.</div>';
}

function renderAchievements(){
  const count=allDoneTasks().length;
  const st=streaks();
  const gl=generalLevel();
  const totalXp=Object.values(xpBySkill()).reduce((a,b)=>a+b,0);
  const a=[
    ['Primer paso','Completar 1 tarea',count>=1],
    ['En marcha','Completar 10 tareas',count>=10],
    ['Centurión','Completar 100 tareas',count>=100],
    ['Racha x7','Registrar actividad 7 días seguidos',st.best>=7],
    ['100 XP','Acumular 100 XP',totalXp>=100],
    ['Nivel 70','Llegar a nivel general 70',gl>=70]
  ];
  $('#achievements').innerHTML=a.map(x=>`<div class="achievement ${x[2]?'':'locked'}"><strong>${x[2]?'🏆':'🔒'} ${x[0]}</strong><span class="muted">${x[1]}</span></div>`).join('');
}

function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}

function updateSkillSelect(){
  const attr=$('#newTaskCategory').value;
  const current=$('#newTaskSkill').value;
  $('#newTaskSkill').innerHTML=skillMap[attr].map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  if(skillMap[attr].includes(current)) $('#newTaskSkill').value=current;
}

$('#newTaskCategory').addEventListener('change',updateSkillSelect);
$('#playerName').addEventListener('change',e=>{state.player.name=e.target.value.trim()||'Jugador';save()});
$('#avatarInput').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{state.avatar=r.result;save()};r.readAsDataURL(f)});
$('#dailyTasks').addEventListener('change',e=>{if(e.target.matches('input[type=checkbox]')){const t=getDay().tasks.find(x=>x.id===e.target.dataset.id);if(t){t.done=e.target.checked;save()}}});
$('#dailyTasks').addEventListener('click',e=>{const id=e.target.dataset.del;if(id){getDay().tasks=getDay().tasks.filter(t=>t.id!==id);save()}});
$('#addTaskForm').addEventListener('submit',e=>{
  e.preventDefault();
  const text=$('#newTaskText').value.trim();if(!text)return;
  getDay().tasks.push({id:crypto.randomUUID(),text,category:$('#newTaskCategory').value,skill:$('#newTaskSkill').value,xp:+$('#newTaskXp').value||1,done:false,custom:true});
  $('#newTaskText').value='';save();
});
$('#saveCheckin').addEventListener('click',()=>{
  const d=getDay();
  d.checkin={sleepHours:+$('#sleepHours').value||null,energy:+$('#energy').value||null,mood:+$('#mood').value||null,note:$('#dayNote').value.trim()};
  save();alert('Check-in guardado');
});
$('#strengthTable').addEventListener('change',e=>{
  if(e.target.dataset.strength!==undefined){
    state.strength[+e.target.dataset.strength].current=+e.target.value||0;
    if(+e.target.value>0) state.useMeasuredStrength=true;
    save();
  }else if(e.target.dataset.strengthMax!==undefined){
    state.strength[+e.target.dataset.strengthMax].max=Math.max(1,+e.target.value||1);save();
  }else if(e.target.dataset.strengthName!==undefined){
    state.strength[+e.target.dataset.strengthName].name=e.target.value.trim()||`Ejercicio ${+e.target.dataset.strengthName+1}`;save();
  }
});

function ratingToScore(n){return clamp(20+(Number(n)||5)*6)}

function healthScore(){
  const subjective=ratingToScore($('#obHealth').value);
  const sleep=Number($('#obSleep').value)||7;
  const sleepScore=clamp(100-Math.abs(8-sleep)*15,20,100);
  const training=Number($('#obTrainingDays').value)||0;
  const activityScore=clamp(35+training*10,25,90);
  return Math.round(subjective*.5+sleepScore*.3+activityScore*.2);
}

function openOnboarding(canCancel=true){
  $('#onboardingOverlay').classList.remove('hidden');
  $('#cancelOnboarding').classList.toggle('hidden',!canCancel);
  $('#obName').value=state.player.name==='Jugador'?'':state.player.name||'';
  $('#obAge').value=state.player.age??'';
  $('#obHeight').value=state.player.height??'';
  $('#obWeight').value=state.player.weight??'';
}
function closeOnboarding(){$('#onboardingOverlay').classList.add('hidden')}
$('#recalibrateBtn').addEventListener('click',()=>openOnboarding(true));
$('#cancelOnboarding').addEventListener('click',closeOnboarding);

const rangePairs=[
  ['obLearning','vLearning'],['obProblem','vProblem'],['obKnowledge','vKnowledge'],['obCreativity','vCreativity'],
  ['obCommunication','vCommunication'],['obSocial','vSocial'],['obLeadership','vLeadership'],['obEmotional','vEmotional'],['obIntegrity','vIntegrity'],
  ['obDiscipline','vDiscipline'],['obConsistency','vConsistency'],['obOrganization','vOrganization'],['obProductivity','vProductivity'],['obFinance','vFinance'],
  ['obStrength','vStrength'],['obEndurance','vEndurance'],['obPower','vPower'],['obMobility','vMobility'],['obHealth','vHealth']
];
rangePairs.forEach(([input,label])=>{$('#'+input).addEventListener('input',e=>$('#'+label).textContent=e.target.value)});

$('#onboardingForm').addEventListener('submit',e=>{
  e.preventDefault();
  state.player={name:$('#obName').value.trim()||'Jugador',age:+$('#obAge').value||null,height:+$('#obHeight').value||null,weight:+$('#obWeight').value||null,createdAt:state.player.createdAt||new Date().toISOString()};
  const learning=ratingToScore($('#obLearning').value),problem=ratingToScore($('#obProblem').value),knowledge=ratingToScore($('#obKnowledge').value);
  state.baseSkills={
    'Inteligencia aplicada':Math.round((learning+problem)/2),'Conocimiento':knowledge,'Aprendizaje':learning,'Resolución de problemas':problem,'Creatividad':ratingToScore($('#obCreativity').value),
    'Comunicación':ratingToScore($('#obCommunication').value),'Habilidades sociales':ratingToScore($('#obSocial').value),'Liderazgo':ratingToScore($('#obLeadership').value),'Control emocional':ratingToScore($('#obEmotional').value),'Integridad / valores':ratingToScore($('#obIntegrity').value),
    'Disciplina':ratingToScore($('#obDiscipline').value),'Constancia':ratingToScore($('#obConsistency').value),'Organización':ratingToScore($('#obOrganization').value),'Productividad':ratingToScore($('#obProductivity').value),'Finanzas personales':ratingToScore($('#obFinance').value),
    'Fuerza':ratingToScore($('#obStrength').value),'Resistencia':ratingToScore($('#obEndurance').value),'Velocidad / Potencia':ratingToScore($('#obPower').value),'Movilidad':ratingToScore($('#obMobility').value),'Salud física':healthScore()
  };
  state.strengthAssessment=state.baseSkills['Fuerza'];
  if(!state.onboardingComplete) state.useMeasuredStrength=false;
  state.onboardingComplete=true;
  save();closeOnboarding();alert(`Personaje creado: nivel ${generalLevel()} · ${rank(generalLevel())}`);
});

let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});
$('#installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden')});

async function enableNotifications(){
  if(!('Notification' in window)){alert('Este navegador no soporta notificaciones.');return}
  const p=await Notification.requestPermission();if(p!=='granted'){alert('No se habilitaron las notificaciones.');return}
  state.reminderTime=$('#reminderTime').value;state.reminderText=$('#reminderText').value.trim()||freshDefaults.reminderText;save();scheduleReminder();alert('Recordatorio activado para esta sesión.');
}
$('#enableNotifications').addEventListener('click',enableNotifications);
function scheduleReminder(){
  clearTimeout(window.__rpgReminder);if(Notification.permission!=='granted')return;
  const [h,m]=(state.reminderTime||'21:00').split(':').map(Number);const now=new Date(),target=new Date();target.setHours(h,m,0,0);if(target<=now)target.setDate(target.getDate()+1);
  window.__rpgReminder=setTimeout(async()=>{if('serviceWorker' in navigator){const reg=await navigator.serviceWorker.ready;reg.showNotification('Vida RPG',{body:state.reminderText,icon:'icon-192.svg',badge:'icon-192.svg'})}else new Notification('Vida RPG',{body:state.reminderText});scheduleReminder()},target-now);
}
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').then(()=>{if(Notification.permission==='granted')scheduleReminder()})}

render();
