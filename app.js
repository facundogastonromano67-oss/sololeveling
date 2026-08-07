const $=(s)=>document.querySelector(s);
const storeKey='vidaRpgStateV4';
const v3Key='vidaRpgStateV3';
const v2Key='vidaRpgStateV2';
const v1Key='vidaRpgStateV1';
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
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
  version:4,
  assessmentEngineVersion:0,
  assessmentComplete:false,
  assessmentReport:null,
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
function mergeSaved(s){return {...clone(freshDefaults),...s,player:{...freshDefaults.player,...(s.player||{})},baseSkills:{...freshDefaults.baseSkills,...(s.baseSkills||{})},skillConfidence:{...freshDefaults.skillConfidence,...(s.skillConfidence||{})},days:s.days||{},academyProgress:s.academyProgress||{}}}

function migrate(){
  try{
    const raw4=localStorage.getItem(storeKey);
    if(raw4)return mergeSaved(JSON.parse(raw4));

    const raw3=localStorage.getItem(v3Key);
    if(raw3){
      const s=mergeSaved(JSON.parse(raw3));
      s.version=4;s.assessmentEngineVersion=0;s.assessmentComplete=false;s.assessmentReport=null;
      localStorage.setItem(storeKey,JSON.stringify(s));
      return s;
    }

    const raw2=localStorage.getItem(v2Key);
    if(raw2){
      const old=JSON.parse(raw2),s=clone(freshDefaults);
      s.player={...s.player,...(old.player||{})};s.avatar=old.avatar||'';s.baseSkills={...s.baseSkills,...(old.baseSkills||{})};
      s.strengthAssessment=old.strengthAssessment??s.strengthAssessment;s.useMeasuredStrength=!!old.useMeasuredStrength;
      if(Array.isArray(old.strength)&&old.strength.length)s.strength=old.strength;
      s.reminderTime=old.reminderTime||s.reminderTime;s.reminderText=old.reminderText||s.reminderText;s.days=old.days||{};s.bestStreak=old.bestStreak||0;
      localStorage.setItem(storeKey,JSON.stringify(s));
      return s;
    }
    const raw1=localStorage.getItem(v1Key);
    if(raw1){
      const old=JSON.parse(raw1),s=clone(freshDefaults);
      s.player.name=old.playerName||'Jugador';s.avatar=old.avatar||'';s.days=old.days||{};s.bestStreak=old.bestStreak||0;
      if(Array.isArray(old.strength)&&old.strength.length){s.strength=old.strength;s.useMeasuredStrength=true}
      localStorage.setItem(storeKey,JSON.stringify(s));
      return s;
    }
  }catch(e){console.warn('Migración',e)}
  return clone(freshDefaults);
}

let state=migrate();
function save(){localStorage.setItem(storeKey,JSON.stringify(state));render()}

function contextLabel(){
  const c=state.player.context;
  if(c==='estudio')return 'estudio';
  if(c==='ambos')return 'trabajo y estudio';
  if(c==='independiente')return 'trabajo independiente';
  if(c==='busqueda')return 'búsqueda laboral';
  return c==='otro'?'tu actividad':'trabajo';
}
function shuffle(arr){
  const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;
}
function choice(label,value){return{label,value}}
function objectiveChoice(label,correct){return{label,correct}}
function prepareQuestion(q){return{...q,options:shuffle(q.options.map(o=>({...o})))}}

