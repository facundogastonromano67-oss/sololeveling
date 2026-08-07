const $ = (s)=>document.querySelector(s);
const storeKey='vidaRpgStateV1';
const todayKey=()=>new Date().toISOString().slice(0,10);
const rank=(n)=> n>=91?'Trascendente':n>=81?'Mítico':n>=71?'Legendario':n>=61?'Maestro':n>=51?'Diamante':n>=41?'Platino':n>=31?'Oro':n>=21?'Plata':n>=11?'Bronce':'Novato';

const defaults={
  playerName:'Facu', avatar:'', reminderTime:'21:00', reminderText:'Completá tu registro de Vida RPG',
  attributes:{Intelecto:58,Carisma:55,Rendimiento:71,Físico:62},
  strength:[
    {name:'Pecho plano máquina',current:45,max:100},
    {name:'Apertura de pecho',current:15,max:80},
    {name:'Hombro cerrado',current:20,max:60},
    {name:'Hombro abierto',current:15,max:60},
    {name:'Jalón cerrado',current:35,max:90},
    {name:'Jalón abierto',current:25,max:90},
  ],
  days:{}, bestStreak:0,
};
function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(storeKey)||'{}')}}catch{return structuredClone(defaults)}}
let state=load();
function save(){localStorage.setItem(storeKey,JSON.stringify(state));render()}
function getDay(){const k=todayKey(); if(!state.days[k]) state.days[k]={tasks:seedTasks(),checkin:{}}; return state.days[k]}
function seedTasks(){return [
  {id:crypto.randomUUID(),text:'Hacer lista diaria',category:'Rendimiento',xp:2,done:false,custom:false},
  {id:crypto.randomUUID(),text:'Registrar finanzas',category:'Rendimiento',xp:2,done:false,custom:false},
  {id:crypto.randomUUID(),text:'Cumplir entrenamiento planificado',category:'Físico',xp:3,done:false,custom:false},
  {id:crypto.randomUUID(),text:'Resolver un problema importante',category:'Intelecto',xp:5,done:false,custom:false},
  {id:crypto.randomUUID(),text:'Delegar o dar seguimiento a una tarea',category:'Carisma',xp:3,done:false,custom:false},
]}
function generalLevel(){const a=Object.values(state.attributes);return Math.round(a.reduce((x,y)=>x+y,0)/a.length)}
function render(){
  $('#playerName').value=state.playerName;
  const gl=generalLevel(); $('#generalLevel').textContent=gl; $('#generalBar').style.width=gl+'%'; $('#rankPill').textContent=rank(gl);
  $('#todayLabel').textContent=new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  const icons={Intelecto:'🧠',Carisma:'✨',Rendimiento:'⚡',Físico:'💪'};
  $('#attributesGrid').innerHTML=Object.entries(state.attributes).map(([k,v])=>`<div class="attribute-card"><div class="small">${icons[k]} ${k}</div><div class="score">${v}</div><div class="progress"><span style="width:${v}%"></span></div><div class="small">${rank(v)}</div></div>`).join('');
  if(state.avatar) $('#avatar').src=state.avatar; else $('#avatar').removeAttribute('src');
  const day=getDay();
  $('#dailyTasks').innerHTML=day.tasks.map(t=>`<div class="task ${t.done?'done':''}"><input type="checkbox" data-id="${t.id}" ${t.done?'checked':''}><div class="task-title">${escapeHtml(t.text)}</div><span class="tag">${t.category}</span><span class="task-xp">+${t.xp} XP</span>${t.custom?`<button class="delete-task" data-del="${t.id}">×</button>`:''}</div>`).join('');
  $('#todayXp').textContent=day.tasks.filter(t=>t.done).reduce((s,t)=>s+t.xp,0);
  $('#sleepHours').value=day.checkin.sleepHours??''; $('#energy').value=day.checkin.energy??''; $('#mood').value=day.checkin.mood??''; $('#dayNote').value=day.checkin.note??'';
  $('#reminderTime').value=state.reminderTime||'21:00'; $('#reminderText').value=state.reminderText||'Completá tu registro de Vida RPG';
  renderStrength(); renderStats(); renderAchievements();
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
function renderStrength(){
  const scores=state.strength.map(x=>Math.max(0,Math.min(100,(x.current/x.max)*100)));
  const avg=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length); $('#forceScore').textContent=avg;
  $('#strengthTable').innerHTML=state.strength.map((x,i)=>`<tr><td>${x.name}</td><td><input type="number" min="0" step="2.5" data-strength="${i}" value="${x.current}"> kg</td><td>${x.max} kg</td><td>${Math.round(scores[i])}</td></tr>`).join('');
}
function completedDayKeys(){return Object.keys(state.days).filter(k=>state.days[k].tasks?.some(t=>t.done)).sort()}
function streaks(){
  const keys=completedDayKeys(); if(!keys.length) return {current:0,best:state.bestStreak||0};
  let best=0,run=0,prev=null;
  keys.forEach(k=>{const d=new Date(k+'T12:00:00'); if(prev && (d-prev)/86400000===1) run++; else run=1; best=Math.max(best,run); prev=d});
  const set=new Set(keys); let cur=0; let d=new Date(); for(;;){const k=d.toISOString().slice(0,10); if(set.has(k)){cur++;d.setDate(d.getDate()-1)} else break}
  state.bestStreak=Math.max(state.bestStreak||0,best); return {current:cur,best:state.bestStreak};
}
function renderStats(){const s=streaks(); $('#streak').textContent=s.current+' días'; $('#bestStreak').textContent=s.best+' días'; $('#tasksCompleted').textContent=Object.values(state.days).flatMap(d=>d.tasks||[]).filter(t=>t.done).length}
function renderAchievements(){
  const count=Object.values(state.days).flatMap(d=>d.tasks||[]).filter(t=>t.done).length; const st=streaks(); const force=Math.round(state.strength.reduce((s,x)=>s+(x.current/x.max)*100,0)/state.strength.length);
  const a=[
    ['Primer paso','Completar 1 tarea',count>=1],['En marcha','Completar 10 tareas',count>=10],['Racha x7','Registrar actividad 7 días seguidos',st.best>=7],['Fuerza 40','Llegar a 40/100 en fuerza',force>=40]
  ];
  $('#achievements').innerHTML=a.map(x=>`<div class="achievement ${x[2]?'':'locked'}"><strong>${x[2]?'🏆':'🔒'} ${x[0]}</strong><span class="muted">${x[1]}</span></div>`).join('')
}

