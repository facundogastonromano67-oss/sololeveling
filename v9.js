(()=>{
const V9_TARGET_QUESTIONS=35;
const V9_SECTIONS=[
  {key:'work',name:'Trabajo y contexto',total:8,color:'cyan'},
  {key:'activity',name:'Actividad y nutrición',total:10,color:'green'},
  {key:'intellect',name:'Intelecto',total:9,color:'violet'},
  {key:'character',name:'Carisma y rendimiento',total:8,color:'gold'}
];
function ensureV9State(){
  state.version=9;
  state.assessmentWorkContext=state.assessmentWorkContext||{};
  state.assessmentLifestyle=state.assessmentLifestyle||{};
  localStorage.setItem(storeKey,JSON.stringify(state));
}
ensureV9State();

// ---------- Música ambiental global ----------
window.VIDA_MUSIC=(()=>{
  let ctx=null,master=null,drones=[],pulseTimer=null,started=false;
  const soundOn=()=>window.VIDA_SOUND?.enabled?.()!==false;
  function palette(){
    if(page==='combat')return{base:73.42,chord:[110,146.83,220],pulse:[293.66,349.23,440],vol:.0125};
    if(page==='assessment')return{base:55,chord:[82.41,110,164.81],pulse:[220,261.63,329.63],vol:.013};
    return{base:65.41,chord:[98,130.81,196],pulse:[261.63,329.63,392],vol:.0105};
  }
  async function ensure(){
    const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;
    if(!ctx)ctx=new A();
    if(ctx.state==='suspended'){try{await ctx.resume()}catch(e){}}
    return ctx;
  }
  function build(){
    if(master||!ctx)return;
    const p=palette();master=ctx.createGain();master.gain.value=.0001;master.connect(ctx.destination);
    [p.base,...p.chord].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=i===0?'triangle':i===1?'sine':'triangle';o.frequency.value=f;g.gain.value=i===0?.25:.08;o.connect(g).connect(master);o.start();drones.push(o)});
  }
  function motif(){
    if(!ctx||!master||!started||!soundOn()||ctx.state!=='running')return;
    const p=palette(),now=ctx.currentTime,notes=[p.pulse[0],p.pulse[1],p.pulse[2],p.pulse[1]];
    notes.forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),st=now+i*.42;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,st);g.gain.exponentialRampToValueAtTime(.018,st+.035);g.gain.exponentialRampToValueAtTime(.0001,st+.34);o.connect(g).connect(master);o.start(st);o.stop(st+.36)});
  }
  async function start(){
    if(!soundOn())return false;
    const c=await ensure();if(!c)return false;build();started=true;
    const p=palette(),now=c.currentTime;master.gain.cancelScheduledValues(now);master.gain.setValueAtTime(Math.max(.0001,master.gain.value||.0001),now);master.gain.exponentialRampToValueAtTime(p.vol,now+.65);
    clearInterval(pulseTimer);motif();pulseTimer=setInterval(motif,page==='combat'?3900:5200);return c.state==='running';
  }
  async function stop(){
    started=false;clearInterval(pulseTimer);pulseTimer=null;if(!ctx||!master)return;
    const now=ctx.currentTime;master.gain.cancelScheduledValues(now);master.gain.setValueAtTime(Math.max(.0001,master.gain.value||.0001),now);master.gain.exponentialRampToValueAtTime(.0001,now+.25);setTimeout(()=>ctx?.suspend?.().catch(()=>{}),330);
  }
  return{start,stop};
})();

if(window.VIDA_SOUND){
  const oldToggle=window.VIDA_SOUND.toggle.bind(window.VIDA_SOUND),oldSet=window.VIDA_SOUND.set.bind(window.VIDA_SOUND);
  window.VIDA_SOUND.startAmbient=()=>window.VIDA_MUSIC.start();
  window.VIDA_SOUND.toggle=async()=>{const on=await oldToggle();await window.VIDA_SOUND.stopAmbient?.();if(on)await window.VIDA_MUSIC.start();else await window.VIDA_MUSIC.stop();return on};
  window.VIDA_SOUND.set=async(on)=>{const result=await oldSet(on);await window.VIDA_SOUND.stopAmbient?.();if(result)await window.VIDA_MUSIC.start();else await window.VIDA_MUSIC.stop();return result};
}
function primeMusic(){if(!window.VIDA_SOUND?.enabled?.())return;window.VIDA_MUSIC.start()}
setTimeout(primeMusic,120);
document.addEventListener('pointerdown',primeMusic,{once:true,capture:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)window.VIDA_MUSIC.stop();else primeMusic()});