const objectiveBanks={
  logica:{cat:'Intelecto',skill:'Inteligencia aplicada',title:'Razonamiento',items:{
    1:{text:'¿Cuánto es 7 × 8?',options:[objectiveChoice('54',false),objectiveChoice('56',true),objectiveChoice('64',false),objectiveChoice('48',false)]},
    2:{text:'Un producto cuesta $24.000 y tiene 25% de descuento. ¿Cuál es el precio final?',options:[objectiveChoice('$18.000',true),objectiveChoice('$19.000',false),objectiveChoice('$20.000',false),objectiveChoice('$16.000',false)]},
    3:{text:'¿Qué número sigue? 2, 6, 12, 20, 30, ...',options:[objectiveChoice('36',false),objectiveChoice('40',false),objectiveChoice('42',true),objectiveChoice('44',false)]},
    4:{text:'3 máquinas hacen 3 piezas en 3 minutos. Al mismo ritmo, ¿cuántas piezas hacen 6 máquinas en 6 minutos?',options:[objectiveChoice('6',false),objectiveChoice('9',false),objectiveChoice('12',true),objectiveChoice('18',false)]},
    5:{text:'Todas las A son B. Ninguna B es C. ¿Puede existir una A que sea C?',options:[objectiveChoice('Sí, siempre',false),objectiveChoice('Sí, a veces',false),objectiveChoice('No',true),objectiveChoice('No se puede saber',false)]}
  }},
  problemas:{cat:'Intelecto',skill:'Resolución de problemas',title:'Resolución de problemas',items:{
    1:{text:'Algo que funcionaba dejó de funcionar. ¿Cuál es el mejor primer paso?',options:[objectiveChoice('Cambiar varias cosas juntas',false),objectiveChoice('Definir exactamente qué falla y desde cuándo',true),objectiveChoice('Repetir lo mismo muchas veces',false),objectiveChoice('Buscar culpables',false)]},
    2:{text:'Un error empezó justo después de modificar una configuración. ¿Qué prueba da información más limpia?',options:[objectiveChoice('Cambiar tres configuraciones más',false),objectiveChoice('Volver temporalmente la modificación y comparar',true),objectiveChoice('Reiniciar sin registrar nada',false),objectiveChoice('Esperar a que desaparezca',false)]},
    3:{text:'Las ventas bajaron 15%. El tráfico no cambió, pero la conversión sí. ¿Dónde investigarías primero?',options:[objectiveChoice('En el paso entre visita y compra',true),objectiveChoice('Sólo en publicidad',false),objectiveChoice('En la cantidad de empleados',false),objectiveChoice('En cualquier dato al azar',false)]},
    4:{text:'Tenés dos soluciones: A cuesta 10 y evita una pérdida esperada de 12; B cuesta 5 y evita una pérdida esperada de 4. Si todo lo demás fuera igual, ¿cuál crea más valor esperado?',options:[objectiveChoice('A',true),objectiveChoice('B',false),objectiveChoice('Son iguales',false),objectiveChoice('No puede compararse',false)]},
    5:{text:'Dos variables se mueven juntas. ¿Qué conclusión es válida sin más evidencia?',options:[objectiveChoice('Una causa necesariamente a la otra',false),objectiveChoice('Hay asociación, pero todavía no prueba causalidad',true),objectiveChoice('No tienen ninguna relación',false),objectiveChoice('La que cambió primero siempre es la causa',false)]}
  }},
  nutricion:{cat:'Nutrición',skill:null,title:'Conocimiento de nutrición',items:{
    1:{text:'¿Cuál suele aportar más proteína por 100 g?',options:[objectiveChoice('Pechuga de pollo cocida',true),objectiveChoice('Manzana',false),objectiveChoice('Aceite de oliva',false),objectiveChoice('Arroz cocido',false)]},
    2:{text:'Una etiqueta indica 180 kcal por porción y el paquete contiene 2 porciones. Si comés todo, ¿cuántas kcal indica la etiqueta?',options:[objectiveChoice('180',false),objectiveChoice('270',false),objectiveChoice('360',true),objectiveChoice('90',false)]},
    3:{text:'Para perder grasa corporal a lo largo del tiempo, ¿qué condición es necesaria?',options:[objectiveChoice('Eliminar todos los carbohidratos',false),objectiveChoice('Déficit energético sostenible',true),objectiveChoice('No comer después de las 18',false),objectiveChoice('Usar suplementos',false)]},
    4:{text:'El peso sube 1 kg de un día al otro. ¿Qué afirmación es más correcta?',options:[objectiveChoice('Seguro ganaste 1 kg de grasa',false),objectiveChoice('Puede cambiar por agua, glucógeno, comida y otros factores; un día no alcanza para concluir grasa',true),objectiveChoice('Seguro ganaste músculo',false),objectiveChoice('La balanza dejó de servir',false)]},
    5:{text:'Para comparar dos alimentos con tamaños de porción distintos, ¿qué referencia suele ser más útil?',options:[objectiveChoice('El color del paquete',false),objectiveChoice('La misma cantidad, por ejemplo 100 g',true),objectiveChoice('La palabra “fit”',false),objectiveChoice('Sólo el precio total',false)]}
  }}
};

