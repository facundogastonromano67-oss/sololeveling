(()=>{
if(document.body?.dataset?.page!=='assessment'||typeof state==='undefined')return;
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
const DRAFT_KEY='vidaRpgAssessmentDraftStableV1';

// assessment.html is intentionally isolated from the historical v6-v18 stack.
// This controller supplies only the small compatibility pieces that G30 V13 needs.
window.toast=window.toast||function(msg,type=''){
 const stack=q('#toastStack')||(()=>{const x=document.createElement('div');x.id='toastStack';x.className='toast-stack';document.body.appendChild(x);return x})();
 const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=msg;stack.appendChild(el);setTimeout(()=>el.remove(),3000);
};

function unlock(){
 document.documentElement.classList.remove('v16-cinematic-open');document.body.classList.remove('v16-cinematic-open');
 document.documentElement.style.removeProperty('overflow');document.body.style.removeProperty('overflow');
 document.documentElement.style.removeProperty('overscroll-behavior');document.body.style.removeProperty('overscroll-behavior');
}
function lock(){document.documentElement.classList.add('v16-cinematic-open');document.body.classList.add('v16-cinematic-open')}
function cleanClone(sel){const old=q(sel);if(!old)return null;const neo=old.cloneNode(true);old.replaceWith(neo);return neo}
function saveDraft(d){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(d))}catch(e){console.warn('assessment draft',e)}}
function readDraft(){try{return JSON.parse(localStorage.getItem(DRAFT_KEY)||'null')}catch(e){return null}}
function clearDraft(){try{localStorage.removeItem(DRAFT_KEY)}catch(e){}}
function msg(anchor,text,type='bad'){let el=q('#assessmentStableMessage');if(!el){el=document.createElement('div');el.id='assessmentStableMessage';anchor?.insertAdjacentElement('beforebegin',el)}el.className=`quiz-feedback ${type}`;el.textContent=text}

// Minimal G30 focus generator, replacing the large v7 plan module on this page only.
const bottleneckSkill={organization:'Organización',focus:'Productividad',consistency:'Constancia',communication:'Comunicación',leadership:'Liderazgo',problem:'Resolución de problemas',learning:'Aprendizaje',finance:'Finanzas personales',emotion:'Control emocional'};
const respSkills={operations:['Organización','Productividad','Resolución de problemas'],admin:['Organización','Constancia','Finanzas personales'],sales:['Comunicación','Habilidades sociales','Productividad'],finance:['Finanzas personales','Inteligencia aplicada','Organización'],clients:['Comunicación','Habilidades sociales','Control emocional'],people:['Liderazgo','Comunicación','Control emocional'],projects:['Organización','Liderazgo','Productividad'],analysis:['Inteligencia aplicada','Resolución de problemas','Conocimiento'],technical:['Aprendizaje','Resolución de problemas','Conocimiento'],physical:['Salud física','Organización','Fuerza'],study:['Aprendizaje','Constancia','Organización'],creative:['Creatividad','Productividad','Comunicación']};
window.relevantSkills=window.relevantSkills||function(profile){
 const out=[bottleneckSkill[profile?.bottleneck]].filter(Boolean);(profile?.responsibilities||[]).forEach(r=>out.push(...(respSkills[r]||[])));
 const weak=typeof effectiveSkillData==='function'?[...allSkills].sort((a,b)=>effectiveSkillData()[a].score-effectiveSkillData()[b].score):allSkills;
 out.push(...weak);return [...new Set(out)].filter(Boolean);
};
window.generatePlan=window.generatePlan||function(profile){
 const focus=window.relevantSkills(profile).slice(0,3);state.improvementPlan=state.improvementPlan||{};
 Object.assign(state.improvementPlan,{profile,focusSkills:focus,questionnaireComplete:true,startedAt:typeof todayKey==='function'?todayKey():new Date().toISOString().slice(0,10),updatedAt:new Date().toISOString(),cycleStart:typeof todayKey==='function'?todayKey():new Date().toISOString().slice(0,10),cycleLength:30,acceptedDays:{},protectedDays:{}});
 return focus;
};

