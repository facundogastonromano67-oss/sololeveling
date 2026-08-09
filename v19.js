(()=>{
if(typeof state==='undefined') return;
const pg=document.body?.dataset?.page||'';
const file=(location.pathname.split('/').pop()||'index.html');
const isNutrition=file==='nutricion.html';
const Q=s=>document.querySelector(s), QA=s=>[...document.querySelectorAll(s)];
const key=typeof storeKey!=='undefined'?storeKey:'vidaRpgStateV8';
const esc=s=>typeof escapeHtml==='function'?escapeHtml(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch(e){console.warn(e)}};
const DAYS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function simplifyNavigation(){
 const items=[['index.html','General','⌂'],['entrenamiento.html','Entrenamiento','◆'],['nutricion.html','Nutrición','◈'],['academia.html','Academia','▤'],['mas.html','Más','☰']];
 QA('.desktop-nav').forEach(nav=>nav.innerHTML=items.map(([h,l])=>`<a href="${h}" class="${(pg==='home'&&h==='index.html')||(pg==='training'&&h==='entrenamiento.html')||(isNutrition&&h==='nutricion.html')||(pg==='academy'&&h==='academia.html')||(pg==='more'&&h==='mas.html')?'active':''}">${l}</a>`).join(''));
 QA('.mobile-nav').forEach(nav=>nav.innerHTML=items.map(([h,l,i])=>`<a href="${h}" class="${(pg==='home'&&h==='index.html')||(pg==='training'&&h==='entrenamiento.html')||(isNutrition&&h==='nutricion.html')||(pg==='academy'&&h==='academia.html')||(pg==='more'&&h==='mas.html')?'active':''}"><span>${i}</span>${l}</a>`).join(''));
}

function g30Summary(){
 const ready=!!state.improvementPlan?.questionnaireComplete || !!state.assessmentComplete;
 const d=typeof g30Day==='function'?g30Day():1;
 return {ready,d,stage:typeof g30Stage==='function'?g30Stage(d):'Transformación'};
}

function renderGeneralDaily(){
 if(pg!=='home')return;
 // Ocultamos módulos duplicados: G30 queda como eje visible, no como pantalla generadora.
 QA('.home-panel').forEach(p=>{
   const text=p.textContent||'';
   if(/DIETA SEMANAL|RUTINA SEMANAL|MÓDULOS DEL SISTEMA/.test(text))p.classList.add('g30-legacy-hidden');
 });
 const g=Q('#g30HomeCard');
 if(g){
   const a=Q('#g30HomeAction'); if(a){a.removeAttribute('href');a.textContent='Plan generado desde el Coliseo';a.classList.add('g30-plan-locked');}
 }
 let box=Q('#generalDailyCommand');
 if(!box){box=document.createElement('section');box.id='generalDailyCommand';box.className='card section-space general-command';(g||Q('main')?.firstElementChild)?.insertAdjacentElement('afterend',box)}
 const daily=typeof ensureDailyMissions==='function'?ensureDailyMissions():{items:[]};
 const day=typeof getDay==='function'?getDay():{tasks:[]};
 const tasks=(day.tasks||[]).filter(t=>!t.source||t.source!=='system');
 const meta=g30Summary();
 box.innerHTML=`<div class="section-head"><div><div class="eyebrow">GENERAL · DÍA ${meta.d}/30</div><h2>Tu tablero de hoy</h2><p class="muted">El Sistema reúne acá lo que tenés que hacer hoy. No necesitás ir a otra pantalla para entender el día.</p></div><span class="pill gold">${esc(meta.stage)}</span></div>
 <div class="general-two-col section-space">
  <div class="daily-block"><div class="daily-block-title"><span>SISTEMA</span><strong>Misiones asignadas</strong></div><div id="generalSystemMissions">${(daily.items||[]).map(m=>`<label class="general-task ${m.done?'done':''}"><input type="checkbox" data-v19-mission="${esc(m.id)}" ${m.done?'checked':''}><div><strong>${esc(m.text)}</strong><small>${esc(m.skill||'Desarrollo')} · +${m.xp||0} XP</small></div></label>`).join('')||'<div class="empty">El Sistema todavía no asignó misiones.</div>'}</div></div>
  <div class="daily-block"><div class="daily-block-title"><span>VIDA REAL</span><strong>Tareas diarias</strong></div><div id="generalDailyTasks">${tasks.map(t=>`<label class="general-task ${t.done?'done':''}"><input type="checkbox" data-v19-task="${esc(t.id)}" ${t.done?'checked':''}><div><strong>${esc(t.text)}</strong><small>${esc(t.category||'Personal')} · +${t.xp||0} XP</small></div></label>`).join('')||'<div class="empty">No tenés tareas personales cargadas para hoy.</div>'}</div><div class="inline-task-add section-space"><input id="v19NewTask" placeholder="Agregar tarea personal..."><button class="ghost small-btn" id="v19AddTask">Agregar</button></div></div>
 </div>`;
 Q('#v19AddTask')?.addEventListener('click',()=>{const inp=Q('#v19NewTask'),text=inp?.value?.trim();if(!text)return;const d=typeof getDay==='function'?getDay():day;d.tasks=d.tasks||[];d.tasks.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),text,category:'Rendimiento',skill:'Organización',xp:1,done:false,custom:true});save();renderGeneralDaily()});
 box.onchange=e=>{
   const mid=e.target.dataset.v19Mission,tid=e.target.dataset.v19Task;
   if(mid&&typeof toggleSystemMission==='function'){toggleSystemMission(mid,e.target.checked);setTimeout(renderGeneralDaily,0);return}
   if(tid){const t=(typeof getDay==='function'?getDay():day).tasks.find(x=>x.id===tid);if(t){t.done=e.target.checked;save();if(typeof renderHome==='function')renderHome();setTimeout(renderGeneralDaily,0)}}
 };
}