// ---------- Evaluación V9: 35 preguntas ordenadas por bloques ----------
const cap=(label,field,value)=>({...choice(label,0),capture:{field,value}});
const q=(obj)=>prepareQuestion(obj);
const adaptiveSlot=(track)=>({kind:'v9-adaptive-slot',track});

const workQuestions=[
q({id:'v9-work-status',cat:'Rendimiento',title:'Situación principal',skill:null,kind:'context',text:'¿Cuál describe mejor tu situación actual?',options:[cap('Trabajo en relación de dependencia','workType','employee'),cap('Trabajo manual, oficio u obra','workType','manual'),cap('Trabajo por mi cuenta / emprendimiento','workType','independent'),cap('Coordino o dirijo un equipo','workType','manager'),cap('Estudio principalmente','workType','student'),cap('Trabajo y estudio','workType','mixed'),cap('Estoy buscando trabajo o en transición','workType','search')]}),
q({id:'v9-work-area',cat:'Rendimiento',title:'Área principal',skill:null,kind:'context',text:'¿En qué tipo de actividad pasás la mayor parte de tu tiempo?',options:[cap('Operaciones, producción o logística','area','operations'),cap('Construcción / obra / oficios','area','construction'),cap('Fábrica / producción industrial','area','industrial'),cap('Depósito / carga y descarga','area','warehouse'),cap('Campo / agricultura','area','fieldwork'),cap('Gastronomía / cocina','area','hospitality'),cap('Transporte / conducción','area','transport'),cap('Limpieza / mantenimiento','area','maintenance'),cap('Seguridad','area','security'),cap('Administración o finanzas','area','finance'),cap('Ventas, comercial o atención a clientes','area','sales'),cap('Tecnología, técnica o sistemas','area','tech'),cap('Creatividad, contenido o comunicación','area','creative'),cap('Educación o estudio','area','education'),cap('Salud, cuidado o servicio personal','area','health'),cap('Otra combinación','area','other')]}),
q({id:'v9-work-role',cat:'Rendimiento',title:'Forma de trabajar',skill:null,kind:'context',text:'¿Cómo se organiza normalmente tu trabajo o estudio?',options:[cap('Trabajo principalmente de forma individual','role','individual'),cap('Trabajo en equipo, sin coordinar al resto','role','team'),cap('Coordino tareas o personas con frecuencia','role','coordinator'),cap('Tomo decisiones sobre un equipo o proyecto','role','manager'),cap('Mi actividad cambia mucho según el día','role','variable')]}),
q({id:'v9-work-task',cat:'Rendimiento',title:'Tareas frecuentes',skill:null,kind:'context',text:'¿Qué tipo de tarea ocupa más tiempo en una semana normal?',options:[cap('Organizar, coordinar o hacer seguimiento','responsibility','projects'),cap('Vender, negociar o hacer seguimiento comercial','responsibility','sales'),cap('Atender personas o resolver pedidos/problemas','responsibility','clients'),cap('Trabajar con números, costos, caja o registros','responsibility','finance'),cap('Analizar información y tomar decisiones','responsibility','analysis'),cap('Producir, operar o resolver tareas técnicas','responsibility','technical'),cap('Trabajo físico, obra, montaje o mantenimiento','responsibility','physical'),cap('Carga, depósito o traslado de materiales','responsibility','warehouse'),cap('Conducción, reparto o transporte','responsibility','transport'),cap('Crear, diseñar, escribir o comunicar','responsibility','creative'),cap('Estudiar, practicar o preparar evaluaciones','responsibility','study')]}),
q({id:'v9-work-org',cat:'Rendimiento',title:'Organización real',skill:'Organización',kind:'habit',text:'Te aparecen dos urgencias nuevas en un día que ya estaba planificado. ¿Qué se parece más a lo que hacés normalmente?',consistencyKey:'organizacion',options:[choice('Reordeno prioridades y dejo claro qué tarea anterior se desplaza',3),choice('Resuelvo primero lo urgente y después reconstruyo el resto del día',2),choice('Mantengo el plan original y encajo lo nuevo en los huecos que encuentre',1),choice('Voy alternando entre lo nuevo y lo anterior según lo que parezca más urgente en cada momento',1)]}),
q({id:'v9-work-prod',cat:'Rendimiento',title:'Productividad',skill:'Productividad',kind:'scenario',text:'Tenés 90 minutos libres y cinco pendientes. Uno de ellos puede destrabar trabajo importante de los próximos días. ¿Cómo usarías ese bloque?',options:[choice('Empiezo por el pendiente que destraba más cosas y busco dejar un resultado concreto terminado',3),choice('Resuelvo primero dos o tres tareas cortas para liberar espacio mental y después voy a la importante',2),choice('Reviso todos los pendientes y avanzo un poco en los dos más urgentes',2),choice('Empiezo por el que tenga la fecha más cercana, aunque no sea el de mayor impacto',1)]}),
q({id:'v9-work-com',cat:'Carisma',title:'Comunicación en contexto',skill:'Comunicación',kind:'scenario',consistencyKey:'comunicacion',text:'Pedís algo importante y la otra persona responde “sí, después lo veo”, pero no queda claro qué va a entregar ni cuándo. ¿Qué hacés?',options:[choice('Acordamos qué resultado concreto necesito y una referencia de cuándo lo revisamos',3),choice('Le explico un poco mejor por qué es importante y dejo que defina cuándo puede hacerlo',2),choice('Le mando por escrito los detalles para que los tenga a mano y hago seguimiento más tarde',2),choice('Espero un tiempo razonable antes de insistir para no generar presión innecesaria',1)]}),
q({id:'v9-work-problem',cat:'Intelecto',title:'Problemas reales',skill:'Resolución de problemas',kind:'scenario',text:'Un proceso que normalmente funciona empieza a fallar de forma intermitente. Tenés varias causas posibles. ¿Qué harías primero?',options:[choice('Busco qué cambió y pruebo una variable por vez para separar hipótesis',3),choice('Empiezo por la causa más probable y la corrijo; si vuelve a fallar pruebo otra',2),choice('Junto varios casos fallidos antes de cambiar algo para tener más información',2),choice('Hago un ajuste general en las partes relacionadas para aumentar la probabilidad de resolverlo rápido',1)]})
];