// Compact training-plan builder. Full editor/library still lives on entrenamiento.html.
const EX={
 gym:[['Sentadilla','Piernas'],['Press de banca','Pecho'],['Jalón al pecho','Espalda'],['Peso muerto rumano','Cadena posterior'],['Press de hombros','Hombros'],['Remo sentado','Espalda'],['Prensa de piernas','Piernas'],['Curl femoral','Isquios'],['Elevaciones laterales','Hombros'],['Plancha','Core']],
 home:[['Sentadilla goblet / mochila','Piernas'],['Flexiones','Pecho'],['Remo con banda / mochila','Espalda'],['Peso muerto con mochila','Cadena posterior'],['Zancadas','Piernas'],['Pike push-up','Hombros'],['Puente de glúteos','Glúteos'],['Plancha','Core'],['Mountain climbers','Core/Cardio'],['Elevaciones de gemelos','Gemelos']]
};
function splitNames(n){return n<=2?['Full body A','Full body B']:n===3?['Full body A','Full body B','Full body C']:n===4?['Tren superior A','Tren inferior A','Tren superior B','Tren inferior B']:n===5?['Empuje','Tirón','Piernas','Superior','Inferior']:['Empuje A','Tirón A','Piernas A','Empuje B','Tirón B','Piernas B']}
window.buildTrainingPlan=window.buildTrainingPlan||function(profile){
 const days=[...(profile.weekdays||[1,3,5])].sort((a,b)=>((a+6)%7)-((b+6)%7)), names=splitNames(days.length), lib=EX[profile.location==='home'?'home':'gym'];
 const count=profile.minutes<=30?4:profile.minutes<=45?5:profile.minutes<=60?6:7;
 const prescription=profile.goal==='strength'?'4 × 5–6':profile.goal==='hypertrophy'?'3–4 × 8–12':profile.goal==='performance'?'3 × 5–8':'3 × 8–12';
 return{createdAt:new Date().toISOString(),profile:{...profile,weekdays:days},days:days.map((weekday,i)=>({weekday,focus:names[i%names.length],pattern:'g30',exercises:Array.from({length:count},(_,j)=>{const e=lib[(i*3+j)%lib.length];return{id:crypto.randomUUID(),catalogId:'assessment-'+(i*3+j),name:e[0],muscle:e[1],pattern:'g30',prescription}}),cardio:profile.cardio?'10–20 min suave o técnica específica':'',notes:'Priorizá técnica y dejá 2–3 repeticiones en reserva en la mayoría de las series.'}))};
};

// Do not allow mouse wheel to mutate numeric values on desktop.
document.addEventListener('wheel',e=>{if(e.target instanceof HTMLInputElement&&e.target.type==='number'&&document.activeElement===e.target)e.target.blur()},{passive:true});

// Domain transition: one owner, no timers, observers or competing class mutations.
const domain=q('#domainTransition');
if(domain){
 domain.classList.add('v16-static-domain');domain.tabIndex=0;domain.style.setProperty('--v16-domain-art','url("assets/images/modules/evaluation.webp")');
 const card=domain.querySelector('.domain-transition-card');if(card&&!card.querySelector('.v16-click-hint'))card.insertAdjacentHTML('beforeend','<small class="v16-click-hint">tocá para continuar</small>');
 const close=()=>{if(domain.classList.contains('hidden'))return;domain.classList.add('hidden');unlock()};
 domain.addEventListener('click',close);domain.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();close()}});
 if(typeof renderAssessmentQuestion==='function'){
   const old=renderAssessmentQuestion;renderAssessmentQuestion=function(...args){const r=old(...args);if(!domain.classList.contains('hidden'))lock();return r};
 }
}

// Intro -> profile: direct, cheap transition for Safari/iOS.
const enter=cleanClone('#enterAssessmentBtn');
enter?.addEventListener('click',e=>{e.preventDefault();q('#assessmentIntro')?.classList.add('hidden');q('#assessmentTransition')?.classList.add('hidden');q('#assessmentWrap')?.classList.remove('hidden');q('#assessmentProfileStep')?.classList.remove('hidden');unlock();window.scrollTo({top:0,behavior:'auto'})});