function contextScenarioQuestions(){
  const c=state.player.context;
  if(c==='estudio')return[
    {id:'ctx-com',cat:'Carisma',title:'Trabajo grupal',skill:'Comunicación',kind:'scenario',consistencyKey:'comunicacion',text:'Un compañero del trabajo grupal entrega una parte que no cumple lo acordado y te complica el resto. ¿Qué hacés?',options:[choice('Le digo exactamente qué falta, escucho qué pasó y acordamos cómo corregirlo y para cuándo',3),choice('Lo arreglo yo sin decir nada para terminar más rápido',1),choice('Le digo al grupo que esa persona siempre trabaja mal',0),choice('Espero hasta el último momento para ver si se da cuenta',0)]},
    {id:'ctx-social',cat:'Carisma',title:'Desacuerdo',skill:'Habilidades sociales',kind:'scenario',text:'En una discusión de grupo defendés una idea, pero otra persona propone algo distinto y tiene buenos argumentos. ¿Qué hacés?',options:[choice('Pregunto cómo llegó a esa conclusión y comparo ambas ideas con el objetivo del trabajo',3),choice('Mantengo mi postura para no quedar débil',1),choice('Acepto sin entender para evitar conflicto',1),choice('Me retiro de la discusión',0)]},
    {id:'ctx-lead',cat:'Carisma',title:'Coordinación',skill:'Liderazgo',kind:'scenario',text:'El grupo está desordenado y nadie sabe qué falta. ¿Qué hacés?',options:[choice('Propongo ordenar objetivo, pendientes, responsables y una revisión',3),choice('Hago mi parte y dejo que el resto se organice solo',1),choice('Hago todo yo',1),choice('Doy órdenes sin verificar si tienen sentido para los demás',1)]}
  ];
  if(c==='independiente')return[
    {id:'ctx-com',cat:'Carisma',title:'Cambio de alcance',skill:'Comunicación',kind:'scenario',consistencyKey:'comunicacion',text:'Un cliente pide algo extra que no estaba incluido y espera que esté listo en la misma fecha. ¿Qué hacés?',options:[choice('Aclaro alcance, impacto en tiempo/costo y acordamos qué se prioriza',3),choice('Digo que sí y después veo cómo llego',1),choice('Me enojo porque debería saberlo',0),choice('Ignoro el pedido hasta que vuelva a preguntar',0)]},
    {id:'ctx-social',cat:'Carisma',title:'Colaborador',skill:'Habilidades sociales',kind:'scenario',text:'Una persona con la que trabajás tiene una forma distinta de hacer una tarea, pero obtiene buenos resultados. ¿Qué hacés?',options:[choice('Comparo resultados y restricciones antes de insistir con mi método',3),choice('Le pido que lo haga como yo porque es mi forma',1),choice('Evito volver a trabajar con esa persona',0),choice('Le digo que está bien aunque creo que generará un problema',1)]},
    {id:'ctx-lead',cat:'Carisma',title:'Coordinación',skill:'Liderazgo',kind:'scenario',text:'Un proyecto con varias personas empieza a atrasarse. ¿Qué hacés?',options:[choice('Hago visible qué bloquea, quién tiene cada próximo paso y cuándo se revisa',3),choice('Tomo todas las tareas para asegurarme',1),choice('Espero a que cada uno resuelva lo suyo',1),choice('Presiono sin identificar el bloqueo',0)]}
  ];
  if(c==='busqueda')return[
    {id:'ctx-com',cat:'Carisma',title:'Entrevista',skill:'Comunicación',kind:'scenario',consistencyKey:'comunicacion',text:'En una entrevista no entendés bien una pregunta. ¿Qué hacés?',options:[choice('Pido una aclaración breve y después respondo con un ejemplo concreto',3),choice('Improviso cualquier respuesta para no admitirlo',1),choice('Cambio de tema',0),choice('Respondo sólo sí o no',1)]},
    {id:'ctx-social',cat:'Carisma',title:'Networking',skill:'Habilidades sociales',kind:'scenario',text:'Conocés a alguien de un área que te interesa. ¿Cómo iniciarías la conversación?',options:[choice('Hago una pregunta concreta sobre su experiencia y escucho antes de pedir algo',3),choice('Le mando de entrada mi CV sin contexto',1),choice('No hablo porque podría molestar',0),choice('Intento impresionar exagerando experiencia',0)]},
    {id:'ctx-lead',cat:'Carisma',title:'Coordinación',skill:'Liderazgo',kind:'scenario',text:'En una actividad grupal nadie organiza el trabajo. ¿Qué hacés?',options:[choice('Propongo objetivo, reparto voluntario de pasos y una revisión',3),choice('Espero a que alguien tome el control',1),choice('Hago todo sin avisar',1),choice('Ordeno a todos sin escuchar',1)]}
  ];
  // Trabajo, trabajo+estudio y otros: escenario de empleado/compañero, no de jefe.
  return[
    {id:'ctx-com',cat:'Carisma',title:'Error de un compañero',skill:'Comunicación',kind:'scenario',consistencyKey:'comunicacion',text:'Un compañero de trabajo comete un error que te complica una tarea. ¿Qué hacés?',options:[choice('Le explico el hecho y el impacto en privado, escucho qué pasó y acordamos el próximo paso',3),choice('Lo corrijo yo sin hablarlo',1),choice('Lo expongo delante de otros',0),choice('No digo nada y acumulo bronca',0)]},
    {id:'ctx-social',cat:'Carisma',title:'Desacuerdo',skill:'Habilidades sociales',kind:'scenario',text:'Un compañero propone una forma distinta de hacer algo y no estás de acuerdo. ¿Qué hacés?',options:[choice('Pregunto el razonamiento, explico mis objeciones y comparamos contra el resultado buscado',3),choice('Insisto con mi idea hasta que acepte',1),choice('Digo que sí aunque crea que está mal',1),choice('Evito volver a trabajar con esa persona',0)]},
    {id:'ctx-lead',cat:'Carisma',title:'Iniciativa de equipo',skill:'Liderazgo',kind:'scenario',text:'En una tarea grupal nadie tiene claro qué falta y se empieza a perder tiempo. ¿Qué hacés?',options:[choice('Propongo ordenar objetivo, pendientes, responsables y una revisión, aunque no sea el jefe',3),choice('Hago sólo lo mío y espero',1),choice('Me cargo todo para terminar más rápido',1),choice('Empiezo a dar órdenes sin entender el problema',1)]}
  ];
}