const activityQuestions=[
q({id:'v9-activity-type',cat:'Físico',title:'Tipo de actividad',skill:null,kind:'context',text:'¿Qué tipo de actividad física representa mejor tu semana actual?',options:[cap('No entreno de forma intencional','activityType','none'),cap('Principalmente fuerza o gimnasio','activityType','strength'),cap('Principalmente cardio o resistencia','activityType','endurance'),cap('Deporte, boxeo, fútbol u otra actividad mixta','activityType','sport'),cap('Combino fuerza y resistencia/deporte','activityType','mixed')]}),
q({id:'v9-activity-frequency',cat:'Físico',title:'Frecuencia semanal',skill:'Salud física',kind:'habit',text:'Durante las últimas cuatro semanas, ¿cuántos días por semana hiciste actividad física intencional en promedio?',options:[choice('0 días',0),choice('1–2 días',1),choice('3–4 días',2),choice('5 o más días',3)]}),
q({id:'v9-strength',cat:'Físico',title:'Fuerza',skill:'Fuerza',kind:'physical',text:'Pensando en los últimos tres meses, ¿qué describe mejor tu entrenamiento de fuerza?',options:[choice('No hice entrenamiento de fuerza de forma intencional',0),choice('Entrené algunas veces, pero sin una estructura o registro estable',1),choice('Entrené con regularidad y puedo comparar algunas cargas o repeticiones',2),choice('Entrené de forma consistente y llevo registros suficientes para ver progresión',3)]}),
q({id:'v9-endurance',cat:'Físico',title:'Resistencia',skill:'Resistencia',kind:'physical',text:'¿Qué esfuerzo continuo podrías realizar hoy sin considerarlo algo excepcional para vos?',options:[choice('Caminar a ritmo cómodo unos 20–30 minutos',0),choice('Actividad moderada o trote suave unos 20–30 minutos',1),choice('Actividad exigente durante aproximadamente 30–45 minutos',2),choice('Actividad exigente de resistencia alrededor de una hora o más',3)]}),
q({id:'v9-power',cat:'Físico',title:'Potencia',skill:'Velocidad / Potencia',kind:'physical',text:'En los últimos dos meses, ¿con qué frecuencia entrenaste acciones explosivas como sprints, saltos, golpes rápidos o levantamientos veloces?',options:[choice('No las entrené de forma específica',0),choice('Alguna sesión aislada o como parte secundaria de otro entrenamiento',1),choice('Aproximadamente 1–2 veces por semana',2),choice('3 o más veces por semana y puedo comparar mi rendimiento',3)]}),
q({id:'v9-mobility',cat:'Físico',title:'Movilidad',skill:'Movilidad',kind:'physical',text:'Sin dolor, ¿cómo describirías una sentadilla profunda con los talones apoyados?',options:[choice('No puedo mantener los talones apoyados o pierdo mucho equilibrio',0),choice('Puedo llegar, pero necesito compensar bastante o me cuesta sostenerla',1),choice('Puedo hacerla de forma razonable y controlada',2),choice('Puedo hacerla cómoda, estable y con buen control',3)]}),
q({id:'v9-sleep',cat:'Físico',title:'Sueño',skill:'Salud física',kind:'habit',text:'En una semana normal, ¿cuántas horas dormís en promedio por noche?',options:[choice('Menos de 5 horas',0),choice('5–6 horas',1),choice('6–7 horas',2),choice('7–9 horas',3),choice('Más de 9 horas casi todos los días',2)]}),
q({id:'v9-nutrition-habit',cat:'Físico',title:'Alimentación cotidiana',skill:'Salud física',kind:'habit',text:'Pensando en una semana normal, ¿qué tan planificadas suelen estar tus comidas principales?',options:[choice('Casi siempre decido en el momento y no tengo una estructura reconocible',0),choice('Tengo algunas comidas repetidas, pero muchos días dependen de lo que haya disponible',1),choice('La mayoría de los días tengo una estructura bastante previsible que puedo ajustar',2),choice('Planifico la mayor parte de la semana y hago ajustes sin perder de vista mi objetivo',3)]}),
adaptiveSlot('nutricion'),adaptiveSlot('nutricion')
];