function weekDateFor(day){const now=new Date(),monday=new Date(now),offset=(now.getDay()+6)%7,target=(Number(day)+6)%7;monday.setDate(now.getDate()-offset+target);return (typeof dateKey==='function'?dateKey(monday):monday.toISOString().slice(0,10));}
function previousTrainingLog(ex,currentDate){
 const logs=state.trainingDetailedLogs||{};return Object.entries(logs).filter(([d])=>d<currentDate).sort(([a],[b])=>b.localeCompare(a)).map(([,v])=>{const exercises=v.exercises||{};return exercises[ex.id]||Object.values(exercises).find(x=>(ex.catalogId&&x.catalogId===ex.catalogId)||(!x.catalogId&&x.name===ex.name))}).find(Boolean)||null;
}
function renderTrainingCoach(){
 if(pg!=='training')return;
 state.trainingDetailedLogs=state.trainingDetailedLogs||{};
 const old=Q('#trainingCoachV19');if(old)old.remove();
 const anchor=Q('.training-hero')||Q('main')?.firstElementChild;if(!anchor)return;
 const panel=document.createElement('section');panel.id='trainingCoachV19';panel.className='card section-space trainer-coach';anchor.insertAdjacentElement('afterend',panel);
 const selected=Number(sessionStorage.getItem('v19TrainingDay')??new Date().getDay());
 const plan=state.trainingPlan;const day=plan?.days?.find(d=>d.weekday===selected);
 const date=weekDateFor(selected);const log=state.trainingDetailedLogs[date]||(state.trainingDetailedLogs[date]={date,weekday:selected,exercises:{},notes:''});
 panel.innerHTML=`<div class="section-head"><div><div class="eyebrow">ENTRENADOR PERSONAL</div><h2>Sesión y cuaderno de entrenamiento</h2><p class="muted">Elegí un día. Arriba ves qué toca; abajo registrás exactamente lo que hiciste.</p></div><span class="pill gold">${DAYS[selected]}</span></div>
 <div class="weekday-tabs section-space">${[1,2,3,4,5,6,0].map(d=>`<button class="${d===selected?'active':''}" data-v19-training-day="${d}">${DAYS[d]}</button>`).join('')}</div>
 ${day?`<div class="coach-summary"><div><span>OBJETIVO DEL DÍA</span><strong>${esc(day.focus)}</strong></div><div><span>DURACIÓN OBJETIVO</span><strong>${plan.profile.minutes} min</strong></div><div><span>EJERCICIOS</span><strong>${day.exercises.length}</strong></div></div>
 <div class="workout-log section-space">${day.exercises.map((ex,idx)=>exerciseLogger(ex,log,date,idx)).join('')}</div>
 <label class="field section-space">Notas de la sesión<textarea id="v19TrainingNotes" rows="3" placeholder="Técnica, molestias, energía, qué cambiar la próxima vez...">${esc(log.notes||'')}</textarea></label>
 <button class="primary wide section-space" id="saveV19Training">GUARDAR SESIÓN</button>`:`<div class="rest-card section-space"><strong>${DAYS[selected]} · Recuperación / actividad libre</strong><p class="muted">No hay una sesión estructurada para este día. Podés recalibrar la rutina si querés entrenar acá.</p></div>`}`;
 panel.onclick=e=>{const b=e.target.closest('[data-v19-training-day]');if(b){sessionStorage.setItem('v19TrainingDay',b.dataset.v19TrainingDay);renderTrainingCoach()}}
 Q('#saveV19Training')?.addEventListener('click',()=>saveTrainingNotebook(day,date));
}
function exerciseLogger(ex,log,date,idx){
  const saved=log.exercises[ex.id]||{catalogId:ex.catalogId||'',sets:[{reps:'',weight:'',rpe:''},{reps:'',weight:'',rpe:''},{reps:'',weight:'',rpe:''}]};
  const prev=previousTrainingLog(ex,date);let cue='Registrá una referencia limpia hoy; después el entrenador va a comparar sesiones.';
 if(prev?.sets?.length){const pw=Math.max(...prev.sets.map(s=>Number(s.weight)||0)),pr=Math.max(...prev.sets.map(s=>Number(s.reps)||0));cue=`Última referencia: hasta ${pw||'—'} kg · ${pr||'—'} reps. Si la técnica fue buena, buscá una mejora pequeña, no heroica.`}
 return `<article class="exercise-notebook"><div class="exercise-log-head"><div><span>EJERCICIO ${idx+1}</span><h3>${esc(ex.name)}</h3><p>${esc(ex.prescription)} · ${esc(ex.muscle||'')}</p></div><button class="ghost tiny-action" data-v19-add-set="${esc(ex.id)}">+ serie</button></div><div class="coach-cue">${esc(cue)}</div><div class="set-grid"><div class="set-row set-head"><b>Serie</b><b>Reps</b><b>Peso kg</b><b>RPE</b></div>${saved.sets.map((s,i)=>`<div class="set-row"><b>${i+1}</b><input inputmode="numeric" type="number" min="0" step="1" data-log-ex="${esc(ex.id)}" data-set="${i}" data-field="reps" value="${esc(s.reps)}"><input inputmode="decimal" type="number" min="0" step="0.5" data-log-ex="${esc(ex.id)}" data-set="${i}" data-field="weight" value="${esc(s.weight)}"><input inputmode="decimal" type="number" min="1" max="10" step="0.5" data-log-ex="${esc(ex.id)}" data-set="${i}" data-field="rpe" value="${esc(s.rpe)}"></div>`).join('')}</div></article>`
}
function saveTrainingNotebook(day,date){
 const log=state.trainingDetailedLogs[date];if(!day||!log)return;
 day.exercises.forEach(ex=>{const rows=QA(`[data-log-ex="${CSS.escape(ex.id)}"]`);const sets=[];rows.forEach(inp=>{const i=+inp.dataset.set;sets[i]=sets[i]||{};sets[i][inp.dataset.field]=inp.value});log.exercises[ex.id]={name:ex.name,catalogId:ex.catalogId||'',sets:sets.filter(Boolean)}});log.notes=Q('#v19TrainingNotes')?.value||'';log.savedAt=new Date().toISOString();save();if(typeof toast==='function')toast('Sesión guardada. Ya forma parte de tu progreso de entrenamiento.','good');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-v19-add-set]');if(!b||pg!=='training')return;const id=b.dataset.v19AddSet,date=weekDateFor(Number(sessionStorage.getItem('v19TrainingDay')??new Date().getDay()));const log=state.trainingDetailedLogs[date]||(state.trainingDetailedLogs[date]={exercises:{}});const ex=state.trainingPlan?.days?.flatMap(d=>d.exercises).find(x=>x.id===id);if(!ex)return;const s=log.exercises[id]||(log.exercises[id]={name:ex.name,catalogId:ex.catalogId||'',sets:[{reps:'',weight:'',rpe:''},{reps:'',weight:'',rpe:''},{reps:'',weight:'',rpe:''}]});s.sets.push({reps:'',weight:'',rpe:''});save();renderTrainingCoach()});

