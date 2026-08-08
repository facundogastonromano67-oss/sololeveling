(()=>{
  if(typeof state==='undefined')return;
  state.version=Math.max(Number(state.version||0),15);
  const pageName=document.body?.dataset?.page||'';
  const persistKey=typeof storeKey!=='undefined'?storeKey:'vidaRpgStateV8';
  const saveState=()=>{try{localStorage.setItem(persistKey,JSON.stringify(state))}catch(e){}};
  const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
  const esc=s=>typeof escapeHtml==='function'?escapeHtml(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const cap=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
  const weight=()=>Number(state.player?.weight)||70;

  // Fuerza usa la puntuación calibrada de la línea base, no un cociente bruto que podía inflar el resultado.
  const calibratedStrengthScore=()=>{
    const ms=(state.g30PhysicalBaseline?.metrics||[]).filter(m=>m.skill==='Fuerza'&&Number.isFinite(Number(m.score)));
    if(ms.length)return Math.round(ms.reduce((s,m)=>s+Number(m.score),0)/ms.length);
    return Math.round(Number(state.baseSkills?.['Fuerza'])||50);
  };
  try{
    if(typeof rawForceScore==='function')rawForceScore=()=>calibratedStrengthScore();
    if(typeof baseSkillScore==='function'){const previousBaseSkillScore=baseSkillScore;baseSkillScore=(skill)=>skill==='Fuerza'?calibratedStrengthScore():previousBaseSkillScore(skill)}
  }catch(e){}

  // ---------- NÚMEROS: la rueda del mouse navega la página, no altera valores ----------
  function unitStep(metric){return metric.step??(metric.unit==='kg'?.5:metric.unit==='min'?.1:metric.unit==='seg'?.1:1)}
  function integerUnit(metric){return Number(unitStep(metric))===1}
  function normalizeMetricValue(metric,value){
    let v=Number(value);
    if(!Number.isFinite(v)||v<=0)return null;
    const step=unitStep(metric);
    if(step===1)v=Math.round(v);
    else if(step===.5)v=Math.round(v*2)/2;
    else if(step===.1)v=Math.round(v*10)/10;
    return v;
  }
  function tuneNumberInputs(root=document){
    root.querySelectorAll?.('input[type="number"]').forEach(input=>{
      if(!input.getAttribute('step'))input.setAttribute('step','1');
      if(input.closest('.baseline-metric')){
        const unit=input.closest('.baseline-metric')?.querySelector('b')?.textContent?.trim()||'';
        const id=input.dataset.baselineValue||'';
        const step=(unit==='kg'||unit==='min'||(unit==='seg'&&/sprint/i.test(id)))?'.1':'1';
        input.setAttribute('step',step);
        if(step==='1')input.dataset.integerNumber='1';
      }
    });
  }
  tuneNumberInputs();
  document.addEventListener('wheel',e=>{
    const el=e.target;
    if(el instanceof HTMLInputElement&&el.type==='number'&&document.activeElement===el){el.blur()}
  },{capture:true,passive:true});
  document.addEventListener('change',e=>{
    const el=e.target;
    if(el instanceof HTMLInputElement&&el.type==='number'&&el.dataset.integerNumber==='1'&&el.value!=='')el.value=String(Math.round(Number(el.value)||0));
  },true);
  new MutationObserver(muts=>muts.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)tuneNumberInputs(n)}))).observe(document.documentElement,{subtree:true,childList:true});

  // ---------- PERFIL FÍSICO V15 ----------
  const P={
    gym:[
      {id:'bench5',name:'Press de banca · carga para 5 reps técnicas',skill:'Fuerza',unit:'kg',step:.5,ref:()=>weight()*.85,dir:'high'},
      {id:'squat5',name:'Sentadilla · carga para 5 reps técnicas',skill:'Fuerza',unit:'kg',step:.5,ref:()=>weight()*1.15,dir:'high'},
      {id:'deadlift5',name:'Peso muerto · carga para 5 reps técnicas',skill:'Fuerza',unit:'kg',step:.5,ref:()=>weight()*1.35,dir:'high'},
      {id:'legpress8',name:'Prensa de piernas · 8 reps técnicas',skill:'Fuerza',unit:'kg',step:.5,ref:()=>weight()*2.2,dir:'high'},
      {id:'pullups',name:'Dominadas estrictas',skill:'Fuerza',unit:'reps',step:1,ref:()=>10,dir:'high'},
      {id:'run1k',name:'1 km a ritmo exigente controlado',skill:'Resistencia',unit:'min',step:.1,ref:()=>5,dir:'low'},
      {id:'plank',name:'Plancha frontal técnica',skill:'Resistencia',unit:'seg',step:1,ref:()=>90,dir:'high'},
      {id:'broadjump',name:'Salto horizontal desde parado',skill:'Velocidad / Potencia',unit:'cm',step:1,ref:()=>200,dir:'high'},
      {id:'sprint20',name:'Sprint de 20 m',skill:'Velocidad / Potencia',unit:'seg',step:.1,ref:()=>3.7,dir:'low'},
      {id:'deepsquat',name:'Sentadilla profunda controlada (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'},
      {id:'shoulderwall',name:'Flexión de hombro contra pared (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'}
    ],
    calisthenics:[
      {id:'pushups',name:'Flexiones estrictas',skill:'Fuerza',unit:'reps',step:1,ref:()=>35,dir:'high'},
      {id:'pullups',name:'Dominadas estrictas',skill:'Fuerza',unit:'reps',step:1,ref:()=>10,dir:'high'},
      {id:'dips',name:'Fondos estrictos',skill:'Fuerza',unit:'reps',step:1,ref:()=>15,dir:'high'},
      {id:'squats2m',name:'Sentadillas controladas en 2 min',skill:'Fuerza',unit:'reps',step:1,ref:()=>55,dir:'high'},
      {id:'plank',name:'Plancha frontal técnica',skill:'Resistencia',unit:'seg',step:1,ref:()=>90,dir:'high'},
      {id:'run1k',name:'1 km',skill:'Resistencia',unit:'min',step:.1,ref:()=>5,dir:'low'},
      {id:'broadjump',name:'Salto horizontal desde parado',skill:'Velocidad / Potencia',unit:'cm',step:1,ref:()=>200,dir:'high'},
      {id:'burpees1m',name:'Burpees controlados en 1 minuto',skill:'Velocidad / Potencia',unit:'reps',step:1,ref:()=>20,dir:'high'},
      {id:'deepsquat',name:'Sentadilla profunda controlada (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'},
      {id:'safegetup',name:'Levantarse del suelo sin apoyo (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'}
    ],
    cardio:[
      {id:'pushups',name:'Flexiones estrictas',skill:'Fuerza',unit:'reps',step:1,ref:()=>30,dir:'high'},
      {id:'goblet',name:'Sentadilla goblet cómoda para 8 reps',skill:'Fuerza',unit:'kg',step:.5,ref:()=>weight()*.35,dir:'high'},
      {id:'run1k',name:'1 km',skill:'Resistencia',unit:'min',step:.1,ref:()=>5,dir:'low'},
      {id:'run5k',name:'5 km',skill:'Resistencia',unit:'min',step:.1,ref:()=>30,dir:'low'},
      {id:'cooper',name:'Distancia en 12 minutos',skill:'Resistencia',unit:'m',step:1,ref:()=>2400,dir:'high'},
      {id:'broadjump',name:'Salto horizontal desde parado',skill:'Velocidad / Potencia',unit:'cm',step:1,ref:()=>190,dir:'high'},
      {id:'sprint20',name:'Sprint de 20 m',skill:'Velocidad / Potencia',unit:'seg',step:.1,ref:()=>3.9,dir:'low'},
      {id:'sitstand',name:'Sentarse y levantarse de una silla en 30 s',skill:'Velocidad / Potencia',unit:'reps',step:1,ref:()=>16,dir:'high'},
      {id:'deepsquat',name:'Sentadilla profunda controlada (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'},
      {id:'safegetup',name:'Levantarse del suelo sin apoyo (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'}
    ],
    sport:[
      {id:'pushups',name:'Flexiones estrictas',skill:'Fuerza',unit:'reps',step:1,ref:()=>35,dir:'high'},
      {id:'pullups',name:'Dominadas estrictas',skill:'Fuerza',unit:'reps',step:1,ref:()=>10,dir:'high'},
      {id:'carry',name:'Farmer carry por mano · 20 m',skill:'Fuerza',unit:'kg',step:.5,ref:()=>weight()*.35,dir:'high'},
      {id:'rounds',name:'Rounds de 3 min sostenidos con buena técnica',skill:'Resistencia',unit:'rounds',step:1,ref:()=>6,dir:'high'},
      {id:'run1k',name:'1 km',skill:'Resistencia',unit:'min',step:.1,ref:()=>5,dir:'low'},
      {id:'burpees1m',name:'Burpees controlados en 1 minuto',skill:'Resistencia',unit:'reps',step:1,ref:()=>20,dir:'high'},
      {id:'broadjump',name:'Salto horizontal desde parado',skill:'Velocidad / Potencia',unit:'cm',step:1,ref:()=>205,dir:'high'},
      {id:'sprint20',name:'Sprint de 20 m',skill:'Velocidad / Potencia',unit:'seg',step:.1,ref:()=>3.6,dir:'low'},
      {id:'deepsquat',name:'Sentadilla profunda controlada (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'},
      {id:'safegetup',name:'Levantarse del suelo sin apoyo (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'}
    ],
    physicalwork:[
      {id:'floorlift',name:'Levantamiento técnico desde el suelo',skill:'Fuerza',unit:'kg',step:.5,ref:()=>weight()*.9,dir:'high'},
      {id:'carry',name:'Transporte manual 20 m',skill:'Fuerza',unit:'kg',step:.5,ref:()=>weight()*.6,dir:'high'},
      {id:'carryhand',name:'Farmer carry por mano · 20 m',skill:'Fuerza',unit:'kg',step:.5,ref:()=>weight()*.3,dir:'high'},
      {id:'steps2m',name:'Subidas a escalón controladas en 2 min',skill:'Resistencia',unit:'reps',step:1,ref:()=>45,dir:'high'},
      {id:'walk1k',name:'1 km a paso rápido',skill:'Resistencia',unit:'min',step:.1,ref:()=>9,dir:'low'},
      {id:'broadjump',name:'Salto horizontal desde parado',skill:'Velocidad / Potencia',unit:'cm',step:1,ref:()=>180,dir:'high'},
      {id:'sitstand',name:'Sentarse y levantarse de una silla en 30 s',skill:'Velocidad / Potencia',unit:'reps',step:1,ref:()=>16,dir:'high'},
      {id:'safegetup',name:'Levantarse del suelo sin apoyo (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'},
      {id:'deepsquat',name:'Sentadilla profunda controlada (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'}
    ],
    general:[
      {id:'pushups',name:'Flexiones estrictas',skill:'Fuerza',unit:'reps',step:1,ref:()=>30,dir:'high'},
      {id:'squats',name:'Sentadillas a peso corporal en 2 min',skill:'Fuerza',unit:'reps',step:1,ref:()=>55,dir:'high'},
      {id:'plank',name:'Plancha frontal técnica',skill:'Resistencia',unit:'seg',step:1,ref:()=>75,dir:'high'},
      {id:'walk1k',name:'1 km a paso rápido',skill:'Resistencia',unit:'min',step:.1,ref:()=>10,dir:'low'},
      {id:'broadjump',name:'Salto horizontal desde parado',skill:'Velocidad / Potencia',unit:'cm',step:1,ref:()=>170,dir:'high'},
      {id:'sitstand',name:'Sentarse y levantarse de una silla en 30 s',skill:'Velocidad / Potencia',unit:'reps',step:1,ref:()=>16,dir:'high'},
      {id:'safegetup',name:'Levantarse del suelo sin apoyo (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'},
      {id:'deepsquat',name:'Sentadilla profunda controlada (0–3)',skill:'Movilidad',unit:'nivel',step:1,ref:()=>3,dir:'scale'}
    ]
  };
  const skillOrder=['Fuerza','Resistencia','Velocidad / Potencia','Movilidad'];
  const activityFallback=()=>{
    const a=state.g30PhysicalBaseline?.activityType||state.strengthActivityType;
    if(a&&P[a])return a;
    const life=state.assessmentLifestyle?.activityType;
    return life==='strength'?'gym':life==='calisthenics'?'calisthenics':life==='endurance'?'cardio':life==='sport'||life==='mixed'?'sport':life==='manual'?'physicalwork':'general';
  };
  function metricScore(m,v){
    if(m.dir==='scale')return [25,45,65,82][cap(Math.round(v),0,3)]||25;
    const ref=Math.max(.01,Number(m.ref())||1),ratio=m.dir==='low'?ref/Math.max(.01,v):v/ref;
    return Math.round(cap(30+50*ratio,25,90));
  }
  function savedMap(){
    const out={};
    (state.g30PhysicalBaseline?.metrics||[]).forEach(x=>out[x.id]={...x});
    // Migración suave desde el sistema viejo de Fuerza si aún no había línea base completa.
    if(!Object.keys(out).length)(state.strength||[]).forEach(s=>{
      Object.values(P).flat().forEach(m=>{if(m.name===s.name&&Number(s.current)>0)out[m.id]={...m,value:Number(s.current),reference:Number(s.max)||Number(m.ref()),score:metricScore(m,Number(s.current))}})
    });
    return out;
  }
  let draft=savedMap();
  function renderPhysicalScores(){
    const ids={Fuerza:'physicalStrengthScore',Resistencia:'physicalEnduranceScore','Velocidad / Potencia':'physicalPowerScore',Movilidad:'physicalMobilityScore'};
    skillOrder.forEach(skill=>{const el=q('#'+ids[skill]);if(el)el.textContent=String(Math.round(Number(state.baseSkills?.[skill])||0))});
  }
  function renderPhysicalProfile(){
    if(pageName!=='profile'||!q('#physicalMetricGroups'))return;
    const sel=q('#physicalActivityType');
    if(sel&&!sel.dataset.ready){sel.value=activityFallback();sel.dataset.ready='1'}
    const type=sel?.value||activityFallback(),list=P[type]||P.general;
    const groups=skillOrder.map(skill=>[skill,list.filter(m=>m.skill===skill)]).filter(([,arr])=>arr.length);
    q('#physicalMetricGroups').innerHTML=groups.map(([skill,arr])=>`<section class="physical-metric-group"><div class="physical-metric-group-head"><strong>${esc(skill)}</strong><span>Elegí las pruebas que puedas repetir</span></div>${arr.map(m=>{const old=draft[m.id],checked=old&&Number(old.value)>0;const ref=Number(m.ref());const score=checked?metricScore(m,Number(old.value)):null;return `<label class="physical-metric-row"><input type="checkbox" data-pmetric-check="${m.id}" ${checked?'checked':''}><span class="physical-metric-info"><strong>${esc(m.name)}</strong><small>Referencia interna ~${formatRef(m,ref)} ${esc(m.unit)} · ${esc(skill)}</small></span><input class="physical-metric-value" type="number" min="0" step="${unitStep(m)}" ${integerUnit(m)?'data-integer-number="1"':''} data-pmetric-value="${m.id}" value="${checked?esc(old.value):''}" placeholder="valor"><span class="physical-metric-unit">${esc(m.unit)}</span><b class="physical-metric-score" data-pmetric-score="${m.id}">${score??'—'}</b></label>`}).join('')}</section>`).join('');
    qa('[data-pmetric-value]').forEach(input=>input.addEventListener('input',updateDraftFromUi));
    qa('[data-pmetric-check]').forEach(input=>input.addEventListener('change',updateDraftFromUi));
    updatePhysicalStatus();
    renderPhysicalScores();
  }
  function formatRef(m,v){return m.step&&m.step<1?v.toFixed(1):Math.round(v)}
  function currentMetric(type,id){return (P[type]||[]).find(m=>m.id===id)}
  function updateDraftFromUi(){
    const type=q('#physicalActivityType')?.value||activityFallback();
    (P[type]||[]).forEach(m=>{
      const check=q(`[data-pmetric-check="${m.id}"]`),input=q(`[data-pmetric-value="${m.id}"]`);
      const value=normalizeMetricValue(m,input?.value);
      if(check?.checked&&value!==null){draft[m.id]={id:m.id,name:m.name,skill:m.skill,unit:m.unit,dir:m.dir,value,reference:Number(m.ref()),score:metricScore(m,value)}}
      else if(!check?.checked)delete draft[m.id];
      const sc=q(`[data-pmetric-score="${m.id}"]`);if(sc)sc.textContent=check?.checked&&value!==null?String(metricScore(m,value)):'—';
    });
    updatePhysicalStatus();
  }
  function validDraft(){
    const type=q('#physicalActivityType')?.value||activityFallback(),allowed=new Set((P[type]||[]).map(m=>m.id));
    return Object.values(draft).filter(x=>allowed.has(x.id)&&Number(x.value)>0);
  }
  function updatePhysicalStatus(){
    const ms=validDraft(),skills=new Set(ms.map(x=>x.skill)),hasStrength=ms.some(x=>x.skill==='Fuerza'),ok=ms.length>=4&&skills.size>=3&&hasStrength,status=q('#physicalBaselineStatus');
    if(!status)return;
    status.classList.toggle('good',ok);
    status.textContent=ok?`${ms.length} métricas listas · ${skills.size} áreas. Tu línea base física es válida.`:`Para una línea base completa: mínimo 4 métricas, 3 áreas físicas y al menos 1 prueba de Fuerza. Ahora: ${ms.length} métricas · ${skills.size} áreas.`;
  }
  function savePhysicalProfile(){
    updateDraftFromUi();
    const ms=validDraft(),skills=new Set(ms.map(x=>x.skill));
    if(ms.length<4||skills.size<3||!ms.some(x=>x.skill==='Fuerza')){toastLocal('Completá al menos 4 métricas de 3 áreas, incluyendo Fuerza.','warn');return}
    const by={};ms.forEach(m=>(by[m.skill]||=[]).push(Number(m.score)));
    Object.entries(by).forEach(([skill,scores])=>{state.baseSkills[skill]=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);state.skillConfidence[skill]='media'});
    const type=q('#physicalActivityType').value;
    state.g30PhysicalBaseline={activityType:type,metrics:ms,completedAt:new Date().toISOString()};
    state.g30Onboarding=state.g30Onboarding||{};state.g30Onboarding.physicalComplete=true;
    const strength=ms.filter(m=>m.skill==='Fuerza');state.strength=strength.map(m=>({name:m.name,current:m.value,max:m.reference,unit:m.unit}));state.useMeasuredStrength=strength.length>0;state.strengthActivityType=type==='cardio'?'general':type;
    saveState();renderPhysicalScores();updatePhysicalStatus();refreshProfileHeader();toastLocal('Métricas físicas guardadas. El perfil se recalibró.','good');
  }
  function restoreAssessmentBaseline(){
    const base=state.g30PhysicalBaseline;
    if(!base?.metrics?.length){toastLocal('Todavía no hay una línea base guardada desde la evaluación.','warn');return}
    draft=Object.fromEntries(base.metrics.map(x=>[x.id,{...x}]));const sel=q('#physicalActivityType');if(sel){sel.value=P[base.activityType]?base.activityType:'general'}renderPhysicalProfile();toastLocal('Cargué la última línea base guardada.','good');
  }
  function refreshProfileHeader(){
    try{const gl=typeof generalLevel==='function'?generalLevel():null;if(gl!==null){if(q('#generalLevel'))q('#generalLevel').textContent=gl;if(q('#generalBar'))q('#generalBar').style.width=gl+'%';if(q('#rankPill')&&typeof rank==='function')q('#rankPill').textContent=rank(gl)}}catch(e){}
  }
  function toastLocal(msg,tone=''){
    const stack=q('#toastStack');if(!stack)return;
    const el=document.createElement('div');el.className='toast v14 '+tone;el.textContent=msg;stack.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),250)},2500)
  }
  if(pageName==='profile'){
    const sel=q('#physicalActivityType');sel?.addEventListener('change',()=>{draft=savedMap();renderPhysicalProfile()});
    q('#savePhysicalProfileBtn')?.addEventListener('click',savePhysicalProfile);
    q('#restoreAssessmentPhysicalBtn')?.addEventListener('click',restoreAssessmentBaseline);
    renderPhysicalProfile();
  }
})();
