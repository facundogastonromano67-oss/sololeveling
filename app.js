const $=(s)=>document.querySelector(s);
const storeKey='vidaRpgStateV3';
const v2Key='vidaRpgStateV2';
const v1Key='vidaRpgStateV1';
const todayKey=()=>new Date().toISOString().slice(0,10);
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const rank=(n)=>n>=91?'Trascendente':n>=81?'Mítico':n>=71?'Legendario':n>=61?'Maestro':n>=51?'Diamante':n>=41?'Platino':n>=31?'Oro':n>=21?'Plata':n>=11?'Bronce':'Novato';
const escapeHtml=(s)=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));

const skillMap={
  Intelecto:['Inteligencia aplicada','Conocimiento','Aprendizaje','Resolución de problemas','Creatividad'],
  Carisma:['Comunicación','Habilidades sociales','Liderazgo','Control emocional','Integridad / valores'],
  Rendimiento:['Disciplina','Constancia','Organización','Productividad','Finanzas personales'],
  Físico:['Fuerza','Resistencia','Velocidad / Potencia','Movilidad','Salud física']
};
const allSkills=Object.values(skillMap).flat();
const icons={Intelecto:'🧠',Carisma:'✨',Rendimiento:'⚡',Físico:'💪'};

const academyLessons=[
  {id:'nut-energia',category:'Nutrición',icon:'🥗',title:'Balance energético',minutes:4,skill:'Conocimiento',xp:4,
   summary:'Por qué el peso corporal cambia con el balance entre energía ingerida y gastada.',
   body:[`El cuerpo usa energía todo el tiempo: para mantener funciones básicas, moverse, entrenar y digerir alimentos. En períodos suficientemente largos, el peso tiende a bajar cuando la energía ingerida queda por debajo de la gastada y a subir cuando ocurre lo contrario.`,`Eso no significa que haya que contar cada caloría. También importan la saciedad, la calidad de los alimentos, el sueño, la actividad y la adherencia. Para la mayoría de las personas, un plan sostenible supera a uno extremo que dura pocos días.`],
   question:'Si una persona quiere perder grasa de forma sostenida, ¿qué principio es necesario a lo largo del tiempo?',answers:['Comer cero carbohidratos','Mantener un déficit energético sostenible','Evitar comer después de las 18'],correct:1},
  {id:'nut-macros',category:'Nutrición',icon:'🥗',title:'Proteínas, carbohidratos y grasas',minutes:5,skill:'Conocimiento',xp:4,
   summary:'Qué función general cumplen los tres macronutrientes.',
   body:[`Las proteínas aportan aminoácidos y son especialmente importantes para mantener y construir tejidos. Los carbohidratos son una fuente práctica de energía, especialmente útil alrededor del ejercicio intenso. Las grasas participan, entre otras funciones, en membranas celulares y producción hormonal.`,`No hace falta convertir un macronutriente en “enemigo”. Las cantidades adecuadas dependen de la persona, su objetivo y su actividad.`],
   question:'¿Cuál es una función especialmente asociada a las proteínas?',answers:['Aportar aminoácidos para tejidos','Eliminar la necesidad de dormir','Hidratar más que el agua'],correct:0},
  {id:'nut-proteina',category:'Nutrición',icon:'🥗',title:'Proteína y entrenamiento',minutes:4,skill:'Conocimiento',xp:4,
   summary:'Por qué entrenar y comer proteína trabajan en conjunto.',
   body:[`El entrenamiento de fuerza da una señal para adaptarse. Una ingesta suficiente de proteína aporta materiales para reparar y construir tejido. Ninguna de las dos cosas reemplaza a la otra.`,`Distribuir proteína en varias comidas puede ser una forma cómoda de cubrir la cantidad diaria, pero la cantidad total del día suele ser más importante que perseguir un horario perfecto.`],
   question:'¿Qué combinación tiene más sentido para ganar masa muscular?',answers:['Sólo suplementos','Entrenamiento de fuerza + proteína suficiente + recuperación','Comer proteína sin entrenar'],correct:1},
  {id:'nut-etiquetas',category:'Nutrición',icon:'🥗',title:'Leer una etiqueta',minutes:4,skill:'Aprendizaje',xp:4,
   summary:'Porciones, calorías y nutrientes sin caer en marketing.',
   body:[`Una etiqueta puede mostrar información por porción o por 100 gramos. Antes de comparar dos alimentos, fijate qué unidad está usando cada uno. Una bolsa puede contener varias porciones aunque parezca “una unidad”.`,`Palabras de marketing como “natural”, “fit” o “light” no te dicen por sí solas si un alimento encaja mejor en tus objetivos. Mirá cantidades y contexto.`],
   question:'Dos productos muestran calorías con porciones distintas. ¿Qué conviene hacer para compararlos?',answers:['Elegir el que diga “fit”','Compararlos usando la misma cantidad, por ejemplo 100 g','Elegir el paquete más chico'],correct:1},
  {id:'nut-adherencia',category:'Nutrición',icon:'🥗',title:'La dieta que podés sostener',minutes:4,skill:'Disciplina',xp:4,
   summary:'Adherencia, flexibilidad y por qué lo extremo suele fallar.',
   body:[`Una alimentación útil no se evalúa sólo por cómo se ve en papel, sino por si la persona puede mantenerla. Preferencias, horarios, presupuesto, cultura y vida social importan.`,`Un buen sistema permite volver al plan después de un desvío. Una comida fuera de lo previsto no convierte el día entero en un fracaso.`],
   question:'¿Qué suele mejorar la adherencia a largo plazo?',answers:['Un plan compatible con la vida real','Prohibir para siempre todos los alimentos preferidos','Cambiar de dieta cada tres días'],correct:0},

  {id:'ent-adaptaciones',category:'Entrenamiento',icon:'🏋️',title:'Fuerza, hipertrofia y resistencia',minutes:5,skill:'Conocimiento',xp:4,
   summary:'El tipo de adaptación depende del estímulo y de cómo entrenás.',
   body:[`La fuerza busca aumentar la capacidad de producir fuerza; la hipertrofia busca aumentar el tamaño muscular; la resistencia busca sostener esfuerzos durante más tiempo. Se superponen, pero no son exactamente lo mismo.`,`Un programa puede mezclar objetivos, aunque suele funcionar mejor cuando tiene una prioridad clara y usa las otras capacidades como complemento.`],
   question:'¿Fuerza e hipertrofia son exactamente la misma adaptación?',answers:['Sí, siempre','No; se relacionan pero no son idénticas','Sólo en principiantes son opuestas'],correct:1},
  {id:'ent-sobrecarga',category:'Entrenamiento',icon:'🏋️',title:'Sobrecarga progresiva',minutes:4,skill:'Fuerza',xp:4,
   summary:'Progresar no es solamente agregar discos.',
   body:[`Para seguir adaptándose, el cuerpo necesita un estímulo que evolucione. Eso puede lograrse con más carga, más repeticiones con la misma carga, mejor técnica, mayor rango de movimiento o más trabajo útil.`,`Intentar subir el peso en cada sesión a cualquier costo puede deteriorar la técnica. El progreso se evalúa en tendencias, no en una única sesión.`],
   question:'¿Cuál puede ser una forma válida de progresión?',answers:['Hacer más repeticiones con buena técnica','Cambiar ejercicios todos los días sin registrar nada','Dormir menos para entrenar más'],correct:0},
  {id:'ent-volumen',category:'Entrenamiento',icon:'🏋️',title:'Volumen, intensidad y frecuencia',minutes:5,skill:'Aprendizaje',xp:4,
   summary:'Tres variables que cambian cómo se siente y qué produce una rutina.',
   body:[`Volumen describe cuánto trabajo se realiza; intensidad puede referirse a cuán pesada es una carga o cuán cerca entrenás del esfuerzo máximo; frecuencia es cuántas veces entrenás algo en un período.`,`No existe una combinación universal. Si aumentás mucho una variable, a menudo necesitás ajustar las otras para recuperar bien.`],
   question:'Si aumentás mucho el volumen de entrenamiento, ¿qué puede ser necesario revisar?',answers:['La recuperación y las otras variables','Tu color de ropa','Eliminar todos los días de descanso'],correct:0},
  {id:'ent-recuperacion',category:'Entrenamiento',icon:'🏋️',title:'Recuperación y sueño',minutes:4,skill:'Salud física',xp:4,
   summary:'La adaptación ocurre entre sesiones, no sólo durante el entrenamiento.',
   body:[`Entrenar es un estímulo. Para adaptarte necesitás recuperación: sueño suficiente, alimentación, manejo razonable de la fatiga y tiempo. Entrenar más no siempre significa progresar más.`,`Una sesión peor después de dormir poco no implica pérdida de progreso. Mirá tendencias de varias semanas.`],
   question:'¿Cuál describe mejor la recuperación?',answers:['Es parte del proceso de adaptación','Es tiempo perdido','Sólo importa para atletas profesionales'],correct:0},
  {id:'ent-consistencia',category:'Entrenamiento',icon:'🏋️',title:'Consistencia antes que perfección',minutes:4,skill:'Constancia',xp:4,
   summary:'Cómo diseñar una rutina que sobreviva semanas difíciles.',
   body:[`Una rutina excelente que abandonás en diez días suele producir menos que una buena rutina que podés repetir durante meses. La consistencia permite acumular práctica y medir tendencias.`,`Cuando una semana se complica, reducir temporalmente el volumen puede ser mejor que abandonar todo.`],
   question:'Si una semana tenés poco tiempo, ¿qué estrategia suele ser más sostenible?',answers:['Abandonar hasta el mes siguiente','Hacer una versión reducida de la rutina','Duplicar todas las sesiones el domingo'],correct:1},

  {id:'trab-prioridades',category:'Trabajo',icon:'💼',title:'Prioridades, no sólo listas',minutes:4,skill:'Organización',xp:4,
   summary:'Separar lo urgente de lo importante y elegir qué mueve el resultado.',
   body:[`Una lista larga no garantiza productividad. Antes de empezar, identificá qué tareas tienen mayor impacto, qué tiene fecha real y qué puede esperar.`,`Elegir tres prioridades principales para el día puede reducir el cambio constante de contexto y hacer visible lo que realmente importa.`],
   question:'Tenés diez tareas y tiempo limitado. ¿Qué conviene hacer primero?',answers:['Empezar por la más fácil siempre','Identificar impacto, urgencia real y dependencias','Hacerlas en orden alfabético'],correct:1},
  {id:'trab-comunicacion',category:'Trabajo',icon:'💼',title:'Comunicar con claridad',minutes:4,skill:'Comunicación',xp:4,
   summary:'Contexto, pedido concreto y confirmación reducen errores.',
   body:[`Una comunicación clara suele incluir qué está pasando, qué necesitás, para cuándo y cualquier restricción relevante. Cuando el costo de un malentendido es alto, conviene confirmar que ambas personas entendieron lo mismo.`,`Ser breve no significa omitir información crítica. El objetivo es reducir ambigüedad.`],
   question:'Después de explicar una tarea importante, ¿qué mejora la claridad?',answers:['Suponer que se entendió','Confirmar próximos pasos y criterio de resultado','Enviar cinco mensajes diferentes'],correct:1},
  {id:'trab-feedback',category:'Trabajo',icon:'💼',title:'Feedback sin atacar',minutes:5,skill:'Control emocional',xp:4,
   summary:'Separar conducta, impacto y próximo paso.',
   body:[`Cuando hay un problema, describir el hecho observable ayuda más que etiquetar a la persona. “El informe llegó dos días tarde y frenó X” es más útil que “sos irresponsable”.`,`Después del problema, buscá un próximo paso concreto: qué cambia, quién hace qué y cuándo se revisa.`],
   question:'Un compañero comete un error. ¿Cuál es una mejor apertura?',answers:['“Siempre hacés todo mal”','Describir el hecho y su impacto antes de acordar una solución','Ignorarlo y acumular enojo'],correct:1},
  {id:'trab-problemas',category:'Trabajo',icon:'💼',title:'Resolver problemas',minutes:5,skill:'Resolución de problemas',xp:4,
   summary:'Definir el problema antes de enamorarse de una solución.',
   body:[`Una solución rápida puede atacar un síntoma y dejar intacta la causa. Definí qué resultado esperabas, qué ocurrió, dónde está la diferencia y qué evidencia tenés.`,`Después generá alternativas y probá la más razonable con un criterio para saber si funcionó.`],
   question:'Antes de implementar una solución, ¿qué ayuda más?',answers:['Definir con evidencia cuál es el problema','Elegir la primera idea siempre','Buscar a quién culpar'],correct:0},
  {id:'trab-sistemas',category:'Trabajo',icon:'💼',title:'Sistemas y constancia',minutes:4,skill:'Productividad',xp:4,
   summary:'Reducir la dependencia de memoria y motivación.',
   body:[`Un sistema convierte acciones importantes en algo repetible: checklist, calendario, registro o procedimiento. La idea no es burocratizar todo, sino descargar memoria y reducir errores evitables.`,`Si una tarea se repite y suele olvidarse, una señal o checklist simple puede valer más que “ponerle ganas”.`],
   question:'Una tarea semanal se olvida seguido. ¿Qué suele ayudar?',answers:['Crear un sistema o recordatorio repetible','Confiar todavía más en la memoria','Esperar a estar motivado'],correct:0}
];