const intellectQuestions=[
adaptiveSlot('logica'),adaptiveSlot('logica'),adaptiveSlot('logica'),
adaptiveSlot('problemas'),adaptiveSlot('problemas'),adaptiveSlot('problemas'),
q({id:'v9-knowledge',cat:'Intelecto',title:'Evaluar información',skill:'Conocimiento',kind:'objective-lite',text:'Encontrás una estrategia que funcionó muy bien para una persona y está explicada con bastante detalle. ¿Qué conclusión es la más razonable?',options:[choice('Es evidencia interesante, pero todavía necesito contexto y otras fuentes antes de generalizarla',3),choice('Si el proceso está bien explicado, vale la pena asumir que probablemente funcione de forma parecida',2),choice('La tomaría como válida sólo si quien la explica tiene mucha experiencia en el tema',2),choice('No la tendría en cuenta hasta encontrar un estudio que pruebe exactamente ese caso',1)]}),
q({id:'v9-learning',cat:'Intelecto',title:'Aprendizaje',skill:'Aprendizaje',kind:'scenario',text:'Terminaste de aprender un procedimiento nuevo y querés saber si realmente lo entendiste. ¿Qué prueba te daría más información?',options:[choice('Intentar aplicarlo en un caso distinto y explicar por qué cada paso tiene sentido',3),choice('Hacerlo otra vez en el mismo ejemplo sin mirar las instrucciones',2),choice('Escribir un resumen con los pasos y compararlo con el material original',2),choice('Volver a mirar el contenido hasta sentir que los pasos resultan familiares',1)]}),
q({id:'v9-creativity',cat:'Intelecto',title:'Creatividad aplicada',skill:'Creatividad',kind:'scenario',text:'Necesitás conseguir casi el mismo resultado con bastante menos presupuesto. ¿Cómo empezarías?',options:[choice('Defino qué parte del resultado es imprescindible y genero varias alternativas con compromisos distintos',3),choice('Busco cómo lo resolvieron otros y adapto la opción que parezca más económica',2),choice('Recorto primero los componentes más caros y después evalúo cuánto se deterioró el resultado',2),choice('Reduzco el alcance completo de forma pareja para asegurar que el costo baje',1)]})
];

