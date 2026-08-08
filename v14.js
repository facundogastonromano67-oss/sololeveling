
(function(){
  if (typeof state === 'undefined') return;
  state.version = Math.max(Number(state.version||0), 14);
  const V14_PAGE = document.body?.dataset?.page || (typeof page!=='undefined' ? page : 'home');
  const V14_STORE_KEY = typeof storeKey !== 'undefined' ? storeKey : 'vidaRpgStateV8';

  const ICONS = {
    'index.html':'⌂',
    'plan.html':'🜂',
    'tareas.html':'✓',
    'academia.html':'✦',
    'progreso.html':'▣',
    'perfil.html':'👤',
    'mas.html':'☰',
    'combate.html':'⚔',
    'dietario.html':'🍽',
    'entrenamiento.html':'🏋',
    'recetario.html':'📖',
    'tienda.html':'◈',
    'habilidades.html':'✨',
    'historial.html':'🕘',
    'cuenta.html':'⚙',
    'misiones.html':'⚔'
  };

  const SCENES = {
    home:{art:'visual-home.svg', eyebrow:'FORTALEZA DEL GLADIADOR', title:'Tu personaje ya vive acá adentro', sub:'Abrí la app y encontrá de inmediato tu estado, tu plan y el siguiente paso de tu transformación.'},
    assessment:{art:'visual-coliseo.svg', eyebrow:'EL COLISEO TE OBSERVA', title:'30 preguntas. 30 días. Un punto de partida.', sub:'Primero te medimos. Después construimos tu línea base. Recién entonces comienza tu transformación.'},
    plan:{art:'visual-g30.svg', eyebrow:'PLAN G30', title:'Treinta días para construir una mejor versión de vos', sub:'Trabajo, entrenamiento, alimentación y desarrollo personal en un solo sistema.'},
    combat:{art:'visual-arena.svg', eyebrow:'ARENA', title:'El Coliseo está abierto', sub:'Respondé bajo presión, usá tus habilidades y ganá rating, monedas y prestigio.'},
    academy:{art:'visual-academia.svg', eyebrow:'ARCHIVO DEL SISTEMA', title:'Aprender también es subir de nivel', sub:'Nutrición, entrenamiento, cocina y trabajo en un archivo diseñado para mejorar tu vida real.'},
    recipes:{art:'visual-recipes.svg', eyebrow:'RECETARIO G30', title:'Comé mejor sin vivir a pechuga y arroz', sub:'Recetas reales, pasos claros y macros estimados para sostener el plan en la práctica.'},
    store:{art:'visual-home.svg', eyebrow:'TESORERÍA DEL COLISEO', title:'Usá tus monedas con criterio', sub:'Desbloqueá lecciones, recetas, temas y ventajas dentro del mundo G30.'},
    progress:{art:'visual-g30.svg', eyebrow:'PROGRESO', title:'Lo que no se mide, no sube de nivel', sub:'Tus gráficos, tendencias y señales del Sistema en una sola vista.'},
    training:{art:'visual-home.svg', eyebrow:'ENTRENAMIENTO G30', title:'Entrená con intención', sub:'Elegí, reemplazá y ajustá ejercicios sin perder coherencia en la rutina.'},
    diet:{art:'visual-recipes.svg', eyebrow:'PLAN DE ALIMENTACIÓN', title:'Comidas reales para personas reales', sub:'Configurá una vez y dejá que el plan se adapte a tu vida.'},
    more:{art:'visual-home.svg', eyebrow:'CENTRO DEL SISTEMA', title:'Todos los caminos del Coliseo', sub:'Acá vive el resto del mundo G30: módulos, progreso, archivos y herramientas avanzadas.'},
    profile:{art:'visual-home.svg', eyebrow:'PERFIL', title:'Tu ficha de personaje completa', sub:'Contexto, fortalezas, preferencias y métricas reales en una sola pantalla.'}
  };

  const ARENA_QUESTIONS = [
    {c:'Nutrición', q:'¿Qué nombre es más claro para la estrategia básica de bajar grasa?', a:['Déficit calórico','Déficit calórico'], o:['Déficit calórico','Ayuno infinito','Volumen agresivo','Exceso calórico']},
    {c:'Trabajo', q:'Si tenés 10 tareas y sólo 2 cambian de verdad el día, ¿qué hacés primero?', a:['Priorizás las 2 críticas'], o:['Priorizás las 2 críticas','Abrís muchas a la vez','Esperás a sentir motivación','Hacés primero lo más fácil']},
    {c:'Lógica', q:'Todos los ner son vos. Algunos vos son lam. ¿Qué se puede concluir?', a:['Algunos ner podrían ser lam'], o:['Algunos ner podrían ser lam','Todos los lam son ner','Ningún ner es lam','Todos los vos son lam']},
    {c:'Hábitos', q:'¿Qué suele mejorar más la adherencia a una rutina?', a:['Que sea realista y repetible'], o:['Que sea realista y repetible','Que sea perfecta en papel','Cambiarla todos los días','Hacerla épica una semana']},
    {c:'Carisma', q:'Una persona no entendió tu explicación. ¿Qué suma más?', a:['Pedirle que te explique cómo lo haría'], o:['Pedirle que te explique cómo lo haría','Repetir lo mismo más fuerte','Asumir que ya entendió','Retarlo en público']},
    {c:'Rendimiento', q:'Si una semana sale mal, ¿qué conviene hacer?', a:['Retomar con el siguiente paso simple'], o:['Retomar con el siguiente paso simple','Abandonar y reiniciar el mes próximo','Castigarte más duro','Cambiar todo el plan']},
    {c:'Cocina', q:'Para sostener una alimentación ordenada, ¿qué ayuda más?', a:['Tener recetas simples y repetibles'], o:['Tener recetas simples y repetibles','Improvisar siempre','No cocinar nunca','Depender sólo de delivery']},
    {c:'Físico', q:'¿Qué es mejor para medir progreso de fuerza?', a:['Usar métricas comparables en el tiempo'], o:['Usar métricas comparables en el tiempo','Guiarse sólo por sensaciones','Cambiar cada ejercicio toda la semana','Mirar el espejo un día']},
    {c:'Trabajo', q:'Tu compañero se trabó con una tarea. ¿Qué suma más?', a:['Detectar el bloqueo y destrabarlo'], o:['Detectar el bloqueo y destrabarlo','Esperar a que lo resuelva solo meses','Hacerle todo sin explicar','Ignorarlo']},
    {c:'Lógica', q:'Una máquina hace una pieza en 5 minutos. ¿Cuánto tardan 100 máquinas en hacer 100 piezas, si todas trabajan al mismo tiempo?', a:['5 minutos'], o:['5 minutos','100 minutos','500 minutos','1 minuto']},
    {c:'Nutrición', q:'¿Qué macronutriente es el principal protagonista al hablar de recuperación muscular?', a:['Proteína'], o:['Proteína','Alcohol','Fibra','Sodio']},
    {c:'Integridad', q:'Te cobran menos por un error evidente y nadie lo nota. ¿Qué haría un perfil íntegro?', a:['Avisarlo'], o:['Avisarlo','Aprovecharlo en silencio','Callarse y festejar','Decirlo sólo si te descubren']},
    {c:'Rendimiento', q:'¿Qué destruye más la organización diaria?', a:['No priorizar y reaccionar a todo'], o:['No priorizar y reaccionar a todo','Hacer una lista corta','Bloquear tiempo','Reducir interrupciones']},
    {c:'Hábitos', q:'Dormir 5 horas todos los días, ¿qué suele hacer a largo plazo?', a:['Baja recuperación y consistencia'], o:['Baja recuperación y consistencia','Mejora fuerza por costumbre','Da igual siempre','Aumenta foco sin costo']},
    {c:'Carisma', q:'Si tenés que dar una devolución difícil, ¿qué conviene evitar?', a:['Hacerlo en caliente y con enojo'], o:['Hacerlo en caliente y con enojo','Ser claro y específico','Separar persona de conducta','Buscar un momento adecuado']},
    {c:'Físico', q:'¿Qué tiende a mejorar la movilidad de verdad?', a:['Práctica frecuente y específica'], o:['Práctica frecuente y específica','Hacer una vez al mes','Sólo mirar videos','Forzar dolor siempre']},
    {c:'Trabajo', q:'Para delegar bien, además de explicar la tarea conviene…', a:['Acordar cómo se va a controlar'], o:['Acordar cómo se va a controlar','Soltarla y nunca revisarla','No delegar jamás','Dar órdenes ambiguas']},
    {c:'Lógica', q:'Si hoy es martes, ¿qué día será dentro de 10 días?', a:['Viernes'], o:['Viernes','Jueves','Domingo','Lunes']},
    {c:'Nutrición', q:'¿Qué suele funcionar mejor para sostener una dieta?', a:['Comidas que te gusten y puedas repetir'], o:['Comidas que te gusten y puedas repetir','Sólo comidas perfectas','Eliminar todos los carbohidratos','Comer distinto cada hora']},
    {c:'Rendimiento', q:'Si una tarea depende de otra persona, ¿qué mejora la ejecución?', a:['Confirmar responsable y fecha'], o:['Confirmar responsable y fecha','Asumir que se hará sola','No preguntar jamás','Acordarte al final del día']},
    {c:'Cocina', q:'¿Qué ventaja tiene cocinar por adelantado?', a:['Reduce fricción y decisiones'], o:['Reduce fricción y decisiones','Te hace comer menos por magia','Elimina calorías','No cambia nada']},
    {c:'Carisma', q:'Una conversación incómoda se posterga sola por miedo. ¿Qué habilidad está fallando más?', a:['Valentía social'], o:['Valentía social','Velocidad de sprint','Flexibilidad','Ortografía']},
    {c:'Físico', q:'En general, para mejorar resistencia sirve más…', a:['Practicar esfuerzos repetidos de forma progresiva'], o:['Practicar esfuerzos repetidos de forma progresiva','Entrenar una vez cada tanto','No medir tiempos jamás','Dormir menos']},
    {c:'Trabajo', q:'¿Qué describe mejor a una persona organizada?', a:['Sabe qué es importante y lo sigue'], o:['Sabe qué es importante y lo sigue','Hace de todo al mismo tiempo','Resuelve todo por impulso','Nunca revisa el avance']},
    {c:'Lógica', q:'¿Cuál completa mejor la secuencia: 2, 4, 8, 16, …?', a:['32'], o:['32','24','18','30']},
    {c:'Nutrición', q:'¿Qué enfoque suele ser más sensato para perder peso?', a:['Déficit calórico sostenible'], o:['Déficit calórico sostenible','Hambre extrema sin límite','Suprimir agua','Entrenar sin comer']},
    {c:'Rendimiento', q:'Cuando algo sale muy mal, recuperar la calma ayuda porque…', a:['mejora la calidad de la siguiente decisión'], o:['mejora la calidad de la siguiente decisión','te vuelve más fuerte al instante','borra el error','evita trabajar']},
    {c:'Carisma', q:'¿Qué mejora más una explicación?', a:['Ejemplos claros'], o:['Ejemplos claros','Más tecnicismos','Hablar más rápido','No verificar nada']},
    {c:'Físico', q:'Si querés medir progreso corriendo, ¿qué dato te sirve?', a:['Tiempo y distancia comparables'], o:['Tiempo y distancia comparables','Sólo la ropa que usaste','La música del día','Lo cansado que estabas hace un mes']},
    {c:'Trabajo', q:'Si una misión diaria no aplica a la vida del usuario, el sistema debería…', a:['Ofrecer una alternativa equivalente'], o:['Ofrecer una alternativa equivalente','Obligarlo igual','Borrarle el día','Cambiarle toda la app']}
  ];

  function safePersist(renderAfter){
    try{
      if(typeof persist === 'function') persist(!!renderAfter);
      else localStorage.setItem(V14_STORE_KEY, JSON.stringify(state));
    }catch(e){}
  }

  function syncCoinsEverywhere(){
    const value = String(state?.economy?.coins ?? 0);
    document.querySelectorAll('#headerCoins strong,#storeCoins,[data-coin-balance]').forEach(el=>{ el.textContent = value; });
  }

  function levelFromState(){
    const direct = Number(state?.rpgLevel || state?.profile?.level || state?.player?.level || 0);
    if(direct) return direct;
    const xp = Number(state?.generalXp || state?.xp || state?.economy?.xp || 0);
    return Math.max(1, Math.floor(xp/120)+1);
  }

  function decorateNav(){
    document.querySelectorAll('.topbar nav a, .mobile-nav a').forEach(a=>{
      const href = a.getAttribute('href') || '';
      const icon = ICONS[href] || '✦';
      a.dataset.vicon = icon;
      if(href.includes('perfil.html')) a.classList.add('nav-profile-link');
    });
  }

  function injectScene(){
    const scene = SCENES[V14_PAGE];
    const main = document.querySelector('main');
    if(!scene || !main || document.querySelector('.page-scene.v14')) return;

    const section = document.createElement('section');
    section.className = 'page-scene v14 card';
    section.innerHTML = `
      <img src="${scene.art}" alt="" class="scene-art">
      <div class="scene-veil"></div>
      <div class="scene-content">
        <div class="eyebrow">${scene.eyebrow}</div>
        <h1>${scene.title}</h1>
        <p class="muted">${scene.sub}</p>
      </div>`;
    if(V14_PAGE === 'assessment'){
      const anchor = document.querySelector('.assessment-shell') || main.firstElementChild;
      if(anchor) main.insertBefore(section, anchor);
      else main.prepend(section);
    }else{
      const firstCard = main.querySelector('.card');
      if(firstCard) main.insertBefore(section, firstCard);
      else main.prepend(section);
    }
  }

  function enhanceMorePage(){
    document.querySelectorAll('.system-module').forEach(a=>{
      const href = a.getAttribute('href') || '';
      a.dataset.vicon = ICONS[href] || '✦';
    });
  }

  function enhanceHomePage(){
    const hero = document.querySelector('.home-profile-v8');
    if(hero && !hero.querySelector('.hero-sigil')){
      const badge = document.createElement('div');
      badge.className = 'hero-sigil';
      badge.innerHTML = '<span>G30</span>';
      hero.appendChild(badge);
    }
    document.querySelectorAll('.home-panel .ghost, .home-panel .primary, .g30-home-card .ghost, .g30-home-card .primary').forEach(btn=>{
      btn.classList.add('compact-action');
    });
  }

  function enhanceAssessmentEntry(){
    const cta = [...document.querySelectorAll('button,a')].find(el => /abrir las puertas|comenzar tu transformación|entrar a vida/i.test(el.textContent||''));
    if(cta) cta.textContent = 'COMENZAR TU TRANSFORMACIÓN';
    const intro = document.querySelector('.assessment-intro,.assessment-hero,.card');
    if(intro && !intro.querySelector('.gladiator-affirmations')){
      const box = document.createElement('div');
      box.className = 'gladiator-affirmations';
      box.innerHTML = `
        <div class="affirm">¿Querés cambiar tu vida?</div>
        <div class="affirm">¿Querés construir una versión más fuerte de vos?</div>
        <div class="affirm">¿Estás dispuesto a entrar al Coliseo?</div>`;
      const target = intro.querySelector('h1')?.parentElement || intro;
      target.appendChild(box);
    }
  }

  function enhanceAcademyPage(){
    document.querySelectorAll('.lesson-card, .academy-card').forEach(card=>{
      card.classList.add('ornate-card');
    });
  }

  function showToastV14(msg, tone){
    const stack = document.getElementById('toastStack');
    if(!stack) return;
    const t = document.createElement('div');
    t.className = 'toast v14 '+(tone||'');
    t.textContent = msg;
    stack.appendChild(t);
    setTimeout(()=>t.classList.add('show'), 20);
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(), 260); }, 2800);
  }

  // ----------- ARENA -----------
  let arenaState = null;

  function initArenaV14(){
    renderArenaHeader();
    renderAbilityCatalog();
    const botBtn = document.getElementById('startBotBattleBtn');
    const localBtn = document.getElementById('startLocalBattleBtn');
    const onlineBtn = document.getElementById('onlineBattleBtn');
    const closeBtn = document.getElementById('closeBattleBtn');
    const resultCloseBtn = document.getElementById('battleResultCloseBtn');
    const continueBtn = document.getElementById('continueLocalTurnBtn');

    if(botBtn) botBtn.onclick = ()=> startBattle('bot');
    if(localBtn) localBtn.onclick = ()=> startBattle('local');
    if(onlineBtn) onlineBtn.onclick = ()=>{
      const box = document.getElementById('onlineBattleMessage');
      if(box){ box.textContent = 'El PvP online ya tiene su arquitectura preparada, pero todavía necesita sincronización en tiempo real. Mientras tanto, podés usar Entrenamiento o Versus local.'; box.classList.add('system-important-alert'); }
    };
    if(closeBtn) closeBtn.onclick = ()=> closeBattle();
    if(resultCloseBtn) resultCloseBtn.onclick = ()=> closeBattle();
    if(continueBtn) continueBtn.onclick = ()=>{
      document.getElementById('passDevicePanel')?.classList.add('hidden');
      nextRound();
    };
  }

  function renderArenaHeader(){
    state.arena = state.arena || {rating:1000, wins:0, losses:0, streak:0};
    document.getElementById('arenaRating') && (document.getElementById('arenaRating').textContent = state.arena.rating);
    document.getElementById('arenaRecord') && (document.getElementById('arenaRecord').textContent = `${state.arena.wins||0}V · ${state.arena.losses||0}D`);
    const lvl = levelFromState();
    const pill = document.getElementById('combatLevelPill');
    if(pill) pill.textContent = `Nivel ${lvl} · ${availableAbilities(lvl).length} habilidades`;
  }

  function availableAbilities(level){
    return [
      {id:'analysis', name:'Análisis temporal', cost:2, min:1, desc:'Elimina dos respuestas incorrectas.'},
      {id:'crit', name:'Golpe crítico', cost:3, min:3, desc:'Tu siguiente respuesta correcta hace +60% daño.'},
      {id:'shield', name:'Escudo mental', cost:3, min:5, desc:'Reduce a la mitad el próximo golpe recibido.'},
      {id:'focus', name:'Ráfaga de foco', cost:4, min:8, desc:'Recuperás +2 de foco y ganás +2s en la siguiente pregunta.'},
      {id:'pattern', name:'Lectura del patrón', cost:5, min:12, desc:'Muestra cuál de dos opciones es incorrecta y suma +15% daño.'},
      {id:'dominion', name:'Dominio', cost:6, min:16, desc:'Tu siguiente respuesta correcta golpea dos veces.'}
    ].filter(a=>level>=a.min);
  }

  function renderAbilityCatalog(){
    const list = document.getElementById('combatAbilityList');
    if(!list) return;
    const lvl = levelFromState();
    list.innerHTML = availableAbilities(lvl).map(a=>`
      <div class="ability-card ornate-card">
        <div class="ability-head"><strong>${a.name}</strong><span>${a.cost} Foco</span></div>
        <small>Nivel ${a.min} · ${a.desc}</small>
      </div>`).join('');
  }

  function startBattle(mode){
    const name = state?.player?.name || 'Gladiador';
    const overlay = document.getElementById('battleOverlay');
    if(!overlay) return;
    const qPool = [...ARENA_QUESTIONS].sort(()=>Math.random()-0.5);
    arenaState = {
      mode,
      qPool,
      used:[],
      timer:null,
      duration:12,
      activePlayer:1,
      waitingPass:false,
      p1:{name, hp:100, focus:2, shield:false, crit:false, pattern:false, dominion:false, timeBonus:0, insight:false},
      p2: mode==='bot'
          ? {name:'Sistema', hp:100, focus:2, shield:false, crit:false, pattern:false, dominion:false, timeBonus:0, insight:false}
          : {name:'Jugador 2', hp:100, focus:2, shield:false, crit:false, pattern:false, dominion:false, timeBonus:0, insight:false},
      log:[`${mode==='bot' ? 'Duelo contra el Sistema' : 'Versus local'} iniciado.`],
      turn:0,
      currentQuestion:null,
      answered:false
    };
    document.getElementById('battleResultPanel')?.classList.add('hidden');
    document.getElementById('passDevicePanel')?.classList.add('hidden');
    overlay.classList.remove('hidden');
    updateBattleHud();
    nextRound();
  }

  function closeBattle(){
    clearInterval(arenaState?.timer);
    arenaState = null;
    document.getElementById('battleOverlay')?.classList.add('hidden');
  }

  function randomQuestion(){
    if(!arenaState) return null;
    if(arenaState.qPool.length===0) arenaState.qPool = [...ARENA_QUESTIONS].sort(()=>Math.random()-0.5);
    const q = arenaState.qPool.shift();
    arenaState.used.push(q.q);
    return q;
  }

  function nextRound(){
    if(!arenaState) return;
    if(checkBattleEnd()) return;
    arenaState.turn += 1;
    arenaState.answered = false;
    arenaState.currentQuestion = randomQuestion();
    renderQuestion();
    updateBattleHud();
    startTimer(arenaState.duration + (currentActor().timeBonus||0));
    currentActor().timeBonus = 0;
  }

  function renderQuestion(){
    if(!arenaState) return;
    const q = arenaState.currentQuestion;
    const category = document.getElementById('battleCategory');
    const question = document.getElementById('battleQuestion');
    const answers = document.getElementById('battleAnswers');
    if(category) category.textContent = `${q.c} · Turno de ${currentActor().name}`;
    if(question) question.textContent = q.q;
    const opts = [...q.o].sort(()=>Math.random()-0.5);
    let visible = opts;
    if(currentActor().insight){
      const wrong = visible.filter(o=>o!==q.a[0]);
      visible = visible.filter(o=>!wrong.slice(0,2).includes(o));
      currentActor().insight = false;
    }else if(currentActor().pattern){
      const wrong = visible.filter(o=>o!==q.a[0]);
      visible = visible.filter(o=>!wrong.slice(0,1).includes(o));
      currentActor().pattern = false;
    }
    if(answers){
      answers.innerHTML = visible.map(opt=>`<button class="answer-btn" data-answer="${encodeURIComponent(opt)}">${opt}</button>`).join('');
      answers.querySelectorAll('button').forEach(btn=>btn.onclick = ()=> handleAnswer(decodeURIComponent(btn.dataset.answer)));
    }
    renderBattleAbilities();
    renderBattleLog();
  }

  function renderBattleAbilities(){
    const box = document.getElementById('battleAbilities');
    if(!box || !arenaState) return;
    const actor = currentActor();
    const lvl = levelFromState();
    box.innerHTML = availableAbilities(lvl).map(a=>{
      const disabled = actor.focus < a.cost ? 'disabled' : '';
      return `<button class="ability-chip ${disabled?'disabled':''}" data-ability="${a.id}" ${disabled}>${a.name} <span>${a.cost}</span></button>`;
    }).join('');
    box.querySelectorAll('[data-ability]').forEach(btn=>btn.onclick = ()=> useAbility(btn.dataset.ability));
  }

  function useAbility(id){
    if(!arenaState) return;
    const actor = currentActor();
    const ability = availableAbilities(levelFromState()).find(a=>a.id===id);
    if(!ability || actor.focus < ability.cost) return;
    actor.focus -= ability.cost;
    if(id==='analysis') actor.insight = true;
    if(id==='crit') actor.crit = true;
    if(id==='shield') actor.shield = true;
    if(id==='focus'){ actor.focus += 2; actor.timeBonus += 2; }
    if(id==='pattern') actor.pattern = true;
    if(id==='dominion') actor.dominion = true;
    arenaState.log.unshift(`${actor.name} activó ${ability.name}.`);
    updateBattleHud();
    renderQuestion();
  }

  function startTimer(seconds){
    clearInterval(arenaState?.timer);
    let left = seconds;
    const bar = document.getElementById('battleTimerBar');
    const text = document.getElementById('battleTimerText');
    const draw = ()=>{
      if(text) text.textContent = left.toFixed(1);
      if(bar) bar.style.width = `${Math.max(0,(left/seconds)*100)}%`;
    };
    draw();
    arenaState.timer = setInterval(()=>{
      left = Math.max(0, left - 0.1);
      arenaState.timeLeft = left;
      draw();
      if(left<=0.001){
        clearInterval(arenaState.timer);
        onTimeout();
      }
    },100);
  }

  function onTimeout(){
    if(!arenaState || arenaState.answered) return;
    arenaState.answered = true;
    arenaState.log.unshift(`${currentActor().name} se quedó sin tiempo.`);
    if(arenaState.mode==='bot' && arenaState.activePlayer===1){
      setTimeout(botAction, 600);
    }else if(arenaState.mode==='local'){
      switchLocalTurn('Tiempo agotado. Pasá el dispositivo.');
    }else{
      applyAttack(currentTarget(), currentActor(), 0, 'Falló por tiempo');
      setTimeout(nextRound, 800);
    }
  }

  function handleAnswer(answer){
    if(!arenaState || arenaState.answered) return;
    arenaState.answered = true;
    clearInterval(arenaState.timer);
    const q = arenaState.currentQuestion;
    const correct = answer === q.a[0];
    const speedFactor = Math.max(0.55, Math.min(1.25, (arenaState.timeLeft||0) / (arenaState.duration||12) + 0.3));
    const base = correct ? Math.round(12 * speedFactor) : 0;
    let dmg = base;
    const actor = currentActor();
    const target = currentTarget();
    if(correct){
      actor.focus = Math.min(10, actor.focus + 2);
      if(actor.crit){ dmg = Math.round(dmg*1.6); actor.crit = false; }
      if(actor.dominion){ dmg += Math.round(dmg*0.7); actor.dominion = false; }
      applyAttack(target, actor, dmg, 'Respuesta correcta');
    }else{
      actor.focus = Math.max(0, actor.focus - 1);
      arenaState.log.unshift(`${actor.name} respondió mal.`);
    }
    updateBattleHud();
    if(checkBattleEnd()) return;
    if(arenaState.mode==='bot'){
      if(arenaState.activePlayer===1) setTimeout(botAction, 800);
      else setTimeout(nextRound, 800);
    }else{
      switchLocalTurn(correct ? 'Respuesta registrada. Pasá el dispositivo.' : 'Turno finalizado. Pasá el dispositivo.');
    }
  }

  function botAction(){
    if(!arenaState || checkBattleEnd()) return;
    arenaState.activePlayer = 2;
    const bot = arenaState.p2;
    const player = arenaState.p1;
    const difficulty = (state.arena?.rating||1000);
    const successChance = Math.max(0.45, Math.min(0.82, 0.62 + (difficulty-1000)/2200));
    const correct = Math.random() < successChance;
    if(correct){
      bot.focus = Math.min(10, bot.focus + 2);
      let dmg = 10 + Math.round(Math.random()*6);
      if(bot.focus>=5 && Math.random()<0.25){ bot.focus -= 3; dmg = Math.round(dmg*1.5); arenaState.log.unshift('Sistema activó Golpe crítico.'); }
      applyAttack(player, bot, dmg, 'El Sistema respondió correctamente');
    }else{
      bot.focus = Math.max(0, bot.focus - 1);
      arenaState.log.unshift('El Sistema falló su respuesta.');
    }
    updateBattleHud();
    if(checkBattleEnd()) return;
    arenaState.activePlayer = 1;
    setTimeout(nextRound, 900);
  }

  function switchLocalTurn(message){
    if(!arenaState) return;
    arenaState.activePlayer = arenaState.activePlayer===1 ? 2 : 1;
    const panel = document.getElementById('passDevicePanel');
    const title = document.getElementById('passDeviceTitle');
    if(panel) panel.classList.remove('hidden');
    if(title) title.textContent = message || `Pasale el dispositivo a ${currentActor().name}.`;
    updateBattleHud();
  }

  function applyAttack(target, actor, amount, reason){
    let dmg = amount;
    if(target.shield){ dmg = Math.round(dmg*0.5); target.shield = false; arenaState.log.unshift(`${target.name} redujo el daño con Escudo mental.`); }
    target.hp = Math.max(0, target.hp - dmg);
    arenaState.log.unshift(`${actor.name} infligió ${dmg} de daño. ${reason||''}`.trim());
  }

  function updateBattleHud(){
    if(!arenaState) return;
    document.getElementById('battleP1Name') && (document.getElementById('battleP1Name').textContent = arenaState.p1.name);
    document.getElementById('battleP2Name') && (document.getElementById('battleP2Name').textContent = arenaState.p2.name);
    setBar('battleP1Hp', arenaState.p1.hp); setText('battleP1HpText', arenaState.p1.hp);
    setBar('battleP2Hp', arenaState.p2.hp); setText('battleP2HpText', arenaState.p2.hp);
    setText('battleP1Focus', arenaState.p1.focus); setText('battleP2Focus', arenaState.p2.focus);
    renderBattleAbilities();
    renderBattleLog();
  }

  function renderBattleLog(){
    const log = document.getElementById('battleLog');
    if(!log || !arenaState) return;
    log.innerHTML = arenaState.log.slice(0,5).map(line=>`<div class="battle-log-line">${line}</div>`).join('');
  }

  function setBar(id, value){
    const el = document.getElementById(id);
    if(el) el.style.width = `${Math.max(0,Math.min(100,value))}%`;
  }
  function setText(id, value){
    const el = document.getElementById(id);
    if(el) el.textContent = value;
  }

  function checkBattleEnd(){
    if(!arenaState) return true;
    if(arenaState.ended) return true;
    if(arenaState.p1.hp>0 && arenaState.p2.hp>0) return false;
    arenaState.ended = true;
    clearInterval(arenaState.timer);
    const p1Won = arenaState.p1.hp > 0;
    const resultPanel = document.getElementById('battleResultPanel');
    if(resultPanel) resultPanel.classList.remove('hidden');
    const title = document.getElementById('battleResultTitle');
    const text = document.getElementById('battleResultText');
    const rewardCoins = p1Won ? (arenaState.mode==='bot' ? 10 : 8) : 2;
    state.economy = state.economy || {coins:0};
    state.arena = state.arena || {rating:1000,wins:0,losses:0,streak:0};
    state.economy.coins = (state.economy.coins||0) + rewardCoins;
    if(p1Won){ state.arena.wins=(state.arena.wins||0)+1; state.arena.streak=(state.arena.streak||0)+1; state.arena.rating = Math.min(3000, (state.arena.rating||1000) + (arenaState.mode==='bot' ? 18 : 12)); }
    else { state.arena.losses=(state.arena.losses||0)+1; state.arena.streak=0; state.arena.rating = Math.max(700, (state.arena.rating||1000) - 12); }
    safePersist(false);
    syncCoinsEverywhere();
    renderArenaHeader();
    if(title) title.textContent = p1Won ? 'VICTORIA EN EL COLISEO' : 'DERROTA';
    if(text) text.textContent = p1Won
      ? `Ganaste el combate y recibiste ${rewardCoins} monedas. Rating actual: ${state.arena.rating}.`
      : `Perdiste el combate. Aun así recibiste ${rewardCoins} monedas por participar. Rating actual: ${state.arena.rating}.`;
    showToastV14(p1Won ? `+${rewardCoins} monedas · Victoria` : `+${rewardCoins} monedas · Aprendizaje`, p1Won ? 'good' : 'warn');
    return true;
  }

  function currentActor(){ return arenaState?.activePlayer===1 ? arenaState.p1 : arenaState.p2; }
  function currentTarget(){ return arenaState?.activePlayer===1 ? arenaState.p2 : arenaState.p1; }

  function init(){
    safePersist(false);
    syncCoinsEverywhere();
    decorateNav();
    injectScene();
    if(V14_PAGE==='more') enhanceMorePage();
    if(V14_PAGE==='home') enhanceHomePage();
    if(V14_PAGE==='assessment') enhanceAssessmentEntry();
    if(V14_PAGE==='academy') enhanceAcademyPage();
    if(V14_PAGE==='combat') initArenaV14();
    // post-render adjustments
    setTimeout(()=>{
      syncCoinsEverywhere();
      if(V14_PAGE==='more') enhanceMorePage();
      if(V14_PAGE==='home') enhanceHomePage();
    }, 400);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