const freshDefaults={
  version:3,
  assessmentComplete:false,
  player:{name:'Jugador',age:null,height:null,weight:null,context:'trabajo',goal:'general',createdAt:null},
  avatar:'',
  baseSkills:Object.fromEntries(allSkills.map(k=>[k,50])),
  skillConfidence:Object.fromEntries(allSkills.map(k=>[k,'baja'])),
  nutritionKnowledge:0,
  assessmentCompletedAt:null,
  strengthAssessment:50,
  useMeasuredStrength:false,
  strength:[
    {name:'Ejercicio de fuerza 1',current:0,max:100},{name:'Ejercicio de fuerza 2',current:0,max:100},
    {name:'Ejercicio de fuerza 3',current:0,max:100},{name:'Ejercicio de fuerza 4',current:0,max:100},
    {name:'Ejercicio de fuerza 5',current:0,max:100},{name:'Ejercicio de fuerza 6',current:0,max:100}
  ],
  reminderTime:'21:00',reminderText:'Completá tu registro de Vida RPG',
  days:{},bestStreak:0,academyProgress:{}
};

function clone(x){return structuredClone(x)}

function migrate(){
  try{
    const raw3=localStorage.getItem(storeKey);
    if(raw3){
      const s=JSON.parse(raw3);
      return {...clone(freshDefaults),...s,player:{...freshDefaults.player,...(s.player||{})},baseSkills:{...freshDefaults.baseSkills,...(s.baseSkills||{})},skillConfidence:{...freshDefaults.skillConfidence,...(s.skillConfidence||{})},days:s.days||{},academyProgress:s.academyProgress||{}};
    }
    const raw2=localStorage.getItem(v2Key);
    if(raw2){
      const old=JSON.parse(raw2),s=clone(freshDefaults);
      s.player={...s.player,...(old.player||{})};s.avatar=old.avatar||'';s.baseSkills={...s.baseSkills,...(old.baseSkills||{})};
      s.strengthAssessment=old.strengthAssessment??s.strengthAssessment;s.useMeasuredStrength=!!old.useMeasuredStrength;
      if(Array.isArray(old.strength)&&old.strength.length)s.strength=old.strength;
      s.reminderTime=old.reminderTime||s.reminderTime;s.reminderText=old.reminderText||s.reminderText;s.days=old.days||{};s.bestStreak=old.bestStreak||0;
      // Conserva todo, pero pide la nueva evaluación inteligente una vez.
      s.assessmentComplete=false;
      return s;
    }
    const raw1=localStorage.getItem(v1Key);
    if(raw1){
      const old=JSON.parse(raw1),s=clone(freshDefaults);
      s.player.name=old.playerName||'Jugador';s.avatar=old.avatar||'';s.days=old.days||{};s.bestStreak=old.bestStreak||0;
      if(Array.isArray(old.strength)&&old.strength.length){s.strength=old.strength;s.useMeasuredStrength=true}
      return s;
    }
  }catch(e){console.warn('Migración',e)}
  return clone(freshDefaults);
}