const characterQuestions=[
q({id:'v9-social',cat:'Carisma',title:'Interacción social',skill:'Habilidades sociales',kind:'scenario',text:'Una conversación importante se pone tensa, pero todavía necesitás llegar a un acuerdo útil. ¿Qué hacés?',options:[choice('Bajo el ritmo, confirmo qué entendí de la otra postura y vuelvo al punto concreto que hay que resolver',3),choice('Explico mi posición con más detalle para reducir la posibilidad de que me estén interpretando mal',2),choice('Propongo cortar la conversación y retomarla cuando haya menos tensión',2),choice('Busco una solución intermedia rápido para evitar que la situación siga escalando',1)]}),
q({id:'v9-leadership',cat:'Carisma',title:'Liderazgo',skill:'Liderazgo',kind:'scenario',text:'Una tarea compartida se está atrasando y nadie tiene del todo claro dónde está el bloqueo. ¿Cómo avanzarías?',options:[choice('Aclaro el bloqueo, el próximo resultado, quién lo toma y cuándo volvemos a revisarlo',3),choice('Reordeno las prioridades y tomo personalmente una parte crítica para recuperar tiempo',2),choice('Pido a cada persona que estime cuándo termina y ajusto el plan con esas fechas',2),choice('Espero a tener un poco más de información antes de cambiar la forma de trabajar',1)]}),
q({id:'v9-emotion',cat:'Carisma',title:'Control emocional',skill:'Control emocional',kind:'scenario',text:'Te hacen una crítica que al principio te parece injusta. ¿Qué se parece más a una buena reacción para vos?',options:[choice('Pido el ejemplo concreto, escucho completo y recién después comparo esa información con mi punto de vista',3),choice('Escucho el comentario y explico enseguida qué contexto pudo haber faltado',2),choice('Lo tomo, termino la conversación y lo evalúo con calma más tarde',2),choice('Prefiero discutirlo en otro momento porque si sigo probablemente responda a la defensiva',1)]}),
q({id:'v9-integrity',cat:'Carisma',title:'Integridad',skill:'Integridad / valores',kind:'scenario',text:'En una compra o pago detectás que te cobraron menos por un error evidente y la otra parte no lo notó. ¿Qué harías?',options:[choice('Aviso del error y dejo que la otra parte confirme cómo corregirlo',3),choice('Pregunto si el importe es correcto sin asumir de entrada que fue un error',2),choice('Espero a revisar bien la operación antes de decir algo, por si hay una razón que desconozco',2),choice('No hago nada mientras la operación figure como cerrada y nadie la cuestione',0)]}),
q({id:'v9-com-probe',cat:'Carisma',title:'Confirmar comprensión',skill:'Comunicación',kind:'scenario',probeFor:'comunicacion',text:'Después de explicar una tarea que puede generar un error costoso, ¿cómo verificás que quedó clara?',options:[choice('Pido que confirmemos resultado esperado, restricciones y próximo paso con sus propias palabras',3),choice('Mando un resumen escrito para que pueda revisarlo mientras trabaja',2),choice('Pregunto si quedó alguna duda y aclaro lo que me consulte',2),choice('Doy por entendido el mensaje si la persona acepta la tarea sin hacer preguntas',1)]}),
q({id:'v9-discipline',cat:'Rendimiento',title:'Disciplina',skill:'Disciplina',kind:'habit',text:'Una tarea importante no tiene fecha externa y nadie te va a controlar. ¿Qué suele pasar en la práctica?',options:[choice('Tengo una forma de programarla, empezarla y revisarla aunque no haya presión externa',3),choice('Normalmente la programo y avanzo, aunque a veces la desplazo si aparece algo urgente',2),choice('La hago cuando encuentro un bloque de tiempo o motivación suficiente',1),choice('Suele quedar relegada hasta que aparece alguna consecuencia o urgencia',0)]}),
q({id:'v9-finance',cat:'Rendimiento',title:'Finanzas personales',skill:'Finanzas personales',kind:'habit',text:'En los últimos tres meses, ¿qué descripción se acerca más a tu manejo real del dinero?',options:[choice('Registro y reviso movimientos, planifico decisiones y conecto ahorro o inversión con objetivos',3),choice('Registro la mayoría de ingresos y gastos y tengo una planificación básica',2),choice('Reviso saldos con frecuencia, pero registro o planifico de forma irregular',1),choice('No tengo una visión clara y actualizada de cuánto entra, sale y queda disponible',0)]}),
q({id:'v9-constancy',cat:'Rendimiento',title:'Constancia',skill:'Constancia',kind:'habit',text:'Cuando una rutina importante se interrumpe por varios días, ¿qué suele ocurrir después?',options:[choice('Tengo una versión mínima o una regla de reinicio y normalmente vuelvo sin esperar condiciones perfectas',3),choice('Suelo retomarla durante la semana siguiente, aunque necesito reorganizarme',2),choice('La retomo cuando vuelve a aparecer una semana más tranquila o motivación',1),choice('Muchas veces la interrupción termina haciendo que abandone la rutina',0)]})
];