function fixedAssessmentQuestions(){return[
  ...contextScenarioQuestions(),
  {id:'emotion-feedback',cat:'Carisma',title:'Recibir feedback',skill:'Control emocional',kind:'scenario',text:'Te señalan un error y al principio te parece injusto. ¿Qué hacés?',options:[choice('Pido el ejemplo concreto, escucho completo y después explico mi punto si hace falta',3),choice('Me justifico mientras la otra persona habla',1),choice('Acepto todo aunque no tenga sentido',1),choice('Corto la conversación',0)]},
  {id:'integrity',cat:'Carisma',title:'Integridad',skill:'Integridad / valores',kind:'scenario',text:'Descubrís un error tuyo que nadie notó y que te favorece. ¿Qué hacés?',options:[choice('Lo informo y corrijo aunque me incomode',3),choice('Espero a ver si alguien lo descubre',1),choice('Lo oculto porque quizá no tenga consecuencias',0),choice('Busco una forma de responsabilizar al proceso',0)]},
  {id:'creative',cat:'Intelecto',title:'Creatividad aplicada',skill:'Creatividad',kind:'scenario',text:'Tenés que lograr un resultado con bastante menos presupuesto del previsto. ¿Cómo empezás?',options:[choice('Defino restricciones, genero varias alternativas y comparo qué sacrifico en cada una',3),choice('Uso la primera solución barata que aparezca',1),choice('Asumo que no se puede hacer',0),choice('Espero una idea perfecta',0)]},
  {id:'knowledge-source',cat:'Intelecto',title:'Evaluar información',skill:'Conocimiento',kind:'objective-lite',text:'Un video muestra que una estrategia funcionó para una persona. ¿Qué conclusión es más razonable?',options:[choice('Prueba que funciona para todos',0),choice('Es una experiencia útil, pero necesito más evidencia antes de generalizar',3),choice('Si tiene muchas visualizaciones debe ser cierta',0),choice('La experiencia no aporta ninguna información',1)]},
  {id:'learning',cat:'Intelecto',title:'Aprendizaje',skill:'Aprendizaje',kind:'scenario',text:'Querés saber si realmente aprendiste algo nuevo. ¿Qué prueba te da mejor evidencia?',options:[choice('Intento explicarlo sin mirar y aplicarlo a un caso distinto',3),choice('Lo releo varias veces seguidas',1),choice('Marco casi todo el texto',1),choice('Lo guardo para más adelante',0)]},
  {id:'org-source',cat:'Rendimiento',title:'Organización real',skill:'Organización',kind:'habit',consistencyKey:'organizacion',text:'En los últimos 30 días, ¿con qué frecuencia arrancaste el día sabiendo cuáles eran tus 2–3 prioridades principales?',options:[choice('Casi nunca',0),choice('1–2 días por semana',1),choice('3–4 días por semana',2),choice('5 o más días por semana',3)]},
  {id:'constancy',cat:'Rendimiento',title:'Constancia real',skill:'Constancia',kind:'habit',text:'Cuando empezás una rutina que querés sostener varias semanas, ¿qué describe mejor lo que suele pasar de verdad?',options:[choice('La abandono en pocos días',0),choice('La hago de forma muy intermitente',1),choice('La sostengo la mayoría de las semanas, aunque tenga fallas',2),choice('La sostengo durante meses y tengo alguna forma de registro',3)]},
  {id:'discipline-source',cat:'Rendimiento',title:'Disciplina sin motivación',skill:'Disciplina',kind:'habit',consistencyKey:'disciplina',text:'Cuando una tarea importante no te gusta y nadie te está controlando, ¿qué suele pasar?',options:[choice('La postergo hasta que se vuelve urgente',0),choice('A veces la hago y a veces la reemplazo por cosas fáciles',1),choice('Normalmente empiezo aunque no tenga ganas',2),choice('Tengo un sistema que hace que la empiece y la termine casi siempre',3)]},
  {id:'productivity',cat:'Rendimiento',title:'Productividad',skill:'Productividad',kind:'scenario',text:'Terminaste una hora muy ocupada. ¿Qué evidencia indica mejor que fue productiva?',options:[choice('Avancé un resultado importante o eliminé un bloqueo relevante',3),choice('Respondí la mayor cantidad de mensajes',1),choice('No tuve ningún minuto libre',1),choice('Cambié entre muchas tareas',0)]},
  {id:'finance',cat:'Rendimiento',title:'Finanzas personales',skill:'Finanzas personales',kind:'habit',text:'¿Cuál describe mejor tu manejo real del dinero durante los últimos 3 meses?',options:[choice('No sé con claridad cuánto gasto ni cuánto tengo disponible',0),choice('Miro saldos, pero casi no registro ni planifico',1),choice('Registro ingresos/gastos y tengo cierta planificación',2),choice('Registro, planifico, tengo colchón para imprevistos y decisiones de ahorro/inversión coherentes con mis objetivos',3)]},
  {id:'strength',cat:'Físico',title:'Fuerza provisional',skill:'Fuerza',kind:'physical',text:'¿Cuál describe mejor tu entrenamiento de fuerza de los últimos 3 meses?',options:[choice('No entrené fuerza',0),choice('Entrené ocasionalmente, sin registrar',1),choice('Entrené regularmente y registré cargas o repeticiones',2),choice('Entrené de forma consistente con progresión registrada',3)]},
  {id:'endurance',cat:'Físico',title:'Resistencia provisional',skill:'Resistencia',kind:'physical',text:'¿Qué esfuerzo continuo podrías completar hoy sin que sea algo excepcional para vos?',options:[choice('Caminar 20–30 minutos',0),choice('Actividad moderada o trote suave 20–30 minutos',1),choice('Actividad exigente 30–45 minutos',2),choice('Actividad exigente de resistencia alrededor de 60 minutos o más',3)]},
  {id:'power',cat:'Físico',title:'Potencia provisional',skill:'Velocidad / Potencia',kind:'physical',text:'En los últimos 2 meses, ¿con qué frecuencia hiciste sprints, saltos, golpes explosivos u otra actividad de potencia?',options:[choice('Nunca',0),choice('Alguna vez aislada',1),choice('1–2 veces por semana',2),choice('3 o más veces por semana con intención de progresar',3)]},
  {id:'mobility',cat:'Físico',title:'Movilidad provisional',skill:'Movilidad',kind:'physical',text:'Sin dolor y con control, ¿podés hacer una sentadilla profunda con los talones apoyados?',options:[choice('No',0),choice('Sólo con bastante dificultad',1),choice('Sí, razonablemente',2),choice('Sí, cómoda y controlada',3)]},
  {id:'sleep',cat:'Físico',title:'Sueño',skill:'Salud física',kind:'habit',text:'En una semana normal, ¿cuánto dormís en promedio por noche?',options:[choice('Menos de 5 h',0),choice('5–6 h',1),choice('6–7 h',2),choice('7–9 h',3),choice('Más de 9 h casi siempre',2)]},
  {id:'activity',cat:'Físico',title:'Actividad semanal',skill:'Salud física',kind:'habit',text:'En las últimas 4 semanas, ¿cuántos días por semana hiciste actividad física intencional en promedio?',options:[choice('0',0),choice('1–2',1),choice('3–4',2),choice('5 o más',3)]}
];}