let state=migrate();
function save(){localStorage.setItem(storeKey,JSON.stringify(state));render()}

function contextWord(){
  if(state.player.context==='estudio')return 'compañero de estudio';
  if(state.player.context==='independiente')return 'persona con la que trabajás';
  if(state.player.context==='busqueda')return 'persona de un equipo';
  return 'compañero de trabajo';
}

const assessmentQuestions=[
 {cat:'Intelecto',title:'Cálculo práctico',text:'Un producto cuesta $24.000 y tiene 25% de descuento. ¿Cuál es el precio final?',skill:'Inteligencia aplicada',objective:true,options:[['$18.000',78],['$19.000',42],['$20.000',42],['$16.000',35]]},
 {cat:'Intelecto',title:'Patrones',text:'¿Qué número sigue? 3, 6, 12, 24, ...',skill:'Inteligencia aplicada',objective:true,options:[['48',78],['36',42],['30',38],['27',35]]},
 {cat:'Intelecto',title:'Conocimiento práctico',text:'Necesitás aprender una herramienta nueva para mañana. ¿Qué estrategia suele darte mejor señal de que realmente aprendiste?',skill:'Aprendizaje',options:[['Mirar muchos videos sin practicar',38],['Hacer una práctica corta, detectar errores y repetir',78],['Leer una definición una vez',45],['Esperar a sentirte seguro antes de probar',35]]},
 {cat:'Intelecto',title:'Resolver problemas',text:'Una tarea que siempre funcionaba empieza a fallar. ¿Qué hacés primero?',skill:'Resolución de problemas',options:[['Cambio varias cosas a la vez',38],['Defino qué cambió, reúno evidencia y pruebo una hipótesis',80],['Culpo a la última persona que la tocó',30],['Repito exactamente lo mismo muchas veces',42]]},
 {cat:'Intelecto',title:'Creatividad aplicada',text:'Tenés una limitación fuerte de presupuesto. ¿Cómo buscás una solución?',skill:'Creatividad',options:[['Descarto el objetivo',35],['Genero varias alternativas con restricciones y comparo trade-offs',78],['Copio la primera solución que encuentre',48],['Espero que aparezca una idea perfecta',38]]},
 {cat:'Intelecto',title:'Comprensión',text:'Si una explicación te parece clara pero el resultado práctico sale mal, ¿qué hacés?',skill:'Conocimiento',options:[['Asumo que igual lo sé',42],['Reviso qué parte no puedo aplicar y vuelvo a probar',76],['Evito volver al tema',34],['Memorizo más frases',46]]},

 {cat:'Carisma',title:'Error de otra persona',dynamic:true,text:()=>`Un ${contextWord()} comete un error que te complica. ¿Qué hacés?`,skill:'Comunicación',options:[['Lo confronto enojado delante de otros',28],['Describo el problema en privado, escucho su versión y acordamos el próximo paso',80],['No digo nada y acumulo bronca',36],['Se lo cuento a otras personas antes de hablarle',30]]},
 {cat:'Carisma',title:'Desacuerdo',dynamic:true,text:()=>`No estás de acuerdo con la idea de un ${contextWord()}. ¿Cuál es tu reacción más probable?`,skill:'Habilidades sociales',options:[['Intento entender el razonamiento y explico mi desacuerdo sin atacar',78],['Lo interrumpo para demostrar que está equivocado',32],['Digo que sí aunque no esté de acuerdo',42],['Evito trabajar con esa persona',35]]},
 {cat:'Carisma',title:'Coordinación',text:'En un trabajo grupal nadie está ordenando qué hace cada uno. ¿Qué hacés?',skill:'Liderazgo',options:[['Propongo un objetivo, reparto próximos pasos de común acuerdo y hago seguimiento',76],['Espero que otra persona lo resuelva',42],['Hago todo yo para ir más rápido',52],['Ordeno a todos sin preguntar nada',45]]},
 {cat:'Carisma',title:'Recibir feedback',text:'Te señalan un error que te molesta escuchar. ¿Qué respuesta es más útil?',skill:'Control emocional',options:[['Me defiendo antes de escuchar el ejemplo',35],['Escucho, pido un ejemplo concreto y decido qué puedo corregir',78],['Dejo de hablar con esa persona',30],['Acepto todo aunque no tenga sentido',48]]},
 {cat:'Carisma',title:'Integridad',text:'Detectás un error tuyo que nadie más notó y que te favorece. ¿Qué hacés?',skill:'Integridad / valores',options:[['Lo informo y corrijo aunque me incomode',82],['Espero a ver si alguien lo descubre',35],['Lo oculto porque nadie perdió nada todavía',28],['Culpo al proceso',32]]},
 {cat:'Carisma',title:'Confirmar entendimiento',text:'Dás una indicación importante. ¿Cómo reducís el riesgo de malentendido?',skill:'Comunicación',options:[['La repito más fuerte',38],['Confirmo resultado esperado, plazo y próximos pasos',80],['Mando más mensajes sin estructura',45],['Asumo que quedó claro',42]]},

 {cat:'Rendimiento',title:'Planificación real',text:'En los últimos 30 días, ¿con qué frecuencia empezaste el día sabiendo cuáles eran tus 2–3 prioridades?',skill:'Organización',habit:true,options:[['Casi nunca',32],['1–2 días por semana',48],['3–4 días por semana',62],['5 o más días por semana',76]]},
 {cat:'Rendimiento',title:'Cumplimiento',text:'Cuando te proponés una rutina de varias semanas, ¿qué suele pasar?',skill:'Constancia',habit:true,options:[['La abandono en pocos días',32],['La sostengo intermitentemente',50],['La sostengo la mayoría de las semanas aunque tenga fallas',70],['La sostengo y registro durante meses',80]]},
 {cat:'Rendimiento',title:'Hacer lo incómodo',text:'Tenés una tarea importante que no te gusta y vence mañana. ¿Qué hacés normalmente?',skill:'Disciplina',habit:true,options:[['La pospongo hasta que sea una urgencia',38],['La divido y empiezo aunque no tenga ganas',78],['La reemplazo por tareas fáciles',42],['Espero motivación',35]]},
 {cat:'Rendimiento',title:'Productividad',text:'Terminaste una hora muy ocupada. ¿Qué indica mejor que fuiste productivo?',skill:'Productividad',options:[['Respondí la mayor cantidad de mensajes',45],['Avancé un resultado importante, aunque hice menos cosas',78],['Estuve ocupado todo el tiempo',48],['No tuve ningún minuto libre',42]]},
 {cat:'Rendimiento',title:'Finanzas personales',text:'¿Cuál se parece más a tu manejo real del dinero?',skill:'Finanzas personales',habit:true,options:[['No sé bien cuánto gasto ni cuánto tengo disponible',30],['Miro el saldo pero casi no registro ni planifico',45],['Registro gastos/ingresos y tengo cierta planificación',68],['Registro, presupuesto, fondo de emergencia e inversión coherente con objetivos',80]]},
 {cat:'Rendimiento',title:'Sistema contra olvidos',text:'Una tarea se repite cada semana y se te olvida. ¿Qué solución elegís?',skill:'Organización',options:[['Confiar más en mi memoria',40],['Crear un recordatorio/checklist recurrente',78],['Hacerla sólo cuando alguien me reclama',34],['Cambiar de tarea',30]]},
 {cat:'Rendimiento',title:'Interrupciones',text:'Tenés 45 minutos para una tarea importante y llegan mensajes no urgentes. ¿Qué hacés?',skill:'Productividad',options:[['Respondo cada mensaje apenas entra',38],['Protejo un bloque de foco y reviso mensajes después',76],['Abro varias tareas a la vez',40],['Dejo la tarea importante',32]]},

 {cat:'Físico',title:'Fuerza provisional',text:'¿Cuál describe mejor tu experiencia reciente con entrenamiento de fuerza?',skill:'Fuerza',lowConfidence:true,options:[['No entreno fuerza',35],['Entreno ocasionalmente, sin registrar progresión',48],['Entreno regularmente y registro cargas/repeticiones',62],['Entreno hace años con progresión y métricas consistentes',70]]},
 {cat:'Físico',title:'Resistencia',text:'¿Qué esfuerzo continuo podrías completar hoy sin que sea algo excepcional?',skill:'Resistencia',lowConfidence:true,options:[['Caminar 20–30 min',40],['Trote suave o actividad moderada 20–30 min',55],['Correr/actividad intensa 30–45 min',68],['Actividad intensa de resistencia 60 min o más',76]]},
 {cat:'Físico',title:'Potencia',text:'¿Hacés actualmente alguna actividad que requiera aceleraciones, saltos, golpes rápidos o sprints?',skill:'Velocidad / Potencia',lowConfidence:true,options:[['Nunca',38],['Muy ocasionalmente',48],['1–2 veces por semana',60],['3 o más veces por semana y con intención de progresar',68]]},
 {cat:'Físico',title:'Movilidad',text:'Sin dolor y con control, ¿podés hacer una sentadilla profunda manteniendo los talones apoyados?',skill:'Movilidad',lowConfidence:true,options:[['No',38],['Sólo con mucha dificultad',48],['Sí, razonablemente',65],['Sí, cómoda y controlada',72]]},
 {cat:'Físico',title:'Sueño',text:'En una semana normal, ¿cuánto dormís en promedio por noche?',skill:'Salud física',habit:true,options:[['Menos de 5 h',30],['5–6 h',45],['6–7 h',62],['7–9 h',78],['Más de 9 h casi siempre',62]]},
 {cat:'Físico',title:'Actividad semanal',text:'¿Cuántos días por semana hacés actividad física intencional?',skill:'Salud física',habit:true,options:[['0',32],['1–2',50],['3–4',68],['5 o más',75]]},

 {cat:'Nutrición',title:'Proteína',text:'¿Cuál suele aportar más proteína por 100 g?',nutrition:true,skill:'Conocimiento',objective:true,options:[['Pechuga de pollo cocida',80],['Arroz cocido',40],['Manzana',32],['Aceite de oliva',28]]},
 {cat:'Nutrición',title:'Pérdida de grasa',text:'Para perder grasa corporal a lo largo del tiempo, ¿qué condición es necesaria?',nutrition:true,skill:'Conocimiento',objective:true,options:[['Déficit energético sostenible',80],['Eliminar todos los carbohidratos',38],['No comer después de las 18',35],['Tomar suplementos quemadores',28]]},
 {cat:'Nutrición',title:'Proteína corporal',text:'¿Para qué es especialmente importante la proteína?',nutrition:true,skill:'Conocimiento',objective:true,options:[['Aportar aminoácidos para tejidos',80],['Reemplazar el sueño',25],['Hidratar el cuerpo mejor que el agua',28],['Evitar toda fatiga',25]],correctOnly:true},
 {cat:'Nutrición',title:'Etiqueta',text:'Un paquete tiene 2 porciones. La etiqueta dice 180 kcal por porción. Si comés todo el paquete, ¿cuántas kcal indica la etiqueta?',nutrition:true,skill:'Inteligencia aplicada',objective:true,options:[['180',35],['360',80],['90',30],['280',35]]},
 {cat:'Nutrición',title:'Plan sostenible',text:'¿Cuál tiene más probabilidades de sostenerse a largo plazo?',nutrition:true,skill:'Disciplina',options:[['Un plan compatible con gustos, horarios y objetivo',78],['Una dieta extrema con muchos alimentos prohibidos',35],['Cambiar de método cada pocos días',30],['Saltarse comidas para compensar siempre',32]]},
 {cat:'Intelecto',title:'Aplicación',text:'Leés una idea útil. ¿Qué acción genera mejor evidencia de aprendizaje?',skill:'Aprendizaje',options:[['Subrayarla',48],['Explicarla con tus palabras y aplicarla a un caso',80],['Guardarla para después',38],['Compartirla sin revisarla',42]]}
];