function detailedCook(r){
 const ing=(r.ingredients||[]).join(' ').toLowerCase();const extra=[];
 if(/pollo/.test(ing))extra.push('Para el pollo: secá la superficie, condimentá, calentá una sartén 2 minutos a fuego medio-alto con una película fina de aceite y cociná piezas de grosor parejo hasta que el centro llegue a 74 °C. Si son filetes de 1,5–2 cm suelen necesitar unos 4–6 minutos por lado. Dejá reposar 3 minutos antes de cortar.');
 if(/carne|bife|milanesa/.test(ing))extra.push('Para la carne: sacala de la heladera unos minutos antes, secá la superficie, condimentá y precalentá bien la sartén. Cociná sin mover constantemente para que dore. El tiempo depende del corte y grosor; si es carne picada asegurate de cocinarla completamente. Dejá reposar los cortes enteros antes de servir.');
 if(/papa|batata/.test(ing))extra.push('Para papa o batata hervida: cortá piezas parejas, comenzá en agua fría con sal, llevá a hervor suave y cociná hasta que un cuchillo entre sin resistencia, normalmente 15–25 minutos según el tamaño. Para horno: 200 °C, aceite fino y piezas separadas hasta dorar.');
 if(/arroz/.test(ing))extra.push('Para el arroz: enjuagalo si la variedad lo requiere. Como base, usá aproximadamente 1 parte de arroz por 2 de agua, llevá a hervor, bajá el fuego, tapá y cociná sin revolver hasta absorber. Apagá y dejá reposar 5 minutos antes de soltar los granos con tenedor.');
 if(/pasta|fideo|spaghetti|raviol/.test(ing))extra.push('Para la pasta: usá una olla amplia con abundante agua. Cuando hierva, agregá sal, incorporá la pasta y revolvé al principio para que no se pegue. Probá antes del tiempo máximo indicado en el paquete y escurrí cuando esté al punto que te guste; reservá un poco del agua de cocción si vas a mezclarla con salsa.');
 if(/huevo/.test(ing))extra.push('Para huevos revueltos: batilos sólo hasta integrar, usá fuego medio-bajo y mové con espátula; retiralos cuando todavía estén ligeramente húmedos porque siguen cocinándose con el calor residual.');
 return [...(r.steps||[]),...extra];
}
function renderNutritionDaily(){
 if(!isNutrition)return;
 const wrap=Q('#nutritionDailyV19');if(!wrap)return;
 const plan=state.dietPlan;const selected=Number(sessionStorage.getItem('v19NutritionDay')||0);
 if(!plan||plan.error){wrap.innerHTML='<div class="card"><div class="empty">Todavía no hay alimentación G30. Completá la configuración de abajo para crearla.</div></div>';return}
 const d=plan.days[selected%plan.days.length];
 wrap.innerHTML=`<section class="card nutrition-today"><div class="section-head"><div><div class="eyebrow">NUTRICIÓN · SEMANA G30</div><h2>Tu alimentación por día</h2><p class="muted">Elegí el día, revisá las comidas y abrí la preparación completa sin salir de esta pantalla.</p></div><span class="pill gold">${d.totals.kcal} kcal</span></div><div class="weekday-tabs section-space">${plan.days.map((x,i)=>`<button data-v19-nut-day="${i}" class="${i===selected?'active':''}">Día ${i+1}</button>`).join('')}</div><div class="nutrition-meals section-space">${d.meals.map((m,i)=>{const r=(typeof G30_MEALS!=='undefined'?G30_MEALS:[]).find(x=>x.id===m.id)||m,ingredients=window.VIDA_NUTRITION?.ingredientsForMeal?.(m,r)||(r.ingredients||[]);return `<article class="nutrition-meal"><div class="meal-top"><div><span>${mealLabel(m.type)} · PORCIÓN ×${Number(m.scale||1).toFixed(2)}</span><h3>${esc(m.name)}</h3><p>${m.kcal} kcal · P ${m.p} g · C ${m.c} g · G ${m.f} g</p></div><button class="ghost small-btn" data-swap-v19="${selected}:${i}">Cambiar</button></div><details><summary>Ver receta detallada</summary><div class="recipe-detail"><h4>Ingredientes ajustados</h4><ul>${ingredients.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h4>Cómo prepararlo, paso a paso</h4><ol>${detailedCook(r).map(x=>`<li>${esc(x)}</li>`).join('')}</ol><div class="cooking-note"><strong>Regla práctica:</strong> prepará todos los ingredientes antes de encender el fuego, usá utensilios limpios y no consumas carnes o huevos crudos cuando la receta requiere cocción completa.</div></div></details></article>`}).join('')}</div></section>`;
 wrap.onclick=e=>{const dayBtn=e.target.closest('[data-v19-nut-day]');if(dayBtn){sessionStorage.setItem('v19NutritionDay',dayBtn.dataset.v19NutDay);renderNutritionDaily();return}const sw=e.target.closest('[data-swap-v19]');if(sw&&typeof swapMeal==='function'){const [di,mi]=sw.dataset.swapV19.split(':').map(Number);swapMeal(di,mi);setTimeout(renderNutritionDaily,0)}};
}
function mealLabel(t){return({breakfast:'DESAYUNO',lunch:'ALMUERZO',snack:'COLACIÓN',dinner:'CENA'})[t]||'COMIDA'}

function renderTrainingProgress(){if(pg!=='progress')return;const main=Q('main');if(!main)return;let box=Q('#trainingProgressV19');if(!box){box=document.createElement('section');box.id='trainingProgressV19';box.className='card section-space';main.appendChild(box)}const logs=Object.values(state.trainingDetailedLogs||{}).sort((a,b)=>(b.date||'').localeCompare(a.date||''));const sessions=logs.filter(l=>Object.keys(l.exercises||{}).length);const recent=sessions.slice(0,6);box.innerHTML=`<div class="eyebrow">PROGRESO DE ENTRENAMIENTO</div><h2>Cuaderno de sesiones</h2><p class="muted">El progreso sale de lo que realmente registraste: series, repeticiones y peso.</p>${recent.length?`<div class="section-space">${recent.map(l=>{const best=[];Object.values(l.exercises||{}).forEach(ex=>{const w=Math.max(0,...(ex.sets||[]).map(s=>Number(s.weight)||0)),r=Math.max(0,...(ex.sets||[]).map(s=>Number(s.reps)||0));best.push(`${esc(ex.name)} · ${w||'—'} kg · ${r||'—'} reps`)});return `<article class="achievement"><strong>${esc(l.date)} · ${DAYS[l.weekday]||''}</strong><span class="note">${best.slice(0,4).map(esc).join('<br>')}</span></article>`}).join('')}</div>`:'<div class="empty section-space">Todavía no registraste sesiones en el cuaderno de entrenamiento.</div>'}`};
function rebuildMore(){if(pg!=='more')return;const grid=Q('.more-grid');if(!grid)return;grid.innerHTML=[
 ['01','perfil.html','Perfil','Tu ficha, habilidades y métricas físicas.','user.svg'],['02','progreso.html','Progreso','Evolución de atributos, entrenamiento y hábitos.','chart.svg'],['03','historial.html','Historial','Todo lo que hiciste día por día.','clock.svg'],['04','habilidades.html','Habilidades','Las 20 skills y su evidencia actual.','flame.svg'],['05','combate.html','Arena','Combates contra el Sistema y versus local.','sword.svg'],['06','tienda.html','Tienda','Monedas, desbloqueos y contenido.','bag.svg'],['07','cuenta.html','Cuenta','Datos, backup y configuración.','gear.svg']].map(x=>`<a class="system-module" href="${x[1]}"><span class="module-index">${x[0]}</span><img class="v19-more-icon" src="assets/icons/${x[4]}" alt=""><div><strong>${x[2]}</strong><small>${x[3]}</small></div><b>›</b></a>`).join('')}

function init(){simplifyNavigation();renderGeneralDaily();renderTrainingCoach();renderNutritionDaily();renderTrainingProgress();rebuildMore();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
setTimeout(init,350);
})();