const consistencyProbes={
  comunicacion:{id:'probe-com',cat:'Carisma',title:'Confirmar entendimiento',skill:'Comunicación',kind:'scenario',probeFor:'comunicacion',text:'Explicaste algo importante y la otra persona asiente. ¿Qué hacés si un malentendido podría costar tiempo o dinero?',options:[choice('Le pido que me diga cómo va a seguir o confirmamos próximos pasos',3),choice('Repito exactamente lo mismo',1),choice('Asumo que entendió',0),choice('Mando más información sin saber qué faltó',1)]},
  organizacion:{id:'probe-org',cat:'Rendimiento',title:'Olvidos reales',skill:'Organización',kind:'habit',probeFor:'organizacion',text:'En el último mes, ¿cuántas veces una tarea importante se te pasó porque dependía sólo de acordarte?',options:[choice('Muchas veces',0),choice('Varias veces',1),choice('Una o dos veces',2),choice('Casi ninguna; uso algún sistema para lo importante',3)]},
  disciplina:{id:'probe-disc',cat:'Rendimiento',title:'Tareas sin supervisión',skill:'Disciplina',kind:'habit',probeFor:'disciplina',text:'Cuando una tarea importante no tiene fecha externa ni alguien que la controle, ¿qué describe mejor tu conducta?',options:[choice('Suele quedar para después indefinidamente',0),choice('La hago sólo cuando aparece presión',1),choice('La programo y normalmente la hago',2),choice('Tengo un sistema y reviso si se cumplió',3)]}
};