function tagSection(list,sectionNumber){const meta=V9_SECTIONS[sectionNumber-1];return list.map((item,i)=>{item.section=meta.name;item.sectionKey=meta.key;item.sectionNumber=sectionNumber;item.sectionIndex=i+1;item.sectionTotal=list.length;return item})}
buildAssessmentQueue=function(){return[...tagSection(workQuestions,1),...tagSection(activityQuestions,2),...tagSection(intellectQuestions,3),...tagSection(characterQuestions,4)]}
scheduleAdaptive=function(){};
scheduleProbe=function(){};
function materializeV9(raw){if(raw.kind!=='v9-adaptive-slot')return raw;const t=assessmentSession.adaptive[raw.track],diff=clamp(Math.round(t.ability),1,5),made=makeObjectiveQuestion(raw.track,diff);made.section=raw.section;made.sectionKey=raw.sectionKey;made.sectionNumber=raw.sectionNumber;made.sectionIndex=raw.sectionIndex;made.sectionTotal=raw.sectionTotal;return made}
renderAssessmentQuestion=function(){const q=assessmentSession.current;if(!q)return;const kind=q.kind==='adaptive-objective'?'prueba adaptativa':q.kind==='context'?'contexto':'evidencia';$('#assessmentSectionTitle')&&($('#assessmentSectionTitle').textContent=q.section);$('#assessmentSectionProgress')&&($('#assessmentSectionProgress').textContent=`${q.sectionIndex}/${q.sectionTotal}`);$('#assessmentSectionStrip')&&($('#assessmentSectionStrip').dataset.section=q.sectionKey);$('#assessmentCategory').textContent=`BLOQUE ${q.sectionNumber} DE ${V9_SECTIONS.length} · ${kind.toUpperCase()}`;$('#assessmentQuestionTitle').textContent=q.title;$('#assessmentQuestionText').textContent=q.text;$('#assessmentIndex').textContent=`${assessmentSession.answered+1}/${V9_TARGET_QUESTIONS}`;$('#assessmentProgress').style.width=`${Math.min(100,assessmentSession.answered/V9_TARGET_QUESTIONS*100)}%`;$('#assessmentOptions').innerHTML=q.options.map((o,i)=>`<button class="answer-btn" data-answer="${i}">${escapeHtml(o.label)}</button>`).join('')}
nextAssessment=function(){if(assessmentSession.answered>=V9_TARGET_QUESTIONS||!assessmentSession.queue.length)return finishAssessment();assessmentSession.current=materializeV9(assessmentSession.queue.shift());renderAssessmentQuestion()}
const recordAssessmentBeforeV9=recordAssessment;
recordAssessment=function(i){const qn=assessmentSession.current,opt=qn?.options?.[i];if(opt?.capture){const target=['activityType'].includes(opt.capture.field)?state.assessmentLifestyle:state.assessmentWorkContext;target[opt.capture.field]=opt.capture.value;localStorage.setItem(storeKey,JSON.stringify(state))}return recordAssessmentBeforeV9(i)}
const finishAssessmentBeforeV9=finishAssessment;
finishAssessment=function(){finishAssessmentBeforeV9();state.version=9;state.assessmentEngineVersion=9;if(state.assessmentReport){state.assessmentReport.engine=9;state.assessmentReport.questionCount=assessmentSession.answered;state.assessmentReport.sections=V9_SECTIONS.map(x=>({name:x.name,total:x.total}))}const wc=state.assessmentWorkContext||{};if(!state.improvementPlan?.questionnaireComplete&&state.improvementPlan?.profile){if(wc.workType)state.improvementPlan.profile.workType=wc.workType;if(wc.area)state.improvementPlan.profile.area=wc.area;if(wc.role)state.improvementPlan.profile.role=wc.role;if(wc.responsibility&&!state.improvementPlan.profile.responsibilities?.length)state.improvementPlan.profile.responsibilities=[wc.responsibility]}if(!state.trainingPlan&&state.assessmentLifestyle?.activityType){const a=state.assessmentLifestyle.activityType;if(a==='strength')state.trainingProfile.goal='strength';if(a==='sport'||a==='mixed')state.trainingProfile.goal='performance'}localStorage.setItem(storeKey,JSON.stringify(state));if($('#resultConfidence'))$('#resultConfidence').textContent=`Confianza inicial ${globalConfidence()} · ${assessmentSession.answered} preguntas · 4 bloques · consistencia ${state.assessmentReport?.consistency??'—'}%`}