$('#playerName').addEventListener('change',e=>{state.playerName=e.target.value.trim()||'Jugador';save()});
$('#avatarInput').addEventListener('change',e=>{const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{state.avatar=r.result;save()}; r.readAsDataURL(f)});
$('#dailyTasks').addEventListener('change',e=>{if(e.target.matches('input[type=checkbox]')){const t=getDay().tasks.find(x=>x.id===e.target.dataset.id); if(t){t.done=e.target.checked;save()}}});
$('#dailyTasks').addEventListener('click',e=>{const id=e.target.dataset.del;if(id){getDay().tasks=getDay().tasks.filter(t=>t.id!==id);save()}});
$('#addTaskForm').addEventListener('submit',e=>{e.preventDefault();const text=$('#newTaskText').value.trim();if(!text)return;getDay().tasks.push({id:crypto.randomUUID(),text,category:$('#newTaskCategory').value,xp:+$('#newTaskXp').value||1,done:false,custom:true});$('#newTaskText').value='';save()});
$('#saveCheckin').addEventListener('click',()=>{const d=getDay();d.checkin={sleepHours:+$('#sleepHours').value||null,energy:+$('#energy').value||null,mood:+$('#mood').value||null,note:$('#dayNote').value.trim()};save();alert('Check-in guardado')});
$('#strengthTable').addEventListener('change',e=>{if(e.target.dataset.strength!==undefined){state.strength[+e.target.dataset.strength].current=+e.target.value||0;save()}});

let deferredPrompt=null; window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});
$('#installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden')});

async function enableNotifications(){
  if(!('Notification' in window)){alert('Este navegador no soporta notificaciones.');return}
  const p=await Notification.requestPermission(); if(p!=='granted'){alert('No se habilitaron las notificaciones.');return}
  state.reminderTime=$('#reminderTime').value;state.reminderText=$('#reminderText').value.trim()||'Completá tu registro de Vida RPG';save();scheduleReminder();alert('Recordatorio activado para esta sesión.');
}
$('#enableNotifications').addEventListener('click',enableNotifications);
function scheduleReminder(){
  clearTimeout(window.__rpgReminder); if(Notification.permission!=='granted')return;
  const [h,m]=(state.reminderTime||'21:00').split(':').map(Number); const now=new Date(); const target=new Date();target.setHours(h,m,0,0);if(target<=now)target.setDate(target.getDate()+1);
  window.__rpgReminder=setTimeout(async()=>{if('serviceWorker' in navigator){const reg=await navigator.serviceWorker.ready;reg.showNotification('Vida RPG',{body:state.reminderText,icon:'icon-192.svg',badge:'icon-192.svg'})}else new Notification('Vida RPG',{body:state.reminderText});scheduleReminder()},target-now)
}
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').then(()=>{if(Notification.permission==='granted')scheduleReminder()})}
render();
