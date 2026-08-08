(()=>{
state.version=12;
state.ui=state.ui||{};
try{localStorage.setItem(storeKey,JSON.stringify(state))}catch(e){}

// Coliseo: cada dominio entra como una etapa propia.
const domainCopy={
 work:{n:'01',title:'Trabajo y contexto',text:'Primero entendemos tu realidad: qué hacés, cómo trabajás y qué responsabilidades sostenés.'},
 activity:{n:'02',title:'Actividad y nutrición',text:'Ahora medimos cómo se mueve, recupera y alimenta tu cuerpo.'},
 intellect:{n:'03',title:'Intelecto',text:'El Coliseo cambia: lógica, aprendizaje, criterio y resolución de problemas.'},
 character:{n:'04',title:'Carisma y rendimiento',text:'Último dominio: cómo actuás con personas, presión, disciplina y responsabilidad.'}
};
let lastAssessmentDomain=null,domainTimer=null;
if(typeof renderAssessmentQuestion==='function'){
 const renderAssessmentQuestionBeforeV12=renderAssessmentQuestion;
 renderAssessmentQuestion=function(){
   renderAssessmentQuestionBeforeV12();
   const key=assessmentSession?.current?.sectionKey;
   if(page!=='assessment'||!key||key===lastAssessmentDomain)return;
   lastAssessmentDomain=key;const d=domainCopy[key]||domainCopy.work,ov=$('#domainTransition');if(!ov)return;
   $('#domainTransitionNumber').textContent=d.n;$('#domainTransitionTitle').textContent=d.title;$('#domainTransitionText').textContent=d.text;
   ov.classList.remove('hidden');window.VIDA_SOUND?.play?.('level');clearTimeout(domainTimer);domainTimer=setTimeout(()=>ov.classList.add('hidden'),1450);
 }
}

// Una configuración inicial; después se muestra sólo un resumen hasta pedir cambios.
function dietSummary(){const p=state.dietProfile||{};const goals={lose:'Bajar grasa/peso',maintain:'Mantener peso',gain:'Ganar peso/músculo'},styles={omnivore:'Omnívoro',vegetarian:'Vegetariano',vegan:'Vegano'};return `<strong>${goals[p.goal]||'Objetivo'}</strong><span>${p.meals||4} comidas · ${styles[p.style]||'—'} · ${p.budget==='low'?'presupuesto económico':'presupuesto flexible'}</span>`}
function syncDietConfig(open=null){if(page!=='diet')return;const form=$('#dietForm'),sum=$('#dietConfigSummary'),btn=$('#toggleDietConfig'),configured=!!state.dietPlan&&!state.dietPlan.error;let show=open===null?!configured:open;if(!configured)show=true;form?.classList.toggle('config-collapsed',!show);sum?.classList.toggle('hidden',show);btn?.classList.toggle('hidden',!configured&&show);if(sum)sum.innerHTML=dietSummary();if(btn)btn.textContent=show?'Cerrar configuración':'Modificar configuración'}
function trainingSummary(){const p=state.trainingProfile||{},goals={general:'Salud y físico general',strength:'Fuerza',hypertrophy:'Hipertrofia',performance:'Rendimiento'},loc={gym:'Gimnasio',home:'Casa / peso corporal'};return `<strong>${goals[p.goal]||'Rutina'}</strong><span>${(p.weekdays||[]).length} días · ${p.minutes||60} min · ${loc[p.location]||'—'}</span>`}
function syncTrainingConfig(open=null){if(page!=='training')return;const form=$('#trainingForm'),sum=$('#trainingConfigSummary'),btn=$('#toggleTrainingConfig'),configured=!!state.trainingPlan;let show=open===null?!configured:open;if(!configured)show=true;form?.classList.toggle('config-collapsed',!show);sum?.classList.toggle('hidden',show);btn?.classList.toggle('hidden',!configured&&show);if(sum)sum.innerHTML=trainingSummary();if(btn)btn.textContent=show?'Cerrar configuración':'Recalibrar rutina'}
if(page==='diet'){syncDietConfig();$('#toggleDietConfig')?.addEventListener('click',()=>syncDietConfig($('#dietForm')?.classList.contains('config-collapsed')));$('#dietForm')?.addEventListener('submit',()=>setTimeout(()=>syncDietConfig(false),40))}
if(page==='training'){syncTrainingConfig();$('#toggleTrainingConfig')?.addEventListener('click',()=>syncTrainingConfig($('#trainingForm')?.classList.contains('config-collapsed')));$('#trainingForm')?.addEventListener('submit',()=>setTimeout(()=>syncTrainingConfig(false),40))}

// Fuerza: el usuario elige métricas relevantes para su actividad.
const strengthMetrics={
 gym:[['Press de banca','kg',100],['Sentadilla','kg',140],['Peso muerto','kg',180],['Prensa de piernas','kg',220],['Remo con barra','kg',100],['Jalón al pecho','kg',90],['Press de hombros','kg',65],['Hip thrust','kg',160],['Dominadas estrictas','reps',15],['Fondos estrictos','reps',20]],
 calisthenics:[['Flexiones estrictas','reps',50],['Dominadas estrictas','reps',15],['Fondos estrictos','reps',20],['Sentadillas a peso corporal','reps',80],['Pike push-ups','reps',25],['Zancadas alternadas','reps',60],['Plancha','s',120],['Hollow hold','s',90]],
 sport:[['Flexiones estrictas','reps',50],['Dominadas estrictas','reps',15],['Sentadilla goblet','kg',48],['Farmer carry por mano','kg',40],['Lanzamiento de balón medicinal','m',8],['Plancha','s',120],['Zancadas con carga','kg',40],['Fondos estrictos','reps',20]],
 physicalwork:[['Levantamiento desde el suelo','kg',80],['Transporte manual 20 m','kg',60],['Farmer carry por mano','kg',40],['Subida a escalón con carga','kg',40],['Sentadilla con carga','kg',70],['Flexiones estrictas','reps',45],['Remo con carga','kg',60],['Sostén de carga','s',90]],
 general:[['Flexiones estrictas','reps',40],['Sentadillas a peso corporal','reps',70],['Dominadas estrictas','reps',10],['Plancha','s',100],['Farmer carry por mano','kg',32],['Sentadilla goblet','kg',40],['Zancadas alternadas','reps',50],['Press con mancuernas','kg',30]]
};
function renderMetricOptions(){if(page!=='profile')return;const type=$('#strengthActivityType')?.value||'gym',box=$('#strengthMetricOptions');if(!box)return;const selected=new Set((state.strength||[]).map(x=>x.name));box.innerHTML=(strengthMetrics[type]||[]).map((m,i)=>`<label class="metric-option"><input type="checkbox" value="${i}" ${selected.has(m[0])?'checked':''}><span><strong>${escapeHtml(m[0])}</strong><small>Referencia ${m[2]} ${m[1]}</small></span></label>`).join('')}
function applyMetrics(){const type=$('#strengthActivityType')?.value||'gym',all=strengthMetrics[type]||[],idx=$$('#strengthMetricOptions input:checked').map(x=>+x.value).slice(0,6);if(!idx.length)return toast('Elegí al menos una métrica.','warn');const previous=Object.fromEntries((state.strength||[]).map(x=>[x.name,x]));state.strength=idx.map(i=>{const [name,unit,max]=all[i],old=previous[name];return{name,current:old?.current||0,max:old?.max||max,unit}});while(state.strength.length<6)state.strength.push({name:`Métrica ${state.strength.length+1}`,current:0,max:100,unit:''});state.useMeasuredStrength=state.strength.some(x=>+x.current>0);state.strengthActivityType=type;localStorage.setItem(storeKey,JSON.stringify(state));renderStrengthV12();toast('Métricas de Fuerza actualizadas.','good')}
function renderStrengthV12(){if(page!=='profile'||!$('#strengthTable'))return;const rows=state.strength||[],scores=rows.map(x=>+x.max>0?clamp(+x.current/+x.max*100):0);$('#forceScore').textContent=baseSkillScore('Fuerza');$('#strengthModeNote').textContent=state.useMeasuredStrength&&measuredStrengthRows().length?'La Fuerza usa las métricas reales que elegiste. Podés cambiarlas cuando cambie tu actividad.':'Elegí pruebas que puedas repetir y después cargá datos reales para aumentar la confianza.';$('#strengthTable').innerHTML=rows.map((x,i)=>`<tr><td><input class="exercise-name" data-strength-name="${i}" value="${escapeHtml(x.name)}"></td><td><input type="number" step="0.5" min="0" data-strength="${i}" value="${x.current}"> ${escapeHtml(x.unit||'')}</td><td><input type="number" step="0.5" min="1" data-strength-max="${i}" value="${x.max}"> ${escapeHtml(x.unit||'')}</td><td>${Math.round(scores[i])}</td></tr>`).join('')}
if(page==='profile'){
 $('#strengthActivityType').value=state.strengthActivityType||((state.assessmentWorkContext?.workType==='manual'||['construction','industrial','warehouse','fieldwork','maintenance'].includes(state.assessmentWorkContext?.area))?'physicalwork':'gym');renderMetricOptions();renderStrengthV12();
 $('#strengthActivityType')?.addEventListener('change',renderMetricOptions);$('#applyStrengthMetrics')?.addEventListener('click',applyMetrics);$('#strengthTable')?.addEventListener('change',()=>setTimeout(renderStrengthV12,0));
}

// Home: perfil siempre tiene acceso directo visible.
if(page==='home'&&typeof renderHome==='function'){setTimeout(()=>{$('.home-profile-link')?.setAttribute('title','Abrir perfil completo')},0)}
})();