let assessmentSession={index:0,answers:[],scores:{},evidence:{},nutritionCorrect:0,nutritionTotal:0};

function questionText(q){return typeof q.text==='function'?q.text():q.text}

function seedTasks(){
  const c=state.player.context;
  const social=c==='estudio'?'Aclarar o coordinar algo con un compañero de estudio':'Aclarar o coordinar algo con un compañero';
  return[
    {id:crypto.randomUUID(),text:'Definir 3 prioridades del día',category:'Rendimiento',skill:'Organización',xp:2,done:false,custom:false},
    {id:crypto.randomUUID(),text:'Registrar o revisar un movimiento financiero',category:'Rendimiento',skill:'Finanzas personales',xp:2,done:false,custom:false},
    {id:crypto.randomUUID(),text:'Cumplir la actividad física planificada',category:'Físico',skill:'Salud física',xp:3,done:false,custom:false},
    {id:crypto.randomUUID(),text:'Resolver o avanzar un problema importante',category:'Intelecto',skill:'Resolución de problemas',xp:4,done:false,custom:false},
    {id:crypto.randomUUID(),text:social,category:'Carisma',skill:'Comunicación',xp:3,done:false,custom:false}
  ];
}
function inferSkill(t){
  if(t.skill&&allSkills.includes(t.skill))return t.skill;
  if(t.category==='Intelecto')return 'Conocimiento';
  if(t.category==='Carisma')return 'Comunicación';
  if(t.category==='Físico')return 'Salud física';
  return 'Disciplina';
}
function getDay(){
  const k=todayKey();
  if(!state.days[k])state.days[k]={tasks:seedTasks(),checkin:{},events:[]};
  const d=state.days[k];d.tasks=(d.tasks||[]).map(t=>({...t,skill:inferSkill(t)}));d.checkin=d.checkin||{};d.events=d.events||[];return d;
}
function allDoneTasks(){
  const out=[];Object.entries(state.days).forEach(([date,d])=>(d.tasks||[]).forEach(t=>{if(t.done)out.push({...t,date,skill:inferSkill(t)})}));return out;
}
function allEvents(){
  const out=[];Object.entries(state.days).forEach(([date,d])=>(d.events||[]).forEach(e=>out.push({...e,date})));return out;
}
function xpBySkill(){
  const totals=Object.fromEntries(allSkills.map(k=>[k,0]));
  allDoneTasks().forEach(t=>{if(totals[t.skill]!==undefined)totals[t.skill]+=Number(t.xp)||0});
  allEvents().forEach(e=>{if(e.skill&&totals[e.skill]!==undefined)totals[e.skill]+=Number(e.xp)||0});
  return totals;
}
function xpNeeded(score){
  if(score<40)return 8;if(score<60)return 10;if(score<75)return 14;if(score<90)return 20;return 30;
}
function skillProgress(base,xp){
  let score=clamp(Math.round(Number(base)||0)),remaining=Math.max(0,Number(xp)||0),guard=0;
  while(score<100&&remaining>=xpNeeded(score)&&guard++<100){remaining-=xpNeeded(score);score++}
  return{score,currentXp:remaining,needed:score>=100?0:xpNeeded(score)}
}
function measuredStrengthRows(){return(state.strength||[]).filter(x=>Number(x.max)>0&&Number(x.current)>0)}
function rawForceScore(){
  const valid=measuredStrengthRows();if(!valid.length)return 0;
  return Math.round(valid.map(x=>clamp((Number(x.current)||0)/Number(x.max)*100)).reduce((a,b)=>a+b,0)/valid.length)
}
function baseSkillScore(skill){
  if(skill==='Fuerza'&&state.useMeasuredStrength&&measuredStrengthRows().length)return rawForceScore();
  return clamp(Number(state.baseSkills[skill])||50);
}
function effectiveSkillData(){
  const xp=xpBySkill(),out={};allSkills.forEach(skill=>out[skill]={...skillProgress(baseSkillScore(skill),xp[skill]),totalXp:xp[skill],base:baseSkillScore(skill),confidence:state.skillConfidence[skill]||'baja'});return out;
}
function effectiveAttributes(){
  const s=effectiveSkillData(),out={};Object.entries(skillMap).forEach(([a,names])=>out[a]=Math.round(names.reduce((sum,n)=>sum+s[n].score,0)/names.length));return out;
}
function generalLevel(){const a=Object.values(effectiveAttributes());return Math.round(a.reduce((x,y)=>x+y,0)/a.length)}
function dayXp(d){return(d.tasks||[]).filter(t=>t.done).reduce((s,t)=>s+(Number(t.xp)||0),0)+(d.events||[]).reduce((s,e)=>s+(Number(e.xp)||0),0)}