// Profile -> question 1/30: no full-state stringify, no duplicate listeners, no legacy animation stack.
const start=cleanClone('#startAssessmentBtn');
start?.addEventListener('click',e=>{
 e.preventDefault();
 const name=q('#asName')?.value?.trim()||'Jugador',age=Number(q('#asAge')?.value),height=Number(q('#asHeight')?.value),weight=Number(q('#asWeight')?.value),context=q('#asContext')?.value||'otro',goal=q('#asGoal')?.value||'general';
 if(!Number.isFinite(age)||age<13||age>100)return msg(start,'Revisá la edad: tiene que estar entre 13 y 100 años.');
 if(!Number.isFinite(height)||height<120||height>230)return msg(start,'Revisá la altura: ingresala en centímetros.');
 if(!Number.isFinite(weight)||weight<30||weight>300)return msg(start,'Revisá el peso antes de continuar.');
 try{
   state.player={...state.player,name,age,height,weight,context,goal,createdAt:state.player?.createdAt||new Date().toISOString()};
   state.g30Onboarding={physicalComplete:false,trainingStatus:'pending',dietStatus:'pending'};state.assessmentComplete=false;state.assessmentCoreComplete=false;
   const draft={name,age,height,weight,context,goal,at:new Date().toISOString()};saveDraft(draft);state.assessmentDraft={active:true,player:draft};
   assessmentSession=freshAssessment();const queue=buildAssessmentQueue();if(!Array.isArray(queue)||queue.length!==30)throw new Error('La cola G30 no contiene 30 preguntas.');assessmentSession.queue=queue;
   q('#assessmentStableMessage')?.remove();q('#assessmentProfileStep')?.classList.add('hidden');q('#assessmentQuestionStep')?.classList.remove('hidden');q('#assessmentWrap')?.classList.remove('hidden');q('#assessmentTransition')?.classList.add('hidden');unlock();
   nextAssessment();
 }catch(err){console.error('assessment stable start',err);msg(start,'No pudimos iniciar la evaluación. Tus datos quedaron guardados para volver a intentar.');}
});

// If WebKit reloads the page, return to the saved profile instead of the Coliseum cover.
const draft=readDraft();
if(draft&&!state.assessmentComplete){
 state.player={...state.player,name:draft.name||state.player?.name,age:draft.age||state.player?.age,height:draft.height||state.player?.height,weight:draft.weight||state.player?.weight,context:draft.context||state.player?.context,goal:draft.goal||state.player?.goal};
 [['#asName','name'],['#asAge','age'],['#asHeight','height'],['#asWeight','weight']].forEach(([sel,k])=>{if(q(sel))q(sel).value=draft[k]??''});if(q('#asContext'))q('#asContext').value=draft.context||'otro';if(q('#asGoal'))q('#asGoal').value=draft.goal||'general';
 q('#assessmentIntro')?.classList.add('hidden');q('#assessmentTransition')?.classList.add('hidden');q('#assessmentWrap')?.classList.remove('hidden');q('#assessmentProfileStep')?.classList.remove('hidden');q('#assessmentQuestionStep')?.classList.add('hidden');unlock();msg(start,'Tus datos quedaron guardados. Tocá “Entrar al primer dominio” para continuar.','good');
}

// Final static transformation gate, implemented locally without loading v16.js.
const finish=cleanClone('#finishAssessmentBtn');
finish?.addEventListener('click',e=>{
 if(!state.assessmentComplete){e.preventDefault();window.toast('Primero completá la línea base física.','warn');return}
 e.preventDefault();lock();const ov=document.createElement('div');ov.className='v16-cinematic-gate';ov.tabIndex=0;ov.innerHTML='<img class="v16-cinematic-bg" src="assets/images/cinematic/transformation.webp" alt=""><div class="v16-cinematic-shade"></div><div class="v16-cinematic-copy"><div class="eyebrow">DÍA CERO · AVISO DEL COLISEO</div><h1>Tu transformación comienza ahora</h1><p>Durante los próximos 30 días, cada decisión va a moldear a tu personaje.</p><p>El Coliseo no premia intención. Premia acción.</p><small class="v16-click-hint">tocá para entrar al Coliseo</small></div>';
 let done=false;const go=()=>{if(done)return;done=true;clearDraft();unlock();location.href='index.html?transformacion=1'};ov.addEventListener('click',go);ov.addEventListener('keydown',x=>{if(x.key==='Enter'||x.key===' '){x.preventDefault();go()}});document.body.appendChild(ov);setTimeout(()=>ov.focus({preventScroll:true}),30);
});
})();