// ---------- Prefill del Plan con lo aprendido en la evaluación ----------
if(typeof renderPlanPage==='function'){
  const renderPlanPageBeforeV9=renderPlanPage;
  renderPlanPage=function(){renderPlanPageBeforeV9();if(page!=='plan'||state.improvementPlan.questionnaireComplete)return;const w=state.assessmentWorkContext||{};if(w.workType&&$('#workType'))$('#workType').value=w.workType;if(w.area&&$('#workArea'))$('#workArea').value=w.area;if(w.role&&$('#workRole')&&[...$('#workRole').options].some(o=>o.value===w.role))$('#workRole').value=w.role;if(w.responsibility){const cb=$(`#responsibilityChecks input[value="${w.responsibility}"]`);if(cb)cb.checked=true}}
}

// ---------- Monedas: un solo saldo sincronizado en todas las vistas ----------
function syncCoinViews(){const n=state.economy?.coins??0;document.querySelectorAll('#storeCoins,#headerCoins strong,[data-coin-balance]').forEach(el=>el.textContent=n)}
if(typeof ledgerChange==='function'){
  const ledgerChangeBeforeV9=ledgerChange;
  ledgerChange=function(...args){const r=ledgerChangeBeforeV9(...args);syncCoinViews();return r}
}
if(typeof renderStorePage==='function'){
  const renderStorePageBeforeV9=renderStorePage;
  renderStorePage=function(){renderStorePageBeforeV9();syncCoinViews()}
}

// ---------- Avisos importantes ----------
if(typeof systemInsights==='function'){
  const systemInsightsBeforeV9=systemInsights;
  systemInsights=function(){return systemInsightsBeforeV9().map((x,i)=>i===0&&x.type===''?{...x,type:'priority'}:x)}
}
function markImportantNotices(){
  $('#upgradeBanner')?.classList.add('system-important-alert');
  const mission=$('#missionIntro');if(mission&&/detecta|menor evidencia|prioridad/i.test(mission.textContent))mission.classList.add('system-important-text');
  ['#dailyPlanStatus','#dietTrendAdvice','#dietAdaptiveStatus'].forEach(sel=>{const el=$(sel);if(el&&/(incompleto|penalty|ajust|atención|prioridad|riesgo|mejorar)/i.test(el.textContent))el.classList.add('system-important-text')});
}

// ---------- Inicio V9: espaciado y reevaluación ----------
if(typeof renderHome==='function'){
  const renderHomeBeforeV9=renderHome;
  renderHome=function(){renderHomeBeforeV9();if($('#upgradeBanner'))$('#upgradeBanner').classList.toggle('hidden',!(state.assessmentComplete&&(state.assessmentEngineVersion||0)<9));markImportantNotices();syncCoinViews()}
}
if(typeof renderPage==='function'){
  const renderPageBeforeV9=renderPage;
  renderPage=function(){renderPageBeforeV9();markImportantNotices();syncCoinViews()}
}

// Entrada épica: la fanfarria queda sobre la música ambiental.
if(page==='assessment'){
  $('#enterAssessmentBtn')?.addEventListener('click',()=>window.VIDA_MUSIC.start(),{capture:true});
}

state.version=9;localStorage.setItem(storeKey,JSON.stringify(state));
renderPage();syncCoinViews();markImportantNotices();
})();
