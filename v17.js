(()=>{
if(typeof state==='undefined')return;
const pg=document.body?.dataset?.page||'';
const q=s=>document.querySelector(s);
const storageKey=typeof storeKey!=='undefined'?storeKey:'vidaRpgStateV8';

function saveState(){try{localStorage.setItem(storageKey,JSON.stringify(state))}catch(e){console.warn('V17 save',e)}}
function unlockAll(){
 document.documentElement.classList.remove('v16-cinematic-open');
 document.body?.classList.remove('v16-cinematic-open');
 document.documentElement.style.removeProperty('overscroll-behavior');
 document.body?.style.removeProperty('overscroll-behavior');
 document.documentElement.style.removeProperty('overflow');
 document.body?.style.removeProperty('overflow');
}
function inlineMessage(anchor,msg,type='bad'){
 let el=q('#v17FlowMessage');
 if(!el){el=document.createElement('div');el.id='v17FlowMessage';anchor?.insertAdjacentElement('beforebegin',el)}
 el.className=`quiz-feedback ${type}`;el.textContent=msg;
}

// 1) EVALUACIÓN: arranque robusto, independiente de bindings heredados.
if(pg==='assessment'){
 const btn=q('#startAssessmentBtn');
 if(btn){
   btn.type='button';
   const startEvaluation=e=>{
     if(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.()}
     try{
       const name=q('#asName')?.value?.trim()||'Jugador';
       const age=Number(q('#asAge')?.value),height=Number(q('#asHeight')?.value),weight=Number(q('#asWeight')?.value);
       if(!Number.isFinite(age)||age<13||age>100)return inlineMessage(btn,'Revisá la edad: tiene que estar entre 13 y 100 años.');
       if(!Number.isFinite(height)||height<120||height>230)return inlineMessage(btn,'Revisá la altura: ingresala en centímetros.');
       if(!Number.isFinite(weight)||weight<30||weight>300)return inlineMessage(btn,'Revisá el peso antes de continuar.');
       if(typeof freshAssessment!=='function'||typeof buildAssessmentQueue!=='function'||typeof nextAssessment!=='function')throw new Error('El motor de evaluación no está disponible.');

       state.player={...state.player,name,age,height,weight,context:q('#asContext')?.value||'otro',goal:q('#asGoal')?.value||'general',createdAt:state.player?.createdAt||new Date().toISOString()};
       state.g30Onboarding={physicalComplete:false,trainingStatus:'pending',dietStatus:'pending'};
       state.assessmentComplete=false;
       state.assessmentCoreComplete=false;
       assessmentSession=freshAssessment();
       const queue=buildAssessmentQueue();
       assessmentSession.queue=Array.isArray(queue)?queue:[];
       if(!assessmentSession.queue.length)throw new Error('No se pudieron cargar las 30 preguntas.');
       saveState();

       ['#assessmentIntro','#assessmentTransition','#assessmentProfileStep','#assessmentPhysicalStep','#assessmentTrainingStep','#assessmentDietStep','#assessmentResultStep'].forEach(sel=>q(sel)?.classList.add('hidden'));
       q('#assessmentWrap')?.classList.remove('hidden');
       q('#assessmentQuestionStep')?.classList.remove('hidden');
       unlockAll();
       q('#v17FlowMessage')?.remove();
       nextAssessment();
     }catch(err){
       console.error('V17 assessment start failed',err);
       inlineMessage(btn,'No pudimos iniciar la evaluación. Recargá la página una vez; si persiste, el motor no cargó correctamente.');
     }
   };
   // Propiedad directa + captura delegada: dos caminos de respaldo.
   btn.onclick=startEvaluation;
   document.addEventListener('click',e=>{if(e.target?.closest?.('#startAssessmentBtn'))startEvaluation(e)},true);
   document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&document.activeElement?.id==='startAssessmentBtn')startEvaluation(e)},true);
 }
}

// 2) MENSAJE DEL SISTEMA: aceptar y cerrar siempre, sin re-render que lo reabra.
if(pg==='home'){
 const ov=q('#briefingOverlay'),btn=q('#acceptBriefingBtn');
 if(ov&&btn){
   btn.type='button';
   let closing=false;
   const acceptMission=e=>{
     if(closing)return;
     closing=true;
     if(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.()}
     try{
       state.rpg=state.rpg&&typeof state.rpg==='object'?state.rpg:{};
       if(!state.rpg.briefingSeen||typeof state.rpg.briefingSeen!=='object')state.rpg.briefingSeen={};
       const key=typeof todayKey==='function'?todayKey():new Date().toISOString().slice(0,10);
       state.rpg.briefingSeen[key]=true;
       saveState();
     }catch(err){console.warn('V17 briefing save',err)}
     ov.classList.add('hidden');
     ov.setAttribute('aria-hidden','true');
     ov.style.setProperty('display','none','important');
     ov.style.pointerEvents='none';
     unlockAll();
     setTimeout(()=>{closing=false},250);
   };
   btn.onclick=acceptMission;
   btn.addEventListener('pointerdown',acceptMission,true);
   document.addEventListener('click',e=>{if(e.target?.closest?.('#acceptBriefingBtn'))acceptMission(e)},true);
   document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&document.activeElement?.id==='acceptBriefingBtn')acceptMission(e)},true);
 }
}
})();