function makeObjectiveQuestion(trackName,difficulty){
  const track=objectiveBanks[trackName],item=track.items[difficulty];
  return prepareQuestion({id:`obj-${trackName}-${difficulty}-${assessmentSession.adaptive[trackName].asked+1}`,cat:track.cat,title:`${track.title} · dificultad ${difficulty}/5`,skill:track.skill,kind:'adaptive-objective',track:trackName,difficulty,text:item.text,options:item.options});
}

function freshAssessmentSession(){return{
  queue:[],current:null,answered:0,responses:[],evidence:Object.fromEntries(allSkills.map(s=>[s,[]])),
  consistencySources:{},consistencyPairs:[],scheduledProbes:{},
  adaptive:{logica:{ability:2.5,asked:0,correct:0,history:[]},problemas:{ability:2.5,asked:0,correct:0,history:[]},nutricion:{ability:2.5,asked:0,correct:0,history:[]}}
}}
let assessmentSession=freshAssessmentSession();

function buildInitialAssessmentQueue(){
  const fixed=fixedAssessmentQuestions().map(prepareQuestion);
  const firstObjectives=['logica','problemas','nutricion'].map(t=>makeObjectiveQuestion(t,2));
  // Intercalar evita que el cuestionario se sienta como tres exámenes separados.
  return [fixed[0],firstObjectives[0],fixed[1],fixed[2],fixed[3],fixed[4],firstObjectives[1],...fixed.slice(5,10),firstObjectives[2],...fixed.slice(10)];
}

function scheduleConsistencyProbe(key){
  if(!key||assessmentSession.scheduledProbes[key])return;
  const probe=consistencyProbes[key];if(!probe)return;
  assessmentSession.scheduledProbes[key]=true;assessmentSession.queue.push(prepareQuestion(probe));
}

function scheduleNextAdaptive(trackName){
  const t=assessmentSession.adaptive[trackName];
  if(t.asked<3)return assessmentSession.queue.push(makeObjectiveQuestion(trackName,clamp(Math.round(t.ability),1,5)));
  // Una cuarta pregunta sólo cuando hubo respuestas mezcladas: ahí todavía hay incertidumbre.
  const mixed=t.correct>0&&t.correct<t.asked;
  if(t.asked<4&&mixed)assessmentSession.queue.push(makeObjectiveQuestion(trackName,clamp(Math.round(t.ability),1,5)));
}

function objectiveTrackScore(trackName){
  const t=assessmentSession.adaptive[trackName];
  const abilityScore=32+((clamp(t.ability,1,5)-1)/4)*50;
  const accuracy=t.asked?t.correct/t.asked:.5;
  return Math.round(clamp(abilityScore*.82+(32+accuracy*50)*.18,30,82));
}

function addEvidence(skill,kind,ratio,weight=1,meta={}){
  if(!skill||!assessmentSession.evidence[skill])return;
  assessmentSession.evidence[skill].push({kind,ratio:clamp(ratio,0,1),weight,...meta});
}

function evidenceToScore(e){
  if(e.kind==='objective-score')return e.score;
  if(e.kind==='physical')return 30+40*Math.pow(e.ratio,1.12);
  if(e.kind==='habit')return 28+48*Math.pow(e.ratio,1.08);
  if(e.kind==='objective-lite')return 30+48*e.ratio;
  return 30+46*Math.pow(e.ratio,1.08);
}

function consistencyPenaltyFor(skill){
  const pairs=assessmentSession.consistencyPairs.filter(p=>p.skill===skill);let penalty=0;
  pairs.forEach(p=>{const d=Math.abs(p.a-p.b);if(d>.66)penalty+=6;else if(d>.4)penalty+=3});
  return Math.min(8,penalty);
}

function assessmentSkillScore(skill){
  const ev=assessmentSession.evidence[skill]||[];
  if(!ev.length)return null;
  let sum=0,w=0;for(const e of ev){const ww=e.weight||1;sum+=evidenceToScore(e)*ww;w+=ww}
  let score=sum/(w||1)-consistencyPenaltyFor(skill);
  const physical=['Fuerza','Resistencia','Velocidad / Potencia','Movilidad'].includes(skill);
  score=Math.min(physical?70:82,score);
  return Math.round(clamp(score,20,82));
}

