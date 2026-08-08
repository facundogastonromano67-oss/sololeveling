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
function replaceCleanButton(selector){
 const old=q(selector);if(!old)return null;
 const neo=old.cloneNode(true);old.replaceWith(neo);return neo;
}

// EVALUACIÓN: un único listener real. Evita que V8/V13/V17 compitan en Safari.
if(pg==='assessment'){
 const btn=replaceCleanButton('#startAssessmentBtn');
 if(btn){
   btn.type='button';
   const startEvaluation=e=>{
     e?.preventDefault?.();
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
       state.assessmentDraft={active:true,startedAt:new Date().toISOString(),player:{name,age,height,weight,context:state.player.context,goal:state.player.goal}};
       assessmentSession=freshAssessment();
       const queue=buildAssessmentQueue();
       assessmentSession.queue=Array.isArray(queue)?queue:[];
       if(assessmentSession.queue.length!==30)throw new Error(`Se esperaban 30 preguntas y se cargaron ${assessmentSession.queue.length}.`);
       saveState();

       ['#assessmentIntro','#assessmentTransition','#assessmentProfileStep','#assessmentPhysicalStep','#assessmentTrainingStep','#assessmentDietStep','#assessmentResultStep'].forEach(sel=>q(sel)?.classList.add('hidden'));
       q('#assessmentWrap')?.classList.remove('hidden');
       q('#assessmentQuestionStep')?.classList.remove('hidden');
       unlockAll();
       q('#v17FlowMessage')?.remove();
       nextAssessment();
     }catch(err){
       console.error('V17 assessment start failed',err);
       inlineMessage(btn,'No pudimos iniciar la evaluación. Tus datos quedaron guardados; recargá una vez y retomá desde este paso.');
     }
   };
   btn.addEventListener('click',startEvaluation);
 }

 // Si Safari recargó la pestaña durante el arranque, no mandamos al usuario
 // otra vez a la portada del Coliseo: recuperamos el formulario con sus datos.
 const draft=state.assessmentDraft;
 if(draft?.active&&!state.assessmentComplete&&draft.player){
   const restore=()=>{
     const p=draft.player;
     if(q('#asName'))q('#asName').value=p.name||'';
     if(q('#asAge'))q('#asAge').value=p.age??'';
     if(q('#asHeight'))q('#asHeight').value=p.height??'';
     if(q('#asWeight'))q('#asWeight').value=p.weight??'';
     if(q('#asContext')&&p.context)q('#asContext').value=p.context;
     if(q('#asGoal')&&p.goal)q('#asGoal').value=p.goal;
     q('#assessmentIntro')?.classList.add('hidden');
     q('#assessmentTransition')?.classList.add('hidden');
     q('#assessmentWrap')?.classList.remove('hidden');
     q('#assessmentProfileStep')?.classList.remove('hidden');
     q('#assessmentQuestionStep')?.classList.add('hidden');
     unlockAll();
     inlineMessage(q('#startAssessmentBtn'),'Tu perfil quedó guardado. Podés entrar nuevamente al primer dominio.','good');
   };
   if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
 }
}

// MENSAJE DEL SISTEMA: un solo binding, sin re-render que pueda reabrirlo.
if(pg==='home'){
 const ov=q('#briefingOverlay');
 const btn=replaceCleanButton('#acceptBriefingBtn');
 if(ov&&btn){
   btn.type='button';
   let closing=false;
   const acceptMission=e=>{
     if(closing)return;
     closing=true;e?.preventDefault?.();
     try{
       state.rpg=state.rpg&&typeof state.rpg==='object'?state.rpg:{};
       if(!state.rpg.briefingSeen||typeof state.rpg.briefingSeen!=='object')state.rpg.briefingSeen={};
       const key=typeof todayKey==='function'?todayKey():new Date().toISOString().slice(0,10);
       state.rpg.briefingSeen[key]=true;saveState();
     }catch(err){console.warn('V17 briefing save',err)}
     ov.classList.add('hidden');ov.setAttribute('aria-hidden','true');
     ov.style.setProperty('display','none','important');ov.style.pointerEvents='none';unlockAll();
   };
   btn.addEventListener('click',acceptMission);
 }
}
})();