function render(){
  renderProfile();renderAttributes();renderTasks();renderSkills();renderAcademy();renderCheckin();renderStrength();renderHistory();renderAchievements();updateSkillSelect();
  if(!state.assessmentComplete)openAssessment(false);
}
function renderProfile(){
  $('#playerName').value=state.player.name||'Jugador';const gl=generalLevel();$('#generalLevel').textContent=gl;$('#generalBar').style.width=gl+'%';$('#rankPill').textContent=rank(gl);
  $('#todayLabel').textContent=new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  const meta=[];if(state.player.age)meta.push(`${state.player.age} años`);if(state.player.height)meta.push(`${state.player.height} cm`);if(state.player.weight)meta.push(`${state.player.weight} kg`);
  const contexts={trabajo:'Trabajo',estudio:'Estudio',ambos:'Trabajo + estudio',independiente:'Independiente',busqueda:'Búsqueda laboral',otro:'Otro'};if(state.player.context)meta.push(contexts[state.player.context]||state.player.context);
  $('#profileMeta').textContent=meta.join(' · ');
  $('#assessmentMeta').textContent=state.assessmentComplete?`Evaluación inteligente · confianza global ${globalConfidence()} · Nutrición ${state.nutritionKnowledge||0}%`:'Evaluación inicial pendiente';
  if(state.avatar)$('#avatar').src=state.avatar;else $('#avatar').removeAttribute('src');
}
function globalConfidence(){
  const vals=Object.values(state.skillConfidence||{}),score=vals.reduce((s,v)=>s+(v==='alta'?3:v==='media'?2:1),0)/(vals.length||1);
  return score>=2.5?'alta':score>=1.65?'media':'baja';
}
function renderAttributes(){
  const attrs=effectiveAttributes(),xp=xpBySkill(),data=effectiveSkillData();
  $('#attributesGrid').innerHTML=Object.entries(attrs).map(([a,v])=>{
    const total=skillMap[a].reduce((s,n)=>s+xp[n],0);
    const conf=skillMap[a].reduce((s,n)=>s+(data[n].confidence==='alta'?3:data[n].confidence==='media'?2:1),0)/skillMap[a].length;
    const label=conf>=2.5?'alta':conf>=1.65?'media':'baja';
    return `<div class="attribute-card"><div class="small">${icons[a]} ${a}</div><div class="score">${v}</div><div class="progress"><span style="width:${v}%"></span></div><div class="small">${rank(v)} · ${total} XP</div><div class="confidence">confianza ${label}</div></div>`;
  }).join('');
}
function renderTasks(){
  const d=getDay();$('#dailyTasks').innerHTML=d.tasks.map(t=>`<div class="task ${t.done?'done':''}"><input type="checkbox" data-id="${t.id}" ${t.done?'checked':''}><div><div class="task-title">${escapeHtml(t.text)}</div><div class="task-meta">${escapeHtml(t.skill)}</div></div><span class="tag">${t.category}</span><span class="task-xp">+${t.xp} XP</span>${t.custom?`<button class="delete-task" data-del="${t.id}">×</button>`:''}</div>`).join('');
  $('#todayXp').textContent=dayXp(d);
}
function renderSkills(){
  const data=effectiveSkillData();$('#skillsGrid').innerHTML=Object.entries(skillMap).map(([a,names])=>`<section class="skill-group"><h3>${icons[a]} ${a}</h3>${names.map(n=>{const d=data[n],pct=d.needed?clamp(d.currentXp/d.needed*100):100;return`<div class="skill-row"><div class="skill-top"><span>${escapeHtml(n)}</span><strong>${d.score}</strong></div><div class="skill-xp">${d.score>=100?'Nivel máximo':`${d.currentXp}/${d.needed} XP para subir · ${d.totalXp} XP histórico`}</div><div class="progress"><span style="width:${pct}%"></span></div><div class="confidence">estimación ${d.confidence}</div></div>`}).join('')}</section>`).join('');
}
let academyFilter='all';
function renderAcademy(){
  const progress=state.academyProgress||{};$('#academyCompleted').textContent=Object.values(progress).filter(x=>x.completed).length;
  const lessons=academyFilter==='all'?academyLessons:academyLessons.filter(l=>l.category===academyFilter);
  $('#academyGrid').innerHTML=lessons.map(l=>{const done=progress[l.id]?.completed;return`<article class="lesson-card ${done?'completed':''}" data-lesson="${l.id}"><div class="lesson-icon">${l.icon}</div><div class="eyebrow">${l.category}</div><h3>${escapeHtml(l.title)}</h3><p>${escapeHtml(l.summary)}</p><footer><span>${l.minutes} min · +${l.xp} XP ${escapeHtml(l.skill)}</span><strong>${done?'✓ completada':'Abrir →'}</strong></footer></article>`}).join('');
}
function renderCheckin(){const d=getDay();$('#sleepHours').value=d.checkin.sleepHours??'';$('#energy').value=d.checkin.energy??'';$('#mood').value=d.checkin.mood??'';$('#dayNote').value=d.checkin.note??'';$('#reminderTime').value=state.reminderTime||'21:00';$('#reminderText').value=state.reminderText||freshDefaults.reminderText}
function renderStrength(){
  const scores=(state.strength||[]).map(x=>Number(x.max)>0?clamp((Number(x.current)||0)/Number(x.max)*100):0);$('#forceScore').textContent=baseSkillScore('Fuerza');
  $('#strengthModeNote').textContent=state.useMeasuredStrength&&measuredStrengthRows().length?'La Fuerza usa los ejercicios con peso actual cargado. Las métricas reales reemplazan la estimación del cuestionario.':'La Fuerza todavía es una estimación de confianza baja. Al cargar pesos reales, la app empieza a usar esas métricas.';
  $('#strengthTable').innerHTML=(state.strength||[]).map((x,i)=>`<tr><td><input class="exercise-name" data-strength-name="${i}" value="${escapeHtml(x.name)}"></td><td><input type="number" min="0" step="2.5" data-strength="${i}" value="${x.current}"> kg</td><td><input type="number" min="1" step="2.5" data-strength-max="${i}" value="${x.max}"> kg</td><td>${Math.round(scores[i])}</td></tr>`).join('');
}
function completedDayKeys(){return Object.keys(state.days).filter(k=>(state.days[k].tasks||[]).some(t=>t.done)||(state.days[k].events||[]).length).sort()}
function streaks(){
  const keys=completedDayKeys();if(!keys.length)return{current:0,best:state.bestStreak||0};let best=0,run=0,prev=null;
  keys.forEach(k=>{const d=new Date(k+'T12:00:00');if(prev&&(d-prev)/86400000===1)run++;else run=1;best=Math.max(best,run);prev=d});
  const set=new Set(keys);let cur=0,d=new Date();for(;;){const k=d.toISOString().slice(0,10);if(set.has(k)){cur++;d.setDate(d.getDate()-1)}else break}
  state.bestStreak=Math.max(state.bestStreak||0,best);return{current:cur,best:state.bestStreak}
}
function datesWithin(days){const cutoff=new Date();cutoff.setHours(0,0,0,0);cutoff.setDate(cutoff.getDate()-(days-1));return Object.entries(state.days).filter(([k])=>new Date(k+'T12:00:00')>=cutoff)}
function summaryFor(days){const e=datesWithin(days);return{xp:e.reduce((s,[,d])=>s+dayXp(d),0),actions:e.reduce((s,[,d])=>s+(d.tasks||[]).filter(t=>t.done).length+(d.events||[]).length,0)}}
function formatDate(k){return new Intl.DateTimeFormat('es-AR',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date(k+'T12:00:00'))}
function renderHistory(){
  const w=summaryFor(7),m=summaryFor(30),st=streaks();$('#weekXp').textContent=`${w.xp} XP`;$('#weekTasks').textContent=`${w.actions} acciones`;$('#monthXp').textContent=`${m.xp} XP`;$('#monthTasks').textContent=`${m.actions} acciones`;$('#streak').textContent=`${st.current} días`;$('#bestStreak').textContent=`${st.best} días`;
  $('#actionsCompleted').textContent=`${allDoneTasks().length+allEvents().length} acciones totales`;
  const entries=Object.entries(state.days).sort(([a],[b])=>b.localeCompare(a));
  $('#historyList').innerHTML=entries.length?entries.map(([date,d])=>{
    const done=(d.tasks||[]).filter(t=>t.done),events=d.events||[],c=d.checkin||{},items=[
      ...done.map(t=>`<div class="history-task"><span>✓ ${escapeHtml(t.text)} <small>· ${escapeHtml(t.skill)}</small></span><strong>+${t.xp}</strong></div>`),
      ...events.map(e=>`<div class="history-task academy-event"><span>📚 ${escapeHtml(e.text)} <small>· ${escapeHtml(e.skill||'Aprendizaje')}</small></span><strong>+${e.xp||0}</strong></div>`)
    ];
    const check=[c.sleepHours?`Sueño ${c.sleepHours}h`:null,c.energy?`Energía ${c.energy}/10`:null,c.mood?`Ánimo ${c.mood}/10`:null].filter(Boolean).join(' · ');
    return`<article class="history-day"><div class="history-head"><div><strong>${formatDate(date)}</strong><small>${done.length+events.length} acciones</small></div><span class="xp-badge">${dayXp(d)} XP</span></div><div class="history-body">${items.length?`<div class="history-tasks">${items.join('')}</div>`:'<div class="history-empty">Sin acciones completadas.</div>'}${(check||c.note)?`<div class="history-checkin">${check}${c.note?`${check?' · ':''}${escapeHtml(c.note)}`:''}</div>`:''}</div></article>`;
  }).join(''):'<div class="history-empty">Todavía no hay historial.</div>';
}
function renderAchievements(){
  const actions=allDoneTasks().length+allEvents().length,st=streaks(),gl=generalLevel(),xp=Object.values(xpBySkill()).reduce((a,b)=>a+b,0),lessons=Object.values(state.academyProgress||{}).filter(x=>x.completed).length;
  const a=[['Primer paso','Completar 1 acción',actions>=1],['En marcha','Completar 10 acciones',actions>=10],['Racha x7','Actividad 7 días seguidos',st.best>=7],['100 XP','Acumular 100 XP',xp>=100],['Estudiante','Completar 5 lecciones',lessons>=5],['Academia completa','Completar las 15 lecciones',lessons>=15],['Nivel 70','Llegar a nivel general 70',gl>=70]];
  $('#achievements').innerHTML=a.map(x=>`<div class="achievement ${x[2]?'':'locked'}"><strong>${x[2]?'🏆':'🔒'} ${x[0]}</strong><span class="muted">${x[1]}</span></div>`).join('');
}
function updateSkillSelect(){const a=$('#newTaskCategory').value,current=$('#newTaskSkill').value;$('#newTaskSkill').innerHTML=skillMap[a].map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');if(skillMap[a].includes(current))$('#newTaskSkill').value=current}

function openAssessment(canCancel=true){
  $('#assessmentOverlay').classList.remove('hidden');$('#cancelAssessmentBtn').classList.toggle('hidden',!canCancel);$('#assessmentProfileStep').classList.remove('hidden');$('#assessmentQuestionStep').classList.add('hidden');$('#assessmentResultStep').classList.add('hidden');
  $('#asName').value=state.player.name==='Jugador'?'':state.player.name||'';$('#asAge').value=state.player.age??'';$('#asHeight').value=state.player.height??'';$('#asWeight').value=state.player.weight??'';$('#asContext').value=state.player.context||'trabajo';$('#asGoal').value=state.player.goal||'general';
}
function closeAssessment(){$('#assessmentOverlay').classList.add('hidden')}
function beginAssessment(){
  state.player={...state.player,name:$('#asName').value.trim()||'Jugador',age:+$('#asAge').value||null,height:+$('#asHeight').value||null,weight:+$('#asWeight').value||null,context:$('#asContext').value,goal:$('#asGoal').value,createdAt:state.player.createdAt||new Date().toISOString()};
  assessmentSession={index:0,answers:[],scores:{},evidence:{},nutritionCorrect:0,nutritionTotal:0};$('#assessmentProfileStep').classList.add('hidden');$('#assessmentQuestionStep').classList.remove('hidden');renderAssessmentQuestion();
}
function renderAssessmentQuestion(){
  const i=assessmentSession.index,q=assessmentQuestions[i];$('#assessmentCategory').textContent=q.cat.toUpperCase();$('#assessmentQuestionTitle').textContent=q.title;$('#assessmentQuestionText').textContent=questionText(q);$('#assessmentIndex').textContent=i+1;$('#assessmentTotal').textContent=assessmentQuestions.length;$('#assessmentProgress').style.width=`${(i/assessmentQuestions.length)*100}%`;
  $('#assessmentBackBtn').disabled=i===0;
  $('#assessmentOptions').innerHTML=q.options.map((o,idx)=>`<button class="answer-btn" data-answer="${idx}">${escapeHtml(o[0])}</button>`).join('');
}
function recordAssessmentAnswer(idx){
  const q=assessmentQuestions[assessmentSession.index],score=Number(q.options[idx][1]??45);assessmentSession.answers[assessmentSession.index]=idx;
  if(!assessmentSession.scores[q.skill])assessmentSession.scores[q.skill]=[];assessmentSession.scores[q.skill].push({score,weight:q.objective?1.4:q.habit?1.15:1,low:!!q.lowConfidence});
  assessmentSession.evidence[q.skill]=(assessmentSession.evidence[q.skill]||0)+(q.objective?1.4:1);
  if(q.nutrition){assessmentSession.nutritionTotal++;if(score>=75)assessmentSession.nutritionCorrect++}
  assessmentSession.index++;
  if(assessmentSession.index>=assessmentQuestions.length)finishAssessmentScoring();else renderAssessmentQuestion();
}
function rebuildAssessmentUntil(index){
  const answers=[...assessmentSession.answers];assessmentSession={index:0,answers:[],scores:{},evidence:{},nutritionCorrect:0,nutritionTotal:0};
  for(let i=0;i<index;i++){assessmentSession.index=i;recordAssessmentAnswerNoAdvance(answers[i])}
  assessmentSession.index=index;assessmentSession.answers=answers.slice(0,index);
}
function recordAssessmentAnswerNoAdvance(idx){
  const q=assessmentQuestions[assessmentSession.index],score=Number(q.options[idx][1]??45);
  if(!assessmentSession.scores[q.skill])assessmentSession.scores[q.skill]=[];assessmentSession.scores[q.skill].push({score,weight:q.objective?1.4:q.habit?1.15:1,low:!!q.lowConfidence});
  assessmentSession.evidence[q.skill]=(assessmentSession.evidence[q.skill]||0)+(q.objective?1.4:1);
  if(q.nutrition){assessmentSession.nutritionTotal++;if(score>=75)assessmentSession.nutritionCorrect++}
}
function conservativeSkillScore(skill){
  const arr=assessmentSession.scores[skill]||[];if(!arr.length)return 48;
  const total=arr.reduce((s,x)=>s+x.score*x.weight,0),w=arr.reduce((s,x)=>s+x.weight,0);let avg=total/w;
  // Conservador: el cuestionario por sí solo no entrega niveles de élite.
  avg=Math.min(85,avg);
  return Math.round(avg);
}
function confidenceFor(skill){
  const e=assessmentSession.evidence[skill]||0;if(skill==='Fuerza'||skill==='Resistencia'||skill==='Velocidad / Potencia'||skill==='Movilidad')return'evaluación baja';
  return e>=2.6?'alta':e>=1.7?'media':'baja';
}
function finishAssessmentScoring(){
  // Habilidades no observadas directamente usan el promedio de su atributo con baja confianza.
  const direct={};allSkills.forEach(s=>direct[s]=conservativeSkillScore(s));
  Object.entries(skillMap).forEach(([attr,names])=>{
    const observed=names.filter(n=>(assessmentSession.scores[n]||[]).length);const fallback=observed.length?Math.round(observed.reduce((sum,n)=>sum+direct[n],0)/observed.length):48;
    names.forEach(n=>{if(!(assessmentSession.scores[n]||[]).length)direct[n]=fallback});
  });
  state.baseSkills={...state.baseSkills,...direct};
  state.skillConfidence={...state.skillConfidence};allSkills.forEach(s=>state.skillConfidence[s]=confidenceFor(s).replace('evaluación ',''));
  state.strengthAssessment=state.baseSkills['Fuerza'];state.useMeasuredStrength=state.useMeasuredStrength&&measuredStrengthRows().length>0;
  state.nutritionKnowledge=assessmentSession.nutritionTotal?Math.round(assessmentSession.nutritionCorrect/assessmentSession.nutritionTotal*100):0;
  state.assessmentComplete=true;state.assessmentCompletedAt=new Date().toISOString();
  localStorage.setItem(storeKey,JSON.stringify(state));
  $('#assessmentQuestionStep').classList.add('hidden');$('#assessmentResultStep').classList.remove('hidden');
  const attrs=effectiveAttributes(),gl=generalLevel();$('#resultGeneral').textContent=gl;$('#resultRank').textContent=rank(gl);$('#resultNutrition').textContent=`${state.nutritionKnowledge}%`;$('#resultConfidence').textContent=`Confianza inicial: ${globalConfidence()}`;
  $('#resultAttributes').innerHTML=Object.entries(attrs).map(([a,v])=>`<div class="attribute-card"><div class="small">${icons[a]} ${a}</div><div class="score">${v}</div><div class="progress"><span style="width:${v}%"></span></div></div>`).join('');
}

let currentLesson=null;
function openLesson(id){
  const l=academyLessons.find(x=>x.id===id);if(!l)return;currentLesson=l;$('#lessonOverlay').classList.remove('hidden');$('#lessonCategory').textContent=l.category;$('#lessonTitle').textContent=l.title;$('#lessonBody').innerHTML=l.body.map(p=>`<p>${escapeHtml(p)}</p>`).join('');$('#lessonQuestion').textContent=l.question;$('#lessonFeedback').className='quiz-feedback';$('#lessonFeedback').textContent='';
  $('#lessonAnswers').innerHTML=l.answers.map((a,i)=>`<button class="answer-btn" data-lesson-answer="${i}">${escapeHtml(a)}</button>`).join('');
}
function closeLesson(){$('#lessonOverlay').classList.add('hidden');currentLesson=null}
function answerLesson(idx){
  if(!currentLesson)return;const ok=idx===currentLesson.correct,fb=$('#lessonFeedback');
  if(!ok){fb.className='quiz-feedback bad';fb.textContent='Todavía no. Revisá el texto y probá otra respuesta.';return}
  fb.className='quiz-feedback good';
  const already=state.academyProgress[currentLesson.id]?.completed;
  if(!already){
    state.academyProgress[currentLesson.id]={completed:true,completedAt:new Date().toISOString(),xp:currentLesson.xp};
    const d=getDay();d.events.push({id:`academy:${currentLesson.id}`,type:'academy',text:`Lección: ${currentLesson.title}`,skill:currentLesson.skill,xp:currentLesson.xp});
    localStorage.setItem(storeKey,JSON.stringify(state));fb.textContent=`Correcto. Lección completada: +${currentLesson.xp} XP en ${currentLesson.skill}.`;render();
  }else fb.textContent='Correcto. Esta lección ya estaba completada, así que no vuelve a sumar XP.';
}

$('#startAssessmentBtn').addEventListener('click',beginAssessment);
$('#cancelAssessmentBtn').addEventListener('click',closeAssessment);
$('#reassessBtn').addEventListener('click',()=>openAssessment(true));
$('#finishAssessmentBtn').addEventListener('click',()=>{closeAssessment();render()});
$('#assessmentOptions').addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(b)recordAssessmentAnswer(+b.dataset.answer)});
$('#assessmentBackBtn').addEventListener('click',()=>{if(assessmentSession.index<=0)return;const target=assessmentSession.index-1;rebuildAssessmentUntil(target);renderAssessmentQuestion()});