function initialConfidenceFor(skill){
  if(['Fuerza','Resistencia','Velocidad / Potencia','Movilidad'].includes(skill))return'baja';
  const ev=assessmentSession.evidence[skill]||[],objective=ev.some(e=>e.kind==='objective-score');
  const badConsistency=consistencyPenaltyFor(skill)>=3;
  if(badConsistency)return'baja';
  if(objective&&ev.length>=1)return'media';
  if(ev.length>=2)return'media';
  return'baja';
}

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
function behaviorCalibration(skill,base){
  // Conducta real pesa de a poco y sólo cuando hay suficiente historial.
  const calibratable=new Set(['Comunicación','Habilidades sociales','Liderazgo','Control emocional','Disciplina','Constancia','Organización','Productividad','Finanzas personales','Salud física']);
  if(!calibratable.has(skill))return base;
  let total=0,done=0;
  Object.values(state.days||{}).forEach(d=>(d.tasks||[]).forEach(t=>{if(inferSkill(t)===skill){total++;if(t.done)done++}}));
  if(total<8)return base;
  const rate=done/total,observed=32+48*rate,weight=Math.min(.30,.08+(total-8)*.005);
  return Math.round(base*(1-weight)+observed*weight);
}
function baseSkillScore(skill){
  if(skill==='Fuerza'&&state.useMeasuredStrength&&measuredStrengthRows().length)return rawForceScore();
  const base=clamp(Number(state.baseSkills[skill])||50);
  return clamp(behaviorCalibration(skill,base));
}
function effectiveConfidence(skill){
  if(skill==='Fuerza'&&state.useMeasuredStrength){const n=measuredStrengthRows().length;return n>=4?'alta':'media'}
  let base=state.skillConfidence[skill]||'baja';
  let total=0,done=0;Object.values(state.days||{}).forEach(d=>(d.tasks||[]).forEach(t=>{if(inferSkill(t)===skill){total++;if(t.done)done++}}));
  const academy=Object.entries(state.academyProgress||{}).filter(([id,p])=>p.completed&&academyLessons.find(l=>l.id===id)?.skill===skill).length;
  if(total>=25&&done>=12)return'alta';
  if((total>=10&&done>=5)||academy>=3)return base==='alta'?'alta':'media';
  return base;
}
function effectiveSkillData(){
  const xp=xpBySkill(),out={};allSkills.forEach(skill=>out[skill]={...skillProgress(baseSkillScore(skill),xp[skill]),totalXp:xp[skill],base:baseSkillScore(skill),confidence:effectiveConfidence(skill)});return out;
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
  const report=state.assessmentReport;$('#assessmentMeta').textContent=state.assessmentComplete?`Evaluación adaptativa V4 · ${report?.questionCount||'—'} preguntas · confianza ${globalConfidence()} · Nutrición ${state.nutritionKnowledge||0}%`:'Evaluación adaptativa V4 pendiente';
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
  assessmentSession=freshAssessmentSession();assessmentSession.queue=buildInitialAssessmentQueue();$('#assessmentProfileStep').classList.add('hidden');$('#assessmentQuestionStep').classList.remove('hidden');nextAssessmentQuestion();
}
function nextAssessmentQuestion(){
  if(!assessmentSession.queue.length)return finishAssessmentScoring();
  assessmentSession.current=assessmentSession.queue.shift();renderAssessmentQuestion();
}
function renderAssessmentQuestion(){
  const q=assessmentSession.current;if(!q)return;
  $('#assessmentCategory').textContent=`${q.cat.toUpperCase()} · ${q.kind==='adaptive-objective'?'PRUEBA ADAPTATIVA':'PERFIL'}`;
  $('#assessmentQuestionTitle').textContent=q.title;$('#assessmentQuestionText').textContent=q.text;$('#assessmentIndex').textContent=assessmentSession.answered+1;
  const projected=Math.max(assessmentSession.answered+1+assessmentSession.queue.length,28);$('#assessmentProgress').style.width=`${Math.min(94,assessmentSession.answered/projected*100)}%`;
  $('#assessmentBackBtn').classList.add('hidden');
  $('#assessmentOptions').innerHTML=q.options.map((o,idx)=>`<button class="answer-btn" data-answer="${idx}">${escapeHtml(o.label)}</button>`).join('');
}
function recordAssessmentAnswer(idx){
  const q=assessmentSession.current,selected=q?.options?.[idx];if(!q||!selected)return;
  assessmentSession.responses.push({id:q.id,skill:q.skill||null,kind:q.kind,track:q.track||null,difficulty:q.difficulty||null,value:selected.value??null,correct:selected.correct??null});

  if(q.kind==='adaptive-objective'){
    const t=assessmentSession.adaptive[q.track],correct=!!selected.correct;t.asked++;if(correct)t.correct++;
    t.history.push({difficulty:q.difficulty,correct});
    const direction=correct?1:-1,step=correct?.72:.62;t.ability=clamp(t.ability+direction*step,1,5);
    scheduleNextAdaptive(q.track);
  }else{
    const max=3,ratio=clamp((Number(selected.value)||0)/max,0,1);addEvidence(q.skill,q.kind,ratio,q.kind==='habit'?1.15:1,{id:q.id});
    if(q.consistencyKey){assessmentSession.consistencySources[q.consistencyKey]={skill:q.skill,ratio};scheduleConsistencyProbe(q.consistencyKey)}
    if(q.probeFor&&assessmentSession.consistencySources[q.probeFor])assessmentSession.consistencyPairs.push({skill:q.skill,a:assessmentSession.consistencySources[q.probeFor].ratio,b:ratio,key:q.probeFor});
  }
  assessmentSession.answered++;nextAssessmentQuestion();
}
function finishAssessmentScoring(){
  // Convertir las pruebas adaptativas en evidencia sólo al final: la dificultad alcanzada importa, no una opción con “78 puntos”.
  for(const trackName of ['logica','problemas']){
    const track=objectiveBanks[trackName],score=objectiveTrackScore(trackName),ratio=(score-30)/52;
    addEvidence(track.skill,'objective-score',ratio,1.65,{score,track:trackName});
  }
  const nutritionScore=objectiveTrackScore('nutricion');state.nutritionKnowledge=Math.round(clamp((nutritionScore-30)/52*100,0,100));
  // Nutrición aporta una señal pequeña a Conocimiento general, sin dominarlo.
  addEvidence('Conocimiento','objective-score',(nutritionScore-30)/52,.35,{score:Math.round(38+(nutritionScore-30)*.65),track:'nutricion'});

  const direct={};allSkills.forEach(skill=>direct[skill]=assessmentSkillScore(skill));
  Object.entries(skillMap).forEach(([attr,names])=>{
    const observed=names.filter(n=>direct[n]!==null),fallback=observed.length?Math.round(observed.reduce((s,n)=>s+direct[n],0)/observed.length):45;
    names.forEach(n=>{if(direct[n]===null)direct[n]=Math.min(58,fallback)});
  });
  state.baseSkills={...state.baseSkills,...direct};state.skillConfidence={...state.skillConfidence};allSkills.forEach(s=>state.skillConfidence[s]=initialConfidenceFor(s));
  state.strengthAssessment=state.baseSkills['Fuerza'];state.useMeasuredStrength=state.useMeasuredStrength&&measuredStrengthRows().length>0;
  if(state.useMeasuredStrength)state.skillConfidence['Fuerza']=measuredStrengthRows().length>=4?'alta':'media';
  const consistency=assessmentSession.consistencyPairs.length?Math.round(100-assessmentSession.consistencyPairs.reduce((s,p)=>s+Math.abs(p.a-p.b),0)/assessmentSession.consistencyPairs.length*100):70;
  state.assessmentEngineVersion=4;state.assessmentComplete=true;state.assessmentCompletedAt=new Date().toISOString();
  state.assessmentReport={engine:4,questionCount:assessmentSession.answered,consistency:clamp(consistency,0,100),adaptive:{logica:objectiveTrackScore('logica'),problemas:objectiveTrackScore('problemas'),nutricion:nutritionScore},context:state.player.context,completedAt:state.assessmentCompletedAt};
  localStorage.setItem(storeKey,JSON.stringify(state));
  $('#assessmentQuestionStep').classList.add('hidden');$('#assessmentResultStep').classList.remove('hidden');
  const attrs=effectiveAttributes(),gl=generalLevel();$('#resultGeneral').textContent=gl;$('#resultRank').textContent=rank(gl);$('#resultNutrition').textContent=`${state.nutritionKnowledge}%`;$('#resultConfidence').textContent=`Confianza inicial: ${globalConfidence()} · ${state.assessmentReport.questionCount} preguntas · consistencia ${state.assessmentReport.consistency}%`;
  $('#resultAttributes').innerHTML=Object.entries(attrs).map(([a,v])=>`<div class="attribute-card"><div class="small">${icons[a]} ${a}</div><div class="score">${v}</div><div class="progress"><span style="width:${v}%"></span></div><div class="confidence">estimación inicial</div></div>`).join('');
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
$('#assessmentBackBtn').addEventListener('click',()=>{});

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
