(()=>{
state.version=10;
try{localStorage.setItem(storeKey,JSON.stringify(state))}catch(e){}

// ---------- V10 · saldo de Tienda siempre sincronizado ----------
function syncStoreBalanceV10(){
  const large=document.querySelector('#storeCoins');
  const small=document.querySelector('#headerCoins strong');
  const value=small?.textContent?.trim() || String(state.economy?.coins ?? 0);
  if(large)large.textContent=value;
  document.querySelectorAll('[data-coin-balance]').forEach(el=>el.textContent=value);
}
function bindStoreBalanceV10(){
  syncStoreBalanceV10();
  const small=document.querySelector('#headerCoins strong');
  if(small){
    new MutationObserver(()=>syncStoreBalanceV10()).observe(small,{childList:true,characterData:true,subtree:true});
  }
  if(page==='store'){
    document.addEventListener('click',e=>{
      if(!e.target.closest('[data-shop-item],[data-coin-pack]'))return;
      // La lógica V7 actualiza primero el estado/saldo superior; copiamos luego del mismo evento.
      queueMicrotask(syncStoreBalanceV10);
      setTimeout(syncStoreBalanceV10,20);
      setTimeout(syncStoreBalanceV10,120);
    });
  }
}

// ---------- V10 · música real en vez de drone continuo ----------
const legacyMusic=window.VIDA_MUSIC;
try{legacyMusic?.stop?.()}catch(e){}
window.VIDA_MUSIC=(()=>{
  const posKey='vidaRpgMusicPositionV10';
  let audio=null;
  let wanted=false;
  function soundOn(){return window.VIDA_SOUND?.enabled?.()!==false}
  function ensure(){
    if(audio)return audio;
    audio=new Audio('vida-rpg-theme-v10.mp3');
    audio.loop=true;
    audio.preload='auto';
    audio.volume=.18;
    const saved=Number(sessionStorage.getItem(posKey));
    audio.addEventListener('loadedmetadata',()=>{
      if(Number.isFinite(saved)&&saved>0&&audio.duration){try{audio.currentTime=saved%audio.duration}catch(e){}}
    },{once:true});
    return audio;
  }
  function savePosition(){if(audio&&Number.isFinite(audio.currentTime))sessionStorage.setItem(posKey,String(audio.currentTime))}
  async function start(){
    wanted=true;if(!soundOn())return false;
    const a=ensure();
    try{await a.play();return !a.paused}catch(e){return false}
  }
  async function stop(){wanted=false;savePosition();if(audio)audio.pause();return true}
  function pauseForPage(){savePosition();if(audio)audio.pause()}
  async function resumeForPage(){if(wanted&&soundOn())return start();return false}
  window.addEventListener('pagehide',savePosition);
  document.addEventListener('visibilitychange',()=>document.hidden?pauseForPage():resumeForPage());
  return{start,stop,pauseForPage,resumeForPage};
})();
if(window.VIDA_SOUND){
  window.VIDA_SOUND.startAmbient=()=>window.VIDA_MUSIC.start();
  window.VIDA_SOUND.stopAmbient=()=>window.VIDA_MUSIC.stop();
}
// Autoplay puede ser bloqueado: se intenta ahora y se vuelve a intentar con el primer gesto.
/* G30 inicia la música desde v11.js */
/* G30 gestiona el primer gesto desde v11.js */

// ---------- V10 · Academia: lectura más completa + examen bajo demanda ----------
const lessonExtraV10={
'nut-energia':[
  'El peso corporal no cambia de forma perfectamente lineal. Agua, glucógeno, sodio, contenido intestinal y entrenamiento pueden mover la balanza aunque la tendencia de grasa no haya cambiado. Por eso conviene mirar promedios de varios días y no reaccionar a una sola medición.',
  'El gasto tampoco es un número fijo: cambia con el tamaño corporal, el movimiento diario y el entrenamiento. Una estimación sirve para empezar; después se corrige con la tendencia real y con cómo responde la persona.',
  'Aplicación práctica: si el objetivo es bajar grasa, elegí un déficit que permita seguir entrenando y sostener la rutina. Si el hambre, el sueño o el rendimiento se deterioran mucho, el plan probablemente necesite un ajuste.'
],
'nut-macros':[
  'Los macronutrientes no funcionan de manera aislada. Dos dietas con calorías similares pueden sentirse muy distintas según la cantidad de proteína, fibra, grasa, volumen de comida y alimentos elegidos.',
  'Los carbohidratos suelen ser especialmente útiles cuando hay entrenamiento intenso o deportes repetidos. Las grasas aportan energía y forman parte de procesos importantes, por lo que llevarlas demasiado abajo tampoco es una buena estrategia general.',
  'Aplicación práctica: primero cubrí una estructura razonable de proteína y alimentos nutritivos; después distribuí carbohidratos y grasas de una manera que encaje con tu actividad, preferencias y adherencia.'
],
'nut-proteina':[
  'Para una persona que entrena, repartir proteína en varias comidas puede facilitar alcanzar el total diario. No hace falta que cada comida sea idéntica ni que exista una “ventana” de pocos minutos después de entrenar.',
  'Más proteína no compensa un programa sin progresión ni una recuperación muy pobre. El crecimiento muscular aparece de la interacción entre estímulo, nutrición, descanso y tiempo.',
  'Aplicación práctica: elegí fuentes que puedas repetir con facilidad y controlá el total del día antes de preocuparte por detalles pequeños de horario.'
],
'nut-etiquetas':[
  'Además de las calorías, revisá la porción declarada. Un envase puede parecer bajo en calorías simplemente porque la porción del rótulo es mucho menor que la que normalmente consumirías.',
  'Para comparar productos de la misma categoría, mirar por 100 g o por una porción equivalente evita conclusiones engañosas. Después entran preferencias, precio, saciedad y objetivo.',
  'Aplicación práctica: elegí dos productos que comprás seguido y comparalos usando exactamente la misma cantidad. Probablemente la diferencia sea distinta de la impresión que dejan los frentes de los envases.'
],
'nut-adherencia':[
  'La adherencia no significa comer perfecto. Significa que el sistema funciona suficientes días como para producir una tendencia útil sin exigir una vida imposible de sostener.',
  'Los planes rígidos suelen fallar cuando aparece una comida social, un viaje o una semana complicada. Tener opciones de reemplazo y una forma clara de volver al plan reduce el efecto “ya arruiné todo”.',
  'Aplicación práctica: definí una versión normal y una versión mínima del plan. En un día difícil, cumplir la versión mínima mantiene la continuidad.'
],
'ent-adaptaciones':[
  'La fuerza depende del músculo, pero también de coordinación, técnica y práctica específica. Por eso alguien puede volverse bastante más fuerte antes de ver grandes cambios visuales.',
  'La hipertrofia responde al trabajo suficiente y progresivo a lo largo del tiempo. La resistencia, en cambio, requiere adaptaciones que permitan sostener esfuerzos y recuperarse de ellos.',
  'Aplicación práctica: elegí una prioridad principal para el bloque actual. Podés conservar las otras cualidades, pero la programación resulta más clara cuando sabés qué querés mejorar primero.'
],
'ent-sobrecarga':[
  'La sobrecarga progresiva es una tendencia, no una obligación de superar un récord cada sesión. El rendimiento diario fluctúa por sueño, estrés, alimentación y fatiga acumulada.',
  'Mejorar técnica o rango de movimiento con la misma carga puede representar una progresión real. También puede progresarse manteniendo repeticiones con menor esfuerzo percibido.',
  'Aplicación práctica: registrá al menos carga, repeticiones y una nota breve de esfuerzo. Eso te permite comparar sesiones sin depender de la memoria.'
],
'ent-volumen':[
  'Más volumen puede producir más estímulo hasta cierto punto, pero también más fatiga. A partir de ahí, agregar series puede empeorar la calidad del entrenamiento y la recuperación.',
  'La frecuencia ayuda a repartir trabajo. Dos sesiones moderadas de un grupo muscular pueden ser más manejables que concentrar todo en una sola sesión enorme.',
  'Aplicación práctica: cuando aumentes trabajo, cambiá una variable importante por vez. Así podés observar mejor qué mejora y qué empieza a afectar la recuperación.'
],
'ent-recuperacion':[
  'Recuperar no es simplemente “no entrenar”. Incluye dormir, comer suficiente para el objetivo, manejar la carga y dejar que los tejidos y el sistema nervioso respondan al estímulo.',
  'Una caída aislada del rendimiento no prueba sobreentrenamiento. Lo que importa es una tendencia: peor rendimiento, fatiga persistente, sueño deteriorado o molestias que no se resuelven.',
  'Aplicación práctica: compará cómo dormiste, cómo te sentís y cómo rendís. Si varias señales empeoran juntas durante varios días, considerá reducir carga o descansar.'
],
'ent-consistencia':[
  'La rutina tiene que sobrevivir a la vida real. Un programa que exige seis días cuando sólo podés sostener tres genera culpa, no progreso.',
  'Una buena estrategia es definir sesiones esenciales y sesiones opcionales. Si la semana se complica, preservás lo esencial en lugar de abandonar todo.',
  'Aplicación práctica: pensá cuál sería tu entrenamiento mínimo viable. Esa versión es la que mantiene viva la cadena en semanas difíciles.'
],
'trab-prioridades':[
  'Urgencia e importancia no son lo mismo. También existe una tercera variable muy útil: dependencia. Una tarea puede ser pequeña pero desbloquear el trabajo de varias personas.',
  'Priorizar implica aceptar que algo quedará para después. Si todo es prioridad, en la práctica nada lo es y el día termina dominado por lo último que apareció.',
  'Aplicación práctica: elegí tres resultados del día y preguntate cuál de ellos genera más consecuencias positivas si se termina primero.'
],
'trab-comunicacion':[
  'La claridad no se mide por cuánto hablaste sino por cuánto entendió la otra persona. Mensajes largos pueden seguir siendo ambiguos si no definen resultado, responsable y momento de revisión.',
  'Cuando el costo de equivocarse es alto, confirmar comprensión vale más que asumirla. Pedir que la otra persona explique el próximo paso puede descubrir diferencias antes de que se conviertan en errores.',
  'Aplicación práctica: en tu próximo pedido importante, cerrá la conversación con una frase concreta sobre qué se entrega y cuándo se vuelve a revisar.'
],
'trab-feedback':[
  'El feedback útil apunta a una conducta que puede modificarse. Frases como “sos desordenado” atacan identidad; describir un hecho específico permite trabajar sobre algo observable.',
  'El momento también importa. Si la emoción es demasiado alta, puede ser mejor ordenar los hechos primero y tener la conversación cuando ambos puedan procesarla.',
  'Aplicación práctica: estructurá el mensaje en tres partes: qué ocurrió, qué impacto tuvo y qué cambio concreto esperás la próxima vez.'
],
'trab-problemas':[
  'Definir bien el problema reduce la cantidad de soluciones inútiles. Preguntá qué debía pasar, qué pasó realmente, desde cuándo ocurre y qué cambió alrededor del momento en que empezó.',
  'Probar una variable por vez suele dar más información que hacer cinco cambios simultáneos. Aunque el segundo método parezca más rápido, después no sabés qué corrigió realmente el problema.',
  'Aplicación práctica: escribí una hipótesis y una prueba pequeña que pueda confirmarla o debilitarla antes de rediseñar todo el proceso.'
],
'trab-sistemas':[
  'Un sistema útil convierte una intención en una secuencia repetible. Puede ser tan simple como un disparador, una checklist de tres pasos y una revisión final.',
  'Automatizar o documentar tiene un costo, por eso conviene empezar por tareas repetitivas, críticas o propensas a error. No tiene sentido crear burocracia para algo excepcional y sencillo.',
  'Aplicación práctica: elegí un error repetido de la última semana y pensá qué señal o checklist mínima podría prevenirlo la próxima vez.'
]
};

function ensureLessonExamUiV10(){
  if(page!=='academy')return;
  const body=document.querySelector('#lessonBody'),quiz=document.querySelector('.lesson-quiz');
  if(!body||!quiz)return;
  let btn=document.querySelector('#startLessonExamBtn');
  if(!btn){
    btn=document.createElement('button');btn.id='startLessonExamBtn';btn.className='primary lesson-exam-entry';btn.textContent='Entrar al examen básico';
    body.insertAdjacentElement('afterend',btn);
    btn.addEventListener('click',()=>{
      quiz.classList.remove('hidden');btn.classList.add('hidden');
      const h=quiz.querySelector('h3');if(h)h.textContent='Examen básico';
      quiz.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }
}
if(page==='academy'&&typeof openLesson==='function'){
  const openLessonV9=openLesson;
  openLesson=function(id){
    openLessonV9(id);
    const overlay=document.querySelector('#lessonOverlay');if(!overlay||overlay.classList.contains('hidden'))return;
    ensureLessonExamUiV10();
    const body=document.querySelector('#lessonBody');
    const extra=lessonExtraV10[id]||[];
    if(body&&extra.length){
      const section=document.createElement('section');section.className='lesson-deepening-v10';
      const title=document.createElement('h3');title.textContent='Profundización';section.appendChild(title);
      extra.forEach(text=>{const p=document.createElement('p');p.textContent=text;section.appendChild(p)});
      body.appendChild(section);
    }
    const quiz=document.querySelector('.lesson-quiz'),btn=document.querySelector('#startLessonExamBtn');
    quiz?.classList.add('hidden');btn?.classList.remove('hidden');
  };
  ensureLessonExamUiV10();
}

bindStoreBalanceV10();
})();
