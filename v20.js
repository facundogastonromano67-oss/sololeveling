(()=>{
if(typeof state==='undefined')return;
const pg=document.body?.dataset?.page||'';
const file=(location.pathname.split('/').pop()||'index.html');
const isNutrition=file==='nutricion.html';
const Q=s=>document.querySelector(s), QA=s=>[...document.querySelectorAll(s)];
const STORE=typeof storeKey!=='undefined'?storeKey:'vidaRpgStateV8';
const esc=s=>typeof escapeHtml==='function'?escapeHtml(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const DAYS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const DIET_DAYS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const ATTR_ICONS={Intelecto:'◈',Carisma:'✦',Rendimiento:'◆',Físico:'▲'};
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(state))}catch(e){console.warn('V20 save',e)}};
const dateKeySafe=d=>typeof dateKey==='function'?dateKey(d):`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=()=>typeof todayKey==='function'?todayKey():dateKeySafe(new Date());

function pageName(){if(pg==='home')return'General';if(pg==='training')return'Entrenamiento';if(isNutrition)return'Nutrición';if(pg==='academy')return'Academia';if(pg==='more')return'Más';return null}
function normalizeHeader(){
 const name=pageName();if(!name)return;
 const h=Q('.brand h1');if(h)h.textContent=name;
 const navItems=[['index.html','General','⌂'],['entrenamiento.html','Entrenamiento','◆'],['nutricion.html','Nutrición','◇'],['academia.html','Academia','▤'],['mas.html','Más','☰']];
 const active=h=>((pg==='home'&&h==='index.html')||(pg==='training'&&h==='entrenamiento.html')||(isNutrition&&h==='nutricion.html')||(pg==='academy'&&h==='academia.html')||(pg==='more'&&h==='mas.html'));
 QA('.desktop-nav').forEach(nav=>nav.innerHTML=navItems.map(([href,label])=>`<a href="${href}" class="${active(href)?'active':''}">${label}</a>`).join(''));
 QA('.mobile-nav').forEach(nav=>nav.innerHTML=navItems.map(([href,label,icon])=>`<a href="${href}" class="${active(href)?'active':''}"><span>${icon}</span>${label}</a>`).join(''));
 document.body.classList.add('v20-primary-page');
}
function hideVisualLegacy(){
 if(!pageName())return;
 QA('.v16-module-hero,.page-scene.v14').forEach(x=>x.classList.add('v20-hidden'));
}
function ensureRoot(id,main=Q('main')){let root=Q('#'+id);if(!root&&main){root=document.createElement('div');root.id=id;root.className='v20-root';main.prepend(root)}return root}
function xpData(){
 let xp=0,todayXp=0;const tk=today();
 Object.entries(state.days||{}).forEach(([k,d])=>{
   (d.tasks||[]).forEach(t=>{if(t.done){xp+=Number(t.xp)||0;if(k===tk)todayXp+=Number(t.xp)||0}});
   (d.events||[]).forEach(e=>{xp+=Number(e.xp)||0;if(k===tk)todayXp+=Number(e.xp)||0});
 });
 const level=Math.floor(Math.sqrt(Math.max(0,xp)/25))+1;
 const floor=25*Math.pow(level-1,2),next=25*Math.pow(level,2),current=xp-floor,needed=Math.max(1,next-floor);
 return{xp,todayXp,level,current,needed,pct:Math.max(0,Math.min(100,current/needed*100))};
}
function streakValue(){try{return typeof streaks==='function'?(streaks().current||0):0}catch(e){return 0}}
function attrs(){try{return typeof effectiveAttributes==='function'?effectiveAttributes():{}}catch(e){return{}}}
function generalSkill(){try{return typeof generalLevel==='function'?generalLevel():50}catch(e){return 50}}
function rankOf(n){try{return typeof rank==='function'?rank(n):''}catch(e){return''}}
function g30Meta(){
 const p=state.improvementPlan||{};let d=1;
 if(p.cycleStart){const a=new Date(`${p.cycleStart}T12:00:00`),b=new Date(`${today()}T12:00:00`);d=Math.max(1,Math.min(30,Math.floor((b-a)/86400000)+1))}
 const stage=d<=7?'Diagnóstico y orden':d<=15?'Construcción':d<=23?'Intensificación':'Consolidación';
 return{day:d,stage,pct:Math.round(d/30*100),ready:!!p.questionnaireComplete||!!state.assessmentComplete};
}
function dailyMissions(){
 state.missions=state.missions||{daily:{},weekly:{},chests:{}};state.missions.daily=state.missions.daily||{};
 let d=state.missions.daily[today()];
 if(d?.items?.length)return d;
 // Fallback sólo si la capa heredada no llegó a crear las misiones del día.
 const focus=[...(state.improvementPlan?.focusSkills||[])];
 const scores=state.baseSkills||{};
 Object.keys(scores).sort((a,b)=>(Number(scores[a])||50)-(Number(scores[b])||50)).forEach(s=>{if(!focus.includes(s))focus.push(s)});
 const templates={
  'Disciplina':'Empezá durante 15 minutos una tarea importante antes de abrir una distracción.',
  'Constancia':'Cumplí hoy la versión mínima de una rutina que querés sostener.',
  'Organización':'Definí tus 3 prioridades y reservá un bloque concreto para la principal.',
  'Productividad':'Completá una tarea de alto impacto antes de dedicarte a tareas pequeñas.',
  'Conocimiento':'Aprendé 10 minutos sobre un tema útil y anotá 3 ideas nuevas.',
  'Aprendizaje':'Aplicá hoy una idea aprendida recientemente en un caso nuevo.',
  'Comunicación':'Cerrá una conversación importante confirmando próximos pasos.',
  'Control emocional':'Ante una molestia real, describí el hecho antes de responder.',
  'Fuerza':'Si entrenás fuerza hoy, registrá al menos un ejercicio con carga y repeticiones.',
  'Resistencia':'Registrá duración e intensidad de una actividad aeróbica razonable para tu nivel.',
  'Salud física':'Cumplí una acción básica de sueño, actividad o alimentación planificada.'
 };
 const picked=focus.slice(0,3);while(picked.length<3)picked.push(['Organización','Constancia','Salud física'][picked.length]);
 d={createdAt:new Date().toISOString(),engine:'V20-fallback',items:picked.map((skill,i)=>({id:`v20-${today()}-${i}`,skill,text:templates[skill]||`Hacé una acción concreta hoy que produzca evidencia real en ${skill}.`,xp:4+i,done:false}))};
 state.missions.daily[today()]=d;save();return d;
}
function toggleMission(id,done){
 const daily=dailyMissions(),m=daily.items.find(x=>x.id===id);if(!m||m.done===done)return;
 m.done=done;m.doneAt=done?new Date().toISOString():null;
 const d=typeof getDay==='function'?getDay():(state.days[today()]||(state.days[today()]={tasks:[],events:[],checkin:{}}));d.events=d.events||[];
 const eid=`system:${id}`;
 if(done){if(!d.events.some(e=>e.id===eid))d.events.push({id:eid,type:'system-mission',text:`Misión: ${m.text}`,skill:m.skill,xp:m.xp||0})}
 else d.events=d.events.filter(e=>e.id!==eid);
 save();
 try{if(typeof toast==='function')toast(done?`Misión completada · +${m.xp||0} XP`:'Misión reabierta',done?'good':'')}catch(e){}
}
function todayTraining(){return state.trainingPlan?.days?.find(d=>d.weekday===new Date().getDay())||null}
function todayDiet(){const plan=state.dietPlan;if(!plan?.days?.length)return null;const idx=(new Date().getDay()+6)%7;return plan.days[idx%plan.days.length]}

function renderGeneral(){
 if(pg!=='home')return;
 const root=ensureRoot('generalV20');if(!root)return;
 [...Q('main').children].forEach(el=>{if(el!==root&&!el.matches('.overlay,#briefingOverlay,#levelUpOverlay'))el.classList.add('v20-legacy')});
 const x=xpData(),a=attrs(),gl=generalSkill(),g=g30Meta(),daily=dailyMissions();
 const day=typeof getDay==='function'?getDay():(state.days[today()]||{tasks:[]});const tasks=(day.tasks||[]).filter(t=>!t.source||t.source!=='system');
 const td=todayTraining(),nd=todayDiet();const doneM=daily.items.filter(m=>m.done).length,doneT=tasks.filter(t=>t.done).length;
 const avatar=state.avatar?`<img src="${state.avatar}" alt="Avatar">`:`<span>${esc((state.player?.name||'G').slice(0,1).toUpperCase())}</span>`;
 root.innerHTML=`
 <section class="v20-general-head card">
  <div class="v20-character"><div class="v20-avatar">${avatar}</div><div><div class="eyebrow">GLADIADOR</div><h1>${esc(state.player?.name||'Jugador')}</h1><p>${esc(state.rpg?.title||'Despertado')} · Nivel de habilidades ${gl} · ${esc(rankOf(gl))}</p></div></div>
  <div class="v20-stat-row">
   <div><span>NIVEL RPG</span><strong>${x.level}</strong></div><div><span>XP TOTAL</span><strong>${x.xp}</strong></div><div><span>RACHA</span><strong>${streakValue()} d</strong></div><div><span>HOY</span><strong>+${x.todayXp} XP</strong></div>
  </div>
  <div class="v20-g30-compact"><div><span>PLAN G30 · ${esc(g.stage)}</span><strong>Día ${g.day} de 30</strong></div><b>${g.pct}%</b><div class="v20-progress"><i style="width:${g.pct}%"></i></div></div>
 </section>
 <section class="v20-attributes">${Object.entries(a).map(([k,v])=>`<article><span>${ATTR_ICONS[k]||'◆'} ${esc(k)}</span><strong>${Math.round(v)}</strong><i><b style="width:${Math.max(0,Math.min(100,v))}%"></b></i></article>`).join('')}</section>
 <section class="v20-today-head"><div><div class="eyebrow">GENERAL · HOY</div><h2>Qué tenés que hacer</h2></div><p>${doneM}/${daily.items.length} misiones · ${doneT}/${tasks.length} tareas</p></section>
 <section class="v20-action-grid">
  <article class="v20-action-card"><header><div><span>SISTEMA</span><h3>Misiones asignadas</h3></div><b>${doneM}/${daily.items.length}</b></header><div class="v20-action-list">${daily.items.map(m=>`<label class="v20-check ${m.done?'done':''}"><input type="checkbox" data-v20-mission="${esc(m.id)}" ${m.done?'checked':''}><div><strong>${esc(m.text)}</strong><small>${esc(m.skill||'Desarrollo')} · +${m.xp||0} XP</small></div></label>`).join('')}</div></article>
  <article class="v20-action-card"><header><div><span>VIDA REAL</span><h3>Tareas del día</h3></div><b>${doneT}/${tasks.length}</b></header><div class="v20-action-list">${tasks.length?tasks.map(t=>`<label class="v20-check ${t.done?'done':''}"><input type="checkbox" data-v20-task="${esc(t.id)}" ${t.done?'checked':''}><div><strong>${esc(t.text)}</strong><small>${esc(t.category||'Personal')} · +${t.xp||0} XP</small></div></label>`).join(''):'<div class="v20-empty-small">No cargaste tareas personales para hoy.</div>'}</div><div class="v20-add-task"><input id="v20TaskText" placeholder="Agregar una tarea para hoy"><button id="v20AddTask" class="ghost">Agregar</button></div></article>
 </section>
 <section class="v20-context-grid">
  <a href="entrenamiento.html" class="v20-context-card"><span>ENTRENAMIENTO</span>${td?`<h3>${esc(td.focus)}</h3><p>${td.exercises.length} ejercicios · ${state.trainingPlan?.profile?.minutes||60} min</p><b>Registrar sesión →</b>`:`<h3>Recuperación / día libre</h3><p>No hay sesión estructurada para hoy.</p><b>Ver semana →</b>`}</a>
  <a href="nutricion.html" class="v20-context-card"><span>NUTRICIÓN</span>${nd?`<h3>${nd.meals.length} comidas planificadas</h3><p>${nd.totals?.kcal||'—'} kcal · P ${nd.totals?.p||'—'} g</p><b>Ver comidas y recetas →</b>`:`<h3>Plan pendiente</h3><p>Configurá tu alimentación para ver qué toca hoy.</p><b>Abrir Nutrición →</b>`}</a>
 </section>`;
 root.onchange=e=>{const mid=e.target.dataset.v20Mission,tid=e.target.dataset.v20Task;if(mid){toggleMission(mid,e.target.checked);renderGeneral();return}if(tid){const t=(typeof getDay==='function'?getDay():day).tasks.find(x=>x.id===tid);if(t){t.done=e.target.checked;save();renderGeneral()}}};
 Q('#v20AddTask')?.addEventListener('click',()=>{const input=Q('#v20TaskText'),text=input?.value.trim();if(!text)return;const d=typeof getDay==='function'?getDay():day;d.tasks=d.tasks||[];d.tasks.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),text,category:'Personal',skill:'Organización',xp:1,done:false,custom:true});save();renderGeneral()});
}

function weekDateFor(day){const n=new Date(),delta=day-n.getDay(),d=new Date(n);d.setDate(n.getDate()+delta);return dateKeySafe(d)}
function prevLog(exId,currentDate){return Object.entries(state.trainingDetailedLogs||{}).filter(([d])=>d<currentDate).sort(([a],[b])=>b.localeCompare(a)).map(([,v])=>v.exercises?.[exId]).find(Boolean)||null}
function parseRepRange(s=''){const m=String(s).match(/(\d+)\s*[–-]\s*(\d+)/);return m?{min:+m[1],max:+m[2]}:null}
function coachAdvice(ex,prev){
 if(!prev?.sets?.length)return 'Primera referencia registrada: priorizá técnica limpia y dejá 2–3 repeticiones en reserva.';
 const valid=prev.sets.map(s=>({w:Number(s.weight)||0,r:Number(s.reps)||0,p:Number(s.rpe)||0})).filter(s=>s.r||s.w);if(!valid.length)return 'La sesión anterior no tiene datos suficientes. Registrá peso y repeticiones para recibir una progresión.';
 const best=[...valid].sort((a,b)=>(b.w*b.r)-(a.w*a.r))[0],range=parseRepRange(ex.prescription);
 if(range&&best.r>=range.max&&(!best.p||best.p<=8.5)&&best.w>0)return `Última referencia: ${best.w} kg × ${best.r}. Objetivo sugerido: subí aproximadamente 2–2,5 kg y volvé al rango bajo con técnica limpia.`;
 if(best.w>0)return `Última referencia: ${best.w} kg × ${best.r}. Objetivo sugerido: mantené el peso e intentá sumar 1 repetición antes de aumentar carga.`;
 return `Última referencia: ${best.r} reps. Buscá una mejora pequeña sin sacrificar rango de movimiento ni técnica.`;
}
function defaultSets(ex){const m=String(ex.prescription||'').match(/(\d+)\s*[×x]/i),n=Math.max(1,Math.min(8,m?Number(m[1]):3));return Array.from({length:n},()=>({reps:'',weight:'',rpe:''}))}
function exerciseCard(ex,log,date,weekday,idx){
 const saved=log.exercises?.[ex.id]||{sets:defaultSets(ex)};const prev=prevLog(ex.id,date);const prevValid=prev?.sets?.map(s=>({w:Number(s.weight)||0,r:Number(s.reps)||0})).filter(x=>x.w||x.r)||[];const last=prevValid.length?[...prevValid].sort((a,b)=>(b.w*b.r)-(a.w*a.r))[0]:null;
 return `<article class="v20-exercise"><header><div><span>EJERCICIO ${idx+1}</span><h3>${esc(ex.name)}</h3><p>${esc(ex.prescription)}${ex.muscle?` · ${esc(ex.muscle)}`:''}</p></div><button class="v20-icon-action" data-v20-edit="${weekday}:${esc(ex.id)}" title="Editar ejercicio">⋯</button></header><div class="v20-coach-tip"><b>ENTRENADOR</b><p>${esc(coachAdvice(ex,prev))}</p>${last?`<small>Referencia previa: ${last.w||'—'} kg · ${last.r||'—'} reps</small>`:''}</div><div class="v20-set-table"><div class="v20-set-row head"><span>Serie</span><span>Kg</span><span>Reps</span><span>RPE</span><span></span></div>${saved.sets.map((s,i)=>`<div class="v20-set-row"><b>${i+1}</b><input type="number" inputmode="decimal" min="0" step="0.5" data-v20-ex="${esc(ex.id)}" data-set="${i}" data-field="weight" value="${esc(s.weight)}" placeholder="—"><input type="number" inputmode="numeric" min="0" step="1" data-v20-ex="${esc(ex.id)}" data-set="${i}" data-field="reps" value="${esc(s.reps)}" placeholder="—"><input type="number" inputmode="decimal" min="1" max="10" step="0.5" data-v20-ex="${esc(ex.id)}" data-set="${i}" data-field="rpe" value="${esc(s.rpe)}" placeholder="—"><button class="v20-remove-set" data-v20-remove-set="${esc(ex.id)}:${i}" title="Quitar serie">×</button></div>`).join('')}</div><button class="v20-add-set" data-v20-add-set="${esc(ex.id)}">+ Agregar serie</button></article>`
}
function saveTraining(day,date){
 if(!day)return;state.trainingDetailedLogs=state.trainingDetailedLogs||{};const log=state.trainingDetailedLogs[date]||(state.trainingDetailedLogs[date]={date,weekday:day.weekday,exercises:{},notes:''});
 day.exercises.forEach(ex=>{const inputs=QA(`[data-v20-ex="${CSS.escape(ex.id)}"]`),sets=[];inputs.forEach(inp=>{const i=+inp.dataset.set;sets[i]=sets[i]||{};sets[i][inp.dataset.field]=inp.value});log.exercises[ex.id]={name:ex.name,sets:sets.filter(Boolean)}});log.notes=Q('#v20TrainingNotes')?.value||'';log.savedAt=new Date().toISOString();save();try{toast('Sesión guardada en tu progreso.','good')}catch(e){};renderTraining();
}
function renderTraining(){
 if(pg!=='training')return;state.trainingDetailedLogs=state.trainingDetailedLogs||{};
 const main=Q('main'),root=ensureRoot('trainingV20',main);if(!root)return;
 [...main.children].forEach(el=>{if(el!==root)el.classList.add('v20-training-legacy')});
 const selected=Number(sessionStorage.getItem('v20TrainingDay')??new Date().getDay());const plan=state.trainingPlan,day=plan?.days?.find(d=>d.weekday===selected),date=weekDateFor(selected);const log=state.trainingDetailedLogs[date]||(state.trainingDetailedLogs[date]={date,weekday:selected,exercises:{},notes:''});
 root.innerHTML=`<section class="v20-page-intro"><div><div class="eyebrow">ENTRENAMIENTO</div><h1>Tu entrenador personal</h1><p>Elegí el día, ejecutá la rutina y registrá cada serie. La próxima sesión usa tus datos reales para proponerte una progresión.</p></div><button class="ghost" id="v20ToggleTrainingConfig">Editar rutina</button></section>
 <section class="v20-day-tabs">${[1,2,3,4,5,6,0].map(d=>`<button class="${d===selected?'active':''}" data-v20-training-day="${d}"><span>${DAYS[d]}</span><small>${plan?.days?.some(x=>x.weekday===d)?'Rutina':'Libre'}</small></button>`).join('')}</section>
 ${day?`<section class="v20-workout-summary"><div><span>SESIÓN</span><h2>${esc(day.focus)}</h2></div><div><span>OBJETIVO</span><strong>${plan.profile?.minutes||60} min</strong></div><div><span>EJERCICIOS</span><strong>${day.exercises.length}</strong></div><div><span>FECHA</span><strong>${esc(date)}</strong></div></section><section class="v20-workout-list">${day.exercises.map((ex,i)=>exerciseCard(ex,log,date,selected,i)).join('')}</section><section class="v20-session-end"><label>Notas de la sesión<textarea id="v20TrainingNotes" rows="3" placeholder="Técnica, molestias, energía, cambios para la próxima sesión...">${esc(log.notes||'')}</textarea></label><button class="primary" id="v20SaveTraining">GUARDAR SESIÓN</button></section>`:`<section class="v20-rest-day"><div><span>${DAYS[selected]}</span><h2>Día de recuperación / actividad libre</h2><p>No hay una sesión estructurada. Podés descansar, hacer movilidad o editar tu rutina para sumar este día.</p></div><button class="ghost" id="v20OpenTrainingConfig">Editar semana</button></section>`}`;
 root.onclick=e=>{
  const db=e.target.closest('[data-v20-training-day]');if(db){sessionStorage.setItem('v20TrainingDay',db.dataset.v20TrainingDay);renderTraining();return}
  const add=e.target.closest('[data-v20-add-set]');if(add){const ex=day?.exercises.find(x=>x.id===add.dataset.v20AddSet);if(!ex)return;const x=log.exercises[ex.id]||(log.exercises[ex.id]={name:ex.name,sets:defaultSets(ex)});x.sets.push({reps:'',weight:'',rpe:''});save();renderTraining();return}
  const rm=e.target.closest('[data-v20-remove-set]');if(rm){const [id,si]=rm.dataset.v20RemoveSet.split(':');const ex=day?.exercises.find(x=>x.id===id);if(!ex)return;const x=log.exercises[id]||(log.exercises[id]={name:ex.name,sets:defaultSets(ex)});if(x.sets.length>1)x.sets.splice(+si,1);save();renderTraining();return}
  const edit=e.target.closest('[data-v20-edit]');if(edit){const legacy=Q(`[data-edit-training="${CSS.escape(edit.dataset.v20Edit)}"]`);legacy?.click();return}
 };
 Q('#v20SaveTraining')?.addEventListener('click',()=>saveTraining(day,date));
 const toggle=()=>{document.body.classList.toggle('v20-training-config-open');const legacy=Q('.two-col');if(document.body.classList.contains('v20-training-config-open'))setTimeout(()=>legacy?.scrollIntoView({behavior:'smooth',block:'start'}),30)};
 Q('#v20ToggleTrainingConfig')?.addEventListener('click',toggle);Q('#v20OpenTrainingConfig')?.addEventListener('click',toggle);
}

function detailedCook(r){
 const steps=[...(r.steps||[])],ing=(r.ingredients||[]).join(' ').toLowerCase();
 const add=x=>{if(!steps.some(s=>s===x))steps.push(x)};
 if(/pollo/.test(ing))add('Pollo: secá la superficie, condimentá y calentá una sartén a fuego medio-alto durante 2 minutos con una película fina de aceite. Cociná piezas de grosor parejo hasta que el centro alcance 74 °C; un filete de 1,5–2 cm suele tardar aproximadamente 4–6 minutos por lado. Dejá reposar 3 minutos antes de cortar.');
 if(/carne|bife|milanesa/.test(ing))add('Carne: secá la superficie y precalentá bien la sartén antes de apoyar el corte. Dejá que dore sin moverlo constantemente. El tiempo depende del grosor; la carne picada debe cocinarse completamente. Los cortes enteros mejoran si reposan unos minutos antes de servir.');
 if(/papa|batata/.test(ing))add('Papa o batata: para hervir, cortá piezas parejas, empezá con agua fría y sal, llevá a hervor suave y cociná hasta que un cuchillo entre sin resistencia, normalmente 15–25 minutos. Para horno, usá 200 °C, una capa fina de aceite y separá las piezas para que doren.');
 if(/arroz/.test(ing))add('Arroz: como guía general usá 1 parte de arroz por aproximadamente 2 de agua. Llevá a hervor, bajá al mínimo, tapá y cociná sin revolver hasta absorber. Apagá, esperá 5 minutos y soltá con tenedor.');
 if(/pasta|fideo|spaghetti|raviol/.test(ing))add('Pasta: usá abundante agua. Cuando hierva, agregá sal, incorporá la pasta y revolvé al principio. Probá antes del tiempo máximo del paquete y escurrí cuando esté al punto que te guste. Reservá un poco del agua si vas a mezclarla con salsa.');
 if(/huevo/.test(ing))add('Huevos revueltos: batí sólo hasta integrar. Cociná a fuego medio-bajo moviendo con espátula y retiralos cuando todavía estén ligeramente húmedos porque continúan cocinándose con el calor residual.');
 return steps;
}
function mealLabel(t){return({breakfast:'DESAYUNO',lunch:'ALMUERZO',snack:'COLACIÓN',dinner:'CENA'})[t]||'COMIDA'}
function nutritionDayIndex(){const saved=sessionStorage.getItem('v20NutritionDay');return saved!==null?Number(saved):(new Date().getDay()+6)%7}
function mealImage(i){return `assets/images/food/meal-${i%4+1}.webp`}
function renderNutrition(){
 if(!isNutrition)return;const main=Q('main'),root=ensureRoot('nutritionV20',main);if(!root)return;
 [...main.children].forEach(el=>{if(el!==root)el.classList.add('v20-nutrition-legacy')});
 const plan=state.dietPlan,sel=Math.max(0,Math.min(6,nutritionDayIndex()));
 if(!plan||plan.error){root.innerHTML=`<section class="v20-page-intro"><div><div class="eyebrow">NUTRICIÓN</div><h1>Tu alimentación diaria</h1><p>Primero configurá una semana base. Después esta pantalla se transforma en tu menú diario con recetas paso a paso.</p></div><button class="primary" id="v20NutritionConfig">Configurar alimentación</button></section><section class="v20-empty-state"><h2>Tu plan todavía no está preparado</h2><p>Usá la configuración existente para crear las siete jornadas.</p></section>`;Q('#v20NutritionConfig')?.addEventListener('click',toggleNutritionConfig);return}
 const d=plan.days[sel%plan.days.length];
 root.innerHTML=`<section class="v20-page-intro"><div><div class="eyebrow">NUTRICIÓN · ${DIET_DAYS[sel]}</div><h1>Qué comés hoy</h1><p>Elegí el día, revisá tus comidas y abrí la receta cuando la necesites. La configuración queda en segundo plano.</p></div><button class="ghost" id="v20NutritionConfig">Editar plan</button></section>
 <section class="v20-day-tabs nutrition">${DIET_DAYS.map((x,i)=>`<button class="${i===sel?'active':''}" data-v20-nut-day="${i}"><span>${x}</span><small>${plan.days[i]?.totals?.kcal||'—'} kcal</small></button>`).join('')}</section>
 <section class="v20-macro-strip"><div><span>CALORÍAS</span><strong>${d.totals.kcal}</strong></div><div><span>PROTEÍNAS</span><strong>${d.totals.p} g</strong></div><div><span>CARBOHIDRATOS</span><strong>${d.totals.c} g</strong></div><div><span>GRASAS</span><strong>${d.totals.f} g</strong></div></section>
 <section class="v20-meal-list">${d.meals.map((m,i)=>{const r=(typeof G30_MEALS!=='undefined'?G30_MEALS:[]).find(x=>x.id===m.id)||m;return `<article class="v20-meal-card"><img src="${mealImage(i)}" alt="${esc(m.name)}"><div class="v20-meal-main"><header><div><span>${mealLabel(m.type)}</span><h2>${esc(m.name)}</h2><p>${m.kcal} kcal · P ${m.p} g · C ${m.c} g · G ${m.f} g</p></div><button class="v20-icon-action" data-v20-swap="${sel}:${i}">Cambiar</button></header><details><summary>Receta paso a paso</summary><div class="v20-recipe"><div><h4>Ingredientes</h4><ul>${(r.ingredients||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>Preparación</h4><ol>${detailedCook(r).map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p class="v20-food-safety">Prepará los ingredientes antes de encender el fuego, evitá contaminación cruzada y cociná completamente carnes y huevos cuando corresponda.</p></div></div></details></div></article>`}).join('')}</section>`;
 root.onclick=e=>{const db=e.target.closest('[data-v20-nut-day]');if(db){sessionStorage.setItem('v20NutritionDay',db.dataset.v20NutDay);renderNutrition();return}const sw=e.target.closest('[data-v20-swap]');if(sw){const [di,mi]=sw.dataset.v20Swap.split(':').map(Number);const legacy=Q(`[data-g30-meal-edit="${di}:${mi}"]`)||Q(`[data-swap-meal="${di}:${mi}"]`);if(legacy){legacy.click()}}};
 Q('#v20NutritionConfig')?.addEventListener('click',toggleNutritionConfig);
}
function toggleNutritionConfig(){document.body.classList.toggle('v20-nutrition-config-open');const legacy=Q('.diet-hero');if(document.body.classList.contains('v20-nutrition-config-open'))setTimeout(()=>legacy?.scrollIntoView({behavior:'smooth',block:'start'}),30)}

function renderAcademy(){
 if(pg!=='academy')return;const main=Q('main');if(!main)return;
 Q('.academy-recipes')?.classList.add('v20-hidden');Q('.v16-module-hero')?.classList.add('v20-hidden');
 const academy=main.querySelector('section.card:not(.academy-recipes)');if(!academy)return;academy.classList.add('v20-academy-core');
 let intro=Q('#academyIntroV20');if(!intro){intro=document.createElement('section');intro.id='academyIntroV20';intro.className='v20-page-intro';academy.insertAdjacentElement('beforebegin',intro)}
 const completed=Object.values(state.academyProgress||{}).filter(x=>x.completed).length;
 intro.innerHTML=`<div><div class="eyebrow">ACADEMIA</div><h1>Aprender para aplicar</h1><p>Acá sólo vive el aprendizaje: rutas, lecciones, pruebas y certificaciones. Nutrición y recetas quedan en su pantalla diaria.</p></div><div class="v20-academy-count"><strong>${completed}</strong><span>lecciones completadas</span></div>`;
 const head=academy.querySelector(':scope > .section-head');if(head)head.classList.add('v20-academy-original-head');
}

function renderMore(){
 if(pg!=='more')return;const main=Q('main'),root=ensureRoot('moreV20',main);if(!root)return;
 [...main.children].forEach(el=>{if(el!==root)el.classList.add('v20-more-legacy')});
 const items=[['perfil.html','Perfil','Tu ficha, habilidades y métricas físicas.','user.svg'],['progreso.html','Progreso','Evolución de atributos, entrenamiento y hábitos.','chart.svg'],['historial.html','Historial','Todo lo que hiciste día por día.','clock.svg'],['habilidades.html','Habilidades','Tus 20 skills y la evidencia que sostiene cada nivel.','flame.svg'],['combate.html','Arena','Combates contra el Sistema y versus local.','sword.svg'],['tienda.html','Tienda','Monedas, desbloqueos y personalización.','bag.svg'],['cuenta.html','Cuenta','Datos, backup, privacidad y configuración.','gear.svg']];
 root.innerHTML=`<section class="v20-page-intro compact"><div><div class="eyebrow">MÁS</div><h1>Herramientas y perfil</h1><p>Lo secundario queda acá para que las cuatro pantallas diarias sigan limpias.</p></div></section><nav class="v20-more-list">${items.map(([href,title,desc,icon])=>`<a href="${href}" class="v20-more-item"><img src="assets/icons/${icon}" alt=""><div><strong>${title}</strong><small>${desc}</small></div><span>›</span></a>`).join('')}</nav>`;
}

function cleanupAfterLegacy(){
 hideVisualLegacy();normalizeHeader();
 if(pg==='home')QA('#generalDailyCommand,.home-panel,.g30-home-card,.system-scores,.home-profile-v8,.upgrade-banner').forEach(x=>x.classList.add('v20-legacy'));
 if(pg==='training')QA('#trainingCoachV19,.training-hero,.two-col,main>.card.section-space').forEach(x=>x.classList.add('v20-training-legacy'));
 if(isNutrition)QA('#nutritionDailyV19,.diet-hero,.diet-library-note,#dietResults,#dietTracker').forEach(x=>x.classList.add('v20-nutrition-legacy'));
 if(pg==='more')QA('.more-hero,.more-grid').forEach(x=>x.classList.add('v20-more-legacy'));
}
function init(){cleanupAfterLegacy();renderGeneral();renderTraining();renderNutrition();renderAcademy();renderMore()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
setTimeout(init,420);setTimeout(init,900);
// Si se guarda/edita una rutina con los controles heredados, refrescamos la vista limpia.
document.addEventListener('click',e=>{if(pg==='training'&&['saveTrainingEdit','deleteTrainingEdit','avoidTrainingEdit'].includes(e.target?.id))setTimeout(renderTraining,120);if(isNutrition&&e.target?.closest?.('#regenerateDietBtn,#dietForm button[type="submit"],#saveG30Meal,#dislikeG30Meal'))setTimeout(renderNutrition,140)});
document.addEventListener('submit',e=>{if(pg==='training'&&e.target?.id==='trainingForm')setTimeout(renderTraining,140);if(isNutrition&&e.target?.id==='dietForm')setTimeout(renderNutrition,140)});
})();