$('#newTaskCategory').addEventListener('change',updateSkillSelect);
$('#playerName').addEventListener('change',e=>{state.player.name=e.target.value.trim()||'Jugador';save()});
$('#avatarInput').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{state.avatar=r.result;save()};r.readAsDataURL(f)});
$('#dailyTasks').addEventListener('change',e=>{if(e.target.matches('input[type=checkbox]')){const t=getDay().tasks.find(x=>x.id===e.target.dataset.id);if(t){t.done=e.target.checked;save()}}});
$('#dailyTasks').addEventListener('click',e=>{const id=e.target.dataset.del;if(id){getDay().tasks=getDay().tasks.filter(t=>t.id!==id);save()}});
$('#addTaskForm').addEventListener('submit',e=>{e.preventDefault();const text=$('#newTaskText').value.trim();if(!text)return;getDay().tasks.push({id:crypto.randomUUID(),text,category:$('#newTaskCategory').value,skill:$('#newTaskSkill').value,xp:+$('#newTaskXp').value||1,done:false,custom:true});$('#newTaskText').value='';save()});
$('#saveCheckin').addEventListener('click',()=>{const d=getDay();d.checkin={sleepHours:+$('#sleepHours').value||null,energy:+$('#energy').value||null,mood:+$('#mood').value||null,note:$('#dayNote').value.trim()};save();alert('Check-in guardado')});
$('#strengthTable').addEventListener('change',e=>{
  if(e.target.dataset.strength!==undefined){state.strength[+e.target.dataset.strength].current=+e.target.value||0;state.useMeasuredStrength=true;state.skillConfidence['Fuerza']='media';save()}
  if(e.target.dataset.strengthMax!==undefined){state.strength[+e.target.dataset.strengthMax].max=Math.max(1,+e.target.value||1);state.useMeasuredStrength=true;state.skillConfidence['Fuerza']='media';save()}
  if(e.target.dataset.strengthName!==undefined){state.strength[+e.target.dataset.strengthName].name=e.target.value.trim()||`Ejercicio ${+e.target.dataset.strengthName+1}`;save()}
});
document.querySelectorAll('.academy-tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.academy-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');academyFilter=b.dataset.academyFilter;renderAcademy()}));
$('#academyGrid').addEventListener('click',e=>{const card=e.target.closest('[data-lesson]');if(card)openLesson(card.dataset.lesson)});
$('#closeLessonBtn').addEventListener('click',closeLesson);
$('#lessonAnswers').addEventListener('click',e=>{const b=e.target.closest('[data-lesson-answer]');if(b)answerLesson(+b.dataset.lessonAnswer)});
$('#lessonOverlay').addEventListener('click',e=>{if(e.target===$('#lessonOverlay'))closeLesson()});

let deferredPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});
$('#installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden')});
async function enableNotifications(){
  if(!('Notification'in window)){alert('Este navegador no soporta notificaciones.');return}const p=await Notification.requestPermission();if(p!=='granted'){alert('No se habilitaron las notificaciones.');return}
  state.reminderTime=$('#reminderTime').value;state.reminderText=$('#reminderText').value.trim()||freshDefaults.reminderText;save();scheduleReminder();alert('Recordatorio activado para esta sesión.');
}
$('#enableNotifications').addEventListener('click',enableNotifications);
function scheduleReminder(){
  clearTimeout(window.__rpgReminder);if(Notification.permission!=='granted')return;const[h,m]=(state.reminderTime||'21:00').split(':').map(Number),now=new Date(),target=new Date();target.setHours(h,m,0,0);if(target<=now)target.setDate(target.getDate()+1);
  window.__rpgReminder=setTimeout(async()=>{if('serviceWorker'in navigator){const reg=await navigator.serviceWorker.ready;reg.showNotification('Vida RPG',{body:state.reminderText,icon:'icon-192.svg',badge:'icon-192.svg'})}else new Notification('Vida RPG',{body:state.reminderText});scheduleReminder()},target-now);
}
if('serviceWorker'in navigator){navigator.serviceWorker.register('sw.js').then(()=>{if(Notification.permission==='granted')scheduleReminder()})}
render();
