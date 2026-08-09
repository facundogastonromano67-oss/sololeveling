(()=>{
'use strict';
if(typeof state==='undefined')return;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY=typeof storeKey!=='undefined'?storeKey:'vidaRpgStateV8';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn('Mission V2 save',e)}};
const today=()=>typeof todayKey==='function'?todayKey():localDateKey(new Date());
const clampN=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const uid=()=>state.player?.createdAt||state.player?.name||'gladiador';
const SKILL_ATTR={
 'Inteligencia aplicada':'Intelecto','Conocimiento':'Intelecto','Aprendizaje':'Intelecto','Resolución de problemas':'Intelecto','Creatividad':'Intelecto',
 'Comunicación':'Carisma','Habilidades sociales':'Carisma','Liderazgo':'Carisma','Control emocional':'Carisma','Integridad / valores':'Carisma',
 'Disciplina':'Rendimiento','Constancia':'Rendimiento','Organización':'Rendimiento','Productividad':'Rendimiento','Finanzas personales':'Rendimiento',
 'Fuerza':'Físico','Resistencia':'Físico','Velocidad / Potencia':'Físico','Movilidad':'Físico','Salud física':'Físico'
};
const ATTR_ICON={Intelecto:'◈',Carisma:'✦',Rendimiento:'◆',Físico:'▲'};
const REWARD_MILESTONES=[
 {need:5,label:'Primer avance',coins:8,xp:0,chests:0},
 {need:15,label:'Ritmo',coins:0,xp:10,chests:0},
 {need:30,label:'Disciplina',coins:15,xp:0,chests:0},
 {need:50,label:'Cofre del camino',coins:10,xp:10,chests:1},
 {need:80,label:'Ascenso',coins:25,xp:0,chests:0},
 {need:120,label:'Cofre del gladiador',coins:20,xp:20,chests:1},
 {need:165,label:'Dominio',coins:35,xp:25,chests:0},
 {need:215,label:'Cofre de élite',coins:30,xp:30,chests:1},
 {need:270,label:'Consolidación G30',coins:60,xp:40,chests:1}
];
function localDateKey(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDate(k){return new Date(`${k}T12:00:00`)}
function addDays(k,n){const d=parseDate(k);d.setDate(d.getDate()+n);return localDateKey(d)}
function between(k,a,b){return k>=a&&k<=b}
function hash(str){let h=2166136261>>>0;for(const c of String(str)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let x=hash(seed)||123456789;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)%1000000)/1000000}}
function choose(arr,seed){if(!arr?.length)return null;return arr[Math.floor(rng(seed)()*arr.length)]}
function shuffle(arr,seed){const r=rng(seed),a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function toastMsg(msg,type='good'){try{if(typeof toast==='function')return toast(msg,type)}catch(e){}const st=$('#toastStack');if(!st)return;const el=document.createElement('div');el.className=`toast ${type} show`;el.textContent=msg;st.appendChild(el);setTimeout(()=>el.remove(),2600)}
function ensureState(){
 state.missions=state.missions||{};
 state.missions.daily=state.missions.daily||{};
 state.missions.weeklyV2=state.missions.weeklyV2||{};
 state.missions.monthlyV2=state.missions.monthlyV2||{};
 state.missions.rewardTrackV2=state.missions.rewardTrackV2||{};
 state.missions.aiV2=state.missions.aiV2||{};
 state.missionEngineVersion=2;
 state.economy=state.economy||{coins:0};
 state.arena2=state.arena2||{};
 state.arena2.missionChestTokens=Number(state.arena2.missionChestTokens)||0;
}
function effectiveSkills(){
 try{if(typeof effectiveSkillData==='function'){const d=effectiveSkillData(),out={};Object.entries(d).forEach(([k,v])=>out[k]=Number(v?.score)||50);return out}}catch(e){}
 return{...(state.baseSkills||{})};
}
function weakestSkills(){const s=effectiveSkills();return Object.keys(SKILL_ATTR).sort((a,b)=>(Number(s[a])||50)-(Number(s[b])||50))}
function weekRange(ref=today()){
 const d=parseDate(ref),offset=(d.getDay()+6)%7;d.setDate(d.getDate()-offset);const start=localDateKey(d);return{key:start,start,end:addDays(start,6)}
}
function cycleRange(){
 const start=state.improvementPlan?.cycleStart||`${today().slice(0,7)}-01`;
 if(state.improvementPlan?.cycleStart)return{key:`g30:${start}`,start,end:addDays(start,29),label:'Ciclo G30'};
 const d=parseDate(start);d.setMonth(d.getMonth()+1);d.setDate(0);return{key:`month:${start.slice(0,7)}`,start,end:localDateKey(d),label:'Mes actual'}
}
function getDaySafe(k=today()){state.days=state.days||{};return state.days[k]||(state.days[k]={tasks:[],events:[],checkin:{}})}
function recentCustomTasks(days=14){
 const out=[];for(let i=1;i<=days;i++){const k=addDays(today(),-i);for(const t of state.days?.[k]?.tasks||[]){if(t.custom||!t.source)out.push({...t,date:k})}}
 return out;
}
function yesterdayOpenTask(){const k=addDays(today(),-1);return(state.days?.[k]?.tasks||[]).find(t=>(t.custom||!t.source)&&!t.done&&String(t.text||'').trim())||null}
function currentTraining(){const wd=new Date().getDay();return state.trainingPlan?.days?.find(d=>d.weekday===wd)||null}
function currentDiet(){const plan=state.dietPlan;if(!plan?.days?.length)return null;const i=(new Date().getDay()+6)%7;return plan.days[i%plan.days.length]||null}
function recentStats(days=7){
 let sys=0,sysDone=0,tasks=0,tasksDone=0,active=0;
 for(let i=1;i<=days;i++){const k=addDays(today(),-i),m=state.missions?.daily?.[k]?.items||[],ts=state.days?.[k]?.tasks||[];sys+=m.length;sysDone+=m.filter(x=>x.done).length;tasks+=ts.filter(t=>t.custom||!t.source).length;tasksDone+=ts.filter(t=>(t.custom||!t.source)&&t.done).length;if(m.some(x=>x.done)||ts.some(x=>x.done)||state.trainingDetailedLogs?.[k]?.savedAt)active++}
 return{sys,sysDone,tasks,tasksDone,active,sysRate:sys?sysDone/sys:1,taskRate:tasks?tasksDone/tasks:1};
}
function context(){
 const work=state.assessmentWorkContext||{},life=state.assessmentLifestyle||{},p=state.player||{},stats=recentStats(),weak=weakestSkills();
 return{work,life,p,stats,weak,focus:[...(state.improvementPlan?.focusSkills||[])],training:currentTraining(),diet:currentDiet(),open:yesterdayOpenTask(),recent:recentCustomTasks()};
}
function m(text,skill,tag,why,weight=1){return{text,skill,attr:SKILL_ATTR[skill]||'Rendimiento',tag,why,weight}}
function contextCandidates(c){
 const w=c.work||{},p=c.p||{},out=[];
 const area=w.area||'',role=w.role||'',resp=w.responsibility||'',workType=w.workType||p.context||'';
 if(c.open){out.push(m(`Retomá “${c.open.text}”: definí el próximo paso concreto, trabajalo 20 minutos y dejalo terminado o reprogramado con una fecha real.`,'Constancia','recovery','Ayer quedó una tarea personal abierta; el Sistema prioriza cerrar ciclos antes de sumar carga nueva.',4))}
 if(['manager','coordinator'].includes(role)||['people'].includes(resp)||workType==='owner'){
  out.push(m('Elegí una tarea que hoy dependa de otra persona. Definí por escrito resultado esperado, responsable y momento de revisión; después confirmá que ambos entendieron lo mismo.','Liderazgo','management','Tu evaluación indica responsabilidad de coordinación o gestión de personas.',3));
  out.push(m('Detectá un bloqueo de alguien con quien trabajás y ayudá a definir el siguiente paso sin absorber vos toda la ejecución.','Liderazgo','management','La misión usa tu contexto de coordinación para medir liderazgo aplicado.',2));
 }
 if(resp==='finance'||c.work.bottleneck==='finance'||p.goal==='finanzas'){
  out.push(m('Revisá una decisión económica real de hoy —gasto, precio, costo, caja o presupuesto— y anotá el número que justifica la decisión antes de ejecutarla.','Finanzas personales','finance','Finanzas aparece en tu objetivo o en tus responsabilidades frecuentes.',3));
  out.push(m('Elegí un movimiento de dinero reciente y comprobá si estaba previsto, si aporta al objetivo y qué regla usarías para repetir o evitar ese gasto.','Finanzas personales','finance','El Sistema convierte tu contexto financiero en una verificación concreta.',2));
 }
 if(resp==='sales'||area==='sales'){
  out.push(m('Elegí un seguimiento comercial pendiente. Contactá a la persona y cerrá la interacción con un próximo paso específico y una fecha.','Comunicación','sales','Tu actividad incluye ventas o seguimiento comercial.',3));
  out.push(m('Tomá una conversación con cliente de hoy y resumí en una frase necesidad, propuesta y siguiente acción antes de cerrar el contacto.','Comunicación','sales','La misión usa situaciones reales de atención o ventas.',2));
 }
 if(['operations','admin','projects','analysis'].includes(resp)||['admin','tech'].includes(area)){
  out.push(m('Elegí un proceso que hoy te haga perder tiempo. Identificá el cuello de botella y dejá un checklist de 3 pasos para reducir ese problema la próxima vez.','Organización','operations','Tu contexto tiene tareas de gestión, procesos o análisis.',3));
  out.push(m('Antes de empezar tu bloque principal, elegí sólo 3 resultados del día y reservá un horario concreto para el de mayor impacto.','Productividad','operations','El Sistema adapta organización a un día de trabajo de gestión.',2));
 }
 if(['construction','industrial','warehouse','maintenance','fieldwork'].includes(area)||workType==='manual'||resp==='physical'){
  out.push(m('Elegí una tarea repetitiva de tu jornada. Antes de empezar, ordená mentalmente sus 3 pasos clave; al terminar, anotá un ajuste que pueda hacerla más clara, segura o eficiente la próxima vez.','Organización','physical-work','Tu actividad principal es física, manual, de obra, producción o mantenimiento.',3));
  out.push(m('Durante una tarea física habitual, registrá una referencia simple de rendimiento —tiempo, cantidad, distancia o pausas— sin cambiar tu forma segura de trabajar.','Resistencia','physical-work','Tu contexto permite obtener evidencia física a partir del trabajo real, sin inventar una rutina de oficina.',2));
 }
 if(area==='transport')out.push(m('Antes de tu bloque principal de traslados, ordená paradas o prioridades. Al terminar, registrá una demora evitable y una decisión que podría reducirla mañana.','Organización','transport','Tu actividad principal está vinculada a transporte o conducción.',3));
 if(area==='gastronomy')out.push(m('Elegí una preparación o momento de servicio repetitivo. Dejá listo el orden de mise en place y registrá un tiempo o cuello de botella para ajustar mañana.','Organización','gastronomy','Tu contexto es gastronomía, donde orden y tiempos son evidencia real.',3));
 if(workType==='student'||area==='education'||p.context==='estudio'){
  out.push(m('Elegí un tema que realmente estés estudiando hoy: hacé 25 minutos sin mirar soluciones y terminá con 5 minutos de recuperación de memoria escribiendo lo que recordás.','Aprendizaje','study','Tu contexto principal incluye estudio.',4));
  out.push(m('Tomá un ejercicio o pregunta de un tema actual y resolvelo sin mirar el ejemplo anterior. Después compará y anotá exactamente dónde fallaste.','Resolución de problemas','study','El Sistema prioriza práctica activa sobre lectura pasiva.',3));
 }
 if(workType==='caregiver')out.push(m('Elegí un pendiente esencial de cuidado u hogar y definí qué significa “suficientemente terminado” hoy. Poné un límite para que no absorba el resto del día.','Organización','care','Tu realidad principal incluye cuidados o responsabilidades familiares.',3));
 if(workType==='search'||p.context==='busqueda')out.push(m('Completá una acción laboral verificable: enviar una postulación adaptada, mejorar una parte concreta del CV/portfolio o contactar a una persona con un pedido específico.','Disciplina','job-search','Tu contexto actual es búsqueda laboral o transición.',4));
 return out;
}
function bottleneckCandidates(c){
 const b=c.work?.bottleneck,p=c.p||{},out=[];
 if(b==='organization')out.push(m('Abrí tus pendientes reales de hoy, elegí los 3 que más impacto tienen y escribí cuál vas a dejar fuera a propósito.','Organización','bottleneck','En la evaluación marcaste organización como cuello de botella.',3));
 if(b==='focus')out.push(m('Elegí la tarea real más importante del día y hacé un bloque de 30 minutos con teléfono y pestañas no necesarias fuera de alcance.','Productividad','bottleneck','Marcaste concentración/productividad como una mejora de alto impacto.',3));
 if(b==='consistency')out.push(m('Elegí un hábito que venís sosteniendo de forma irregular y cumplí hoy su versión mínima, aunque el día no sea ideal.','Constancia','bottleneck','Marcaste sostener hábitos como un cuello de botella.',3));
 if(b==='communication')out.push(m('Tené una conversación pendiente y cerrala repitiendo en una frase qué se acordó, quién hace qué y para cuándo.','Comunicación','bottleneck','Marcaste comunicación como un área de mejora prioritaria.',3));
 if(b==='leadership')out.push(m('En una responsabilidad compartida de hoy, definí resultado, responsable y revisión. No tomes vos automáticamente la tarea.','Liderazgo','bottleneck','Marcaste liderazgo/delegación como área prioritaria.',3));
 if(b==='problem')out.push(m('Elegí un problema real de hoy y escribí tres líneas: síntoma observable, causa posible y prueba pequeña para comprobarla.','Resolución de problemas','bottleneck','Marcaste resolución de problemas como prioridad.',3));
 if(b==='learning')out.push(m('Elegí algo que estés aprendiendo y explicalo sin mirar durante 3 minutos. Después revisá únicamente los puntos que no pudiste reconstruir.','Aprendizaje','bottleneck','Marcaste aprender y aplicar más rápido como prioridad.',3));
 if(b==='emotion')out.push(m('En la primera situación que te active hoy, separá por escrito “qué pasó” de “qué interpreté” antes de responder o decidir.','Control emocional','bottleneck','Marcaste presión, frustración o regulación emocional como área prioritaria.',3));
 if(p.goal==='fisico')out.push(m('Registrá una métrica física real de hoy —carga, repeticiones, tiempo, distancia o movilidad— para que el progreso no dependa de sensación subjetiva.','Salud física','physical-goal','Tu objetivo principal está orientado al físico y la salud.',2));
 return out;
}
function planCandidates(c){
 const out=[];
 if(c.training){const ex=c.training.exercises?.[0];out.push(m(`Hoy te toca ${c.training.focus||'entrenamiento'}. Completá la sesión y registrá${ex?` al menos todas las series de “${ex.name}”`:' peso, repeticiones o duración'} en el anotador de Entrenamiento.`,'Disciplina','training','Hay una sesión programada para hoy; la misión usa tu rutina real.',4));}
 if(c.diet){const n=c.diet.meals?.length||0;out.push(m(`Usá tu plan de Nutrición de hoy: cumplí al menos ${Math.max(2,Math.min(3,n))} comidas planificadas y anotá cuál fue la más difícil de sostener para poder ajustar el sistema.`,'Salud física','nutrition','Tenés una alimentación diaria generada; el Sistema mide adherencia, no perfección.',2));}
 return out;
}
const WEAK_TEMPLATE={
 'Inteligencia aplicada':()=>m('Antes de una decisión real de hoy, escribí una estimación numérica o criterio medible. Al final compará tu predicción con el resultado.','Inteligencia aplicada','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Conocimiento':()=>m('Elegí una afirmación que vayas a usar hoy y contrastala con una fuente más sólida antes de convertirla en decisión.','Conocimiento','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Aprendizaje':()=>m('Recuperá de memoria algo aprendido esta semana y aplicalo a un caso distinto sin copiar el ejemplo original.','Aprendizaje','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Resolución de problemas':()=>m('Tomá un bloqueo real: definí el síntoma, una hipótesis y una prueba pequeña antes de intentar arreglar todo.','Resolución de problemas','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Creatividad':()=>m('Para una limitación real de hoy, generá 3 alternativas antes de elegir; una debe usar menos tiempo o recursos que tu solución habitual.','Creatividad','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Comunicación':()=>m('En un pedido importante de hoy, confirmá resultado esperado, restricción y próximo paso en lugar de asumir que quedó claro.','Comunicación','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Habilidades sociales':()=>m('Iniciá una conversación útil que normalmente esperarías que empiece la otra persona y hacé una pregunta genuina antes de hablar de vos.','Habilidades sociales','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Liderazgo':()=>m('En una tarea compartida, ayudá a aclarar el siguiente paso y quién lo toma sin convertirte automáticamente en quien hace todo.','Liderazgo','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Control emocional':()=>m('Cuando aparezca una molestia real, demorá la respuesta lo suficiente para formular una pregunta concreta antes de defender tu postura.','Control emocional','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Integridad / valores':()=>m('Corregí hoy un error o compromiso pequeño aunque sería fácil dejarlo pasar sin consecuencias inmediatas.','Integridad / valores','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Disciplina':()=>m('Empezá durante 20 minutos la tarea importante que más ganas tengas de postergar, antes de una distracción habitual.','Disciplina','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Constancia':()=>m('Repetí hoy la versión mínima de una acción que ya intentaste sostener esta semana; no compenses haciendo de más.','Constancia','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Organización':()=>m('Cerrá el día dejando definido el primer paso concreto de mañana y qué recurso necesitás tener listo.','Organización','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Productividad':()=>m('Protegé un bloque de 30 minutos para una sola tarea de alto impacto y registrá qué interrupción intentó sacarte de ahí.','Productividad','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Finanzas personales':()=>m('Registrá los movimientos de dinero de hoy y elegí uno para decidir si está alineado con una prioridad real.','Finanzas personales','weak-skill','Está entre tus habilidades con menor evidencia actual.',2),
 'Fuerza':()=>m('Si hoy tenés estímulo de fuerza, registrá una serie comparable con la última sesión. Si no entrenás, revisá tu última referencia y definí el próximo objetivo medible.','Fuerza','weak-skill','Está entre tus habilidades físicas con menor evidencia actual.',2),
 'Resistencia':()=>m('Registrá duración e intensidad percibida de una actividad aeróbica que ya sea razonable para tu nivel, sin convertir la misión en una prueba máxima.','Resistencia','weak-skill','Está entre tus habilidades físicas con menor evidencia actual.',2),
 'Velocidad / Potencia':()=>m('Si tu actividad ya incluye acciones explosivas, registrá una referencia técnica de calidad; si no, no agregues sprints sólo por cumplir la misión y elegí “No aplica”.','Velocidad / Potencia','weak-skill','Está entre tus habilidades físicas con menor evidencia actual.',2),
 'Movilidad':()=>m('Elegí un movimiento que puedas repetir de forma cómoda y compará tu rango con tu propia referencia anterior, sin forzar dolor.','Movilidad','weak-skill','Está entre tus habilidades físicas con menor evidencia actual.',2),
 'Salud física':()=>m('Elegí una barrera concreta que hoy pueda empeorar sueño, movimiento o alimentación y eliminá una sola antes de que llegue la noche.','Salud física','weak-skill','Está entre tus habilidades físicas con menor evidencia actual.',2)
};
function weakCandidates(c){const out=[];for(const s of [...c.focus,...c.weak].filter((x,i,a)=>x&&a.indexOf(x)===i).slice(0,6)){if(WEAK_TEMPLATE[s])out.push(WEAK_TEMPLATE[s]())}return out}
function candidatePool(c){return[...contextCandidates(c),...bottleneckCandidates(c),...planCandidates(c),...weakCandidates(c)]}
function selectDaily(c,date,nonce=0,exclude=[]){
 let pool=candidatePool(c).filter(x=>!exclude.includes(x.text));if(!pool.length)pool=[m('Elegí una acción concreta que hoy produzca un resultado observable y registrá qué cambió al hacerla.','Disciplina','fallback','No había suficiente contexto específico; esta misión se recalibrará a medida que uses la app.',1)];
 const scored=pool.map((x,i)=>({...x,_score:x.weight*10+(rng(`${uid()}:${date}:${nonce}:${i}`)()*8)})).sort((a,b)=>b._score-a._score);
 const picked=[],tags=new Set(),attrs=new Set();
 for(const x of scored){if(picked.length>=3)break;const diversity=!tags.has(x.tag)||!attrs.has(x.attr)||picked.length>=2;if(diversity){picked.push(x);tags.add(x.tag);attrs.add(x.attr)}}
 for(const x of scored){if(picked.length>=3)break;if(!picked.includes(x))picked.push(x)}
 return picked.slice(0,3).map((x,i)=>({id:`m22-${date}-${i}-${nonce}`,text:x.text,skill:x.skill,attr:x.attr,tag:x.tag,why:x.why,xp:5+i,done:false,doneAt:null,variant:nonce,engine:'Personal-V2'}));
}
function ensureDaily(force=false){
 ensureState();const k=today(),old=state.missions.daily[k];if(old?.engine==='Personal-V2'&&!force)return old;
 const done=(old?.items||[]).filter(x=>x.done).slice(0,3),exclude=done.map(x=>x.text);const fresh=selectDaily(context(),k,(old?.nonce||0)+(force?1:0),exclude);
 const items=[...done,...fresh.filter(n=>!done.some(d=>d.id===n.id)).slice(0,3-done.length)];
 state.missions.daily[k]={createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),engine:'Personal-V2',nonce:(old?.nonce||0)+(force?1:0),items};save();return state.missions.daily[k];
}
function replaceDaily(id){const d=ensureDaily(),idx=d.items.findIndex(x=>x.id===id);if(idx<0||d.items[idx].done)return;const old=d.items[idx],c=context(),exclude=d.items.map(x=>x.text),alts=candidatePool(c).filter(x=>!exclude.includes(x.text)&&(x.tag===old.tag||x.skill===old.skill));const pool=alts.length?alts:candidatePool(c).filter(x=>!exclude.includes(x.text));const next=choose(pool,`${uid()}:${today()}:${id}:${(old.variant||0)+1}`);if(!next)return;d.items[idx]={id:`m22-${today()}-${idx}-${(old.variant||0)+1}`,text:next.text,skill:next.skill,attr:next.attr,tag:next.tag,why:next.why,xp:old.xp||5,done:false,doneAt:null,variant:(old.variant||0)+1,engine:'Personal-V2'};d.updatedAt=new Date().toISOString();save();sync();toastMsg('Misión recalibrada según tu contexto actual.');}
function toggleDaily(id,done){
 const d=ensureDaily(),item=d.items.find(x=>x.id===id);if(!item||item.done===done)return;item.done=done;item.doneAt=done?new Date().toISOString():null;
 const day=getDaySafe(),eid=`system:${id}`;day.events=day.events||[];
 if(done){if(!day.events.some(e=>e.id===eid))day.events.push({id:eid,type:'system-mission',text:`Misión: ${item.text}`,skill:item.skill,xp:item.xp||0});state.evidenceLog=state.evidenceLog||[];if(!state.evidenceLog.some(e=>e.date===today()&&e.source==='system-mission'&&e.missionId===id))state.evidenceLog.push({date:today(),skill:item.skill,source:'system-mission',missionId:id,value:1});}
 else{day.events=day.events.filter(e=>e.id!==eid);state.evidenceLog=(state.evidenceLog||[]).filter(e=>!(e.date===today()&&e.source==='system-mission'&&e.missionId===id));}
 save();sync();toastMsg(done?`Misión completada · +${item.xp||0} XP`:'Misión reabierta',done?'good':'');
}
function countMetric(metric,start,end){
 if(metric==='systemCompleted'){let n=0;Object.entries(state.missions?.daily||{}).forEach(([k,d])=>{if(between(k,start,end))n+=(d.items||[]).filter(x=>x.done).length});return n}
 if(metric==='personalTasks'){let n=0;Object.entries(state.days||{}).forEach(([k,d])=>{if(between(k,start,end))n+=(d.tasks||[]).filter(t=>(t.custom||!t.source)&&t.done).length});return n}
 if(metric==='g30Habits'){let n=0;Object.entries(state.g30Program?.logs||{}).forEach(([k,d])=>{if(between(k,start,end))n+=Object.values(d||{}).filter(x=>x?.done).length});return n}
 if(metric==='activeDays'){const s=new Set();for(let k=start;k<=end;k=addDays(k,1)){const m=state.missions?.daily?.[k]?.items||[],t=state.days?.[k]?.tasks||[],h=state.g30Program?.logs?.[k]||{};if(m.some(x=>x.done)||t.some(x=>x.done)||Object.values(h).some(x=>x?.done)||state.trainingDetailedLogs?.[k]?.savedAt||state.dietLogs?.[k])s.add(k);if(k===end)break}return s.size}
 if(metric==='trainingSessions')return Object.entries(state.trainingDetailedLogs||{}).filter(([k,v])=>between(k,start,end)&&v?.savedAt).length;
 if(metric==='nutritionDays')return Object.keys(state.dietLogs||{}).filter(k=>between(k,start,end)).length;
 if(metric.startsWith('tag:')){const tag=metric.slice(4);let n=0;Object.entries(state.missions?.daily||{}).forEach(([k,d])=>{if(between(k,start,end))n+=(d.items||[]).filter(x=>x.done&&x.tag===tag).length});return n}
 if(metric.startsWith('skill:')){const skill=metric.slice(6);return(state.evidenceLog||[]).filter(e=>between(e.date||'',start,end)&&e.skill===skill).length}
 return 0;
}
function contextWeeklyGoal(c){const area=c.work?.area||'',wt=c.work?.workType||c.p?.context||'',trainingDays=state.trainingPlan?.days?.length||0;
 if(trainingDays)return{title:'Cumplí tus sesiones reales',text:`Registrá ${Math.min(3,Math.max(1,trainingDays))} sesiones de tu rutina esta semana.`,metric:'trainingSessions',target:Math.min(3,Math.max(1,trainingDays)),tag:'training'};
 if(['student','mixed'].includes(wt)||area==='education')return{title:'Semana de práctica activa',text:'Completá 3 misiones vinculadas a estudio, aprendizaje o resolución de problemas.',metric:'tag:study',target:3,tag:'study'};
 if(['construction','industrial','warehouse','maintenance','fieldwork'].includes(area)||wt==='manual')return{title:'Mejorá tu forma de trabajar',text:'Completá 3 misiones adaptadas a tu actividad física/manual.',metric:'tag:physical-work',target:3,tag:'physical-work'};
 if(['manager','coordinator'].includes(c.work?.role)||wt==='owner')return{title:'Liderazgo aplicado',text:'Completá 3 misiones de coordinación, delegación o seguimiento real.',metric:'tag:management',target:3,tag:'management'};
 if(c.work?.responsibility==='finance'||c.work?.bottleneck==='finance')return{title:'Semana financiera',text:'Completá 3 misiones donde una decisión use datos de dinero reales.',metric:'tag:finance',target:3,tag:'finance'};
 return{title:'Cerrá pendientes propios',text:'Completá 5 tareas personales reales durante la semana.',metric:'personalTasks',target:5,tag:'personal'};
}
function ensureWeekly(){ensureState();const r=weekRange(),old=state.missions.weeklyV2[r.key];if(old){old.goals=old.goals||[];if(!old.goals.some(g=>g.metric==='g30Habits'))old.goals.push({id:`w-${r.key}-habits`,title:'Base G30',text:'Cumplí 20 hábitos progresivos durante la semana. Cada repetición cuenta.',metric:'g30Habits',target:20});save();return old}const c=context(),personal=contextWeeklyGoal(c);const goals=[
 {id:`w-${r.key}-1`,title:'Presencia semanal',text:'Tené actividad útil en al menos 5 días de la semana.',metric:'activeDays',target:5},
 {id:`w-${r.key}-2`,title:'Misiones del Sistema',text:'Completá 8 misiones diarias antes de terminar la semana.',metric:'systemCompleted',target:8},
 {id:`w-${r.key}-habits`,title:'Base G30',text:'Cumplí 20 hábitos progresivos durante la semana. Cada repetición cuenta.',metric:'g30Habits',target:20},
 {id:`w-${r.key}-3`,...personal}
 ];state.missions.weeklyV2[r.key]={...r,createdAt:new Date().toISOString(),goals};save();return state.missions.weeklyV2[r.key];}
function ensureMonthly(){ensureState();const r=cycleRange(),old=state.missions.monthlyV2[r.key];if(old){old.goals=old.goals||[];if(!old.goals.some(g=>g.metric==='g30Habits'))old.goals.splice(Math.min(2,old.goals.length),0,{id:`mo-${r.key}-habits`,title:'Base diaria progresiva',text:'Acumulá 100 hábitos G30 cumplidos durante el ciclo.',metric:'g30Habits',target:100});save();return old}const weak=weakestSkills()[0]||'Disciplina';const goals=[
 {id:`mo-${r.key}-1`,title:'Constancia del ciclo',text:'Registrá actividad útil en 20 días del ciclo.',metric:'activeDays',target:20},
 {id:`mo-${r.key}-2`,title:'30 misiones reales',text:'Completá 30 misiones diarias del Sistema durante el ciclo.',metric:'systemCompleted',target:30},
 {id:`mo-${r.key}-habits`,title:'Base diaria progresiva',text:'Acumulá 100 hábitos G30 cumplidos durante el ciclo.',metric:'g30Habits',target:100},
 {id:`mo-${r.key}-3`,title:`Evidencia en ${weak}`,text:`Generá 8 evidencias reales relacionadas con ${weak}.`,metric:`skill:${weak}`,target:8,skill:weak}
 ];state.missions.monthlyV2[r.key]={...r,createdAt:new Date().toISOString(),goals};save();return state.missions.monthlyV2[r.key];}
function goalData(period){return period.goals.map(g=>({...g,progress:countMetric(g.metric,period.start,period.end),done:countMetric(g.metric,period.start,period.end)>=g.target}))}
function rewardPoints(){const r=cycleRange();return countMetric('systemCompleted',r.start,r.end)+countMetric('personalTasks',r.start,r.end)+countMetric('g30Habits',r.start,r.end)}
function rewardState(){ensureState();const r=cycleRange();const t=state.missions.rewardTrackV2[r.key]||(state.missions.rewardTrackV2[r.key]={claimed:[],createdAt:new Date().toISOString()});return{range:r,track:t,points:rewardPoints()}}
function claimReward(need){const rw=rewardState(),mil=REWARD_MILESTONES.find(x=>x.need===Number(need));if(!mil||rw.points<mil.need||rw.track.claimed.includes(mil.need))return;rw.track.claimed.push(mil.need);state.economy.coins=(state.economy.coins||0)+(mil.coins||0);if(mil.chests)state.arena2.missionChestTokens=(state.arena2.missionChestTokens||0)+mil.chests;if(mil.xp){const d=getDaySafe(),id=`mission-track:${rw.range.key}:${mil.need}`;d.events=d.events||[];if(!d.events.some(e=>e.id===id))d.events.push({id,type:'mission-track',text:`Camino de recompensas: ${mil.label}`,xp:mil.xp})}save();renderMissionPage();toastMsg(`${mil.label} reclamado${mil.chests?' · +1 cofre de Arena':''}.`,'good')}
function summary(){const w=ensureWeekly(),mo=ensureMonthly(),rw=rewardState(),wg=goalData(w),mg=goalData(mo);return{daily:ensureDaily(),weekly:{done:wg.filter(x=>x.done).length,total:wg.length,goals:wg},monthly:{done:mg.filter(x=>x.done).length,total:mg.length,goals:mg},reward:{points:rw.points,claimed:rw.track.claimed,next:REWARD_MILESTONES.find(x=>!rw.track.claimed.includes(x.need)&&rw.points<x.need)||null}}}
function profileForAI(){const c=context();return{player:{age:c.p.age,context:c.p.context,goal:c.p.goal},work:c.work,lifestyle:c.life,weakSkills:c.weak.slice(0,5),focusSkills:c.focus.slice(0,5),recentStats:c.stats,training:c.training?{focus:c.training.focus,exercises:(c.training.exercises||[]).slice(0,4).map(x=>x.name)}:null,diet:c.diet?{meals:(c.diet.meals||[]).map(x=>x.name).slice(0,4)}:null,recentTasks:c.recent.slice(0,8).map(x=>({text:x.text,done:x.done,date:x.date}))};}
async function enhanceWithAI(){const endpoint=window.VIDA_RPG_CONFIG?.missionAiEndpoint;if(!endpoint)return toastMsg('La IA remota necesita un backend seguro. El motor adaptativo local ya está activo.','');const d=ensureDaily();try{toastMsg('Recalibrando misiones con IA…','');const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date:today(),profile:profileForAI(),current:d.items.map(x=>({text:x.text,skill:x.skill,why:x.why}))})});if(!res.ok)throw new Error(`HTTP ${res.status}`);const data=await res.json(),arr=Array.isArray(data?.daily)?data.daily:[];if(arr.length!==3)throw new Error('Respuesta inválida');d.items=arr.map((x,i)=>({id:`ai-${today()}-${i}-${Date.now()}`,text:String(x.text||'').trim(),skill:SKILL_ATTR[x.skill]?x.skill:(d.items[i]?.skill||'Disciplina'),attr:SKILL_ATTR[x.skill]||d.items[i]?.attr||'Rendimiento',tag:x.tag||'ai',why:x.why||'Misión generada por IA usando tu contexto reciente.',xp:Math.max(4,Math.min(8,Number(x.xp)||5+i)),done:false,doneAt:null,engine:'AI-V2'}));d.engine='AI-V2';d.aiUpdatedAt=new Date().toISOString();save();renderMissionPage();toastMsg('Misiones recalibradas con IA.','good')}catch(e){console.warn(e);toastMsg('La IA remota no respondió. Mantenemos las misiones personalizadas locales.','warn')}}
function missionWhy(c){const w=c.work||{},parts=[];if(w.area)parts.push(`actividad: ${w.area}`);if(w.role)parts.push(`rol: ${w.role}`);if(w.bottleneck)parts.push(`foco: ${w.bottleneck}`);if(c.training)parts.push('entrenamiento de hoy');if(c.open)parts.push('pendiente de ayer');return parts.slice(0,3).join(' · ')||'evaluación + comportamiento reciente'}
function goalCard(g){const p=Math.min(g.progress,g.target),pct=clampN(p/g.target*100);return`<article class="m22-goal ${g.done?'done':''}"><header><div><strong>${esc(g.title)}</strong><small>${esc(g.text)}</small></div><b>${p}/${g.target}</b></header><div class="m22-bar"><i style="width:${pct}%"></i></div>${g.done?'<span class="m22-complete">COMPLETADA</span>':''}</article>`}
function renderMissionPage(){
 if((document.body?.dataset?.page||'')!=='missions')return;ensureDaily();const s=summary(),main=$('main');if(!main)return;const ai=!!window.VIDA_RPG_CONFIG?.missionAiEndpoint,c=context(),rw=rewardState();
 main.innerHTML=`<section class="m22-hero card"><div><div class="eyebrow">SISTEMA DE MISIONES · PERSONAL V2</div><h1>Tu recorrido, no una lista genérica</h1><p>El Sistema cruza evaluación, contexto, skills, tareas recientes, entrenamiento y comportamiento de los últimos días.</p><small>${esc(missionWhy(c))}</small></div><div class="m22-hero-stats"><div><span>HOY</span><strong>${s.daily.items.filter(x=>x.done).length}/3</strong></div><div><span>SEMANA</span><strong>${s.weekly.done}/${s.weekly.total}</strong></div><div><span>CICLO</span><strong>${s.monthly.done}/${s.monthly.total}</strong></div><div><span>MARCAS</span><strong>${rw.points}</strong></div></div></section>
 <section class="m22-section card"><div class="section-head"><div><div class="eyebrow">MISIONES DIARIAS</div><h2>3 acciones elegidas para hoy</h2></div><div class="m22-tools"><button class="ghost" id="m22Recalibrate">Recalibrar hoy</button>${ai?'<button class="primary" id="m22AI">Personalizar con IA</button>':'<span class="pill gold">Motor local activo</span>'}</div></div><div class="m22-daily">${s.daily.items.map(x=>`<article class="m22-daily-item ${x.done?'done':''}"><label><input type="checkbox" data-m22-daily="${esc(x.id)}" ${x.done?'checked':''}><div><div class="m22-skill">${ATTR_ICON[x.attr]||'◆'} ${esc(x.skill)}</div><h3>${esc(x.text)}</h3><p>${esc(x.why||'')}</p><span>+${x.xp||0} XP</span></div></label>${x.done?'':`<button class="ghost small-btn" data-m22-replace="${esc(x.id)}">No aplica · cambiar</button>`}</article>`).join('')}</div></section>
 <section class="m22-period-grid"><section class="m22-section card"><div class="eyebrow">MISIONES SEMANALES</div><h2>Objetivos de esta semana</h2><p class="muted">Se completan automáticamente con acciones reales; no hace falta marcar progreso a mano.</p><div class="m22-goals">${s.weekly.goals.map(goalCard).join('')}</div></section><section class="m22-section card"><div class="eyebrow">MISIONES MENSUALES · G30</div><h2>Objetivos del ciclo</h2><p class="muted">Miden constancia y evidencia acumulada, no un día perfecto.</p><div class="m22-goals">${s.monthly.goals.map(goalCard).join('')}</div></section></section>
 <section class="m22-section card"><div class="section-head"><div><div class="eyebrow">CAMINO DE RECOMPENSAS</div><h2>Cada tarea cumplida mueve el recorrido</h2></div><div class="m22-points"><strong>${rw.points}</strong><span>marcas</span></div></div><p class="muted">Cada misión diaria del Sistema, cada tarea personal y cada hábito G30 cumplido suma 1 marca. Los objetivos semanales y mensuales no duplican puntos: son hitos construidos con esas acciones.</p><div class="m22-track">${REWARD_MILESTONES.map(x=>{const claimed=rw.track.claimed.includes(x.need),ready=rw.points>=x.need;const reward=[x.coins?`${x.coins} 🪙`:null,x.xp?`${x.xp} XP`:null,x.chests?`${x.chests} cofre Arena`:null].filter(Boolean).join(' · ');return`<article class="m22-stop ${claimed?'claimed':ready?'ready':''}"><div class="m22-stop-node">${claimed?'✓':x.need}</div><strong>${esc(x.label)}</strong><small>${reward}</small><button class="${ready&&!claimed?'primary':'ghost'} small-btn" data-m22-claim="${x.need}" ${!ready||claimed?'disabled':''}>${claimed?'Reclamado':ready?'Reclamar':`${rw.points}/${x.need}`}</button></article>`}).join('')}</div></section>
 <section class="m22-ai-note"><strong>${ai?'IA remota configurada':'Personalización local activa'}</strong><span>${ai?'Podés pedir una recalibración con IA usando el backend configurado.':'La app no expone claves de IA en el navegador. Si conectás un backend seguro, este mismo sistema puede usar un modelo remoto; mientras tanto funciona con el motor adaptativo local.'}</span></section>`;
 $('#m22Recalibrate')?.addEventListener('click',()=>{ensureDaily(true);renderMissionPage();toastMsg('Recalculé las misiones no completadas con tus datos actuales.','good')});
 $('#m22AI')?.addEventListener('click',enhanceWithAI);
 $$('[data-m22-daily]').forEach(x=>x.addEventListener('change',()=>{toggleDaily(x.dataset.m22Daily,x.checked);renderMissionPage()}));
 $$('[data-m22-replace]').forEach(x=>x.addEventListener('click',()=>{replaceDaily(x.dataset.m22Replace);renderMissionPage()}));
 $$('[data-m22-claim]').forEach(x=>x.addEventListener('click',()=>claimReward(x.dataset.m22Claim)));
}
function sync(){ensureWeekly();ensureMonthly();if((document.body?.dataset?.page||'')==='missions')renderMissionPage()}
function bindGlobalSync(){
 document.addEventListener('change',e=>{if(e.target?.matches?.('[data-v20-task], [data-v20-mission], [data-system-mission]'))setTimeout(sync,20)},true);
 document.addEventListener('click',e=>{if(e.target?.closest?.('#v20AddTask,#saveTrainingEdit,#v20SaveTraining'))setTimeout(sync,80)},true);
}
ensureState();ensureDaily();ensureWeekly();ensureMonthly();
window.VIDA_MISSIONS_V2={ensureDaily,ensureWeekly,ensureMonthly,replaceDaily,toggleDaily,summary,rewardPoints,claimReward,sync,render:renderMissionPage,enhanceWithAI};
// Compatibilidad con llamadas heredadas.
window.ensureDailyMissions=ensureDaily;window.replaceSystemMission=replaceDaily;window.toggleSystemMission=toggleDaily;window.renderMissionsPage=renderMissionPage;
bindGlobalSync();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if((document.body?.dataset?.page||'')==='missions')renderMissionPage()},{once:true});else if((document.body?.dataset?.page||'')==='missions')renderMissionPage();
setTimeout(()=>{if((document.body?.dataset?.page||'')==='missions')renderMissionPage()},500);
})();
